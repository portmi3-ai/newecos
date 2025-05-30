// Service for agent deployments that connects to the backend API

// Base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || '';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }
  return response.json();
};

// Helper function to get the auth token
const getAuthToken = () => {
  // In a real implementation, this would get the token from localStorage or context
  const user = localStorage.getItem('user');
  if (!user) return null;
  
  try {
    const userData = JSON.parse(user);
    return userData.token;
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

// Helper function for API requests with authentication
const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });
  
  return handleResponse(response);
};

// Simulate database of deployments (for fallback)
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

// Get all deployments
export const getDeployments = async () => {
  try {
    return await fetchWithAuth('/api/deployments');
  } catch (error) {
    console.error('Failed to fetch deployments from API, using fallback:', error);
    // Fallback to mock data
    return [...mockDeployments];
  }
};

// Get deployment by ID
export const getDeploymentById = async (id) => {
  try {
    return await fetchWithAuth(`/api/deployments/${id}`);
  } catch (error) {
    console.error(`Failed to fetch deployment ${id} from API, using fallback:`, error);
    // Fallback to mock data
    const deployment = mockDeployments.find(d => d.id === id);
    
    if (!deployment) {
      throw new Error(`Deployment ${id} not found`);
    }
    
    return {...deployment};
  }
};

// Get deployment status
export const getDeploymentStatus = async (id) => {
  try {
    return await fetchWithAuth(`/api/deployments/${id}/status`);
  } catch (error) {
    console.error(`Failed to fetch deployment status ${id} from API, using fallback:`, error);
    
    // Fallback to mock data
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
  }
};

// Get deployment logs
export const getDeploymentLogs = async (id) => {
  try {
    return await fetchWithAuth(`/api/deployments/${id}/logs`);
  } catch (error) {
    console.error(`Failed to fetch deployment logs ${id} from API, using fallback:`, error);
    
    // Fallback to mock data
    const deployment = mockDeployments.find(d => d.id === id);
    
    if (!deployment) {
      throw new Error(`Deployment ${id} not found`);
    }
    
    return {
      logs: deployment.logs
    };
  }
};

export default {
  getDeployments,
  getDeploymentById,
  getDeploymentStatus,
  getDeploymentLogs
};