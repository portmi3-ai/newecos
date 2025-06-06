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
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'sasha_generated_auth0_client_id',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || 'sasha_generated_auth0_client_secret',

  // Firebase
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || 'sasha_generated_firebase_api_key',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || 'sasha_generated_firebase_auth_domain',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'sasha_generated_firebase_project_id',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || 'sasha_generated_firebase_storage_bucket',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || 'sasha_generated_firebase_messaging_sender_id',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || 'sasha_generated_firebase_app_id',

  // Google Cloud
  VERTEX_AI_PROJECT_ID: process.env.VERTEX_AI_PROJECT_ID || 'sasha_generated_vertex_ai_project_id',
  VERTEX_AI_LOCATION: process.env.VERTEX_AI_LOCATION || 'us-central1',

  // GitHub
  GITHUB_TOKEN: 'your_github_token',

  // Hugging Face
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || 'sasha_generated_huggingface_api_key',

  // Security
  JWT_SECRET: process.env.JWT_SECRET || generateSecureString(64),
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || generateSecureString(32),

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'sasha_generated_google_client_id',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'sasha_generated_google_client_secret'
};

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

// Run initialization
initializeEnvironment(); 