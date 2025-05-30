import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, CreditCard, Shield, Bell, Key, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { getProductByPriceId } from '../stripe-config';
import toast from 'react-hot-toast';

const AccountPage: React.FC = () => {
  const { user, subscription } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // In a real implementation, this would call an API to update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const subscriptionPlan = subscription?.price_id 
    ? getProductByPriceId(subscription.price_id)
    : null;

  const isSubscribed = subscription?.subscription_status === 'active';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and subscription
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <Card.Body className="p-0">
              <nav className="space-y-1">
                <a
                  href="#profile"
                  className="bg-primary-50 text-primary-700 hover:bg-primary-50 hover:text-primary-700 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  <User className="text-primary-500 group-hover:text-primary-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Profile</span>
                </a>
                <a
                  href="#subscription"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  <CreditCard className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Subscription</span>
                </a>
                <a
                  href="#security"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  <Shield className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Security</span>
                </a>
                <a
                  href="#notifications"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  <Bell className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">Notifications</span>
                </a>
                <a
                  href="#api-keys"
                  className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                >
                  <Key className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6" />
                  <span className="truncate">API Keys</span>
                </a>
              </nav>
            </Card.Body>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-medium text-gray-900">Profile</h2>
            </Card.Header>
            <Card.Body>
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Name"
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      fullWidth
                    />
                  </div>
                  <div>
                    <Input
                      label="Email"
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      disabled
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Email address cannot be changed. Contact support for assistance.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <Button
                    type="submit"
                    isLoading={isUpdating}
                  >
                    Update Profile
                  </Button>
                </div>
              </form>
            </Card.Body>
          </Card>

          {/* Subscription Section */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-medium text-gray-900">Subscription</h2>
            </Card.Header>
            <Card.Body>
              {subscription ? (
                <div>
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      {isSubscribed ? (
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      ) : (
                        <XCircle className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {subscriptionPlan?.name || 'Free Plan'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Status: <span className={isSubscribed ? 'text-green-600' : 'text-gray-600'}>
                          {subscription.subscription_status.charAt(0).toUpperCase() + subscription.subscription_status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {isSubscribed && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Current period ends on <span className="font-medium text-gray-900">{formatDate(subscription.current_period_end)}</span>
                          </p>
                          {subscription.cancel_at_period_end && (
                            <p className="text-sm text-red-600 mt-1">
                              Your subscription will not renew after this period
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {subscription.payment_method_brand && subscription.payment_method_last4 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h4>
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600 capitalize">
                          {subscription.payment_method_brand} ending in {subscription.payment_method_last4}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex space-x-4">
                    {isSubscribed ? (
                      <>
                        <Button variant="outline">
                          Update Payment Method
                        </Button>
                        {subscription.cancel_at_period_end ? (
                          <Button variant="outline">
                            Resume Subscription
                          </Button>
                        ) : (
                          <Button variant="outline">
                            Cancel Subscription
                          </Button>
                        )}
                      </>
                    ) : (
                      <Link to="/pricing">
                        <Button>
                          View Pricing Plans
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription found</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have an active subscription yet. Upgrade to access premium features.
                  </p>
                  <Link to="/pricing">
                    <Button>
                      View Pricing Plans
                    </Button>
                  </Link>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Security Section */}
          <Card>
            <Card.Header>
              <h2 className="text-lg font-medium text-gray-900">Security</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Change Password</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Update your password to keep your account secure.</p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Add an extra layer of security to your account by enabling two-factor authentication.</p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline">
                      Enable Two-Factor Authentication
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;