// src/services/ensembledata/creator-profile/index.ts
// Export all creator profile services with clear function-purpose naming

// Client-side service exports (for components and client-side operations)
export {
  getCreatorProfile,
  getInstagramUserDetailedInfo,
  validateAndCleanUsername,
  isSupportedPlatform,
} from './creator-profile.service';

// Server-side service exports (for API routes and server-side operations)
export {
  getCreatorProfileServer,
  validateEnsembleDataConfig,
} from './creator-profile.server';

// Utility functions with descriptive names based on their purpose
export {
  extractBasicUserInfo as extractBasicInfoFromApiResponse
} from './creator-profile.service';

export {
  extractBasicUserInfo as extractBasicInfoFromEnsembleData
} from './creator-profile.server';

// Re-export types for convenience
export type {
  CreatorProfileRequest,
  CreatorProfileResponse,
  CreatorProfile,
  InstagramUserDetailedInfo,
  InstagramUserBasicInfo,
} from '@/types/ensembledata';