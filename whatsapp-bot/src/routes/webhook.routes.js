import express from 'express';
import { config } from '../config/index.js';
import messageHandler from '../handlers/message.handler.js';

const router = express.Router();

/**
 * Webhook Verification Endpoint (GET)
 * Meta sends a GET request to verify the webhook
 */
router.get('/webhook', (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('🔍 Webhook verification request received');
    console.log('Mode:', mode);
    console.log('Token:', token);

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
        console.log('✅ Webhook verified successfully');
        res.status(200).send(challenge);
      } else {
        console.log('❌ Webhook verification failed: Invalid token');
        res.sendStatus(403);
      }
    } else {
      console.log('❌ Webhook verification failed: Missing parameters');
      res.sendStatus(400);
    }
  } catch (error) {
    console.error('❌ Error in webhook verification:', error);
    res.sendStatus(500);
  }
});

/**
 * Webhook Message Receiver Endpoint (POST)
 * Receives incoming WhatsApp messages from Meta
 */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    console.log('📨 Webhook POST received');
    console.log('Body:', JSON.stringify(body, null, 2));

    // Check if this is a WhatsApp API event
    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0]) {
        const change = body.entry[0].changes[0];
        const value = change.value;

        // Check if this is a message event
        if (value.messages && value.messages[0]) {
          const message = value.messages[0];
          
          // Process the message
          await messageHandler.handleIncomingMessage(message);
        }

        // Check if this is a status update (message delivered, read, etc.)
        if (value.statuses && value.statuses[0]) {
          const status = value.statuses[0];
          console.log('📊 Status update:', status.status, 'for message:', status.id);
        }
      }

      // Return 200 OK to Meta
      res.sendStatus(200);
    } else {
      console.log('❌ Invalid webhook request: Not a WhatsApp event');
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    // Still return 200 to prevent Meta from retrying
    res.sendStatus(200);
  }
});

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'MacroBloom WhatsApp Bot',
    timestamp: new Date().toISOString()
  });
});

/**
 * Stats endpoint (for monitoring)
 */
router.get('/stats', (req, res) => {
  const conversationState = require('../services/conversation.service.js').default;
  const stats = conversationState.getStats();
  
  res.status(200).json({
    ...stats,
    timestamp: new Date().toISOString()
  });
});

export default router;
