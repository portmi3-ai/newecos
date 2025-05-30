import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bot, Loader, ArrowRight, ChevronRight, ChevronDown } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { useAgent } from '../context/AgentContext';
import { AgentTemplate, Industry } from '../types/agent';
import { industries } from '../data/industries';
import AgentRoleSelector from '../components/agents/AgentRoleSelector';
import { getAllAdvisorTemplates } from '../data/advisorAgentTemplates';

const CreateAgentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { agents, createAgent } = useAgent();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [agentName, setAgentName] = useState('');
  const [agentDescription, setAgentDescription] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedParentAgent, setSelectedParentAgent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('advanced-settings');

  useEffect(() => {
    // Check if industry is specified in URL
    const industryId = searchParams.get('industry');
    if (industryId) {
      const industry = industries.find(ind => ind.id === industryId);
      if (industry) {
        setSelectedIndustry(industry);
        setCurrentStep(2);
      }
    }
  }, [searchParams]);

  const handleCreateAgent = async () => {
    if (!selectedIndustry || !selectedTemplate || !agentName) {
      return;
    }

    setIsLoading(true);
    try {
      const agentId = await createAgent({
        name: agentName,
        description: agentDescription,
        industry: selectedIndustry.id,
        template: selectedTemplate.id,
        role: selectedRole,
        parentAgentId: selectedParentAgent || undefined,
      });
      
      navigate(`/deploy/${agentId}`);
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndustrySelect = (industry: Industry) => {
    setSelectedIndustry(industry);
    setSelectedTemplate(null);
    setCurrentStep(2);
  };

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setCurrentStep(3);
  };

  const toggleSectionExpand = (sectionId: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
    }
  };

  // Get templates based on selected industry
  const getTemplatesForIndustry = (industryId: string): AgentTemplate[] => {
    if (industryId === 'funding') {
      // Use advisor agent templates
      return getAllAdvisorTemplates();
    }
    
    // Use standard templates
    return templatesByIndustry[industryId] || [];
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create a New AI Agent</h1>
        <p className="mt-2 text-gray-600">
          Build and deploy an AI agent tailored to your specific needs. Select an industry, choose a template, and customize your agent.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`}>
            <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-white' : 'text-gray-500'}`}>1</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}>
            <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-white' : 'text-gray-500'}`}>2</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}>
            <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-white' : 'text-gray-500'}`}>3</span>
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-xs font-medium text-gray-500">Select Industry</div>
          <div className="text-xs font-medium text-gray-500">Choose Template</div>
          <div className="text-xs font-medium text-gray-500">Configure Agent</div>
        </div>
      </div>

      {/* Step 1: Select Industry */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Select an Industry</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <Card 
                key={industry.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedIndustry?.id === industry.id 
                    ? 'ring-2 ring-primary-500 shadow-md' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleIndustrySelect(industry)}
              >
                <Card.Body>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg ${industry.bgColor} flex items-center justify-center`}>
                      {industry.icon()}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{industry.name}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">{industry.description}</p>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Choose Template */}
      {currentStep === 2 && selectedIndustry && (
        <div className="space-y-6">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentStep(1)}
              className="text-primary-600 hover:text-primary-700 mr-2"
            >
              Back
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Choose a Template for {selectedIndustry.name}</h2>
          </div>
          
          <div className="space-y-4">
            {getTemplatesForIndustry(selectedIndustry.id).map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all duration-200 ${
                  selectedTemplate?.id === template.id 
                    ? 'ring-2 ring-primary-500 shadow-md' 
                    : 'hover:shadow-sm'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <Card.Body>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Bot className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                    <div className="ml-auto">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Configure Agent */}
      {currentStep === 3 && selectedIndustry && selectedTemplate && (
        <div className="space-y-6">
          <div className="flex items-center">
            <button 
              onClick={() => setCurrentStep(2)}
              className="text-primary-600 hover:text-primary-700 mr-2"
            >
              Back
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Configure Your Agent</h2>
          </div>
          
          <Card>
            <Card.Header>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedTemplate.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedIndustry.name} • {selectedTemplate.description}
                  </p>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-6">
                <div>
                  <Input
                    label="Agent Name"
                    id="agent-name"
                    placeholder="Enter a name for your agent"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    fullWidth
                    required
                  />
                </div>
                <div>
                  <label htmlFor="agent-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Description
                  </label>
                  <textarea
                    id="agent-description"
                    rows={3}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Describe what your agent will do"
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AgentRoleSelector
                    selectedRole={selectedRole}
                    onChange={setSelectedRole}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Agent (Optional)
                    </label>
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={selectedParentAgent}
                      onChange={(e) => setSelectedParentAgent(e.target.value)}
                    >
                      <option value="">None (Top-level agent)</option>
                      {agents
                        .filter(agent => agent.industry === selectedIndustry.id)
                        .map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} {agent.role ? `(${agent.role})` : ''}
                          </option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Select a parent agent to establish a hierarchical relationship
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Advanced Configuration</h4>
                  <div className="space-y-2">
                    {Object.entries(advancedSettings).map(([category, settings]) => (
                      <div key={category} className="border border-gray-200 rounded-md">
                        <button
                          className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
                          onClick={() => toggleSectionExpand(category)}
                        >
                          <span className="font-medium text-gray-700">{category}</span>
                          {expandedSection === category ? (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        {expandedSection === category && (
                          <div className="px-4 py-3 space-y-3">
                            {settings.map((setting) => (
                              <div key={setting.id} className="flex items-center">
                                <input
                                  id={setting.id}
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor={setting.id} className="ml-2 block text-sm text-gray-700">
                                  {setting.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="flex justify-end">
                <Button
                  onClick={handleCreateAgent}
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Create and Deploy
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
};

// Mock data
const templatesByIndustry: Record<string, AgentTemplate[]> = {
  'real-estate': [
    {
      id: 're-listing',
      name: 'Listing Assistant',
      description: 'Helps create, manage, and optimize property listings',
      features: ['Property description generation', 'Market analysis', 'Pricing recommendations'],
    },
    {
      id: 're-buyer',
      name: 'Buyer Matchmaker',
      description: 'Matches potential buyers with suitable properties',
      features: ['Preference analysis', 'Property recommendations', 'Scheduling viewings'],
    },
    {
      id: 're-market',
      name: 'Market Analyst',
      description: 'Provides real estate market insights and trends',
      features: ['Price trend analysis', 'Neighborhood reports', 'Investment opportunities'],
    },
    {
      id: 're-executive',
      name: 'Executive Director',
      description: 'Oversees and coordinates all real estate operations',
      features: ['Strategic planning', 'Team coordination', 'Performance monitoring'],
    },
  ],
  'fintech': [
    {
      id: 'fin-advisor',
      name: 'Financial Advisor',
      description: 'Provides personalized financial advice and recommendations',
      features: ['Investment suggestions', 'Budget planning', 'Retirement planning'],
    },
    {
      id: 'fin-risk',
      name: 'Risk Analyzer',
      description: 'Analyzes financial risk and provides mitigation strategies',
      features: ['Risk assessment', 'Fraud detection', 'Security recommendations'],
    },
    {
      id: 'fin-director',
      name: 'Financial Director',
      description: 'Directs and coordinates financial services and operations',
      features: ['Financial strategy', 'Regulatory compliance', 'Performance optimization'],
    },
  ],
  'healthcare': [
    {
      id: 'health-patient',
      name: 'Patient Engagement',
      description: 'Enhances patient communication and care coordination',
      features: ['Appointment reminders', 'Medication management', 'Care plan adherence'],
    },
    {
      id: 'health-provider',
      name: 'Provider Assistant',
      description: 'Assists healthcare providers with clinical and administrative tasks',
      features: ['Documentation assistance', 'Clinical decision support', 'Patient follow-up'],
    },
    {
      id: 'health-director',
      name: 'Healthcare Director',
      description: 'Coordinates healthcare operations and workflows',
      features: ['Workflow optimization', 'Resource allocation', 'Compliance management'],
    },
  ],
  'senior-living': [
    {
      id: 'senior-care',
      name: 'Care Coordinator',
      description: 'Coordinates care services and monitors wellness',
      features: ['Care schedule management', 'Medication reminders', 'Health monitoring'],
    },
    {
      id: 'senior-family',
      name: 'Family Connector',
      description: 'Facilitates communication between seniors and family members',
      features: ['Activity updates', 'Photo sharing', 'Video call scheduling'],
    },
  ],
  'telecommunications': [
    {
      id: 'telecom-support',
      name: 'Customer Support',
      description: 'Provides technical support and service information',
      features: ['Troubleshooting assistance', 'Service information', 'Upgrade recommendations'],
    },
    {
      id: 'telecom-network',
      name: 'Network Analyzer',
      description: 'Monitors and optimizes network performance',
      features: ['Performance monitoring', 'Issue detection', 'Optimization recommendations'],
    },
  ],
  'education': [
    {
      id: 'edu-tutor',
      name: 'Virtual Tutor',
      description: 'Provides personalized learning assistance to students',
      features: ['Concept explanations', 'Practice problems', 'Progress tracking'],
    },
    {
      id: 'edu-admin',
      name: 'Administrative Assistant',
      description: 'Assists with educational administrative tasks',
      features: ['Scheduling', 'Record-keeping', 'Communication management'],
    },
  ],
  'retail': [
    {
      id: 'retail-inventory',
      name: 'Inventory Manager',
      description: 'Monitors and optimizes product inventory',
      features: ['Stock level tracking', 'Reorder suggestions', 'Seasonal planning'],
    },
    {
      id: 'retail-customer',
      name: 'Customer Engagement',
      description: 'Enhances customer shopping experience',
      features: ['Product recommendations', 'Query handling', 'Loyalty program management'],
    },
  ],
  'manufacturing': [
    {
      id: 'mfg-quality',
      name: 'Quality Control',
      description: 'Ensures product quality standards are met',
      features: ['Defect detection', 'Process monitoring', 'Quality reporting'],
    },
    {
      id: 'mfg-production',
      name: 'Production Optimizer',
      description: 'Optimizes manufacturing processes and workflows',
      features: ['Efficiency analysis', 'Bottleneck detection', 'Resource allocation'],
    },
  ],
  'custom': [
    {
      id: 'custom-basic',
      name: 'Basic Agent',
      description: 'A simple, customizable agent for general purposes',
      features: ['Basic conversational abilities', 'Customizable responses', 'Simple task automation'],
    },
    {
      id: 'custom-advanced',
      name: 'Advanced Agent',
      description: 'A powerful, highly customizable agent for complex tasks',
      features: ['Advanced natural language processing', 'Custom workflow integration', 'Multi-step reasoning'],
    },
    {
      id: 'custom-meta',
      name: 'Meta Agent',
      description: 'An agent that can create and manage other agents',
      features: ['Agent creation', 'Agent management', 'Cross-agent coordination'],
    },
  ],
  'logistics': [
    {
      id: 'log-route',
      name: 'Route Optimizer',
      description: 'Optimizes delivery routes for efficiency',
      features: ['Route planning', 'Traffic analysis', 'Fuel optimization'],
    },
    {
      id: 'log-track',
      name: 'Shipment Tracker',
      description: 'Tracks and manages shipments throughout delivery process',
      features: ['Real-time tracking', 'Status updates', 'Delivery estimation'],
    },
  ],
  'hospitality': [
    {
      id: 'hosp-booking',
      name: 'Booking Manager',
      description: 'Handles reservations and booking management',
      features: ['Reservation processing', 'Availability updates', 'Guest communication'],
    },
    {
      id: 'hosp-concierge',
      name: 'Virtual Concierge',
      description: 'Provides guest services and information',
      features: ['Local recommendations', 'Service requests', 'Event planning'],
    },
  ],
  'legal': [
    {
      id: 'legal-research',
      name: 'Legal Researcher',
      description: 'Conducts legal research and document analysis',
      features: ['Case research', 'Document review', 'Precedent identification'],
    },
    {
      id: 'legal-assistant',
      name: 'Legal Assistant',
      description: 'Assists with legal administrative tasks',
      features: ['Document preparation', 'Calendar management', 'Client communication'],
    },
  ],
  'agriculture': [
    {
      id: 'ag-crop',
      name: 'Crop Monitor',
      description: 'Monitors crop health and growing conditions',
      features: ['Growth tracking', 'Disease detection', 'Yield prediction'],
    },
    {
      id: 'ag-farm',
      name: 'Farm Manager',
      description: 'Assists with farm management and operations',
      features: ['Resource planning', 'Schedule optimization', 'Equipment tracking'],
    },
  ],
  'energy': [
    {
      id: 'energy-usage',
      name: 'Usage Monitor',
      description: 'Monitors and optimizes energy consumption',
      features: ['Usage analysis', 'Efficiency recommendations', 'Cost reduction'],
    },
    {
      id: 'energy-grid',
      name: 'Grid Manager',
      description: 'Manages energy distribution and grid operations',
      features: ['Load balancing', 'Outage prediction', 'Maintenance scheduling'],
    },
  ],
  'government': [
    {
      id: 'gov-service',
      name: 'Public Service Assistant',
      description: 'Assists with public service delivery and citizen engagement',
      features: ['Information provision', 'Form processing', 'Service requests'],
    },
    {
      id: 'gov-compliance',
      name: 'Compliance Monitor',
      description: 'Ensures regulatory compliance and monitoring',
      features: ['Regulation tracking', 'Compliance checking', 'Violation reporting'],
    },
  ],
  'insurance': [
    {
      id: 'ins-claims',
      name: 'Claims Processor',
      description: 'Processes and manages insurance claims',
      features: ['Claim validation', 'Documentation review', 'Payment processing'],
    },
    {
      id: 'ins-risk',
      name: 'Risk Assessor',
      description: 'Evaluates insurance risks and premium calculations',
      features: ['Risk evaluation', 'Premium calculation', 'Policy recommendations'],
    },
  ],
};

const advancedSettings = {
  'API Integrations': [
    { id: 'huggingface-integration', name: 'Hugging Face Models' },
    { id: 'gcp-integration', name: 'Google Cloud AI APIs' },
    { id: 'custom-api', name: 'Custom API Integration' },
  ],
  'Security & Compliance': [
    { id: 'data-encryption', name: 'Data Encryption' },
    { id: 'api-key-vault', name: 'API Key Vault' },
    { id: 'audit-logging', name: 'Audit Logging' },
  ],
  'Deployment Options': [
    { id: 'gcp-cloud-run', name: 'GCP Cloud Run' },
    { id: 'containerized', name: 'Containerized Deployment' },
    { id: 'serverless', name: 'Serverless Functions' },
  ],
  'Agent Capabilities': [
    { id: 'natural-language', name: 'Natural Language Processing' },
    { id: 'document-analysis', name: 'Document Analysis' },
    { id: 'sentiment-analysis', name: 'Sentiment Analysis' },
    { id: 'image-recognition', name: 'Image Recognition' },
  ],
  'Collaboration Settings': [
    { id: 'agent-messaging', name: 'Inter-Agent Messaging' },
    { id: 'event-triggers', name: 'Event-Based Triggers' },
    { id: 'shared-memory', name: 'Shared Knowledge Base' },
    { id: 'escalation-paths', name: 'Hierarchical Escalation' },
  ],
};

export default CreateAgentPage;