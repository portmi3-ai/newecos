import React from 'react';
import SashaChat from '../components/agents/SashaChat';

const MetaAgentChat: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#18191A]">
      <div className="w-full max-w-2xl">
        <div className="bg-red-500 text-white p-4 mb-4 rounded">Tailwind Test: If you see a red box, Tailwind is working!</div>
        <SashaChat />
      </div>
    </div>
  );
};

export default MetaAgentChat; 