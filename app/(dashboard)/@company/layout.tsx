// src/app/(dashboard)/@company/layout.tsx - Enhanced with detailed role support
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CompanyLayout({ children }: { children: ReactNode }) {
  const { user, getUserType, getPrimaryRole } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Verify user has company access
    const userType = getUserType();
    const primaryRole = getPrimaryRole();
    
    if (user && userType !== 'b2c') {
      console.log('User does not have company access, redirecting to unauthorized');
      router.push('/unauthorized');
      return;
    }

    // Log the specific company role for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Company user logged in with role:', primaryRole);
    }
    
  }, [user, router, getUserType, getPrimaryRole]);
  
  // Don't render anything if not a company user
  const userType = getUserType();
  if (user && userType !== 'b2c') {
    return null;
  }
  
  // Pass through children
  return <>{children}</>;
}