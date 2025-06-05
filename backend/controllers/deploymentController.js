import { firestore, collections } from '../config/db.js';
import { generateDeploymentConfig, AGENT_STATES, getAgentTopic, getAgentBucket } from '../config/agent.js';
import { PubSub } from '@google-cloud/pubsub';
import { Logging } from '@google-cloud/logging';
import Agent from '../models/Agent.js';
import config from '../config/environment.js';
import { wsManager } from '../config/websocket.js';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize clients
const pubsub = new PubSub();
const logging = new Logging();
const log = logging.log('agentEcos-api');

// Initialize Vertex AI
const vertexAi = new VertexAI({
  project: config.vertexAi.projectId,
  location: config.vertexAi.location,
});

// Caching mechanisms for optimization
const agentCache = new Map();
const deploymentCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get all deployments for the authenticated user
export const getDeployments = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    // Add pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startAt = (page - 1) * limit;
    
    const deploymentsRef = firestore.collection(collections.DEPLOYMENTS);
    let query = deploymentsRef.where('userId', '==', userId);
    
    // Add sorting
    if (req.query.sort) {
      const [field, direction] = req.query.sort.split(':');
      query = query.orderBy(field, direction === 'desc' ? 'desc' : 'asc');
    } else {
      query = query.orderBy('updatedAt', 'desc');
    }
    
    // Get total count for pagination
    const countSnapshot = await query.count().get();
    const totalCount = countSnapshot.data().count;
    
    // Apply pagination
    query = query.limit(limit).offset(startAt);
    
    const snapshot = await query.get();
    
    const deployments = [];
    snapshot.forEach(doc => {
      deployments.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json({
      deployments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    res.status(500);
    throw new Error('Server error: ' + error.message);
  }
};

// Get deployment by ID with caching
export const getDeploymentById = async (req, res) => {
  try {
    const userId = req.user.sub;
    const deploymentId = req.params.id;
    
    // Check cache first
    const cacheKey = `deployment:${deploymentId}`;
    const cachedDeployment = deploymentCache.get(cacheKey);
    if (cachedDeployment && Date.now() - cachedDeployment.timestamp < CACHE_TTL) {
      // If user matches and cache is still valid
      if (cachedDeployment.data.userId === userId) {
        return res.json(cachedDeployment.data);
      }
    }
    
    const deploymentRef = firestore.collection(collections.DEPLOYMENTS).doc(deploymentId);
    const doc = await deploymentRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Deployment not found');
    }
    
    const deployment = doc.data();
    
    // Check if deployment belongs to user
    if (deployment.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to access this deployment');
    }
    
    // Update cache
    deploymentCache.set(cacheKey, {
      data: {
        id: doc.id,
        ...deployment
      },
      timestamp: Date.now()
    });
    
    res.json({
      id: doc.id,
      ...deployment
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Deploy agent
export const deployAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { configuration } = req.body;

    const agent = await Agent.findOne({
      _id: id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Update agent configuration
    if (configuration) {
      agent.configuration = new Map(Object.entries(configuration));
    }

    // Initialize model based on agent type
    let model;
    switch (agent.model) {
      case 'gemini-pro':
        model = vertexAi.preview.getGenerativeModel({
          model: 'gemini-pro',
          generation_config: {
            max_output_tokens: 2048,
            temperature: 0.4,
            top_p: 0.8,
            top_k: 40,
          },
        });
        break;
      case 'claude-3':
        // Initialize Claude model (implementation depends on your provider)
        break;
      default:
        throw new Error(`Unsupported model: ${agent.model}`);
    }

    // Update agent status
    agent.status = 'deployed';
    await agent.save();

    // Broadcast deployment status
    wsManager.broadcastToAgent(agent._id, {
      type: 'agent_deployed',
      agent: agent.toJSON(),
    });

    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Agent deployed',
      agentId: agent._id,
      name: agent.name,
      model: agent.model,
      environment: config.server.env,
    });
    
    log.write(entry);

    res.json({
      message: 'Agent deployed successfully',
      agent: agent.toJSON(),
    });
  } catch (error) {
    console.error('Error deploying agent:', error);
    res.status(500).json({ error: 'Failed to deploy agent' });
  }
};

// Undeploy agent
export const undeployAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findOne({
      _id: id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Update agent status
    agent.status = 'inactive';
    await agent.save();

    // Broadcast undeployment status
    wsManager.broadcastToAgent(agent._id, {
      type: 'agent_undeployed',
      agent: agent.toJSON(),
    });

    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Agent undeployed',
      agentId: agent._id,
      name: agent.name,
      environment: config.server.env,
    });
    
    log.write(entry);

    res.json({
      message: 'Agent undeployed successfully',
      agent: agent.toJSON(),
    });
  } catch (error) {
    console.error('Error undeploying agent:', error);
    res.status(500).json({ error: 'Failed to undeploy agent' });
  }
};

// Get deployment status
export const getDeploymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findOne({
      _id: id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      status: agent.status,
      lastDeployed: agent.updatedAt,
      metrics: agent.metrics,
    });
  } catch (error) {
    console.error('Error getting deployment status:', error);
    res.status(500).json({ error: 'Failed to get deployment status' });
  }
};

