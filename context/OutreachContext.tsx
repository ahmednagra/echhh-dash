// src/context/OutreachContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
import { getAllCampaignInfluencers, removeOnboardedInfluencers, markInfluencersOnboarded } from '@/services/campaign-influencers/campaign-influencers.client';
import { CampaignListMember } from '@/types/campaign-influencers';
import { Campaign } from '@/types/campaign';

interface OutreachContextType {
  // Shared state
  allInfluencers: CampaignListMember[];
  loading: boolean;
  error: string | null;
  
  // Derived data
  onboardedInfluencers: CampaignListMember[];
  readyToOnboardInfluencers: CampaignListMember[];
  
  // Actions
  fetchInfluencers: (campaignData: Campaign | null) => Promise<void>;
  removeFromOnboarded: (influencerId: string) => Promise<void>;
  onboardSelected: (influencerIds: string[]) => Promise<void>;
  refreshData: () => Promise<void>;
  
  // NEW: Drag & Drop specific actions
  onboardSingle: (influencerId: string) => Promise<void>; // For drag & drop single influencer onboarding
  
  // Current campaign
  currentCampaign: Campaign | null;
  setCurrentCampaign: (campaign: Campaign | null) => void;
  updateInfluencer: (influencerId: string, updates: Partial<CampaignListMember>) => void;
}

const OutreachContext = createContext<OutreachContextType | undefined>(undefined);

export const useOutreach = (): OutreachContextType => {
  const context = useContext(OutreachContext);
  if (!context) {
    throw new Error('useOutreach must be used within an OutreachProvider');
  }
  return context;
};

interface OutreachProviderProps {
  children: ReactNode;
}

export const OutreachProvider: React.FC<OutreachProviderProps> = ({ children }) => {
  // Core state
  const [allInfluencers, setAllInfluencers] = useState<CampaignListMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);

  // Refs to avoid infinite loops and track current state
  const lastFetchedCampaignId = useRef<string | null>(null);
  const isCurrentlyFetching = useRef<boolean>(false);
  const currentCampaignRef = useRef<Campaign | null>(null);

  // Update ref when campaign changes
  useEffect(() => {
    currentCampaignRef.current = currentCampaign;
  }, [currentCampaign]);

  // Derived data - computed from allInfluencers
  const onboardedInfluencers = useMemo(() => 
    allInfluencers.filter(influencer => 
      influencer.onboarded_at !== null && influencer.onboarded_at !== undefined
    ), [allInfluencers]);

  // ✨ UPDATED: Added price_approved condition
