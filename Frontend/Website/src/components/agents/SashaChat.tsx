import React, { useState, useRef, useEffect } from 'react';
import { sendMessageToSasha } from '../../services/sashaApi';

const userAvatar = 'https://ui-avatars.com/api/?name=You&background=0D8ABC&color=fff';
const sashaAvatar = 'https://ui-avatars.com/api/?name=Sasha&background=F39C12&color=fff';

const SashaChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ from: 'user' | 'sasha'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { from: 'user', text: input }]);
    setLoading(true);
    try {
      const response = await sendMessageToSasha(input);
      setMessages((msgs) => [...msgs, { from: 'sasha', text: response }]);
    } catch (err) {
      setMessages((msgs) => [...msgs, { from: 'sasha', text: 'Error contacting Sasha.' }]);
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: 16, background: '#f9f9f9', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 12 }}>Sasha Chat</h2>
      <div style={{ minHeight: 240, maxHeight: 320, overflowY: 'auto', border: '1px solid #eee', padding: 8, marginBottom: 8, background: '#fff', borderRadius: 6 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: msg.from === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end', marginBottom: 8 }}>
            <img src={msg.from === 'user' ? userAvatar : sashaAvatar} alt={msg.from} style={{ width: 32, height: 32, borderRadius: '50%', margin: '0 8px' }} />
            <div style={{
              background: msg.from === 'user' ? '#0D8ABC' : '#F39C12',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 16,
              maxWidth: 240,
              wordBreak: 'break-word',
              fontSize: 15,
              boxShadow: '0 1px 4px #0002',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
            <img src={sashaAvatar} alt="Sasha" style={{ width: 32, height: 32, borderRadius: '50%', margin: '0 8px' }} />
            <div style={{ background: '#F39C12', color: '#fff', padding: '8px 12px', borderRadius: 16, fontSize: 15, boxShadow: '0 1px 4px #0002' }}>
              <span className="spinner" style={{ marginRight: 8, display: 'inline-block', width: 16, height: 16, border: '2px solid #fff', borderTop: '2px solid #F39C12', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              Sasha is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' ? handleSend() : undefined}
          placeholder="Type your message..."
          style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #ccc', fontSize: 15 }}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{ padding: '8px 16px', borderRadius: 8, background: '#0D8ABC', color: '#fff', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Send
        </button>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SashaChat; 