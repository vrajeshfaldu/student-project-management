import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { storage } from '../helpers';

export const ProtectedRoute = () => {
  const token = storage.getAuthToken();
  return Boolean(token) ? <Outlet /> : <Navigate to="/login" replace />;
};

