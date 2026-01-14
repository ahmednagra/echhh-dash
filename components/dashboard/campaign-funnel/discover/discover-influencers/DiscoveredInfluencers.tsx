// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoveredInfluencers.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, Check, Users, ExternalLink } from 'react-feather';
import DiscoverFilters from './DiscoverFilters';
import DiscoveredResults from './DiscoveredResults';
import { DiscoverInfluencer } from '@/lib/types';
import { Campaign } from '@/types/campaign';
import {
  CampaignListMember,
  addInfluencerToList,
} from '@/services/campaign/campaign-list.service';
import { DiscoveredCreatorsResults, Influencer } from '@/types/insights-iq';
import {
  InfluencerSearchFilter,
  SpecificContactDetail,
  AudienceInterestAffinity,
} from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';
import { FilterContext } from '@/utils/filter-utils';
import { CreatorLocationSelection } from '@/lib/types';
import { getCreatorProfile } from '@/services/ensembledata/creator-profile';
import { Influencer as InsightsIQInfluencer } from '@/types/insights-iq';
import { addInfluencerToCampaign } from '@/services/campaign-influencers/campaign-influencers.client';
import { AddToCampaignRequest } from '@/types/campaign-influencers';
import { toast } from 'react-hot-toast';

interface DiscoveredInfluencersProps {
  campaignData?: Campaign | null;
  influencers: DiscoverInfluencer[];
  discoveredCreatorsResults: DiscoveredCreatorsResults | null;
  isLoading: boolean;
  totalResults: number;
  searchParams: InfluencerSearchFilter;
  onSearchTextChange: (text: string) => void;
  onFilterChange: (filterUpdates: Partial<InfluencerSearchFilter>) => void;
  onApplyFilters: (appliedFilters: Partial<InfluencerSearchFilter>) => void;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onLoadMore: () => void;
  onClearFilters: () => void;
  hasMore: boolean;
  nextBatchSize: number;
  remainingResults: number;
  onInfluencerAdded?: () => void;
  shortlistedMembers: CampaignListMember[];
  platforms?: Platform[];
  selectedPlatform?: Platform | null;
  onPlatformChange?: (platform: Platform) => void;
  isLoadingPlatforms?: boolean;
}

interface UserhandleResult {
  user_id: string;
  username: string;
  fullname: string;
  picture: string;
  followers: string;
  is_verified: boolean;
}

interface ApiResponse {
  success: boolean;
  data: UserhandleResult[];
  total: number;
  query: string;
  error?: string;
}

