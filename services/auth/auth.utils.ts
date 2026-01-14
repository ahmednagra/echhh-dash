// src/services/auth/auth.utils.ts - Enhanced with outreach agent support
import { User, Role, Company, DetailedRole, OutreachAgent, AgentType } from '@/types/auth';

/**
 * Safely access localStorage (handles SSR and browser cases)
 */
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`Error getting ${key} from localStorage:`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`Error setting ${key} in localStorage:`, e);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from localStorage:`, e);
    }
  }
};

/**
 * Get the stored auth token
 */
export const getAuthToken = (): string | null => {
  return safeLocalStorage.getItem('accessToken');
};

/**
 * Store authentication data in localStorage with enhanced role and outreach agent support
 * BACKWARD COMPATIBLE: outreach_agent parameter is optional to preserve existing calls
 */
export const storeAuthData = (
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  user: User,
  roles: Role[],
  company?: Company[] | null,  
  outreach_agent?: OutreachAgent | null  // OPTIONAL parameter for backward compatibility
): void => {
  const expiryTime = Date.now() + expiresIn * 1000;

  safeLocalStorage.setItem('accessToken', accessToken);
  safeLocalStorage.setItem('refreshToken', refreshToken);
  safeLocalStorage.setItem('tokenExpiry', expiryTime.toString());
  safeLocalStorage.setItem('user', JSON.stringify(user));
  safeLocalStorage.setItem('roles', JSON.stringify(roles));

  // Store outreach_agent if provided
  if (outreach_agent) {
    safeLocalStorage.setItem('outreach_agent', JSON.stringify(outreach_agent));
    // Store agent type for quick access
    safeLocalStorage.setItem('agentType', outreach_agent.agent_type_name);
    console.log('✅ Stored outreach agent data:', {
      agentId: outreach_agent.id,
      agentType: outreach_agent.agent_type_name,
      displayName: outreach_agent.agent_type_display_name
    });
  }

  // Store company if provided (handle array case)
  if (company) {
    safeLocalStorage.setItem('company', JSON.stringify(company));
  }

  // Store primary role for quick access
  if (roles && roles.length > 0) {
    safeLocalStorage.setItem('primaryRole', roles[0].name);
    safeLocalStorage.setItem('userType', getUserTypeFromRole(roles[0].name));
  }
};

/**
 * Update user data in localStorage while preserving other auth data
 * This function specifically handles profile updates
 * @param updatedUser - The updated user data from API response  
 */
export const updateStoredUser = (updatedUser: User): void => {
  try {
    if (typeof window === 'undefined') {
      console.warn('updateStoredUser called on server side');
      return;
    }

    const currentUserData = safeLocalStorage.getItem('user');
    
    if (!currentUserData || currentUserData === 'undefined') {
      console.warn('No existing user data found in localStorage, storing new data');
      safeLocalStorage.setItem('user', JSON.stringify(updatedUser));
      return;
    }

    // Parse existing user data
    const existingUser = JSON.parse(currentUserData);
    
    // Merge existing user data with updated fields
    // This preserves any additional fields that might exist in localStorage
    const mergedUser = {
      ...existingUser,
      ...updatedUser,
      // Ensure the ID matches (don't allow ID changes)
      id: existingUser.id,
      // Update timestamp
      updated_at: updatedUser.updated_at || new Date().toISOString()
    };

    // Store the merged user data
    safeLocalStorage.setItem('user', JSON.stringify(mergedUser));
    
    console.log('✅ Successfully updated user in localStorage:', {
      userId: mergedUser.id,
      email: mergedUser.email,
      fullName: mergedUser.full_name,
      updatedAt: mergedUser.updated_at
    });

  } catch (error) {
    console.error('❌ Error updating user in localStorage:', error);
    // Fallback: store the updated user data directly
    try {
      safeLocalStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ Fallback: Stored updated user data directly');
    } catch (fallbackError) {
      console.error('❌ Fallback storage also failed:', fallbackError);
    }
  }
};

/**
 * Complete profile update workflow:
 * 1. Update localStorage
 * 2. Trigger AuthContext refresh
 * @param updatedUser - Updated user data from API
 * @param loadAuthFromStorage - AuthContext refresh function
 */
export const handleProfileUpdateSuccess = (
  updatedUser: User,
  loadAuthFromStorage?: () => void
): void => {
  try {
    console.log('🔄 Starting profile update workflow...');
    
    // Step 1: Update localStorage
    updateStoredUser(updatedUser);
    
    // Step 2: Refresh AuthContext to reflect changes
    if (loadAuthFromStorage) {
      console.log('🔄 Refreshing AuthContext...');
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        loadAuthFromStorage();
        console.log('✅ AuthContext refresh completed');
      }, 100);
    } else {
      console.warn('⚠️ loadAuthFromStorage function not provided');
    }
    
    console.log('✅ Profile update workflow completed successfully');
    
  } catch (error) {
    console.error('❌ Error in profile update workflow:', error);
  }
};

/**
 * Clears all auth data from local storage
 */
export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  localStorage.removeItem('roles');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('company');
  localStorage.removeItem('outreach_agent'); // Added
  localStorage.removeItem('agentType'); // Added
  localStorage.removeItem('primaryRole');
  localStorage.removeItem('userType');
};

/**
 * Check if the auth token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiry = safeLocalStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  
  const isExpired = Date.now() > parseInt(expiry, 10);
  
  // Automatically clear auth data if token is expired
  if (isExpired) {
    clearAuthData();
  }
  
  return isExpired;
};

/**
 * Checks if the token will expire soon
 * @param minutesThreshold Number of minutes before expiry to consider "soon"
 */
export const isTokenExpiringSoon = (minutesThreshold: number = 5): boolean => {
  if (typeof window === 'undefined') return true;
  
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  
  const expiryTime = parseInt(expiry, 10);
  const thresholdMs = minutesThreshold * 60 * 1000;
  
  return Date.now() > expiryTime - thresholdMs;
};

/**
 * Get the stored user data
 */
export const getStoredUser = (): User | null => {
  const userData = safeLocalStorage.getItem('user');
  if (!userData) return null;
  if(userData === 'undefined') return null; // Handle case where userData is 'undefined' string
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    return null;
  }
};

/**
 * Get the stored company data
 */
export const getStoredCompany = (): Company | null => {
  const companyData = safeLocalStorage.getItem('company');
  if (!companyData) return null;
  if(companyData === 'undefined') return null; // Handle case where companyData is 'undefined' string
  
  try {
    const parsed = JSON.parse(companyData);
    // Handle array case (from backend response)
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } catch (error) {
    console.error('Error parsing stored company data:', error);
    return null;
  }
};

/**
 * Get the stored outreach agent data
 */
export const getStoredOutreachAgent = (): OutreachAgent | null => {
  const agentData = safeLocalStorage.getItem('outreach_agent');
  if (!agentData) return null;
  if(agentData === 'undefined') return null; // Handle case where agentData is 'undefined' string
  
  try {
    return JSON.parse(agentData);
  } catch (error) {
    console.error('Error parsing stored outreach agent data:', error);
    return null;
  }
};

/**
 * Get the stored agent type (quick access)
 */
export const getStoredAgentType = (): AgentType | null => {
  const agentType = safeLocalStorage.getItem('agentType');
  return agentType as AgentType || null;
};

/**
 * Gets the stored roles from local storage
 */
export const getStoredRoles = (): Role[] => {
  if (typeof window === 'undefined') return [];
  
  const rolesString = localStorage.getItem('roles');
  if (!rolesString) return [];
  if (rolesString === 'undefined') return []; // Added this line to fix the issue
  
  try {
    const roles = JSON.parse(rolesString) as Role[];
    return roles;
  } catch (error) {
    console.error('Failed to parse roles from localStorage', error);
    return [];
  }
};

/**
 * Get the primary role from localStorage (quick access)
 */
export const getStoredPrimaryRole = (): DetailedRole | null => {
  const primaryRole = safeLocalStorage.getItem('primaryRole');
  return primaryRole as DetailedRole || null;
};

/**
 * Get the user type from localStorage (quick access)
 */
export const getStoredUserType = (): 'platform' | 'b2c' | 'influencer' | null => {
  const userType = safeLocalStorage.getItem('userType');
  return userType as 'platform' | 'b2c' | 'influencer' || null;
};

/**
 * Get user type from detailed role
 */
export const getUserTypeFromRole = (detailedRole: DetailedRole): 'platform' | 'b2c' | 'influencer' => {
  if (detailedRole.startsWith('platform_')) return 'platform';
  if (detailedRole.startsWith('b2c_')) return 'b2c';
  if (detailedRole.startsWith('influencer')) return 'influencer';
  throw new Error(`Unknown role: ${detailedRole}`);
};

/**
 * Get agent dashboard route based on agent type
 */
export const getAgentDashboardRoute = (agentType: AgentType): string => {
  switch (agentType) {
    case 'instagram':
      return '/dashboard'; // Will render InstagramAgentDashboard
    case 'email':
      return '/dashboard'; // Will render EmailAgentDashboard
    case 'whatsapp':
      return '/dashboard'; // Will render WhatsAppAgentDashboard
    default:
      return '/dashboard';
  }
};

/**
 * Check if the user has a specific role (legacy support)
 */
export const hasRole = (roleName: string): boolean => {
  const roles = getStoredRoles();
  return roles.some(role => role.name === roleName);
};

/**
 * Check if the user has a specific detailed role
 */
export const hasDetailedRole = (roleName: DetailedRole): boolean => {
  const roles = getStoredRoles();
  return roles.some(role => role.name === roleName);
};

/**
 * Checks if the user has any of the specified roles
 * @param requiredRoles Array of detailed role names to check
 */
export const hasAnyRole = (requiredRoles: DetailedRole[]): boolean => {
  const roles = getStoredRoles();
  if (!roles.length) return false;
  
  const userRoleNames = roles.map(role => role.name);
  return requiredRoles.some(role => userRoleNames.includes(role));
};

/**
 * Checks if the user has any of the specified detailed roles
 * @param requiredRoles Array of detailed role names to check
 */
export const hasAnyDetailedRole = (requiredRoles: DetailedRole[]): boolean => {
  const roles = getStoredRoles();
  if (!roles.length) return false;
  
  const userRoleNames = roles.map(role => role.name);
  return requiredRoles.some(role => userRoleNames.includes(role));
};

/**
 * Check if user is platform admin (highest level)
 */
export const isPlatformAdmin = (): boolean => {
  return hasDetailedRole('platform_admin') || hasDetailedRole('platform_super_admin');
};

/**
 * Check if user is platform super admin (absolute highest level)
 */
export const isPlatformSuperAdmin = (): boolean => {
  return hasDetailedRole('platform_super_admin');
};

/**
 * Check if user is platform agent
 */
export const isPlatformAgent = (): boolean => {
  return hasDetailedRole('platform_agent');
};

/**
 * Check if user is company admin
 */
export const isCompanyAdmin = (): boolean => {
  return hasDetailedRole('b2c_company_admin') || hasDetailedRole('b2c_company_owner');
};

/**
 * Check if user is company owner (highest company level)
 */
export const isCompanyOwner = (): boolean => {
  return hasDetailedRole('b2c_company_owner');
};

/**
 * Check if user has marketing-related roles
 */
export const hasMarketingRole = (): boolean => {
  return hasAnyRole([
    'b2c_marketing_director',
    'b2c_campaign_manager', 
    'b2c_campaign_executive',
    'b2c_social_media_manager'
  ]);
};

/**
 * Check if user has content-related roles
 */
export const hasContentRole = (): boolean => {
  return hasAnyRole([
    'b2c_content_creator',
    'b2c_brand_manager',
    'platform_content_moderator'
  ]);
};

/**
 * Check if user has analytical roles
 */
export const hasAnalyticalRole = (): boolean => {
  return hasAnyRole([
    'b2c_performance_analyst',
    'platform_data_analyst'
  ]);
};

/**
 * Check if user has financial roles
 */
export const hasFinancialRole = (): boolean => {
  return hasAnyRole([
    'b2c_finance_manager',
    'platform_financial_manager'
  ]);
};

/**
 * Check if user can manage campaigns
 */
export const canManageCampaigns = (): boolean => {
  return hasAnyRole([
    'b2c_company_owner',
    'b2c_company_admin',
    'b2c_marketing_director',
    'b2c_campaign_manager',
    'b2c_campaign_executive'
  ]);
};

/**
 * Check if user can view only (read-only access)
 */
export const isViewerOnly = (): boolean => {
  return hasDetailedRole('b2c_viewer');
};

/**
 * Check if user has platform-level access
 */
export const hasPlatformAccess = (): boolean => {
  const primaryRole = getStoredPrimaryRole();
  return primaryRole ? primaryRole.startsWith('platform_') : false;
};

/**
 * Check if user has company-level access
 */
export const hasCompanyAccess = (): boolean => {
  const primaryRole = getStoredPrimaryRole();
  return primaryRole ? primaryRole.startsWith('b2c_') : false;
};

/**
 * Check if user has influencer-level access
 */
export const hasInfluencerAccess = (): boolean => {
  const primaryRole = getStoredPrimaryRole();
  return primaryRole ? primaryRole.startsWith('influencer') : false;
};

/**
 * Get role hierarchy level for permission checking
 */
export const getRoleHierarchyLevel = (): number => {
  const primaryRole = getStoredPrimaryRole();
  if (!primaryRole) return 0;

  const hierarchyMap: Record<DetailedRole, number> = {
    // Platform hierarchy
    'platform_super_admin': 110,
    'platform_admin': 100,
    'platform_manager': 80,
    'platform_developer': 75,
    'platform_customer_support': 70,
    'platform_account_manager': 65,
    'platform_financial_manager': 60,
    'platform_content_moderator': 55,
    'platform_data_analyst': 50,
    'platform_operations_manager': 45,
    'platform_agent': 40,
    
    // Company hierarchy
    'b2c_company_owner': 100,
    'b2c_company_admin': 95,
    'b2c_marketing_director': 90,
    'b2c_campaign_manager': 80,
    'b2c_campaign_executive': 70,
    'b2c_social_media_manager': 65,
    'b2c_content_creator': 60,
    'b2c_brand_manager': 60,
    'b2c_performance_analyst': 55,
    'b2c_finance_manager': 55,
    'b2c_account_coordinator': 50,
    'b2c_viewer': 30,
    
    // Influencer hierarchy
    'influencer_manager': 80,
    'influencer': 50,
  };
  
  return hierarchyMap[primaryRole] || 0;
};

/**
 * Check if current user has higher hierarchy than target role
 */
export const hasHigherHierarchyThan = (targetRole: DetailedRole): boolean => {
  const currentLevel = getRoleHierarchyLevel();
  const targetHierarchyMap: Record<DetailedRole, number> = {
    // Platform hierarchy
    'platform_super_admin': 110,
    'platform_admin': 100,
    'platform_manager': 80,
    'platform_developer': 75,
    'platform_customer_support': 70,
    'platform_account_manager': 65,
    'platform_financial_manager': 60,
    'platform_content_moderator': 55,
    'platform_data_analyst': 50,
    'platform_operations_manager': 45,
    'platform_agent': 40,
    
    // Company hierarchy
    'b2c_company_owner': 100,
    'b2c_company_admin': 95,
    'b2c_marketing_director': 90,
    'b2c_campaign_manager': 80,
    'b2c_campaign_executive': 70,
    'b2c_social_media_manager': 65,
    'b2c_content_creator': 60,
    'b2c_brand_manager': 60,
    'b2c_performance_analyst': 55,
    'b2c_finance_manager': 55,
    'b2c_account_coordinator': 50,
    'b2c_viewer': 30,
    
    // Influencer hierarchy
    'influencer_manager': 80,
    'influencer': 50,
  };
  
  const targetLevel = targetHierarchyMap[targetRole] || 0;
  return currentLevel > targetLevel;
};

/**
 * Get appropriate dashboard route based on stored role and agent type
 */
export const getDashboardRoute = (): string => {
  const userType = getStoredUserType();
  const primaryRole = getStoredPrimaryRole();
  const agentType = getStoredAgentType();
  
  if (!userType || !primaryRole) return '/login';
  
  // Special routing for platform agents based on agent type
  if (primaryRole === 'platform_agent' && agentType) {
    return getAgentDashboardRoute(agentType);
  }
  
  // Special routing for company users
  if (userType === 'b2c') {
    return '/dashboard'; // CompanyDashboardPage will handle redirection to campaigns
  }
  
  return '/dashboard';
};

/**
 * Sets the user and roles in local storage (legacy support)
 */
export const setAuthData = (
  user: User, 
  roles: Role[], 
  token: string, 
  refreshToken: string, 
  expiresIn: number
) => {
  storeAuthData(token, refreshToken, expiresIn, user, roles);
};

/**
 * Validate stored auth data integrity
 */
export const validateAuthData = (): boolean => {
  const user = getStoredUser();
  const roles = getStoredRoles();
  const token = getAuthToken();
  
  // Check if all required data is present
  if (!user || !roles.length || !token) {
    clearAuthData();
    return false;
  }
  
  // Check if token is expired
  if (isTokenExpired()) {
    clearAuthData();
    return false;
  }
  
  // Check if role data is consistent
  const primaryRole = getStoredPrimaryRole();
  const userType = getStoredUserType();
  
  if (!primaryRole || !userType) {
    // Repair missing quick access data
    if (roles.length > 0) {
      safeLocalStorage.setItem('primaryRole', roles[0].name);
      safeLocalStorage.setItem('userType', getUserTypeFromRole(roles[0].name));
    } else {
      clearAuthData();
      return false;
    }
  }
  
  return true;
};

/**
 * Initialize auth state on app startup
 */
export const initializeAuthState = (): {
  isAuthenticated: boolean;
  user: User | null;
  roles: Role[];
  primaryRole: DetailedRole | null;
  userType: 'platform' | 'b2c' | 'influencer' | null;
  outreachAgent: OutreachAgent | null; // Added
  agentType: AgentType | null; // Added
} => {
  const isValid = validateAuthData();
  
  if (!isValid) {
    return {
      isAuthenticated: false,
      user: null,
      roles: [],
      primaryRole: null,
      userType: null,
      outreachAgent: null,
      agentType: null
    };
  }
  
  return {
    isAuthenticated: true,
    user: getStoredUser(),
    roles: getStoredRoles(),
    primaryRole: getStoredPrimaryRole(),
    userType: getStoredUserType(),
    outreachAgent: getStoredOutreachAgent(),
    agentType: getStoredAgentType()
  };
};

/**
 * Debug function to log current auth state (development only)
 */
export const debugAuthState = () => {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.group('🔐 Auth State Debug');
  console.log('User:', getStoredUser());
  console.log('Roles:', getStoredRoles());
  console.log('Primary Role:', getStoredPrimaryRole());
  console.log('User Type:', getStoredUserType());
  console.log('Outreach Agent:', getStoredOutreachAgent());
  console.log('Agent Type:', getStoredAgentType());
  console.log('Token Valid:', !isTokenExpired());
  console.log('Hierarchy Level:', getRoleHierarchyLevel());
  console.groupEnd();
};