import { PubSub } from '@google-cloud/pubsub';
import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud clients
const pubsub = new PubSub();
const storage = new Storage();

// Agent deployment states
export const AGENT_STATES = {
  CREATED: 'created',
  DEPLOYING: 'deploying',
  DEPLOYED: 'deployed',
  FAILED: 'failed',
  UPDATING: 'updating',
  PAUSED: 'paused',
  DELETED: 'deleted',
};

// Agent role levels
export const AGENT_ROLE_LEVELS = [
  'executive',
  'management',
  'operational',
  'specialized',
];

// Agent relationship types
export const RELATIONSHIP_TYPES = [
  'reports_to',
  'supervises',
  'collaborates_with',
  'delegates_to',
];

// Agent runtime configurations
export const RUNTIME_CONFIGS = {
  SERVERLESS: {
    name: 'Serverless',
    description: 'Serverless execution using Cloud Run',
    minInstances: 0,
    maxInstances: 10,
  },
  CONTAINER: {
    name: 'Container',
    description: 'Containerized deployment with Kubernetes',
    minInstances: 1,
    maxInstances: 20,
  },
  FUNCTION: {
    name: 'Function',
    description: 'Lightweight execution using Cloud Functions',
    minInstances: 0,
    maxInstances: 5,
  },
};

// Agent event topics
export const AGENT_TOPICS = {
  DEPLOYMENT: 'agent-deployment',
  STATUS_CHANGE: 'agent-status-change',
  INTERACTION: 'agent-interaction',
};

// Get PubSub topic for agent events
export const getAgentTopic = async (topicName) => {
  const fullTopicName = `${AGENT_TOPICS[topicName]}`;
  
  try {
    const [topic] = await pubsub.topic(fullTopicName).get();
    return topic;
  } catch (error) {
    if (error.code === 5) { // NOT_FOUND
      // Create the topic if it doesn't exist
      const [newTopic] = await pubsub.createTopic(fullTopicName);
      return newTopic;
    }
    throw error;
  }
};

// Get Cloud Storage bucket for agent artifacts
export const getAgentBucket = async () => {
  const bucketName = process.env.AGENT_ARTIFACTS_BUCKET || 'agent-ecos-artifacts';
  
  try {
    const [bucket] = await storage.bucket(bucketName).get();
    return bucket;
  } catch (error) {
    if (error.code === 404) {
      // Create the bucket if it doesn't exist
      const [newBucket] = await storage.createBucket(bucketName);
      return newBucket;
    }
    throw error;
  }
};

// Generate deployment configuration for an agent
export const generateDeploymentConfig = (agent, runtimeConfig) => {
  const config = {
    name: agent.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    runtime: runtimeConfig,
    env: {
      AGENT_ID: agent.id,
      AGENT_NAME: agent.name,
      AGENT_INDUSTRY: agent.industry,
      AGENT_TEMPLATE: agent.template,
      AGENT_ROLE: agent.role,
    },
    labels: {
      'agent-id': agent.id,
      'agent-industry': agent.industry,
      'agent-template': agent.template,
      'agent-role': agent.role || 'none',
    },
  };
  
  return config;
};