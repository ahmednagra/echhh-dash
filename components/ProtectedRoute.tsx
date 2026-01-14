// src/components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute = ({ 
  children,
  requiredRoles = [],
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, roles } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is still being determined, wait
    if (isLoading) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // If roles are required, check if user has at least one of them
    if (requiredRoles.length > 0) {
      const userRoleNames = roles.map(role => role.name);
      const hasRequiredRole = requiredRoles.some(role => userRoleNames.includes(role));
      
      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, roles, requiredRoles, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated or doesn't have required roles, don't render children
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRoles.length > 0) {
    const userRoleNames = roles.map(role => role.name);
    const hasRequiredRole = requiredRoles.some(role => userRoleNames.includes(role));
    
    if (!hasRequiredRole) {
      return null;
    }
  }

  // User is authenticated and has required roles, render children
  return <>{children}</>;
};

export default ProtectedRoute;