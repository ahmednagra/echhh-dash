// src/constants/social-platforms.ts
// =============================================================================
// Platform configurations and constants for social media connections
// Extended with Facebook & LinkedIn support for multi-platform video management
// =============================================================================

import {
  SocialPlatformType,
  SocialPlatformConfig,
  PlatformFeature,
  InstagramScope,
} from '@/types/influencer-social-connections';

import {
  getDynamicPlatformId,
  getDynamicPlatformIdSync,
  getDynamicWorkPlatformId,
  getDynamicWorkPlatformIdSync,
  getDynamicDataSourceEndpointId,
  getDynamicDataSourceEndpointIdSync,
  isPlatformConfigInitialized,
} from '@/services/platform/platforms.service';

// =============================================================================
// INSTAGRAM SCOPES - Meta Business API
// Reference: https://developers.facebook.com/docs/instagram-api/overview
// =============================================================================

export const INSTAGRAM_SCOPES = {
  // Required scopes for basic functionality
  REQUIRED: [
    'instagram_business_basic',
    'instagram_business_manage_messages',
  ] as InstagramScope[],

  // Optional scopes for enhanced features
  OPTIONAL: [
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights',
  ] as InstagramScope[],

  // All available scopes
  ALL: [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights',
  ] as InstagramScope[],
} as const;

// =============================================================================
// PLATFORM FEATURES
// =============================================================================

export const PLATFORM_FEATURES: Record<SocialPlatformType, PlatformFeature[]> = {
  instagram: [
    {
      id: 'instagram-dm',
      name: 'Direct Messages',
      description: 'Send and receive Instagram DMs',
      icon: 'MessageCircle',
      isEnabled: true,
      requiredScopes: ['instagram_business_manage_messages'],
    },
    {
      id: 'instagram-comments',
      name: 'Comments Management',
      description: 'Read, reply, and moderate comments',
      icon: 'MessageSquare',
      isEnabled: true,
      requiredScopes: ['instagram_business_manage_comments'],
    },
    {
      id: 'instagram-publishing',
      name: 'Content Publishing',
      description: 'Schedule and publish posts & reels',
      icon: 'Calendar',
      isEnabled: true,
      requiredScopes: ['instagram_business_content_publish'],
    },
    {
      id: 'instagram-insights',
      name: 'Analytics & Insights',
      description: 'View performance metrics and audience data',
      icon: 'BarChart2',
      isEnabled: true,
      requiredScopes: ['instagram_business_manage_insights'],
    },
    {
      id: 'instagram-stories',
      name: 'Stories',
      description: 'Manage Instagram Stories',
      icon: 'Circle',
      isEnabled: true,
      requiredScopes: ['instagram_business_content_publish'],
    },
  ],
  tiktok: [
    {
      id: 'tiktok-comments',
      name: 'Comments',
      description: 'View and reply to video comments',
      icon: 'MessageSquare',
      isEnabled: true,
      requiredScopes: ['comment.list', 'comment.list.manage'],
    },
    {
      id: 'tiktok-analytics',
      name: 'Analytics',
      description: 'Track video performance metrics',
      icon: 'BarChart2',
      isEnabled: true,
      requiredScopes: ['research.data.basic'],
    },
    {
      id: 'tiktok-videos',
      name: 'Video Management',
      description: 'View and manage your TikTok videos',
      icon: 'Video',
      isEnabled: true,
      requiredScopes: ['video.list', 'video.upload'],
    },
  ],
  youtube: [
    {
      id: 'youtube-comments',
      name: 'Comments',
      description: 'Manage video comments',
      icon: 'MessageSquare',
      isEnabled: false,
      requiredScopes: ['youtube.force-ssl'],
    },
    {
      id: 'youtube-analytics',
      name: 'Analytics',
      description: 'View channel analytics',
      icon: 'BarChart2',
      isEnabled: false,
      requiredScopes: ['yt-analytics.readonly'],
    },
    {
      id: 'youtube-subscribers',
      name: 'Subscribers',
      description: 'View subscriber data',
      icon: 'Users',
      isEnabled: false,
      requiredScopes: ['youtube.readonly'],
    },
  ],
  twitter: [
    {
      id: 'twitter-dm',
      name: 'Direct Messages',
      description: 'Manage Twitter DMs',
      icon: 'MessageCircle',
      isEnabled: false,
      requiredScopes: ['dm.read', 'dm.write'],
    },
    {
      id: 'twitter-tweets',
      name: 'Tweet Management',
      description: 'Schedule and publish tweets',
      icon: 'Edit3',
      isEnabled: false,
      requiredScopes: ['tweet.read', 'tweet.write'],
    },
    {
      id: 'twitter-analytics',
      name: 'Analytics',
      description: 'Track tweet performance',
      icon: 'BarChart2',
      isEnabled: false,
      requiredScopes: ['tweet.read'],
    },
  ],
  facebook: [
    {
      id: 'facebook-messages',
      name: 'Page Messages',
      description: 'Manage Facebook Page messages',
      icon: 'MessageCircle',
      isEnabled: false,
      requiredScopes: ['pages_messaging'],
    },
    {
      id: 'facebook-posts',
      name: 'Post Management',
      description: 'Create and manage page posts',
      icon: 'Edit3',
      isEnabled: false,
      requiredScopes: ['pages_manage_posts'],
    },
  ],
};

