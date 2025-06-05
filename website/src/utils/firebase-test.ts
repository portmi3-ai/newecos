import { db, auth } from '../config/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export async function testFirebaseConnection() {
  try {
    // Test authentication
    const userCredential = await signInAnonymously(auth);
    console.log('Firebase Auth connected:', userCredential.user.uid);

    // Test Firestore
    const testDoc = doc(db, 'sasha_test', 'connection_test');
    await setDoc(testDoc, {
      timestamp: new Date().toISOString(),
      status: 'connected'
    });

    const docSnap = await getDoc(testDoc);
    console.log('Firestore connected:', docSnap.exists());

    // Initialize Sasha collections
    const collections = [
      'sasha_agents',
      'sasha_conversations',
      'sasha_settings',
      'sasha_memory',
      'sasha_actions'
    ];

    for (const collectionName of collections) {
      const testDoc = doc(db, collectionName, 'init_test');
      await setDoc(testDoc, {
        initialized: true,
        timestamp: new Date().toISOString()
      });
      console.log(`Collection ${collectionName} initialized`);
    }

    return {
      success: true,
      userId: userCredential.user.uid,
      collections: collections
    };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 