// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/LookalikeAI.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoDuplicateOutline, IoClose, IoSearch } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface LookalikeAIProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
            // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
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

const LookalikeAI: React.FC<LookalikeAIProps> = ({ 
  filters, 
  onFilterChange, 
  isOpen, 
  onToggle,
  onCloseFilter,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  // Separate state for each search field
  const [creatorQuery, setCreatorQuery] = useState('');
  const [audienceQuery, setAudienceQuery] = useState('');
  
  // Separate search results for each field
  const [creatorResults, setCreatorResults] = useState<UserhandleResult[]>([]);
  const [audienceResults, setAudienceResults] = useState<UserhandleResult[]>([]);
  
  // Separate loading states
  const [isLoadingCreator, setIsLoadingCreator] = useState(false);
  const [isLoadingAudience, setIsLoadingAudience] = useState(false);
  
  // Separate error states
  const [creatorError, setCreatorError] = useState<string | null>(null);
  const [audienceError, setAudienceError] = useState<string | null>(null);
  
  // Separate dropdown visibility
  const [showCreatorDropdown, setShowCreatorDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  
  // Selected values
  const [selectedCreatorLookalike, setSelectedCreatorLookalike] = useState<string>(
    filters.creator_lookalikes || ''
  );
  const [selectedAudienceLookalike, setSelectedAudienceLookalike] = useState<string>(
    filters.audience_lookalikes || ''
  );
  
  const creatorDropdownRef = useRef<HTMLDivElement>(null);
  const audienceDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize with existing filters
  useEffect(() => {
    if (filters.creator_lookalikes !== selectedCreatorLookalike) {
      setSelectedCreatorLookalike(filters.creator_lookalikes || '');
    }
    if (filters.audience_lookalikes !== selectedAudienceLookalike) {
      setSelectedAudienceLookalike(filters.audience_lookalikes || '');
    }
  }, [filters.creator_lookalikes, filters.audience_lookalikes]);



  // Search userhandles function
  const searchUserhandles = useCallback(async (
    query: string,
    type: 'creator' | 'audience'
  ) => {
    if (query.length < 2) {
      if (type === 'creator') {
        setCreatorResults([]);
        setShowCreatorDropdown(false);
      } else {
        setAudienceResults([]);
        setShowAudienceDropdown(false);
      }
      return;
    }

    const setLoading = type === 'creator' ? setIsLoadingCreator : setIsLoadingAudience;
    const setError = type === 'creator' ? setCreatorError : setAudienceError;
    const setResults = type === 'creator' ? setCreatorResults : setAudienceResults;
    const setShowDropdown = type === 'creator' ? setShowCreatorDropdown : setShowAudienceDropdown;

    setLoading(true);
    setError(null);
    
    try {
      // Remove @ prefix if present for API call
      const cleanQuery = query.replace(/^@/, '');
      const url = `/api/v0/discover/userhandles?q=${encodeURIComponent(cleanQuery)}&type=search&limit=10`;

      console.log(`🎯 Searching ${type} lookalikes:`, url);

      const response = await fetch(url);
      console.log(`📡 Response for ${type} lookalikes:`, response);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to search userhandles');
      }

      console.log(`✅ Found ${data.data.length} ${type} lookalikes`);

      setResults(data.data || []);
      setShowDropdown(data.data.length > 0);

    } catch (error) {
      console.error(`❌ Error searching ${type} lookalikes:`, error);
      setError(error instanceof Error ? error.message : `Failed to search ${type} lookalikes`);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effects
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUserhandles(creatorQuery, 'creator');
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [creatorQuery, searchUserhandles]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUserhandles(audienceQuery, 'audience');
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [audienceQuery, searchUserhandles]);

  // Handle search input changes
  const handleCreatorSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorQuery(e.target.value);
  };

  const handleAudienceSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudienceQuery(e.target.value);
  };

  // Handle selection
  const handleSelectCreatorLookalike = (username: string) => {
    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '');
    
    setSelectedCreatorLookalike(cleanUsername);
    onFilterChange({ creator_lookalikes: cleanUsername });
    
    // Clear search
    setCreatorQuery('');
    setShowCreatorDropdown(false);
    setCreatorResults([]);
  };

  const handleSelectAudienceLookalike = (username: string) => {
    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '');
    
    setSelectedAudienceLookalike(cleanUsername);
    onFilterChange({ audience_lookalikes: cleanUsername });
    
    // Clear search
    setAudienceQuery('');
    setShowAudienceDropdown(false);
    setAudienceResults([]);
  };

  // Handle removal
  const handleRemoveCreatorLookalike = () => {
    setSelectedCreatorLookalike('');
    onFilterChange({ creator_lookalikes: undefined });
  };

  const handleRemoveAudienceLookalike = () => {
    setSelectedAudienceLookalike('');
    onFilterChange({ audience_lookalikes: undefined });
  };

  // Clear search when component closes
  useEffect(() => {
    if (!isOpen) {
      setCreatorQuery('');
      setAudienceQuery('');
      setShowCreatorDropdown(false);
      setShowAudienceDropdown(false);
      setCreatorResults([]);
      setAudienceResults([]);
      setCreatorError(null);
      setAudienceError(null);
    }
  }, [isOpen]);

  const hasSelections = !!(selectedCreatorLookalike || selectedAudienceLookalike);

  const hasActiveFilters = hasSelections || creatorQuery.length > 0 || audienceQuery.length > 0;
  const selectedCount = (filters.creator_lookalikes ? 1 : 0) + (filters.audience_lookalikes ? 1 : 0);

  return (
    <FilterComponent
      hasActiveFilters={!!hasActiveFilters}
      icon={
        <div className="flex items-center">
          <IoDuplicateOutline size={16} />
          <FaRobot size={10} className="ml-1" />
        </div>
      }
      title="Lookalikes AI"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      selectedCount= {selectedCount}
      colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme
    >
      {/* Empty content to prevent default padding */}
      <div className="hidden"></div>
      
      {/* Dropdown positioned to the left */}
      <div className="absolute right-0 top-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[520px] overflow-visible">
        <div className="p-4">

          {/* Side by side layout like interests filter */}
          <div className="flex gap-4">
            
            {/* Left side - Influencer (Creator Lookalikes) */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <h4 className="text-sm font-medium text-gray-700">Influencer</h4>
              </div>
              
              <div className="relative" ref={creatorDropdownRef}>
                <input
                  type="text"
                  placeholder="Search creator interests..."
                  value={creatorQuery}
                  onChange={handleCreatorSearchChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                />
                {isLoadingCreator && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-600"></div>
                  </div>
                )}

                {/* Creator Error Message */}
                {creatorError && (
                  <div className="mt-1 text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
                    {creatorError}
                  </div>
                )}

                {/* Creator Search Results */}
                {showCreatorDropdown && creatorResults.length > 0 && (
                  <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {creatorResults.slice(0, 8).map((result) => (
                      <button
                        key={result.user_id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-pink-50 transition-colors"
                        onClick={() => handleSelectCreatorLookalike(result.username)}
                      >
                        <div className="flex items-center gap-2">
                          {result.picture && (
                            <img
                              src={result.picture}
                              alt={result.username}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-gray-900">
                                @{result.username}
                              </span>
                              {result.is_verified && (
                                <div className="w-3 h-3 bg-pink-500 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                            {result.fullname && (
                              <div className="text-xs text-gray-500 truncate">
                                {result.fullname}
                              </div>
                            )}
                            {result.followers && (
                              <div className="text-xs text-gray-400">
                                {parseInt(result.followers).toLocaleString()} followers
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Creator Results */}
                {showCreatorDropdown && creatorResults.length === 0 && creatorQuery.length >= 2 && !isLoadingCreator && (
                  <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No creators found for "@{creatorQuery}"
                    </div>
                  </div>
                )}
              </div>

              {/* Empty state or selected creator */}
                {selectedCreatorLookalike ? (
                <div className="mt-4 h-10 flex flex-col items-center justify-center text-center">
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                          <span className="text-sm text-pink-800 font-medium">
                            @{selectedCreatorLookalike}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCreatorLookalike}
                          className="text-pink-600 hover:text-pink-800 transition-colors"
                          title="Remove creator lookalike"
                        >
                          <IoClose size={14} />
                        </button>
                      </div>
                    </div>
                </div>
                ): null}
            </div>

            {/* Center divider */}
            <div className="w-px bg-gray-200"></div>

            {/* Right side - Audience */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="text-sm font-medium text-gray-700">Audience</h4>
              </div>
              
              <div className="relative" ref={audienceDropdownRef}>
                <input
                  type="text"
                  placeholder="Search audience interests..."
                  value={audienceQuery}
                  onChange={handleAudienceSearchChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                />
                {isLoadingAudience && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {/* Audience Error Message */}
                {audienceError && (
                  <div className="mt-1 text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
                    {audienceError}
                  </div>
                )}

                {/* Audience Search Results */}
                {showAudienceDropdown && audienceResults.length > 0 && (
                  <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {audienceResults.slice(0, 8).map((result) => (
                      <button
                        key={result.user_id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                        onClick={() => handleSelectAudienceLookalike(result.username)}
                      >
                        <div className="flex items-center gap-2">
                          {result.picture && (
                            <img
                              src={result.picture}
                              alt={result.username}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-gray-900">
                                @{result.username}
                              </span>
                              {result.is_verified && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                              )}
                            </div>
                            {result.fullname && (
                              <div className="text-xs text-gray-500 truncate">
                                {result.fullname}
                              </div>
                            )}
                            {result.followers && (
                              <div className="text-xs text-gray-400">
                                {parseInt(result.followers).toLocaleString()} followers
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* No Audience Results */}
                {showAudienceDropdown && audienceResults.length === 0 && audienceQuery.length >= 2 && !isLoadingAudience && (
                  <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="px-3 py-4 text-center text-sm text-gray-500">
                      No creators found for "@{audienceQuery}"
                    </div>
                  </div>
                )}
              </div>

              {/* Empty state or selected audience */}
                {selectedAudienceLookalike ? (
                <div className="mt-4 h-10 flex flex-col items-center justify-center text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-blue-800 font-medium">
                            @{selectedAudienceLookalike}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveAudienceLookalike}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Remove audience lookalike"
                        >
                          <IoClose size={14} />
                        </button>
                      </div>
                    </div>
                </div>
                ) : null}
            </div>
          </div>

        </div>
      </div>
    </FilterComponent>
  );
};

export default LookalikeAI;