import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Textarea = ({
  label,
  error,
  className = '',
  id,
  rows = 4,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full font-sans">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-sans"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-2xs font-sans">
        <textarea
          id={textareaId}
          rows={rows}
          className={`w-full p-3.5 bg-gray-50 border rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-100 bg-rose-50/30'
              : 'border-gray-200 focus:border-indigo-600 focus:ring-indigo-100'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5 font-sans animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
