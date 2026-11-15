import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Select = ({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  placeholder = 'Select an option',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full font-sans">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-sans">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full py-2.5 sm:py-3 px-3.5 bg-gray-50 border rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium ${
          error
            ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-100 bg-rose-50/30'
            : 'border-gray-200 focus:border-indigo-600 focus:ring-indigo-100'
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="mt-1.5 text-xs font-bold text-rose-600 flex items-center gap-1.5 font-sans animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500 font-medium">{helperText}</p>
      ) : null}
    </div>
  );
};
