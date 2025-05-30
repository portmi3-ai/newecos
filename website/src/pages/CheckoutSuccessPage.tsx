import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const CheckoutSuccessPage: React.FC = () => {
  const { isAuthenticated, refreshSubscription } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Refresh subscription data to get the latest status
    refreshSubscription();
  }, [isAuthenticated, navigate, refreshSubscription]);

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Payment Successful!</h1>
        <p className="mt-4 text-xl text-gray-500">
          Thank you for your purchase. Your subscription has been activated.
        </p>
        <div className="mt-10 flex justify-center space-x-6">
          <Link to="/manage">
            <Button
              size="lg"
              rightIcon={<ArrowRight className="h-5 w-5" />}
            >
              Start Building Your Agent Ecosystem
            </Button>
          </Link>
        </div>
        <div className="mt-6">
          <Link to="/blueprints" className="text-primary-600 hover:text-primary-500">
            Explore Industry Blueprints
          </Link>
        </div>
      </div>

      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h2>
        <div className="space-y-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-600">
                1
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Explore Industry Blueprints</h3>
              <p className="mt-1 text-gray-500">
                Browse our pre-configured agent hierarchies for different industries to jumpstart your AI ecosystem.
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-600">
                2
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Create Your First Agent</h3>
              <p className="mt-1 text-gray-500">
                Set up your first AI agent with our intuitive creation wizard and customize it to your needs.
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-100 text-primary-600">
                3
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Build Your Agent Relationships</h3>
              <p className="mt-1 text-gray-500">
                Connect your agents with hierarchical and collaborative relationships to create a powerful ecosystem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;