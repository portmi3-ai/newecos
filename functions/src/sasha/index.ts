import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';
import { Octokit } from '@octokit/rest';
import { HfInference } from '@huggingface/inference';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Vertex AI
const vertex = new VertexAI({
  project: process.env.GCP_PROJECT_ID,
  location: process.env.GCP_LOCATION,
});

// Initialize GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Sasha agent types
interface SashaAgent {
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
}

// Cloud Functions

// 1. Agent Management
export const createSashaAgent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const agent: SashaAgent = {
    id: admin.firestore().collection('sasha_agents').doc().id,
    name: data.name,
    type: data.type,
    status: 'inactive',
    capabilities: data.capabilities || [],
    models: data.models || ['gemini-pro'],
    config: {
      temperature: data.config?.temperature || 0.7,
      maxTokens: data.config?.maxTokens || 1024,
      topP: data.config?.topP || 0.9,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await admin.firestore().collection('sasha_agents').doc(agent.id).set(agent);
  return agent;
});

// 2. Message Handling
export const sendSashaMessage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { agentId, message, sessionId } = data;
  const agentRef = admin.firestore().collection('sasha_agents').doc(agentId);
  const agentDoc = await agentRef.get();

  if (!agentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Agent not found');
  }

  const agent = agentDoc.data() as SashaAgent;
  const model = agent.models[0]; // Use first model in the list

  // Get conversation history
  const conversationRef = admin.firestore()
    .collection('sasha_conversations')
    .where('agentId', '==', agentId)
    .where('metadata.sessionId', '==', sessionId)
    .orderBy('createdAt', 'desc')
    .limit(1);

  const conversationSnapshot = await conversationRef.get();
  let conversation = conversationSnapshot.docs[0]?.data();

  // Generate response using Vertex AI
  const modelResponse = await vertex.preview.getGenerativeModel({
    model: model,
  }).generateContent({
    contents: [{ role: 'user', parts: [{ text: message }] }],
    generationConfig: {
      temperature: agent.config.temperature,
      maxOutputTokens: agent.config.maxTokens,
      topP: agent.config.topP,
    },
  });

  const response = modelResponse.response;
  const responseText = response.candidates[0].content.parts[0].text;

  // Update conversation
  const newMessage = {
    role: 'assistant',
    content: responseText,
    timestamp: new Date().toISOString(),
  };

  if (conversation) {
    await conversationRef.docs[0].ref.update({
      messages: admin.firestore.FieldValue.arrayUnion(newMessage),
    });
  } else {
    await admin.firestore().collection('sasha_conversations').add({
      agentId,
      messages: [newMessage],
      metadata: {
        sessionId,
        mode: 'chat',
      },
      createdAt: new Date().toISOString(),
    });
  }

  return { response: responseText };
});

// 3. Agent Deployment
export const deploySashaAgent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { agentId } = data;
  const agentRef = admin.firestore().collection('sasha_agents').doc(agentId);
  
  await agentRef.update({
    status: 'deploying',
    updatedAt: new Date().toISOString(),
  });

  try {
    // Deploy agent logic here
    // This could involve setting up Cloud Run instances, configuring endpoints, etc.
    
    await agentRef.update({
      status: 'active',
      updatedAt: new Date().toISOString(),
    });

    return { status: 'success' };
  } catch (error) {
    await agentRef.update({
      status: 'inactive',
      updatedAt: new Date().toISOString(),
    });

    throw new functions.https.HttpsError('internal', 'Failed to deploy agent');
  }
});

// 4. Health Check
export const checkSashaHealth = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { agentId } = data;
  const agentRef = admin.firestore().collection('sasha_agents').doc(agentId);
  const agentDoc = await agentRef.get();

  if (!agentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Agent not found');
  }

  const agent = agentDoc.data() as SashaAgent;
  
  // Check agent health
  const health = {
    status: agent.status,
    lastActive: agent.updatedAt,
    models: agent.models.map(model => ({
      name: model,
      status: 'active', // This should be checked against the actual model status
    })),
  };

  return health;
});

// 5. WebSocket Connection
export const sashaWebSocket = functions.https.onRequest((req, res) => {
  // Implement WebSocket connection logic here
  // This would handle real-time updates for agent status, messages, etc.
}); 