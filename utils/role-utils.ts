// src/utils/role-utils.ts - Role checking utilities with permission infrastructure
import { User, Role, RoleCheckResult, DetailedRole, PlatformRole, CompanyRole, InfluencerRole } from '@/types/auth';

/**
 * Get the user's primary detailed role
 */
export const getPrimaryRole = (roles: Role[]): DetailedRole | null => {
  if (!roles || roles.length === 0) return null;
  return roles[0].name;
};

/**
 * Get the user type from updated detailed role
 */
export const getUserTypeFromRole = (detailedRole: DetailedRole): 'platform' | 'b2c' | 'influencer' => {
  if (detailedRole.startsWith('platform_')) return 'platform';
  if (detailedRole.startsWith('b2c_')) return 'b2c';
  if (detailedRole.startsWith('influencer')) return 'influencer';
  throw new Error(`Unknown role: ${detailedRole}`);
};

/**
 * Check if user has a specific detailed role
 */
export const hasDetailedRole = (roles: Role[], targetRole: DetailedRole): boolean => {
  return roles.some(role => role.name === targetRole);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyDetailedRole = (roles: Role[], targetRoles: DetailedRole[]): boolean => {
  return roles.some(role => targetRoles.includes(role.name));
};

/**
 * Check if user is platform role
 */
export const isPlatformRole = (role: DetailedRole): role is PlatformRole => {
  return role.startsWith('platform_');
};

/**
 * Check if user is company role
 */
export const isCompanyRole = (role: DetailedRole): role is CompanyRole => {
  return role.startsWith('b2c_company_');
};

/**
 * Check if user is influencer role
 */
export const isInfluencerRole = (role: DetailedRole): role is InfluencerRole => {
  return role.startsWith('influencer');
};

/**
 * Get appropriate dashboard route based on user role
 */
export const getDashboardRouteForRole = (user: User | null, roles: Role[]): string => {
  if (!user || !roles.length) return '/login';
  
  const primaryRole = getPrimaryRole(roles);
  if (!primaryRole) return '/login';
  
  const userType = getUserTypeFromRole(primaryRole);
  
  // For company users, redirect to campaigns if they exist
  if (userType === 'b2c') {
    return '/dashboard'; // Will be handled by CompanyDashboardPage to redirect to campaigns
  }
  
  return '/dashboard';
};

/**
 * Get role hierarchy level (for future permission inheritance)
 */
export const getRoleHierarchyLevel = (role: DetailedRole): number => {
  const hierarchyMap: Record<string, number> = {
    // Platform hierarchy
    'platform_admin': 100,
    'platform_manager': 80,
    'platform_developer': 75,
    'platform_outreach_manager': 70,
    'platform_user': 60,
    'platform_accountant': 50,
    'platform_customer_support': 40,
    'platform_content_moderator': 35,
    'platform_agent': 30,
    
    // Company hierarchy
    'b2c_company_admin': 100,
    'b2c_company_manager': 80,
    'b2c_company_marketer': 60,
    'b2c_company_accountant': 50,
    'b2c_company_content_creator': 40,
    'b2c_company_user': 30,
    
    // Influencer hierarchy
    'influencer_manager': 80,
    'influencer': 50,
  };
  
  return hierarchyMap[role] || 0;
};

/**
 * Check if role has higher hierarchy than target role
 */
export const hasHigherHierarchy = (userRole: DetailedRole, targetRole: DetailedRole): boolean => {
  return getRoleHierarchyLevel(userRole) > getRoleHierarchyLevel(targetRole);
};

/**
 * Get navigation items based on role
 */
export const getNavigationItemsForRole = (role: DetailedRole) => {
  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'Home' }
  ];

  switch (role) {
    // Platform Roles
    case 'platform_super_admin':
    case 'platform_admin':
      return [
        ...baseItems,
        { name: 'Users', href: '/users', icon: 'Users' },
        { name: 'Companies', href: '/companies', icon: 'Briefcase' },
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Agents', href: '/agents', icon: 'Bot' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Reports', href: '/reports', icon: 'FileText' },
        { name: 'System', href: '/system', icon: 'Server' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];
      
    case 'platform_agent':
      return [
        ...baseItems,
        { name: 'Assigned Lists', href: '/assigned-lists', icon: 'List' },
        { name: 'Outreach', href: '/outreach', icon: 'Send' },
        { name: 'Contacts', href: '/contacts', icon: 'Users' },
        { name: 'Automation', href: '/automation', icon: 'Bot' },
        { name: 'Performance', href: '/performance', icon: 'TrendingUp' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];
      
    case 'platform_manager':
      return [
        ...baseItems,
        { name: 'Teams', href: '/teams', icon: 'Users' },
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Agents', href: '/agents', icon: 'Bot' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Reports', href: '/reports', icon: 'FileText' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];
      
    case 'platform_operations_manager':
      return [
        ...baseItems,
        { name: 'Operations', href: '/operations', icon: 'Activity' },
        { name: 'Agents', href: '/agents', icon: 'Bot' },
        { name: 'Automation', href: '/automation', icon: 'Settings' },
        { name: 'Performance', href: '/performance', icon: 'TrendingUp' },
        { name: 'Reports', href: '/reports', icon: 'FileText' },
      ];

    case 'platform_outreach_manager':
      return [
        ...baseItems,
        { name: 'Agents', href: '/agents', icon: 'Users' },
        { name: 'Assignments', href: '/assignments', icon: 'List' },
        { name: 'Automation', href: '/automation', icon: 'Bot' },
        { name: 'Templates', href: '/templates', icon: 'FileText' },
        { name: 'Performance', href: '/performance', icon: 'TrendingUp' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];

    // Company Roles
    case 'b2c_company_owner':
    case 'b2c_company_admin':
      return [
        ...baseItems,
        { name: 'Discover', href: '/discover', icon: 'Compass' },
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Influencers', href: '/influencers', icon: 'Users' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Team', href: '/team', icon: 'Users' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];
      
    case 'b2c_campaign_manager':
    case 'b2c_marketing_director':
      return [
        ...baseItems,
        { name: 'Discover', href: '/discover', icon: 'Compass' },
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Influencers', href: '/influencers', icon: 'Users' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];
      
    case 'b2c_viewer':
      return [
        ...baseItems,
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
      ];

    // Influencer Roles
    case 'influencer':
      return [
        ...baseItems,
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Profile', href: '/profile', icon: 'User' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Payments', href: '/payments', icon: 'DollarSign' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];
      
    case 'influencer_manager':
      return [
        ...baseItems,
        { name: 'Influencers', href: '/influencers', icon: 'Users' },
        { name: 'Campaigns', href: '/campaigns', icon: 'Award' },
        { name: 'Analytics', href: '/analytics', icon: 'BarChart2' },
        { name: 'Settings', href: '/settings', icon: 'Settings' },
      ];
      
    default:
      return baseItems;
  }
};

/**
 * Check comprehensive role information
 */
export const checkRoleAccess = (user: User | null, roles: Role[]): RoleCheckResult => {
  if (!user || !roles.length) {
    return {
      hasRole: false,
      userType: null,
      detailedRole: null,
      dashboardRoute: '/login'
    };
  }
  
  const primaryRole = getPrimaryRole(roles);
  const userType = primaryRole ? getUserTypeFromRole(primaryRole) : null;
  const dashboardRoute = getDashboardRouteForRole(user, roles);
  
  return {
    hasRole: !!primaryRole,
    userType,
    detailedRole: primaryRole,
    dashboardRoute
  };
};

// Permission system infrastructure (for future implementation)
export interface PermissionCheck {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  context?: Record<string, any>;
}

/**
 * Future permission checking function (placeholder)
 * This will be implemented when we add the permission system
 */
export const hasPermission = (
  roles: Role[], 
  check: PermissionCheck
): boolean => {
  // TODO: Implement permission checking logic
  // For now, return true as we're focusing on role-based access
  return true;
};

/**
 * Future permission checking hook (placeholder)
 */
export const usePermissions = () => {
  // TODO: Implement permission hook
  return {
    hasPermission: (check: PermissionCheck) => true,
    checkMultiple: (checks: PermissionCheck[]) => checks.map(() => true)
  };
};

/**
 * Role-based component access control (ready for permission integration)
 */
export const canAccessComponent = (
  roles: Role[], 
  componentName: string,
  requiredRoles?: DetailedRole[],
  requiredPermissions?: PermissionCheck[]
): boolean => {
  // Check role-based access
  if (requiredRoles && !hasAnyDetailedRole(roles, requiredRoles)) {
    return false;
  }
  
  // Check permission-based access (future implementation)
  if (requiredPermissions) {
    return requiredPermissions.every(permission => hasPermission(roles, permission));
  }
  
  return true;
};