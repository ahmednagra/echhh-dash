// src/components/auth/RouteGuard.tsx - NEW FILE
// This is for PAGE-LEVEL protection
'use client';

import { useAuth } from '@/context/AuthContext';
import { DetailedRole, PermissionCheck } from '@/types/auth';
import { hasPermission } from '@/utils/permissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: DetailedRole[];
  requiredPermissions?: PermissionCheck[];
  fallback?: React.ComponentType;
  redirectTo?: string;
}

export default function RouteGuard({
  children,
  allowedRoles,
  requiredPermissions,
  fallback: Fallback,
  redirectTo = '/dashboard'
}: RouteGuardProps) {
  const { roles, isAuthenticated, isLoading, getPrimaryRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (allowedRoles) {
    const primaryRole = getPrimaryRole() as DetailedRole;
    const hasRole = allowedRoles.includes(primaryRole);
    if (!hasRole) {
      if (Fallback) return <Fallback />;
      router.push(redirectTo);
      return null;
    }
  }

  // Check permission-based access
  if (requiredPermissions) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      hasPermission(roles, permission)
    );
    if (!hasAllPermissions) {
      if (Fallback) return <Fallback />;
      router.push(redirectTo);
      return null;
    }
  }

  return <>{children}</>;
}