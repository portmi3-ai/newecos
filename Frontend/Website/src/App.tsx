import React from 'react';
import SashaChat from './components/agents/SashaChat';

const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <SashaChat />
    </div>
  );
};

export default App; 