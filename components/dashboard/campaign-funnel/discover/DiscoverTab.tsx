// src/components/dashboard/campaign-funnel/discover/DiscoverTab.tsx
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import EmptyState from './EmptyState';
import BrandInfoForm from './BrandInfoForm';
import { Campaign } from '@/types/campaign';
import DiscoveredInfluencers from '@/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredInfluencers';
import ShortlistedInfluencers from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencers';
import { DiscoverInfluencer } from '@/lib/types';
import { DiscoveredCreatorsResults } from '@/types/insights-iq';
import {
  getCampaignListMembers,
  CampaignListMember,
  CampaignListMembersResponse,
} from '@/services/campaign/campaign-list.service';
import {
  InfluencerSearchFilter,
  AudienceLocationsFilter,
} from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';
import { formatNumber } from '@/utils/format';
import { useDiscoverTabState } from '@/store/campaign-tabs-store';
import { debounce } from 'lodash';
import { processAISearchResults } from '@/utils/influencer-mapper';
import { InfluencerSearchResults } from '@/types/ai';

interface DiscoverTabProps {
  campaignData?: Campaign | null;
  isNewCampaign?: boolean;
  onCampaignCreated?: (campaign: Campaign) => void;
  aiDiscoveredInfluencers?: AIDiscoveredInfluencers | null;
}

// Type for AI-discovered influencers passed from CampaignFunnelSection
export interface AIDiscoveredInfluencers {
  searchResults: InfluencerSearchResults;
  filtersUsed?: Record<string, any>;
  appliedFilters?: Record<string, any>;
  totalCount: number;
  timestamp: number;
}

// Define default parameters that will be applied in the background
const DEFAULT_BACKGROUND_PARAMS = {
  audience_age: { min: 18, max: 35, percentage_value: 1 },
  audience_gender: {
    type: 'MALE' as const,
    operator: 'GT' as const,
    percentage_value: 1,
  },
  creator_age: { min: 18, max: 35 },
  instagram_options: {
    reel_views: { min: 100, max: 10000000 },
  },
  engagement_rate: { percentage_value: '0.01' },
  total_engagements: { min: 100, max: 10000000 },
};

