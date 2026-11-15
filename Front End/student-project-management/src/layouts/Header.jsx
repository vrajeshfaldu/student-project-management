import React, { useState } from 'react';
import { Menu, LogOut, User, Search, ChevronDown, Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/common/Avatar';
import { storage } from '../helpers';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'New Task Allocated',
      message: 'Prof. Rajesh Patel assigned "REST API Authentication" to your project.',
      time: '10 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Task Evaluated',
      message: 'Database Schema Design earned 95/100 points.',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      type: 'warning',
      title: 'Follow-up Due Soon',
      message: 'Project status review scheduled for August 4th.',
      time: 'Yesterday',
      read: true
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-scale-up font-sans">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-700 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 flex items-start gap-3 hover:bg-gray-50 transition cursor-pointer ${
                      !n.read ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      {n.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : n.type === 'warning' ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Info className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-gray-900 mb-0.5">{n.title}</p>
                      <p className="text-gray-600 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400">No notifications</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const Header = ({ onMobileToggle, isCollapsed }) => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeUser = storage.getAuthUser() || {};
  const role = storage.getAuthRole() || 'Student';

  const handleLogout = () => {
    storage.clearAuth();
    navigate('/login');
  };

  const userName = activeUser?.FullName || activeUser?.fullName || 'Active User';
  const userEmail = activeUser?.Email || activeUser?.email || 'user@spm.edu';
  const userTypeName = activeUser?.UserTypeName || activeUser?.userTypeName || (role === 'Admin' ? 'Administrator' : role === 'Faculty' ? 'Faculty Guide' : 'Student Candidate');
  const avatarSrc = activeUser?.ProfilePicturePath || activeUser?.profilePicturePath || '';

  return (
    <header
      className={`sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all duration-300 font-sans ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}
    >
      <div className="flex items-center justify-between h-full px-6 gap-6 font-sans">
        {/* Left: Mobile Toggle & Full Width Header Search Bar */}
        <div className="flex items-center gap-4 flex-1 font-sans">
          <button
            onClick={onMobileToggle}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition focus:outline-none shrink-0 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full hidden sm:block font-sans">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, tasks, users..."
              className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-100/70 border border-transparent rounded-full focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition shadow-2xs placeholder-gray-400 font-medium font-sans"
            />
          </div>
        </div>

        {/* Right: Notifications & User Profile */}
        <div className="flex items-center gap-4 shrink-0 font-sans">
          <NotificationDropdown />

          <div className="h-8 w-px bg-gray-200/80 mx-1 hidden sm:block" />

          {/* User Badge Profile */}
          <div className="relative font-sans">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-gray-100/80 transition cursor-pointer font-sans"
            >
              <Avatar
                src={avatarSrc}
                name={userName}
                size="md"
                className="ring-2 ring-indigo-300 shadow-md shrink-0"
              />
              <div className="text-left hidden md:block font-sans">
                <p className="text-sm font-bold text-gray-900 leading-tight font-sans">
                  {userName}
                </p>
                <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider mt-0.5 font-sans">
                  {userTypeName}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden py-2 animate-scale-up font-sans">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3 font-sans">
                    <Avatar
                      src={avatarSrc}
                      name={userName}
                      size="sm"
                    />
                    <div className="truncate font-sans">
                      <p className="text-sm font-bold text-gray-900 truncate font-sans">{userName}</p>
                      <p className="text-[11px] text-gray-500 truncate font-sans">{userEmail}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition cursor-pointer font-sans"
                  >
                    <User className="w-4 h-4 text-gray-400" /> My Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer border-t border-gray-100 font-sans"
                  >
                    <LogOut className="w-4 h-4 text-red-500" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
