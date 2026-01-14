// src/app/(dashboard)/@platform/layout.tsx- Enhanced with detailed role support
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function PlatformLayout({ children }: { children: ReactNode }) {
  const { user, getUserType, getPrimaryRole } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Verify user has platform access
    const userType = getUserType();
    const primaryRole = getPrimaryRole();
    
    if (user && userType !== 'platform') {
      console.log('User does not have platform access, redirecting to unauthorized');
      router.push('/unauthorized');
      return;
    }

    // Additional role validation could be added here if needed
    // For example, certain platform routes might require specific roles
    
  }, [user, router, getUserType, getPrimaryRole]);
  
  // Don't render anything if not a platform user
  const userType = getUserType();
  if (user && userType !== 'platform') {
    return null;
  }
  
  // Pass through children - no UI changes here to preserve your existing components
  return <>{children}</>;
}