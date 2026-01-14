// src/services/profile-analytics/index.ts

// Export all profile-analytics functions
export * from './profile-analytics.client';
export * from './profile-analytics.server';

// Export company analytics functions with clear naming
export {
  getCompanyAnalytics,
  // Re-export specific functions for clarity
  checkProfileAnalyticsExists,
  getProfileAnalyticsByHandle,
  saveProfileAnalyticsWithSocialAccount,
  transformToSocialAccountData
} from './profile-analytics.client';

export {
  getCompanyAnalyticsServer,
  // Re-export specific functions for clarity
  checkProfileAnalyticsExistsServer,
  getProfileAnalyticsByHandleServer,
  saveProfileAnalyticsWithSocialAccountServer
} from './profile-analytics.server';