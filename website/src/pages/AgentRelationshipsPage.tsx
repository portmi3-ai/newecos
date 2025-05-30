import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Network, Search, PlusCircle, Save, AlertTriangle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAgent } from '../context/AgentContext';
import type { Agent, AgentRelationship } from '../types/agent';

const AgentRelationshipsPage: React.FC = () => {
  const { agents, relationships, createAgentRelationship, removeAgentRelationship } = useAgent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceAgent, setSelectedSourceAgent] = useState<Agent | null>(null);
  const [selectedTargetAgent, setSelectedTargetAgent] = useState<Agent | null>(null);
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<string>('reports_to');
  const [isCreatingRelationship, setIsCreatingRelationship] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const handleCreateRelationship = async () => {
    if (!selectedSourceAgent || !selectedTargetAgent) {
      setValidationError('Please select both source and target agents');
      return;
    }
    
    if (selectedSourceAgent.id === selectedTargetAgent.id) {
      setValidationError('Source and target agents cannot be the same');
      return;
    }
    
    // Check for circular relationships
    if (selectedRelationshipType === 'reports_to' && selectedTargetAgent.parentAgentId === selectedSourceAgent.id) {
      setValidationError('This would create a circular reporting relationship');
      return;
    }
    
    setValidationError(null);
    setIsCreatingRelationship(true);
    
    try {
      const relationship: AgentRelationship = {
        sourceAgentId: selectedSourceAgent.id,
        targetAgentId: selectedTargetAgent.id,
        type: selectedRelationshipType as any
      };
      
      await createAgentRelationship(relationship);
      
      // If creating a reports_to relationship, also create the inverse supervises relationship
      if (selectedRelationshipType === 'reports_to') {
        await createAgentRelationship({
          sourceAgentId: selectedTargetAgent.id,
          targetAgentId: selectedSourceAgent.id,
          type: 'supervises'
        });
      }
      
      // Reset selections
      setSelectedSourceAgent(null);
      setSelectedTargetAgent(null);
      setSelectedRelationshipType('reports_to');
    } catch (error) {
      console.error('Failed to create relationship:', error);
    } finally {
      setIsCreatingRelationship(false);
    }
  };
  
  const handleRemoveRelationship = async (sourceId: string, targetId: string, type: string) => {
    if (window.confirm('Are you sure you want to remove this relationship?')) {
      try {
        await removeAgentRelationship(sourceId, targetId);
        
        // If removing a reports_to relationship, also remove the inverse supervises relationship
        if (type === 'reports_to') {
          await removeAgentRelationship(targetId, sourceId);
        }
      } catch (error) {
        console.error('Failed to remove relationship:', error);
      }
    }
  };
  
  const getRelationshipTypeName = (type: string) => {
    switch (type) {
      case 'reports_to':
        return 'Reports To';
      case 'supervises':
        return 'Supervises';
      case 'collaborates_with':
        return 'Collaborates With';
      case 'delegates_to':
        return 'Delegates To';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };
  
  const getAgentById = (id: string) => {
    return agents.find(agent => agent.id === id);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Relationships</h1>
        <p className="mt-2 text-gray-600">
          Create and manage relationships between agents to build a connected AI ecosystem
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <div className="flex items-center">
                <PlusCircle className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Create Relationship</h3>
              </div>
            </Card.Header>
            <Card.Body>
              {validationError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{validationError}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Agent
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={selectedSourceAgent?.id || ''}
                    onChange={(e) => {
                      const agent = agents.find(a => a.id === e.target.value) || null;
                      setSelectedSourceAgent(agent);
                    }}
                    title="Source Agent"
                  >
                    <option value="">Select source agent</option>
                    {agents.map((agent) => (
                      <option key={`source-${agent.id}`} value={agent.id}>
                        {agent.name} ({agent.role || 'No role'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship Type
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={selectedRelationshipType}
                    onChange={(e) => setSelectedRelationshipType(e.target.value)}
                    title="Relationship Type"
                  >
                    <option value="reports_to">Reports To</option>
                    <option value="supervises">Supervises</option>
                    <option value="collaborates_with">Collaborates With</option>
                    <option value="delegates_to">Delegates To</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Agent
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    value={selectedTargetAgent?.id || ''}
                    onChange={(e) => {
                      const agent = agents.find(a => a.id === e.target.value) || null;
                      setSelectedTargetAgent(agent);
                    }}
                    title="Agent Relationship"
                  >
                    <option value="">Select target agent</option>
                    {agents.map((agent) => (
                      <option 
                        key={`target-${agent.id}`} 
                        value={agent.id}
                        disabled={agent.id === selectedSourceAgent?.id}
                      >
                        {agent.name} ({agent.role || 'No role'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card.Body>
            <Card.Footer>
              <Button 
                onClick={handleCreateRelationship} 
                isLoading={isCreatingRelationship}
                fullWidth
                leftIcon={<Save className="h-4 w-4" />}
              >
                Create Relationship
              </Button>
            </Card.Footer>
          </Card>
          
          <Card className="mt-6">
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Relationship Types</h3>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="divide-y divide-gray-200">
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-1">Reports To</h4>
                  <p className="text-sm text-gray-600">
                    The source agent reports to the target agent, creating a hierarchical relationship.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-1">Supervises</h4>
                  <p className="text-sm text-gray-600">
                    The source agent supervises the target agent, providing oversight and direction.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-1">Collaborates With</h4>
                  <p className="text-sm text-gray-600">
                    The source agent works together with the target agent on shared objectives.
                  </p>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-1">Delegates To</h4>
                  <p className="text-sm text-gray-600">
                    The source agent assigns tasks to the target agent without direct supervision.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <div className="mb-4">
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              fullWidth
            />
          </div>
          
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Network className="h-5 w-5 text-primary-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">Current Relationships</h3>
                </div>
                <Link to="/ecosystem">
                  <Button 
                    variant="outline"
                    size="sm"
                    leftIcon={<Network className="h-4 w-4" />}
                  >
                    View Full Ecosystem
                  </Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source Agent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Relationship
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Agent
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {relationships
                      .filter(rel => {
                        if (!searchTerm) return true;
                        
                        const sourceAgent = getAgentById(rel.sourceAgentId);
                        const targetAgent = getAgentById(rel.targetAgentId);
                        
                        return (
                          sourceAgent?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          targetAgent?.name.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                      })
                      .map((relationship, idx) => {
                        const sourceAgent = getAgentById(relationship.sourceAgentId);
                        const targetAgent = getAgentById(relationship.targetAgentId);
                        
                        if (!sourceAgent || !targetAgent) return null;
                        
                        return (
                          <tr key={`${relationship.sourceAgentId}-${relationship.targetAgentId}-${relationship.type}-${idx}`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="font-medium text-primary-700">{sourceAgent.name.charAt(0)}</span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{sourceAgent.name}</div>
                                  <div className="text-xs text-gray-500 capitalize">{sourceAgent.industry}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                {getRelationshipTypeName(relationship.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="font-medium text-primary-700">{targetAgent.name.charAt(0)}</span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{targetAgent.name}</div>
                                  <div className="text-xs text-gray-500 capitalize">{targetAgent.industry}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleRemoveRelationship(relationship.sourceAgentId, relationship.targetAgentId, relationship.type)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                
                {relationships.length === 0 && (
                  <div className="py-12 text-center">
                    <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No relationships found</h3>
                    <p className="text-gray-500 mb-6">
                      Start building your agent ecosystem by creating relationships between agents.
                    </p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentRelationshipsPage;