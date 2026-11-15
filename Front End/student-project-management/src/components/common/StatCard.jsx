import React from 'react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  color = 'blue',
  badgeText
}) => {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition duration-200 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <h4 className="text-2xl font-black text-gray-900">{value}</h4>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(trend || badgeText) && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          {trend && (
            <span
              className={`font-semibold ${
                trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-gray-500'
              }`}
            >
              {trend > 0 ? `+${trend}%` : `${trend}%`} <span className="font-normal text-gray-400">{trendLabel}</span>
            </span>
          )}
          {badgeText && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
