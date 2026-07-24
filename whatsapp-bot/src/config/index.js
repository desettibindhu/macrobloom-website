import dotenv from 'dotenv';

dotenv.config();

const config = {
  // WhatsApp Cloud API
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    apiVersion: 'v18.0',
    apiUrl: 'https://graph.facebook.com'
  },

  // Meta App
  meta: {
    appId: process.env.META_APP_ID,
    appSecret: process.env.META_APP_SECRET
  },

  // Google Sheets
  googleSheets: {
    enabled: process.env.GOOGLE_SHEETS_ENABLED === 'true',
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },

  // Database
  database: {
    url: process.env.DATABASE_URL
  },

  // Server
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // MacroBloom Brand Colors
  brandColors: {
    protein: '#5FA66A',
    fiber: '#2F5F4A',
    healthyFats: '#F36F52',
    complexCarbs: '#F2C04C'
  }
};

// Validate required configuration
const validateConfig = () => {
  const required = [
    'whatsapp.accessToken',
    'whatsapp.phoneNumberId',
    'whatsapp.verifyToken'
  ];

  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
};

export { config, validateConfig };
