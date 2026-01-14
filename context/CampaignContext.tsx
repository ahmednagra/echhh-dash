// src/context/CampaignContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCompanyCampaigns, getCampaignById } from '@/services/campaign/campaign.service';
import { getStoredCompany } from '@/services/auth/auth.utils';
import { Campaign } from '@/types/campaign';

interface CampaignContextType {
  campaigns: Campaign[];
  currentCampaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  refreshCampaigns: (force?: boolean) => Promise<void>;
  setCurrentCampaign: (campaign: Campaign | null) => void;
  getCampaign: (id: string) => Promise<Campaign | null>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  
  // Use ref to access latest campaigns without causing re-renders
  const campaignsRef = useRef<Campaign[]>([]);
  
  // Keep ref in sync with state
  useEffect(() => {
    campaignsRef.current = campaigns;
  }, [campaigns]);

  // Track ongoing requests to prevent duplicates
  const ongoingRequests = useRef<Set<string>>(new Set());

  // Get a specific campaign by ID
  const getCampaign = useCallback(async (id: string): Promise<Campaign | null> => {
    try {
      // First check if it's in our local state using ref
      const existingCampaign = campaignsRef.current.find(c => c.id === id);
      if (existingCampaign) {
        setCurrentCampaign(existingCampaign);
        return existingCampaign;
      }
      
      // Prevent duplicate requests for the same ID
      if (ongoingRequests.current.has(id)) {
        // Wait for ongoing request to complete and then check again
        while (ongoingRequests.current.has(id)) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        // Check again after waiting
        const campaignAfterWait = campaignsRef.current.find(c => c.id === id);
        if (campaignAfterWait) {
          setCurrentCampaign(campaignAfterWait);
          return campaignAfterWait;
        }
        return currentCampaign?.id === id ? currentCampaign : null;
      }
      
      // Mark request as ongoing
      ongoingRequests.current.add(id);
      
      try {
        // Otherwise fetch from API
        const campaign = await getCampaignById(id);
        if (campaign) {
          setCurrentCampaign(campaign);
          // Add to campaigns list if not already there
          setCampaigns(prev => {
            if (!prev.find(c => c.id === campaign.id)) {
              return [...prev, campaign];
            }
            return prev;
          });
        }
        return campaign;
      } finally {
        // Remove from ongoing requests
        ongoingRequests.current.delete(id);
      }
    } catch (error) {
      ongoingRequests.current.delete(id);
      console.error('Error fetching campaign:', error);
      return null;
    }
  }, []); // No dependencies to prevent recreation

  // Refresh campaigns function with throttling
  const refreshCampaigns = useCallback(async (force = false) => {
    // Don't fetch if user is not authenticated or not a company
    if (!isAuthenticated || user?.user_type !== 'b2c') {
      return;
    }
    
    // Throttle requests - only fetch if it's been more than 30 seconds since last fetch
    // unless force=true is passed
    const now = Date.now();
    if (!force && lastFetchTime && now - lastFetchTime < 30000) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const company = getStoredCompany();
      if (!company || !company.id) {
        setIsLoading(false);
        return;
      }
      
      const fetchedCampaigns = await getCompanyCampaigns(company.id);
      setCampaigns(fetchedCampaigns);
      setLastFetchTime(now);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to load campaigns');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, lastFetchTime]);

  // Initial fetch when context mounts
  useEffect(() => {
    if (isAuthenticated && user?.user_type === 'b2c') {
      refreshCampaigns();
    }
  }, [isAuthenticated, user, refreshCampaigns]);

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        currentCampaign,
        isLoading,
        error,
        refreshCampaigns,
        setCurrentCampaign,
        getCampaign
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
}