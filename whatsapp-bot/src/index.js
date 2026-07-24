import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { config, validateConfig } from './config/index.js';
import webhookRoutes from './routes/webhook.routes.js';
import { initializeDatabase } from './services/database.service.js';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/whatsapp', webhookRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'MacroBloom WhatsApp Bot',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      webhook_verify: 'GET /api/whatsapp/webhook',
      webhook_receive: 'POST /api/whatsapp/webhook',
      health: 'GET /api/whatsapp/health',
      stats: 'GET /api/whatsapp/stats'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: config.server.env === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Start server
const startServer = async () => {
  try {
    // Validate configuration
    validateConfig();
    console.log('✅ Configuration validated');

    // Initialize database (if needed)
    try {
      await initializeDatabase();
    } catch (dbError) {
      console.warn('⚠️ Database initialization skipped:', dbError.message);
    }

    // Start listening
    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 MacroBloom WhatsApp Bot is running!');
      console.log('');
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${config.server.env}`);
      console.log(`📞 WhatsApp Phone Number ID: ${config.whatsapp.phoneNumberId}`);
      console.log('');
      console.log('Webhook endpoints:');
      console.log(`  GET  http://localhost:${PORT}/api/whatsapp/webhook`);
      console.log(`  POST http://localhost:${PORT}/api/whatsapp/webhook`);
      console.log('');
      console.log('Ready to receive messages! 💬');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
