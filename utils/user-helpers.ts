// src/utils/user-helpers.ts
import { User, UserType } from '@/types/auth';

/**
 * Check if the user is of a specific type
 * @param user The user object
 * @param type The user type to check
 * @returns Boolean indicating if the user matches the specified type
 */
export const isUserType = (user: User | null, type: UserType): boolean => {
  if (!user) return false;
  return user.user_type === type;
};

/**
 * Get the appropriate dashboard URL based on user type
 * @param user The user object
 * @returns The dashboard URL for the user's type
 */
export const getDashboardUrl = (user: User | null): string => {
  if (!user) return '/login';
  
  // For now, all users share the same dashboard route
  return '/dashboard';
  
  // If you later decide to use different routes based on user type:
  // switch (user.user_type) {
  //   case 'platform':
  //     return '/admin/dashboard';
  //   case 'company':
  //     return '/company/dashboard';
  //   case 'influencer':
  //     return '/influencer/dashboard';
  //   default:
  //     return '/dashboard';
  // }
};

/**
 * Check if user has access to a specific feature
 * @param user The user object
 * @param feature The feature to check access for
 * @returns Boolean indicating if the user has access to the feature
 */
export const hasFeatureAccess = (user: User | null, feature: string): boolean => {
  if (!user) return false;
  
  // Define feature access by user type
  const accessMap: Record<string, UserType[]> = {
    'manage_influencers': ['platform', 'company'],
    'manage_companies': ['platform'],
    'view_analytics': ['platform', 'company', 'influencer'],
    'create_campaigns': ['company'],
    'review_campaigns': ['platform', 'influencer'],
    'manage_platform': ['platform'],
    'withdraw_payments': ['influencer'],
    'invite_users': ['platform', 'company'],
  };
  
  // Check if user's type is in the list of allowed types for the feature
  return feature in accessMap && accessMap[feature].includes(user.user_type);
};