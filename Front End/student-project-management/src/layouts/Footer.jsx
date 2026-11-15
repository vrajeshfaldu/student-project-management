import React from 'react';

export const Footer = ({ isCollapsed }) => {
  return (
    <footer
      className={`py-4 px-6 border-t border-gray-200 text-xs text-gray-500 bg-white transition-all duration-300 ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          &copy; {new Date().getFullYear()} <strong>Student Project Management System (SPM)</strong> - Semester 5
          Project
        </p>
        <p className="text-gray-400">Darshan University • Computer Science & Engineering</p>
      </div>
    </footer>
  );
};
