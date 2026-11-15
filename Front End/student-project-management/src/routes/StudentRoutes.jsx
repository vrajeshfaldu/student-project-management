import React from 'react';
import { RoleRoute } from './RoleRoute';

export const StudentRoutes = () => {
  return <RoleRoute allowedRoles={['Admin', 'Faculty', 'Student']} />;
};
