import { useState, useEffect, useCallback } from 'react';
import { agentService, Agent, AgentMessage } from '../services/api/agentService';

interface UseAgentReturn {
  agent: Agent | null;
  messages: AgentMessage[];
  loading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  deployAgent: () => Promise<void>;
  updateAgent: (data: Partial<Agent>) => Promise<void>;
  getMetrics: () => Promise<any>;
  getRelationships: () => Promise<any[]>;
  clearConversation: () => Promise<void>;
  checkHealth: () => Promise<boolean>;
  getCapabilities: () => Promise<string[]>;
  updateConfig: (config: Partial<Agent['config']>) => Promise<void>;
}

export const useAgent = (agentId?: string): UseAgentReturn => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const loadAgent = useCallback(async () => {
    if (!agentId) return;
    
    try {
      setLoading(true);
      const data = await agentService.getAgentById(agentId);
      setAgent(data);
      const messageData = await agentService.getAgentMessages(agentId);
      setMessages(messageData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load agent'));
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    loadAgent();
  }, [loadAgent]);

  useEffect(() => {
    if (!agentId) return;

    const unsubscribe = agentService.subscribeToAgentUpdates(agentId, (data) => {
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === 'status') {
        setAgent(prev => prev ? { ...prev, status: data.status } : null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [agentId]);

  const sendMessage = async (content: string) => {
    try {
      const message = await agentService.sendSashaMessage(content, sessionId);
      setMessages(prev => [...prev, message]);
      if (!sessionId && message.metadata?.sessionId) {
        setSessionId(message.metadata.sessionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
      throw err;
    }
  };

  const deployAgent = async () => {
    if (!agentId) throw new Error('No agent ID provided');
    try {
      await agentService.deployAgent(agentId);
      await loadAgent();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to deploy agent'));
      throw err;
    }
  };

  const updateAgent = async (data: Partial<Agent>) => {
    if (!agentId) throw new Error('No agent ID provided');
    try {
      const updated = await agentService.updateAgent(agentId, data);
      setAgent(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update agent'));
      throw err;
    }
  };

  const getMetrics = async () => {
    if (!agentId) throw new Error('No agent ID provided');
    try {
      return await agentService.getAgentMetrics(agentId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get metrics'));
      throw err;
    }
  };

  const getRelationships = async () => {
    if (!agentId) throw new Error('No agent ID provided');
    try {
      return await agentService.getAgentRelationships(agentId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get relationships'));
      throw err;
    }
  };

  const clearConversation = async () => {
    if (sessionId) {
      try {
        await agentService.clearSashaConversation(sessionId);
        setMessages([]);
        setSessionId(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to clear conversation'));
        throw err;
      }
    }
  };

  const checkHealth = async () => {
    try {
      return await agentService.checkSashaHealth();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check health'));
      throw err;
    }
  };

  const getCapabilities = async () => {
    try {
      return await agentService.getSashaCapabilities();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get capabilities'));
      throw err;
    }
  };

  const updateConfig = async (config: Partial<Agent['config']>) => {
    try {
      const updated = await agentService.updateSashaConfig(config);
      setAgent(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update config'));
      throw err;
    }
  };

  return {
    agent,
    messages,
    loading,
    error,
    sendMessage,
    deployAgent,
    updateAgent,
    getMetrics,
    getRelationships,
    clearConversation,
    checkHealth,
    getCapabilities,
    updateConfig,
  };
}; 