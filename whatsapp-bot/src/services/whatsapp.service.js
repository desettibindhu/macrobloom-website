import axios from 'axios';
import { config } from '../config/index.js';

/**
 * WhatsApp Cloud API Service
 * Handles all communication with Meta WhatsApp Cloud API
 */
class WhatsAppService {
  constructor() {
    this.baseUrl = `${config.whatsapp.apiUrl}/${config.whatsapp.apiVersion}`;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.accessToken = config.whatsapp.accessToken;
  }

  /**
   * Send a text message to a WhatsApp user
   * @param {string} to - Recipient phone number
   * @param {string} message - Message text
   * @returns {Promise} API response
   */
  async sendMessage(to, message) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Message sent to ${to}:`, message.substring(0, 50) + '...');
      return response.data;
    } catch (error) {
      console.error('❌ Error sending message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mark a message as read
   * @param {string} messageId - WhatsApp message ID
   */
  async markAsRead(messageId) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      };

      await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`📖 Message ${messageId} marked as read`);
    } catch (error) {
      console.error('❌ Error marking message as read:', error.response?.data || error.message);
    }
  }

  /**
   * Send a message with interactive buttons
   * @param {string} to - Recipient phone number
   * @param {string} bodyText - Message body
   * @param {Array} buttons - Array of button objects {id, title}
   */
  async sendButtonMessage(to, bodyText, buttons) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: bodyText
          },
          action: {
            buttons: buttons.map(btn => ({
              type: 'reply',
              reply: {
                id: btn.id,
                title: btn.title
              }
            }))
          }
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Button message sent to ${to}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending button message:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Verify webhook signature from Meta
   * @param {string} signature - X-Hub-Signature-256 header value
   * @param {string} body - Request body as string
   * @returns {boolean} Whether signature is valid
   */
  verifyWebhookSignature(signature, body) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', config.meta.appSecret)
      .update(body)
      .digest('hex');
    
    return signature === `sha256=${expectedSignature}`;
  }
}

export default new WhatsAppService();
