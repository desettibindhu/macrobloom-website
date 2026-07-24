/**
 * Request/Response Logger Utility
 * Logs all incoming requests and outgoing responses for debugging
 */

export function logRequest(req) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📥 INCOMING REQUEST');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

export function logResponse(statusCode, data) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 OUTGOING RESPONSE');
  console.log('Time:', new Date().toISOString());
  console.log('Status:', statusCode);
  if (data) {
    console.log('Data:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

export function logError(error, context = '') {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('❌ ERROR');
  console.log('Time:', new Date().toISOString());
  if (context) console.log('Context:', context);
  console.log('Message:', error.message);
  console.log('Stack:', error.stack);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

export function logMessage(type, message, data = null) {
  const icons = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    debug: '🔍'
  };

  const icon = icons[type] || '📌';
  console.log(`${icon} ${message}`);
  if (data) {
    console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
}
