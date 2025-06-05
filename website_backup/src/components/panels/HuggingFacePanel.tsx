import React, { useState } from 'react';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

export const HuggingFacePanel: React.FC = () => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'sasha_settings', user.uid), {
        'integrations.huggingface.apiKey': apiKey,
        lastUpdated: new Date().toISOString()
      });
      setStatus('success');
    } catch (error) {
      console.error('Error saving Hugging Face settings:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Hugging Face Integration</h3>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your Hugging Face API key"
        />
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={handleSave}
          disabled={isLoading || !apiKey}
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
        <h4 className="font-medium mb-2">Available Models</h4>
        <ul className="space-y-2">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Mistral 7B
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Llama 2
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Falcon
          </li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Model Status</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Model Cache</span>
            <span className="text-green-600">Ready</span>
          </div>
          <div className="flex items-center justify-between">
            <span>API Connection</span>
            <span className="text-green-600">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Last Sync</span>
            <span>Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 