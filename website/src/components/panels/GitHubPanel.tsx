import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

interface GitHubSettings {
  token: string;
  username: string;
  repositories: string[];
  lastSync: string;
}

export const GitHubPanel: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<GitHubSettings>({
    token: '',
    username: '',
    repositories: [],
    lastSync: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'sasha_settings', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            token: data.integrations?.github?.token || '',
            username: data.integrations?.github?.username || '',
            repositories: data.integrations?.github?.repositories || [],
            lastSync: data.integrations?.github?.lastSync || ''
          });
        }
      } catch (error) {
        console.error('Error loading GitHub settings:', error);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'sasha_settings', user.uid), {
        'integrations.github': {
          token: settings.token,
          username: settings.username,
          repositories: settings.repositories,
          lastSync: new Date().toISOString()
        },
        lastUpdated: new Date().toISOString()
      });
      setStatus('success');
    } catch (error) {
      console.error('Error saving GitHub settings:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">GitHub Integration</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            GitHub Token
          </label>
          <input
            type="password"
            value={settings.token}
            onChange={(e) => setSettings({ ...settings, token: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your GitHub token"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            value={settings.username}
            onChange={(e) => setSettings({ ...settings, username: e.target.value })}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your GitHub username"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleSave}
          disabled={isLoading || !settings.token}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        {status === 'success' && (
          <span className="text-green-600">Settings saved successfully!</span>
        )}
        {status === 'error' && (
          <span className="text-red-600">Error saving settings</span>
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Repository Access</h4>
        <div className="space-y-2">
          {settings.repositories.map((repo) => (
            <div key={repo} className="flex items-center justify-between">
              <span>{repo}</span>
              <span className="text-green-600">Connected</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Integration Status</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Token Status</span>
            <span className="text-green-600">Valid</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last Sync</span>
            <span>{settings.lastSync || 'Never'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 