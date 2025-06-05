import axios from 'axios';
import { auth } from '../config/firebase';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // User related endpoints
  user: {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (data: any) => api.put('/user/profile', data),
    getSettings: () => api.get('/user/settings'),
    updateSettings: (data: any) => api.put('/user/settings', data),
  },

  // Chat related endpoints
  chat: {
    getHistory: () => api.get('/chat/history'),
    sendMessage: (message: string) => api.post('/chat/message', { message }),
    getAgents: () => api.get('/chat/agents'),
  },

  // Agent related endpoints
  agent: {
    getStatus: (agentId: string) => api.get(`/agent/${agentId}/status`),
    startSession: (agentId: string) => api.post(`/agent/${agentId}/session`),
    endSession: (agentId: string) => api.delete(`/agent/${agentId}/session`),
  },
};

export default apiService; 