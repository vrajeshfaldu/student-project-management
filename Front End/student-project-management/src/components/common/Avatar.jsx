import React from 'react';

export const Avatar = ({
  src,
  name = '',
  size = 'md',
  className = ''
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const getInitials = (n) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  if (!src) {
    return (
      <div
        className={`${sizes[size]} rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center border border-indigo-200 shadow-2xs shrink-0 ${className}`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`${sizes[size]} rounded-full object-cover border border-gray-200 shadow-2xs shrink-0 ${className}`}
    />
  );
};
