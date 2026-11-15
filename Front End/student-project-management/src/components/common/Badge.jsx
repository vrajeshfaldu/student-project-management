import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full border';

  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    low: 'bg-gray-100 text-gray-700 border border-gray-300',
    moderate: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    medium: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    high: 'bg-orange-100 text-orange-700 border border-orange-300',
    critical: 'bg-red-100 text-red-700 border border-red-300'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  const isCustomClass = typeof variant === 'string' && (variant.includes('bg-') || variant.includes('text-') || variant.includes(' '));
  const selectedVariant = isCustomClass ? variant : (variants[variant] || variants.default);

  return (
    <span className={`${baseStyles} ${selectedVariant} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
