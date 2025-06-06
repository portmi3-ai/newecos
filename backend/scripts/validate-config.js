import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { loadConfig } from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Required configuration fields
const requiredFields = {
  server: ['port', 'host', 'env'],
  database: ['url'],
  redis: ['url'],
  firebase: ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'],
  auth0: ['audience', 'issuerBaseUrl', 'clientId'],
  googleCloud: ['projectId', 'location'],
  vertexAi: ['projectId', 'location'],
  github: ['token'],
  huggingface: ['apiKey'],
  logging: ['level', 'format'],
  security: ['corsOrigin', 'rateLimitWindow', 'rateLimitMax'],
  monitoring: ['enabled', 'projectId']
};

async function validateConfig() {
  try {
    const config = await loadConfig();
    
    // Check for required fields
    const requiredFields = [
      'server.port',
      'server.env',
      'database.uri',
      'firebase.projectId',
      'auth0.audience',
      'auth0.issuerBaseURL',
      'vertexAi.projectId',
      'vertexAi.location',
      'github.token',
      'huggingface.apiKey'
    ];

    const missingFields = [];
    for (const field of requiredFields) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], config);
      if (!value) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      console.error('Missing required configuration fields:');
      missingFields.forEach(field => console.error(`- ${field}`));
      process.exit(1);
    }

    // Check for weak secrets
    const secretFields = [
      'database.uri',
      'firebase.apiKey',
      'auth0.clientSecret',
      'github.token',
      'huggingface.apiKey'
    ];

    const weakSecrets = [];
    for (const field of secretFields) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], config);
      if (value && value.length < 32) {
        weakSecrets.push(field);
      }
    }

    if (weakSecrets.length > 0) {
      console.warn('Warning: Weak secrets detected:');
      weakSecrets.forEach(field => console.warn(`- ${field}`));
    }

    console.log('Configuration validation successful!');
    process.exit(0);
  } catch (error) {
    console.error('Configuration validation failed:', error);
    process.exit(1);
  }
}

// Main execution
try {
  console.log('Validating configuration...');
  console.log(`Environment: ${config.server.env}`);
  
  await validateConfig();
} catch (error) {
  console.error('Error validating configuration:', error);
  process.exit(1);
} 