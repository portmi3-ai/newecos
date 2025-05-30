import React from 'react';
import { Bot, ChevronRight, Users } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Link } from 'react-router-dom';
import type { VerticalHierarchy, VerticalRole } from '../../types/agent';
import { getIndustryById } from '../../data/industries';

interface IndustryAgentBlueprintCardProps {
  industryId: string;
  blueprint: VerticalHierarchy;
  onCreateFromBlueprint?: (blueprint: VerticalHierarchy) => void;
}

const IndustryAgentBlueprintCard: React.FC<IndustryAgentBlueprintCardProps> = ({
  industryId,
  blueprint,
  onCreateFromBlueprint
}) => {
  const industry = getIndustryById(industryId);
  
  if (!industry) return null;
  
  const roleLevelOrder = ['executive', 'management', 'operational', 'specialized'] as const;
  
  // Sort roles by level
  const sortedRoles = [...blueprint.roles].sort((a, b) => {
    return roleLevelOrder.indexOf(a.level) - roleLevelOrder.indexOf(b.level);
  });
  
  const getDirectReports = (roleId: string) => {
    return blueprint.roles.filter(role => role.reportsTo === roleId);
  };
  
  return (
    <Card>
      <Card.Header>
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-lg ${industry.bgColor} flex items-center justify-center mr-3`}>
            {industry.icon()}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 capitalize">{industry.name} Hierarchy</h3>
            <p className="text-sm text-gray-500">{sortedRoles.length} predefined roles</p>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0 divide-y divide-gray-200">
        {sortedRoles.map((role) => (
          <div key={role.id} className="p-4">
            <div className="flex items-start">
              <div className={`mt-1 w-8 h-8 rounded-full bg-${getRoleColor(role.level)}-100 flex items-center justify-center`}>
                <Bot className={`h-4 w-4 text-${getRoleColor(role.level)}-600`} />
              </div>
              <div className="ml-3">
                <div className="flex items-center">
                  <h4 className="text-base font-medium text-gray-900">{role.name}</h4>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full bg-${getRoleColor(role.level)}-100 text-${getRoleColor(role.level)}-800 capitalize`}>
                    {role.level}
                  </span>
                </div>
                
                <div className="mt-1 text-sm text-gray-500">
                  <div className="mb-1">
                    {role.reportsTo ? (
                      <span>Reports to: <span className="font-medium">{getNameById(role.reportsTo, blueprint.roles)}</span></span>
                    ) : (
                      <span className="text-gray-400 italic">Top-level role</span>
                    )}
                  </div>
                  
                  {getDirectReports(role.id).length > 0 && (
                    <div className="flex items-center">
                      <span className="mr-2">Supervises:</span>
                      <div className="flex -space-x-2 overflow-hidden">
                        {getDirectReports(role.id).map((report) => (
                          <div
                            key={report.id}
                            className={`inline-block h-6 w-6 rounded-full ring-2 ring-white bg-${getRoleColor(report.level)}-100 flex items-center justify-center`}
                            title={report.name}
                          >
                            <span className="text-xs font-medium">{report.name.charAt(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <button 
                    className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
                    onClick={() => {}}
                  >
                    View responsibilities <ChevronRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Card.Body>
      <Card.Footer>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {sortedRoles.length} roles in total
          </div>
          <div className="flex space-x-2">
            {onCreateFromBlueprint && (
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => onCreateFromBlueprint(blueprint)}
              >
                Create From Blueprint
              </Button>
            )}
            <Link to={`/create?industry=${industryId}`}>
              <Button variant="outline" size="sm">
                Create Custom
              </Button>
            </Link>
          </div>
        </div>
      </Card.Footer>
    </Card>
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

export default IndustryAgentBlueprintCard;