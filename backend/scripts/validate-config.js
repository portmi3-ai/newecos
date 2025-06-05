import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import config from '../config/environment.js';

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

// Validate configuration
function validateConfig() {
  const errors = [];
  const warnings = [];

  // Check required fields
  for (const [section, fields] of Object.entries(requiredFields)) {
    if (!config[section]) {
      errors.push(`Missing configuration section: ${section}`);
      continue;
    }

    for (const field of fields) {
      if (!config[section][field]) {
        errors.push(`Missing required field: ${section}.${field}`);
      }
    }
  }

  // Validate specific fields
  if (config.server.port && (isNaN(config.server.port) || config.server.port < 1 || config.server.port > 65535)) {
    errors.push('Invalid server port: must be between 1 and 65535');
  }

  if (config.security.rateLimitWindow && (isNaN(config.security.rateLimitWindow) || config.security.rateLimitWindow < 1)) {
    errors.push('Invalid rate limit window: must be a positive number');
  }

  if (config.security.rateLimitMax && (isNaN(config.security.rateLimitMax) || config.security.rateLimitMax < 1)) {
    errors.push('Invalid rate limit max: must be a positive number');
  }

  // Check for weak secrets
  const weakSecrets = [
    { field: 'github.token', value: config.github?.token },
    { field: 'huggingface.apiKey', value: config.huggingface?.apiKey },
    { field: 'firebase.apiKey', value: config.firebase?.apiKey }
  ];

  for (const { field, value } of weakSecrets) {
    if (value && value.length < 32) {
      warnings.push(`Weak secret detected in ${field}: should be at least 32 characters`);
    }
  }

  // Check environment-specific requirements
  if (config.server.env === 'production') {
    if (!config.monitoring.enabled) {
      warnings.push('Monitoring is disabled in production environment');
    }
    if (config.logging.level === 'debug') {
      warnings.push('Debug logging enabled in production environment');
    }
  }

  return { errors, warnings };
}

// Main execution
try {
  console.log('Validating configuration...');
  console.log(`Environment: ${config.server.env}`);
  
  const { errors, warnings } = validateConfig();

  if (errors.length > 0) {
    console.error('\nConfiguration errors:');
    errors.forEach(error => console.error(`❌ ${error}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('\nConfiguration warnings:');
    warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
  }

  console.log('\n✅ Configuration validation successful');
} catch (error) {
  console.error('Error validating configuration:', error);
  process.exit(1);
} 