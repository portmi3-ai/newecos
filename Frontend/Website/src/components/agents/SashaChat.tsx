import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToSasha, clearConversation, checkHealth } from '../../services/sashaApi';
import { Video, Search, Square, Mic, Code, Server, Trash2, AlertCircle } from 'lucide-react';

const userAvatar = 'https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff';
const sashaAvatar = 'https://ui-avatars.com/api/?name=Sasha&background=F39C12&color=fff';

type Message = {
  from: 'user' | 'sasha' | 'system';
  text: string;
  timestamp: string;
};

type Mode = 'default' | 'code' | 'devops';

const SashaChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('default');
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check connection status periodically
  useEffect(() => {
    const checkConnection = async () => {
      const healthy = await checkHealth();
      setIsConnected(healthy);
      if (!healthy && messages.length === 0) {
        setMessages([{
          from: 'system',
          text: 'Unable to connect to Sasha. Please check if the server is running.',
          timestamp: new Date().toISOString()
        }]);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || !isConnected) return;
    
    const newMessage: Message = {
      from: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setLoading(true);
    
    try {
      const response = await sendMessageToSasha(input, sessionId, mode);
      
      // Update session ID if this is a new conversation
      if (!sessionId) {
        setSessionId(response.session_id);
      }
      
      // If response is not a string, show error
      if (!response || typeof response.response !== 'string') {
        setMessages(prev => [...prev, {
          from: 'system',
          text: `Sasha returned an invalid response. Please check the backend logs. Raw: ${JSON.stringify(response)}`,
          timestamp: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          from: 'sasha',
          text: response.response,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (err) {
      // Log the error object for debugging
      console.error('SashaChat error:', err);
      setMessages(prev => [...prev, {
        from: 'system',
        text: err instanceof Error ? err.message : `Error contacting Sasha: ${JSON.stringify(err)}`,
        timestamp: new Date().toISOString()
      }]);
    }
    
    setInput('');
    setLoading(false);
  };

  const handleClearConversation = async () => {
    if (sessionId) {
      try {
        await clearConversation(sessionId);
        setMessages([]);
        setSessionId(null);
      } catch (err) {
        setMessages(prev => [...prev, {
          from: 'system',
          text: err instanceof Error ? err.message : 'Failed to clear conversation.',
          timestamp: new Date().toISOString()
        }]);
      }
    } else {
      setMessages([]);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setMessages(prev => [...prev, {
      from: 'sasha',
      text: `Switched to ${newMode} mode. How can I help you?`,
      timestamp: new Date().toISOString()
    }]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#18191A] rounded-xl shadow-lg p-4">
      {!isConnected && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400">
          <AlertCircle size={20} className="mr-2" />
          <span>Not connected to Sasha. Please check if the server is running.</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleModeChange('default')}
            className={`px-3 py-1 rounded-lg ${mode === 'default' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            disabled={!isConnected}
          >
            <Search size={16} className="inline mr-1" />
            General
          </button>
          <button
            onClick={() => handleModeChange('code')}
            className={`px-3 py-1 rounded-lg ${mode === 'code' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            disabled={!isConnected}
          >
            <Code size={16} className="inline mr-1" />
            Code
          </button>
          <button
            onClick={() => handleModeChange('devops')}
            className={`px-3 py-1 rounded-lg ${mode === 'devops' ? 'bg-primary-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            disabled={!isConnected}
          >
            <Server size={16} className="inline mr-1" />
            DevOps
          </button>
        </div>
        <button
          onClick={handleClearConversation}
          className="text-gray-400 hover:text-white disabled:opacity-50"
          title="Clear conversation"
          disabled={!isConnected || messages.length === 0}
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex items-end max-w-[70%]">
              {msg.from === 'sasha' && (
                <img src={sashaAvatar} alt="Sasha" className="w-8 h-8 rounded-full mr-2" />
              )}
              <div className={`px-4 py-2 rounded-2xl ${
                msg.from === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : msg.from === 'system'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-gray-800 text-gray-100'
              }`}>
                {msg.text}
              </div>
              {msg.from === 'user' && (
                <img src={userAvatar} alt="You" className="w-8 h-8 rounded-full ml-2" />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end">
              <img src={sashaAvatar} alt="Sasha" className="w-8 h-8 rounded-full mr-2" />
              <div className="px-4 py-2 rounded-2xl bg-gray-800 text-gray-100">
                <span className="inline-block w-4 h-4 border-2 border-gray-100 border-t-transparent rounded-full animate-spin mr-2" />
                Sasha is thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center bg-[#232526] rounded-2xl px-4 py-2 border border-[#333]">
        <span className="mr-2 text-gray-400 cursor-pointer"><Video size={20} /></span>
        <span className="mr-2 text-gray-400 cursor-pointer"><Search size={20} /></span>
        <span className="mr-2 text-gray-400 cursor-pointer"><Square size={20} /></span>
        <input
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-2 disabled:opacity-50"
          placeholder={isConnected ? `Ask Sasha (${mode} mode)...` : 'Connecting to Sasha...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          disabled={loading || !isConnected}
        />
        <span className="ml-2 text-gray-400 cursor-pointer"><Mic size={20} /></span>
        <button
          className="ml-2 px-3 py-1 rounded-lg bg-primary-600 text-white font-semibold disabled:opacity-50"
          onClick={handleSend}
          disabled={loading || !input.trim() || !isConnected}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SashaChat; 