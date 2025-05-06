import React, { createContext, useContext, useState, useEffect } from 'react';

// Mock user data - In a real app, this would come from an API
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

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('microtrax_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function - In a real app, this would make an API call
  const login = async (email: string, password: string): Promise<boolean> => {
    // For demo purposes, accept any email that looks valid and any non-empty password
    if (email && email.includes('@') && password) {
      // Simulate API delay
      return new Promise((resolve) => {
        setTimeout(() => {
          const user = {
            id: '1',
            email,
            name: email.split('@')[0],
            role: 'admin',
          };
          setUser(user);
          localStorage.setItem('microtrax_user', JSON.stringify(user));
          resolve(true);
        }, 800);
      });
    }
    return Promise.resolve(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('microtrax_user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};