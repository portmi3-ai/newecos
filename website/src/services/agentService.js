// Simple mock service for agent management

// Simulate database of agents
let mockAgents = [
  {
    id: 'agent-1',
    name: 'Executive Director',
    description: 'Oversees the entire agent ecosystem with strategic planning and resource allocation.',
    industry: 'real-estate',
    template: 're-executive',
    role: 'executive',
    active: true,
    deployed: true,
    createdAt: '2025-05-20T10:00:00Z',
    lastDeployed: '2025-05-22T14:30:00Z',
  },
  {
    id: 'agent-2',
    name: 'Listing Manager',
    description: 'Manages property listings and coordinates listing team activities.',
    industry: 'real-estate',
    template: 're-listing-manager',
    role: 'management',
    active: true,
    deployed: true,
    createdAt: '2025-05-20T11:00:00Z',
    lastDeployed: '2025-05-22T15:00:00Z',
    parentAgentId: 'agent-1'
  },
  {
    id: 'agent-3',
    name: 'Property Content Creator',
    description: 'Creates compelling property descriptions and optimizes listing content.',
    industry: 'real-estate',
    template: 're-content-creator',
    role: 'operational',
    active: false,
    deployed: false,
    createdAt: '2025-05-21T09:00:00Z',
    lastDeployed: null,
    parentAgentId: 'agent-2'
  }
];

// Simulate database of relationships
let mockRelationships = [
  {
    sourceAgentId: 'agent-2',
    targetAgentId: 'agent-1',
    type: 'reports_to'
  },
  {
    sourceAgentId: 'agent-1',
    targetAgentId: 'agent-2',
    type: 'supervises'
  },
  {
    sourceAgentId: 'agent-3',
    targetAgentId: 'agent-2',
    type: 'reports_to'
  },
  {
    sourceAgentId: 'agent-2',
    targetAgentId: 'agent-3',
    type: 'supervises'
  }
];

// Helper function to generate unique ID
const generateId = () => {
  return 'agent-' + Math.random().toString(36).substring(2, 9);
};

// Get all agents
export const getAgents = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...mockAgents];
};

// Get agent by ID
export const getAgentById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const agent = mockAgents.find(a => a.id === id);
  
  if (!agent) {
    throw new Error(`Agent ${id} not found`);
  }
  
  return {...agent};
};

// Create a new agent
export const createAgent = async (agentData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const id = generateId();
  
  const newAgent = {
    id,
    ...agentData,
    active: false,
    deployed: false,
    createdAt: new Date().toISOString(),
    lastDeployed: null
  };
  
  mockAgents.push(newAgent);
  
  // If parent agent is specified, create relationship
  if (agentData.parentAgentId) {
    // Create reports_to relationship
    mockRelationships.push({
      sourceAgentId: id,
      targetAgentId: agentData.parentAgentId,
      type: 'reports_to'
    });
    
    // Create supervises relationship
    mockRelationships.push({
      sourceAgentId: agentData.parentAgentId,
      targetAgentId: id,
      type: 'supervises'
    });
  }
  
  return {...newAgent};
};

// Update an agent
export const updateAgent = async (id, agentData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const index = mockAgents.findIndex(a => a.id === id);
  
  if (index === -1) {
    throw new Error(`Agent ${id} not found`);
  }
  
  // Handle parent agent changes
  if (agentData.parentAgentId !== undefined && 
      agentData.parentAgentId !== mockAgents[index].parentAgentId) {
    
    // Remove old relationships if there was a parent
    if (mockAgents[index].parentAgentId) {
      mockRelationships = mockRelationships.filter(r => 
        !(r.sourceAgentId === id && r.targetAgentId === mockAgents[index].parentAgentId) &&
        !(r.sourceAgentId === mockAgents[index].parentAgentId && r.targetAgentId === id)
      );
    }
    
    // Add new relationships if there is a new parent
    if (agentData.parentAgentId) {
      // Create reports_to relationship
      mockRelationships.push({
        sourceAgentId: id,
        targetAgentId: agentData.parentAgentId,
        type: 'reports_to'
      });
      
      // Create supervises relationship
      mockRelationships.push({
        sourceAgentId: agentData.parentAgentId,
        targetAgentId: id,
        type: 'supervises'
      });
    }
  }
  
  // Update agent
  mockAgents[index] = {
    ...mockAgents[index],
    ...agentData,
    updatedAt: new Date().toISOString()
  };
  
  return {...mockAgents[index]};
};

// Delete an agent
export const deleteAgent = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const index = mockAgents.findIndex(a => a.id === id);
  
  if (index === -1) {
    throw new Error(`Agent ${id} not found`);
  }
  
  // Remove the agent
  mockAgents = mockAgents.filter(a => a.id !== id);
  
  // Remove all relationships involving this agent
  mockRelationships = mockRelationships.filter(r => 
    r.sourceAgentId !== id && r.targetAgentId !== id
  );
  
  return { message: 'Agent deleted successfully' };
};

// Deploy an agent
export const deployAgent = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const index = mockAgents.findIndex(a => a.id === id);
  
  if (index === -1) {
    throw new Error(`Agent ${id} not found`);
  }
  
  // Update agent
  mockAgents[index] = {
    ...mockAgents[index],
    deployed: true,
    active: true,
    lastDeployed: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return { message: 'Agent deployed successfully' };
};

// Toggle agent status (active/inactive)
export const toggleAgentStatus = async (id, active) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const index = mockAgents.findIndex(a => a.id === id);
  
  if (index === -1) {
    throw new Error(`Agent ${id} not found`);
  }
  
  // Update agent
  mockAgents[index] = {
    ...mockAgents[index],
    active,
    updatedAt: new Date().toISOString()
  };
  
  return { 
    id, 
    active,
    message: `Agent ${active ? 'activated' : 'deactivated'} successfully` 
  };
};

