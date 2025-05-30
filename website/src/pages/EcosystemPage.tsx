import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Network, Filter, Download, Users, PlusCircle, Activity, Share2, Grid, LayoutGrid } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAgent } from '../context/AgentContext';
import AgentHierarchyView from '../components/agents/AgentHierarchyView';
import AgentEcosystemMetrics from '../components/agents/AgentEcosystemMetrics';
import AgentNetworkGraph from '../components/agents/AgentNetworkGraph';
import AgentComparisonMatrix from '../components/agents/AgentComparisonMatrix';
import { industries, getIndustryById } from '../data/industries';

const EcosystemPage: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'network' | 'matrix' | 'metrics'>('hierarchy');
  const [searchTerm, setSearchTerm] = useState('');
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth - 100,
    height: 600
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: Math.max(window.innerWidth - 100, 600),
        height: 600
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Ecosystem</h1>
        <p className="mt-2 text-gray-600">
          Manage your organization's AI agent ecosystem with hierarchies, roles, and cross-agent interactions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <div className="flex items-center">
                <Network className="h-5 w-5 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Industry Verticals</h3>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="divide-y divide-gray-200">
                <button
                  className={`w-full px-4 py-3 text-left ${
                    selectedIndustry === null ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedIndustry(null)}
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-gray-400" />
                    <span>All Industries</span>
                  </div>
                </button>
                
                {industries.map((industry) => (
                  <button
                    key={industry.id}
                    className={`w-full px-4 py-3 text-left ${
                      selectedIndustry === industry.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedIndustry(industry.id)}
                  >
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full ${industry.bgColor} flex items-center justify-center mr-3`}>
                        {industry.icon()}
                      </div>
                      <span className="capitalize">{industry.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>
          
          <Card className="mt-6">
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </Card.Header>
            <Card.Body className="space-y-4">
              <Link to="/create">
                <Button 
                  variant="primary"
                  fullWidth
                  leftIcon={<PlusCircle className="h-4 w-4" />}
                >
                  Create New Agent
                </Button>
              </Link>
              
              <Link to="/relationships">
                <Button 
                  variant="outline"
                  fullWidth
                  leftIcon={<Share2 className="h-4 w-4" />}
                >
                  Manage Relationships
                </Button>
              </Link>
              
              <Button 
                variant="outline"
                fullWidth
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => {
                  // This would generate and download an image in a real implementation
                  alert('Ecosystem map would be downloaded here in a production implementation');
                }}
              >
                Export Ecosystem Map
              </Button>
            </Card.Body>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'hierarchy' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('hierarchy')}
              >
                <LayoutGrid className="h-4 w-4 inline mr-1" /> Hierarchy View
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'network' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('network')}
              >
                <Network className="h-4 w-4 inline mr-1" /> Network Graph
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'matrix' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('matrix')}
              >
                <Grid className="h-4 w-4 inline mr-1" /> Relationship Matrix
              </button>
              <button
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'metrics' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('metrics')}
              >
                <Activity className="h-4 w-4 inline mr-1" /> Ecosystem Metrics
              </button>
            </div>
            
            {activeTab !== 'metrics' && (
              <div className="w-full md:w-auto">
                <Input
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Filter className="h-4 w-4 text-gray-400" />}
                  fullWidth
                />
              </div>
            )}
          </div>

          {activeTab === 'hierarchy' && (
            <AgentHierarchyView 
              rootAgentId={selectedIndustry ? undefined : undefined} 
              onAgentSelect={(agentId) => {
                console.log(`Selected agent: ${agentId}`);
                // In a real app, this would navigate to the agent details page or open a modal
              }}
            />
          )}

          {activeTab === 'network' && (
            <AgentNetworkGraph
              width={windowDimensions.width}
              height={windowDimensions.height}
              industryFilter={selectedIndustry || undefined}
            />
          )}
          
          {activeTab === 'matrix' && (
            <AgentComparisonMatrix
              industryFilter={selectedIndustry || undefined}
            />
          )}
          
          {activeTab === 'metrics' && (
            <AgentEcosystemMetrics />
          )}
          
          {selectedIndustry && (
            <div className="mt-8">
              <Card>
                <Card.Header>
                  <div className="flex items-center">
                    {getIndustryById(selectedIndustry)?.icon && (
                      <div className={`h-10 w-10 rounded-lg ${getIndustryById(selectedIndustry)?.bgColor} flex items-center justify-center mr-4`}>
                        {getIndustryById(selectedIndustry)?.icon()}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-medium text-gray-900 capitalize">
                        {getIndustryById(selectedIndustry)?.name} Industry
                      </h2>
                      <p className="text-sm text-gray-500">
                        {getIndustryById(selectedIndustry)?.description}
                      </p>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Industry-Specific Agents</h3>
                      <AgentHierarchyView 
                        rootAgentId={undefined}
                        collapsible={true}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Common Use Cases</h4>
                        <ul className="space-y-2">
                          {getIndustryUseCases(selectedIndustry).map((useCase, index) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-800 text-xs font-medium mr-2 mt-0.5">
                                {index + 1}
                              </span>
                              <span className="text-gray-700">{useCase}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommended Agent Roles</h4>
                        <ul className="space-y-2">
                          {getRecommendedRoles(selectedIndustry).map((role, index) => (
                            <li key={index} className="bg-white p-2 rounded border border-gray-200 flex items-center">
                              <Bot className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-900 font-medium">{role.name}</span>
                              <span className="ml-2 text-xs text-gray-500 capitalize">({role.level})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <div className="flex justify-between">
                    <Button variant="outline">
                      Industry Insights
                    </Button>
                    <Link to={`/create?industry=${selectedIndustry}`}>
                      <Button>
                        Create Agent in this Industry
                      </Button>
                    </Link>
                  </div>
                </Card.Footer>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get industry-specific use cases
const getIndustryUseCases = (industryId: string): string[] => {
  switch (industryId) {
    case 'real-estate':
      return [
        'Automated property listing creation and optimization',
        'Buyer-property matching based on preferences',
        'Market trend analysis and price predictions',
        'Virtual property tour narration and highlighting',
        'Automated follow-up with potential buyers'
      ];
    case 'fintech':
      return [
        'Personalized investment portfolio recommendations',
        'Fraud detection and risk assessment',
        'Automated financial planning and goal setting',
        'Regulatory compliance monitoring',
        'Market sentiment analysis and trading signals'
      ];
    case 'healthcare':
      return [
        'Patient engagement and care plan adherence',
        'Medical record analysis and summary generation',
        'Appointment scheduling and reminders',
        'Symptom triage and preliminary assessment',
        'Medication management and interaction checking'
      ];
    case 'senior-living':
      return [
        'Daily check-ins and wellness monitoring',
        'Medication reminders and adherence tracking',
        'Family communication and updates',
        'Emergency response coordination',
        'Social engagement and cognitive exercise'
      ];
    case 'telecommunications':
      return [
        'Network performance monitoring and optimization',
        'Customer support and troubleshooting',
        'Service recommendation based on usage patterns',
        'Outage detection and impact assessment',
        'Retention risk identification and intervention'
      ];
    case 'education':
      return [
        'Personalized learning path generation',
        'Student progress monitoring and intervention',
        'Automated grading and feedback',
        'Content recommendation based on learning style',
        'Administrative task automation'
      ];
    case 'retail':
      return [
        'Inventory management and reorder prediction',
        'Customer preference analysis and product recommendations',
        'Price optimization based on market conditions',
        'Visual merchandising suggestions',
        'Customer service and query handling'
      ];
    default:
      return [
        'Process automation and efficiency improvements',
        'Data analysis and insight generation',
        'Customer interaction and support',
        'Compliance monitoring and reporting',
        'Strategic planning and decision support'
      ];
  }
};

// Helper function to get recommended roles for each industry
interface RoleRecommendation {
  name: string;
  level: 'executive' | 'management' | 'operational' | 'specialized';
}

const getRecommendedRoles = (industryId: string): RoleRecommendation[] => {
  switch (industryId) {
    case 'real-estate':
      return [
        { name: 'Property Listing Director', level: 'executive' },
        { name: 'Market Analysis Specialist', level: 'specialized' },
        { name: 'Client Matching Coordinator', level: 'management' },
        { name: 'Property Description Generator', level: 'operational' },
        { name: 'Virtual Tour Guide', level: 'operational' }
      ];
    case 'fintech':
      return [
        { name: 'Financial Services Director', level: 'executive' },
        { name: 'Investment Advisor', level: 'specialized' },
        { name: 'Risk Assessment Specialist', level: 'specialized' },
        { name: 'Compliance Monitor', level: 'specialized' },
        { name: 'Transaction Processor', level: 'operational' }
      ];
    case 'healthcare':
      return [
        { name: 'Patient Care Director', level: 'executive' },
        { name: 'Medical Records Analyst', level: 'specialized' },
        { name: 'Care Plan Coordinator', level: 'management' },
        { name: 'Appointment Scheduler', level: 'operational' },
        { name: 'Patient Communication Agent', level: 'operational' }
      ];
    default:
      return [
        { name: 'Strategic Director', level: 'executive' },
        { name: 'Department Manager', level: 'management' },
        { name: 'Task Processor', level: 'operational' },
        { name: 'Analytics Specialist', level: 'specialized' },
        { name: 'Content Creator', level: 'specialized' }
      ];
  }
};

export default EcosystemPage;