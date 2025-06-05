import React, { useState, useEffect, useRef } from 'react';
import { Video, Search, Square, Mic } from 'lucide-react';
import { db } from '../../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: any;
}

export const SashaChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'sasha_conversations'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    setIsLoading(true);
    try {
      // Add user message
      await addDoc(collection(db, 'sasha_conversations'), {
        content: input,
        role: 'user',
        userId: user.uid,
        timestamp: serverTimestamp()
      });

      // TODO: Call Sasha's API here to get response
      // For now, we'll simulate a response
      setTimeout(async () => {
        await addDoc(collection(db, 'sasha_conversations'), {
          content: "I'm processing your request...",
          role: 'assistant',
          userId: user.uid,
          timestamp: serverTimestamp()
        });
        setIsLoading(false);
      }, 1000);

      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#18191A] rounded-xl shadow-lg p-4">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[70%] ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center bg-[#232526] rounded-2xl px-4 py-2 border border-[#333]">
        <span className="mr-2 text-gray-400 cursor-pointer"><Video size={20} /></span>
        <span className="mr-2 text-gray-400 cursor-pointer"><Search size={20} /></span>
        <span className="mr-2 text-gray-400 cursor-pointer"><Square size={20} /></span>
        <form onSubmit={handleSubmit} className="flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gemini"
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 px-2"
            disabled={isLoading}
          />
        </form>
        <span className="ml-2 text-gray-400 cursor-pointer"><Mic size={20} /></span>
        <button
          className="ml-2 px-3 py-1 rounded-lg bg-primary-600 text-white font-semibold disabled:opacity-50"
          type="submit"
          form="sasha-chat-form"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default SashaChat; 