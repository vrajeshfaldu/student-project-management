import React from 'react';
import { storage } from '../../helpers';
import { AdminDashboard } from './AdminDashboard';
import { FacultyDashboard } from './FacultyDashboard';
import { StudentDashboard } from './StudentDashboard';

export const DashboardPage = () => {
  const role = storage.getAuthRole() || 'Admin';

  return (
    <div>
      {role === 'Admin' && <AdminDashboard />}
      {role === 'Faculty' && <FacultyDashboard />}
      {role === 'Student' && <StudentDashboard />}
    </div>
  );
};

