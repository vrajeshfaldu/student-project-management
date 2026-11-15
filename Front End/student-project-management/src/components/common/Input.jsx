import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full font-sans">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-sans"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-2xs font-sans">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          type={effectiveType}
          className={`w-full py-2.5 sm:py-3 bg-gray-50 border rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium ${
            Icon ? 'pl-10' : 'pl-3.5'
          } ${isPassword ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-100 bg-rose-50/30'
              : 'border-gray-200 focus:border-indigo-600 focus:ring-indigo-100'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none transition"
            tabIndex={-1}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
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
