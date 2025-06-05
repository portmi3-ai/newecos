import { firestore, collections } from '../config/db.js';
import { generateDeploymentConfig, AGENT_STATES } from '../config/agent.js';
import { v4 as uuidv4 } from 'uuid';
import Agent from '../models/Agent.js';
import Message from '../models/Message.js';
import { Logging } from '@google-cloud/logging';
import config from '../config/environment.js';
import { wsManager } from '../config/websocket.js';

const logging = new Logging();
const log = logging.log('agentEcos-api');

// Get all agent templates
export const getAgentTemplates = async (req, res) => {
  try {
    // This would typically fetch from Firestore in production
    // For demo, we'll return static data
    const templates = [
      {
        id: 're-listing',
        name: 'Listing Assistant',
        description: 'Helps create, manage, and optimize property listings',
        features: ['Property description generation', 'Market analysis', 'Pricing recommendations'],
        industry: 'real-estate'
      },
      {
        id: 'fin-advisor',
        name: 'Financial Advisor',
        description: 'Provides personalized financial advice and recommendations',
        features: ['Investment suggestions', 'Budget planning', 'Retirement planning'],
        industry: 'fintech'
      },
      // Additional templates would be here
    ];
    
    res.json(templates);
  } catch (error) {
    res.status(500);
    throw new Error('Server error: ' + error.message);
  }
};

// Get all agent roles
export const getAgentRoles = async (req, res) => {
  try {
    // This would typically fetch from Firestore in production
    // For demo, we'll return static data
    const roles = [
      {
        id: 'executive-director',
        name: 'Executive Director',
        level: 'executive',
        description: 'Oversees the entire agent ecosystem with strategic planning and resource allocation.',
        responsibilities: [
          'Define organizational objectives and strategies',
          'Allocate resources across departments',
          'Monitor overall performance metrics',
          'Make high-level business decisions'
        ],
      },
      {
        id: 'department-manager',
        name: 'Department Manager',
        level: 'management',
        description: 'Manages a specific department of agents with related functions.',
        responsibilities: [
          'Set department goals aligned with organizational objectives',
          'Monitor department performance',
          'Allocate resources within the department',
          'Report to executive level'
        ],
      },
      // Additional roles would be here
    ];
    
    res.json(roles);
  } catch (error) {
    res.status(500);
    throw new Error('Server error: ' + error.message);
  }
};

// Get all agents for the authenticated user
export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ createdBy: req.user.sub });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
};

// Get single agent by ID
export const getAgentById = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
};

// Create new agent
export const createAgent = async (req, res) => {
  try {
    const { name, type, model, capabilities, configuration } = req.body;
    
    const agent = new Agent({
      name,
      type,
      model,
      capabilities,
      configuration,
      createdBy: req.user.sub,
    });

    await agent.save();

    // Broadcast agent creation
    wsManager.broadcastToAgent(agent._id, {
      type: 'agent_created',
      agent: agent.toJSON(),
    });

    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Agent created',
      agentId: agent._id,
      name: agent.name,
      type: agent.type,
      environment: config.server.env,
    });
    
    log.write(entry);

    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
};

// Update agent
export const updateAgent = async (req, res) => {
  try {
    const { name, type, model, capabilities, configuration, status } = req.body;
    
    const agent = await Agent.findOne({
      _id: req.params.id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    Object.assign(agent, {
      name,
      type,
      model,
      capabilities,
      configuration,
      status,
    });

    await agent.save();

    // Broadcast agent update
    wsManager.broadcastToAgent(agent._id, {
      type: 'agent_updated',
      agent: agent.toJSON(),
    });

    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Agent updated',
      agentId: agent._id,
      name: agent.name,
      type: agent.type,
      environment: config.server.env,
    });
    
    log.write(entry);

    res.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
};

// Delete agent
export const deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Broadcast agent deletion
    wsManager.broadcastToAgent(agent._id, {
      type: 'agent_deleted',
      agentId: agent._id,
    });

    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Agent deleted',
      agentId: agent._id,
      name: agent.name,
      type: agent.type,
      environment: config.server.env,
    });
    
    log.write(entry);

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
};

