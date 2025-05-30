// Mock service for blueprints

import { verticalBlueprints } from '../data/verticalBlueprints';
import { generateId } from '../utils/helpers';

// Get all blueprints
export const getBlueprints = async () => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return verticalBlueprints;
  } catch (error) {
    console.error('Error fetching blueprints:', error);
    throw error;
  }
};

// Get blueprint by ID
export const getBlueprintById = async (id) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const blueprintIndustry = id.split('-')[0];
    const blueprint = verticalBlueprints.find(b => b.industryId === blueprintIndustry);
    
    if (!blueprint) {
      throw new Error(`Blueprint with ID ${id} not found`);
    }
    
    return blueprint;
  } catch (error) {
    console.error(`Error fetching blueprint ${id}:`, error);
    throw error;
  }
};

// Get blueprints by industry
export const getBlueprintsByIndustry = async (industryId) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const blueprints = verticalBlueprints.filter(b => b.industryId === industryId);
    
    return blueprints;
  } catch (error) {
    console.error(`Error fetching blueprints for industry ${industryId}:`, error);
    throw error;
  }
};

// Deploy a blueprint (create agents from blueprint)
export const deployBlueprint = async (id, selectedRoles) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const blueprintIndustry = id.split('-')[0];
    const blueprint = verticalBlueprints.find(b => b.industryId === blueprintIndustry);
    
    if (!blueprint) {
      throw new Error(`Blueprint with ID ${id} not found`);
    }
    
    // Filter roles if selected roles provided
    const rolesToDeploy = selectedRoles.length > 0
      ? blueprint.roles.filter(role => selectedRoles.includes(role.id))
      : blueprint.roles;
    
    if (rolesToDeploy.length === 0) {
      throw new Error('No roles selected for deployment');
    }
    
    // Create agent objects (in a real implementation, these would be created in a database)
    const createdAgents = {};
    
    // First pass: create agents
    for (const role of rolesToDeploy) {
      const agentId = generateId();
      
      createdAgents[role.id] = {
        id: agentId,
        roleData: role,
        agent: {
          id: agentId,
          name: role.name,
          description: `${role.name} from ${blueprint.industryId} blueprint`,
          industry: blueprint.industryId,
          template: role.id,
          role: role.level,
          active: false,
          deployed: false,
          createdAt: new Date().toISOString(),
          lastDeployed: null,
          parentAgentId: null,
          responsibilities: role.responsibilities
        }
      };
    }
    
    // Second pass: establish relationships
    for (const roleId in createdAgents) {
      const { id: agentId, roleData } = createdAgents[roleId];
      
      // If this role reports to another role that was deployed
      if (roleData.reportsTo && createdAgents[roleData.reportsTo]) {
        const parentAgentId = createdAgents[roleData.reportsTo].id;
        
        // Update agent with parent reference
        createdAgents[roleId].agent.parentAgentId = parentAgentId;
      }
    }
    
    return {
      message: `Successfully deployed ${rolesToDeploy.length} agents from blueprint`,
      agents: Object.values(createdAgents).map(a => ({
        id: a.id,
        name: a.roleData.name,
        role: a.roleData.level
      }))
    };
  } catch (error) {
    console.error(`Error deploying blueprint ${id}:`, error);
    throw error;
  }
};

// Create a custom blueprint
export const createBlueprint = async (blueprintData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const id = generateId();
    
    const newBlueprint = {
      id,
      ...blueprintData,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real implementation, this would save to a database
    console.log('Created new blueprint:', newBlueprint);
    
    return newBlueprint;
  } catch (error) {
    console.error('Error creating blueprint:', error);
    throw error;
  }
};

// Update a blueprint
export const updateBlueprint = async (id, blueprintData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // In a real implementation, this would update a database record
    console.log('Updated blueprint:', id, blueprintData);
    
    return {
      id,
      ...blueprintData,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error updating blueprint ${id}:`, error);
    throw error;
  }
};

// Delete a blueprint
export const deleteBlueprint = async (id) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would delete from a database
    console.log('Deleted blueprint:', id);
    
    return { message: 'Blueprint deleted successfully' };
  } catch (error) {
    console.error(`Error deleting blueprint ${id}:`, error);
    throw error;
  }
};