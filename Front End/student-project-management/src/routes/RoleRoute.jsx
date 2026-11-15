import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { storage } from '../helpers';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const token = storage.getAuthToken();
  const role = storage.getAuthRole() || 'Student';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

