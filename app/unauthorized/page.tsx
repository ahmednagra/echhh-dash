// src/app/unauthorized/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { LogOut, Shield } from 'react-feather';
import { useCallback } from 'react';

export default function Unauthorized() {
  const { isAuthenticated, logout } = useAuth();

  // Wrap the logout function to prevent serialization issues
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="space-y-3">
          <Link href="/" className="block w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition">
            Go to Dashboard
          </Link>
          
          {isAuthenticated && (
            <LogoutButton onLogout={handleLogout} />
          )}
        </div>
        
        <div className="mt-8">
          <Image 
            src="/echooo-logo.svg" 
            alt="Echooo" 
            width={100} 
            height={30} 
            className="h-6 w-auto mx-auto opacity-50" 
          />
        </div>
      </div>
    </div>
  );
}

// Separate client component for the logout button
function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      onClick={onLogout}
      className="flex items-center justify-center w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </button>
  );
}