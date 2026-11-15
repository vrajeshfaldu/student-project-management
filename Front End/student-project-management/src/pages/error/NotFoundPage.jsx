import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft, FolderGit2, ClipboardList, UserCircle, Search, Compass } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  const quickNavLinks = [
    { title: 'Dashboard', path: '/dashboard', icon: Home, desc: 'Overview & metrics' },
    { title: 'Projects Master', path: '/projects', icon: FolderGit2, desc: 'Project catalog' },
    { title: 'Task Deliverables', path: '/tasks', icon: ClipboardList, desc: 'Submissions & scores' },
    { title: 'User Profile', path: '/profile', icon: UserCircle, desc: 'Account details' }
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50/50">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-gray-200/80 shadow-xl overflow-hidden transition-all">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-8 sm:p-12 text-white relative overflow-hidden text-center sm:text-left">
          <div className="absolute right-[-30px] bottom-[-40px] opacity-10 pointer-events-none select-none">
            <span className="text-[220px] font-black leading-none text-white">404</span>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-4">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-white border border-white/30">
              ERROR 404
            </span>
            <span className="px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-indigo-100">
              Page Not Found
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3 flex items-center justify-center sm:justify-start gap-3">
            <FileQuestion className="w-10 h-10 text-indigo-200 shrink-0" />
            Lost in Space?
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 font-medium max-w-xl">
            The URL route or resource path you requested does not exist or may have been moved within the Student Project Management System.
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Navigation Cards */}
          <div>
            <h3 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" /> Popular System Destinations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickNavLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/60 hover:bg-indigo-50/40 hover:border-indigo-200 transition-all flex items-center gap-3.5 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Assistance Note */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-3">
            <Search className="w-5 h-5 text-indigo-600 shrink-0" />
            <p className="text-xs text-indigo-900 font-medium leading-relaxed">
              Double-check the website web address for typos, or use the navigation sidebar menu on the left to access your assigned modules.
            </p>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <Button variant="outline" icon={ArrowLeft} onClick={() => navigate(-1)} className="w-full sm:w-auto">
              Go Back
            </Button>
            <Button variant="primary" icon={Home} onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
