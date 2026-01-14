// src/types/profile-refresh.ts
// Type definitions for the Refresh Profile Data feature
// Used when refreshing incomplete influencer data from premium analytics provider

import { CampaignListMember, StandardizedProfile } from './campaign-influencers';

/**
 * Parameters required to initiate a profile data refresh operation
 */
export interface RefreshProfileDataParams {
  /** Campaign list member ID (the row being updated) */
  campaignInfluencerId: string;
  /** Influencer's username (without @) */
  username: string;
  /** Platform work_platform_id (e.g., Instagram platform ID from env) */
  platformId: string;
  /** Campaign list ID for the add-to-campaign call */
  campaignListId: string;
  /** Platform name for API routing */
  platform: 'instagram' | 'tiktok' | 'youtube';
}

/**
 * Result of a profile data refresh operation
 */
export interface RefreshProfileDataResult {
  /** Whether the refresh operation succeeded */
  success: boolean;
  /** Updated campaign list member data for local row update */
  updatedMember?: CampaignListMember;
  /** Error message if operation failed */
  error?: string;
  /** Source of data: 'cached' if from backend, 'fresh' if fetched from provider */
  dataSource: 'cached' | 'fresh';
}

/**
 * Progress state during refresh operation
 */
export interface RefreshProgressState {
  /** Current step number */
  step: number;
  /** Total number of steps */
  totalSteps: number;
  /** Human-readable progress message */
  message: string;
}

/**
 * Options for the useRefreshProfileData hook
 */
export interface UseRefreshProfileDataOptions {
  /** Platform work_platform_id for API calls */
  platformId: string;
  /** Platform name (instagram, tiktok, youtube) */
  platform: 'instagram' | 'tiktok' | 'youtube';
  /** Campaign list ID */
  campaignListId: string;
  /** Callback when refresh succeeds - receives result with updated member */
  onSuccess?: (result: RefreshProfileDataResult) => void;
  /** Callback when refresh fails */
  onError?: (error: string) => void;
  /** Whether to show confirmation modal before refresh (default: true) */
  requireConfirmation?: boolean;
}

/**
 * Return type for the useRefreshProfileData hook
 */
export interface UseRefreshProfileDataReturn {
  // State
  /** Whether a refresh operation is in progress */
  isRefreshing: boolean;
  /** Whether the confirmation modal is visible */
  showConfirmationModal: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Current progress state */
  progress: RefreshProgressState;
  
  // Actions
  /** Initiate a refresh for the given member (shows confirmation if enabled) */
  initiateRefresh: (member: CampaignListMember) => void;
  /** Confirm and execute the pending refresh operation */
  confirmRefresh: () => Promise<RefreshProfileDataResult | null>;
  /** Cancel the pending refresh operation */
  cancelRefresh: () => void;
  /** Clear the current error state */
  clearError: () => void;
}

/**
 * Progress messages for each step of the refresh operation
 */
export const REFRESH_PROGRESS_MESSAGES = {
  CHECKING_CACHE: 'Checking for existing analytics data...',
  FETCHING_ANALYTICS: 'Fetching comprehensive profile analytics...',
  SAVING_ANALYTICS: 'Saving analytics data...',
  UPDATING_CAMPAIGN: 'Updating campaign record...',
  COMPLETED: 'Profile data refreshed successfully',
} as const;

/**
 * Total number of steps in the refresh operation
 */
export const REFRESH_TOTAL_STEPS = 4;