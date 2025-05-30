import React, { useState } from 'react';
import { Search, Book, Code, Terminal, Server, ShieldCheck, HelpCircle } from 'lucide-react';
import Card from '../components/common/Card';

const DocumentationPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement documentation search functionality
    console.log('Searching for:', searchTerm);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
        <p className="mt-4 text-lg text-gray-600">
          Learn how to create, configure, and deploy AI agents using the Mport AI Agent Platform.
        </p>
        <form onSubmit={handleSearch} className="mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Search documentation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary-600 hover:text-primary-500"
            >
              <span className="text-sm font-medium">Search</span>
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar navigation */}
        <div className="md:col-span-1">
          <Card>
            <Card.Body className="p-0">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    className={`flex items-center px-4 py-3 w-full text-left ${
                      activeSection === section.id
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <section.icon
                      className={`mr-3 h-5 w-5 ${
                        activeSection === section.id ? 'text-primary-500' : 'text-gray-400'
                      }`}
                    />
                    <span className="text-sm font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </Card.Body>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <Card>
            <Card.Body>
              {activeSection === 'getting-started' && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
                  <p>
                    Welcome to the Mport AI Agent Platform documentation. This guide will help you get started with creating and deploying your first AI agent.
                  </p>

                  <h3 className="text-xl font-semibold mt-6">Prerequisites</h3>
                  <ul>
                    <li>A Mport account with API access</li>
                    <li>Basic understanding of AI and machine learning concepts</li>
                    <li>Familiarity with cloud deployment concepts</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-6">Creating Your First Agent</h3>
                  <p>
                    To create your first AI agent, follow these steps:
                  </p>
                  <ol>
                    <li>
                      <strong>Select an Industry</strong>: Choose the industry that best matches your use case. Each industry comes with pre-configured templates and models optimized for specific tasks.
                    </li>
                    <li>
                      <strong>Choose a Template</strong>: Select a template that aligns with your agent's purpose. Templates provide a starting point with pre-configured capabilities.
                    </li>
                    <li>
                      <strong>Configure Your Agent</strong>: Customize your agent's name, description, and behavior according to your needs.
                    </li>
                    <li>
                      <strong>Deploy Your Agent</strong>: Deploy your agent to the cloud with a single command.
                    </li>
                  </ol>

                  <h3 className="text-xl font-semibold mt-6">Quick Start Example</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <pre className="language-bash">
                      <code>{`# Create a new agent using the CLI
mport create-agent --name "Customer Support Bot" --industry fintech --template customer-support

# Configure the agent
mport configure-agent --id my-agent-id --set model=advanced response-type=conversational

# Deploy the agent to the cloud
mport deploy-agent --id my-agent-id`}</code>
                    </pre>
                  </div>
                </div>
              )}

              {activeSection === 'api-reference' && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900">API Reference</h2>
                  <p>
                    The Mport AI Agent Platform provides a comprehensive RESTful API for managing and interacting with your AI agents programmatically.
                  </p>

                  <h3 className="text-xl font-semibold mt-6">Authentication</h3>
                  <p>
                    All API requests require authentication using an API key. Include your API key in the Authorization header:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <pre className="language-bash">
                      <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
                    </pre>
                  </div>

                  <h3 className="text-xl font-semibold mt-6">API Endpoints</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endpoint</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/agents</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">GET</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">List all agents</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/agents</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">POST</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Create a new agent</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/agents/{'{agent_id}'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">GET</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Get agent details</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/agents/{'{agent_id}'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">PUT</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Update agent configuration</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/agents/{'{agent_id}'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">DELETE</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Delete an agent</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/agents/{'{agent_id}'}/deploy</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">POST</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Deploy an agent</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/agents/{'{agent_id}'}/query</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">POST</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Query an agent</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSection === 'deployment' && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900">Deployment Guide</h2>
                  <p>
                    This guide explains how to deploy your AI agents to the cloud using the Mport AI Agent Platform.
                  </p>

                  <h3 className="text-xl font-semibold mt-6">Deployment Options</h3>
                  <p>
                    The platform supports several deployment options:
                  </p>
                  <ul>
                    <li><strong>Serverless</strong>: Containerless deployment with automatic scaling (recommended)</li>
                    <li><strong>Function</strong>: Lightweight functions for simple agents</li>
                    <li><strong>Containerized</strong>: Custom container deployment for complex agents</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-6">Deployment Process</h3>
                  <ol>
                    <li>
                      <strong>Configure Deployment Settings</strong>: Set up environment variables, instance size, and auto-scaling options.
                    </li>
                    <li>
                      <strong>Build Deployment Package</strong>: The platform packages your agent configuration, dependencies, and runtime environment.
                    </li>
                    <li>
                      <strong>Deploy to Cloud</strong>: The platform deploys your agent to the cloud and sets up the necessary infrastructure.
                    </li>
                    <li>
                      <strong>API Gateway Configuration</strong>: The platform configures API Gateway to expose your agent via a secure API endpoint.
                    </li>
                    <li>
                      <strong>Post-Deployment Verification</strong>: The platform runs tests to ensure your agent is functioning correctly.
                    </li>
                  </ol>

                  <h3 className="text-xl font-semibold mt-6">Deployment Commands</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <pre className="language-bash">
                      <code>{`# Deploy using the CLI
mport deploy-agent --id my-agent-id --service serverless

# Deploy using the API
curl -X POST "https://api.mport.ai/agents/my-agent-id/deploy" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "serverless",
    "instance_size": "small",
    "auto_scaling": true
  }'`}</code>
                    </pre>
                  </div>
                </div>
              )}

              {activeSection === 'security' && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900">Security Best Practices</h2>
                  <p>
                    Security is a top priority for the Mport AI Agent Platform. This guide outlines best practices for securing your AI agents and their deployments.
                  </p>

                  <h3 className="text-xl font-semibold mt-6">API Key Management</h3>
                  <ul>
                    <li>Rotate API keys regularly to minimize the impact of potential key exposure</li>
                    <li>Use different API keys for development and production environments</li>
                    <li>Restrict API key permissions to only what is necessary</li>
                    <li>Store API keys securely using a Secret Manager</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-6">Environment Variables</h3>
                  <p>
                    Never hardcode sensitive information in your agent configuration. Use environment variables and secret management services.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <pre className="language-bash">
                      <code>{`# Example deployment with secure environment variables
mport deploy-agent --id my-agent-id \\
  --env-from-secret MODEL_API_KEY=secrets/model-api-key/versions/1 \\
  --env-from-secret DATABASE_PASSWORD=secrets/db-password/versions/1`}</code>
                    </pre>
                  </div>

                  <h3 className="text-xl font-semibold mt-6">Network Security</h3>
                  <ul>
                    <li>Use HTTPS for all API communications</li>
                    <li>Configure proper CORS settings to restrict access to approved domains</li>
                    <li>Implement rate limiting to prevent abuse</li>
                    <li>Use Virtual Private Cloud (VPC) for additional network isolation in production</li>
                  </ul>

                  <h3 className="text-xl font-semibold mt-6">Data Protection</h3>
                  <ul>
                    <li>Minimize data collection to only what is necessary</li>
                    <li>Implement data encryption at rest and in transit</li>
                    <li>Set up appropriate data retention policies</li>
                    <li>Implement audit logging for all agent activities</li>
                  </ul>
                </div>
              )}

              {activeSection === 'faq' && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>

                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">What is an AI agent?</h3>
                      <p className="mt-2">
                        An AI agent is an autonomous software entity that can perceive its environment, make decisions, and take actions to achieve specific goals. In the context of the Mport AI Agent Platform, agents are specialized AI systems that can perform tasks in specific industries like real estate, fintech, healthcare, and more.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">How do I choose the right template for my agent?</h3>
                      <p className="mt-2">
                        Select a template based on your agent's primary purpose. Each template is optimized for specific use cases within an industry. For example, if you're building a real estate agent to help with property listings, choose the "Listing Assistant" template. If you're unsure, the "Basic Agent" template under the Custom category provides a flexible starting point.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">What is a meta agent?</h3>
                      <p className="mt-2">
                        A meta agent is a specialized AI agent that can create, configure, and manage other agents. It acts as a coordinator or orchestrator for multiple specialized agents. Meta agents are useful for complex workflows that require different types of agents working together.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">How are API keys secured?</h3>
                      <p className="mt-2">
                        The platform uses a secure Secret Manager to store and manage API keys. When you deploy an agent, the platform injects the necessary API keys as environment variables at runtime, without storing them in the container image or code.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Can I integrate my own models?</h3>
                      <p className="mt-2">
                        Yes, the platform supports custom model integration. You can configure your agent to use your own models hosted on any compatible model hosting service. Contact our support team for assistance with custom model integration.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900">How much does it cost to run an agent?</h3>
                      <p className="mt-2">
                        The cost depends on several factors, including the instance size, usage patterns, and selected models. The platform provides cost estimation tools to help you understand and manage your expenses. You're only charged for the resources your agents actually use.
                      </p>
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

const sections = [
  { id: 'getting-started', title: 'Getting Started', icon: Book },
  { id: 'api-reference', title: 'API Reference', icon: Code },
  { id: 'deployment', title: 'Deployment Guide', icon: Terminal },
  { id: 'security', title: 'Security Best Practices', icon: ShieldCheck },
  { id: 'faq', title: 'FAQ', icon: HelpCircle },
];

export default DocumentationPage;