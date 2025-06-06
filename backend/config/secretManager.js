import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secret storage path
const SECRETS_PATH = path.join(__dirname, '../.secrets');

// Ensure secrets directory exists
if (!fs.existsSync(SECRETS_PATH)) {
  fs.mkdirSync(SECRETS_PATH, { recursive: true });
}

// Encryption key (in production, this should be stored securely)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

// Encrypt a value
function encrypt(value) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex')
  };
}

// Decrypt a value
function decrypt(encrypted, iv, authTag) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Store a secret
export async function storeSecret(key, value) {
  const { iv, encrypted, authTag } = encrypt(value);
  const secretData = {
    iv,
    encrypted,
    authTag,
    updatedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(SECRETS_PATH, `${key}.json`),
    JSON.stringify(secretData, null, 2)
  );
}

// Retrieve a secret
export async function getSecret(key, defaultValue = null) {
  try {
    const secretPath = path.join(SECRETS_PATH, `${key}.json`);
    if (!fs.existsSync(secretPath)) {
      if (defaultValue) {
        await storeSecret(key, defaultValue);
        return defaultValue;
      }
      return null;
    }

    const secretData = JSON.parse(fs.readFileSync(secretPath, 'utf8'));
    return decrypt(secretData.encrypted, secretData.iv, secretData.authTag);
  } catch (error) {
    console.error(`Error retrieving secret ${key}:`, error);
    return defaultValue;
  }
}

// List all secrets
export async function listSecrets() {
  try {
    const files = fs.readdirSync(SECRETS_PATH);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error listing secrets:', error);
    return [];
  }
}

// Delete a secret
export async function deleteSecret(key) {
  try {
    const secretPath = path.join(SECRETS_PATH, `${key}.json`);
    if (fs.existsSync(secretPath)) {
      fs.unlinkSync(secretPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting secret ${key}:`, error);
    return false;
  }
}

// Rotate encryption key
export async function rotateEncryptionKey(newKey) {
  try {
    const secrets = await listSecrets();
    const oldKey = ENCRYPTION_KEY;
    
    // Update encryption key
    ENCRYPTION_KEY = newKey || crypto.randomBytes(32);
    
    // Re-encrypt all secrets with new key
    for (const key of secrets) {
      const value = await getSecret(key);
      if (value) {
        await storeSecret(key, value);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error rotating encryption key:', error);
    return false;
  }
} 