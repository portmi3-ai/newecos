// Mock service for deployments

// Simulate database of deployments
let mockDeployments = [
  {
    id: 'deployment-1',
    agentId: 'agent-1',
    status: 'deployed',
    createdAt: '2025-05-22T10:00:00Z',
    updatedAt: '2025-05-22T10:15:00Z',
    config: {
      serviceType: 'serverless',
      instanceSize: 'small',
      autoScaling: true,
      minInstances: 0,
      maxInstances: 10,
      environmentVariables: {}
    },
    serviceUrl: 'https://agent-1.mport.ai',
    logs: [
      { timestamp: '2025-05-22T10:00:00Z', message: 'Deployment initiated', level: 'info' },
      { timestamp: '2025-05-22T10:05:00Z', message: 'Building container image', level: 'info' },
      { timestamp: '2025-05-22T10:10:00Z', message: 'Pushing to container registry', level: 'info' },
      { timestamp: '2025-05-22T10:12:00Z', message: 'Deploying to cloud service', level: 'info' },
      { timestamp: '2025-05-22T10:15:00Z', message: 'Deployment completed successfully', level: 'info' }
    ]
  },
  {
    id: 'deployment-2',
    agentId: 'agent-2',
    status: 'deployed',
    createdAt: '2025-05-22T11:00:00Z',
    updatedAt: '2025-05-22T11:12:00Z',
    config: {
      serviceType: 'serverless',
      instanceSize: 'small',
      autoScaling: true,
      minInstances: 0,
      maxInstances: 10,
      environmentVariables: {}
    },
    serviceUrl: 'https://agent-2.mport.ai',
    logs: [
      { timestamp: '2025-05-22T11:00:00Z', message: 'Deployment initiated', level: 'info' },
      { timestamp: '2025-05-22T11:04:00Z', message: 'Building container image', level: 'info' },
      { timestamp: '2025-05-22T11:08:00Z', message: 'Pushing to container registry', level: 'info' },
      { timestamp: '2025-05-22T11:10:00Z', message: 'Deploying to cloud service', level: 'info' },
      { timestamp: '2025-05-22T11:12:00Z', message: 'Deployment completed successfully', level: 'info' }
    ]
  }
];

// Helper function to generate unique ID
const generateId = () => {
  return 'deployment-' + Math.random().toString(36).substring(2, 9);
};

// Get all deployments
export const getDeployments = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [...mockDeployments];
};

// Get deployment by ID
export const getDeploymentById = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const deployment = mockDeployments.find(d => d.id === id);
  
  if (!deployment) {
    throw new Error(`Deployment ${id} not found`);
  }
  
  return {...deployment};
};

// Deploy an agent
export const deployAgent = async (agentId, config = {}) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const id = generateId();
  
  const defaultConfig = {
    serviceType: 'serverless',
    instanceSize: 'small',
    autoScaling: true,
    minInstances: 0,
    maxInstances: 10,
    environmentVariables: {}
  };
  
  const deploymentConfig = {
    ...defaultConfig,
    ...config
  };
  
  const now = new Date().toISOString();
  
  const newDeployment = {
    id,
    agentId,
    status: 'deploying',
    createdAt: now,
    updatedAt: now,
    config: deploymentConfig,
    logs: [
      { timestamp: now, message: 'Deployment initiated', level: 'info' }
    ]
  };
  
  mockDeployments.push(newDeployment);
  
  // Simulate deployment process
  setTimeout(() => {
    const index = mockDeployments.findIndex(d => d.id === id);
    
    if (index !== -1) {
      const currentTime = new Date().toISOString();
      
      mockDeployments[index] = {
        ...mockDeployments[index],
        status: 'deployed',
        serviceUrl: `https://agent-${agentId}.mport.ai`,
        updatedAt: currentTime,
        logs: [
          ...mockDeployments[index].logs,
          { timestamp: new Date(Date.now() - 8000).toISOString(), message: 'Building container image', level: 'info' },
          { timestamp: new Date(Date.now() - 5000).toISOString(), message: 'Pushing to container registry', level: 'info' },
          { timestamp: new Date(Date.now() - 2000).toISOString(), message: 'Deploying to cloud service', level: 'info' },
          { timestamp: currentTime, message: 'Deployment completed successfully', level: 'info' }
        ]
      };
    }
  }, 10000);
  
  return { id, message: 'Deployment initiated' };
};

// Get deployment status
export const getDeploymentStatus = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const deployment = mockDeployments.find(d => d.id === id);
  
  if (!deployment) {
    throw new Error(`Deployment ${id} not found`);
  }
  
  return {
    id: deployment.id,
    status: deployment.status,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt,
    serviceUrl: deployment.serviceUrl,
    agent: {
      id: deployment.agentId,
      status: deployment.status
    }
  };
};

// Get deployment logs
export const getDeploymentLogs = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const deployment = mockDeployments.find(d => d.id === id);
  
  if (!deployment) {
    throw new Error(`Deployment ${id} not found`);
  }
  
  return {
    logs: deployment.logs
  };
};

// Update deployment configuration
export const updateDeploymentConfiguration = async (id, config) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockDeployments.findIndex(d => d.id === id);
  
  if (index === -1) {
    throw new Error(`Deployment ${id} not found`);
  }
  
  // Update configuration
  mockDeployments[index] = {
    ...mockDeployments[index],
    config: {
      ...mockDeployments[index].config,
      ...config
    },
    updatedAt: new Date().toISOString(),
    logs: [
      ...mockDeployments[index].logs,
      { timestamp: new Date().toISOString(), message: 'Configuration updated', level: 'info' }
    ]
  };
  
  return { 
    id,
    config: mockDeployments[index].config,
    message: 'Deployment configuration updated successfully'
  };
};

// Delete deployment
export const deleteDeployment = async (id) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockDeployments.findIndex(d => d.id === id);
  
  if (index === -1) {
    throw new Error(`Deployment ${id} not found`);
  }
  
  // Remove deployment
  mockDeployments = mockDeployments.filter(d => d.id !== id);
  
  return { message: 'Deployment deleted successfully' };
};