import React from 'react';
import { RoleRoute } from './RoleRoute';

export const FacultyRoutes = () => {
  return <RoleRoute allowedRoles={['Admin', 'Faculty']} />;
};
