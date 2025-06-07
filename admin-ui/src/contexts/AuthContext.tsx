import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User as ApiUser } from '../api/authApi';

// Real user data from API
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  generateApiKey: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to handle session expiration
  const handleSessionExpired = () => {
    setUser(null);
    setError('Session expired. Please log in again.');
  };

  // Add event listener for session expiration
  useEffect(() => {
    window.addEventListener('auth:sessionExpired', handleSessionExpired);
    
    // Cleanup
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    };
  }, []);

  // Check if user is logged in on mount and fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        
        // First, check if there's a token in local storage
        const token = localStorage.getItem('microtrax_token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Check token validity (will clear it if expired)
        if (!authApi.checkTokenValidity()) {
          setLoading(false);
          setError('Session expired. Please log in again.');
          return;
        }
        
        // Token is valid, get user data
        const userData = await authApi.getCurrentUser();
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        // Clear token and user data on auth error
        localStorage.removeItem('microtrax_token');
        localStorage.removeItem('microtrax_user');
        setError('Session expired. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Real login function that makes API call
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.login(email, password);
      
      if (response.success && response.token && response.user) {
        const userData = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };
        
        setUser(userData);
        localStorage.setItem('microtrax_token', response.token);
        localStorage.setItem('microtrax_user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Call logout API endpoint if available
      // await authApi.logout();
      
      // Clear user data and token
      setUser(null);
      localStorage.removeItem('microtrax_token');
      localStorage.removeItem('microtrax_user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.updatePassword(currentPassword, newPassword);
      
      if (response.success && response.token) {
        // Update token
        localStorage.setItem('microtrax_token', response.token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Update password error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authApi.generateApiKey();
      
      if (response.success && response.apiKey) {
        return response.apiKey;
      }
      
      return null;
    } catch (error) {
      console.error('Generate API key error:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate API key');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    error,
    updatePassword,
    generateApiKey,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};