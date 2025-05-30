import { firestore, collections } from '../config/db.js';
import { AGENT_STATES, AGENT_ROLE_LEVELS, RELATIONSHIP_TYPES } from '../config/agent.js';

// Get all blueprints
export const getBlueprints = async (req, res) => {
  try {
    // This endpoint can be public, so no auth check required
    // For demo, we'll return static data from an industry vertical blueprint
    // In a real implementation, this would fetch from Firestore
    
    const blueprints = [
      {
        id: 'real-estate-hierarchy',
        name: 'Real Estate Agency',
        industryId: 'real-estate',
        description: 'Complete hierarchy for real estate operations including property management and client relations',
        roles: [
          {
            id: 're-executive-director',
            name: 'Real Estate Executive Director',
            level: 'executive',
            responsibilities: [
              'Strategic oversight of all real estate operations',
              'Resource allocation across departments',
              'Performance monitoring and optimization',
              'Strategic market positioning'
            ]
          },
          {
            id: 're-listing-manager',
            name: 'Listing Department Manager',
            level: 'management',
            reportsTo: 're-executive-director',
            responsibilities: [
              'Oversee property listing creation and management',
              'Coordinate listing team activities',
              'Ensure listing quality and optimization',
              'Monitor market trends for listing strategy'
            ]
          },
          // More roles would be here
        ]
      },
      // More blueprints would be here
    ];
    
    res.json(blueprints);
  } catch (error) {
    res.status(500);
    throw new Error('Server error: ' + error.message);
  }
};

