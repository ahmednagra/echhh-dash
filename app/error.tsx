// src/app/error.tsx - Global Error Boundary
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCw, Home, AlertTriangle, AlertCircle } from 'react-feather';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  // Determine error type and message
  const getErrorInfo = () => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Connection Problem',
        description: 'Unable to connect to our servers. Please check your internet connection and try again.',
        icon: <RefreshCw className="w-16 h-16 text-orange-400" />
      };
    }
    
    if (message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        description: 'The request took too long to complete. This might be a temporary issue.',
        icon: <AlertTriangle className="w-16 h-16 text-yellow-400" />
      };
    }
    
    if (message.includes('unauthorized') || message.includes('auth')) {
      return {
        title: 'Authentication Error',
        description: 'Your session may have expired. Please try logging in again.',
        icon: <AlertTriangle className="w-16 h-16 text-red-400" />
      };
    }
    
    // Default error
    return {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Our team has been notified and is working on a fix.',
      icon: <AlertCircle className="w-16 h-16 text-red-400" />
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        
        {/* Logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/echooo-logo.svg" 
              alt="Echooo" 
              width={150} 
              height={40} 
              className="h-10 w-auto" 
            />
          </Link>
        </div>

        {/* Error Icon */}
        <div className="flex justify-center">
          {errorInfo.icon}
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600 leading-relaxed">
            {errorInfo.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Action - Try Again */}
          <button
            onClick={reset}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>

          {/* Secondary Action - Go Home */}
          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>

        {/* Error Details (for development) */}
        {/* {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-gray-100 rounded-lg p-4 mt-6">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-gray-600 overflow-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )} */}

        {/* Helpful Info */}
        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-500">
            If this problem persists, please{' '}
            <Link 
              href="/contact" 
              className="text-red-600 hover:text-red-800 hover:underline"
            >
              contact our support team
            </Link>
          </p>
        </div>

        {/* Error Code for Reference */}
        <div className="text-xs text-gray-400 font-mono">
          Error ID: {error.digest || 'Unknown'}
        </div>
      </div>
    </div>
  );
}