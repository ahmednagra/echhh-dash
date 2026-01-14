// src/app/(dashboard)/(influencer)/layout.tsx - Enhanced with detailed role support
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function InfluencerLayout({ children }: { children: ReactNode }) {
  const { user, getUserType, getPrimaryRole } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Verify user has influencer access
    const userType = getUserType();
    const primaryRole = getPrimaryRole();
    
    if (user && userType !== 'influencer') {
      console.log('User does not have influencer access, redirecting to unauthorized');
      router.push('/unauthorized');
      return;
    }

    // Log the specific influencer role for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Influencer user logged in with role:', primaryRole);
    }
    
  }, [user, router, getUserType, getPrimaryRole]);
  
  // Don't render anything if not an influencer
  const userType = getUserType();
  if (user && userType !== 'influencer') {
    return null;
  }
  
  // Pass through children - no UI changes here to preserve your existing components
  return <>{children}</>;
}