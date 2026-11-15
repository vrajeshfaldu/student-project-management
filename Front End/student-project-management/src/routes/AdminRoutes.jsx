import React from 'react';
import { RoleRoute } from './RoleRoute';

export const AdminRoutes = () => {
  return <RoleRoute allowedRoles={['Admin']} />;
};
