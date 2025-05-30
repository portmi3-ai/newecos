import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

interface Subscription {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: Subscription | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || '';

// Mock data for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User'
  }
];

const MOCK_SUBSCRIPTION = {
  subscription_id: 'sub_123456',
  subscription_status: 'active',
  price_id: 'price_1RT5AWP2PbtSdcjR7gzU3BQx',
  current_period_start: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
  current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  cancel_at_period_end: false,
  payment_method_brand: 'visa',
  payment_method_last4: '4242'
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Set mock subscription for demo
      setSubscription(MOCK_SUBSCRIPTION);
    }
    
    setIsLoading(false);
  }, []);

  const refreshSubscription = async () => {
    // In a real implementation, this would fetch subscription data from an API
    try {
      if (!user) return;
      
      const response = await fetch(`${API_URL}/api/users/subscription`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        // Fallback to mock data
        setSubscription(MOCK_SUBSCRIPTION);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      // Fallback to mock data
      setSubscription(MOCK_SUBSCRIPTION);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Try to login with the real backend first
      try {
        const response = await fetch(`${API_URL}/api/users/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
          const data = await response.json();
          const userProfile = {
            id: data.id,
            name: data.name,
            email: data.email,
            token: data.token
          };
          
          setUser(userProfile);
          
          // Fetch subscription
          await refreshSubscription();
          
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(userProfile));
          
          return true;
        }
      } catch (apiError) {
        console.error('API login failed, falling back to mock:', apiError);
      }
      
      // Fallback to mock login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check credentials against mock users
      const foundUser = MOCK_USERS.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        return false;
      }
      
      const userProfile = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        token: 'mock_token_' + Math.random().toString(36).substring(2)
      };
      
      setUser(userProfile);
      setSubscription(MOCK_SUBSCRIPTION);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Try to signup with the real backend first
      try {
        const response = await fetch(`${API_URL}/api/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, name })
        });
        
        if (response.ok) {
          const data = await response.json();
          const userProfile = {
            id: data.id,
            name: data.name,
            email: data.email,
            token: data.token
          };
          
          setUser(userProfile);
          
          // Store user in localStorage
          localStorage.setItem('user', JSON.stringify(userProfile));
          
          return true;
        }
      } catch (apiError) {
        console.error('API signup failed, falling back to mock:', apiError);
      }
      
      // Fallback to mock signup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        return false;
      }
      
      // In a real app, we would create the user in a database
      // For demo purposes, we'll just create a new user object
      const newUser = {
        id: String(MOCK_USERS.length + 1),
        email,
        password,
        name
      };
      
      // Add to mock users (this would be persisted in a real app)
      MOCK_USERS.push(newUser);
      
      const userProfile = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token: 'mock_token_' + Math.random().toString(36).substring(2)
      };
      
      setUser(userProfile);
      
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userProfile));
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      setSubscription(null);
      
      // Remove user from localStorage
      localStorage.removeItem('user');
      
      // Clear all queries
      queryClient.clear();
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    subscription,
    login,
    signup,
    logout,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};