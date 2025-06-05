import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Sasha-specific collections with proper typing
export interface SashaAgent {
  id: string;
  name: string;
  type: 'meta' | 'integration' | 'chat';
  status: 'active' | 'inactive' | 'deploying';
  capabilities: string[];
  models: string[];
  config: {
    temperature: number;
    maxTokens: number;
    topP: number;
  };
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface SashaConversation {
  id: string;
  agentId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
  }>;
  context: Record<string, any>;
  metadata: {
    sessionId: string;
    mode: 'chat' | 'task' | 'analysis';
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

export const updateSashaAgent = async (agentId: string, data: Partial<SashaAgent>): Promise<void> => {
  const docRef = doc(db, SashaCollections.AGENTS, agentId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString()
  });
};

export const createSashaConversation = async (conversation: Omit<SashaConversation, 'id'>): Promise<string> => {
  const docRef = doc(collection(db, SashaCollections.CONVERSATIONS));
  await setDoc(docRef, {
    ...conversation,
    id: docRef.id,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
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