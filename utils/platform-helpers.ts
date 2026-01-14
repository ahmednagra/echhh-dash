// src/utils/platform-helpers.ts
// Helper functions for platform management

export const PLATFORM_NAMES = {
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook', 
  TWITTER: 'Twitter',
  LINKEDIN: 'LinkedIn',
  YOUTUBE: 'YouTube'
} as const;

/**
 * Instagram connection configuration
 */
export const INSTAGRAM_CONFIG = {
  permissions: [
    'instagram_basic',
    'pages_show_list', 
    'business_management'
  ],
  connection_type: 'business_account'
};

/**
 * Facebook connection configuration
 */
export const FACEBOOK_CONFIG = {
  permissions: [
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_show_list'
  ],
  connection_type: 'page'
};

/**
 * Twitter connection configuration
 */
export const TWITTER_CONFIG = {
  permissions: [
    'read',
    'write'
  ],
  connection_type: 'account'
};

/**
 * LinkedIn connection configuration
 */
export const LINKEDIN_CONFIG = {
  permissions: [
    'r_liteprofile',
    'r_emailaddress',
    'w_member_social'
  ],
  connection_type: 'profile'
};

/**
 * YouTube connection configuration
 */
export const YOUTUBE_CONFIG = {
  permissions: [
    'youtube.readonly',
    'youtube.upload'
  ],
  connection_type: 'channel'
};

/**
 * Get platform configuration by name
 */
export function getPlatformConfig(platformName: string) {
  switch (platformName.toLowerCase()) {
    case 'instagram':
      return INSTAGRAM_CONFIG;
    case 'facebook':
      return FACEBOOK_CONFIG;
    case 'twitter':
      return TWITTER_CONFIG;
    case 'linkedin':
      return LINKEDIN_CONFIG;
    case 'youtube':
      return YOUTUBE_CONFIG;
    default:
      throw new Error(`Unknown platform: ${platformName}`);
  }
}