// Toggle agent status (active/inactive)
export const toggleAgentStatus = async (req, res) => {
  try {
    const userId = req.user.sub;
    const agentId = req.params.id;
    const { active } = req.body;
    
    if (typeof active !== 'boolean') {
      res.status(400);
      throw new Error('Active status must be a boolean');
    }
    
    // Check if agent exists and belongs to user
    const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
    const doc = await agentRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Agent not found');
    }
    
    const agent = doc.data();
    
    // Check if agent belongs to user
    if (agent.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to update this agent');
    }
    
    // Update active status
    await agentRef.update({
      active,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ 
      id: agentId,
      active,
      message: `Agent ${active ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get agent subordinates (agents that report to this agent)
export const getAgentSubordinates = async (req, res) => {
  try {
    const userId = req.user.sub;
    const agentId = req.params.id;
    
    // Check if agent exists and belongs to user
    const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
    const doc = await agentRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Agent not found');
    }
    
    const agent = doc.data();
    
    // Check if agent belongs to user
    if (agent.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to access this agent');
    }
    
    // Get relationships where this agent is the target of a reports_to relationship
    const relationshipsSnapshot = await firestore.collection(collections.RELATIONSHIPS)
      .where('targetAgentId', '==', agentId)
      .where('type', '==', 'reports_to')
      .where('userId', '==', userId)
      .get();
      
    const subordinateIds = relationshipsSnapshot.docs.map(doc => doc.data().sourceAgentId);
    
    // If no subordinates, return empty array
    if (subordinateIds.length === 0) {
      return res.json([]);
    }
    
    // Get the actual agent documents
    const subordinates = [];
    
    for (const subId of subordinateIds) {
      const subDoc = await firestore.collection(collections.AGENTS).doc(subId).get();
      
      if (subDoc.exists) {
        subordinates.push({
          id: subDoc.id,
          ...subDoc.data()
        });
      }
    }
    
    res.json(subordinates);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get agent supervisors (agents that this agent reports to)
export const getAgentSupervisors = async (req, res) => {
  try {
    const userId = req.user.sub;
    const agentId = req.params.id;
    
    // Check if agent exists and belongs to user
    const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
    const doc = await agentRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Agent not found');
    }
    
    const agent = doc.data();
    
    // Check if agent belongs to user
    if (agent.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to access this agent');
    }
    
    // Get relationships where this agent is the source of a reports_to relationship
    const relationshipsSnapshot = await firestore.collection(collections.RELATIONSHIPS)
      .where('sourceAgentId', '==', agentId)
      .where('type', '==', 'reports_to')
      .where('userId', '==', userId)
      .get();
      
    const supervisorIds = relationshipsSnapshot.docs.map(doc => doc.data().targetAgentId);
    
    // If no supervisors, return empty array
    if (supervisorIds.length === 0) {
      return res.json([]);
    }
    
    // Get the actual agent documents
    const supervisors = [];
    
    for (const supId of supervisorIds) {
      const supDoc = await firestore.collection(collections.AGENTS).doc(supId).get();
      
      if (supDoc.exists) {
        supervisors.push({
          id: supDoc.id,
          ...supDoc.data()
        });
      }
    }
    
    res.json(supervisors);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get agents by industry
export const getAgentsByIndustry = async (req, res) => {
  try {
    const userId = req.user.sub;
    const industryId = req.params.industryId;
    
    // Validate industry ID
    if (!industryId) {
      res.status(400);
      throw new Error('Industry ID is required');
    }
    
    // Query agents by industry and user
    const agentsRef = firestore.collection(collections.AGENTS);
    const snapshot = await agentsRef
      .where('userId', '==', userId)
      .where('industry', '==', industryId)
      .get();
      
    const agents = [];
    snapshot.forEach(doc => {
      agents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(agents);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get agents by role
export const getAgentsByRole = async (req, res) => {
  try {
    const userId = req.user.sub;
    const roleId = req.params.roleId;
    
    // Validate role ID
    if (!roleId) {
      res.status(400);
      throw new Error('Role ID is required');
    }
    
    // Query agents by role and user
    const agentsRef = firestore.collection(collections.AGENTS);
    const snapshot = await agentsRef
      .where('userId', '==', userId)
      .where('role', '==', roleId)
      .get();
      
    const agents = [];
    snapshot.forEach(doc => {
      agents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(agents);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get agent messages
export const getAgentMessages = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const messages = await Message.findBySession(req.params.id, sessionId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching agent messages:', error);
    res.status(500).json({ error: 'Failed to fetch agent messages' });
  }
};

// Send message to agent
export const sendMessage = async (req, res) => {
  try {
    const { content, sessionId, mode = 'chat' } = req.body;
    
    const agent = await Agent.findOne({
      _id: req.params.id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const message = new Message({
      agentId: agent._id,
      sessionId,
      content,
      role: 'user',
      mode,
    });

    await message.save();

    // Update agent metrics
    await agent.updateMetrics(true);

    // Broadcast new message
    wsManager.broadcastToAgent(agent._id, {
      type: 'new_message',
      message: message.toJSON(),
    });

    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Message sent to agent',
      agentId: agent._id,
      messageId: message._id,
      sessionId,
      mode,
      environment: config.server.env,
    });
    
    log.write(entry);

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get agent metrics
export const getAgentMetrics = async (req, res) => {
  try {
    const agent = await Agent.findOne({
      _id: req.params.id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent.metrics);
  } catch (error) {
    console.error('Error fetching agent metrics:', error);
    res.status(500).json({ error: 'Failed to fetch agent metrics' });
  }
};

// Update agent relationships
export const updateRelationships = async (req, res) => {
  try {
    const { relationships } = req.body;
    
    const agent = await Agent.findOne({
      _id: req.params.id,
      createdBy: req.user.sub,
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    agent.relationships = relationships;
    await agent.save();

    // Broadcast relationship update
    wsManager.broadcastToAgent(agent._id, {
      type: 'relationships_updated',
      relationships: agent.relationships,
    });

    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Agent relationships updated',
      agentId: agent._id,
      relationships,
      environment: config.server.env,
    });
    
    log.write(entry);

    res.json(agent);
  } catch (error) {
    console.error('Error updating agent relationships:', error);
    res.status(500).json({ error: 'Failed to update agent relationships' });
  }
};