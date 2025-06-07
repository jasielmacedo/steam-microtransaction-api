import axios, { AxiosError, AxiosResponse } from 'axios';
import { isTokenExpired } from '../utils/jwt';
import { navigationService } from '../utils/navigationService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  steamId?: string;
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JwtPayload interface for type safety
export interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

// Add interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('microtrax_token');
    if (token) {
      // Check if token is expired - user will be logged out in response interceptor
      // We still send the token to get proper 401 response
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't redirect if this is a login request
    const isLoginRequest = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register');
    
    // If error is 401 Unauthorized and not a retry and not a login request
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginRequest) {
      // Mark as retry attempt
      originalRequest._retry = true;
      
      // Remove expired token
      localStorage.removeItem('microtrax_token');
      localStorage.removeItem('microtrax_user');
      
      // Use React Router navigation instead of full page reload
      navigationService.replace('/login');
      
      // Custom event for auth context to handle
      window.dispatchEvent(new Event('auth:sessionExpired'));
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authApi = {
  // Check token validity before making API calls
  checkTokenValidity: (): boolean => {
    const token = localStorage.getItem('microtrax_token');
    
    if (!token) {
      return false;
    }
    
    if (isTokenExpired(token)) {
      // Clear expired token
      localStorage.removeItem('microtrax_token');
      localStorage.removeItem('microtrax_user');
      
      // Notify about expired session
      window.dispatchEvent(new Event('auth:sessionExpired'));
      return false;
    }
    
    return true;
  },
  
  // Login user
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.error || 'Login failed');
      }
      throw new Error('Login failed');
    }
  },

  // Register user
  register: async (name: string, email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/register', {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.error || 'Registration failed');
      }
      throw new Error('Registration failed');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      // Check token validity
      if (!authApi.checkTokenValidity()) {
        throw new Error('Session expired');
      }
      
      const response = await api.get<ApiResponse<User>>('/auth/me');
      
      // Check if response has the correct structure
      if (!response.data.success || !response.data.data) {
        console.error('Invalid API response format:', response.data);
        throw new Error('Failed to get user data');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data);
        throw new Error(error.response.data?.error || 'Failed to get user data');
      }
      throw new Error('Failed to get user data');
    }
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string): Promise<LoginResponse> => {
    try {
      // Check token validity
      if (!authApi.checkTokenValidity()) {
        throw new Error('Session expired');
      }
      
      const response = await api.put<LoginResponse>('/auth/updatepassword', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.error || 'Failed to update password');
      }
      throw new Error('Failed to update password');
    }
  },

  // Generate API key
  generateApiKey: async (): Promise<{ success: boolean; apiKey: string }> => {
    try {
      // Check token validity
      if (!authApi.checkTokenValidity()) {
        throw new Error('Session expired');
      }
      
      const response = await api.post<{ success: boolean; apiKey: string }>('/auth/generateapikey');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.error || 'Failed to generate API key');
      }
      throw new Error('Failed to generate API key');
    }
  },
};