import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getSecret } from './secretManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envPath = join(__dirname, `../.env.${env}`);
dotenv.config({ path: envPath });

// Async function to load secrets
export async function loadConfig() {
  return {
    server: {
      host: process.env.HOST || 'localhost',
      port: parseInt(process.env.PORT || '3000', 10),
      env: env
    },
    database: {
      uri: await getSecret('MONGODB_URI', process.env.MONGODB_URI || 'mongodb://localhost:27017/agent-ecos'),
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    },
    auth0: {
      audience: await getSecret('AUTH0_AUDIENCE', process.env.AUTH0_AUDIENCE),
      issuerBaseUrl: await getSecret('AUTH0_ISSUER_BASE_URL', process.env.AUTH0_ISSUER_BASE_URL),
      clientId: await getSecret('AUTH0_CLIENT_ID', process.env.AUTH0_CLIENT_ID)
    },
    vertexAi: {
      projectId: await getSecret('VERTEX_AI_PROJECT_ID', process.env.VERTEX_AI_PROJECT_ID),
      location: process.env.VERTEX_AI_LOCATION || 'us-central1'
    },
    logging: {
      level: process.env.LOG_LEVEL || 'info',
      format: process.env.LOG_FORMAT || 'json'
    },
    security: {
      corsOrigin: process.env.CORS_ORIGIN || '*',
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
      }
    }
  };
}

// Validate required configuration
export async function validateConfig(config) {
  const requiredFields = [
    'auth0.audience',
    'auth0.issuerBaseUrl',
    'auth0.clientId',
    'vertexAi.projectId',
    'database.uri'
  ];
  const missingFields = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    return !value;
  });
  if (missingFields.length > 0) {
    throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
  }
} 