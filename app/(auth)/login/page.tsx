// src/app/(auth)/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { ChevronLeft } from 'react-feather';

export default function Login() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  // Check if user is already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      // Add animation delay
      const timer = setTimeout(() => {
        setShowForm(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);
  
  const handleLoginSuccess = () => {
    // Redirect to dashboard instead of discover
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Back to Landing Page button */}
      {/* <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-purple-600 transition-colors z-10"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span>Back to Home</span>
      </Link> */}

      {/* Left side with login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-6 py-12">
        <div className={`w-full max-w-md transform transition-all duration-700 ease-in-out ${showForm ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center mb-8">
            <Link href="/">
              <Image 
                src="/echooo-logo.svg" 
                alt="Echooo" 
                width={180} 
                height={50} 
                className="h-8 w-auto mx-auto mb-6 hover:opacity-80 transition-opacity" 
              />
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome Back</h1>
            <p className="text-gray-600">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
          
          <p className="text-center text-sm text-gray-600 mt-8">
            Don't have an account?{' '}
            <Link href="/register" className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition">
              Create an account
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side with illustration */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-purple-600 to-blue-500 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col h-full justify-center">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-6">Manage Your Influencer Campaigns</h2>
            <p className="text-xl text-purple-100">
              Connect with the right influencers, track campaigns, and measure your ROI all in one place.
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              { title: "Find the perfect match", description: "Our AI-powered algorithm connects you with influencers aligned with your brand." },
              { title: "Track performance", description: "Get real-time analytics and insights into your campaign performance." },
              { title: "Grow your reach", description: "Expand your audience and increase engagement with targeted campaigns." }
            ].map((feature, i) => (
              <div key={i} className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3 mt-1">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{feature.title}</h3>
                  <p className="text-purple-100 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-5 right-5 text-white text-sm opacity-70">
          &copy; {new Date().getFullYear()} Echooo. All rights reserved.
        </div>
      </div>
    </div>
  );
}