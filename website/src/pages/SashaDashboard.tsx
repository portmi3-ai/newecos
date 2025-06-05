import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { SashaChat } from '../components/agents/SashaChat';
import { GoogleAIPanel } from '../components/panels/GoogleAIPanel';
import { HuggingFacePanel } from '../components/panels/HuggingFacePanel';
import { GitHubPanel } from '../components/panels/GitHubPanel';
import { FirebaseTest } from '../components/FirebaseTest';

export const SashaDashboard: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string>('chat');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'sasha_settings', user.uid));
        setUser({
          ...user,
          settings: userDoc.exists() ? userDoc.data() : {}
        });
      } else {
        setUser(null);
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'chat':
        return <SashaChat />;
      case 'google':
        return <GoogleAIPanel />;
      case 'huggingface':
        return <HuggingFacePanel />;
      case 'github':
        return <GitHubPanel />;
      default:
        return <SashaChat />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Sasha Dashboard</h2>
          {user && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-medium">{user.email || 'Anonymous'}</p>
            </div>
          )}
        </div>
        <nav className="mt-4">
          <button
            onClick={() => setActivePanel('chat')}
            className={`w-full text-left px-4 py-2 ${
              activePanel === 'chat' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActivePanel('google')}
            className={`w-full text-left px-4 py-2 ${
              activePanel === 'google' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            Google AI
          </button>
          <button
            onClick={() => setActivePanel('huggingface')}
            className={`w-full text-left px-4 py-2 ${
              activePanel === 'huggingface' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            Hugging Face
          </button>
          <button
            onClick={() => setActivePanel('github')}
            className={`w-full text-left px-4 py-2 ${
              activePanel === 'github' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
            }`}
          >
            GitHub
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <FirebaseTest />
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          {renderPanel()}
        </div>
      </div>
    </div>
  );
}; 