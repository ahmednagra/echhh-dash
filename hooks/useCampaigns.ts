// src/hooks/useCampaigns.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Campaign, 
  getCompanyCampaigns, 
  getDeletedCampaigns,
  deleteCampaign,
  DeleteType 
} from '@/services/campaign';
import { getStoredCompany } from '@/services/auth/auth.utils';

interface UseCampaignsOptions {
  autoLoad?: boolean;
  companyId?: string;
  includeDeleted?: boolean;
}

interface UseCampaignsReturn {
  // Data
  campaigns: Campaign[];
  deletedCampaigns: Campaign[];
  filteredCampaigns: Campaign[];
  
  // Loading states
  isLoading: boolean;
  isDeleting: boolean;
  isLoadingDeleted: boolean;
  
  // Error states
  error: string | null;
  deleteError: string | null;
  deletedError: string | null;
  
  // Search and filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // View management
  isTrashView: boolean;
  setIsTrashView: (isTrash: boolean) => void;
  
  // Actions
  loadCampaigns: () => Promise<void>;
  loadDeletedCampaigns: () => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  handleCampaignAction: (campaignId: string, actionType: DeleteType) => Promise<boolean>;
  refreshCampaigns: () => Promise<void>;
  refreshAll: () => Promise<void>;
  clearError: () => void;
  
  // Computed values
  isEmpty: boolean;
  hasSearchResults: boolean;
  deletedCount: number;
  activeCount: number;
}

