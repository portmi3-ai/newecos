import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { generateSecureString } from '../utils/crypto.js';
import { storeSecret, listSecrets } from '../config/secretManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required secrets
const requiredSecrets = {
  // Auth0
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'sasha_generated_auth0_audience',
  AUTH0_ISSUER_BASE_URL: process.env.AUTH0_ISSUER_BASE_URL || 'sasha_generated_auth0_issuer_base_url',

  // Firebase
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || 'sasha_generated_firebase_api_key',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || 'sasha_generated_firebase_auth_domain',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'sasha_generated_firebase_project_id',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || 'sasha_generated_firebase_storage_bucket',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || 'sasha_generated_firebase_messaging_sender_id',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || 'sasha_generated_firebase_app_id',

  // Google Cloud
  VERTEX_AI_LOCATION: process.env.VERTEX_AI_LOCATION || 'us-central1',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'sasha_generated_google_client_id',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'sasha_generated_google_client_secret',

  // Hugging Face
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || 'sasha_generated_huggingface_api_key',

  // Security
  JWT_SECRET: process.env.JWT_SECRET || generateSecureString(64),
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || generateSecureString(32)
};

// Generate a secure encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');

// Create .env file with encryption key
const envPath = path.join(__dirname, '../.env');
const envContent = `# Environment Configuration
NODE_ENV=development
HOST=localhost
PORT=3000

# Encryption
ENCRYPTION_KEY=${encryptionKey}

# MongoDB
MONGODB_URI=mongodb://localhost:27017/agent-ecos

# Auth0 Configuration
AUTH0_AUDIENCE=https://api.agent-ecos.com
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id

# Google Cloud Configuration
VERTEX_AI_PROJECT_ID=sasha-firebase-meta
VERTEX_AI_LOCATION=us-central1

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
CORS_ORIGIN=*
`;

// Write .env file
fs.writeFileSync(envPath, envContent);
console.log('Created .env file with default configuration');

// Initialize environment
async function initializeEnvironment() {
  try {
    console.log('Initializing environment...');

    // Generate environment files
    console.log('Generating environment files...');
    execSync('node scripts/generate-env.js', { stdio: 'inherit' });

    // Store secrets
    console.log('Storing secrets...');
    const existingSecrets = await listSecrets();
    
    for (const [key, defaultValue] of Object.entries(requiredSecrets)) {
      if (!existingSecrets.includes(key)) {
        await storeSecret(key, defaultValue);
        console.log(`Stored secret: ${key}`);
      }
    }

    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(__dirname, '..', '.gitignore');
    if (!fs.existsSync(gitignorePath)) {
      const gitignoreContent = `
# Environment files
.env*
!.env.example

# Secrets
.secrets/

# Dependencies
node_modules/

# Logs
logs/
*.log

# Build output
dist/
build/

# IDE files
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
`;
      fs.writeFileSync(gitignorePath, gitignoreContent.trim());
      console.log('Created .gitignore file');
    }

    console.log('Environment initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing environment:', error);
    process.exit(1);
  }
}

// Initialize secrets
async function initSecrets() {
  try {
    // Store MongoDB URI
    await storeSecret('MONGODB_URI', 'mongodb://localhost:27017/agent-ecos');
    console.log('Stored MongoDB URI secret');

    // Store Auth0 configuration
    await storeSecret('AUTH0_AUDIENCE', 'https://api.agent-ecos.com');
    await storeSecret('AUTH0_ISSUER_BASE_URL', 'https://your-tenant.auth0.com');
    await storeSecret('AUTH0_CLIENT_ID', 'your-client-id');
    console.log('Stored Auth0 secrets');

    // Store Google Cloud configuration
    await storeSecret('VERTEX_AI_PROJECT_ID', 'sasha-firebase-meta');
    console.log('Stored Google Cloud secrets');

    console.log('Environment initialization complete!');
    console.log('\nPlease update the following in your .env file:');
    console.log('1. Auth0 configuration (AUTH0_ISSUER_BASE_URL, AUTH0_CLIENT_ID)');
    console.log('2. Google Cloud configuration (VERTEX_AI_PROJECT_ID)');
  } catch (error) {
    console.error('Error initializing secrets:', error);
    process.exit(1);
  }
}

// Run initialization
initializeEnvironment();
initSecrets(); 