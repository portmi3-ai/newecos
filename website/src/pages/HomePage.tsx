import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Bot, ChevronRight, Cloud, Code, ShieldCheck, Zap, Grid, Network, GitBranch } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const metaAgentTeam = [
  { name: 'Sasha', role: 'Meta Agent Lead', avatar: '/assets/images/agent-avatar-sasha.png', status: 'Online' },
  { name: 'Ivy', role: 'Integration Agent', avatar: '/assets/images/agent-avatar-ivy.png', status: 'Online' },
  { name: 'Velvet', role: 'Voice Agent', avatar: '/assets/images/agent-avatar-velvet.png', status: 'Online' },
  { name: 'Dash', role: 'Dashboard Agent', avatar: '/assets/images/agent-avatar-dash.png', status: 'Online' },
  { name: 'Penny', role: 'Budget Agent', avatar: '/assets/images/agent-avatar-penny.png', status: 'Online' },
  { name: 'Atlas', role: 'DevOps Agent', avatar: '/assets/images/agent-avatar-atlas.png', status: 'Online' },
  { name: 'Sage', role: 'Documentation Agent', avatar: '/assets/images/agent-avatar-sage.png', status: 'Online' },
  { name: 'Maven', role: 'Business Agent', avatar: '/assets/images/agent-avatar-maven.png', status: 'Online' },
];

const HomePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);

  // Speak button handler
  const handleSpeak = () => {
    const message = `Hello ${user?.name || 'there'}! I am Sasha, your Meta Agent lead. Your team is online and ready to help.`;
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(message);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    } else {
      toast.error('Text-to-speech is not supported in this browser.');
    }
  };

  // Talk to Meta button handler
  const handleListen = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setListening(true);
    recognition.onresult = (event: any) => {
      setTranscript(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = (event: any) => {
      toast.error('Speech recognition error: ' + event.error);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  return (
    <div className="space-y-12 py-8">
      {/* Dashboard Section for Authenticated Users */}
      {isAuthenticated && !isLoading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Meta Agent Team */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4 text-primary-700">Your Meta Agent Team</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {metaAgentTeam.map(agent => (
                  <div key={agent.name} className="flex flex-col items-center bg-gray-50 rounded-lg p-3 shadow-sm">
                    <img src={agent.avatar} alt={agent.name} className="w-14 h-14 rounded-full mb-2 border-2 border-primary-200" />
                    <div className="font-semibold text-gray-900">{agent.name}</div>
                    <div className="text-xs text-gray-500">{agent.role}</div>
                    <span className="mt-1 text-xs text-green-600">{agent.status}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Voice Controls */}
            <div className="flex flex-col items-center gap-4">
              <button onClick={handleSpeak} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold shadow hover:bg-primary-700 transition">Speak</button>
              <button onClick={handleListen} disabled={listening} className="px-6 py-2 bg-secondary-600 text-white rounded-lg font-semibold shadow hover:bg-secondary-700 transition disabled:opacity-60">{listening ? 'Listening...' : 'Talk to Meta'}</button>
              {transcript && (
                <div className="mt-2 text-sm text-gray-700 bg-gray-100 rounded p-2 w-full text-center">You said: "{transcript}"</div>
              )}
            </div>
            {/* Cost/Usage Widget (Mock) */}
            <div className="flex flex-col items-center bg-gray-100 rounded-lg p-4 min-w-[180px]">
              <div className="text-lg font-bold text-primary-700">Usage & Budget</div>
              <div className="mt-2 text-2xl font-extrabold text-gray-900">$42.50</div>
              <div className="text-xs text-gray-500">of $300 GCP credit used</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '14%' }}></div>
              </div>
              <div className="mt-2 text-xs text-green-600">All systems operational</div>
            </div>
          </div>
        </section>
      )}
      {/* Hero Section */}
      <section className="text-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
          Build & Deploy AI Agents
          <br />
          <span className="text-gray-900">With a Single Command</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
          Create, configure, and deploy industry-specific AI agents across multiple domains. 
          Powered by enterprise-grade AI technology.
        </p>
        <div className="mt-10 flex justify-center space-x-6">
          <Link to="/create">
            <Button 
              size="lg" 
              leftIcon={<Play className="h-5 w-5" />}
            >
              Get Started
            </Button>
          </Link>
          <Link to="/documentation">
            <Button 
              variant="outline" 
              size="lg"
            >
              Documentation
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to build powerful AI ecosystems
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform provides all the tools and technologies required to create, deploy, and manage interconnected AI agents at scale.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="relative">
                <div className="absolute top-0 left-0 w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Grid className="h-6 w-6 text-primary-500" />
                </div>
                <div className="pl-16">
                  <h3 className="text-lg font-medium text-gray-900">Vertical Blueprints</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Pre-configured agent hierarchies for specific industries, ready to deploy with industry best practices built in.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-0 left-0 w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Cloud className="h-6 w-6 text-primary-500" />
                </div>
                <div className="pl-16">
                  <h3 className="text-lg font-medium text-gray-900">One-Click Deployment</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Deploy agents to the cloud with a single command. No infrastructure management required.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-0 left-0 w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Network className="h-6 w-6 text-primary-500" />
                </div>
                <div className="pl-16">
                  <h3 className="text-lg font-medium text-gray-900">Agent Relationships</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Create sophisticated agent networks with hierarchical and collaborative relationships for complex tasks.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-0 left-0 w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-primary-500" />
                </div>
                <div className="pl-16">
                  <h3 className="text-lg font-medium text-gray-900">Enterprise Security</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Built-in security best practices for API key management and data protection across your agent ecosystem.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-0 left-0 w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-primary-500" />
                </div>
                <div className="pl-16">
                  <h3 className="text-lg font-medium text-gray-900">Hierarchical Management</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Create executive, management, and operational agent levels with proper delegation and supervision.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute top-0 left-0 w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary-500" />
                </div>
                <div className="pl-16">
                  <h3 className="text-lg font-medium text-gray-900">Meta Agent Capabilities</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Create specialized agents that can create and manage other agents through simple commands.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="mt-16 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Industry Solutions</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              AI Agent Ecosystems for Every Industry
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our specialized agent blueprints are designed to solve unique challenges across multiple industries.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map((industry) => (
              <Card key={industry.name} className="transition-all duration-300 hover:shadow-md">
                <Card.Body>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg ${industry.bgColor} flex items-center justify-center`}>
                      {industry.icon()}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{industry.name}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-base text-gray-500">{industry.description}</p>
                  <div className="mt-6 flex">
                    <Link
                      to={`/create?industry=${industry.id}`}
                      className="text-primary-600 hover:text-primary-500 font-medium flex items-center"
                    >
                      Create agent <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                    <Link
                      to={`/blueprints?industry=${industry.id}`}
                      className="text-primary-600 hover:text-primary-500 font-medium flex items-center ml-4"
                    >
                      View blueprint <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-700 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 sm:px-12 lg:px-16">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Ready to build your AI ecosystem?
                </h2>
                <p className="mt-4 text-lg leading-6 text-primary-100">
                  Get started with our easy-to-use platform and deploy your first agent network in minutes.
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="inline-flex rounded-md shadow">
                    <Link to="/create">
                      <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-50">
                        Create Your First Agent
                      </Button>
                    </Link>
                  </div>
                  <div className="ml-3 inline-flex">
                    <Link to="/blueprints">
                      <Button size="lg" variant="outline" className="text-white border-white hover:bg-primary-600">
                        Explore Blueprints
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Industry data
const industries = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    description: 'AI agents for property listings, buyer/seller matching, and market analysis.',
    icon: () => <span className="material-icons">home</span>,
    bgColor: 'bg-blue-600',
  },
  {
    id: 'fintech',
    name: 'Fintech',
    description: 'Financial analysis, risk assessment, and personalized financial advice agents.',
    icon: () => <span className="material-icons">attach_money</span>,
    bgColor: 'bg-green-600',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Patient engagement, care coordination, and medical information agents.',
    icon: () => <span className="material-icons">health_and_safety</span>,
    bgColor: 'bg-red-600',
  },
  {
    id: 'senior-living',
    name: 'Senior Living',
    description: 'Care management, family communication, and wellness monitoring agents.',
    icon: () => <span className="material-icons">elderly</span>,
    bgColor: 'bg-purple-600',
  },
  {
    id: 'telecommunications',
    name: 'Telecommunications',
    description: 'Customer support, service optimization, and network analysis agents.',
    icon: () => <span className="material-icons">cell_tower</span>,
    bgColor: 'bg-orange-600',
  },
  {
    id: 'custom',
    name: 'Custom Solution',
    description: 'Build a completely custom AI agent ecosystem tailored to your specific business needs.',
    icon: () => <span className="material-icons">settings</span>,
    bgColor: 'bg-gray-600',
  },
];

export default HomePage;