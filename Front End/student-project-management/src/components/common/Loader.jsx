import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ text = 'Loading...', size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-gray-500">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-600 mb-3`} />
      {text && <p className="text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};
