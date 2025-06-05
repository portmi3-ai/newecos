import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'deploying';
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    capabilities?: string[];
    preferences?: Record<string, any>;
  };
  metrics: {
    messagesProcessed: number;
    averageResponseTime: number;
    lastActive: string;
    successRate?: number;
    usageCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  metadata?: {
    tokens?: number;
    processingTime?: number;
    mode?: string;
    sessionId?: string;
  };
}

class AgentService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async getAgentById(id: string): Promise<Agent> {
    const response = await this.api.get(`/agents/${id}`);
    return response.data;
  }

  async getAllAgents(): Promise<Agent[]> {
    const response = await this.api.get('/agents');
    return response.data;
  }

  async createAgent(data: Partial<Agent>): Promise<Agent> {
    const response = await this.api.post('/agents', data);
    return response.data;
  }

  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    const response = await this.api.patch(`/agents/${id}`, data);
    return response.data;
  }

  async deleteAgent(id: string): Promise<void> {
    await this.api.delete(`/agents/${id}`);
  }

  async deployAgent(id: string): Promise<void> {
    await this.api.post(`/agents/${id}/deploy`);
  }

  async getSashaStatus(): Promise<any> {
    const response = await this.api.get('/sasha/status');
    return response.data;
  }

  async sendSashaMessage(content: string, sessionId?: string, mode: string = 'default'): Promise<AgentMessage> {
    const response = await this.api.post('/sasha/messages', { content, sessionId, mode });
    return response.data;
  }

  async clearSashaConversation(sessionId: string): Promise<void> {
    await this.api.delete(`/sasha/conversations/${sessionId}`);
  }

  async checkSashaHealth(): Promise<boolean> {
    try {
      const response = await this.api.get('/sasha/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getSashaCapabilities(): Promise<string[]> {
    const response = await this.api.get('/sasha/capabilities');
    return response.data;
  }

  async updateSashaConfig(config: Partial<Agent['config']>): Promise<Agent> {
    const response = await this.api.patch('/sasha/config', config);
    return response.data;
  }

  async getAgentMessages(agentId: string): Promise<AgentMessage[]> {
    const response = await this.api.get(`/agents/${agentId}/messages`);
    return response.data;
  }

  async getAgentMetrics(agentId: string): Promise<any> {
    const response = await this.api.get(`/agents/${agentId}/metrics`);
    return response.data;
  }

  async getAgentRelationships(agentId: string): Promise<any[]> {
    const response = await this.api.get(`/agents/${agentId}/relationships`);
    return response.data;
  }

  // WebSocket connection for real-time updates
  subscribeToAgentUpdates(agentId: string, callback: (data: any) => void): () => void {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/agents/${agentId}/ws`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    return () => {
      ws.close();
    };
  }

  subscribeToSashaUpdates(callback: (data: any) => void): () => void {
    const ws = new WebSocket(`${API_BASE_URL.replace('http', 'ws')}/sasha/ws`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }
}

export const agentService = new AgentService();