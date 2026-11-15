import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  UserCheck,
  Users,
  UserCog,
  CheckCircle,
  Flag,
  FolderGit2,
  GraduationCap,
  ClipboardList,
  BarChart3,
  UserCircle,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { storage } from '../helpers';

export const Sidebar = ({ isCollapsed, toggleSidebar, mobileOpen, closeMobile }) => {
  const role = storage.getAuthRole() || 'Student';
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.clearAuth();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Faculty', 'Student']
    },
    {
      title: 'Role Management',
      path: '/roles',
      icon: ShieldCheck,
      roles: ['Admin']
    },
    {
      title: 'User Type Management',
      path: '/user-types',
      icon: UserCheck,
      roles: ['Admin']
    },
    {
      title: 'User Management',
      path: '/users',
      icon: Users,
      roles: ['Admin']
    },
    {
      title: 'Role User Management',
      path: '/role-user',
      icon: UserCog,
      roles: ['Admin']
    },
    {
      title: 'Status Management',
      path: '/status',
      icon: CheckCircle,
      roles: ['Admin']
    },
    {
      title: 'Priority Management',
      path: '/priority',
      icon: Flag,
      roles: ['Admin']
    },
    {
      title: 'Projects',
      path: '/projects',
      icon: FolderGit2,
      roles: ['Admin', 'Faculty', 'Student']
    },
    {
      title: 'Project Allocations',
      path: '/project-allocations',
      icon: GraduationCap,
      roles: ['Admin', 'Faculty']
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: ClipboardList,
      roles: ['Admin', 'Faculty', 'Student']
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: BarChart3,
      roles: ['Admin', 'Faculty', 'Student']
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: UserCircle,
      roles: ['Admin', 'Faculty', 'Student']
    }
  ];

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(role || 'Student'));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-xs lg:hidden" onClick={closeMobile} />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white text-gray-700 border-r border-gray-200/80 transition-all duration-300 flex flex-col justify-between ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Top Logo & Header */}
          <div className="h-20 px-4 flex items-center justify-between border-b border-gray-100 gap-2 shrink-0">
            <div className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'w-full justify-center' : 'flex-1'}`}>
              <div
                onClick={isCollapsed ? toggleSidebar : undefined}
                className={`w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0 ${
                  isCollapsed ? 'cursor-pointer hover:bg-indigo-700 active:scale-95 transition-all' : ''
                }`}
                title={isCollapsed ? 'Click to open sidebar' : undefined}
              >
                {isCollapsed ? <Menu className="w-6 h-6 text-white" /> : <GraduationCap className="w-6 h-6 text-white" />}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1 font-sans">
                  <h1 className="text-base font-black tracking-tight text-gray-900 uppercase leading-none font-sans">PROJECT HUB</h1>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-tight mt-1 font-sans">
                    <div>STUDENT PROJECT</div>
                    <div>MANAGEMENT</div>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer shrink-0"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Role Pill Badge */}
          {!isCollapsed && (
            <div className="px-5 py-3">
              <div className="px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                {role || 'Admin'} Workspace
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 font-medium'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-sm font-medium text-red-600 hover:bg-red-50 transition cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <LogOut className="w-5 h-5 text-red-500 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
