// src/app/(dashboard)/layout.tsx - FIXED VERSION WITH MESSAGES ROUTE
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SessionExpiredModal from '@/components/auth/SessionExpiredModal';
import ClientOnly from '@/components/ClientOnly';
import Sidebar from '@/components/dashboard/Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  platform: ReactNode;
  company: ReactNode;
  influencer: ReactNode;
}

export default function DashboardLayout({
  children,
  platform,
  company,
  influencer
}: DashboardLayoutProps) {
  const { 
    isLoading, 
    isAuthenticated, 
    user, 
    refreshUserSession,
    loadAuthFromStorage,
    getUserType,
    getPrimaryRole
  } = useAuth();
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const maxRetries = 3;

  useEffect(() => {
    setIsInitialized(true);
  }, []);
  
  useEffect(() => {
    if (!isInitialized) return;

    const checkAuth = async () => {
      if (!isLoading && !isAuthenticated) {
        const hasStoredToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const hasStoredUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        
        if (hasStoredToken && hasStoredUser && retryCount < maxRetries) {
          loadAuthFromStorage();
          setRetryCount(prev => prev + 1);
          await new Promise(resolve => setTimeout(resolve, 500));
          return;
        }
        
        if (retryCount >= maxRetries || !hasStoredToken || !hasStoredUser) {
          router.push('/login');
          return;
        }
      }

      if (!isLoading && isAuthenticated && user && !user.user_type) {
        try {
          await refreshUserSession();
        } catch (error) {
          router.push('/login');
        }
      }
    };

    checkAuth();
  }, [isInitialized, isLoading, isAuthenticated, user, router, loadAuthFromStorage, refreshUserSession, retryCount]);
  
  if (!isInitialized || isLoading || (retryCount > 0 && retryCount < maxRetries && !isAuthenticated)) {
    return (
      <ClientOnly fallback={<LoadingSpinner message="Loading..." />}>
        <LoadingSpinner message={
          retryCount > 0 
            ? `Syncing authentication... (${retryCount}/${maxRetries})` 
            : "Checking authentication..."
        } />
      </ClientOnly>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (!user?.user_type) {
    return (
      <ClientOnly>
        <SessionExpiredModal />
      </ClientOnly>
    );
  }

  // FIXED: Check if current route is settings OR messages - both use unified structure
  const isCommonRoute = pathname?.startsWith('/settings') || pathname?.startsWith('/messages');

  return (
    <ClientOnly fallback={<LoadingSpinner message="Loading dashboard..." />}>
      <DashboardContent 
        user={user}
        children={children}
        platform={platform}
        company={company}
        influencer={influencer}
        getUserType={getUserType}
        getPrimaryRole={getPrimaryRole}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isCommonRoute={isCommonRoute}
      />
    </ClientOnly>
  );
}

function DashboardContent({ 
  user, 
  children,
  platform, 
  company, 
  influencer, 
  getUserType, 
  getPrimaryRole,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isCommonRoute
}: {
  user: any;
  children: ReactNode;
  platform: ReactNode;
  company: ReactNode;
  influencer: ReactNode;
  getUserType: () => any;
  getPrimaryRole: () => any;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isCommonRoute: boolean;
}) {
  const userType = getUserType();
  
  let content;
  
  // FIXED: For common routes (settings AND messages), use children (unified)
  if (isCommonRoute) {
    content = children;
  } else {
    // For non-common routes, use parallel routes based on user type
    if (userType === 'platform') {
      content = platform;
    } else if (userType === 'b2c') {
      content = company;
    } else if (userType === 'influencer') {
      content = influencer;
    } else {
      content = <SessionExpiredModal />;
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-150 to-purple-100 overflow-x-hidden">
      {/* SIDEBAR */}
      <Sidebar />
      
      {/* MAIN CONTENT AREA - FIXED: Proper margins and width constraints */}
      <div 
        className={`transition-all duration-200 overflow-x-hidden ${
          isSidebarCollapsed ? 'ml-0' : 'ml-72'
        }`}
      >
        {/* FIXED: Add proper margins when sidebar is open */}
        <div className={`w-full py-3 transition-all duration-200 ${
          isSidebarCollapsed 
            ? 'px-3' // When collapsed: small margins on both sides
            : 'px-6 mr-6' // When open: larger left padding, right margin for breathing room
        }`}>
          <div className="w-full max-w-none overflow-hidden">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}