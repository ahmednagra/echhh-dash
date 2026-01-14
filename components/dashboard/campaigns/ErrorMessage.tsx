// src/components/dashboard/campaigns/ErrorMessage.tsx
'use client';

import { AlertCircle, RefreshCw } from 'react-feather';

interface ErrorMessageProps {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryButtonText?: string;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

export default function ErrorMessage({
  message,
  title = "Error",
  onRetry,
  retryButtonText = "Try Again",
  className = "",
  variant = "error"
}: ErrorMessageProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'error':
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'error':
      default:
        return 'text-red-500';
    }
  };

  return (
    <div className={`p-4 rounded-xl border ${getVariantStyles()} ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getIconColor()}`} />
        <div className="flex-1">
          <h3 className="font-medium mb-1">{title}</h3>
          <p className="text-sm">{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center text-sm font-medium hover:underline"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {retryButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}