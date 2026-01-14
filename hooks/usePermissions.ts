// src/hooks/usePermissions.ts - NEW FILE
import { useAuth } from '@/context/AuthContext';
import { hasPermission, canAccessResource } from '@/utils/permissions';
import { PermissionCheck, DetailedRole } from '@/types/auth';

export const usePermissions = () => {
  const { roles, getPrimaryRole } = useAuth();

  return {
    hasPermission: (check: PermissionCheck) => hasPermission(roles, check),
    
    checkMultiple: (checks: PermissionCheck[]) => 
      checks.map(check => hasPermission(roles, check)),
    
    hasAnyPermission: (checks: PermissionCheck[]) =>
      checks.some(check => hasPermission(roles, check)),
    
    hasAllPermissions: (checks: PermissionCheck[]) =>
      checks.every(check => hasPermission(roles, check)),

    canAccessResource: (resource: string, action: string) =>
      canAccessResource(roles, resource, action),

    // Specific permission checks for common operations
    canManageUsers: () => canAccessResource(roles, 'user', 'create') || canAccessResource(roles, 'user', 'update'),
    canManageCampaigns: () => canAccessResource(roles, 'campaign', 'create') || canAccessResource(roles, 'campaign', 'update'),
    canViewAnalytics: () => canAccessResource(roles, 'analytics', 'dashboard') || canAccessResource(roles, 'analytics', 'read'),
    canManageCompany: () => canAccessResource(roles, 'company', 'update'),
    
    // Agent-specific permissions
    canManageAssignments: () => canAccessResource(roles, 'assigned_influencer', 'read'),
    canSendOutreach: () => canAccessResource(roles, 'influencer_outreach', 'send'),
    canManageContacts: () => canAccessResource(roles, 'influencer_contact', 'create'),
    canViewAutomation: () => canAccessResource(roles, 'automation_session', 'read'),
    canAccessSettings: () => canAccessResource(roles, 'user', 'update'),
  };
};