// =============================================================================
// PLATFORM CONFIGURATIONS
// =============================================================================

export const SOCIAL_PLATFORMS: Record<SocialPlatformType, SocialPlatformConfig> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    slug: 'instagram',
    displayName: 'Instagram',
    logoUrl: '/images/platforms/instagram-logo.svg',
    primaryColor: '#E1306C',
    gradientColors: ['#833AB4', '#FD1D1D', '#F77737', '#FCAF45'],
    isEnabled: true,
    isComingSoon: false,
    maxAccountsPerUser: 25,
    requiredScopes: INSTAGRAM_SCOPES.REQUIRED,
    optionalScopes: INSTAGRAM_SCOPES.OPTIONAL,
    features: PLATFORM_FEATURES.instagram,
    oauthConfig: {
      authorizationUrl: 'https://www.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
      revokeUrl: 'https://graph.instagram.com/me/permissions',
      scopeSeparator: ',',
      responseType: 'code',
      grantType: 'authorization_code',
    },
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    slug: 'tiktok',
    displayName: 'TikTok',
    logoUrl: '/images/platforms/tiktok-logo.svg',
    primaryColor: '#000000',
    gradientColors: ['#000000', '#25F4EE', '#FE2C55'],
    isEnabled: true,
    isComingSoon: false,
    maxAccountsPerUser: 10,
    requiredScopes: [],
    optionalScopes: [],
    features: PLATFORM_FEATURES.tiktok,
    oauthConfig: {
      authorizationUrl: 'https://www.tiktok.com/auth/authorize/',
      tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
      revokeUrl: 'https://open-api.tiktok.com/oauth/revoke/',
      scopeSeparator: ',',
      responseType: 'code',
      grantType: 'authorization_code',
    },
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    slug: 'youtube',
    displayName: 'YouTube',
    logoUrl: '/images/platforms/youtube-logo.svg',
    primaryColor: '#FF0000',
    gradientColors: ['#FF0000', '#282828'],
    isEnabled: true,
    isComingSoon: false,
    maxAccountsPerUser: 10,
    requiredScopes: [],
    optionalScopes: [],
    features: PLATFORM_FEATURES.youtube,
    oauthConfig: {
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      revokeUrl: 'https://oauth2.googleapis.com/revoke',
      scopeSeparator: ' ',
      responseType: 'code',
      grantType: 'authorization_code',
    },
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    slug: 'twitter',
    displayName: 'Twitter / X',
    logoUrl: '/images/platforms/twitter-logo.svg',
    primaryColor: '#1DA1F2',
    gradientColors: ['#1DA1F2', '#14171A'],
    isEnabled: false,
    isComingSoon: true,
    maxAccountsPerUser: 5,
    requiredScopes: [],
    optionalScopes: [],
    features: PLATFORM_FEATURES.twitter,
    oauthConfig: {
      authorizationUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
      revokeUrl: 'https://api.twitter.com/2/oauth2/revoke',
      scopeSeparator: ' ',
      responseType: 'code',
      grantType: 'authorization_code',
    },
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    slug: 'facebook',
    displayName: 'Facebook',
    logoUrl: '/images/platforms/facebook-logo.svg',
    primaryColor: '#1877F2',
    gradientColors: ['#1877F2', '#3b5998'],
    isEnabled: false,
    isComingSoon: true,
    maxAccountsPerUser: 10,
    requiredScopes: [],
    optionalScopes: [],
    features: PLATFORM_FEATURES.facebook,
    oauthConfig: {
      authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      revokeUrl: 'https://graph.facebook.com/v18.0/me/permissions',
      scopeSeparator: ',',
      responseType: 'code',
      grantType: 'authorization_code',
    },
  },
};

