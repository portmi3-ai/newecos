import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Required environment variables by category
const requiredEnvVars = {
  app: ['NODE_ENV', 'PORT'],
  frontend: [
    'VITE_APP_NAME',
    'VITE_APP_VERSION',
    'VITE_APP_URL',
    'VITE_API_URL'
  ],
  firebase: [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ],
  google: [
    'GOOGLE_CLOUD_PROJECT',
    'GOOGLE_APPLICATION_CREDENTIALS',
    'GOOGLE_CLOUD_LOCATION'
  ],
  auth: [
    'AUTH0_AUDIENCE',
    'AUTH0_ISSUER_BASE_URL',
    'AUTH0_CLIENT_ID',
    'AUTH0_CLIENT_SECRET'
  ],
  vertex: [
    'VERTEX_AI_PROJECT_ID',
    'VERTEX_AI_LOCATION',
    'VERTEX_AI_API_ENDPOINT'
  ],
  github: ['GITHUB_TOKEN', 'GITHUB_REPO'],
  huggingface: ['HUGGINGFACE_API_KEY'],
  database: ['DATABASE_URL', 'DATABASE_USER', 'DATABASE_PASSWORD'],
  redis: ['REDIS_URL', 'REDIS_PASSWORD'],
  logging: ['LOG_LEVEL', 'LOG_FORMAT'],
  security: ['JWT_SECRET', 'JWT_EXPIRATION', 'CORS_ORIGIN'],
  monitoring: ['SENTRY_DSN', 'NEW_RELIC_LICENSE_KEY']
};

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('No .env file found');
  process.exit(1);
}

// Validate environment variables
function validateEnvVars() {
  const missingVars = {};
  const invalidVars = {};

  // Check each category
  Object.entries(requiredEnvVars).forEach(([category, vars]) => {
    const missing = vars.filter(varName => !process.env[varName]);
    const invalid = vars.filter(varName => {
      const value = process.env[varName];
      return value === undefined || value === null || value.trim() === '';
    });

    if (missing.length > 0) {
      missingVars[category] = missing;
    }
    if (invalid.length > 0) {
      invalidVars[category] = invalid;
    }
  });

  // Report results
  if (Object.keys(missingVars).length > 0) {
    console.error('\nMissing environment variables:');
    Object.entries(missingVars).forEach(([category, vars]) => {
      console.error(`\n${category.toUpperCase()}:`);
      vars.forEach(varName => console.error(`  - ${varName}`));
    });
  }

  if (Object.keys(invalidVars).length > 0) {
    console.error('\nInvalid environment variables (empty or undefined):');
    Object.entries(invalidVars).forEach(([category, vars]) => {
      console.error(`\n${category.toUpperCase()}:`);
      vars.forEach(varName => console.error(`  - ${varName}`));
    });
  }

  // Check for sensitive variables
  const sensitiveVars = [
    'VITE_FIREBASE_API_KEY',
    'AUTH0_CLIENT_SECRET',
    'JWT_SECRET',
    'DATABASE_PASSWORD',
    'REDIS_PASSWORD'
  ];

  const exposedSensitiveVars = sensitiveVars.filter(varName => {
    const value = process.env[varName];
    return value && value.length < 32; // Basic check for weak secrets
  });

  if (exposedSensitiveVars.length > 0) {
    console.warn('\nWarning: Potentially weak sensitive variables detected:');
    exposedSensitiveVars.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
  }

  return {
    isValid: Object.keys(missingVars).length === 0 && Object.keys(invalidVars).length === 0,
    missingVars,
    invalidVars,
    hasWeakSecrets: exposedSensitiveVars.length > 0
  };
}

// Run validation
const result = validateEnvVars();

if (!result.isValid) {
  console.error('\nEnvironment validation failed!');
  process.exit(1);
} else {
  console.log('\nEnvironment validation passed!');
  if (result.hasWeakSecrets) {
    console.warn('Warning: Some sensitive variables may be weak. Please review.');
  }
} 