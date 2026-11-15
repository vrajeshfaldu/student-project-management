import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-slate-900 font-sans antialiased text-gray-800 overflow-y-auto">
      <Outlet />
    </div>
  );
};
