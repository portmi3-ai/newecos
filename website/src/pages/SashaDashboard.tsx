import React, { useState } from 'react';
import SashaChat from '../components/agents/SashaChat';

// Placeholder panel components
const GoogleAIPanel: React.FC = () => (
  <div className="p-4 bg-[#232526] text-white rounded-lg shadow-lg">
    <h3 className="text-xl font-bold mb-2">Google AI</h3>
    <p>Manage Gemini, TTS, Vision, and other Google AI integrations.</p>
  </div>
);

const HuggingFacePanel: React.FC = () => (
  <div className="p-4 bg-[#232526] text-white rounded-lg shadow-lg">
    <h3 className="text-xl font-bold mb-2">Hugging Face</h3>
    <p>Search models, manage embeddings, and view memory.</p>
  </div>
);

const GitHubPanel: React.FC = () => (
  <div className="p-4 bg-[#232526] text-white rounded-lg shadow-lg">
    <h3 className="text-xl font-bold mb-2">GitHub</h3>
    <p>Search repositories, manage code, and trigger actions.</p>
  </div>
);

const SettingsPanel: React.FC = () => (
  <div className="p-4 bg-[#232526] text-white rounded-lg shadow-lg">
    <h3 className="text-xl font-bold mb-2">Settings</h3>
    <p>Manage credentials, environment variables, and runtime flags.</p>
  </div>
);

const SashaDashboard: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const renderPanel = () => {
    switch (activePanel) {
      case 'google-ai':
        return <GoogleAIPanel />;
      case 'huggingface':
        return <HuggingFacePanel />;
      case 'github':
        return <GitHubPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return (
          <div className="w-full max-w-2xl h-[80vh]">
            <SashaChat />
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#18191A]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#232526] text-white flex flex-col p-4 border-r border-[#333]">
        <h2 className="text-xl font-bold mb-6">Sasha Dashboard</h2>
        <nav className="flex-1">
          <ul className="space-y-4">
            <li className="hover:text-primary-400 cursor-pointer" onClick={() => setActivePanel('google-ai')}>Google AI</li>
            <li className="hover:text-primary-400 cursor-pointer" onClick={() => setActivePanel('huggingface')}>Hugging Face</li>
            <li className="hover:text-primary-400 cursor-pointer" onClick={() => setActivePanel('github')}>GitHub</li>
            <li className="hover:text-primary-400 cursor-pointer" onClick={() => setActivePanel('settings')}>Settings</li>
          </ul>
        </nav>
        <div className="mt-8 text-xs text-gray-400">Meta Agent v1.0</div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Status Panel */}
        <div className="bg-[#232526] text-white p-4 border-b border-[#333] flex items-center justify-between">
          <div>
            <span className="font-semibold">System Health:</span> <span className="text-green-400">All Systems Operational</span>
          </div>
          <div className="text-xs text-gray-400">User: Admin</div>
        </div>
        {/* Panel or Chat */}
        <div className="flex-1 flex items-center justify-center p-4">
          {renderPanel()}
        </div>
      </main>
    </div>
  );
};

export default SashaDashboard; 