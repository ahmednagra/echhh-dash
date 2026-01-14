// src/components/auth/SessionExpiredModal.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Clock } from 'react-feather';

export default function SessionExpiredModal() {
  const router = useRouter();
  const { logout } = useAuth();
  
  // Auto-redirect after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLogin();
    }, 5000); // 5 seconds
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleLogin = async () => {
    await logout();
    router.push('/login?expired=true'); // Pass a query param to show an expired message
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-4">Your Session Has Expired</h2>
        
        <p className="text-gray-600 text-center mb-6">
          For your security, you've been logged out due to inactivity. Please log in again to continue.
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={handleLogin}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Log In Again
          </button>
        </div>
      </div>
    </div>
  );
}