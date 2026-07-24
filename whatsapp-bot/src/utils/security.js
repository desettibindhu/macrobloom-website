import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * Security Utilities
 * Handles webhook signature verification and other security functions
 */

/**
 * Verify Meta webhook signature
 * @param {string} signature - X-Hub-Signature-256 header value
 * @param {string|Buffer} body - Request body
 * @returns {boolean} Whether signature is valid
 */
export function verifyWebhookSignature(signature, body) {
  if (!signature || !config.meta.appSecret) {
    console.warn('⚠️ Signature verification skipped - missing signature or app secret');
    return false;
  }

  try {
    // Convert body to string if it's a buffer
    const bodyString = typeof body === 'string' ? body : body.toString('utf8');

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', config.meta.appSecret)
      .update(bodyString)
      .digest('hex');

    // Extract signature from header (format: "sha256=<signature>")
    const receivedSignature = signature.replace('sha256=', '');

    // Compare signatures using timing-safe comparison
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );

    if (!isValid) {
      console.warn('⚠️ Webhook signature verification failed');
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Validate phone number format (E.164)
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} Whether phone number is valid E.164 format
 */
export function isValidPhoneNumber(phoneNumber) {
  // E.164 format: +[country code][number]
  // Example: +12025551234
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length to prevent abuse
  const maxLength = 1000;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Rate limit check (basic implementation)
 * For production, use Redis-based rate limiting
 * @param {string} identifier - User identifier (phone number)
 * @param {number} maxRequests - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} Whether request is allowed
 */
const rateLimitStore = new Map();

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const userRequests = rateLimitStore.get(identifier) || [];

  // Remove expired requests
  const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);

  if (validRequests.length >= maxRequests) {
    console.warn(`⚠️ Rate limit exceeded for ${identifier}`);
    return false;
  }

  // Add current request
  validRequests.push(now);
  rateLimitStore.set(identifier, validRequests);

  // Clean up old entries periodically
  if (rateLimitStore.size > 1000) {
    const cutoff = now - windowMs;
    for (const [key, requests] of rateLimitStore.entries()) {
      if (requests.every(timestamp => now - timestamp > windowMs)) {
        rateLimitStore.delete(key);
      }
    }
  }

  return true;
}

/**
 * Generate secure random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data
 * @param {string} data - Data to hash
 * @returns {string} SHA256 hash
 */
export function hashData(data) {
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

/**
 * Validate webhook request
 * @param {Object} req - Express request object
 * @returns {Object} Validation result {isValid, error}
 */
export function validateWebhookRequest(req) {
  // Check content type
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    return {
      isValid: false,
      error: 'Invalid content type. Expected application/json'
    };
  }

  // Check user agent (optional)
  const userAgent = req.headers['user-agent'];
  if (userAgent && !userAgent.includes('facebookplatform')) {
    console.warn('⚠️ Unexpected user agent:', userAgent);
    // Don't fail, just log warning
  }

  // Check request has body
  if (!req.body || Object.keys(req.body).length === 0) {
    return {
      isValid: false,
      error: 'Empty request body'
    };
  }

  // Verify signature if present
  const signature = req.headers['x-hub-signature-256'];
  if (signature && config.meta.appSecret) {
    const rawBody = JSON.stringify(req.body);
    if (!verifyWebhookSignature(signature, rawBody)) {
      return {
        isValid: false,
        error: 'Invalid webhook signature'
      };
    }
  }

  return { isValid: true };
}

/**
 * Mask sensitive data in logs
 * @param {string} data - Sensitive data (token, phone number, etc.)
 * @param {number} visibleChars - Number of visible characters at start/end
 * @returns {string} Masked data
 */
export function maskSensitiveData(data, visibleChars = 4) {
  if (!data || data.length <= visibleChars * 2) {
    return '***';
  }

  const start = data.substring(0, visibleChars);
  const end = data.substring(data.length - visibleChars);
  const masked = '*'.repeat(Math.min(data.length - visibleChars * 2, 10));

  return `${start}${masked}${end}`;
}

/**
 * Check if IP is allowed (whitelist/blacklist)
 * @param {string} ip - Client IP address
 * @param {Array} whitelist - Array of allowed IPs/CIDR ranges
 * @param {Array} blacklist - Array of blocked IPs/CIDR ranges
 * @returns {boolean} Whether IP is allowed
 */
export function isIPAllowed(ip, whitelist = [], blacklist = []) {
  // Simple implementation - for production, use proper CIDR matching library
  
  if (blacklist.includes(ip)) {
    console.warn(`⚠️ Blocked IP attempt: ${ip}`);
    return false;
  }

  if (whitelist.length > 0 && !whitelist.includes(ip)) {
    console.warn(`⚠️ Non-whitelisted IP attempt: ${ip}`);
    return false;
  }

  return true;
}

/**
 * Security middleware for Express
 * Usage: app.use(securityMiddleware)
 */
export function securityMiddleware(req, res, next) {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Log security event
  console.log(`🔒 Security check: ${req.method} ${req.path} from ${req.ip}`);

  next();
}

export default {
  verifyWebhookSignature,
  isValidPhoneNumber,
  sanitizeInput,
  checkRateLimit,
  generateSecureToken,
  hashData,
  validateWebhookRequest,
  maskSensitiveData,
  isIPAllowed,
  securityMiddleware
};
