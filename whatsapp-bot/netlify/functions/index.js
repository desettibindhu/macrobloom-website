import serverless from 'serverless-http';
import app from '../../src/index.js';

// Export the Express app as a Netlify Function
export const handler = serverless(app);