const readyToOnboardInfluencers = useMemo(() => 
  allInfluencers.filter(influencer => 
    influencer.status?.name?.toLowerCase() === 'completed' &&
    (influencer.onboarded_at === null || influencer.onboarded_at === undefined)
    // influencer.price_approved === true
  ), [allInfluencers]);

  // Fetch all campaign influencers - stable version
  const fetchInfluencers = useCallback(async (campaignData: Campaign | null) => {
    if (!campaignData?.campaign_lists?.[0]?.id) {
      console.log('🚫 OutreachContext: No campaign data or campaign list ID available');
      setAllInfluencers([]);
      setCurrentCampaign(null);
      lastFetchedCampaignId.current = null;
      return;
    }

    const campaignId = campaignData.id;
    const listId = campaignData.campaign_lists[0].id;

    // Prevent duplicate fetches
    if (isCurrentlyFetching.current) {
      console.log('🔄 OutreachContext: Already fetching, skipping');
      return;
    }

    // Don't fetch if we already have data for this campaign
    if (lastFetchedCampaignId.current === campaignId) {
      console.log('✅ OutreachContext: Already have data for this campaign, skipping fetch');
      return;
    }

    isCurrentlyFetching.current = true;
    setLoading(true);
    setError(null);
    setCurrentCampaign(campaignData);

    try {
      
      const response = await getAllCampaignInfluencers(listId);
      
      if (response.success) {
        setAllInfluencers(response.influencers);
        lastFetchedCampaignId.current = campaignId;
      } else {
        throw new Error(response.message || 'Failed to fetch campaign influencers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      setAllInfluencers([]);
      lastFetchedCampaignId.current = null;
    } finally {
      setLoading(false);
      isCurrentlyFetching.current = false;
    }
  }, []); // Empty dependency array - function is stable

  // Remove influencer from onboarded status
  const removeFromOnboarded = useCallback(async (influencerId: string) => {
    // Use ref to get current campaign without causing re-renders
    const campaign = currentCampaignRef.current;
    
    if (!campaign?.campaign_lists?.[0]?.id) {
      console.error('❌ OutreachContext: No campaign list ID available for removeFromOnboarded');
      return;
    }

    // Clear any existing errors before starting the operation
    setError(null);

    try {
      const campaignListId = campaign.campaign_lists[0].id;
      console.log('🔄 OutreachContext: Removing influencer from onboarded:', { campaignListId, influencerId });

      const response = await removeOnboardedInfluencers(campaignListId, [influencerId]);

      if (response.success) {
        console.log('✅ OutreachContext: Successfully removed influencer from onboarded:', response.message);
        
        // Update state immediately for real-time updates
        setAllInfluencers(prevInfluencers => {
          const updated = prevInfluencers.map(inf => 
            inf.id === influencerId 
              ? { ...inf, onboarded_at: null }
              : inf
          );
          console.log('🔄 OutreachContext: Updated influencers after removal. Onboarded count:', 
            updated.filter(i => i.onboarded_at).length, 
            'Ready to onboard count:', 
            updated.filter(i => i.status?.name?.toLowerCase() === 'completed' && !i.onboarded_at).length
          );
          return updated;
        });
        
        // Make sure to clear any errors after successful operation
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to remove influencer from onboarded');
      }
    } catch (err) {
      console.error('❌ OutreachContext: Error removing influencer from onboarded:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove influencer');
    }
  }, []); // Empty dependency array - uses ref for current campaign

  // Onboard selected influencers
  const onboardSelected = useCallback(async (influencerIds: string[]) => {
    // Use ref to get current campaign without causing re-renders
    const campaign = currentCampaignRef.current;
    
    if (!campaign?.campaign_lists?.[0]?.id || influencerIds.length === 0) {
      console.error('❌ OutreachContext: No campaign list ID available or no influencers selected for onboardSelected');
      return;
    }

    // Clear any existing errors before starting the operation
    setError(null);

    try {
      const campaignListId = campaign.campaign_lists[0].id;
      console.log('🔄 OutreachContext: Onboarding selected influencers:', { campaignListId, influencerIds });

      const response = await markInfluencersOnboarded(campaignListId, influencerIds);

      if (response.success) {
        console.log('✅ OutreachContext: Successfully onboarded influencers:', response.message);
        
        // Update state immediately for real-time updates
        const currentTimestamp = new Date().toISOString();
        setAllInfluencers(prevInfluencers => {
          const updated = prevInfluencers.map(inf => 
            influencerIds.includes(inf.id)
              ? { ...inf, onboarded_at: currentTimestamp }
              : inf
          );
          console.log('🔄 OutreachContext: Updated influencers after onboarding. Onboarded count:', 
            updated.filter(i => i.onboarded_at).length, 
            'Ready to onboard count:', 
            updated.filter(i => i.status?.name?.toLowerCase() === 'completed' && !i.onboarded_at).length
          );
          return updated;
        });
        
        // Make sure to clear any errors after successful operation
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to onboard influencers');
      }
    } catch (err) {
      console.error('❌ OutreachContext: Error onboarding influencers:', err);
      setError(err instanceof Error ? err.message : 'Failed to onboard influencers');
      throw err; // Re-throw so calling component can handle it
    }
  }, []); // Empty dependency array - uses ref for current campaign

  // NEW: Onboard single influencer (for drag & drop)
  const onboardSingle = useCallback(async (influencerId: string) => {
    console.log('🔄 OutreachContext: Onboarding single influencer via drag & drop:', influencerId);
    return onboardSelected([influencerId]);
  }, [onboardSelected]);

  // Refresh data from server
  const refreshData = useCallback(async () => {
    const campaign = currentCampaign;
    if (campaign) {
      // Reset the fetch tracking so it will fetch again
      lastFetchedCampaignId.current = null;
      await fetchInfluencers(campaign);
    }
  }, [fetchInfluencers]); // Only depend on fetchInfluencers

  const updateInfluencer = useCallback((influencerId: string, updates: Partial<CampaignListMember>) => {
    setAllInfluencers(prevInfluencers => 
      prevInfluencers.map(inf => 
        inf.id === influencerId 
          ? { ...inf, ...updates }
          : inf
      )
    );
    console.log('🔄 OutreachContext: Updated individual influencer:', influencerId, updates);
  }, []);

  const contextValue: OutreachContextType = {
    // State
    allInfluencers,
    loading,
    error,
    
    // Derived data
    onboardedInfluencers,
    readyToOnboardInfluencers,
    
    // Actions
    fetchInfluencers,
    removeFromOnboarded,
    onboardSelected,
    refreshData,
    updateInfluencer,
    
    // NEW: Drag & Drop specific
    onboardSingle,
    
    // Current campaign
    currentCampaign,
    setCurrentCampaign
  };

  return (
    <OutreachContext.Provider value={contextValue}>
      {children}
    </OutreachContext.Provider>
  );
};