import React from 'react';
import SashaChat from './components/agents/SashaChat';

const App: React.FC = () => {
  return (
    <div>
      <h1>Meta Agent Platform</h1>
      <p>Welcome to your cloud-native AI agent platform!</p>
      <div style={{ maxWidth: 600, margin: '2rem auto' }}>
        <SashaChat />
      </div>
    </div>
  );
};

export default App; 