// =============================================================================
// MULTI-PLATFORM CONTENT SUPPORT - Centralized Platform IDs
// =============================================================================

/**
 * Supported content platforms for video/post fetching
 * Extended with Facebook and LinkedIn
 */
export type ContentPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin';

/**
 * Platform URL patterns for auto-detection
 * Extended with Facebook and LinkedIn patterns
 */
export const PLATFORM_URL_PATTERNS: Record<ContentPlatform, RegExp[]> = {
  instagram: [
    /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv|reels)\/[\w-]+/i,
    /^https?:\/\/(www\.)?instagr\.am\//i,
  ],
  tiktok: [
    /^https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i,
    /^https?:\/\/(www\.)?(vm|vt)\.tiktok\.com\/[\w-]+/i,
    /^https?:\/\/(www\.)?tiktok\.com\/t\/[\w-]+/i,
  ],
  youtube: [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/i,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/i,
    /^https?:\/\/youtu\.be\/[\w-]+/i,
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/i,
  ],
  facebook: [
    // Facebook video URLs
    /^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/[\w.-]+\/videos\/\d+/i,
    /^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/watch\/?\?v=\d+/i,
    /^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/reel\/\d+/i,
    /^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/[\w.-]+\/posts\/[\w-]+/i,
    /^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/story\.php/i,
    // Facebook short URLs
    /^https?:\/\/fb\.watch\/[\w-]+/i,
    /^https?:\/\/(www\.)?fb\.com\/[\w.-]+/i,
    // Facebook Shared Urls
    /^https?:\/\/(www\.|m\.|web\.)?facebook\.com\/share\/(r|v|p)\/[\w]+/i,
  ],
  linkedin: [
    // LinkedIn post URLs
    /^https?:\/\/(www\.)?linkedin\.com\/posts\/[\w-]+-\d+/i,
    /^https?:\/\/(www\.)?linkedin\.com\/feed\/update\/urn:li:(activity|share|ugcPost):\d+/i,
    /^https?:\/\/(www\.)?linkedin\.com\/video\/[\w-]+/i,
    /^https?:\/\/(www\.)?linkedin\.com\/embed\/feed\/update\/urn:li:(activity|share|ugcPost):\d+/i,
  ],
};

/**
 * Platform display configuration for UI components
 * Icons use react-icons/si (Simple Icons) for professional brand icons
 * Extended with Facebook and LinkedIn
 */
export type PlatformIconName = 'SiInstagram' | 'SiTiktok' | 'SiYoutube' | 'SiFacebook' | 'SiLinkedin';

export const CONTENT_PLATFORM_DISPLAY: Record<
  ContentPlatform,
  {
    name: string;
    iconName: PlatformIconName;
    color: string;
    bgClass: string;
    borderClass: string;
    supportsApiFetch: boolean;
  }
> = {
  instagram: {
    name: 'Instagram',
    iconName: 'SiInstagram',
    color: '#E1306C',
    bgClass: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400',
    borderClass: 'border-pink-500',
    supportsApiFetch: true,
  },
  tiktok: {
    name: 'TikTok',
    iconName: 'SiTiktok',
    color: '#000000',
    bgClass: 'bg-black',
    borderClass: 'border-black',
    supportsApiFetch: true,
  },
  youtube: {
    name: 'YouTube',
    iconName: 'SiYoutube',
    color: '#FF0000',
    bgClass: 'bg-red-600',
    borderClass: 'border-red-600',
    supportsApiFetch: true,
  },
  facebook: {
    name: 'Facebook',
    iconName: 'SiFacebook',
    color: '#1877F2',
    bgClass: 'bg-blue-600',
    borderClass: 'border-blue-600',
    supportsApiFetch: false, // Manual entry only
  },
  linkedin: {
    name: 'LinkedIn',
    iconName: 'SiLinkedin',
    color: '#0A66C2',
    bgClass: 'bg-blue-700',
    borderClass: 'border-blue-700',
    supportsApiFetch: false, // Manual entry only
  },
};

/**
 * Platform categories for grouping
 */
export const PLATFORM_CATEGORIES = {
  SOCIAL: ['instagram', 'facebook', 'tiktok'],
  VIDEO: ['youtube', 'tiktok'],
  BUSINESS: ['linkedin'],
  API_SUPPORTED: ['instagram', 'tiktok', 'youtube'],
  MANUAL_ONLY: ['facebook', 'linkedin'],
} as const;

