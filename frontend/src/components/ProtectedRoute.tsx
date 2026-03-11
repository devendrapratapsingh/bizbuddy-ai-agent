import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, ...props }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <React.Fragment {...props}>{children}</React.Fragment>;
};

export const AdminRoute = ({ children, ...props }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <React.Fragment {...props}>{children}</React.Fragment>;
};

export const BusinessRoute = ({ children, businessId, ...props }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user belongs to the business (simplified check)
  const hasAccess = user?.businesses?.includes(businessId);

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <React.Fragment {...props}>{children}</React.Fragment>;
};