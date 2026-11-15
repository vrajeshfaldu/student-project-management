import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const getReadableName = (str) => {
    if (!str) return '';
    if (str === 'dashboard') return 'Dashboard';
    if (str === 'role-user') return 'Role User Management';
    if (str === 'user-types') return 'User Type Management';
    if (str === 'roles') return 'Role Management';
    if (str === 'users') return 'User Management';
    if (str === 'status') return 'Status';
    if (str === 'priority') return 'Priority';
    if (str === 'projects') return 'Projects';
    if (str === 'project-allocations') return 'Project Allocations';
    if (str === 'tasks') return 'Tasks';
    if (str === 'reports') return 'Reports';
    if (str === 'profile') return 'Profile';
    if (str === 'create') return 'Create';
    if (str === 'edit') return 'Edit';
    if (str === 'detail') return 'Details';
    if (str === 'delete') return 'Delete Confirmation';
    return str.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3 shadow-2xs">
      <nav className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-500">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-indigo-600 transition text-gray-400">
          <Home className="w-3.5 h-3.5" />
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        {pathnames.length === 0 || pathnames[0] === 'dashboard' ? (
          <span className="text-indigo-600 font-bold">Dashboard</span>
        ) : (
          pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const title = getReadableName(value);

            return (
              <React.Fragment key={to}>
                {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                {isLast ? (
                  <span className="text-indigo-600 font-bold">{title}</span>
                ) : (
                  <Link to={to} className="hover:text-indigo-600 transition text-gray-500 font-medium">
                    {title}
                  </Link>
                )}
              </React.Fragment>
            );
          })
        )}
      </nav>
    </div>
  );
};