// =============================================================================
// MULTI-PLATFORM HELPER FUNCTIONS
// =============================================================================


/**
 * Normalize URL by adding protocol if missing
 * Handles common user input variations
 */
const normalizeUrlForDetection = (url: string): string => {
  let normalized = url.trim();
  
  // Skip if empty
  if (!normalized) return normalized;
  
  // Already has protocol
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }
  
  // Remove leading slashes if any
  normalized = normalized.replace(/^\/+/, '');
  
  // Check if URL contains a known platform domain (without protocol)
  const platformDomains = [
    'instagram.com',
    'instagr.am',
    'tiktok.com',
    'vm.tiktok.com',
    'vt.tiktok.com',
    'youtube.com',
    'youtu.be',
    'facebook.com',
    'fb.com',
    'fb.watch',
    'linkedin.com',
    'lnkd.in',
  ];
  
  const hasKnownDomain = platformDomains.some(domain => 
    normalized.toLowerCase().includes(domain)
  );
  
  // Add https:// if URL contains a known domain but no protocol
  if (hasKnownDomain && !normalized.startsWith('http')) {
    normalized = `https://${normalized}`;
  }
  
  return normalized;
};

/**
 * Detect platform from URL automatically
 * Extended to support Facebook and LinkedIn
 * Handles URLs with or without protocol (http/https)
 */
export const detectPlatformFromUrl = (url: string): ContentPlatform | null => {
  if (!url?.trim()) return null;

  // Normalize URL to handle missing protocol
  const normalizedUrl = normalizeUrlForDetection(url);

  for (const [platform, patterns] of Object.entries(PLATFORM_URL_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(normalizedUrl))) {
      return platform as ContentPlatform;
    }
  }

  return null;
};

/**
 * Get internal platform ID for database operations
 */
export const getPlatformId = (platform: ContentPlatform): string => {
  // Try dynamic first
  if (isPlatformConfigInitialized()) {
    const dynamicId = getDynamicPlatformIdSync(platform);
    if (dynamicId) return dynamicId;
  }
  
  // Fallback to static
  const key = platform.toUpperCase() as keyof typeof PLATFORM_IDS;
  return PLATFORM_IDS[key];
};


/**
 * Get platform ID asynchronously (ensures config is loaded)
 */
export const getPlatformIdAsync = async (platform: ContentPlatform): Promise<string> => {
  try {
    return await getDynamicPlatformId(platform);
  } catch {
    // Fallback to static
    const key = platform.toUpperCase() as keyof typeof PLATFORM_IDS;
    return PLATFORM_IDS[key];
  }
};

/**
 * Get work platform ID for InsightIQ API calls
 */
export const getWorkPlatformId = (platform: ContentPlatform): string => {
  // Try dynamic first
  if (isPlatformConfigInitialized()) {
    const dynamicId = getDynamicWorkPlatformIdSync(platform);
    
    if (dynamicId) return dynamicId;
  }
  
  // Fallback to static
  const key = platform.toUpperCase() as keyof typeof WORK_PLATFORM_IDS;
  return WORK_PLATFORM_IDS[key];
};

/**
 * Get work platform ID asynchronously
 */
export const getWorkPlatformIdAsync = async (platform: ContentPlatform): Promise<string> => {
  try {
    return await getDynamicWorkPlatformId(platform);
  } catch {
    const key = platform.toUpperCase() as keyof typeof WORK_PLATFORM_IDS;
    return WORK_PLATFORM_IDS[key];
  }
};

/**
 * Get data source endpoint ID
 * Uses dynamic config if initialized, falls back to static
 * 
 * @param code - 'INSIGHTIQ' or 'MANUAL'
 * @returns Endpoint UUID
 */
export const getDataSourceEndpointId = (code: 'INSIGHTIQ' | 'MANUAL'): string => {
  // Try dynamic first
  if (isPlatformConfigInitialized()) {
    const dynamicId = getDynamicDataSourceEndpointIdSync(code);
    if (dynamicId) return dynamicId;
  }
  
  // Fallback to static
  return DATA_SOURCE_ENDPOINT_IDS[code];
};

/**
 * Get data source endpoint ID asynchronously
 */
export const getDataSourceEndpointIdAsync = async (
  code: 'INSIGHTIQ' | 'MANUAL'
): Promise<string> => {
  try {
    return await getDynamicDataSourceEndpointId(code);
  } catch {
    return DATA_SOURCE_ENDPOINT_IDS[code];
  }
};

