import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, `../.env.${env}`);

if (env === 'development') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
} else {
  dotenv.config({ path: envPath });
}

// Environment configuration
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 8080,
    host: process.env.HOST || '0.0.0.0',
    env,
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: env === 'production',
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  },

  // Firebase configuration
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },

  // Auth0 configuration
  auth0: {
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
  },

  // Google Cloud configuration
  google: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },

  // Vertex AI configuration
  vertex: {
    projectId: process.env.VERTEX_AI_PROJECT_ID,
    location: process.env.VERTEX_AI_LOCATION || 'us-central1',
    apiEndpoint: process.env.VERTEX_AI_API_ENDPOINT || 'us-central1-aiplatform.googleapis.com',
  },

  // GitHub configuration
  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO,
  },

  // Hugging Face configuration
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },

  // Monitoring configuration
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    newRelicKey: process.env.NEW_RELIC_LICENSE_KEY,
  },
};

// Validate required configuration
function validateConfig() {
  const requiredFields = {
    database: ['url', 'user', 'password'],
    firebase: ['projectId', 'privateKey', 'clientEmail'],
    auth0: ['audience', 'issuerBaseUrl', 'clientId', 'clientSecret'],
    google: ['projectId'],
    vertex: ['projectId'],
    github: ['token'],
    huggingface: ['apiKey'],
    security: ['jwtSecret'],
  };

  const missingFields = [];

  Object.entries(requiredFields).forEach(([section, fields]) => {
    fields.forEach(field => {
      if (!config[section][field]) {
        missingFields.push(`${section}.${field}`);
      }
    });
  });

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required configuration fields:\n${missingFields.join('\n')}\n\n` +
      'Please check your environment variables and ensure all required fields are set.'
    );
  }
}

// Validate configuration in production
if (env === 'production') {
  validateConfig();
}

export default config; 