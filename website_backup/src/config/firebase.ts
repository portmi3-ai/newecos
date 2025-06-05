import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration for newecos project
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Sasha-specific collections with proper typing
export interface SashaAgent {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  capabilities: string[];
  lastActive: string;
}

export interface SashaConversation {
  id: string;
  agentId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  context: Record<string, any>;
}

export interface SashaSettings {
  userId: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
  integrations: {
    github: boolean;
    huggingface: boolean;
    google: boolean;
  };
}

// Collection names
export const SashaCollections = {
  AGENTS: 'sasha_agents',
  CONVERSATIONS: 'sasha_conversations',
  SETTINGS: 'sasha_settings',
  MEMORY: 'sasha_memory',
  ACTIONS: 'sasha_actions'
} as const;

// Helper functions with proper typing
export const getSashaAgent = async (agentId: string): Promise<SashaAgent | null> => {
  const docRef = doc(db, SashaCollections.AGENTS, agentId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as SashaAgent) : null;
};

export const updateSashaSettings = async (userId: string, settings: Partial<SashaSettings>): Promise<void> => {
  const docRef = doc(db, SashaCollections.SETTINGS, userId);
  await setDoc(docRef, {
    ...settings,
    lastUpdated: new Date().toISOString()
  }, { merge: true });
};

export const saveConversation = async (conversationId: string, data: Partial<SashaConversation>): Promise<void> => {
  const docRef = doc(db, SashaCollections.CONVERSATIONS, conversationId);
  await setDoc(docRef, {
    ...data,
    timestamp: new Date().toISOString()
  }, { merge: true });
};

export const updateAgentMemory = async (agentId: string, memoryData: Record<string, any>): Promise<void> => {
  const docRef = doc(db, SashaCollections.MEMORY, agentId);
  await updateDoc(docRef, {
    ...memoryData,
    lastUpdated: new Date().toISOString()
  });
};

export const logAgentAction = async (agentId: string, action: {
  type: string;
  details: Record<string, any>;
  status: 'success' | 'failure' | 'pending';
}): Promise<void> => {
  const docRef = doc(db, SashaCollections.ACTIONS, `${agentId}_${Date.now()}`);
  await setDoc(docRef, {
    ...action,
    timestamp: new Date().toISOString()
  });
};

export default app; 