/**
 * @deprecated Use getPlatformId() instead - kept for backward compatibility
 */
export const PLATFORM_IDS = {
  INSTAGRAM: '3e3fec72-7a84-42db-bed3-a59ae757fb25',
  TIKTOK: 'a2e9a5b3-10b9-4d05-bbcc-768b4dd9d5e0',
  YOUTUBE: '4b35f9f6-1c97-4742-b4c3-fced7b324428',
  FACEBOOK: '3024ce7d-bd7f-4899-8913-9198354746ce',
  LINKEDIN: '15939698-e5e9-43a6-98d2-4551c7d0ee88',
} as const;

/**
 * @deprecated Use getWorkPlatformId() instead - kept for backward compatibility
 */
export const WORK_PLATFORM_IDS = {
  INSTAGRAM: '9bb8913b-ddd9-430b-a66a-d74d846e6c66',
  TIKTOK: 'de55aeec-0dc8-4119-bf90-16b3d1f0c987',
  YOUTUBE: '14d9ddf5-51c6-415e-bde6-f8ed36ad7054',
  FACEBOOK: 'ad2fec62-2987-40a0-89fb-23485972598c',
  LINKEDIN: '36410629-f907-43ba-aa0d-434ca9c0501a',
} as const;

/**
 * @deprecated Use getDataSourceEndpointId() instead - kept for backward compatibility
 */
export const DATA_SOURCE_ENDPOINT_IDS = {
  INSIGHTIQ: '938f25c5-eaf9-4a0d-930d-bc5f4181604d',
  MANUAL: '692173aa-975f-45d9-805e-2057be9408c1',
} as const;

/**
 * Validate if URL is from a supported platform
 * @param url - The URL to validate
 * @param platform - Optional: specific platform to validate against
 * @returns boolean indicating if URL is valid
 */
export const isValidPlatformUrl = (url: string, platform?: ContentPlatform): boolean => {
  if (!url || url.trim() === '') return false;
  
  // If platform is specified, validate URL matches that specific platform
  if (platform) {
    const patterns = PLATFORM_URL_PATTERNS[platform];
    if (!patterns) return false;
    return patterns.some(pattern => pattern.test(url));
  }
  
  // Otherwise, check if URL matches any supported platform
  return detectPlatformFromUrl(url) !== null;
};

/**
 * Get platform display configuration for UI
 */
export const getContentPlatformDisplay = (platform: ContentPlatform) => {
  return CONTENT_PLATFORM_DISPLAY[platform];
};

/**
 * Check if platform supports API fetch (vs manual entry only)
 */
export const platformSupportsApiFetch = (platform: ContentPlatform): boolean => {
  return CONTENT_PLATFORM_DISPLAY[platform]?.supportsApiFetch ?? false;
};

/**
 * Check if platform requires manual entry only
 */
export const isManualOnlyPlatform = (platform: ContentPlatform): boolean => {
  return !platformSupportsApiFetch(platform);
};

/**
 * Get all platforms that support API fetch
 */
export const getApiFetchPlatforms = (): ContentPlatform[] => {
  return (Object.entries(CONTENT_PLATFORM_DISPLAY) as [ContentPlatform, typeof CONTENT_PLATFORM_DISPLAY[ContentPlatform]][])
    .filter(([_, config]) => config.supportsApiFetch)
    .map(([platform]) => platform);
};

/**
 * Get all platforms that require manual entry
 */
export const getManualOnlyPlatforms = (): ContentPlatform[] => {
  return (Object.entries(CONTENT_PLATFORM_DISPLAY) as [ContentPlatform, typeof CONTENT_PLATFORM_DISPLAY[ContentPlatform]][])
    .filter(([_, config]) => !config.supportsApiFetch)
    .map(([platform]) => platform);
};

/**
 * Extract video/post ID from platform URL
 */
