"use client";
// src/app/not-found.tsx - Custom 404 Page
import Link from 'next/link';
import Image from 'next/image';
import { Home, ArrowLeft, Search, Mail } from 'react-feather';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
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

        {/* 404 Illustration */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="text-8xl font-bold text-purple-200 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-16 h-16 text-purple-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or the URL might be incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Action - Go Home */}
          <Link
            href="/"
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Link>

          {/* Secondary Actions */}
          <div className="flex space-x-4">
            <button
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            
            <Link
              href="/contact"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Link>
          </div>
        </div>

        {/* Helpful Links */}
        <div className="border-t border-gray-200 pt-6 space-y-3">
          <p className="text-sm text-gray-500">
            You might be looking for:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/dashboard" 
              className="text-purple-600 hover:text-purple-800 hover:underline"
            >
              Dashboard
            </Link>
            <Link 
              href="/campaigns" 
              className="text-purple-600 hover:text-purple-800 hover:underline"
            >
              Campaigns
            </Link>
            <Link 
              href="/discover" 
              className="text-purple-600 hover:text-purple-800 hover:underline"
            >
              Discover
            </Link>
            <Link 
              href="/help" 
              className="text-purple-600 hover:text-purple-800 hover:underline"
            >
              Help Center
            </Link>
          </div>
        </div>

        {/* Error Code for Debugging */}
        <div className="text-xs text-gray-400 font-mono">
          Error 404 - Page Not Found
        </div>
      </div>
    </div>
  );
}