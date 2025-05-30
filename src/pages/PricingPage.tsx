import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { products } from '../stripe-config';
import { createCheckoutSession } from '../services/stripe';
import toast from 'react-hot-toast';

const PricingPage: React.FC = () => {
  const { isAuthenticated, user, subscription } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, mode: 'subscription' | 'payment') => {
    if (!isAuthenticated) {
      navigate('/login?redirect=pricing');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { url } = await createCheckoutSession({
        price_id: priceId,
        success_url: `${window.location.origin}/checkout/success`,
        cancel_url: `${window.location.origin}/pricing`,
        mode,
      });

      if (url) {
        window.location.href = url;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred while creating the checkout session');
      toast.error('Failed to start checkout process');
    } finally {
      setIsLoading(false);
    }
  };

  const isSubscribed = subscription?.subscription_status === 'active';

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:flex-col sm:align-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 text-center">Pricing Plans</h1>
        <p className="mt-5 text-xl text-gray-500 text-center max-w-3xl mx-auto">
          Choose the right plan for your AI agent ecosystem needs
        </p>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-12 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Free Plan */}
        <Card className="border-2 border-gray-200">
          <Card.Header className="px-6 py-10 text-center">
            <h3 className="text-2xl font-medium text-gray-900">Free Plan</h3>
            <div className="mt-4 flex items-baseline justify-center">
              <span className="text-5xl font-extrabold text-gray-900">$0</span>
              <span className="ml-1 text-xl font-medium text-gray-500">/month</span>
            </div>
          </Card.Header>
          <Card.Body className="px-6 pt-6 pb-8">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Create up to 3 AI agents</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Basic agent templates</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Standard deployment options</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Community support</p>
              </li>
            </ul>
          </Card.Body>
          <Card.Footer className="px-6 pt-6 pb-8 text-center bg-gray-50">
            <Button
              variant="outline"
              fullWidth
              disabled={isLoading}
            >
              Current Plan
            </Button>
          </Card.Footer>
        </Card>

        {/* Pro Plan */}
        <Card className="border-2 border-primary-500 relative">
          <div className="absolute top-0 right-0 h-8 w-8">
            <div className="absolute transform rotate-45 bg-primary-600 text-white text-xs font-semibold py-1 right-[-35px] top-[15px] w-[170px] text-center">
              RECOMMENDED
            </div>
          </div>
          <Card.Header className="px-6 py-10 text-center">
            <h3 className="text-2xl font-medium text-gray-900">Pro Plan</h3>
            <div className="mt-4 flex items-baseline justify-center">
              <span className="text-5xl font-extrabold text-gray-900">$249</span>
              <span className="ml-1 text-xl font-medium text-gray-500">/month</span>
            </div>
          </Card.Header>
          <Card.Body className="px-6 pt-6 pb-8">
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700"><strong>Unlimited</strong> AI agents</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700"><strong>Advanced</strong> agent templates and industry blueprints</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Hierarchical agent orchestration</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Advanced visualization tools</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Priority support</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base text-gray-700">Custom deployment options</p>
              </li>
            </ul>
          </Card.Body>
          <Card.Footer className="px-6 pt-6 pb-8 text-center bg-gray-50">
            {isSubscribed ? (
              <Button
                variant="primary"
                fullWidth
                disabled
              >
                Current Plan
              </Button>
            ) : (
              <Button
                variant="primary"
                fullWidth
                isLoading={isLoading}
                onClick={() => handleSubscribe(products[0].priceId, products[0].mode)}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            )}
          </Card.Footer>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <h3 className="text-lg font-medium text-gray-900">Need a custom plan?</h3>
        <p className="mt-2 text-base text-gray-500">
          Contact us for enterprise pricing and custom solutions tailored to your specific needs.
        </p>
        <div className="mt-6">
          <Button variant="outline">Contact Sales</Button>
        </div>
      </div>

      <div className="mt-20 bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">What's included in the Pro plan?</h3>
            <p className="text-gray-600">
              The Pro plan includes unlimited AI agents, advanced templates, hierarchical orchestration, 
              visualization tools, priority support, and custom deployment options.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Can I cancel my subscription anytime?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              We offer a 14-day free trial of the Pro plan. No credit card required to start your trial.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards including Visa, Mastercard, American Express, and Discover.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;