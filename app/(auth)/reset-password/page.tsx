// src/app/(auth)/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'react-feather';

export default function ResetPassword() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  
  // Redirect if already authenticated
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
  
  const handleResetSuccess = () => {
    // Success is handled within the form with a success message
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with form */}
      <div className="w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-6 py-12 relative">
        {/* Back to login link */}
        <Link href="/login" className="absolute top-6 left-6 flex items-center text-gray-600 hover:text-purple-600 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">Back to Login</span>
        </Link>
        
        <div className={`w-full max-w-md transform transition-all duration-700 ease-in-out ${showForm ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center mb-8">
            <Image 
              src="/echooo-logo.svg" 
              alt="Echooo" 
              width={180} 
              height={50} 
              className="h-12 w-auto mx-auto mb-6" 
            />
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Reset Your Password</h1>
            <p className="text-gray-600">
              Enter your email to receive a password reset link
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <ResetPasswordForm onSuccess={handleResetSuccess} />
          </div>
          
          <div className="text-center text-sm text-gray-600 mt-8 space-y-2">
            <p>
              Remember your password?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition">
                Sign in
              </Link>
            </p>
            <p>
              Don't have an account?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}