const DiscoverTab: React.FC<DiscoverTabProps> = ({
  campaignData = null,
  isNewCampaign = false,
  onCampaignCreated,
  aiDiscoveredInfluencers,
}) => {
  // Get campaign ID for state management
  const campaignId = useMemo(
    () => campaignData?.id || 'global',
    [campaignData?.id],
  );

  // Use Zustand store for state persistence
  const { state: savedState, setState: saveState } =
    useDiscoverTabState(campaignId);

  // Track if we've restored state
  const hasRestoredState = useRef(false);
  const isInitialMount = useRef(true);

  // NEW: Track load count for custom pagination pattern
  const loadCount = useRef(0);

  // Track previous AI results timestamp to detect changes
  const prevAITimestamp = useRef<number | null>(null);

  // Handle AI-discovered influencers from chat
  useEffect(() => {

    if (!aiDiscoveredInfluencers) return;
    
    // Check if this is a new result (different timestamp)
    if (prevAITimestamp.current === aiDiscoveredInfluencers.timestamp) {
      return; // Same results, skip
    }
    
    prevAITimestamp.current = aiDiscoveredInfluencers.timestamp;
    
    const { searchResults, appliedFilters, totalCount } = aiDiscoveredInfluencers;
    
    if (!searchResults?.influencers || searchResults.influencers.length === 0) {
      console.log('🤖 AI results empty, skipping update');
      return;
    }
    
    console.log('🤖 DiscoverTab: Processing AI discovered influencers');
    console.log('🤖 Influencers count:', searchResults.influencers.length);
    // Use shared mapper - same mapping as manual filters route
    const { 
      discoverInfluencers, 
      discoveredCreatorsResults, 
      totalResults: mappedTotalResults 
    } = processAISearchResults(searchResults);
    
    console.log('Returned AI Data 04 Processed AI Data:', {
      discoverInfluencers,
      discoveredCreatorsResults,
      mappedTotalResults
    });

    // Update state - same format as manual filters
    setInfluencers(discoverInfluencers);
    setDiscoveredCreatorsResults(discoveredCreatorsResults);
    setTotalResults(mappedTotalResults);
    // Update search params if AI provided applied filters
    if (aiDiscoveredInfluencers.appliedFilters) {
      setSearchParams(aiDiscoveredInfluencers.appliedFilters); // ← Replace entirely
    }
    // Reset load count since this is a fresh AI search
    loadCount.current = 1;
    
    // Switch to discovered tab to show results
    setActiveFilter('discovered');
    
    console.log('✅ DiscoverTab: AI results applied successfully');
  }, [aiDiscoveredInfluencers]);

  // Prepare age group from campaign data
  const defaultFilters = campaignData?.default_filters;
  const creatorInterests = campaignData?.category?.name || '';
  const ageGroup = campaignData?.audience_age_group || '';
  const [left, right] = ageGroup.split('-');

  // Initialize search params with campaign defaults or saved state
  const getInitialSearchParams = (): InfluencerSearchFilter => {
    // If we have saved state with searchParams, use it
    if (savedState?.searchParams && hasRestoredState.current) {
      return savedState.searchParams;
    }

    const baseParams: Partial<InfluencerSearchFilter> = {
      work_platform_id: '9bb8913b-ddd9-430b-a66a-d74d846e6c66',
      sort_by: { field: 'FOLLOWER_COUNT', order: 'DESCENDING' },
      limit: 5, // CHANGED: Start with 5 instead of 10
      offset: 0,
      post_type: 'ALL',
    };

    // Only add campaign-specific defaults if defaultFilters is true
    if (defaultFilters) {
      if (left && right && !isNaN(parseInt(left)) && !isNaN(parseInt(right))) {
        baseParams.creator_age = {
          min: parseInt(left.trim()),
          max: parseInt(right.trim()),
        };
      }
      if (creatorInterests) {
        baseParams.creator_interests = [creatorInterests];
      }
    }
    return baseParams as InfluencerSearchFilter;
  };

  // State initialization with persistence support
  const [activeFilter, setActiveFilter] = useState<
    'discovered' | 'shortlisted'
  >(savedState?.activeFilter || 'discovered');
  const [showBrandForm, setShowBrandForm] = useState(
    isNewCampaign && !savedState,
  );

  // States for discovered influencers
  const [influencers, setInfluencers] = useState<DiscoverInfluencer[]>(
    savedState?.influencers || [],
  );
  const [discoveredCreatorsResults, setDiscoveredCreatorsResults] =
    useState<DiscoveredCreatorsResults | null>(
      savedState?.discoveredCreatorsResults || null,
    );
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(
    savedState?.totalResults || 0,
  );

  // States for shortlisted influencers
  const [shortlistedMembers, setShortlistedMembers] =
    useState<CampaignListMembersResponse | null>(null);
  const [isLoadingShortlisted, setIsLoadingShortlisted] = useState(false);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(savedState?.currentPage || 1);
  const [pageSize, setPageSize] = useState(savedState?.pageSize || 25);
  const [shortlistedSearchText, setShortlistedSearchText] = useState('');

  // ✅ ADD: State for status filter
  const [influencerFilter, setInfluencerFilter] = useState<
    'all' | 'active' | 'deleted'
  >('active');

  // Platform states
  const [platforms, setPlatforms] = useState<Platform[]>(
    savedState?.platforms || [],
  );
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    savedState?.selectedPlatform || null,
  );

  // Search parameters state - only contains user-visible filters
  const [searchParams, setSearchParams] = useState<InfluencerSearchFilter>(
    getInitialSearchParams(),
  );

  // Helper function to check if audience_location should be auto-applied
  const shouldAutoApplyAudienceLocation = (
    filters: Partial<InfluencerSearchFilter>,
  ): boolean => {
    // Check if creator_locations exist and audience_locations don't exist or are empty
    const hasCreatorLocations = Boolean(
      filters.creator_locations && filters.creator_locations.length > 0,
    );
    const hasAudienceLocations = Boolean(
      filters.audience_locations && filters.audience_locations.length > 0,
    );

    return hasCreatorLocations && !hasAudienceLocations;
  };

  // Helper function to create audience locations from creator locations at 1%
  const createAutoAudienceLocations = (
    creatorLocationIds: string[],
  ): AudienceLocationsFilter[] => {
    return creatorLocationIds.map((locationId) => ({
      location_id: locationId,
      percentage_value: 1, // Set to 1% as requested
    }));
  };

  // Create debounced save function
  const debouncedSave = useMemo(
    () =>
      debounce((stateToSave: any) => {
        saveState(stateToSave);
        console.log(`State saved for campaign: ${campaignId}`);
      }, 500),
    [campaignId, saveState],
  );

  // Save state whenever it changes
  useEffect(() => {
    // Don't save on initial mount
    if (isInitialMount.current) {
      return;
    }

    // Save current state
    debouncedSave({
      activeFilter,
      influencers,
      discoveredCreatorsResults,
      totalResults,
      searchParams,
      selectedPlatform,
      currentPage,
      pageSize,
      platforms,
    });
  }, [
    activeFilter,
    influencers,
    discoveredCreatorsResults,
    totalResults,
    searchParams,
    selectedPlatform,
    currentPage,
    pageSize,
    platforms,
    debouncedSave,
  ]);

  // Restore state on mount
  useEffect(() => {
    if (savedState && !hasRestoredState.current && isInitialMount.current) {
      console.log(`Restoring state for campaign: ${campaignId}`, savedState);

      // Restore all saved state
      if (savedState.activeFilter) setActiveFilter(savedState.activeFilter);
      if (savedState.influencers) setInfluencers(savedState.influencers);
      if (savedState.discoveredCreatorsResults)
        setDiscoveredCreatorsResults(savedState.discoveredCreatorsResults);
      if (savedState.totalResults !== undefined)
        setTotalResults(savedState.totalResults);
      if (savedState.searchParams) setSearchParams(savedState.searchParams);
      if (savedState.selectedPlatform)
        setSelectedPlatform(savedState.selectedPlatform);
      if (savedState.currentPage !== undefined)
        setCurrentPage(savedState.currentPage);
      if (savedState.pageSize !== undefined) setPageSize(savedState.pageSize);
      if (savedState.platforms) setPlatforms(savedState.platforms);

      hasRestoredState.current = true;
    }

    // Mark that initial mount is complete
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [savedState, campaignId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // FIXED: Helper function to merge default parameters with user parameters
  // This function now checks the platform before applying instagram_options
  const mergeWithDefaults = (
    params: InfluencerSearchFilter,
  ): InfluencerSearchFilter => {
    const mergedParams = { ...params };

    // Apply default audience_age if not set by user
    if (!mergedParams.audience_age) {
      mergedParams.audience_age = DEFAULT_BACKGROUND_PARAMS.audience_age;
    }

    // Apply default audience_gender if not set by user
    if (!mergedParams.audience_gender) {
      mergedParams.audience_gender = DEFAULT_BACKGROUND_PARAMS.audience_gender;
    }

    // Apply default creator_age if not set by user
    if (!mergedParams.creator_age) {
      mergedParams.creator_age = DEFAULT_BACKGROUND_PARAMS.creator_age;
    }

    // ✅ FIX: Only apply Instagram options if the platform is Instagram
    // Check if the current platform is Instagram by comparing with selectedPlatform
    const isInstagramPlatform = selectedPlatform?.name
      ?.toLowerCase()
      .includes('instagram');

    if (isInstagramPlatform) {
      // Apply default Instagram options if not set by user
      if (!mergedParams.instagram_options) {
        mergedParams.instagram_options = {
          ...DEFAULT_BACKGROUND_PARAMS.instagram_options,
        };
      } else {
        // If instagram_options exists but reel_views doesn't, add it
        if (!mergedParams.instagram_options.reel_views) {
          mergedParams.instagram_options = {
            ...mergedParams.instagram_options,
            reel_views: DEFAULT_BACKGROUND_PARAMS.instagram_options.reel_views,
          };
        }
      }
    } else {
      // ✅ FIX: Remove instagram_options for non-Instagram platforms
      // This ensures TikTok and other platforms don't send Instagram-only filters
      delete mergedParams.instagram_options;
    }

    // Apply default engagement_rate if not set by user
    if (!mergedParams.engagement_rate) {
      mergedParams.engagement_rate = DEFAULT_BACKGROUND_PARAMS.engagement_rate;
    }

    // Apply default total_engagements if not set by user
    if (!mergedParams.total_engagements) {
      mergedParams.total_engagements =
        DEFAULT_BACKGROUND_PARAMS.total_engagements;
    }

    return mergedParams;
  };

  // UPDATED: Function to get the correct load size based on the pattern
  const getLoadSize = () => {
    // Pattern: 5, 5, 5, then 10 onwards
    if (loadCount.current < 3) {
      return 5; // First three loads are 5 each
    }
    return 10; // All subsequent loads are 10
  };

  // Function to fetch platforms from API
  const fetchPlatforms = useCallback(async () => {
    setIsLoadingPlatforms(true);
    try {
      const response = await fetch('/api/v0/platforms?status=ACTIVE', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch platforms: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setPlatforms(result.data);

        // Set default platform (Instagram) if available and no platform is selected
        if (!selectedPlatform && result.data.length > 0) {
          const instagramPlatform = result.data.find((p: Platform) =>
            p.name.toLowerCase().includes('instagram'),
          );

          if (instagramPlatform) {
            setSelectedPlatform(instagramPlatform);

            // Update search params with the default platform
            setSearchParams((prev) => ({
              ...prev,
              work_platform_id: instagramPlatform.work_platform_id,
            }));
          }
        }
      } else {
        console.error('Invalid API response:', result);
        setPlatforms([]);
      }
    } catch (error) {
      console.error('Error fetching platforms:', error);
      setPlatforms([]);
    } finally {
      setIsLoadingPlatforms(false);
    }
  }, [selectedPlatform]);

  // Function to handle platform change
  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatform(platform);

    // Update search params with new platform work_platform_id
    setSearchParams((prev) => ({
      ...prev,
      work_platform_id: platform.work_platform_id,
    }));

    // Only trigger new search if we're on the discovered tab and have filters applied
    if (activeFilter === 'discovered' && defaultFilters) {
      const updatedParams = {
        ...searchParams,
        work_platform_id: platform.work_platform_id,
        offset: 0, // Reset to first page when changing platform
      };
      // Reset load count and merge with defaults before fetching
      loadCount.current = 0;
      const paramsWithDefaults = mergeWithDefaults(updatedParams);
      fetchInfluencers(paramsWithDefaults, true);
    }
  };

  // Function to fetch campaign list members with status filter support
  const fetchCampaignListMembers = async (
    page: number = 1,
    size: number = 10,
    statusFilter: 'all' | 'active' | 'deleted' = 'active', // ✅ ADD THIS parameter
  ) => {
    if (
      !campaignData?.campaign_lists ||
      campaignData.campaign_lists.length === 0
    ) {
      return;
    }

    const listId = campaignData.campaign_lists[0].id;

    setIsLoadingShortlisted(true);
    try {
      // ✅ Pass status filter to the API call
      const response = await getCampaignListMembers(
        listId,
        page,
        size,
        shortlistedSearchText,
        statusFilter, // ✅ ADD THIS LINE
      );
      console.log('📊 Frontend: API Response:', response); // ✅ ADD THIS
      console.log(
        '📊 Frontend: Influencers count:',
        response.influencers?.length,
      ); // ✅ ADD THIS
      console.log('📊 Frontend: Pagination:', response.pagination); // ✅ ADD THIS

      if (response.success) {
        setShortlistedMembers(response);
        setShortlistedCount(response.pagination?.total_items || 0);
        setCurrentPage(page);
      } else {
        console.error(
          'Failed to fetch campaign list members:',
          response.message,
        );
        setShortlistedMembers(null);
        setShortlistedCount(0);
      }
    } catch (error) {
      console.error('Error fetching campaign list members:', error);
      setShortlistedMembers(null);
      setShortlistedCount(0);
    } finally {
      setIsLoadingShortlisted(false);
    }
  };

  // ✅ ADD: New callback to handle filter changes from child component
  const handleStatusFilterChange = (
    newFilter: 'all' | 'active' | 'deleted',
  ) => {
    setInfluencerFilter(newFilter);
    setCurrentPage(1); // Reset to page 1 when filter changes
    fetchCampaignListMembers(1, pageSize, newFilter); // Fetch with new filter
  };

  // Function to fetch discovered influencers - now receives params with defaults already merged
  const fetchInfluencers = async (
    params: InfluencerSearchFilter,
    resetResults: boolean = true,
  ) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/v0/discover/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(params), // params already include defaults
      });

      const result = await response.json();

      if (result.success && result.data) {
        let updatedInfluencers;

        if (resetResults) {
          // Reset for new search/filter
          updatedInfluencers = result.data.influencers || [];
          setInfluencers(updatedInfluencers);
          // UPDATED: Reset load count when resetting results
          loadCount.current = 1; // First load is complete
        } else {
          // Append for load more - combine previous and new results
          updatedInfluencers = [
            ...influencers,
            ...(result.data.influencers || []),
          ];
          setInfluencers(updatedInfluencers);
          // UPDATED: Increment load count for load more
          loadCount.current += 1;
        }

        setTotalResults(
          result.metadata?.total_results || result.data.total_count || 0,
        );

        // IMPORTANT: Update discoveredCreatorsResults with ALL influencers (not just new ones)
        const discoveredResults: DiscoveredCreatorsResults = {
          influencers: updatedInfluencers, // Use the combined array
          metadata: {
            offset: result.metadata?.offset || 0,
            limit: result.metadata?.limit || params.limit || 5,
            total_results:
              result.metadata?.total_results || result.data.total_count || 0,
          },
        };

        setDiscoveredCreatorsResults(discoveredResults);
      } else {
        console.error('Failed to fetch influencers:', result.error);
        if (resetResults) {
          setInfluencers([]);
          setTotalResults(0);
          setDiscoveredCreatorsResults(null);
          loadCount.current = 0; // Reset load count on error
        }
      }
    } catch (error) {
      console.error('Error fetching influencers:', error);
      if (resetResults) {
        setInfluencers([]);
        setTotalResults(0);
        setDiscoveredCreatorsResults(null);
        loadCount.current = 0; // Reset load count on error
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle search text changes
  const handleSearchTextChange = (text: string) => {
    let updatedParams;
    if (text.length > 0) {
      updatedParams = {
        ...searchParams,
        bio_phrase: text,
        offset: 0, // Reset to beginning
        limit: 5, // CHANGED: Reset to initial load size of 5
      };
    } else {
      updatedParams = {
        ...searchParams,
        bio_phrase: undefined,
        offset: 0,
        limit: 5, // CHANGED: Reset to 5
      };
    }

    setSearchParams(updatedParams);
    // Reset load count and merge with defaults before fetching
    loadCount.current = 0;
    const paramsWithDefaults = mergeWithDefaults(updatedParams);
    fetchInfluencers(paramsWithDefaults, true); // Reset results
  };

  // UPDATED: Calculate remaining results and next batch size for UI
  const getRemainingResults = () => totalResults - influencers.length;
  const getNextBatchSize = () => {
    const remaining = getRemainingResults();
    const nextSize = getLoadSize();
    return Math.min(nextSize, remaining);
  };

  // UPDATED: Load more influencers with custom pattern
  const loadMore = async () => {
    const currentOffset = influencers.length; // Use current array length as offset
    const loadSize = getNextBatchSize(); // Use the custom load size

    const loadMoreParams = {
      ...searchParams,
      offset: currentOffset,
      limit: loadSize,
    };

    // Merge with defaults before fetching
    const paramsWithDefaults = mergeWithDefaults(loadMoreParams);
    // Call fetchInfluencers with resetResults = false to append results
    await fetchInfluencers(paramsWithDefaults, false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedParams: InfluencerSearchFilter = {
      work_platform_id:
        selectedPlatform?.work_platform_id ||
        '9bb8913b-ddd9-430b-a66a-d74d846e6c66',
      sort_by: { field: 'FOLLOWER_COUNT', order: 'DESCENDING' },
      limit: 5, // CHANGED: Reset to 5
      offset: 0,
      post_type: 'ALL',
    };

    setSearchParams(clearedParams);

    // Clear the results and reset load count
    setInfluencers([]);
    setTotalResults(0);
    setDiscoveredCreatorsResults(null);
    loadCount.current = 0; // Reset load count
  };

  // Function to handle page changes from child component
  const handlePageChange = (page: number) => {
    fetchCampaignListMembers(page, pageSize, influencerFilter);
  };

  // Function to handle page size changes from child component
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to page 1 when changing page size
    fetchCampaignListMembers(1, newPageSize, influencerFilter);
  };

  // Function to refresh shortlisted influencers (called after adding/removing)
  const refreshShortlistedInfluencers = () => {
    // Refresh the current page to maintain pagination state
    fetchCampaignListMembers(currentPage, pageSize, influencerFilter);
  };

  // Function to handle starting the discovery process
  const handleStartDiscovery = () => {
    setShowBrandForm(true);
  };

  // Function to handle form completion
  const handleFormComplete = (formData: Campaign) => {
    // For new campaigns, call the parent handler with the complete campaign object
    // that includes the ID from the API response
    if (isNewCampaign && onCampaignCreated) {
      // This will now have the campaign ID from the API response
      onCampaignCreated(formData);
    } else {
      // For existing campaigns, hide the form and show influencers
      setShowBrandForm(false);
    }
  };

  // UPDATED: Handler for filter changes - only updates state, doesn't trigger API call
  const handleFilterChange = (
    filterUpdates: Partial<InfluencerSearchFilter>,
  ) => {
    setSearchParams((prev) => {
      const updatedFilters = {
        ...prev,
        ...filterUpdates,
        offset: 0, // Reset to first page when filters change
      };

      // NEW CONDITION: Auto-apply audience_location if creator_location is applied but audience_location is not
      if (shouldAutoApplyAudienceLocation(updatedFilters)) {
        console.log(
          'Auto-applying audience_location based on creator_location',
        );
        updatedFilters.audience_locations = createAutoAudienceLocations(
          updatedFilters.creator_locations!,
        );
      }

      return updatedFilters;
    });
  };

  // UPDATED: Handler for applying filters - this triggers the API call with initial load size of 5
  const handleApplyFilters = (
    appliedFilters: Partial<InfluencerSearchFilter>,
  ) => {
    // NEW CONDITION: Auto-apply audience_location if creator_location is applied but audience_location is not
    let processedFilters = { ...appliedFilters };

    if (shouldAutoApplyAudienceLocation(processedFilters)) {
      console.log(
        'Auto-applying audience_location based on creator_location in apply filters',
      );
      processedFilters.audience_locations = createAutoAudienceLocations(
        processedFilters.creator_locations!,
      );
    }

    const updatedParams = {
      ...searchParams,
      ...processedFilters,
      offset: 0, // Reset to beginning
      limit: 5, // CHANGED: Reset to initial load size of 5
    };

    setSearchParams(updatedParams);
    // Reset load count and merge with defaults before fetching
    loadCount.current = 0;
    const paramsWithDefaults = mergeWithDefaults(updatedParams);
    fetchInfluencers(paramsWithDefaults, true); // Reset results
  };

  // Handler for sort changes
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    // Map the field and direction to the new sort format
    const sortField = field.toUpperCase() as any; // Convert to uppercase for API

    // Explicitly cast to SortOrder type
    type SortOrder = 'ASCENDING' | 'DESCENDING';
    const sortOrder: SortOrder =
      direction === 'asc' ? 'ASCENDING' : 'DESCENDING';

    const updatedParams = {
      ...searchParams,
      sort_by: { field: sortField, order: sortOrder },
      offset: 0, // Reset to first page when sorting
      limit: 5, // CHANGED: Reset to 5
    };

    setSearchParams(updatedParams);

    // Trigger API call with new sort
    if (activeFilter === 'discovered') {
      // Reset load count and merge with defaults before fetching
      loadCount.current = 0;
      const paramsWithDefaults = mergeWithDefaults(updatedParams);
      fetchInfluencers(paramsWithDefaults, true);
    }
  };

  // Load platforms when component mounts
  useEffect(() => {
    // Only fetch platforms if we don't have them from saved state
    if (platforms.length === 0 && !savedState?.platforms) {
      fetchPlatforms();
    }
  }, []);

  // Fetch campaign list members when campaign data is available
  useEffect(() => {
    if (
      campaignData?.campaign_lists &&
      campaignData.campaign_lists.length > 0 &&
      !isNewCampaign
    ) {
      // Only fetch if we don't have saved state or if it's the first load
      fetchCampaignListMembers(currentPage, pageSize, influencerFilter);
    }
  }, [campaignData?.campaign_lists, isNewCampaign]);

  // Refetch shortlisted influencers when search text changes
  useEffect(() => {
    if (activeFilter === 'shortlisted' && campaignData?.campaign_lists) {
      // Debounce the search to avoid too many API calls
      const timeoutId = setTimeout(() => {
        setCurrentPage(1); // Reset to page 1 when searching
        fetchCampaignListMembers(1, pageSize, influencerFilter);
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [
    shortlistedSearchText,
    activeFilter,
    campaignData?.campaign_lists,
    pageSize,
  ]);

  // If the brand form is being shown, display it
  if (showBrandForm) {
    return (
      <div className="py-8">
        <BrandInfoForm onComplete={handleFormComplete} />
      </div>
    );
  }

  // If no influencers are discovered yet, show the empty state
  if (!campaignData && isNewCampaign) {
    return <EmptyState onStartDiscovery={handleStartDiscovery} />;
  }

  console.log('Returned AI Data 05:::', influencers)
  console.log('Returned AI Data 06:::', discoveredCreatorsResults)
  console.log('Returned AI Data 07:::', totalResults)
  console.log('Returned AI Data 08:::', searchParams)
  // Show influencer results
  return (
    <div>
      {/* Heading and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-700">
            Influencer Results
          </h2>
          {selectedPlatform && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              <div className="flex items-center space-x-1.5">
                <img
                  src={selectedPlatform.logo_url}
                  alt={selectedPlatform.name}
                  className="w-5 h-5 object-contain rounded-sm"
                  onError={(e) => {
                    // Fallback to a generic icon if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iMiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K';
                  }}
                />
                <span className="font-medium text-gray-700">
                  {selectedPlatform.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation - Matching Main Tabs Style */}
        <div className="flex mt-3 md:mt-0 gap-2">
          <button
            className={`px-5 py-2 text-sm rounded-full transition-all duration-200 border ${
              activeFilter === 'discovered'
                ? 'font-bold bg-[#E8DFF5] text-[#6B4C9A] border-[#A590D1]'
                : 'font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm transform hover:scale-[1.01]'
            }`}
            onClick={() => setActiveFilter('discovered')}
          >
            Discovered ({formatNumber(totalResults) || 0})
          </button>
          <button
            className={`px-5 py-2 text-sm rounded-full transition-all duration-200 border ${
              activeFilter === 'shortlisted'
                ? 'font-bold bg-[#E8DFF5] text-[#6B4C9A] border-[#A590D1]'
                : 'font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm transform hover:scale-[1.01]'
            }`}
            onClick={() => setActiveFilter('shortlisted')}
          >
            Shortlisted ({formatNumber(shortlistedCount)})
          </button>
        </div>
      </div>

      {/* Conditional rendering based on active tab */}
      {activeFilter === 'discovered' ? (
        <DiscoveredInfluencers
          campaignData={campaignData}
          influencers={influencers}
          discoveredCreatorsResults={discoveredCreatorsResults}
          isLoading={isLoading}
          totalResults={totalResults}
          searchParams={searchParams}
          onSearchTextChange={handleSearchTextChange}
          onFilterChange={handleFilterChange}
          onApplyFilters={handleApplyFilters}
          onSortChange={handleSortChange}
          onLoadMore={loadMore}
          onClearFilters={handleClearFilters}
          hasMore={influencers?.length < totalResults}
          nextBatchSize={getNextBatchSize()}
          remainingResults={getRemainingResults()}
          onInfluencerAdded={refreshShortlistedInfluencers}
          shortlistedMembers={shortlistedMembers?.influencers || []}
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={handlePlatformChange}
          isLoadingPlatforms={isLoadingPlatforms}
        />
      ) : (
        <ShortlistedInfluencers
          campaignData={campaignData}
          isLoading={isLoadingShortlisted}
          onInfluencerRemoved={refreshShortlistedInfluencers}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          shortlistedMembers={shortlistedMembers as CampaignListMembersResponse}
          selectedPlatform={selectedPlatform}
          onInfluencerAdded={refreshShortlistedInfluencers}
          searchText={shortlistedSearchText}
          onSearchChange={setShortlistedSearchText}
          onFilterChange={handleStatusFilterChange} // ✅ ADD THIS LINE
        />
      )}
    </div>
  );
};

export default DiscoverTab;