// Get blueprint by ID
export const getBlueprintById = async (req, res) => {
  try {
    const blueprintId = req.params.id;
    
    // In a real implementation, this would fetch from Firestore
    // For demo, we'll return static data
    
    const blueprint = {
      id: blueprintId,
      name: 'Real Estate Agency',
      industryId: 'real-estate',
      description: 'Complete hierarchy for real estate operations including property management and client relations',
      roles: [
        {
          id: 're-executive-director',
          name: 'Real Estate Executive Director',
          level: 'executive',
          responsibilities: [
            'Strategic oversight of all real estate operations',
            'Resource allocation across departments',
            'Performance monitoring and optimization',
            'Strategic market positioning'
          ]
        },
        {
          id: 're-listing-manager',
          name: 'Listing Department Manager',
          level: 'management',
          reportsTo: 're-executive-director',
          responsibilities: [
            'Oversee property listing creation and management',
            'Coordinate listing team activities',
            'Ensure listing quality and optimization',
            'Monitor market trends for listing strategy'
          ]
        },
        // More roles would be here
      ]
    };
    
    if (!blueprint) {
      res.status(404);
      throw new Error('Blueprint not found');
    }
    
    res.json(blueprint);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Get blueprints by industry
export const getBlueprintsByIndustry = async (req, res) => {
  try {
    const industryId = req.params.industryId;
    
    // In a real implementation, this would fetch from Firestore
    // For demo, we'll return static data filtered by industry
    
    if (industryId !== 'real-estate') {
      // For demo purposes, just return empty array for non-real-estate
      return res.json([]);
    }
    
    const blueprints = [
      {
        id: 'real-estate-hierarchy',
        name: 'Real Estate Agency',
        industryId: 'real-estate',
        description: 'Complete hierarchy for real estate operations including property management and client relations',
        roles: [
          {
            id: 're-executive-director',
            name: 'Real Estate Executive Director',
            level: 'executive',
            responsibilities: [
              'Strategic oversight of all real estate operations',
              'Resource allocation across departments',
              'Performance monitoring and optimization',
              'Strategic market positioning'
            ]
          },
          {
            id: 're-listing-manager',
            name: 'Listing Department Manager',
            level: 'management',
            reportsTo: 're-executive-director',
            responsibilities: [
              'Oversee property listing creation and management',
              'Coordinate listing team activities',
              'Ensure listing quality and optimization',
              'Monitor market trends for listing strategy'
            ]
          },
          // More roles would be here
        ]
      }
    ];
    
    res.json(blueprints);
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Deploy a blueprint (create multiple agents from a blueprint)
export const deployBlueprint = async (req, res) => {
  try {
    const userId = req.user.sub;
    const blueprintId = req.params.id;
    const { selectedRoles = [] } = req.body;
    
    // Get the blueprint
    // In a real implementation, this would fetch from Firestore
    // For demo, we'll use static data
    
    // Mock blueprint fetch
    const blueprint = {
      id: blueprintId,
      name: 'Real Estate Agency',
      industryId: 'real-estate',
      description: 'Complete hierarchy for real estate operations',
      roles: [
        {
          id: 're-executive-director',
          name: 'Real Estate Executive Director',
          level: 'executive',
          responsibilities: [
            'Strategic oversight of all real estate operations',
            'Resource allocation across departments'
          ]
        },
        {
          id: 're-listing-manager',
          name: 'Listing Department Manager',
          level: 'management',
          reportsTo: 're-executive-director',
          responsibilities: [
            'Oversee property listing creation and management',
            'Coordinate listing team activities'
          ]
        },
        {
          id: 're-content-creator',
          name: 'Property Content Creator',
          level: 'operational',
          reportsTo: 're-listing-manager',
          responsibilities: [
            'Create compelling property descriptions',
            'Optimize listing content for search'
          ]
        }
      ]
    };
    
    if (!blueprint) {
      res.status(404);
      throw new Error('Blueprint not found');
    }
    
    // Filter roles if selected roles provided
    const rolesToDeploy = selectedRoles.length > 0
      ? blueprint.roles.filter(role => selectedRoles.includes(role.id))
      : blueprint.roles;
    
    if (rolesToDeploy.length === 0) {
      res.status(400);
      throw new Error('No roles selected for deployment');
    }
    
    // Check agent limit for free users
    if (!req.user.hasSubscription) {
      const agentsRef = firestore.collection(collections.AGENTS);
      const snapshot = await agentsRef.where('userId', '==', userId).get();
      
      if (snapshot.size + rolesToDeploy.length > 3) {
        res.status(403);
        throw new Error(`Free tier limited to 3 agents. This blueprint would create ${rolesToDeploy.length} agents. Please upgrade to deploy this blueprint.`);
      }
    }
    
    // Create batch for transaction
    const batch = firestore.batch();
    
    // Track created agents to establish relationships later
    const createdAgents = {};
    
    // First pass: create agents
    for (const role of rolesToDeploy) {
      const agentRef = firestore.collection(collections.AGENTS).doc();
      const agentId = agentRef.id;
      
      const newAgent = {
        name: role.name,
        description: `${role.name} from ${blueprint.name} blueprint`,
        industry: blueprint.industryId,
        template: role.id,
        role: role.level,
        active: false,
        deployed: false,
        status: AGENT_STATES.CREATED,
        createdAt: new Date().toISOString(),
        lastDeployed: null,
        parentAgentId: null, // Will be set in second pass
        userId,
        capabilities: [], // Would be derived from role in real implementation
        fromBlueprint: blueprintId,
        responsibilities: role.responsibilities
      };
      
      batch.set(agentRef, newAgent);
      
      // Store reference for relationship creation
      createdAgents[role.id] = {
        id: agentId,
        roleData: role
      };
    }
    
    // Second pass: establish relationships
    for (const roleId in createdAgents) {
      const { id: agentId, roleData } = createdAgents[roleId];
      
      // If this role reports to another role that was deployed
      if (roleData.reportsTo && createdAgents[roleData.reportsTo]) {
        const parentAgentId = createdAgents[roleData.reportsTo].id;
        
        // Update agent with parent reference
        const agentRef = firestore.collection(collections.AGENTS).doc(agentId);
        batch.update(agentRef, {
          parentAgentId
        });
        
        // Create reports_to relationship
        const reportsToRef = firestore.collection(collections.RELATIONSHIPS).doc();
        batch.set(reportsToRef, {
          sourceAgentId: agentId,
          targetAgentId: parentAgentId,
          type: 'reports_to',
          userId,
          createdAt: new Date().toISOString()
        });
        
        // Create supervises relationship
        const supervisesRef = firestore.collection(collections.RELATIONSHIPS).doc();
        batch.set(supervisesRef, {
          sourceAgentId: parentAgentId,
          targetAgentId: agentId,
          type: 'supervises',
          userId,
          createdAt: new Date().toISOString()
        });
      }
    }
    
    // Commit the batch
    await batch.commit();
    
    res.status(201).json({
      message: `Successfully deployed ${rolesToDeploy.length} agents from blueprint`,
      agents: Object.values(createdAgents).map(a => ({
        id: a.id,
        name: a.roleData.name,
        role: a.roleData.level
      }))
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Create a custom blueprint
export const createBlueprint = async (req, res) => {
  try {
    const userId = req.user.sub;
    const { name, industryId, description, roles } = req.body;
    
    // Validate required fields
    if (!name || !industryId || !roles || !Array.isArray(roles) || roles.length === 0) {
      res.status(400);
      throw new Error('Please provide name, industryId, and roles array');
    }
    
    // Validate roles
    for (const role of roles) {
      if (!role.name || !role.level) {
        res.status(400);
        throw new Error('Each role must have a name and level');
      }
      
      if (!AGENT_ROLE_LEVELS.includes(role.level)) {
        res.status(400);
        throw new Error(`Invalid role level. Must be one of: ${AGENT_ROLE_LEVELS.join(', ')}`);
      }
    }
    
    // Create blueprint
    const blueprintRef = firestore.collection(collections.BLUEPRINTS).doc();
    const blueprint = {
      name,
      industryId,
      description: description || `Custom blueprint for ${industryId}`,
      roles,
      userId,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await blueprintRef.set(blueprint);
    
    res.status(201).json({
      id: blueprintRef.id,
      ...blueprint
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Update a blueprint
export const updateBlueprint = async (req, res) => {
  try {
    const userId = req.user.sub;
    const blueprintId = req.params.id;
    const { name, description, roles } = req.body;
    
    // Check if blueprint exists and belongs to user
    const blueprintRef = firestore.collection(collections.BLUEPRINTS).doc(blueprintId);
    const doc = await blueprintRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Blueprint not found');
    }
    
    const blueprint = doc.data();
    
    // Check if blueprint belongs to user
    if (blueprint.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to update this blueprint');
    }
    
    // Validate roles if provided
    if (roles) {
      if (!Array.isArray(roles) || roles.length === 0) {
        res.status(400);
        throw new Error('Roles must be a non-empty array');
      }
      
      for (const role of roles) {
        if (!role.name || !role.level) {
          res.status(400);
          throw new Error('Each role must have a name and level');
        }
        
        if (!AGENT_ROLE_LEVELS.includes(role.level)) {
          res.status(400);
          throw new Error(`Invalid role level. Must be one of: ${AGENT_ROLE_LEVELS.join(', ')}`);
        }
      }
    }
    
    // Update blueprint
    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...(roles && { roles }),
      updatedAt: new Date().toISOString()
    };
    
    await blueprintRef.update(updateData);
    
    // Get updated blueprint
    const updatedDoc = await blueprintRef.get();
    
    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};

// Delete a blueprint
export const deleteBlueprint = async (req, res) => {
  try {
    const userId = req.user.sub;
    const blueprintId = req.params.id;
    
    // Check if blueprint exists and belongs to user
    const blueprintRef = firestore.collection(collections.BLUEPRINTS).doc(blueprintId);
    const doc = await blueprintRef.get();
    
    if (!doc.exists) {
      res.status(404);
      throw new Error('Blueprint not found');
    }
    
    const blueprint = doc.data();
    
    // Check if blueprint belongs to user
    if (blueprint.userId !== userId) {
      res.status(403);
      throw new Error('Not authorized to delete this blueprint');
    }
    
    // Only allow deleting custom blueprints
    if (!blueprint.isCustom) {
      res.status(403);
      throw new Error('Cannot delete system blueprints');
    }
    
    // Delete blueprint
    await blueprintRef.delete();
    
    res.json({ message: 'Blueprint deleted successfully' });
  } catch (error) {
    res.status(res.statusCode === 200 ? 500 : res.statusCode);
    throw new Error(error.message);
  }
};