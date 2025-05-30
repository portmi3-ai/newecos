import React, { useState, useEffect } from 'react';
import { useAgent } from '../../context/AgentContext';
import Card from '../common/Card';
import Button from '../common/Button';
import type { Agent, AgentRelationship } from '../../types/agent';
import { Bot, Eye, EyeOff, Download } from 'lucide-react';
import { getIndustryById } from '../../data/industries';

interface AgentComparisonMatrixProps {
  industryFilter?: string;
}

type MatrixCell = {
  source: Agent;
  target: Agent;
  relationships: AgentRelationship[];
};

const AgentComparisonMatrix: React.FC<AgentComparisonMatrixProps> = ({
  industryFilter,
}) => {
  const { agents, relationships } = useAgent();
  const [matrixData, setMatrixData] = useState<MatrixCell[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [displayMode, setDisplayMode] = useState<'all' | 'active'>('active');
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    // Filter agents based on industry and active status
    const filtered = agents.filter(agent => {
      if (industryFilter && agent.industry !== industryFilter) return false;
      if (displayMode === 'active' && !agent.active) return false;
      return true;
    });
    
    setFilteredAgents(filtered);
    
    // Build matrix data
    const matrix: MatrixCell[] = [];
    
    for (const source of filtered) {
      for (const target of filtered) {
        if (source.id === target.id) continue;
        
        const cellRelationships = relationships.filter(
          rel => 
            (rel.sourceAgentId === source.id && rel.targetAgentId === target.id) ||
            (rel.sourceAgentId === target.id && rel.targetAgentId === source.id)
        );
        
        if (cellRelationships.length > 0) {
          matrix.push({
            source,
            target,
            relationships: cellRelationships
          });
        }
      }
    }
    
    setMatrixData(matrix);
  }, [agents, relationships, industryFilter, displayMode]);
  
  const getCellTypeIcon = (cell: MatrixCell) => {
    const types = cell.relationships.map(r => r.type);
    
    if (types.includes('reports_to') || types.includes('supervises')) {
      return (
        <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" title="Hierarchical relationship"></div>
      );
    }
    
    if (types.includes('collaborates_with')) {
      return (
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" title="Collaborative relationship"></div>
      );
    }
    
    if (types.includes('delegates_to')) {
      return (
        <div className="h-2.5 w-2.5 rounded-full bg-amber-500" title="Delegation relationship"></div>
      );
    }
    
    return (
      <div className="h-2.5 w-2.5 rounded-full bg-gray-300" title="Other relationship"></div>
    );
  };
  
  const downloadCSV = () => {
    // Create CSV content
    let csvContent = 'Source Agent,Source Industry,Target Agent,Target Industry,Relationship Types\n';
    
    matrixData.forEach(cell => {
      const sourceAgent = cell.source.name;
      const sourceIndustry = cell.source.industry;
      const targetAgent = cell.target.name;
      const targetIndustry = cell.target.industry;
      const relationshipTypes = cell.relationships.map(r => r.type).join('; ');
      
      csvContent += `"${sourceAgent}","${sourceIndustry}","${targetAgent}","${targetIndustry}","${relationshipTypes}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'agent_relationships.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Agent Relationship Matrix</h3>
        <div className="flex space-x-2">
          <div className="border border-gray-300 rounded-md flex divide-x divide-gray-300">
            <button 
              className={`px-2 py-1 text-xs font-medium ${displayMode === 'active' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => setDisplayMode('active')}
            >
              Active Only
            </button>
            <button 
              className={`px-2 py-1 text-xs font-medium ${displayMode === 'all' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => setDisplayMode('all')}
            >
              All Agents
            </button>
          </div>
          <button 
            className="border border-gray-300 rounded-md px-2 py-1 hover:bg-gray-50"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? (
              <EyeOff className="h-4 w-4 text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-600" />
            )}
          </button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={downloadCSV}
          >
            Export
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-0 overflow-x-auto">
        {filteredAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bot className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No active agents found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source Agent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Agent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Relationship
                </th>
                {showDetails && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {matrixData.map((cell, idx) => (
                <tr key={`${cell.source.id}-${cell.target.id}-${idx}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{cell.source.name}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          {getIndustryById(cell.source.industry)?.icon && (
                            <div className={`h-3 w-3 rounded-full ${getIndustryById(cell.source.industry)?.bgColor} flex items-center justify-center mr-1`}>
                              {getIndustryById(cell.source.industry)?.icon()}
                            </div>
                          )}
                          <span className="capitalize">{cell.source.industry}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{cell.target.name}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          {getIndustryById(cell.target.industry)?.icon && (
                            <div className={`h-3 w-3 rounded-full ${getIndustryById(cell.target.industry)?.bgColor} flex items-center justify-center mr-1`}>
                              {getIndustryById(cell.target.industry)?.icon()}
                            </div>
                          )}
                          <span className="capitalize">{cell.target.industry}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getCellTypeIcon(cell)}
                      <span className="text-sm text-gray-500">
                        {cell.relationships.length} relationship{cell.relationships.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </td>
                  {showDetails && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {cell.relationships.map((rel, idx) => (
                          <div key={idx} className="mb-1 last:mb-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {rel.sourceAgentId === cell.source.id ? 
                                getRelationshipLabel(rel.type) : 
                                getInverseRelationshipLabel(rel.type)
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card.Body>
    </Card>
  );
};

const getRelationshipLabel = (type: string): string => {
  switch (type) {
    case 'reports_to': return 'Reports To';
    case 'supervises': return 'Supervises';
    case 'collaborates_with': return 'Collaborates With';
    case 'delegates_to': return 'Delegates To';
    default: return type.replace(/_/g, ' ');
  }
};

const getInverseRelationshipLabel = (type: string): string => {
  switch (type) {
    case 'reports_to': return 'Receives Reports From';
    case 'supervises': return 'Is Supervised By';
    case 'collaborates_with': return 'Collaborates With';
    case 'delegates_to': return 'Receives Delegations From';
    default: return type.replace(/_/g, ' ');
  }
};

export default AgentComparisonMatrix;