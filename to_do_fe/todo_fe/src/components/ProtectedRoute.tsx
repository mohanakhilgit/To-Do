// This component checks if a user is authenticated before rendering a page.
// If not, it redirects them to the login page.

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Show a loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If the user is authenticated, render the child route.
  // The <Outlet /> component is a placeholder for the actual page component.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
