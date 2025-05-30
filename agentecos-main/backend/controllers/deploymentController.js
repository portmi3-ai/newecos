import { firestore, collections } from '../config/db.js';
import { generateDeploymentConfig, AGENT_STATES, getAgentTopic, getAgentBucket } from '../config/agent.js';
import { PubSub } from '@google-cloud/pubsub';
import { Logging } from '@google-cloud/logging';

// Initialize clients
const pubsub = new PubSub();
const logging = new Logging();
const log = logging.log('agent-deployments');

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

// Deploy an agent with optimized logging and status updates
export const deployAgent = async (req, res) => {
  try {
    const userId = req.user.sub;
    const agentId = req.params.agentId;
    
    // Configuration options
    const { 
      serviceType = 'serverless',
      instanceSize = 'small',
      autoScaling = true,
      minInstances,
      maxInstances,
      environmentVariables = {},
      secrets = {}
    } = req.body;
    
    // Check if agent exists and belongs to user
    const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
    
    // Check cache first
    const cacheKey = `agent:${agentId}`;
    let agent;
    const cachedAgent = agentCache.get(cacheKey);
    
    if (cachedAgent && Date.now() - cachedAgent.timestamp < CACHE_TTL) {
      agent = cachedAgent.data;
    } else {
      const agentDoc = await agentRef.get();
      
      if (!agentDoc.exists) {
        res.status(404);
        throw new Error('Agent not found');
      }
      
      agent = agentDoc.data();
      
      // Update cache
      agentCache.set(cacheKey, {
        data: agent,
        timestamp: Date.now()
      });
    }
    
    // Check if agent belongs to user
    if (agent.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to deploy this agent');
    }
    
    // Create deployment record
    const deploymentRef = firestore.collection(collections.DEPLOYMENTS).doc();
    const deploymentId = deploymentRef.id;
    
    const deploymentConfig = {
      serviceType,
      instanceSize,
      autoScaling,
      minInstances: minInstances || 0,
      maxInstances: maxInstances || 10,
      environmentVariables,
      secretsCount: Object.keys(secrets).length
    };
    
    const deployment = {
      id: deploymentId,
      agentId,
      userId,
      status: AGENT_STATES.DEPLOYING,
      config: deploymentConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [
        {
          timestamp: new Date().toISOString(),
          message: 'Deployment initiated',
          level: 'info'
        }
      ]
    };
    
    await deploymentRef.set(deployment);
    
    // Update agent status to deploying
    await agentRef.update({
      deployed: false,
      status: AGENT_STATES.DEPLOYING,
      updatedAt: new Date().toISOString()
    });
    
    // Clear any cached data for this agent
    agentCache.delete(cacheKey);
    
    // Batch log entries for better performance
    const logEntries = [];
    
    // Create log entry for deployment initiation
    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    logEntries.push(
      log.entry(metadata, {
        deploymentId,
        agentId,
        userId,
        action: 'deployment_initiated',
        timestamp: new Date().toISOString(),
      })
    );
    
    // Publish deployment event to start the actual deployment process
    const topic = await getAgentTopic('DEPLOYMENT');
    const messageId = await topic.publish(Buffer.from(JSON.stringify({
      deploymentId,
      agentId,
      userId,
      config: deploymentConfig,
      secrets,
      timestamp: new Date().toISOString()
    })));
    
    logEntries.push(
      log.entry(metadata, {
        deploymentId,
        agentId,
        userId,
        messageId,
        action: 'deployment_message_published',
        timestamp: new Date().toISOString(),
      })
    );
    
    // Write all log entries in a batch for better performance
    await log.write(logEntries);
    
    // Return the deployment details
    res.status(202).json({
      id: deploymentId,
      status: AGENT_STATES.DEPLOYING,
      message: 'Deployment initiated. Check status for updates.',
      agent: {
        id: agentId,
        name: agent.name
      }
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get deployment status with optimized cache
export const getDeploymentStatus = async (req, res) => {
  try {
    const userId = req.user.sub;
    const deploymentId = req.params.id;
    
    // Check cache first
    const cacheKey = `deployment-status:${deploymentId}`;
    const cachedStatus = deploymentCache.get(cacheKey);
    
    if (cachedStatus && Date.now() - cachedStatus.timestamp < 10000) { // 10 second cache for status
      // Ensure the cached status belongs to the user
      if (cachedStatus.data.userId === userId) {
        return res.json(cachedStatus.data);
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
    
    // Get associated agent - use cache if available
    let agent;
    const agentCacheKey = `agent:${deployment.agentId}`;
    const cachedAgent = agentCache.get(agentCacheKey);
    
    if (cachedAgent && Date.now() - cachedAgent.timestamp < CACHE_TTL) {
      agent = cachedAgent.data;
    } else {
      const agentRef = firestore.collection(collections.AGENTS).doc(deployment.agentId);
      const agentDoc = await agentRef.get();
      
      if (!agentDoc.exists) {
        res.status(404);
        throw new Error('Associated agent not found');
      }
      
      agent = agentDoc.data();
      
      // Update cache
      agentCache.set(agentCacheKey, {
        data: agent,
        timestamp: Date.now()
      });
    }
    
    // Prepare response data
    const statusData = {
      id: deploymentId,
      status: deployment.status,
      createdAt: deployment.createdAt,
      updatedAt: deployment.updatedAt,
      config: deployment.config,
      serviceUrl: deployment.serviceUrl,
      userId,
      agent: {
        id: deployment.agentId,
        name: agent.name,
        status: agent.status,
        deployed: agent.deployed
      }
    };
    
    // Update cache
    deploymentCache.set(cacheKey, {
      data: statusData,
      timestamp: Date.now()
    });
    
    // Return deployment status with agent info
    res.json(statusData);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
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