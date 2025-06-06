import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Template for environment variables
const envTemplate = {
  development: {
    NODE_ENV: 'development',
    VITE_APP_ENV: 'development',
    VITE_API_URL: 'http://localhost:8080',
    VITE_WS_URL: 'ws://localhost:8080',
    VITE_FIREBASE_API_KEY: '',
    VITE_FIREBASE_AUTH_DOMAIN: '',
    VITE_FIREBASE_PROJECT_ID: '',
    VITE_FIREBASE_STORAGE_BUCKET: '',
    VITE_FIREBASE_MESSAGING_SENDER_ID: '',
    VITE_FIREBASE_APP_ID: '',
    VITE_AUTH0_AUDIENCE: '',
    VITE_AUTH0_ISSUER_BASE_URL: '',
    VITE_AUTH0_CLIENT_ID: '',
    VITE_VERTEX_AI_PROJECT_ID: '',
    VITE_VERTEX_AI_LOCATION: 'us-central1',
    VITE_VERTEX_AI_API_ENDPOINT: 'us-central1-aiplatform.googleapis.com',
    VITE_GITHUB_TOKEN: '',
    VITE_GITHUB_REPO: '',
    VITE_HUGGINGFACE_API_KEY: '',
    VITE_SENTRY_DSN: '',
    VITE_NEW_RELIC_LICENSE_KEY: ''
  },
  staging: {
    NODE_ENV: 'staging',
    VITE_APP_ENV: 'staging',
    VITE_API_URL: 'https://staging-api.yourdomain.com',
    VITE_WS_URL: 'wss://staging-api.yourdomain.com',
    // Other variables will be populated from .env.staging if it exists
  },
  production: {
    NODE_ENV: 'production',
    VITE_APP_ENV: 'production',
    VITE_API_URL: 'https://api.yourdomain.com',
    VITE_WS_URL: 'wss://api.yourdomain.com',
    // Other variables will be populated from .env.production if it exists
  }
};

// Function to generate .env file
function generateEnvFile(env) {
  const websiteDir = path.resolve(__dirname, '../website');
  const envFile = path.join(websiteDir, `.env.${env}`);
  const existingEnvFile = path.join(websiteDir, `.env.${env}.local`);

  // Load existing environment variables if they exist
  let existingVars = {};
  if (fs.existsSync(existingEnvFile)) {
    existingVars = dotenv.parse(fs.readFileSync(existingEnvFile));
  }

  // Merge template with existing variables
  const envVars = {
    ...envTemplate[env],
    ...existingVars
  };

  // Generate .env file content
  const content = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Write to file
  fs.writeFileSync(envFile, content);
  console.log(`Generated ${envFile}`);
}

// Function to generate all environment files
function generateAllEnvFiles() {
  const environments = ['development', 'staging', 'production'];
  
  environments.forEach(env => {
    try {
      generateEnvFile(env);
    } catch (error) {
      console.error(`Error generating .env.${env}:`, error);
    }
  });
}

// Generate .env.example file
function generateEnvExample() {
  const websiteDir = path.resolve(__dirname, '../website');
  const exampleFile = path.join(websiteDir, '.env.example');

  const content = Object.entries(envTemplate.development)
    .map(([key, value]) => `${key}=${value === '' ? 'your_value_here' : value}`)
    .join('\n');

  fs.writeFileSync(exampleFile, content);
  console.log(`Generated ${exampleFile}`);
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