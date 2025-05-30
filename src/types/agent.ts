export interface Industry {
  id: string;
  name: string;
  description: string;
  icon: () => React.ReactNode;
  bgColor: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  features: string[];
}

export interface AgentRole {
  id: string;
  name: string;
  level: 'executive' | 'management' | 'operational' | 'specialized';
  description: string;
  responsibilities: string[];
  permissions: AgentPermission[];
}

export interface AgentPermission {
  id: string;
  name: string;
  description: string;
  scope: 'read' | 'write' | 'execute' | 'manage';
}

export interface AgentRelationship {
  sourceAgentId: string;
  targetAgentId: string;
  type: 'reports_to' | 'supervises' | 'collaborates_with' | 'delegates_to';
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  industry: string;
  template: string;
  role?: string;
  active: boolean;
  deployed: boolean;
  createdAt: string;
  lastDeployed: string | null;
  parentAgentId?: string;
  childAgentIds?: string[];
  permissions?: string[];
  capabilities?: string[];
}

export interface CreateAgentParams {
  name: string;
  description?: string;
  industry: string;
  template: string;
  role?: string;
  parentAgentId?: string;
  permissions?: string[];
  capabilities?: string[];
}

export interface AgentHierarchyNode {
  agent: Agent;
  children: AgentHierarchyNode[];
  level: number;
}

export interface AgentEcosystemMetrics {
  totalAgents: number;
  activeAgents: number;
  deployedAgents: number;
  industryDistribution: Record<string, number>;
  hierarchyDepth: number;
  agentInteractions: number;
}

export interface AgentEventLog {
  id: string;
  agentId: string;
  eventType: 'creation' | 'update' | 'deployment' | 'status_change' | 'interaction' | 'error';
  timestamp: string;
  details: Record<string, any>;
}

export interface VerticalHierarchy {
  industryId: string;
  roles: VerticalRole[];
}

export interface VerticalRole {
  id: string;
  name: string;
  level: 'executive' | 'management' | 'operational' | 'specialized';
  responsibilities: string[];
  reportsTo?: string;
  supervises?: string[];
}

export interface AgentPerformanceMetrics {
  agentId: string;
  responseTime: number;
  successRate: number;
  usageCount: number;
  lastActive: string;
  averageFeedbackScore: number;
}