import React, { useEffect, useState } from 'react';
import { useAgent } from '../../context/AgentContext';
import { AgentHierarchyNode } from '../../types/agent';
import { ChevronDown, ChevronRight, User, Bot, MoreVertical } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

interface AgentHierarchyViewProps {
  rootAgentId?: string;
  collapsible?: boolean;
  maxDepth?: number;
  onAgentSelect?: (agentId: string) => void;
}

const AgentHierarchyView: React.FC<AgentHierarchyViewProps> = ({
  rootAgentId,
  collapsible = true,
  maxDepth = 5,
  onAgentSelect
}) => {
  const { getAgentHierarchy } = useAgent();
  const [hierarchy, setHierarchy] = useState<AgentHierarchyNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHierarchy = async () => {
      setIsLoading(true);
      try {
        const hierarchyData = await getAgentHierarchy(rootAgentId);
        setHierarchy(hierarchyData);
        
        // Auto-expand the first two levels
        const expanded: Record<string, boolean> = {};
        const expandFirstTwoLevels = (nodes: AgentHierarchyNode[], currentLevel: number) => {
          if (currentLevel > 1) return;
          
          nodes.forEach(node => {
            expanded[node.agent.id] = true;
            expandFirstTwoLevels(node.children, currentLevel + 1);
          });
        };
        
        expandFirstTwoLevels(hierarchyData, 0);
        setExpandedNodes(expanded);
      } catch (error) {
        console.error('Failed to load agent hierarchy:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHierarchy();
  }, [getAgentHierarchy, rootAgentId]);
  
  const toggleNode = (agentId: string) => {
    if (!collapsible) return;
    
    setExpandedNodes(prev => ({
      ...prev,
      [agentId]: !prev[agentId]
    }));
  };
  
  const handleAgentClick = (agentId: string) => {
    if (onAgentSelect) {
      onAgentSelect(agentId);
    }
  };
  
  const renderHierarchyNode = (node: AgentHierarchyNode, depth: number = 0) => {
    if (depth > maxDepth) return null;
    
    const isExpanded = expandedNodes[node.agent.id];
    const hasChildren = node.children.length > 0;
    const nodeRoleStyles = getRoleStyles(node.agent.role);
    
    return (
      <div key={node.agent.id} className="mb-2">
        <div className={`flex items-center p-2 rounded-md transition-colors ${nodeRoleStyles.bg} hover:bg-gray-100`}>
          <div 
            className="mr-2 cursor-pointer flex items-center justify-center w-6 h-6"
            onClick={() => toggleNode(node.agent.id)}
          >
            {hasChildren && collapsible ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )
            ) : (
              <span className="w-4"></span>
            )}
          </div>
          
          <div 
            className={`flex items-center flex-1 p-2 rounded-md cursor-pointer`}
            onClick={() => handleAgentClick(node.agent.id)}
          >
            <div className={`w-8 h-8 rounded-full ${nodeRoleStyles.iconBg} flex items-center justify-center mr-3`}>
              <Bot className={`h-4 w-4 ${nodeRoleStyles.iconColor}`} />
            </div>
            <div>
              <div className="font-medium text-gray-900">{node.agent.name}</div>
              <div className="text-xs text-gray-500">
                <span className={`mr-2 px-1.5 py-0.5 rounded-full ${nodeRoleStyles.pill}`}>
                  {node.agent.role || 'Agent'}
                </span>
                <span className="capitalize">{node.agent.industry}</span>
              </div>
            </div>
            <div className="ml-auto flex items-center">
              <span className={`h-2.5 w-2.5 rounded-full ${node.agent.active ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></span>
              <span className="text-xs text-gray-500">{node.agent.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="pl-8 mt-1 border-l-2 border-gray-200">
            {node.children.map(childNode => renderHierarchyNode(childNode, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  const getRoleStyles = (role?: string) => {
    switch (role) {
      case 'executive':
        return {
          bg: 'bg-purple-50',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          pill: 'bg-purple-100 text-purple-800'
        };
      case 'management':
        return {
          bg: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          pill: 'bg-blue-100 text-blue-800'
        };
      case 'operational':
        return {
          bg: 'bg-green-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          pill: 'bg-green-100 text-green-800'
        };
      case 'specialized':
        return {
          bg: 'bg-orange-50',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600',
          pill: 'bg-orange-100 text-orange-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          pill: 'bg-gray-100 text-gray-800'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (hierarchy.length === 0) {
    return (
      <Card>
        <Card.Body className="py-8 text-center">
          <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agents in hierarchy</h3>
          <p className="text-gray-500 mb-6">
            This hierarchy doesn't have any agents yet. Create agents to build your AI ecosystem.
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="font-medium text-gray-900">Agent Hierarchy</h3>
        {collapsible && (
          <div className="flex space-x-2">
            <Button 
              size="sm"
              variant="outline" 
              onClick={() => setExpandedNodes({})}
            >
              Collapse All
            </Button>
            <Button 
              size="sm"
              variant="outline"
              onClick={() => {
                const expanded: Record<string, boolean> = {};
                const expandAllNodes = (nodes: AgentHierarchyNode[]) => {
                  nodes.forEach(node => {
                    expanded[node.agent.id] = true;
                    expandAllNodes(node.children);
                  });
                };
                expandAllNodes(hierarchy);
                setExpandedNodes(expanded);
              }}
            >
              Expand All
            </Button>
          </div>
        )}
      </div>
      <div className="p-4 max-h-[600px] overflow-y-auto">
        {hierarchy.map(node => renderHierarchyNode(node))}
      </div>
    </div>
  );
};

export default AgentHierarchyView;