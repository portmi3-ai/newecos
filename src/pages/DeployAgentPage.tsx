import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Terminal, Code, CloudOff, CloudCog as CloudCheck, ArrowRight, Download, Copy, Clipboard, Check } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAgent } from '../context/AgentContext';

const DeployAgentPage: React.FC = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { getAgentById, deployAgent } = useAgent();
  const [agent, setAgent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'failed'>('idle');
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'configuration' | 'logs'>('overview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadAgent = async () => {
      if (!agentId) return;
      
      setIsLoading(true);
      try {
        const agentData = await getAgentById(agentId);
        setAgent(agentData);
      } catch (error) {
        console.error('Failed to load agent:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgent();
  }, [agentId, getAgentById]);

  const handleDeploy = async () => {
    if (!agent) return;
    
    setIsDeploying(true);
    setDeploymentStatus('deploying');
    setDeploymentLogs([
      'Initializing deployment...',
      'Preparing agent configuration...',
    ]);

    try {
      // Simulate deployment with log updates
      for (let i = 0; i < deploymentSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDeploymentLogs(prev => [...prev, deploymentSteps[i]]);
      }

      await deployAgent(agent.id);
      
      setDeploymentStatus('success');
      setDeploymentLogs(prev => [
        ...prev, 
        'Deployment completed successfully!',
        `Agent "${agent.name}" is now live and ready to use.`,
      ]);
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentStatus('failed');
      setDeploymentLogs(prev => [
        ...prev, 
        'Error: Deployment failed.',
        'Check your configuration and try again.',
      ]);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(deployCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Agent Not Found</h2>
        <p className="mt-2 text-gray-600">The agent you're looking for doesn't exist or has been deleted.</p>
        <Button className="mt-6" onClick={() => navigate('/manage')}>
          Back to Manage Agents
        </Button>
      </div>
    );
  }

  const deployCommand = `curl -X POST "https://api.mport.ai/deploy/${agent.id}" -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json"`;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deploy Agent: {agent.name}</h1>
          <p className="mt-2 text-gray-600">
            Configure and deploy your AI agent to the cloud with a single command.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button
            onClick={handleDeploy}
            isLoading={isDeploying}
            disabled={deploymentStatus === 'deploying'}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {deploymentStatus === 'success' ? 'Redeploy' : 'Deploy to Cloud'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar with agent info */}
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <h2 className="text-lg font-medium text-gray-900">Agent Information</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1 flex items-center">
                    {agent.deployed ? (
                      <>
                        <CloudCheck className="h-5 w-5 text-green-500" />
                        <span className="ml-1.5 text-sm font-medium text-green-600">Deployed</span>
                      </>
                    ) : (
                      <>
                        <CloudOff className="h-5 w-5 text-gray-400" />
                        <span className="ml-1.5 text-sm font-medium text-gray-500">Not Deployed</span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                  <p className="mt-1 text-sm text-gray-900 capitalize">{agent.industry}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Template</h3>
                  <p className="mt-1 text-sm text-gray-900">{agent.template}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {agent.deployed && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Last Deployed</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(agent.lastDeployed).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">API Endpoint</h3>
                  {agent.deployed ? (
                    <div className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all">
                      https://api.mport.ai/agent/{agent.id}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500 italic">
                      Available after deployment
                    </p>
                  )}
                </div>
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" />}
                    disabled={!agent.deployed}
                  >
                    Download SDK
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    leftIcon={<Code className="h-4 w-4" />}
                    disabled={!agent.deployed}
                  >
                    View API Docs
                  </Button>
                </div>
              </div>
            </Card.Footer>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header className="border-b border-gray-200">
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedTab === 'overview'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedTab === 'configuration'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTab('configuration')}
                >
                  Configuration
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    selectedTab === 'logs'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTab('logs')}
                >
                  Deployment Logs
                </button>
              </div>
            </Card.Header>

            <Card.Body>
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Deployment Overview</h3>
                    <p className="text-gray-600">
                      Your AI agent can be deployed to the cloud with a single command. 
                      Once deployed, your agent will be available via a secure API endpoint.
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Deploy via Command Line</h4>
                    <div className="relative">
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm overflow-x-auto">
                        {deployCommand}
                      </div>
                      <button
                        className="absolute top-2 right-2 p-1 rounded-md bg-gray-800 text-gray-300 hover:text-white"
                        onClick={handleCopyCommand}
                      >
                        {copied ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Clipboard className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Deployment Status</h3>
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-5 sm:p-6">
                        {deploymentStatus === 'idle' && !agent.deployed && (
                          <div className="flex items-center">
                            <CloudOff className="h-8 w-8 text-gray-400" />
                            <div className="ml-5">
                              <h3 className="text-lg font-medium text-gray-900">Not Yet Deployed</h3>
                              <p className="text-sm text-gray-500">
                                Your agent is configured but hasn't been deployed yet.
                              </p>
                            </div>
                          </div>
                        )}

                        {deploymentStatus === 'idle' && agent.deployed && (
                          <div className="flex items-center">
                            <CloudCheck className="h-8 w-8 text-green-500" />
                            <div className="ml-5">
                              <h3 className="text-lg font-medium text-gray-900">Successfully Deployed</h3>
                              <p className="text-sm text-gray-500">
                                Your agent is live and available at the API endpoint.
                              </p>
                            </div>
                          </div>
                        )}

                        {deploymentStatus === 'deploying' && (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <div className="ml-5">
                              <h3 className="text-lg font-medium text-gray-900">Deploying</h3>
                              <p className="text-sm text-gray-500">
                                Your agent is being deployed to the cloud...
                              </p>
                            </div>
                          </div>
                        )}

                        {deploymentStatus === 'success' && (
                          <div className="flex items-center">
                            <CloudCheck className="h-8 w-8 text-green-500" />
                            <div className="ml-5">
                              <h3 className="text-lg font-medium text-gray-900">Successfully Deployed</h3>
                              <p className="text-sm text-gray-500">
                                Your agent is now live and available at the API endpoint.
                              </p>
                            </div>
                          </div>
                        )}

                        {deploymentStatus === 'failed' && (
                          <div className="flex items-center">
                            <CloudOff className="h-8 w-8 text-red-500" />
                            <div className="ml-5">
                              <h3 className="text-lg font-medium text-gray-900">Deployment Failed</h3>
                              <p className="text-sm text-gray-500">
                                There was an issue deploying your agent. Check the logs for details.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'configuration' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Environment Configuration</h3>
                    <p className="text-gray-600 mb-4">
                      Configure environment variables and secrets for your AI agent deployment.
                    </p>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Language Model API Key
                          </label>
                          <input
                            type="password"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter API key"
                            value="••••••••••••••••"
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cloud Project ID
                          </label>
                          <input
                            type="text"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter project ID"
                            value="mport-agent-platform"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Deployment Configuration</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Type
                        </label>
                        <select
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          defaultValue="serverless"
                        >
                          <option value="serverless">Serverless</option>
                          <option value="container">Container</option>
                          <option value="function">Function</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Instance Configuration
                        </label>
                        <select
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          defaultValue="small"
                        >
                          <option value="small">Small (2 vCPU, 2GB memory)</option>
                          <option value="medium">Medium (4 vCPU, 8GB memory)</option>
                          <option value="large">Large (8 vCPU, 16GB memory)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Auto-scaling
                        </label>
                        <div className="flex items-center">
                          <input
                            id="autoscaling"
                            type="checkbox"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            defaultChecked
                          />
                          <label htmlFor="autoscaling" className="ml-2 block text-sm text-gray-700">
                            Enable auto-scaling
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Configuration</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">deployment.yaml</h4>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-sm overflow-x-auto">
                        {`steps:
  - name: 'docker'
    args: ['build', '-t', 'registry.mport.ai/agent-${agent.id}', '.']

  - name: 'docker'
    args: ['push', 'registry.mport.ai/agent-${agent.id}']

  - name: 'cloud-sdk'
    entrypoint: deploy
    args:
      - 'agent'
      - 'agent-${agent.id}'
      - '--image'
      - 'registry.mport.ai/agent-${agent.id}'
      - '--platform'
      - 'managed'
      - '--region'
      - 'us-central1'
      - '--allow-unauthenticated'

images:
  - 'registry.mport.ai/agent-${agent.id}'`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'logs' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Deployment Logs</h3>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
                      {deploymentLogs.length > 0 ? (
                        <div className="space-y-1">
                          {deploymentLogs.map((log, index) => (
                            <div key={index} className="flex">
                              <span className="text-gray-500 mr-2">
                                {new Date().toLocaleTimeString()}
                              </span>
                              <span>{log}</span>
                            </div>
                          ))}
                          {deploymentStatus === 'deploying' && (
                            <div className="flex">
                              <span className="text-gray-500 mr-2">
                                {new Date().toLocaleTimeString()}
                              </span>
                              <span className="animate-pulse">_</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <Terminal className="h-6 w-6 mr-2" />
                          <span>No deployment logs available. Deploy to see logs.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Mock deployment steps for simulation
const deploymentSteps = [
  'Building container image...',
  'Installing dependencies...',
  'Configuring model integration...',
  'Setting up environment variables...',
  'Packaging agent configuration...',
  'Pushing container to registry...',
  'Deploying to cloud service...',
  'Configuring networking and security...',
  'Setting up API gateway...',
  'Running post-deployment tests...',
];

export default DeployAgentPage;