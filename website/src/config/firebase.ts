import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBy_hCQPM5qsfo7ggxPY2XhUXPTiCLaqV0",
  authDomain: "apex-wildlife-watch.firebaseapp.com",
  projectId: "apex-wildlife-watch",
  storageBucket: "apex-wildlife-watch.firebasestorage.app",
  messagingSenderId: "1041831140002",
  appId: "1:1041831140002:web:a4038f25598024288e55fb",
  measurementId: "G-57RC4PQ32W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Sasha-specific collections
const SashaCollections = {
  AGENTS: 'agents',
  CONVERSATIONS: 'conversations',
  SETTINGS: 'settings',
  MEMORY: 'memory',
  ACTIONS: 'actions'
};

// Helper functions to interact with existing collections
export const getSashaAgent = async (agentId: string) => {
  const docRef = doc(db, SashaCollections.AGENTS, agentId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateSashaSettings = async (userId: string, settings: any) => {
  const docRef = doc(db, SashaCollections.SETTINGS, userId);
  await setDoc(docRef, settings, { merge: true });
};

export const saveConversation = async (conversationId: string, data: any) => {
  const docRef = doc(db, SashaCollections.CONVERSATIONS, conversationId);
  await setDoc(docRef, {
    ...data,
    timestamp: new Date().toISOString()
  }, { merge: true });
};

export const updateAgentMemory = async (agentId: string, memoryData: any) => {
  const docRef = doc(db, SashaCollections.MEMORY, agentId);
  await updateDoc(docRef, {
    ...memoryData,
    lastUpdated: new Date().toISOString()
  });
};

export const logAgentAction = async (agentId: string, action: any) => {
  const docRef = doc(db, SashaCollections.ACTIONS, `${agentId}_${Date.now()}`);
  await setDoc(docRef, {
    ...action,
    timestamp: new Date().toISOString()
  });
};

export default app; 