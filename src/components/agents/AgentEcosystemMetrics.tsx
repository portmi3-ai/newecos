import React, { useEffect, useState } from 'react';
import { useAgent } from '../../context/AgentContext';
import { AgentEcosystemMetrics as Metrics } from '../../types/agent';
import Card from '../common/Card';
import { Activity, Users, Cloud, GitBranch, Zap, BarChart2 } from 'lucide-react';

const AgentEcosystemMetrics: React.FC = () => {
  const { getEcosystemMetrics } = useAgent();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setIsLoading(true);
      try {
        const metricsData = await getEcosystemMetrics();
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to load ecosystem metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMetrics();
  }, [getEcosystemMetrics]);
  
  if (isLoading) {
    return (
      <Card>
        <Card.Body className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </Card.Body>
      </Card>
    );
  }
  
  if (!metrics) {
    return (
      <Card>
        <Card.Body className="py-6 text-center">
          <p className="text-gray-500">Failed to load ecosystem metrics</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center">
          <Activity className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Agent Ecosystem Overview</h3>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-2">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <div className="text-xs font-medium text-gray-500 uppercase">Total Agents</div>
                <div className="text-2xl font-semibold text-gray-900">{metrics.totalAgents}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-2">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <div className="text-xs font-medium text-gray-500 uppercase">Active Agents</div>
                <div className="text-2xl font-semibold text-gray-900">{metrics.activeAgents}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                <Cloud className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <div className="text-xs font-medium text-gray-500 uppercase">Deployed</div>
                <div className="text-2xl font-semibold text-gray-900">{metrics.deployedAgents}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-2">
                <GitBranch className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <div className="text-xs font-medium text-gray-500 uppercase">Hierarchy Depth</div>
                <div className="text-2xl font-semibold text-gray-900">{metrics.hierarchyDepth}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
                <BarChart2 className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <div className="text-xs font-medium text-gray-500 uppercase">Interactions</div>
                <div className="text-2xl font-semibold text-gray-900">{metrics.agentInteractions}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Industry Distribution</h4>
          <div className="space-y-3">
            {Object.entries(metrics.industryDistribution).map(([industry, count]) => (
              <div key={industry} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 capitalize">{industry}</span>
                  <span className="text-xs font-medium text-gray-700">{count} agents</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getIndustryColor(industry)}`} 
                    style={{ width: `${(count / metrics.totalAgents) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const getIndustryColor = (industry: string): string => {
  switch (industry) {
    case 'real-estate':
      return 'bg-blue-600';
    case 'fintech':
      return 'bg-green-600';
    case 'healthcare':
      return 'bg-red-600';
    case 'senior-living':
      return 'bg-purple-600';
    case 'telecommunications':
      return 'bg-orange-600';
    case 'custom':
      return 'bg-gray-600';
    default:
      return 'bg-primary-600';
  }
};

export default AgentEcosystemMetrics;