export const extractContentId = (url: string, platform: ContentPlatform): string | null => {
  if (!url?.trim()) return null;

  try {
    switch (platform) {
      case 'instagram': {
        const match = url.match(/\/(p|reel|tv|reels)\/([\w-]+)/);
        return match?.[2] || null;
      }

      case 'youtube': {
        // Standard watch URL
        const watchMatch = url.match(/[?&]v=([\w-]+)/);
        if (watchMatch) return watchMatch[1];

        // Shorts URL
        const shortsMatch = url.match(/\/shorts\/([\w-]+)/);
        if (shortsMatch) return shortsMatch[1];

        // Short URL (youtu.be)
        const youtuBeMatch = url.match(/youtu\.be\/([\w-]+)/);
        if (youtuBeMatch) return youtuBeMatch[1];

        return null;
      }

      case 'tiktok': {
        const videoMatch = url.match(/\/video\/(\d+)/);
        if (videoMatch) return videoMatch[1];
        return null;
      }

      case 'facebook': {
        // Video ID from /videos/
        const videoMatch = url.match(/\/videos\/(\d+)/);
        if (videoMatch) return videoMatch[1];

        // Video ID from watch?v=
        const watchMatch = url.match(/[?&]v=(\d+)/);
        if (watchMatch) return watchMatch[1];

        // Reel ID
        const reelMatch = url.match(/\/reel\/(\d+)/);
        if (reelMatch) return reelMatch[1];

        // Post ID from /posts/
        const postMatch = url.match(/\/posts\/([\w-]+)/);
        if (postMatch) return postMatch[1];

        return null;
      }

      case 'linkedin': {
        // Activity/share/ugcPost ID
        const urnMatch = url.match(/urn:li:(activity|share|ugcPost):(\d+)/);
        if (urnMatch) return urnMatch[2];

        // Post ID from /posts/
        const postMatch = url.match(/\/posts\/[\w-]+-(\d+)/);
        if (postMatch) return postMatch[1];

        return null;
      }

      default:
        return null;
    }
  } catch {
    return null;
  }
};

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const PLATFORM_ICONS = {
  instagram: 'Instagram',
  tiktok: 'Music',
  youtube: 'Youtube',
  twitter: 'Twitter',
  facebook: 'Facebook',
  linkedin: 'Linkedin',
} as const;

export const STATUS_BADGE_STYLES = {
  active: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    dot: 'bg-green-500',
  },
  expired: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    dot: 'bg-yellow-500',
  },
  revoked: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    dot: 'bg-red-500',
  },
  pending: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    dot: 'bg-blue-500',
  },
  suspended: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    dot: 'bg-gray-500',
  },
} as const;

// =============================================================================
// ERROR CODES
// =============================================================================

export const OAUTH_ERROR_CODES = {
  ACCESS_DENIED: 'access_denied',
  INVALID_REQUEST: 'invalid_request',
  UNAUTHORIZED_CLIENT: 'unauthorized_client',
  UNSUPPORTED_RESPONSE_TYPE: 'unsupported_response_type',
  INVALID_SCOPE: 'invalid_scope',
  SERVER_ERROR: 'server_error',
  TEMPORARILY_UNAVAILABLE: 'temporarily_unavailable',
} as const;

export const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  [OAUTH_ERROR_CODES.ACCESS_DENIED]:
    'You denied access to your account. Please try again if this was unintentional.',
  [OAUTH_ERROR_CODES.INVALID_REQUEST]:
    'The connection request was invalid. Please try again.',
  [OAUTH_ERROR_CODES.UNAUTHORIZED_CLIENT]:
    'The application is not authorized. Please contact support.',
  [OAUTH_ERROR_CODES.UNSUPPORTED_RESPONSE_TYPE]:
    'An unexpected error occurred. Please try again.',
  [OAUTH_ERROR_CODES.INVALID_SCOPE]:
    'Invalid permissions requested. Please contact support.',
  [OAUTH_ERROR_CODES.SERVER_ERROR]:
    'A server error occurred. Please try again later.',
  [OAUTH_ERROR_CODES.TEMPORARILY_UNAVAILABLE]:
    'The service is temporarily unavailable. Please try again later.',
};

// =============================================================================
// OAUTH HELPER FUNCTIONS
// =============================================================================

/**
 * Build OAuth authorization URL for a platform
 */
export function buildOAuthUrl(
  platform: SocialPlatformType,
  clientId: string,
  redirectUri: string,
  scopes: string[],
  state: string
): string {
  const config = SOCIAL_PLATFORMS[platform];
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(config.oauthConfig.scopeSeparator),
    response_type: config.oauthConfig.responseType,
    state: state,
  });

  // Platform-specific parameters
  if (platform === 'instagram') {
    params.append('enable_fb_login', '0');
    params.append('force_authentication', '1');
  }

  return `${config.oauthConfig.authorizationUrl}?${params.toString()}`;
}

/**
 * Get platform display order
 */
export function getPlatformsInOrder(): SocialPlatformConfig[] {
  const order: SocialPlatformType[] = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'];
  return order.map(slug => SOCIAL_PLATFORMS[slug]);
}