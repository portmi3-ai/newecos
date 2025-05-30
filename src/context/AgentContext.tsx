import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Agent, CreateAgentParams, AgentRelationship, AgentHierarchyNode, AgentEcosystemMetrics } from '../types/agent';
import * as agentService from '../services/agentService';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface AgentContextType {
  agents: Agent[];
  relationships: AgentRelationship[];
  getAgents: () => Promise<Agent[]>;
  getAgentById: (id: string) => Promise<Agent | null>;
  createAgent: (params: CreateAgentParams) => Promise<string>;
  updateAgent: (id: string, params: Partial<CreateAgentParams>) => Promise<boolean>;
  deleteAgent: (id: string) => Promise<boolean>;
  deployAgent: (id: string) => Promise<boolean>;
  toggleAgentStatus: (id: string, active: boolean) => Promise<boolean>;
  getAgentHierarchy: (rootAgentId?: string) => Promise<AgentHierarchyNode[]>;
  createAgentRelationship: (relationship: AgentRelationship) => Promise<boolean>;
  removeAgentRelationship: (sourceAgentId: string, targetAgentId: string) => Promise<boolean>;
  getAgentsByRole: (roleId: string) => Promise<Agent[]>;
  getAgentsByIndustry: (industryId: string) => Promise<Agent[]>;
  getEcosystemMetrics: () => Promise<AgentEcosystemMetrics>;
  getAgentSubordinates: (agentId: string) => Promise<Agent[]>;
  getAgentSupervisors: (agentId: string) => Promise<Agent[]>;
  loading: boolean;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

interface AgentProviderProps {
  children: ReactNode;
}

export const AgentProvider: React.FC<AgentProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Use React Query for agents and relationships
  const { 
    data: agents = [], 
    isLoading: isAgentsLoading,
  } = useQuery({
    queryKey: ['agents'],
    queryFn: agentService.getAgents,
    enabled: isAuthenticated,
  });

  const { 
    data: relationships = [], 
    isLoading: isRelationshipsLoading,
  } = useQuery({
    queryKey: ['relationships'],
    queryFn: agentService.getAgentRelationships,
    enabled: isAuthenticated,
  });

  // Memoized getAgents function
  const getAgents = useCallback(async (): Promise<Agent[]> => {
    return queryClient.fetchQuery({
      queryKey: ['agents'],
      queryFn: agentService.getAgents,
    });
  }, [queryClient]);

  // Get agent by ID - with caching
  const getAgentById = useCallback(async (id: string): Promise<Agent | null> => {
    try {
      return queryClient.fetchQuery({
        queryKey: ['agent', id],
        queryFn: () => agentService.getAgentById(id),
      });
    } catch (error) {
      console.error(`Failed to fetch agent ${id}:`, error);
      // Try to find in local state
      const agent = agents.find(a => a.id === id);
      return agent || null;
    }
  }, [queryClient, agents]);

  // Create agent mutation
  const createAgentMutation = useMutation({
    mutationFn: agentService.createAgent,
    onSuccess: (newAgent) => {
      // Update agents cache
      queryClient.setQueryData(['agents'], (oldAgents: Agent[] = []) => [...oldAgents, newAgent]);
      toast.success('Agent created successfully');
      
      // If parent is specified, invalidate relationships query
      if (newAgent.parentAgentId) {
        queryClient.invalidateQueries({ queryKey: ['relationships'] });
      }
    },
    onError: (error) => {
      console.error('Failed to create agent:', error);
      toast.error('Failed to create agent');
    },
  });

  // Create agent function
  const createAgent = async (params: CreateAgentParams): Promise<string> => {
    setLoading(true);
    try {
      const newAgent = await createAgentMutation.mutateAsync(params);
      return newAgent.id;
    } finally {
      setLoading(false);
    }
  };

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: ({ id, params }: { id: string; params: Partial<CreateAgentParams> }) => 
      agentService.updateAgent(id, params),
    onSuccess: (updatedAgent, { id }) => {
      // Update agents cache
      queryClient.setQueryData(['agents'], (oldAgents: Agent[] = []) => 
        oldAgents.map(agent => agent.id === id ? { ...agent, ...updatedAgent } : agent)
      );
      
      // Update single agent cache
      queryClient.setQueryData(['agent', id], updatedAgent);
      
      toast.success('Agent updated successfully');
      
      // If parentAgentId is changed, invalidate relationships
      if ('parentAgentId' in updatedAgent) {
        queryClient.invalidateQueries({ queryKey: ['relationships'] });
        queryClient.invalidateQueries({ queryKey: ['agentHierarchy'] });
      }
    },
    onError: (error) => {
      console.error('Failed to update agent:', error);
      toast.error('Failed to update agent');
    },
  });

  // Update agent function
  const updateAgent = async (id: string, params: Partial<CreateAgentParams>): Promise<boolean> => {
    setLoading(true);
    try {
      await updateAgentMutation.mutateAsync({ id, params });
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: agentService.deleteAgent,
    onSuccess: (_, id) => {
      // Update agents cache
      queryClient.setQueryData(['agents'], (oldAgents: Agent[] = []) => 
        oldAgents.filter(agent => agent.id !== id)
      );
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['agent', id] });
      
      // Invalidate relationships and hierarchy
      queryClient.invalidateQueries({ queryKey: ['relationships'] });
      queryClient.invalidateQueries({ queryKey: ['agentHierarchy'] });
      
      toast.success('Agent deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete agent:', error);
      toast.error('Failed to delete agent');
    },
  });

  // Delete agent function
  const deleteAgent = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await deleteAgentMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deploy agent mutation
  const deployAgentMutation = useMutation({
    mutationFn: agentService.deployAgent,
    onSuccess: (_, id) => {
      // Update agents cache
      queryClient.setQueryData(['agents'], (oldAgents: Agent[] = []) => 
        oldAgents.map(agent => agent.id === id ? {
          ...agent,
          deployed: true,
          active: true,
          lastDeployed: new Date().toISOString()
        } : agent)
      );
      
      // Update single agent cache
      queryClient.setQueryData(['agent', id], (oldAgent: Agent) => ({
        ...oldAgent,
        deployed: true,
        active: true,
        lastDeployed: new Date().toISOString()
      }));
      
      toast.success('Agent deployed successfully');
    },
    onError: (error) => {
      console.error('Failed to deploy agent:', error);
      toast.error('Failed to deploy agent');
    },
  });

  // Deploy agent function
  const deployAgent = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      await deployAgentMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle agent status mutation
  const toggleAgentStatusMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => 
      agentService.toggleAgentStatus(id, active),
    onSuccess: (_, { id, active }) => {
      // Update agents cache
      queryClient.setQueryData(['agents'], (oldAgents: Agent[] = []) => 
        oldAgents.map(agent => agent.id === id ? { ...agent, active } : agent)
      );
      
      // Update single agent cache
      queryClient.setQueryData(['agent', id], (oldAgent: Agent) => ({
        ...oldAgent,
        active
      }));
      
      toast.success(`Agent ${active ? 'activated' : 'deactivated'} successfully`);
    },
    onError: (error) => {
      console.error('Failed to toggle agent status:', error);
      toast.error('Failed to update agent status');
    },
  });

  // Toggle agent status function
  const toggleAgentStatus = async (id: string, active: boolean): Promise<boolean> => {
    try {
      await toggleAgentStatusMutation.mutateAsync({ id, active });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Get agent hierarchy with React Query
  const getAgentHierarchy = useCallback(async (rootAgentId?: string): Promise<AgentHierarchyNode[]> => {
    return queryClient.fetchQuery({
      queryKey: ['agentHierarchy', rootAgentId],
      queryFn: () => agentService.getAgentHierarchy(rootAgentId),
    });
  }, [queryClient]);

  // Create agent relationship mutation
  const createRelationshipMutation = useMutation({
    mutationFn: agentService.createAgentRelationship,
    onSuccess: (_, relationship) => {
      // Update relationships cache
      queryClient.setQueryData(['relationships'], (oldRelationships: AgentRelationship[] = []) => 
        [...oldRelationships, relationship]
      );
      
      // Invalidate hierarchy
      queryClient.invalidateQueries({ queryKey: ['agentHierarchy'] });
      
      // If this is a reports_to relationship, update parent-child references in agents
      if (relationship.type === 'reports_to') {
        queryClient.setQueryData(['agents'], (oldAgents: Agent[] = []) => 
          oldAgents.map(agent => {
            if (agent.id === relationship.sourceAgentId) {
              return { ...agent, parentAgentId: relationship.targetAgentId };
            }
            if (agent.id === relationship.targetAgentId) {
              const childAgentIds = agent.childAgentIds || [];
              return { 
                ...agent, 
                childAgentIds: [...childAgentIds, relationship.sourceAgentId]
              };
            }
            return agent;
          })
        );
      }
      
      toast.success('Relationship created successfully');
    },
    onError: (error) => {
      console.error('Failed to create relationship:', error);
      toast.error('Failed to create relationship');
    },
  });

  // Create relationship function
  const createAgentRelationship = async (relationship: AgentRelationship): Promise<boolean> => {
    try {
      await createRelationshipMutation.mutateAsync(relationship);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Remove agent relationship mutation
  const removeRelationshipMutation = useMutation({
    mutationFn: ({ sourceAgentId, targetAgentId }: { sourceAgentId: string; targetAgentId: string }) => 
      agentService.deleteAgentRelationship(sourceAgentId, targetAgentId),
    onSuccess: (_, { sourceAgentId, targetAgentId }) => {
      // Update relationships cache
      queryClient.setQueryData(['relationships'], (oldRelationships: AgentRelationship[] = []) => 
        oldRelationships.filter(rel => 
          !((rel.sourceAgentId === sourceAgentId && rel.targetAgentId === targetAgentId) ||
          (rel.sourceAgentId === targetAgentId && rel.targetAgentId === sourceAgentId))
        )
      );
      
      // Invalidate hierarchy
      queryClient.invalidateQueries({ queryKey: ['agentHierarchy'] });
      
      // Update parent-child references in agents
      queryClient.setQueryData(['agents'], (oldAgents: Agent[] = []) => 
        oldAgents.map(agent => {
          if (agent.id === sourceAgentId && agent.parentAgentId === targetAgentId) {
            return { ...agent, parentAgentId: undefined };
          }
          if (agent.id === targetAgentId && agent.childAgentIds?.includes(sourceAgentId)) {
            return { 
              ...agent, 
              childAgentIds: agent.childAgentIds.filter(id => id !== sourceAgentId)
            };
          }
          return agent;
        })
      );
      
      toast.success('Relationship removed successfully');
    },
    onError: (error) => {
      console.error('Failed to remove relationship:', error);
      toast.error('Failed to remove relationship');
    },
  });

  // Remove relationship function
  const removeAgentRelationship = async (sourceAgentId: string, targetAgentId: string): Promise<boolean> => {
    try {
      await removeRelationshipMutation.mutateAsync({ sourceAgentId, targetAgentId });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Get agents by role with filtering
  const getAgentsByRole = useCallback(async (roleId: string): Promise<Agent[]> => {
    return agents.filter(agent => agent.role === roleId);
  }, [agents]);

  // Get agents by industry with filtering
  const getAgentsByIndustry = useCallback(async (industryId: string): Promise<Agent[]> => {
    return agents.filter(agent => agent.industry === industryId);
  }, [agents]);

  // Get ecosystem metrics with React Query
  const getEcosystemMetrics = useCallback(async (): Promise<AgentEcosystemMetrics> => {
    return queryClient.fetchQuery({
      queryKey: ['ecosystemMetrics'],
      queryFn: agentService.getEcosystemMetrics,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  }, [queryClient]);

  // Get agent subordinates
  const getAgentSubordinates = useCallback(async (agentId: string): Promise<Agent[]> => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || !agent.childAgentIds || agent.childAgentIds.length === 0) {
      return [];
    }
    
    return agents.filter(a => agent.childAgentIds?.includes(a.id));
  }, [agents]);

  // Get agent supervisors
  const getAgentSupervisors = useCallback(async (agentId: string): Promise<Agent[]> => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || !agent.parentAgentId) {
      return [];
    }
    
    const supervisor = agents.find(a => a.id === agent.parentAgentId);
    return supervisor ? [supervisor] : [];
  }, [agents]);

  const value = {
    agents,
    relationships,
    getAgents,
    getAgentById,
    createAgent,
    updateAgent,
    deleteAgent,
    deployAgent,
    toggleAgentStatus,
    getAgentHierarchy,
    createAgentRelationship,
    removeAgentRelationship,
    getAgentsByRole,
    getAgentsByIndustry,
    getEcosystemMetrics,
    getAgentSubordinates,
    getAgentSupervisors,
    loading: loading || isAgentsLoading || isRelationshipsLoading
  };

  return <AgentContext.Provider value={value}>{children}</AgentContext.Provider>;
};

export const useAgent = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};