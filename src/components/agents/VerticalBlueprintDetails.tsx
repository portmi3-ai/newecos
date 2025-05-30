import React, { useState } from 'react';
import { Bot, ChevronRight, Users, ChevronDown, Check, Layers } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Link } from 'react-router-dom';
import { VerticalHierarchy, VerticalRole } from '../../types/agent';
import { getIndustryById } from '../../data/industries';

interface VerticalBlueprintDetailsProps {
  blueprint: VerticalHierarchy;
  onCreateFromBlueprint?: (blueprint: VerticalHierarchy) => void;
}

const VerticalBlueprintDetails: React.FC<VerticalBlueprintDetailsProps> = ({
  blueprint,
  onCreateFromBlueprint
}) => {
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  
  const industry = getIndustryById(blueprint.industryId);
  if (!industry) return null;
  
  const roleLevelOrder = ['executive', 'management', 'operational', 'specialized'] as const;
  
  // Sort roles by level
  const sortedRoles = [...blueprint.roles].sort((a, b) => {
    return roleLevelOrder.indexOf(a.level) - roleLevelOrder.indexOf(b.level);
  });
  
  const toggleRoleExpand = (roleId: string) => {
    if (expandedRoles.includes(roleId)) {
      setExpandedRoles(expandedRoles.filter(id => id !== roleId));
    } else {
      setExpandedRoles([...expandedRoles, roleId]);
    }
  };
  
  const toggleRoleSelect = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
  };
  
  const selectAllRoles = () => {
    setSelectedRoles(blueprint.roles.map(role => role.id));
  };
  
  const deselectAllRoles = () => {
    setSelectedRoles([]);
  };
  
  const isRoleSelected = (roleId: string) => selectedRoles.includes(roleId);
  
  const getDirectReports = (roleId: string) => {
    return blueprint.roles.filter(role => role.reportsTo === roleId);
  };
  
  // Build hierarchy visualization
  const buildHierarchy = () => {
    // Find root nodes (nodes that don't report to anyone)
    const rootRoles = sortedRoles.filter(role => !role.reportsTo);
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hierarchy Visualization</h3>
        <div className="space-y-4">
          {rootRoles.map(role => renderHierarchyNode(role, 0))}
        </div>
      </div>
    );
  };
  
  const renderHierarchyNode = (role: VerticalRole, depth: number) => {
    const children = blueprint.roles.filter(r => r.reportsTo === role.id);
    const hasChildren = children.length > 0;
    
    return (
      <div key={role.id} className="relative">
        <div className={`flex items-center p-3 rounded-md ${isRoleSelected(role.id) ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className={`w-8 h-8 rounded-full bg-${getRoleColor(role.level)}-100 flex items-center justify-center mr-3`}>
            <Bot className={`h-4 w-4 text-${getRoleColor(role.level)}-600`} />
          </div>
          <div className="flex-1">
            <div className="font-medium text-gray-900">{role.name}</div>
            <div className="text-xs text-gray-500 capitalize">{role.level}</div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <button
                className="p-1 rounded-full hover:bg-gray-200"
                onClick={() => toggleRoleExpand(role.id)}
              >
                {expandedRoles.includes(role.id) ? 
                  <ChevronDown className="h-4 w-4 text-gray-500" /> : 
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                }
              </button>
            )}
            <button
              className={`p-1 rounded-full ${isRoleSelected(role.id) ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'}`}
              onClick={() => toggleRoleSelect(role.id)}
            >
              {isRoleSelected(role.id) ? 
                <Check className="h-4 w-4" /> : 
                <div className="h-4 w-4"></div>
              }
            </button>
          </div>
        </div>
        
        {hasChildren && expandedRoles.includes(role.id) && (
          <div className="pl-8 mt-2 space-y-2 border-l-2 border-gray-200">
            {children.map(child => renderHierarchyNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <Card.Header>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-lg ${industry.bgColor} flex items-center justify-center mr-3`}>
              {industry.icon()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 capitalize">{industry.name} Agent Hierarchy Blueprint</h2>
              <p className="text-sm text-gray-500">{sortedRoles.length} predefined roles with responsibilities</p>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Blueprint Description</h3>
                <p className="text-gray-600">
                  This blueprint provides a complete hierarchy of AI agents designed specifically for the {industry.name.toLowerCase()} industry. 
                  Each agent role has predefined responsibilities and reporting relationships, creating an efficient and effective AI ecosystem 
                  that addresses key challenges and processes in this vertical.
                </p>
              </div>
              
              {buildHierarchy()}
            </div>
            
            <div className="lg:w-1/3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Role Selection</h3>
                  <div className="space-x-2">
                    <button 
                      className="text-xs text-primary-600 hover:text-primary-800"
                      onClick={selectAllRoles}
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button 
                      className="text-xs text-primary-600 hover:text-primary-800"
                      onClick={deselectAllRoles}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 px-2">
                    <span>Selected Roles:</span>
                    <span>{selectedRoles.length} / {blueprint.roles.length}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 rounded-full" 
                      style={{ width: `${(selectedRoles.length / blueprint.roles.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Quick Role Stats</h4>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {roleLevelOrder.map(level => {
                      const count = blueprint.roles.filter(r => r.level === level).length;
                      return (
                        <div key={level} className="flex items-center p-2 bg-white rounded border border-gray-200">
                          <div className={`w-6 h-6 rounded-full bg-${getRoleColor(level)}-100 flex items-center justify-center mr-2`}>
                            <span className="text-xs font-medium">{count}</span>
                          </div>
                          <span className="text-xs text-gray-600 capitalize">{level}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => onCreateFromBlueprint && onCreateFromBlueprint(blueprint)}
                    leftIcon={<Layers className="h-4 w-4" />}
                  >
                    Deploy Selected Roles
                  </Button>
                  
                  <div className="mt-3">
                    <Link to={`/create?industry=${blueprint.industryId}`}>
                      <Button variant="outline" fullWidth>
                        Create Custom Configuration
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">Detailed Role Descriptions</h3>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="divide-y divide-gray-200">
            {sortedRoles.map((role) => (
              <div key={role.id} className={`p-4 ${isRoleSelected(role.id) ? 'bg-primary-50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full bg-${getRoleColor(role.level)}-100 flex items-center justify-center mr-3`}>
                      <Bot className={`h-4 w-4 text-${getRoleColor(role.level)}-600`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{role.name}</h4>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${getRoleColor(role.level)}-100 text-${getRoleColor(role.level)}-800 capitalize mr-2`}>
                          {role.level}
                        </span>
                        {role.reportsTo && (
                          <span>Reports to: {getNameById(role.reportsTo, blueprint.roles)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button 
                      size="sm"
                      variant={isRoleSelected(role.id) ? "primary" : "outline"}
                      onClick={() => toggleRoleSelect(role.id)}
                    >
                      {isRoleSelected(role.id) ? 'Selected' : 'Select Role'}
                    </Button>
                  </div>
                </div>
                
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Key Responsibilities:</h5>
                  <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
                    {role.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
                
                {getDirectReports(role.id).length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Supervises:</h5>
                    <div className="flex flex-wrap gap-2">
                      {getDirectReports(role.id).map(report => (
                        <div 
                          key={report.id} 
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-${getRoleColor(report.level)}-100 text-${getRoleColor(report.level)}-800`}
                        >
                          <Bot className={`h-3 w-3 mr-1.5 text-${getRoleColor(report.level)}-600`} />
                          {report.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card.Body>
        <Card.Footer>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Blueprint creates a complete, interconnected agent hierarchy
            </div>
            {onCreateFromBlueprint && (
              <Button 
                onClick={() => onCreateFromBlueprint(blueprint)}
                disabled={selectedRoles.length === 0}
              >
                Deploy Selected Agents ({selectedRoles.length})
              </Button>
            )}
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

const getRoleColor = (level: string): string => {
  switch (level) {
    case 'executive': return 'purple';
    case 'management': return 'blue';
    case 'operational': return 'green';
    case 'specialized': return 'orange';
    default: return 'gray';
  }
};

const getNameById = (id: string, roles: VerticalRole[]): string => {
  const role = roles.find(r => r.id === id);
  return role ? role.name : 'Unknown';
};

export default VerticalBlueprintDetails;