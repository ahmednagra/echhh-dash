// src/components/debug/AuthDebug.tsx - Debug component for OAuth issues
'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

export default function AuthDebug() {
  const auth = useAuth();
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const checkLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const data = {
          accessToken: localStorage.getItem('accessToken'),
          refreshToken: localStorage.getItem('refreshToken'),
          user: localStorage.getItem('user'),
          roles: localStorage.getItem('roles'),
          company: localStorage.getItem('company'),
          tokenExpiry: localStorage.getItem('tokenExpiry'),
        };
        setLocalStorageData(data);
      }
    };

    checkLocalStorage();
    
    // Check every second to see changes
    const interval = setInterval(checkLocalStorage, 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted || process.env.NODE_ENV !== 'development') {
    return null;
  }

  const parsedUser = localStorageData?.user ? JSON.parse(localStorageData.user) : null;
  const parsedRoles = localStorageData?.roles ? JSON.parse(localStorageData.roles) : null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-md overflow-auto max-h-96 z-50">
      <h3 className="font-bold mb-2 text-yellow-400">🔍 Auth Debug</h3>
      
      <div className="mb-3">
        <h4 className="font-semibold text-blue-400">Auth Context:</h4>
        <div className="ml-2">
          <div>isLoading: <span className={auth.isLoading ? 'text-red-400' : 'text-green-400'}>{String(auth.isLoading)}</span></div>
          <div>isAuthenticated: <span className={auth.isAuthenticated ? 'text-green-400' : 'text-red-400'}>{String(auth.isAuthenticated)}</span></div>
          <div>hasUser: <span className={auth.user ? 'text-green-400' : 'text-red-400'}>{String(!!auth.user)}</span></div>
          <div>userType: <span className="text-cyan-400">{auth.user?.user_type || 'null'}</span></div>
          <div>rolesCount: <span className="text-purple-400">{auth.roles?.length || 0}</span></div>
          <div>error: <span className="text-red-400">{auth.error || 'null'}</span></div>
        </div>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-blue-400">localStorage:</h4>
        <div className="ml-2">
          <div>hasToken: <span className={localStorageData?.accessToken ? 'text-green-400' : 'text-red-400'}>{String(!!localStorageData?.accessToken)}</span></div>
          <div>hasRefresh: <span className={localStorageData?.refreshToken ? 'text-green-400' : 'text-red-400'}>{String(!!localStorageData?.refreshToken)}</span></div>
          <div>hasUser: <span className={localStorageData?.user ? 'text-green-400' : 'text-red-400'}>{String(!!localStorageData?.user)}</span></div>
          <div>hasRoles: <span className={localStorageData?.roles ? 'text-green-400' : 'text-red-400'}>{String(!!localStorageData?.roles)}</span></div>
          {parsedUser && (
            <div>userType: <span className="text-cyan-400">{parsedUser.user_type || 'null'}</span></div>
          )}
          {parsedRoles && (
            <div>rolesCount: <span className="text-purple-400">{parsedRoles.length || 0}</span></div>
          )}
        </div>
      </div>

      <div className="mb-2">
        <h4 className="font-semibold text-blue-400">Sync Status:</h4>
        <div className="ml-2">
          <div>Context matches localStorage: 
            <span className={
              auth.isAuthenticated === !!localStorageData?.accessToken && 
              !!auth.user === !!localStorageData?.user 
                ? 'text-green-400' : 'text-red-400'
            }>
              {auth.isAuthenticated === !!localStorageData?.accessToken && 
               !!auth.user === !!localStorageData?.user ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <button 
          onClick={() => auth.loadAuthFromStorage()} 
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs w-full"
        >
          🔄 Force Reload Auth
        </button>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }} 
          className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs w-full"
        >
          🗑️ Clear Storage & Reload
        </button>
      </div>
    </div>
  );
}