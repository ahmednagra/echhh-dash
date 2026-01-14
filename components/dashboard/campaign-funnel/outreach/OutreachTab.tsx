// src/components/dashboard/campaign-funnel/outreach/OutreachTab.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { OutreachProvider, useOutreach } from '@/context/OutreachContext';
import { useCampaigns } from '@/context/CampaignContext';
import { useClientReviewStatuses } from '@/hooks/queries';
import { Status } from '@/types/statuses';
import MessageSent from './MessageSent';
import ReadyToOnboard from './ReadyToOnboard';
import OnBoarded from './OnBoarded';
import SelectedManually from './selected-manually';

/**
 * OutreachContent Component
 * 
 * Inner component that uses context and React Query hooks.
 * Separated from provider for proper hook usage.
 * 
 * Data Flow:
 * 1. CampaignContext provides currentCampaign
 * 2. OutreachContext fetches and manages influencers for that campaign
 * 3. React Query (useClientReviewStatuses) handles status data with caching
 * 
 * Benefits of React Query for statuses:
 * - Automatic caching (30 min for static data)
 * - No duplicate API calls across components
 * - Shared cache across all components using this hook
 * - Built-in loading/error states
 */
const OutreachContent: React.FC = () => {
  // ============================================
  // LOCAL STATE
  // ============================================
  const [showManualSelection, setShowManualSelection] = useState(false);

  // ============================================
  // CONTEXT HOOKS
  // ============================================
  const { 
    fetchInfluencers, 
    readyToOnboardInfluencers, 
    currentCampaign, 
    refreshData, 
    onboardSelected 
  } = useOutreach();
  const { currentCampaign: campaignFromContext } = useCampaigns();

  // ============================================
  // REACT QUERY HOOKS
  // ============================================
  /**
   * Fetch client review statuses using React Query
   * 
   * Configuration:
   * - staleTime: 30 minutes (STALE_TIMES.STATIC)
   * - Won't refetch on window focus or component remount
   * - Shared cache across all components using this hook
   * 
   * This replaces the previous useEffect that was causing multiple API calls.
   * Now the data is fetched once and cached, eliminating duplicate requests.
   */
  const { 
    data: clientReviewStatuses = [], 
    isLoading: statusesLoading,
    isError: statusesError,
    error: statusesErrorDetails,
  } = useClientReviewStatuses();

  // Log error if statuses fetch fails (for debugging)
  useEffect(() => {
    if (statusesError && statusesErrorDetails) {
      console.error('❌ OutreachTab: Error fetching client review statuses:', statusesErrorDetails);
    }
  }, [statusesError, statusesErrorDetails]);

  // ============================================
  // EFFECTS - Fetch influencers when campaign changes
  // ============================================
  /**
   * Fetch influencers when campaign changes
   * 
   * Note: We're keeping the OutreachContext for influencer fetching
   * because it manages complex state with derived data (onboarded, readyToOnboard).
   * The context already has refs to prevent duplicate fetches.
   * 
   * In a future phase, this can be migrated to React Query with
   * the useCampaignInfluencers hook for consistent caching behavior.
   */
  useEffect(() => {    
    if (campaignFromContext) {
      console.log('🔄 OutreachTab: Fetching influencers for campaign:', campaignFromContext.id);
      fetchInfluencers(campaignFromContext);
    } else {
      console.log('⚠️ OutreachTab: No campaign data available');
    }
  }, [campaignFromContext, fetchInfluencers]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  /**
   * Handle status update in SelectedManually to refresh ReadyToOnboard data
   */
  const handleStatusUpdate = useCallback(async () => {
    console.log('🔄 OutreachTab: Status updated in SelectedManually, refreshing data');
    await refreshData();
  }, [refreshData]);

  /**
   * Open manual selection view
   */
  const handleSelectManually = useCallback(() => {
    console.log('Opening manual selection view');
    setShowManualSelection(true);
  }, []);

  /**
   * Return to main view from manual selection
   */
  const handleBackToMain = useCallback(() => {
    console.log('Returning to main view');
    setShowManualSelection(false);
  }, []);

  /**
   * Auto-close manual selection when all influencers are onboarded
   */
  const handleAllOnboarded = useCallback(() => {
    console.log('All influencers onboarded, closing manual selection');
    setShowManualSelection(false);
  }, []);

  /**
   * Handle drag and drop from ReadyToOnboard to OnBoarded
   */
  const handleInfluencerDrop = useCallback(async (influencerId: string) => {
    try {
      console.log('🔄 OutreachTab: Dropping influencer to onboard:', influencerId);
      await onboardSelected([influencerId]);
      console.log('✅ OutreachTab: Successfully onboarded influencer via drag & drop');
    } catch (error) {
      console.error('❌ OutreachTab: Error onboarding influencer via drag & drop:', error);
    }
  }, [onboardSelected]);

  // ============================================
  // RENDER - Manual Selection View
  // ============================================
  if (showManualSelection) {
    return (
      <SelectedManually 
        onBack={handleBackToMain}
        onAllOnboarded={handleAllOnboarded}
        campaignData={campaignFromContext}
        clientReviewStatuses={clientReviewStatuses}
        statusesLoading={statusesLoading}
        onStatusUpdate={handleStatusUpdate}
      />
    );
  }

  // ============================================
  // RENDER - Main Outreach View
  // ============================================
  return (
    <div className="p-6">
      {/* Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Sent Card */}
        <div className="relative">
          <MessageSent 
            campaignData={campaignFromContext} 
            clientReviewStatuses={clientReviewStatuses}
            statusesLoading={statusesLoading}
          />
        </div>

        {/* Ready to Onboard Card with Built-in Sliding Buttons */}
        <div className="relative">
          <ReadyToOnboard 
            clientReviewStatuses={clientReviewStatuses}
            statusesLoading={statusesLoading}
            enableDrag={true}
            onSelectManually={handleSelectManually}
          />
        </div>

        {/* On Boarded Card with Built-in Sliding Buttons */}
        <div className="relative">
          <OnBoarded 
            enableDrop={true}
            onInfluencerDrop={handleInfluencerDrop}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * OutreachTab Component
 * 
 * Main component that wraps content with OutreachProvider.
 * The OutreachProvider manages influencer state and actions.
 */
const OutreachTab: React.FC = () => {
  return (
    <OutreachProvider>
      <OutreachContent />
    </OutreachProvider>
  );
};

export default OutreachTab;