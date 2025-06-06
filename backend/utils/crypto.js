import crypto from 'crypto';

// Generate a secure random string
export function generateSecureString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate a secure random number
export function generateSecureNumber(min, max) {
  const range = max - min;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const maxNum = Math.pow(256, bytesNeeded);
  const maxRange = maxNum - (maxNum % range);
  
  let value;
  do {
    value = crypto.randomBytes(bytesNeeded).readUIntBE(0, bytesNeeded);
  } while (value >= maxRange);
  
  return min + (value % range);
}

// Hash a string
export function hashString(str, algorithm = 'sha256') {
  return crypto.createHash(algorithm).update(str).digest('hex');
}

// Compare hashed strings
export function compareHashedStrings(str, hash, algorithm = 'sha256') {
  return hashString(str, algorithm) === hash;
}

// Generate a secure token
export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

// Encrypt data
export function encryptData(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex')
  };
}

// Decrypt data
export function decryptData(encrypted, iv, authTag, key) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

// Generate a secure password hash
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    100000,
    64,
    'sha512'
  ).toString('hex');
  return { hash, salt };
}

// Verify a password
export function verifyPassword(password, hash, salt) {
  const verifyHash = crypto.pbkdf2Sync(
    password,
    salt,
    100000,
    64,
    'sha512'
  ).toString('hex');
  return verifyHash === hash;
} 