// Update deployment configuration
export const updateDeploymentConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { configuration } = req.body;

    const agent = await Agent.findOne({
      _id: id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Update configuration
    agent.configuration = new Map(Object.entries(configuration));
    await agent.save();

    // Broadcast configuration update
    wsManager.broadcastToAgent(agent._id, {
      type: 'deployment_config_updated',
      configuration: Object.fromEntries(agent.configuration),
    });

    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Deployment configuration updated',
      agentId: agent._id,
      name: agent.name,
      environment: config.server.env,
    });
    
    log.write(entry);

    res.json({
      message: 'Deployment configuration updated successfully',
      configuration: Object.fromEntries(agent.configuration),
    });
  } catch (error) {
    console.error('Error updating deployment configuration:', error);
    res.status(500).json({ error: 'Failed to update deployment configuration' });
  }
};

// Get deployment logs with pagination
export const getDeploymentLogs = async (req, res) => {
  try {
    const userId = req.user.sub;
    const deploymentId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    
    const deploymentRef = firestore.collection(collections.DEPLOYMENTS).doc(deploymentId);
    const doc = await deploymentRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Deployment not found');
    }
    
    const deployment = doc.data();
    
    // Check if deployment belongs to user
    if (deployment.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to access this deployment');
    }
    
    // Get logs with pagination
    const logs = deployment.logs || [];
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedLogs = logs.slice(startIndex, endIndex);
    
    res.json({
      logs: paginatedLogs,
      pagination: {
        page,
        limit,
        total: logs.length,
        totalPages: Math.ceil(logs.length / limit)
      }
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Update deployment configuration
export const updateDeploymentConfiguration = async (req, res) => {
  try {
    const userId = req.user.sub;
    const deploymentId = req.params.id;
    
    const { 
      serviceType,
      instanceSize,
      autoScaling,
      minInstances,
      maxInstances,
      environmentVariables = {}
    } = req.body;
    
    // Check if deployment exists and belongs to user
    const deploymentRef = firestore.collection(collections.DEPLOYMENTS).doc(deploymentId);
    const doc = await deploymentRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Deployment not found');
    }
    
    const deployment = doc.data();
    
    // Check if deployment belongs to user
    if (deployment.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to update this deployment');
    }
    
    // Check if deployment is in a state that can be updated
    if (deployment.status === AGENT_STATES.DEPLOYING) {
      res.status(400);
      throw new Error('Cannot update configuration while deployment is in progress');
    }
    
    // Update configuration
    const updatedConfig = {
      ...deployment.config,
      serviceType: serviceType || deployment.config.serviceType,
      instanceSize: instanceSize || deployment.config.instanceSize,
      autoScaling: autoScaling !== undefined ? autoScaling : deployment.config.autoScaling,
      minInstances: minInstances !== undefined ? minInstances : deployment.config.minInstances,
      maxInstances: maxInstances !== undefined ? maxInstances : deployment.config.maxInstances,
      environmentVariables: {
        ...deployment.config.environmentVariables,
        ...environmentVariables
      }
    };
    
    const timestamp = new Date().toISOString();
    
    await deploymentRef.update({
      config: updatedConfig,
      updatedAt: timestamp,
      logs: firestore.FieldValue.arrayUnion({
        timestamp,
        message: 'Configuration updated',
        level: 'info'
      })
    });
    
    // Clear cache for this deployment
    deploymentCache.delete(`deployment:${deploymentId}`);
    deploymentCache.delete(`deployment-status:${deploymentId}`);
    
    res.json({
      id: deploymentId,
      config: updatedConfig,
      message: 'Deployment configuration updated successfully'
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Delete deployment
export const deleteDeployment = async (req, res) => {
  try {
    const userId = req.user.sub;
    const deploymentId = req.params.id;
    
    // Check if deployment exists and belongs to user
    const deploymentRef = firestore.collection(collections.DEPLOYMENTS).doc(deploymentId);
    const doc = await deploymentRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Deployment not found');
    }
    
    const deployment = doc.data();
    
    // Check if deployment belongs to user
    if (deployment.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to delete this deployment');
    }
    
    // Check if deployment is in a state that can be deleted
    if (deployment.status === AGENT_STATES.DEPLOYING) {
      res.status(400);
      throw new Error('Cannot delete deployment while it is in progress');
    }
    
    // Update associated agent
    const agentRef = firestore.collection(collections.AGENTS).doc(deployment.agentId);
    const agentDoc = await agentRef.get();
    
    if (agentDoc.exists) {
      await agentRef.update({
        deployed: false,
        status: AGENT_STATES.CREATED,
        updatedAt: new Date().toISOString()
      });
      
      // Clear agent cache
      agentCache.delete(`agent:${deployment.agentId}`);
    }
    
    // Delete deployment
    await deploymentRef.delete();
    
    // Clear deployment caches
    deploymentCache.delete(`deployment:${deploymentId}`);
    deploymentCache.delete(`deployment-status:${deploymentId}`);
    
    // Log deployment deletion
    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      deploymentId,
      agentId: deployment.agentId,
      userId,
      action: 'deployment_deleted',
      timestamp: new Date().toISOString(),
    });
    
    log.write(entry);
    
    res.json({ message: 'Deployment deleted successfully' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Clear caches (for testing/admin purposes)
export const clearCaches = () => {
  agentCache.clear();
  deploymentCache.clear();
};