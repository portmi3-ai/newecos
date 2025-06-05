import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Fetch user's Sasha settings from Firestore
        const fetchUserSettings = async () => {
          try {
            const settingsRef = collection(db, 'sasha_settings');
            const q = query(settingsRef, where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              // Handle user settings
              console.log('User settings:', querySnapshot.docs[0].data());
            }
          } catch (error) {
            console.error('Error fetching user settings:', error);
          }
        };
        fetchUserSettings();
      } else {
        // Redirect to login if not authenticated
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const renderPanel = () => {
    if (loading) {
      return <div className="text-white">Loading...</div>;
    }

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
        <div className="mt-8 text-xs text-gray-400">
          <div>Meta Agent v1.0</div>
          {user && <div className="mt-2">Logged in as: {user.email}</div>}
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Status Panel */}
        <div className="bg-[#232526] text-white p-4 border-b border-[#333] flex items-center justify-between">
          <div>
            <span className="font-semibold">System Health:</span> <span className="text-green-400">All Systems Operational</span>
          </div>
          <div className="text-xs text-gray-400">
            {user ? `User: ${user.email}` : 'Not logged in'}
          </div>
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