import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Search, MoreVertical, Play, Pause, Copy, Trash2, Edit, Filter } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { useAgent } from '../context/AgentContext';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useInView } from 'react-intersection-observer';

// Number of agents to show per page
const PAGE_SIZE = 9;

const ManageAgentsPage: React.FC = () => {
  const { agents, getAgents, deleteAgent, toggleAgentStatus } = useAgent();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '300px',
  });

  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true);
      try {
        await getAgents();
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, [getAgents]);
  
  // Reset visible count when search/filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, filterIndustry]);
  
  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && filteredAgents.length > visibleCount) {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filteredAgents.length));
    }
  }, [inView]);

  const handleToggleStatus = async (agentId: string, currentStatus: boolean) => {
    try {
      await toggleAgentStatus(agentId, !currentStatus);
    } catch (error) {
      console.error('Failed to toggle agent status:', error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (window.confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      try {
        await deleteAgent(agentId);
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };

  // Memoize filtered agents to prevent unnecessary re-filtering
  const filteredAgents = useMemo(() => {
    return agents
      .filter((agent) => agent.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((agent) => !filterIndustry || agent.industry === filterIndustry);
  }, [agents, searchTerm, filterIndustry]);
  
  // Get just the agents to display based on pagination
  const displayedAgents = useMemo(() => {
    return filteredAgents.slice(0, visibleCount);
  }, [filteredAgents, visibleCount]);

  const industries = useMemo(() => {
    return Array.from(new Set(agents.map((agent) => agent.industry)));
  }, [agents]);

  return (
    <ErrorBoundary>
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage AI Agents</h1>
            <p className="mt-2 text-gray-600">
              View, edit, and monitor all your AI agents in one place. Deploy changes and track performance.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/create">
              <Button leftIcon={<Bot className="h-4 w-4" />}>Create New Agent</Button>
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              fullWidth
            />
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative">
              <select
                className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={filterIndustry || ''}
                onChange={(e) => setFilterIndustry(e.target.value || null)}
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry.charAt(0).toUpperCase() + industry.slice(1)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {isLoading && displayedAgents.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <Card>
            <Card.Body className="py-12 text-center">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterIndustry
                  ? "We couldn't find any agents matching your search criteria."
                  : "You haven't created any AI agents yet."}
              </p>
              <Link to="/create">
                <Button>Create Your First Agent</Button>
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedAgents.map((agent) => (
              <Card key={agent.id} className="relative">
                {selectedAgent === agent.id && (
                  <div className="absolute top-0 right-0 mt-2 mr-2 bg-white rounded-md shadow-lg z-10 py-1">
                    <Link to={`/edit/${agent.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Edit className="h-4 w-4 inline mr-2" />
                      Edit
                    </Link>
                    <Link to={`/deploy/${agent.id}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Copy className="h-4 w-4 inline mr-2" />
                      Clone
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => handleDeleteAgent(agent.id)}
                    >
                      <Trash2 className="h-4 w-4 inline mr-2" />
                      Delete
                    </button>
                  </div>
                )}
                <Card.Body>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className={`w-10 h-10 rounded-lg ${agent.active ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                        <Bot className={`h-5 w-5 ${agent.active ? 'text-green-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          {agent.name}
                          {agent.active && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{agent.industry}</p>
                      </div>
                    </div>
                    <button
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-gray-600 line-clamp-3">{agent.description || 'No description provided'}</p>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">Template:</span>
                      <span className="ml-1">{agent.template}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="font-medium">Created:</span>
                      <span className="ml-1">{new Date(agent.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-between">
                    <Button
                      variant={agent.active ? 'outline' : 'primary'}
                      size="sm"
                      leftIcon={agent.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      onClick={() => handleToggleStatus(agent.id, agent.active)}
                    >
                      {agent.active ? 'Pause' : 'Activate'}
                    </Button>
                    <Link to={`/deploy/${agent.id}`}>
                      <Button variant="secondary" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            ))}
            
            {/* Sentinel element for infinite scrolling */}
            {filteredAgents.length > visibleCount && (
              <div ref={ref} className="h-10 w-full flex justify-center items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ManageAgentsPage;