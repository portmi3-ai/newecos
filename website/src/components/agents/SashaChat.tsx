import React, { useState } from 'react';
import { Video, Search, Square, Mic } from 'lucide-react';

const SashaChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chat, setChat] = useState<{ sender: 'user' | 'sasha', text: string }[]>([]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setChat([...chat, { sender: 'user', text: message }]);
    setIsSending(true);
    try {
      const response = await fetch('/api/meta-devops/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add Authorization header if needed
        },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      setChat(prev => [...prev, { sender: 'sasha', text: data.reply || 'Sasha did not respond.' }]);
    } catch (err) {
      setChat(prev => [...prev, { sender: 'sasha', text: 'Sorry, I could not reach the server.' }]);
    }
    setIsSending(false);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#18191A] rounded-xl shadow-lg p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {chat.map((msg, idx) => (
          <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-4 py-2 rounded-2xl max-w-[70%] ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-100'}`}>{msg.text}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center bg-[#232526] rounded-2xl px-4 py-2 border border-[#333]">
        <span className="mr-2 text-gray-400 cursor-pointer"><Video size={20} /></span>
        <span className="mr-2 text-gray-400 cursor-pointer"><Search size={20} /></span>
        <span className="mr-2 text-gray-400 cursor-pointer"><Square size={20} /></span>
        <input
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-2"
          placeholder="Ask Gemini"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          disabled={isSending}
        />
        <span className="ml-2 text-gray-400 cursor-pointer"><Mic size={20} /></span>
        <button
          className="ml-2 px-3 py-1 rounded-lg bg-primary-600 text-white font-semibold disabled:opacity-50"
          onClick={handleSend}
          disabled={isSending || !message.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SashaChat; 