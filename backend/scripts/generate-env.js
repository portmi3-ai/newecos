import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a secure random string
function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Environment templates
const envTemplates = {
  development: {
    // Server Configuration
    PORT: '3000',
    NODE_ENV: 'development',
    HOST: 'localhost',

    // Database Configuration
    MONGODB_URI: 'mongodb://localhost:27017/agentEcos',

    // Firebase Configuration
    FIREBASE_API_KEY: 'your_firebase_api_key',
    FIREBASE_AUTH_DOMAIN: 'your_firebase_auth_domain',
    FIREBASE_PROJECT_ID: 'your_firebase_project_id',
    FIREBASE_STORAGE_BUCKET: 'your_firebase_storage_bucket',
    FIREBASE_MESSAGING_SENDER_ID: 'your_firebase_messaging_sender_id',
    FIREBASE_APP_ID: 'your_firebase_app_id',

    // Auth0 Configuration
    AUTH0_AUDIENCE: 'your_auth0_audience',
    AUTH0_ISSUER_BASE_URL: 'your_auth0_issuer_base_url',
    AUTH0_CLIENT_ID: 'your_auth0_client_id',
    AUTH0_CLIENT_SECRET: 'your_auth0_client_secret',

    // Google Cloud Configuration
    VERTEX_AI_PROJECT_ID: 'your_vertex_ai_project_id',
    VERTEX_AI_LOCATION: 'us-central1',

    // GitHub Configuration
    GITHUB_TOKEN: 'your_github_token',

    // Hugging Face Configuration
    HUGGINGFACE_API_KEY: 'your_huggingface_api_key',

    // Security Configuration
    JWT_SECRET: generateSecureString(64),
    RATE_LIMIT_WINDOW: '900000',
    RATE_LIMIT_MAX: '100',

    // Logging Configuration
    LOG_LEVEL: 'debug',
    LOG_FORMAT: 'json',

    // CORS Configuration
    CORS_ORIGIN: '*'
  },
  staging: {
    // Inherit from development but override specific values
    NODE_ENV: 'staging',
    LOG_LEVEL: 'info',
    CORS_ORIGIN: 'https://staging.agentecos.com'
  },
  production: {
    // Inherit from development but override specific values
    NODE_ENV: 'production',
    LOG_LEVEL: 'warn',
    CORS_ORIGIN: 'https://agentecos.com'
  }
};

// Generate environment file
function generateEnvFile(env) {
  const template = envTemplates[env];
  const envPath = path.join(__dirname, '..', `.env.${env}`);
  
  // Convert template to string
  const envContent = Object.entries(template)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Write to file
  fs.writeFileSync(envPath, envContent);
  console.log(`Generated .env.${env} file`);
}

// Generate all environment files
function generateAllEnvFiles() {
  Object.keys(envTemplates).forEach(generateEnvFile);
}

// Generate .env.example file
function generateEnvExample() {
  const examplePath = path.join(__dirname, '..', '.env.example');
  const exampleContent = Object.entries(envTemplates.development)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(examplePath, exampleContent);
  console.log('Generated .env.example file');
}

// Main execution
try {
  generateAllEnvFiles();
  generateEnvExample();
  console.log('Environment files generated successfully!');
} catch (error) {
  console.error('Error generating environment files:', error);
  process.exit(1);
} 