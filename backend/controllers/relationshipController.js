import { firestore, collections } from '../config/db.js';
import { RELATIONSHIP_TYPES } from '../config/agent.js';

// Get all relationships for the authenticated user
export const getRelationships = async (req, res) => {
  try {
    const userId = req.user.sub;
    
    const relationshipsRef = firestore.collection(collections.RELATIONSHIPS);
    const snapshot = await relationshipsRef.where('userId', '==', userId).get();
    
    const relationships = [];
    snapshot.forEach(doc => {
      relationships.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(relationships);
  } catch (error) {
    res.status(500);
    throw new Error('Server error: ' + error.message);
  }
};

// Create a new relationship between agents
export const createRelationship = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { sourceAgentId, targetAgentId, type } = req.body;
    
    // Validate required fields
    if (!sourceAgentId || !targetAgentId || !type) {
      res.status(400);
      throw new Error('Please provide sourceAgentId, targetAgentId, and type');
    }
    
    // Validate relationship type
    if (!RELATIONSHIP_TYPES.includes(type)) {
      res.status(400);
      throw new Error(`Invalid relationship type. Must be one of: ${RELATIONSHIP_TYPES.join(', ')}`);
    }
    
    // Check if source agent exists and belongs to user
    const sourceAgentRef = firestore.collection(collections.AGENTS).doc(sourceAgentId);
    const sourceAgentDoc = await sourceAgentRef.get();
    
    if (!sourceAgentDoc.exists) {
      res.status(404);
      throw new Error('Source agent not found');
    }
    
    const sourceAgent = sourceAgentDoc.data();
    
    if (sourceAgent.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to access source agent');
    }
    
    // Check if target agent exists and belongs to user
    const targetAgentRef = firestore.collection(collections.AGENTS).doc(targetAgentId);
    const targetAgentDoc = await targetAgentRef.get();
    
    if (!targetAgentDoc.exists) {
      res.status(404);
      throw new Error('Target agent not found');
    }
    
    const targetAgent = targetAgentDoc.data();
    
    if (targetAgent.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to access target agent');
    }
    
    // Check for circular relationships
    if (type === 'reports_to') {
      // Check if target agent already reports to source agent
      const circularRef = await firestore.collection(collections.RELATIONSHIPS)
        .where('sourceAgentId', '==', targetAgentId)
        .where('targetAgentId', '==', sourceAgentId)
        .where('type', '==', 'reports_to')
        .get();
        
      if (!circularRef.empty) {
        res.status(400);
        throw new Error('This would create a circular reporting relationship');
      }
    }
    
    // Check if relationship already exists
    const existingRef = await firestore.collection(collections.RELATIONSHIPS)
      .where('sourceAgentId', '==', sourceAgentId)
      .where('targetAgentId', '==', targetAgentId)
      .where('type', '==', type)
      .get();
      
    if (!existingRef.empty) {
      res.status(400);
      throw new Error('Relationship already exists');
    }
    
    // Create relationship
    const relationshipRef = firestore.collection(collections.RELATIONSHIPS).doc();
    const relationship = {
      sourceAgentId,
      targetAgentId,
      type,
      userId,
      createdAt: new Date().toISOString()
    };
    
    await relationshipRef.set(relationship);
    
    // If this is a reports_to relationship, update the parent-child references
    if (type === 'reports_to') {
      // Update source agent (child)
      await sourceAgentRef.update({
        parentAgentId: targetAgentId,
        updatedAt: new Date().toISOString()
      });
      
      // Update target agent (parent)
      await targetAgentRef.update({
        childAgentIds: firestore.FieldValue.arrayUnion(sourceAgentId),
        updatedAt: new Date().toISOString()
      });
      
      // Automatically create the inverse supervises relationship
      const superviseRef = firestore.collection(collections.RELATIONSHIPS).doc();
      await superviseRef.set({
        sourceAgentId: targetAgentId,
        targetAgentId: sourceAgentId,
        type: 'supervises',
        userId,
        createdAt: new Date().toISOString()
      });
    }
    
    res.status(201).json({
      id: relationshipRef.id,
      ...relationship
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Delete a relationship
export const deleteRelationship = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { sourceAgentId, targetAgentId } = req.params;
    
    // Get all relationships between these agents
    const relationshipsRef = firestore.collection(collections.RELATIONSHIPS);
    const snapshot = await relationshipsRef
      .where('sourceAgentId', '==', sourceAgentId)
      .where('targetAgentId', '==', targetAgentId)
      .where('userId', '==', userId)
      .get();
      
    if (snapshot.empty) {
      res.status(404);
      throw new Error('Relationship not found');
    }
    
    // Create a batch to delete relationships and update agents
    const batch = firestore.batch();
    
    // Track if we need to update parent-child references
    let hasReportsToRelationship = false;
    
    snapshot.forEach(doc => {
      const relationship = doc.data();
      
      if (relationship.type === 'reports_to') {
        hasReportsToRelationship = true;
      }
      
      batch.delete(doc.ref);
    });
    
    // If we deleted a reports_to relationship, update parent-child references
    if (hasReportsToRelationship) {
      // Get source agent (child)
      const sourceAgentRef = firestore.collection(collections.AGENTS).doc(sourceAgentId);
      const sourceAgentDoc = await sourceAgentRef.get();
      
      if (sourceAgentDoc.exists) {
        // Remove parent reference
        batch.update(sourceAgentRef, {
          parentAgentId: null,
          updatedAt: new Date().toISOString()
        });
      }
      
      // Get target agent (parent)
      const targetAgentRef = firestore.collection(collections.AGENTS).doc(targetAgentId);
      const targetAgentDoc = await targetAgentRef.get();
      
      if (targetAgentDoc.exists) {
        // Remove child reference
        batch.update(targetAgentRef, {
          childAgentIds: firestore.FieldValue.arrayRemove(sourceAgentId),
          updatedAt: new Date().toISOString()
        });
      }
      
      // Also delete the inverse supervises relationship
      const inverseSnapshot = await firestore.collection(collections.RELATIONSHIPS)
        .where('sourceAgentId', '==', targetAgentId)
        .where('targetAgentId', '==', sourceAgentId)
        .where('type', '==', 'supervises')
        .where('userId', '==', userId)
        .get();
        
      inverseSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
    }
    
    // Commit the batch
    await batch.commit();
    
    res.json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get agent hierarchy
export const getAgentHierarchy = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { rootAgentId } = req.query;
    
    // Get all agents for this user
    const agentsRef = firestore.collection(collections.AGENTS);
    const agentsSnapshot = await agentsRef.where('userId', '==', userId).get();
    
    const agents = [];
    agentsSnapshot.forEach(doc => {
      agents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get all relationships for this user
    const relationshipsRef = firestore.collection(collections.RELATIONSHIPS);
    const relationshipsSnapshot = await relationshipsRef.where('userId', '==', userId).get();
    
    const relationships = [];
    relationshipsSnapshot.forEach(doc => {
      relationships.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Build hierarchy
    const buildHierarchy = (rootId) => {
      const agent = agents.find(a => a.id === rootId);
      if (!agent) return null;
      
      const childRelationships = relationships.filter(
        r => r.targetAgentId === rootId && r.type === 'reports_to'
      );
      
      const children = childRelationships
        .map(r => buildHierarchy(r.sourceAgentId))
        .filter(Boolean);
      
      return {
        agent,
        children,
        level: 0 // This will be adjusted in the next step
      };
    };
    
    // Calculate levels
    const calculateLevels = (node, level) => {
      node.level = level;
      
      for (const child of node.children) {
        calculateLevels(child, level + 1);
      }
      
      return node;
    };
    
    let hierarchy = [];
    
    if (rootAgentId) {
      // Build hierarchy from specific root
      const rootNode = buildHierarchy(rootAgentId);
      if (rootNode) {
        calculateLevels(rootNode, 0);
        hierarchy = [rootNode];
      }
    } else {
      // Find all root agents (no parent or not reporting to anyone)
      const rootAgents = agents.filter(agent => !agent.parentAgentId);
      
      // Build hierarchy from each root
      hierarchy = rootAgents
        .map(agent => buildHierarchy(agent.id))
        .filter(Boolean)
        .map(node => calculateLevels(node, 0));
    }
    
    res.json(hierarchy);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get agent network
export const getAgentNetwork = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { industryFilter } = req.query;
    
    // Get all agents for this user
    const agentsRef = firestore.collection(collections.AGENTS);
    let agentsQuery = agentsRef.where('userId', '==', userId);
    
    // Apply industry filter if provided
    if (industryFilter) {
      agentsQuery = agentsQuery.where('industry', '==', industryFilter);
    }
    
    const agentsSnapshot = await agentsQuery.get();
    
    const agents = [];
    agentsSnapshot.forEach(doc => {
      agents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Get all relationships for these agents
    const relationshipsRef = firestore.collection(collections.RELATIONSHIPS);
    const relationshipsSnapshot = await relationshipsRef.where('userId', '==', userId).get();
    
    const relationships = [];
    relationshipsSnapshot.forEach(doc => {
      const relationship = doc.data();
      
      // Only include relationships where both agents match the filter
      const sourceAgent = agents.find(a => a.id === relationship.sourceAgentId);
      const targetAgent = agents.find(a => a.id === relationship.targetAgentId);
      
      if (sourceAgent && targetAgent) {
        relationships.push({
          id: doc.id,
          ...relationship
        });
      }
    });
    
    // Build network data
    const nodes = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      industry: agent.industry,
      role: agent.role,
      active: agent.active,
      deployed: agent.deployed,
      template: agent.template,
      capabilities: agent.capabilities || []
    }));
    
    const edges = relationships.map(relationship => ({
      source: relationship.sourceAgentId,
      target: relationship.targetAgentId,
      type: relationship.type
    }));
    
    res.json({
      nodes,
      edges
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};