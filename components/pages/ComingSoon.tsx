"use client";
// src/components/pages/ComingSoon.tsx - Reusable Coming Soon Component
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowLeft, Home, Bell } from 'react-feather';

interface ComingSoonProps {
  title?: string;
  description?: string;
  feature?: string;
  showNotifyButton?: boolean;
  expectedDate?: string;
  backLink?: string;
  backLinkText?: string;
}

export default function ComingSoon({
  title = "Coming Soon",
  description = "We're working hard to bring you this feature. Stay tuned for updates!",
  feature,
  showNotifyButton = false,
  expectedDate,
  backLink = "/dashboard",
  backLinkText = "Back to Dashboard"
}: ComingSoonProps) {

  const handleNotifyMe = () => {
    // This could integrate with your notification system
    alert("We'll notify you when this feature is ready!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        
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

        {/* Coming Soon Animation */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center animate-pulse">
              <Clock className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-ping"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
            
            {feature && (
              <div className="inline-block px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {feature}
              </div>
            )}
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
              {description}
            </p>
            
            {expectedDate && (
              <p className="text-sm text-gray-500">
                Expected launch: <span className="font-medium text-purple-600">{expectedDate}</span>
              </p>
            )}
          </div>

          {/* Progress Bar (Visual) */}
          <div className="max-w-xs mx-auto">
            <div className="bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Development in progress...</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {showNotifyButton && (
              <button
                onClick={handleNotifyMe}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-105"
              >
                <Bell className="w-5 h-5 mr-2" />
                Notify Me When Ready
              </button>
            )}

            <div className="flex space-x-4">
              <Link
                href={backLink}
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {backLinkText}
              </Link>
              
              <Link
                href="/"
                className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 mb-4">
            What's coming:
          </p>
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">🚀</span>
              </div>
              <span>Enhanced UI</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-pink-600">⚡</span>
              </div>
              <span>Fast Performance</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">🎯</span>
              </div>
              <span>New Features</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-xs text-gray-400">
          We appreciate your patience as we build something amazing!
        </div>
      </div>
    </div>
  );
}