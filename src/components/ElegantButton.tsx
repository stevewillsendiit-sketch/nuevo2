import React from 'react';

interface ElegantButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export default function ElegantButton({ variant = 'primary', className = '', children, ...rest }: ElegantButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-shadow focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg focus:ring-blue-400',
    outline: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-200',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

