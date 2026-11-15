import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { storage } from '../helpers';

export const PublicRoute = () => {
  const token = storage.getAuthToken();
  return !token ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

