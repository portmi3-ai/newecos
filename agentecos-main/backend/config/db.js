import { Firestore } from '@google-cloud/firestore';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Get GCP project ID from environment
const projectId = process.env.GCP_PROJECT_ID;

// Initialize Firestore client
export const firestore = new Firestore({
  projectId,
  keyFilename: process.env.NODE_ENV === 'production' ? undefined : process.env.GCP_KEY_FILE,
});

// Function to get a secret from Secret Manager
export const getSecret = async (secretName) => {
  const client = new SecretManagerServiceClient({
    projectId,
    keyFilename: process.env.NODE_ENV === 'production' ? undefined : process.env.GCP_KEY_FILE,
  });
  
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  
  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload.data.toString('utf8');
    return payload;
  } catch (error) {
    console.error(`Error accessing secret ${secretName}:`, error);
    throw error;
  }
};

// Collections
export const collections = {
  AGENTS: 'agents',
  USERS: 'users',
  RELATIONSHIPS: 'relationships',
  DEPLOYMENTS: 'deployments',
  BLUEPRINTS: 'blueprints',
  METRICS: 'metrics',
};

// Connect to Firestore
export const connectDB = async () => {
  try {
    // Test the connection by listing collections
    const collections = await firestore.listCollections();
    console.log('Connected to Firestore');
    return true;
  } catch (error) {
    console.error('Failed to connect to Firestore:', error);
    return false;
  }
};

// Initialize the database schema if needed
export const initializeSchema = async () => {
  // This function would create any necessary collections or documents
  // if they don't already exist. In Firestore, collections and documents
  // are created automatically when first written to.
  console.log('Firestore schema initialized');
};

// Main initialization function
export const initializeDB = async () => {
  const connected = await connectDB();
  
  if (connected) {
    await initializeSchema();
    return true;
  }
  
  return false;
};