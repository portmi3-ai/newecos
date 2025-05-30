import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, CreditCard, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProductByPriceId } from '../../stripe-config';

const AccountMenu: React.FC = () => {
  const { user, isAuthenticated, logout, subscription } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const isSubscribed = subscription?.subscription_status === 'active';
  const subscriptionPlan = isSubscribed && subscription.price_id 
    ? getProductByPriceId(subscription.price_id)?.name 
    : 'Free Plan';

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          to="/login"
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          Sign in
        </Link>
        <Link
          to="/signup"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center space-x-2 text-sm focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="h-5 w-5 text-primary-600" />
        </div>
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-700">{user?.name}</div>
          <div className="text-xs text-gray-500 flex items-center">
            {isSubscribed && <Crown className="h-3 w-3 text-amber-500 mr-1" />}
            {subscriptionPlan}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          
          <div className="py-1">
            <Link
              to="/account"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </div>
            </Link>
            
            <Link
              to="/pricing"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscription
                {isSubscribed && <Crown className="h-3 w-3 text-amber-500 ml-1" />}
              </div>
            </Link>
          </div>
          
          <div className="py-1 border-t border-gray-100">
            <button
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleLogout}
            >
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;