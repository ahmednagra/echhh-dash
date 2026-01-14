// src/app/loading.tsx - Global Loading Page
import Image from 'next/image';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        
        {/* Logo */}
        <div className="flex justify-center">
          <Image 
            src="/echooo-logo.svg" 
            alt="Echooo" 
            width={150} 
            height={40} 
            className="h-10 w-auto animate-pulse" 
          />
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-pulse"></div>
            
            {/* Spinning ring */}
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 border-r-purple-600 rounded-full animate-spin"></div>
            
            {/* Inner dot */}
            <div className="absolute inset-6 w-4 h-4 bg-purple-600 rounded-full animate-bounce"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-medium text-gray-900">
            Loading...
          </h2>
          <p className="text-sm text-gray-500">
            Please wait while we prepare your dashboard
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}