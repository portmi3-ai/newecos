// Memory Service: Allows the agent to learn and retain knowledge for future reference
// Uses Firestore for persistent storage
// Extend to support vector DB for semantic search if needed

import { firestore } from '../config/db.js';

/**
 * Save a memory for a user/session.
 * @param {string} userId
 * @param {string} sessionId
 * @param {object} data
 */
export async function saveMemory(userId, sessionId, data) {
  await firestore.collection('agent-memories').doc(sessionId).set({
    userId,
    ...data,
    timestamp: new Date().toISOString()
  });
}

/**
 * Retrieve memories for a user, optionally filtered by query.
 * @param {string} userId
 * @param {object} [query]
 * @returns {Promise<Array<object>>}
 */
export async function getMemory(userId, query = {}) {
  let ref = firestore.collection('agent-memories').where('userId', '==', userId);
  // Optionally add more filters based on query
  const snapshot = await ref.get();
  return snapshot.docs.map(doc => doc.data());
} 