import React from 'react';
import { Calendar } from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';

export const PageTitle = ({ title, subtitle, actionButton, showBreadcrumb = true, showDate = false }) => {
  const isDashboard = title?.toLowerCase() === 'dashboard' || showDate;

  const today = new Date();
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayName = days[today.getDay()];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = months[today.getMonth()];
  const dateNum = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();

  const formattedDate = `${dateNum} ${monthName} ${year}`;

  return (
    <div className="mb-5 space-y-3 font-sans">
      {/* Top Title & Optional Date Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight font-sans">{title}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs font-medium text-gray-500 mt-0.5 font-sans leading-relaxed">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 font-sans">
          {actionButton}

          {/* Date Widget (Rendered ONLY on Dashboard) */}
          {isDashboard && (
            <div className="flex items-center gap-3 bg-gray-50/80 px-3.5 py-2 rounded-xl border border-gray-100 shrink-0 font-sans">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block leading-none font-sans">
                  {dayName}
                </span>
                <span className="text-xs font-bold text-gray-700 leading-tight mt-0.5 block font-sans">{formattedDate}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {showBreadcrumb && <Breadcrumb />}
    </div>
  );
};
