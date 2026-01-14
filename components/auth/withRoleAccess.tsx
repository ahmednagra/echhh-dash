// src/components/auth/withRoleAccess.tsx - NEW FILE
// This is for COMPONENT-LEVEL protection
'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { DetailedRole, PermissionCheck } from '@/types/auth';
import { hasPermission } from '@/utils/permissions';

interface RoleAccessConfig {
  allowedRoles?: DetailedRole[];
  requiredPermissions?: PermissionCheck[];
  fallback?: React.ComponentType;
  redirectTo?: string;
}

export function withRoleAccess<P extends object>(
  Component: React.ComponentType<P>,
  config: RoleAccessConfig
) {
  return function RoleProtectedComponent(props: P) {
    const { roles, isAuthenticated, isLoading, getPrimaryRole } = useAuth();

    if (isLoading) {
      return <div className="animate-pulse">Loading...</div>;
    }

    if (!isAuthenticated) {
      return config.fallback ? <config.fallback /> : <div>Please log in to access this feature</div>;
    }

    // Check role-based access
    if (config.allowedRoles) {
      const primaryRole = getPrimaryRole() as DetailedRole;
      const hasRole = config.allowedRoles.includes(primaryRole);
      if (!hasRole) {
        return config.fallback ? <config.fallback /> : <div>Insufficient permissions</div>;
      }
    }

    // Check permission-based access
    if (config.requiredPermissions) {
      const hasAllPermissions = config.requiredPermissions.every(permission =>
        hasPermission(roles, permission)
      );
      if (!hasAllPermissions) {
        return config.fallback ? <config.fallback /> : <div>Insufficient permissions</div>;
      }
    }

    return <Component {...props} />;
  };
}