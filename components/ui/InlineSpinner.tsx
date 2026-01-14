// src/components/ui/InlineSpinner.tsx
'use client';

interface InlineSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function InlineSpinner({ size = 'md', className = '' }: InlineSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5', 
    lg: 'w-6 h-6'
  };

  return (
    <div className={`inline-block ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}