const DiscoveredInfluencers: React.FC<DiscoveredInfluencersProps> = ({
  campaignData = null,
  influencers,
  discoveredCreatorsResults,
  isLoading,
  totalResults,
  searchParams,
  onSearchTextChange,
  onFilterChange,
  onApplyFilters,
  onSortChange,
  onLoadMore,
  onClearFilters,
  hasMore,
  nextBatchSize,
  remainingResults,
  onInfluencerAdded,
  shortlistedMembers,
  platforms = [],
  selectedPlatform = null,
  onPlatformChange,
  isLoadingPlatforms = false,
}) => {
  const [showFilters, setShowFilters] = useState(true); // ✅ Changed to true
  const [searchText, setSearchText] = useState('');

  // Search dropdown states
  const [searchResults, setSearchResults] = useState<UserhandleResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<UserhandleResult | null>(null);

  // State for managing add to list operations
  const [addedInfluencers, setAddedInfluencers] = useState<
    Record<string, boolean>
  >({});
  const [isAdding, setIsAdding] = useState<Record<string, boolean>>({});

  // Filter Context State for displaying names instead of counts
  const [selectedCreatorLocations, setSelectedCreatorLocations] = useState<
    CreatorLocationSelection[]
  >([]);
  const [allFetchedLocations, setAllFetchedLocations] = useState<any[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<{
    creatorLanguage?: { code: string; name: string };
    audienceLanguages?: { code: string; name: string }[];
  }>({});
  const [selectedInterests, setSelectedInterests] = useState<{
    creator?: string[];
    audience?: { value: string; percentage_value: number }[];
  }>({});
  const [selectedHashtags, setSelectedHashtags] = useState<{ name: string }[]>(
    [],
  );
  const [selectedMentions, setSelectedMentions] = useState<{ name: string }[]>(
    [],
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<
    SpecificContactDetail[]
  >([]);

  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Helper functions for filter context
  const getLocationNameById = (id: string): string => {
    const location =
      allFetchedLocations.find((loc) => loc.id === id) ||
      selectedCreatorLocations.find((loc) => loc.id === id);
    return location?.display_name || location?.name || `Location ${id}`;
  };

  const getLanguageNameByCode = (code: string): string => {
    if (selectedLanguages.creatorLanguage?.code === code) {
      return selectedLanguages.creatorLanguage.name;
    }

    const audienceLang = selectedLanguages.audienceLanguages?.find(
      (lang) => lang.code === code,
    );
    if (audienceLang) {
      return audienceLang.name;
    }

    return code.toUpperCase();
  };

  // Handler to update filter context from child components
  const handleFilterContextUpdate = useCallback(
    (updates: Partial<FilterContext>) => {
      if (updates.selectedCreatorLocations) {
        setSelectedCreatorLocations(updates.selectedCreatorLocations);
      }
      if (updates.allFetchedLocations) {
        setAllFetchedLocations(updates.allFetchedLocations);
      }
      if (updates.selectedLanguages) {
        setSelectedLanguages((prev) => ({
          ...prev,
          ...updates.selectedLanguages,
        }));
      }
      if (updates.selectedInterests) {
        setSelectedInterests((prev) => ({
          ...prev,
          ...updates.selectedInterests,
        }));
      }
      if (updates.selectedHashtags) {
        setSelectedHashtags(updates.selectedHashtags);
      }
      if (updates.selectedMentions) {
        setSelectedMentions(updates.selectedMentions);
      }
      if (updates.selectedTopics) {
        setSelectedTopics(updates.selectedTopics);
      }
      if (updates.selectedBrands) {
        setSelectedBrands(updates.selectedBrands);
      }
      if (updates.selectedContacts) {
        setSelectedContacts(updates.selectedContacts);
      }
    },
    [],
  );

  // Create filter context for displaying names
  const filterContext: FilterContext = useMemo(
    () => ({
      selectedCreatorLocations,
      allFetchedLocations,
      getLocationNameById,
      selectedLanguages,
      getLanguageNameByCode,
      selectedInterests,
      selectedHashtags,
      selectedMentions,
      selectedTopics,
      selectedBrands,
      selectedContacts,
      onUpdateContext: handleFilterContextUpdate,
    }),
    [
      selectedCreatorLocations,
      allFetchedLocations,
      selectedLanguages,
      selectedInterests,
      selectedHashtags,
      selectedMentions,
      selectedTopics,
      selectedBrands,
      selectedContacts,
      handleFilterContextUpdate,
    ],
  );

  // Enhanced clear filters handler to only reset without triggering API
  const handleClearFilters = () => {
    console.log('Clearing all filters...');

    // Clear filter context state
    setSelectedCreatorLocations([]);
    setAllFetchedLocations([]);
    setSelectedLanguages({});
    setSelectedInterests({});
    setSelectedHashtags([]);
    setSelectedMentions([]);
    setSelectedTopics([]);
    setSelectedBrands([]);
    setSelectedContacts([]);

    // Clear search text
    setSearchText('');
    setSelectedInfluencer(null);
    setSearchResults([]);
    setShowSearchDropdown(false);
    setSearchError(null);

    // Reset add to list states
    setAddedInfluencers({});
    setIsAdding({});

    // IMPORTANT: Call the parent's clear function to reset searchParams
    onClearFilters();

    console.log('All filters cleared');
  };

  // Search userhandles function
  const searchUserhandles = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      if (!selectedPlatform?.work_platform_id) {
        console.error('No platform selected for search');
        setSearchError('Please select a platform first');
        return;
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        const cleanQuery = query.replace(/^@/, '');
        const url = `/api/v0/discover/userhandles?q=${encodeURIComponent(cleanQuery)}&type=search&limit=12&work_platform_id=${selectedPlatform.work_platform_id}`;

        console.log('Searching influencers:', url);

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to search influencers');
        }

        console.log(
          `Found ${data.data.length} influencers for platform: ${selectedPlatform.name}`,
        );

        setSearchResults(data.data || []);
        setShowSearchDropdown(data.data.length > 0);
      } catch (error) {
        console.error('Error searching influencers:', error);
        setSearchError(
          error instanceof Error
            ? error.message
            : 'Failed to search influencers',
        );
        setSearchResults([]);
        setShowSearchDropdown(false);
      } finally {
        setIsSearching(false);
      }
    },
    [selectedPlatform],
  );

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchText.trim()) {
        searchUserhandles(searchText);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchText, searchUserhandles]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setSearchText(text);
    setSelectedInfluencer(null);
  };

  // Handle opening profile in new tab based on selected platform
  const handleOpenProfile = (influencer: UserhandleResult) => {
    let profileUrl = '';
    const platformName = selectedPlatform?.name?.toLowerCase() || 'instagram';

    switch (platformName) {
      case 'tiktok':
        profileUrl = `https://www.tiktok.com/@${influencer.username}`;
        break;
      case 'youtube':
        profileUrl = `https://www.youtube.com/@${influencer.username}`;
        break;
      case 'instagram':
      default:
        profileUrl = `https://www.instagram.com/${influencer.username}`;
        break;
    }

    window.open(profileUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle profile insights (console for now)
  const handleProfileInsights = (influencer: UserhandleResult) => {
    console.log(
      'handleProfileAnalytics called: ',
      influencer,
      selectedPlatform,
    );
    if (!influencer?.user_id || !selectedPlatform?.id) return;

    const params = new URLSearchParams({
      user: influencer.user_id,
      username: influencer.username,
      platform: selectedPlatform.work_platform_id,
    });

    const url = `/profile-analytics?${params.toString()}`;
    // Open in new tab instead of using router.push
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToListFromSearch = async (influencer: UserhandleResult) => {
    console.log('Adding influencer to campaign:', influencer);

    if (
      !campaignData ||
      !campaignData.campaign_lists ||
      !campaignData.campaign_lists.length
    ) {
      console.error('No campaign list found');
      toast.error(`No campaign list found.`);
      return;
    }

    if (!selectedPlatform || !selectedPlatform.id) {
      console.error('No platform selected or platform ID missing');
      toast.error(`Please select a platform first.`);
      return;
    }

    // Set loading state
    setIsAdding((prev) => ({ ...prev, [influencer.username]: true }));

    try {
      const request: AddToCampaignRequest = {
        username: influencer.username,
        platform: selectedPlatform.name.toLowerCase() as
          | 'instagram'
          | 'tiktok'
          | 'youtube',
        campaign_list_id: campaignData.campaign_lists[0].id,
        platform_id: selectedPlatform.id,
        preferred_provider: 'nanoinfluencer',
        added_through: 'search',
      };

      console.log('Calling professional add-to-campaign service:', request);

      const response = await addInfluencerToCampaign(request);

      if (response.success) {
        // Set success state
        setAddedInfluencers((prev) => ({
          ...prev,
          [influencer.username]: true,
        }));

        // Show success message with provider info
        toast.success(`Successfully added @${influencer.username}`);

        // Refresh the shortlisted members list
        onInfluencerAdded && onInfluencerAdded();
      } else {
        console.error('Failed to add influencer:', response.message);
        toast.error(`Failed to add @${influencer.username}`);
      }
    } catch (error) {
      console.error('Error adding influencer to campaign:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Error adding @${influencer.username}`);
    } finally {
      // Clear loading state
      setIsAdding((prev) => ({ ...prev, [influencer.username]: false }));
    }
  };

  // Handle influencer selection
  const handleSelectInfluencer = (influencer: UserhandleResult) => {
    setSelectedInfluencer(influencer);
    setSearchText(`@${influencer.username}`);
    setShowSearchDropdown(false);
    setSearchResults([]);

    // You can trigger a search here if needed
    // onSearchTextChange(influencer.username);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchText('');
    setSelectedInfluencer(null);
    setSearchResults([]);
    setShowSearchDropdown(false);
    setSearchError(null);
    searchInputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle add to list function
  const handleAddToList = async (influencer: Influencer) => {
    if (
      !campaignData ||
      !campaignData.campaign_lists ||
      !campaignData.campaign_lists.length
    ) {
      console.error('No campaign list found');
      return;
    }

    if (!selectedPlatform || !selectedPlatform.id) {
      console.error('No platform selected or platform ID missing');
      return;
    }

    const listId = campaignData.campaign_lists[0].id;
    const platformId = selectedPlatform.work_platform_id;

    console.log('Adding influencer to list with platform ID:', platformId);

    setIsAdding((prev) => ({ ...prev, [influencer.username]: true }));

    console.log('Test 01:', influencer, listId, platformId);
    try {
      const response = await addInfluencerToList(
        listId,
        influencer,
        platformId,
        'discovery',
        selectedPlatform.name,
      );
      if (response.success) {
        setAddedInfluencers((prev) => ({
          ...prev,
          [influencer.username]: true,
        }));
        console.log(
          'Successfully added influencer to list:',
          influencer.username,
        );

        onInfluencerAdded && onInfluencerAdded();
      } else {
        console.error('Failed to add influencer to list:', response.message);
        toast.error(`Error adding @${influencer.username}`);
        alert(
          `Failed to add ${influencer.name || influencer.username} to list: ${response.message}`,
        );
      }
    } catch (error) {
      console.error('Error adding influencer to list:', error);
      toast.error(
        `An error occurred while adding ${influencer.name || influencer.username}`,
      );
    } finally {
      setIsAdding((prev) => ({ ...prev, [influencer.username]: false }));
    }
  };

  const handleAddToListFromResults = async (influencer: Influencer) => {
    if (
      !campaignData ||
      !campaignData.campaign_lists ||
      !campaignData.campaign_lists.length
    ) {
      console.error('No campaign list found');
      return;
    }

    if (!selectedPlatform || !selectedPlatform.id) {
      console.error('No platform selected or platform ID missing');
      return;
    }

    setIsAdding((prev) => ({ ...prev, [influencer.username]: true }));

    try {
      const request: AddToCampaignRequest = {
        username: influencer.username,
        platform: selectedPlatform.name.toLowerCase() as
          | 'instagram'
          | 'tiktok'
          | 'youtube',
        campaign_list_id: campaignData.campaign_lists[0].id,
        platform_id: selectedPlatform.id,
        preferred_provider: 'nanoinfluencer',
        added_through: 'discovery',
      };

      const response = await addInfluencerToCampaign(request);

      if (response.success) {
        setAddedInfluencers((prev) => ({
          ...prev,
          [influencer.username]: true,
        }));
        console.log('Successfully added influencer from results:', response);
        onInfluencerAdded && onInfluencerAdded();
      } else {
        console.error(
          'Failed to add influencer from results:',
          response.message,
        );
        alert(
          `Failed to add ${influencer.name || influencer.username}: ${response.message}`,
        );
      }
    } catch (error) {
      console.error('Error adding influencer from results:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      alert(
        `Error adding ${influencer.name || influencer.username}: ${errorMessage}`,
      );
    } finally {
      setIsAdding((prev) => ({ ...prev, [influencer.username]: false }));
    }
  };

  // Format follower count
  const formatFollowerCount = (count: string) => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6 overflow-visible">
      {/* Search Box with Dropdown */}
      <div className="mb-4 overflow-visible">
        <div className="flex items-center justify-between overflow-visible">
          {/* Search Bar Section - Left Side */}
          <div
            className="relative flex-2 max-w-[50%] overflow-visible"
            ref={searchDropdownRef}
          >
            {/* Search Input */}
            <div className="relative overflow-visible">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search influencers by username..."
                value={searchText}
                onChange={handleSearchChange}
                className="w-full px-4 py-2.5 pr-20 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />

              {/* Search Icon */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {isSearching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                )}
                {searchText && (
                  <button
                    onClick={handleClearSearch}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Search Error */}
            {searchError && (
              <div className="mt-2 text-sm text-red-600 px-3 py-2 bg-red-50 rounded-lg border border-red-200">
                {searchError}
              </div>
            )}

            {/* Search Results Dropdown - FIXED */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div
                className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl max-h-[350px] min-h-[300px] overflow-y-auto"
                style={{
                  width: searchDropdownRef.current?.offsetWidth || '400px',
                  top:
                    (searchDropdownRef.current?.getBoundingClientRect()
                      .bottom || 0) + 8,
                  left:
                    searchDropdownRef.current?.getBoundingClientRect().left ||
                    0,
                }}
              >
                <div className="p-4">
                  <div className="text-sm font-medium text-gray-500 mb-4 px-2">
                    Found {searchResults.length} influencers
                  </div>

                  {/* Results Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {searchResults.slice(0, 8).map((result) => (
                      <div
                        key={result.user_id}
                        className="w-full p-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 rounded-lg border border-transparent hover:border-purple-200 group"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Profile Picture - Clickable */}
                          <div
                            className="relative cursor-pointer"
                            onClick={() => handleOpenProfile(result)}
                          >
                            {result.picture ? (
                              <img
                                src={result.picture}
                                alt={result.username}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-purple-300 transition-colors hover:scale-105"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center hover:scale-105 transition-transform">
                                <span className="text-white font-semibold text-lg">
                                  {result.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}

                            {/* Verified Badge */}
                            {result.is_verified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </div>

                          {/* Influencer Info - Clickable */}
                          <div
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleOpenProfile(result)}
                          >
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors hover:underline">
                                @{result.username}
                              </h4>
                              {result.is_verified && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                                  Verified
                                </span>
                              )}
                            </div>

                            {result.fullname && (
                              <p className="text-sm text-gray-600 truncate mt-0.5 hover:underline">
                                {result.fullname}
                              </p>
                            )}

                            {result.followers && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Users size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-500 font-medium">
                                  {formatFollowerCount(result.followers)}{' '}
                                  followers
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex-shrink-0 flex items-center space-x-2">
                            {/* Profile Insights Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProfileInsights(result);
                              }}
                              className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                              title="Profile Insights"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                              </svg>
                              Profile Insights
                            </button>

                            {/* Add to List Button - FIXED to show proper state */}
                            {addedInfluencers[result.username] ? (
                              // Show "Added" state
                              <span className="flex items-center px-2 py-1 text-xs text-green-600 bg-green-100 rounded-md">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Added
                              </span>
                            ) : (
                              // Show "Add to List" button
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToListFromSearch(result);
                                }}
                                disabled={isAdding[result.username]}
                                className={`flex items-center px-2 py-1 text-xs rounded-md transition-colors ${
                                  isAdding[result.username]
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                    : 'text-purple-600 bg-purple-100 hover:bg-purple-200'
                                }`}
                                title={
                                  isAdding[result.username]
                                    ? 'Adding...'
                                    : 'Add to List'
                                }
                              >
                                {isAdding[result.username] ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-1"></div>
                                    Adding...
                                  </>
                                ) : (
                                  'Add to List'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View More */}
                  {searchResults.length > 8 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-center">
                        <span className="text-xs text-gray-500">
                          +{searchResults.length - 8} more results
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Results - FIXED */}
            {showSearchDropdown &&
              searchResults.length === 0 &&
              searchText.length >= 3 &&
              !isSearching && (
                <div
                  className="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl min-h-[200px]"
                  style={{
                    width: searchDropdownRef.current?.offsetWidth || '400px',
                    top:
                      (searchDropdownRef.current?.getBoundingClientRect()
                        .bottom || 0) + 8,
                    left:
                      searchDropdownRef.current?.getBoundingClientRect().left ||
                      0,
                  }}
                >
                  <div className="p-6 text-center flex items-center justify-center h-full">
                    <div>
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        No influencers found
                      </h3>
                      <p className="text-xs text-gray-500">
                        Try searching with a different username or keyword
                      </p>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Filter and Sort Buttons */}
          <div className="flex items-center space-x-2">
            {/* Hamburger menu with toggle functionality */}
            <button
              className={`p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors ${showFilters ? 'bg-gray-200' : ''}`}
              onClick={toggleFilters}
              aria-label="Toggle filters"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Filter button */}
            <button className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Show filters only if showFilters is true */}
      {showFilters && (
        <DiscoverFilters
          searchParams={searchParams}
          onFilterChange={onFilterChange}
          onApplyFilters={onApplyFilters}
          onClear={handleClearFilters}
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onPlatformChange={onPlatformChange}
          isLoadingPlatforms={isLoadingPlatforms}
          filterContext={filterContext}
        />
      )}

      {/* Always show results */}
      <DiscoveredResults
        selectedPlatform={selectedPlatform}
        influencers={influencers}
        discoveredCreatorsResults={discoveredCreatorsResults}
        isLoading={isLoading}
        totalResults={totalResults}
        sortField={searchParams.sort_by?.field || 'FOLLOWER_COUNT'}
        sortDirection={
          searchParams.sort_by?.order === 'ASCENDING' ? 'asc' : 'desc'
        }
        onSortChange={onSortChange}
        onLoadMore={onLoadMore}
        hasMore={hasMore}
        nextBatchSize={nextBatchSize}
        remainingResults={remainingResults}
        campaignData={campaignData}
        onInfluencerAdded={onInfluencerAdded}
        shortlistedMembers={shortlistedMembers}
        onAddToList={handleAddToList}
        addedInfluencers={addedInfluencers}
        isAdding={isAdding}
        setAddedInfluencers={setAddedInfluencers}
      />
    </div>
  );
};

export default DiscoveredInfluencers;