// Get agent relationships
export const getAgentRelationships = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [...mockRelationships];
};

// Create a new relationship
export const createAgentRelationship = async (relationship) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if both agents exist
  const sourceAgent = mockAgents.find(a => a.id === relationship.sourceAgentId);
  const targetAgent = mockAgents.find(a => a.id === relationship.targetAgentId);
  
  if (!sourceAgent || !targetAgent) {
    throw new Error('Source or target agent not found');
  }
  
  // Check for circular relationships
  if (relationship.type === 'reports_to') {
    const hasCircular = mockRelationships.some(r => 
      r.sourceAgentId === relationship.targetAgentId && 
      r.targetAgentId === relationship.sourceAgentId &&
      r.type === 'reports_to'
    );
    
    if (hasCircular) {
      throw new Error('This would create a circular reporting relationship');
    }
  }
  
  // Check if relationship already exists
  const exists = mockRelationships.some(r => 
    r.sourceAgentId === relationship.sourceAgentId &&
    r.targetAgentId === relationship.targetAgentId &&
    r.type === relationship.type
  );
  
  if (exists) {
    throw new Error('Relationship already exists');
  }
  
  // Add relationship
  mockRelationships.push({...relationship});
  
  // If this is a reports_to relationship, update agent's parentAgentId
  if (relationship.type === 'reports_to') {
    const index = mockAgents.findIndex(a => a.id === relationship.sourceAgentId);
    if (index !== -1) {
      mockAgents[index].parentAgentId = relationship.targetAgentId;
    }
  }
  
  return {...relationship};
};

// Delete a relationship
export const deleteAgentRelationship = async (sourceAgentId, targetAgentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if relationship exists
  const relationshipsToRemove = mockRelationships.filter(r => 
    (r.sourceAgentId === sourceAgentId && r.targetAgentId === targetAgentId) ||
    (r.sourceAgentId === targetAgentId && r.targetAgentId === sourceAgentId)
  );
  
  if (relationshipsToRemove.length === 0) {
    throw new Error('Relationship not found');
  }
  
  // Remove relationships
  mockRelationships = mockRelationships.filter(r => 
    !((r.sourceAgentId === sourceAgentId && r.targetAgentId === targetAgentId) ||
      (r.sourceAgentId === targetAgentId && r.targetAgentId === sourceAgentId))
  );
  
  // If this was a reports_to/supervises relationship, update agent's parentAgentId
  const reportToRel = relationshipsToRemove.find(r => r.type === 'reports_to');
  if (reportToRel) {
    const childIndex = mockAgents.findIndex(a => a.id === reportToRel.sourceAgentId);
    if (childIndex !== -1) {
      mockAgents[childIndex].parentAgentId = undefined;
    }
  }
  
  return { message: 'Relationship deleted successfully' };
};

// Get agent hierarchy
export const getAgentHierarchy = async (rootAgentId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  // Build hierarchy
  const buildHierarchy = (rootId) => {
    const agent = mockAgents.find(a => a.id === rootId);
    if (!agent) return null;
    
    const childRelationships = mockRelationships.filter(
      r => r.targetAgentId === rootId && r.type === 'reports_to'
    );
    
    const children = childRelationships
      .map(r => buildHierarchy(r.sourceAgentId))
      .filter(Boolean);
    
    return {
      agent,
      children,
      level: 0 // Will be adjusted in the next step
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
    // Find all root agents (no parent)
    const rootAgents = mockAgents.filter(agent => !agent.parentAgentId);
    
    // Build hierarchy from each root
    hierarchy = rootAgents
      .map(agent => buildHierarchy(agent.id))
      .filter(Boolean)
      .map(node => calculateLevels(node, 0));
  }
  
  return hierarchy;
};

// Get ecosystem metrics
export const getEcosystemMetrics = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Calculate industry distribution
  const industryDistribution = {};
  mockAgents.forEach(agent => {
    if (!industryDistribution[agent.industry]) {
      industryDistribution[agent.industry] = 0;
    }
    industryDistribution[agent.industry]++;
  });
  
  // Calculate hierarchy depth
  const calculateHierarchyDepth = () => {
    // Build parent-child map
    const parentChildMap = {};
    
    mockRelationships
      .filter(r => r.type === 'reports_to')
      .forEach(r => {
        if (!parentChildMap[r.targetAgentId]) {
          parentChildMap[r.targetAgentId] = [];
        }
        parentChildMap[r.targetAgentId].push(r.sourceAgentId);
      });
    
    // Find root agents (no parents)
    const rootAgents = mockAgents.filter(agent => !agent.parentAgentId);
    
    // Calculate depth for each root
    const calculateDepth = (agentId, depth) => {
      const children = parentChildMap[agentId] || [];
      
      if (children.length === 0) {
        return depth;
      }
      
      return Math.max(...children.map(childId => calculateDepth(childId, depth + 1)));
    };
    
    if (rootAgents.length === 0) {
      return 0;
    }
    
    return Math.max(...rootAgents.map(agent => calculateDepth(agent.id, 1)));
  };
  
  const hierarchyDepth = calculateHierarchyDepth();
  
  // In a real implementation, agent interactions would be tracked in a separate collection
  // For demo, we'll use relationship count * 10 as a proxy
  const agentInteractions = mockRelationships.length * 10;
  
  const metrics = {
    totalAgents: mockAgents.length,
    activeAgents: mockAgents.filter(a => a.active).length,
    deployedAgents: mockAgents.filter(a => a.deployed).length,
    industryDistribution,
    hierarchyDepth,
    agentInteractions
  };
  
  return metrics;
};

// Clear all caches when needed (like after logout)
export const clearAllCaches = () => {
  console.log('Caches cleared');
};