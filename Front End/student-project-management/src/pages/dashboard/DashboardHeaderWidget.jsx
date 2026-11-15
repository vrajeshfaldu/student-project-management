import React from 'react';
import { Calendar } from 'lucide-react';

export const DashboardHeaderWidget = () => {
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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-xs text-gray-500 font-semibold mt-1">Overview of your dashboard activities.</p>
      </div>

      {/* Date Widget (Screenshot 1) */}
      <div className="flex items-center gap-3 bg-gray-50/80 px-4 py-2.5 rounded-2xl border border-gray-100 shrink-0">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
            {dayName}
          </span>
          <span className="text-xs font-bold text-gray-800">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
