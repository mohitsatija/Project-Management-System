import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    let redirectPath = '/login';
    switch (user?.role) {
      case 'supervisor':
        redirectPath = '/supervisor/dashboard';
        break;
      case 'manager':
        redirectPath = '/manager/dashboard';
        break;
      case 'member':
        redirectPath = '/user/dashboard';
        break;
      default:
        redirectPath = '/login';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;