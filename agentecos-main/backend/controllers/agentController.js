import { firestore, collections } from '../config/db.js';
import { generateDeploymentConfig, AGENT_STATES } from '../config/agent.js';
import { v4 as uuidv4 } from 'uuid';

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
    const userId = req.user.sub;
    
    const agentsRef = firestore.collection(collections.AGENTS);
    const snapshot = await agentsRef.where('userId', '==', userId).get();
    
    const agents = [];
    snapshot.forEach(doc => {
      agents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(agents);
  } catch (error) {
    res.status(500);
    throw new Error('Server error: ' + error.message);
  }
};

// Get single agent by ID
export const getAgentById = async (req, res) => {
  try {
    const userId = req.user.sub;
    const agentId = req.params.id;
    
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
    
    res.json({
      id: doc.id,
      ...agent
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Create new agent
export const createAgent = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { 
      name, 
      description, 
      industry, 
      template, 
      role, 
      parentAgentId, 
      capabilities = [] 
    } = req.body;
    
    // Validate required fields
    if (!name || !industry || !template) {
      res.status(400);
      throw new Error('Please provide name, industry, and template');
    }
    
    // Check agent limit for free users
    if (!req.user.hasSubscription) {
      const agentsRef = firestore.collection(collections.AGENTS);
      const snapshot = await agentsRef.where('userId', '==', userId).get();
      
      if (snapshot.size >= 3) {
        res.status(403);
        throw new Error('Free tier limited to 3 agents. Please upgrade to create more agents.');
      }
    }
    
    // Create new agent
    const newAgent = {
      name,
      description: description || '',
      industry,
      template,
      role: role || null,
      active: false,
      deployed: false,
      createdAt: new Date().toISOString(),
      lastDeployed: null,
      parentAgentId: parentAgentId || null,
      userId,
      capabilities,
    };
    
    const agentRef = firestore.collection(collections.AGENTS).doc();
    await agentRef.set(newAgent);
    
    // If parent agent specified, create relationship
    if (parentAgentId) {
      const relationshipRef = firestore.collection(collections.RELATIONSHIPS).doc();
      
      // Create reports_to relationship
      await relationshipRef.set({
        sourceAgentId: agentRef.id,
        targetAgentId: parentAgentId,
        type: 'reports_to',
        createdAt: new Date().toISOString(),
        userId,
      });
      
      // Create supervises relationship
      const superviseRef = firestore.collection(collections.RELATIONSHIPS).doc();
      await superviseRef.set({
        sourceAgentId: parentAgentId,
        targetAgentId: agentRef.id,
        type: 'supervises',
        createdAt: new Date().toISOString(),
        userId,
      });
      
      // Update parent agent to include this child
      const parentRef = firestore.collection(collections.AGENTS).doc(parentAgentId);
      await parentRef.update({
        childAgentIds: firestore.FieldValue.arrayUnion(agentRef.id)
      });
    }
    
    res.status(201).json({
      id: agentRef.id,
      ...newAgent
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Update agent
export const updateAgent = async (req, res) => {
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
      throw new Error('Not authorized to update this agent');
    }
    
    // Update agent with new data, preserving fields not included in the request
    const updateData = { ...req.body };
    
    // Don't allow changing userId or deployed status through this endpoint
    delete updateData.userId;
    delete updateData.deployed;
    
    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();
    
    // Handle parent agent changes if needed
    if (updateData.parentAgentId !== undefined && 
        updateData.parentAgentId !== agent.parentAgentId) {
      
      // Remove old parent-child relationship
      if (agent.parentAgentId) {
        // Get relationship docs to delete
        const oldRelationships = await firestore.collection(collections.RELATIONSHIPS)
          .where('sourceAgentId', '==', agentId)
          .where('targetAgentId', '==', agent.parentAgentId)
          .where('type', '==', 'reports_to')
          .get();
          
        const oldSupervisesRel = await firestore.collection(collections.RELATIONSHIPS)
          .where('sourceAgentId', '==', agent.parentAgentId)
          .where('targetAgentId', '==', agentId)
          .where('type', '==', 'supervises')
          .get();
          
        // Delete relationships
        const batch = firestore.batch();
        oldRelationships.forEach(doc => batch.delete(doc.ref));
        oldSupervisesRel.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        
        // Update old parent agent
        const oldParentRef = firestore.collection(collections.AGENTS).doc(agent.parentAgentId);
        await oldParentRef.update({
          childAgentIds: firestore.FieldValue.arrayRemove(agentId)
        });
      }
      
      // Add new parent-child relationship
      if (updateData.parentAgentId) {
        // Create reports_to relationship
        const newRelRef = firestore.collection(collections.RELATIONSHIPS).doc();
        await newRelRef.set({
          sourceAgentId: agentId,
          targetAgentId: updateData.parentAgentId,
          type: 'reports_to',
          createdAt: new Date().toISOString(),
          userId,
        });
        
        // Create supervises relationship
        const newSupRef = firestore.collection(collections.RELATIONSHIPS).doc();
        await newSupRef.set({
          sourceAgentId: updateData.parentAgentId,
          targetAgentId: agentId,
          type: 'supervises',
          createdAt: new Date().toISOString(),
          userId,
        });
        
        // Update new parent agent
        const newParentRef = firestore.collection(collections.AGENTS).doc(updateData.parentAgentId);
        await newParentRef.update({
          childAgentIds: firestore.FieldValue.arrayUnion(agentId)
        });
      }
    }
    
    await agentRef.update(updateData);
    
    // Get updated agent
    const updatedDoc = await agentRef.get();
    
    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Delete agent
export const deleteAgent = async (req, res) => {
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
      throw new Error('Not authorized to delete this agent');
    }
    
    // Start a batch transaction for deleting the agent and related data
    const batch = firestore.batch();
    
    // Delete agent
    batch.delete(agentRef);
    
    // Delete relationships
    const relationshipsSnapshot = await firestore.collection(collections.RELATIONSHIPS)
      .where('sourceAgentId', '==', agentId)
      .get();
      
    const targetRelationshipsSnapshot = await firestore.collection(collections.RELATIONSHIPS)
      .where('targetAgentId', '==', agentId)
      .get();
      
    relationshipsSnapshot.forEach(doc => batch.delete(doc.ref));
    targetRelationshipsSnapshot.forEach(doc => batch.delete(doc.ref));
    
    // Update parent agent if exists
    if (agent.parentAgentId) {
      const parentRef = firestore.collection(collections.AGENTS).doc(agent.parentAgentId);
      const parentDoc = await parentRef.get();
      
      if (parentDoc.exists) {
        batch.update(parentRef, {
          childAgentIds: firestore.FieldValue.arrayRemove(agentId)
        });
      }
    }
    
    // Update any child agents to remove parent reference
    if (agent.childAgentIds && agent.childAgentIds.length > 0) {
      const childPromises = agent.childAgentIds.map(async (childId) => {
        const childRef = firestore.collection(collections.AGENTS).doc(childId);
        const childDoc = await childRef.get();
        
        if (childDoc.exists) {
          batch.update(childRef, {
            parentAgentId: null
          });
          
          // Delete relationships between parent and child
          const childRelSnapshot = await firestore.collection(collections.RELATIONSHIPS)
            .where('sourceAgentId', '==', childId)
            .where('targetAgentId', '==', agentId)
            .get();
            
          const parentChildRelSnapshot = await firestore.collection(collections.RELATIONSHIPS)
            .where('sourceAgentId', '==', agentId)
            .where('targetAgentId', '==', childId)
            .get();
            
          childRelSnapshot.forEach(doc => batch.delete(doc.ref));
          parentChildRelSnapshot.forEach(doc => batch.delete(doc.ref));
        }
      });
      
      await Promise.all(childPromises);
    }
    
    // Commit the batch transaction
    await batch.commit();
    
    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
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