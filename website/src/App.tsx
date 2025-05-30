import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

// Layouts
import MainLayout from './layouts/MainLayout';

// Always imported pages (critical path)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import NotFoundPage from './pages/NotFoundPage';

// Lazily loaded pages
const CreateAgentPage = lazy(() => import('./pages/CreateAgentPage'));
const ManageAgentsPage = lazy(() => import('./pages/ManageAgentsPage'));
const DeployAgentPage = lazy(() => import('./pages/DeployAgentPage'));
const DocumentationPage = lazy(() => import('./pages/DocumentationPage'));
const EcosystemPage = lazy(() => import('./pages/EcosystemPage'));
const AgentRelationshipsPage = lazy(() => import('./pages/AgentRelationshipsPage'));
const VerticalBlueprintsPage = lazy(() => import('./pages/VerticalBlueprintsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const FundingAdvisorPage = lazy(() => import('./pages/FundingAdvisorPage'));

// Context Providers
import { AgentProvider } from './context/AgentContext';
import { AuthProvider } from './context/AuthContext';

// Error Fallback UI
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
      <pre className="p-4 bg-gray-100 rounded-lg mb-4 max-w-lg overflow-auto text-left">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Try again
      </button>
    </div>
  );
}

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider>
          <AgentProvider>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <CreateAgentPage />
                  </Suspense>
                } />
                <Route path="/manage" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ManageAgentsPage />
                  </Suspense>
                } />
                <Route path="/deploy/:agentId" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DeployAgentPage />
                  </Suspense>
                } />
                <Route path="/documentation" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DocumentationPage />
                  </Suspense>
                } />
                <Route path="/ecosystem" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <EcosystemPage />
                  </Suspense>
                } />
                <Route path="/relationships" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AgentRelationshipsPage />
                  </Suspense>
                } />
                <Route path="/blueprints" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <VerticalBlueprintsPage />
                  </Suspense>
                } />
                <Route path="/pricing" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <PricingPage />
                  </Suspense>
                } />
                <Route path="/checkout/success" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <CheckoutSuccessPage />
                  </Suspense>
                } />
                <Route path="/account" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AccountPage />
                  </Suspense>
                } />
                <Route path="/advisor" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <FundingAdvisorPage />
                  </Suspense>
                } />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </AgentProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;