export function useCampaigns(options: UseCampaignsOptions = {}): UseCampaignsReturn {
  const { autoLoad = true, companyId: providedCompanyId, includeDeleted = false } = options;
  
  // State management
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [deletedCampaigns, setDeletedCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletedError, setDeletedError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTrashView, setIsTrashView] = useState(false);

  // Refs to track loading states and prevent duplicate calls
  const hasCampaignsLoaded = useRef(false);
  const hasDeletedLoaded = useRef(false);
  const campaignsLoadingRef = useRef(false);
  const deletedLoadingRef = useRef(false);

  // Filter campaigns based on search query and view
  const currentCampaigns = isTrashView ? deletedCampaigns : campaigns;
  const filteredCampaigns = searchQuery
    ? currentCampaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentCampaigns;

  // Computed values
  const isEmpty = campaigns.length === 0 && deletedCampaigns.length === 0;
  const hasSearchResults = searchQuery ? filteredCampaigns.length > 0 : true;
  const deletedCount = deletedCampaigns.length;
  const activeCount = campaigns.length;

  // Load active campaigns function
  const loadCampaigns = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (campaignsLoadingRef.current) {
      console.log('🔄 Campaign Service: Load campaigns already in progress, skipping...');
      return;
    }

    try {
      campaignsLoadingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      // Get company ID
      const companyId = providedCompanyId || getStoredCompany()?.id;
      
      if (!companyId) {
        throw new Error('Company information not found');
      }
      
      console.log('🚀 useCampaigns: Loading campaigns for company:', companyId);
      
      const data = await getCompanyCampaigns(companyId, {
        filters: { include_deleted: false }
      });
      
      setCampaigns(data);
      hasCampaignsLoaded.current = true;
      console.log('✅ useCampaigns: Campaigns loaded successfully:', data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load campaigns';
      setError(errorMessage);
      console.error('💥 useCampaigns: Error loading campaigns:', err);
    } finally {
      setIsLoading(false);
      campaignsLoadingRef.current = false;
    }
  }, [providedCompanyId]);

  // Load deleted campaigns function
  const loadDeletedCampaigns = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (deletedLoadingRef.current) {
      console.log('🔄 Campaign Service: Load deleted campaigns already in progress, skipping...');
      return;
    }

    try {
      deletedLoadingRef.current = true;
      setIsLoadingDeleted(true);
      setDeletedError(null);
      
      // Get company ID
      const companyId = providedCompanyId || getStoredCompany()?.id;
      
      if (!companyId) {
        throw new Error('Company information not found');
      }
      
      console.log('🚀 useCampaigns: Loading deleted campaigns for company:', companyId);
      
      const data = await getDeletedCampaigns(companyId);
      setDeletedCampaigns(data);
      hasDeletedLoaded.current = true;
      console.log('✅ useCampaigns: Deleted campaigns loaded successfully:', data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load deleted campaigns';
      setDeletedError(errorMessage);
      console.error('💥 useCampaigns: Error loading deleted campaigns:', err);
    } finally {
      setIsLoadingDeleted(false);
      deletedLoadingRef.current = false;
    }
  }, [providedCompanyId]);

  // Legacy delete function for backward compatibility
  const deleteCampaignLegacy = useCallback(async (campaignId: string): Promise<boolean> => {
    return handleCampaignAction(campaignId, 'soft');
  }, []);

  // Handle campaign actions (soft delete, hard delete, restore)
  const handleCampaignAction = useCallback(async (campaignId: string, actionType: DeleteType): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      const response = await deleteCampaign(campaignId, actionType);
      
      if (!response.success) {
        throw new Error(response.error || `Failed to ${actionType} campaign`);
      }
      
      // Update state based on action type
      switch (actionType) {
        case 'soft':
          // Move campaign from active to deleted
          const softDeletedCampaign = campaigns.find(c => c.id === campaignId);
          if (softDeletedCampaign) {
            setCampaigns(prev => prev.filter(c => c.id !== campaignId));
            setDeletedCampaigns(prev => [...prev, { 
              ...softDeletedCampaign, 
              is_deleted: true, 
              deleted_at: new Date().toISOString() 
            }]);
          }
          break;
          
        case 'hard':
          // Remove from both active and deleted lists
          setCampaigns(prev => prev.filter(c => c.id !== campaignId));
          setDeletedCampaigns(prev => prev.filter(c => c.id !== campaignId));
          break;
          
        case 'restore':
          // Move campaign from deleted to active
          const restoredCampaign = deletedCampaigns.find(c => c.id === campaignId);
          if (restoredCampaign) {
            setDeletedCampaigns(prev => prev.filter(c => c.id !== campaignId));
            setCampaigns(prev => [...prev, { 
              ...restoredCampaign, 
              is_deleted: false, 
              deleted_at: null 
            }]);
          }
          break;
      }
      
      console.log(`Campaign ${actionType} action completed successfully:`, campaignId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${actionType} campaign`;
      setDeleteError(errorMessage);
      console.error(`Error performing ${actionType} action on campaign:`, err);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [campaigns, deletedCampaigns]);

  // Refresh campaigns (alias for loadCampaigns for backward compatibility)
  const refreshCampaigns = useCallback(() => {
    hasCampaignsLoaded.current = false; // Reset flag to allow refresh
    return loadCampaigns();
  }, [loadCampaigns]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    hasCampaignsLoaded.current = false; // Reset flags to allow refresh
    hasDeletedLoaded.current = false;
    await Promise.all([
      loadCampaigns(),
      loadDeletedCampaigns()
    ]);
  }, [loadCampaigns, loadDeletedCampaigns]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
    setDeleteError(null);
    setDeletedError(null);
  }, []);

  // Custom setIsTrashView that loads deleted campaigns only when needed
  const setIsTrashViewCustom = useCallback((isTrash: boolean) => {
    console.log('🔄 useCampaigns: Switching to trash view:', isTrash);
    setIsTrashView(isTrash);
    
    // Only load deleted campaigns when switching TO trash view and not already loaded
    if (isTrash && !hasDeletedLoaded.current && !deletedLoadingRef.current) {
      console.log('🚀 useCampaigns: Loading deleted campaigns for trash view');
      loadDeletedCampaigns();
    }
  }, [loadDeletedCampaigns]);

  // Auto-load campaigns on mount (only once)
  useEffect(() => {
    if (autoLoad && !hasCampaignsLoaded.current && !campaignsLoadingRef.current) {
      console.log('🚀 useCampaigns: Auto-loading campaigns on mount');
      loadCampaigns();
      
      // Only load deleted campaigns if specifically requested on mount
      if (includeDeleted && !hasDeletedLoaded.current && !deletedLoadingRef.current) {
        console.log('🚀 useCampaigns: Auto-loading deleted campaigns on mount');
        loadDeletedCampaigns();
      }
    }
  }, []); // Empty dependency array - only run once on mount

  // Reset loading flags when company changes
  useEffect(() => {
    hasCampaignsLoaded.current = false;
    hasDeletedLoaded.current = false;
  }, [providedCompanyId]);

  return {
    // Data
    campaigns,
    deletedCampaigns,
    filteredCampaigns,
    
    // Loading states
    isLoading,
    isDeleting,
    isLoadingDeleted,
    
    // Error states
    error,
    deleteError,
    deletedError,
    
    // Search and filter
    searchQuery,
    setSearchQuery,
    
    // View management
    isTrashView,
    setIsTrashView: setIsTrashViewCustom, // Use custom function
    
    // Actions
    loadCampaigns,
    loadDeletedCampaigns,
    deleteCampaign: deleteCampaignLegacy, // For backward compatibility
    handleCampaignAction,
    refreshCampaigns,
    refreshAll,
    clearError,
    
    // Computed values
    isEmpty,
    hasSearchResults,
    deletedCount,
    activeCount,
  };
}