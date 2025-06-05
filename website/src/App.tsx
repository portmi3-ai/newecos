import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { SashaChat } from './components/agents/SashaChat';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/sasha"
          element={
            <ProtectedRoute>
              <SashaChat />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/sasha" />} />
      </Routes>
    </Router>
  );
};
