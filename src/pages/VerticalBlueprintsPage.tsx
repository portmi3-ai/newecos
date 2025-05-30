import React, { useState } from 'react';
import { FilePlus, Grid, Search, Bot, Box, Filter } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { industries } from '../data/industries';
import IndustryAgentBlueprintCard from '../components/agents/IndustryAgentBlueprintCard';
import VerticalBlueprintDetails from '../components/agents/VerticalBlueprintDetails';
import { VerticalHierarchy } from '../types/agent';
import { verticalBlueprints } from '../data/verticalBlueprints';

const VerticalBlueprintsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState<VerticalHierarchy | null>(null);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  
  const filteredBlueprints = verticalBlueprints
    .filter(blueprint => 
      !selectedIndustry || blueprint.industryId === selectedIndustry
    )
    .filter(blueprint => {
      if (!searchTerm) return true;
      
      const industry = industries.find(ind => ind.id === blueprint.industryId);
      if (!industry) return false;
      
      return (
        industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blueprint.roles.some(role => 
          role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.responsibilities.some(resp => 
            resp.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      );
    });
    
  const handleCreateFromBlueprint = (blueprint: VerticalHierarchy) => {
    // In a real implementation, this would create agents based on the blueprint
    console.log('Creating agents from blueprint:', blueprint);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };
  
  const handleViewDetails = (blueprint: VerticalHierarchy) => {
    setSelectedBlueprint(blueprint);
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Industry Vertical Blueprints</h1>
        <p className="mt-2 text-gray-600">
          Pre-configured agent hierarchies for different industries to jumpstart your AI ecosystem
        </p>
      </div>
      
      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start">
          <Bot className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Blueprint deployment initiated!</p>
            <p className="text-sm mt-1">The agent hierarchy is being created. You can view progress in the Manage Agents section.</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Input
            placeholder="Search blueprints by industry, role, or responsibility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            fullWidth
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={selectedIndustry || ''}
              onChange={(e) => setSelectedIndustry(e.target.value || null)}
            >
              <option value="">All Industries</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={filterLevel || ''}
              onChange={(e) => setFilterLevel(e.target.value || null)}
            >
              <option value="">All Roles</option>
              <option value="executive">Executive</option>
              <option value="management">Management</option>
              <option value="specialized">Specialized</option>
              <option value="operational">Operational</option>
            </select>
          </div>
        </div>
      </div>
      
      {selectedBlueprint ? (
        <div>
          <div className="mb-4">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setSelectedBlueprint(null)}
            >
              Back to Blueprints
            </Button>
          </div>
          
          <VerticalBlueprintDetails 
            blueprint={selectedBlueprint}
            onCreateFromBlueprint={handleCreateFromBlueprint}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBlueprints.length > 0 ? (
            filteredBlueprints.map((blueprint) => (
              <IndustryAgentBlueprintCard
                key={`${blueprint.industryId}`}
                industryId={blueprint.industryId}
                blueprint={blueprint}
                onCreateFromBlueprint={() => handleViewDetails(blueprint)}
              />
            ))
          ) : (
            <div className="lg:col-span-2">
              <Card>
                <Card.Body className="py-12 text-center">
                  <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No blueprints found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || selectedIndustry
                      ? "We couldn't find any blueprints matching your search criteria."
                      : "There are no blueprints available. Try creating a custom agent hierarchy."}
                  </p>
                  <Button 
                    leftIcon={<FilePlus className="h-4 w-4" />}
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedIndustry(null);
                      setFilterLevel(null);
                    }}
                  >
                    Reset Filters
                  </Button>
                </Card.Body>
              </Card>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-10 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Why Use Vertical Blueprints?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Box className="h-8 w-8 text-primary-600 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Accelerate Deployment</h3>
            <p className="text-gray-600">Deploy a complete, functioning agent hierarchy in minutes instead of hours with pre-configured industry solutions.</p>
          </div>
          <div>
            <Bot className="h-8 w-8 text-primary-600 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Industry Best Practices</h3>
            <p className="text-gray-600">Benefit from industry-specific agent roles, responsibilities, and relationships designed by domain experts.</p>
          </div>
          <div>
            <Filter className="h-8 w-8 text-primary-600 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Customizable Foundation</h3>
            <p className="text-gray-600">Use blueprints as a starting point and customize to fit your specific organizational needs and processes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalBlueprintsPage;