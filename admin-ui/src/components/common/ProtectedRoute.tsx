import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGetCurrentUserQuery } from '../../api/apiSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'viewer';
}

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 * Can also enforce role-based access control
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const { isLoading, error } = useGetCurrentUserQuery();

  // If not authenticated, redirect to login
  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role check is required and user doesn't have the required role
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    // Admin always has access to all routes
    return <Navigate to="/dashboard" replace />;
  }

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If there's an error fetching the user
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-md max-w-md">
          <h3 className="text-red-800 font-medium">Authentication Error</h3>
          <p className="text-red-700">There was an error verifying your credentials. Please try logging in again.</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;