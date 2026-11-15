import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMobileToggle={() => setMobileOpen(true)}
          isCollapsed={isCollapsed}
        />

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
            isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
          }`}
        >
          <Outlet />
        </main>

        <Footer isCollapsed={isCollapsed} />
      </div>
    </div>
  );
};
