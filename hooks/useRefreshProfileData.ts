// src/hooks/useRefreshProfileData.ts
// Reusable hook for refreshing influencer profile data
// Provides state management, confirmation modal control, and progress tracking

import { useState, useCallback } from 'react';
import { refreshInfluencerProfileData } from '@/services/profile-refresh';
import { 
  UseRefreshProfileDataOptions,
  UseRefreshProfileDataReturn,
  RefreshProgressState,
  RefreshProfileDataResult,
  REFRESH_TOTAL_STEPS
} from '@/types/profile-refresh';
import { CampaignListMember } from '@/types/campaign-influencers';
import { toast } from 'react-hot-toast';

/**
 * Initial progress state
 */
const INITIAL_PROGRESS: RefreshProgressState = {
  step: 0,
  totalSteps: REFRESH_TOTAL_STEPS,
  message: ''
};

/**
 * Hook for managing profile data refresh operations
 * 
 * Features:
 * - Confirmation modal control
 * - Progress tracking
 * - Error handling
 * - Success/error callbacks
 * 
 * @param options - Configuration options including platform info and callbacks
 * @returns State and actions for controlling the refresh operation
 * 
 * @example
 * ```tsx
 * const {
 *   isRefreshing,
 *   showConfirmationModal,
 *   progress,
 *   initiateRefresh,
 *   confirmRefresh,
 *   cancelRefresh
 * } = useRefreshProfileData({
 *   platformId: selectedPlatform.work_platform_id,
 *   platform: 'instagram',
 *   campaignListId: campaignData.campaign_lists[0].id,
 *   onSuccess: (result) => {
 *     if (result.updatedMember) {
 *       updateLocalRow(result.updatedMember);
 *     }
 *   }
 * });
 * ```
 */
export function useRefreshProfileData(
  options: UseRefreshProfileDataOptions
): UseRefreshProfileDataReturn {
  const { 
    platformId, 
    platform, 
    campaignListId, 
    onSuccess, 
    onError,
    requireConfirmation = true 
  } = options;
  
  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<RefreshProgressState>(INITIAL_PROGRESS);
  const [pendingMember, setPendingMember] = useState<CampaignListMember | null>(null);
  
  /**
   * Progress callback for the refresh service
   */
  const handleProgress = useCallback((step: number, message: string) => {
    setProgress({ 
      step, 
      totalSteps: REFRESH_TOTAL_STEPS, 
      message 
    });
  }, []);
  
  /**
   * Execute the actual refresh operation
   */
  const executeRefresh = useCallback(async (
    member: CampaignListMember
  ): Promise<RefreshProfileDataResult | null> => {
    // Validate required data
    if (!member.social_account) {
      const errorMsg = 'Missing social account data for this influencer';
      setError(errorMsg);
      toast.error(errorMsg);
      onError?.(errorMsg);
      return null;
    }
    
    if (!member.id) {
      const errorMsg = 'Missing campaign influencer ID';
      setError(errorMsg);
      toast.error(errorMsg);
      onError?.(errorMsg);
      return null;
    }
    
    const username = member.social_account.account_handle;
    if (!username) {
      const errorMsg = 'Missing username for this influencer';
      setError(errorMsg);
      toast.error(errorMsg);
      onError?.(errorMsg);
      return null;
    }
    
    setIsRefreshing(true);
    setError(null);
    setProgress(INITIAL_PROGRESS);
    
    try {
      const result = await refreshInfluencerProfileData({
        campaignInfluencerId: member.id,
        username,
        platformId,
        campaignListId,
        platform
      }, handleProgress);
      
      if (result.success) {
        const successMessage = result.dataSource === 'cached'
          ? 'Profile data updated from cache'
          : 'Profile data refreshed successfully';
        
        toast.success(successMessage);
        onSuccess?.(result);
      } else {
        const errorMsg = result.error || 'Failed to refresh profile data';
        setError(errorMsg);
        toast.error(errorMsg);
        onError?.(errorMsg);
      }
      
      return result;
      
    } catch (err) {
      const errorMsg = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred while refreshing profile data';
      
      setError(errorMsg);
      toast.error(errorMsg);
      onError?.(errorMsg);
      
      return null;
      
    } finally {
      setIsRefreshing(false);
      setShowConfirmationModal(false);
      setPendingMember(null);
    }
  }, [platformId, platform, campaignListId, handleProgress, onSuccess, onError]);
  
  /**
   * Initiate a refresh operation
   * Shows confirmation modal if requireConfirmation is true
   */
  const initiateRefresh = useCallback((member: CampaignListMember) => {
    setError(null);
    setPendingMember(member);
    
    if (requireConfirmation) {
      setShowConfirmationModal(true);
    } else {
      // Execute immediately without confirmation
      executeRefresh(member);
    }
  }, [requireConfirmation, executeRefresh]);
  
  /**
   * Confirm and execute the pending refresh operation
   */
  const confirmRefresh = useCallback(async (): Promise<RefreshProfileDataResult | null> => {
    if (!pendingMember) {
      console.warn('useRefreshProfileData: confirmRefresh called without pending member');
      return null;
    }
    
    return executeRefresh(pendingMember);
  }, [pendingMember, executeRefresh]);
  
  /**
   * Cancel the pending refresh operation
   */
  const cancelRefresh = useCallback(() => {
    setShowConfirmationModal(false);
    setPendingMember(null);
    setError(null);
    setProgress(INITIAL_PROGRESS);
  }, []);
  
  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    // State
    isRefreshing,
    showConfirmationModal,
    error,
    progress,
    
    // Actions
    initiateRefresh,
    confirmRefresh,
    cancelRefresh,
    clearError
  };
}

export default useRefreshProfileData;