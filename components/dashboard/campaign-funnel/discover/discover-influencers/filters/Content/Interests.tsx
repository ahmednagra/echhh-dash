// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/Interests.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoHeartOutline, IoClose, IoChevronDown } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, AudienceInterestAffinity } from '@/lib/creator-discovery-types';
 
interface InterestsProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
            // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
  // Add context update handler
  onUpdateContext?: (updates: {
    selectedInterests?: {
      creator?: string[];
      audience?: { value: string; percentage_value: number }[];
    };
  }) => void;
}

interface ProcessedInterest {
  id: string;
  name: string;
  searchable: string;
}

interface ApiResponse {
  success: boolean;
  data: ProcessedInterest[];
  total: number;
  query: string | null;
  cached: boolean;
}

// Percentage options: 1, 5, 10, 15, 20, 25, 30, ..., 95
const PERCENTAGE_OPTIONS = [
  1, 5, 10, 15, 20, 
  ...Array.from({ length: 15 }, (_, i) => 25 + (i * 5)) // 25 to 95 by 5s
];

const Interests: React.FC<InterestsProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter,
  onUpdateContext,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  // States for creator interests (left column)
  const [creatorSearchQuery, setCreatorSearchQuery] = useState('');
  const [selectedCreatorInterests, setSelectedCreatorInterests] = useState<string[]>(
    filters.creator_interests || []
  );
  const [creatorInterests, setCreatorInterests] = useState<ProcessedInterest[]>([]);
  const [isCreatorLoading, setIsCreatorLoading] = useState(false);
  const [creatorError, setCreatorError] = useState<string | null>(null);

  // States for audience interests (right column)
  const [audienceSearchQuery, setAudienceSearchQuery] = useState('');
  const [selectedAudienceInterests, setSelectedAudienceInterests] = useState<AudienceInterestAffinity[]>(
    filters.audience_interest_affinities || []
  );
  const [audienceInterests, setAudienceInterests] = useState<ProcessedInterest[]>([]);
  const [isAudienceLoading, setIsAudienceLoading] = useState(false);
  const [audienceError, setAudienceError] = useState<string | null>(null);

  // Shared states
  const [availableInterests, setAvailableInterests] = useState<ProcessedInterest[]>([]);

  // Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const filterComponentRef = useRef<HTMLDivElement>(null);

  // Initialize with existing filters
  useEffect(() => {
    if (filters.creator_interests) {
      const areArraysDifferent =
        filters.creator_interests.length !== selectedCreatorInterests.length ||
        filters.creator_interests.some(interest => !selectedCreatorInterests.includes(interest));

      if (areArraysDifferent) {
        setSelectedCreatorInterests(filters.creator_interests);
      }
    }

    if (filters.audience_interest_affinities) {
      const areArraysDifferent =
        filters.audience_interest_affinities.length !== selectedAudienceInterests.length ||
        filters.audience_interest_affinities.some(interest => 
          !selectedAudienceInterests.find(selected => 
            selected.value === interest.value && selected.percentage_value === interest.percentage_value
          )
        );

      if (areArraysDifferent) {
        setSelectedAudienceInterests(filters.audience_interest_affinities);
      }
    }
  }, [filters.creator_interests, filters.audience_interest_affinities]);

  // Update context when interests change
  useEffect(() => {
    if (onUpdateContext) {
      onUpdateContext({
        selectedInterests: {
          creator: selectedCreatorInterests,
          audience: selectedAudienceInterests
        }
      });
    }
  }, [selectedCreatorInterests, selectedAudienceInterests, onUpdateContext]);

  // Fetch all interests once when component opens
  const fetchAllInterests = useCallback(async () => {
    setIsCreatorLoading(true);
    setIsAudienceLoading(true);
    setCreatorError(null);
    setAudienceError(null);
    
    try {
      const url = '/api/v0/discover/interests';

      console.log('🎯 Fetching all interests once:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch interests');
      }

      console.log(`✅ Fetched all ${data.data.length} interests (cached: ${data.cached})`);

      const fetchedInterests = data.data || [];
      setAvailableInterests(fetchedInterests);
      
      // Set initial states for both columns
      setCreatorInterests(fetchedInterests);
      setAudienceInterests(fetchedInterests);

    } catch (error) {
      console.error('❌ Error fetching all interests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch interests';
      setCreatorError(errorMessage);
      setAudienceError(errorMessage);
    } finally {
      setIsCreatorLoading(false);
      setIsAudienceLoading(false);
    }
  }, []);

  // Load all interests when component opens
  useEffect(() => {
    if (isOpen && availableInterests.length === 0) {
      fetchAllInterests();
    }
  }, [isOpen, availableInterests.length, fetchAllInterests]);

  // Local filtering for creator interests (no API calls)
  useEffect(() => {
    if (availableInterests.length === 0) return;

    if (creatorSearchQuery.length === 0) {
      setCreatorInterests(availableInterests);
    } else {
      const filtered = availableInterests.filter(interest =>
        interest.searchable.toLowerCase().includes(creatorSearchQuery.toLowerCase()) ||
        interest.name.toLowerCase().includes(creatorSearchQuery.toLowerCase())
      );
      setCreatorInterests(filtered);
    }
  }, [creatorSearchQuery, availableInterests]);

  // Local filtering for audience interests (no API calls)
  useEffect(() => {
    if (availableInterests.length === 0) return;

    if (audienceSearchQuery.length === 0) {
      setAudienceInterests(availableInterests);
    } else {
      const filtered = availableInterests.filter(interest =>
        interest.searchable.toLowerCase().includes(audienceSearchQuery.toLowerCase()) ||
        interest.name.toLowerCase().includes(audienceSearchQuery.toLowerCase())
      );
      setAudienceInterests(filtered);
    }
  }, [audienceSearchQuery, availableInterests]);

  // Creator interest handlers
  const handleCreatorSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreatorSearchQuery(e.target.value);
  };

  const toggleCreatorInterest = (interestName: string) => {
    const isSelected = selectedCreatorInterests.includes(interestName);
    
    let updatedInterests: string[];
    
    if (isSelected) {
      updatedInterests = selectedCreatorInterests.filter(interest => interest !== interestName);
    } else {
      updatedInterests = [...selectedCreatorInterests, interestName];
    }
    
    setSelectedCreatorInterests(updatedInterests);
    onFilterChange({ creator_interests: updatedInterests.length > 0 ? updatedInterests : undefined });
  };

  const removeCreatorInterest = (interestToRemove: string) => {
    const newInterests = selectedCreatorInterests.filter(interest => interest !== interestToRemove);
    setSelectedCreatorInterests(newInterests);
    onFilterChange({ creator_interests: newInterests.length > 0 ? newInterests : undefined });
  };

  // Audience interest handlers
  const handleAudienceSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudienceSearchQuery(e.target.value);
  };

  const toggleAudienceInterest = (interestName: string) => {
    const isSelected = selectedAudienceInterests.some(item => item.value === interestName);
    
    let updatedInterests: AudienceInterestAffinity[];
    
    if (isSelected) {
      updatedInterests = selectedAudienceInterests.filter(item => item.value !== interestName);
    } else {
      const newInterest: AudienceInterestAffinity = {
        value: interestName,
        operation: 'GT',
        percentage_value: 20 // Default 20%
      };
      updatedInterests = [...selectedAudienceInterests, newInterest];
    }
    
    setSelectedAudienceInterests(updatedInterests);
    onFilterChange({ audience_interest_affinities: updatedInterests.length > 0 ? updatedInterests : undefined });
  };

  const handleAudiencePercentageChange = (interestValue: string, newPercentage: number) => {
    const validPercentage = Math.min(95, Math.max(1, newPercentage));
    const newInterests = selectedAudienceInterests.map(item =>
      item.value === interestValue 
        ? { ...item, percentage_value: validPercentage }
        : item
    );
    setSelectedAudienceInterests(newInterests);
    onFilterChange({ audience_interest_affinities: newInterests });
  };

  const removeAudienceInterest = (interestToRemove: string) => {
    const newInterests = selectedAudienceInterests.filter(item => item.value !== interestToRemove);
    setSelectedAudienceInterests(newInterests);
    onFilterChange({ audience_interest_affinities: newInterests.length > 0 ? newInterests : undefined });
  };

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setCreatorSearchQuery('');
      setAudienceSearchQuery('');
      setCreatorInterests([]);
      setAudienceInterests([]);
      setCreatorError(null);
      setAudienceError(null);
    }
  }, [isOpen]);

  const totalSelectedCount = selectedCreatorInterests.length + selectedAudienceInterests.length;

  // Percentage dropdown component
  const PercentageDropdown: React.FC<{
    value: number;
    onChange: (value: number) => void;
    interestValue: string;
  }> = ({ value, onChange, interestValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 transition-colors"
        >
          <span>{value}%</span>
          <IoChevronDown size={10} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[100] right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-45 overflow-y-auto min-w-[60px]">
            {PERCENTAGE_OPTIONS.map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => {
                  onChange(percentage);
                  setIsOpen(false);
                }}
                className={`w-full px-2 py-1 text-xs text-left hover:bg-blue-50 transition-colors ${
                  value === percentage ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                {percentage}%
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={wrapperRef}>
      <div ref={filterComponentRef}>
        <FilterComponent
          hasActiveFilters={totalSelectedCount > 0}
          icon={<IoHeartOutline size={18} />}
          title="Interests"
          isOpen={isOpen}
          onClose={onCloseFilter}
          onToggle={onToggle}
          className="border border-gray-200 rounded-md"
          selectedCount={totalSelectedCount}
          colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme
        >
          {/* Empty content to prevent default padding/content */}
          <div className="hidden"></div>
          
          {/* Compact dropdown - positioned to extend right */}
          <div className="absolute left-0 top-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[600px] overflow-visible">
            <div className="flex gap-3 p-4 overflow-visible">
              
              {/* Creator Interests Section */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <h3 className="text-xs font-semibold text-gray-800">Influencer</h3>
                </div>
                
                {/* Creator Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search creator interests..."
                    value={creatorSearchQuery}
                    onChange={handleCreatorSearchChange}
                    className="w-full p-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-300 focus:border-pink-400 transition-colors"
                  />
                  {isCreatorLoading && availableInterests.length === 0 && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-pink-600"></div>
                    </div>
                  )}
                </div>

                {/* Creator Error Message */}
                {creatorError && (
                  <div className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
                    {creatorError}
                  </div>
                )}

                {/* Creator Search Results */}
                <div className="max-h-32 overflow-y-auto">
                  {creatorSearchQuery.length >= 1 && !creatorError && (
                    <div className="space-y-1">
                      {isCreatorLoading && availableInterests.length === 0 ? (
                        <div className="text-xs text-gray-500 px-2 py-1 text-center">
                          Loading interests...
                        </div>
                      ) : creatorInterests.length > 0 ? (
                        creatorInterests
                          .filter(interest => !selectedCreatorInterests.includes(interest.name))
                          .slice(0, 10)
                          .map((interest) => (
                            <label 
                              key={interest.id} 
                              className="flex items-center p-1.5 hover:bg-pink-50 rounded cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCreatorInterests.includes(interest.name)}
                                onChange={() => toggleCreatorInterest(interest.name)}
                                className="form-checkbox h-3 w-3 text-pink-600 rounded focus:ring-pink-500 border-gray-300"
                              />
                              <div className="ml-2 text-xs text-gray-700 flex-1">
                                <div className="font-medium text-gray-900 truncate">
                                  {interest.name}
                                </div>
                              </div>
                            </label>
                          ))
                      ) : (
                        <div className="text-xs text-gray-500 px-2 py-1 text-center">
                          No interests found for "{creatorSearchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Creator Interests */}
                {selectedCreatorInterests.length > 0 && (
                  <div className="border-t border-gray-200 pt-2">
                    <h4 className="text-xs font-medium text-gray-600 mb-1">
                      Selected ({selectedCreatorInterests.length}):
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCreatorInterests.map((interest) => (
                        <span 
                          key={interest} 
                          className="inline-flex items-center text-xs bg-pink-100 text-pink-800 px-2.5 py-1 rounded-full"
                        >
                          <span className="max-w-28 truncate" title={interest}>
                            {interest}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCreatorInterest(interest);
                            }}
                            className="ml-1.5 text-pink-600 hover:text-pink-800 flex-shrink-0"
                            title="Remove interest"
                          >
                            <IoClose size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Vertical Divider */}
              <div className="w-px bg-gray-200"></div>

              {/* Audience Interests Section */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="text-xs font-semibold text-gray-800">Audience</h3>
                </div>
                
                {/* Audience Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search audience interests..."
                    value={audienceSearchQuery}
                    onChange={handleAudienceSearchChange}
                    className="w-full p-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400 transition-colors"
                  />
                  {isAudienceLoading && availableInterests.length === 0 && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                    </div>
                  )}
                </div>

                {/* Audience Error Message */}
                {audienceError && (
                  <div className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
                    {audienceError}
                  </div>
                )}

                {/* Audience Search Results */}
                <div className="max-h-32 overflow-y-auto">
                  {audienceSearchQuery.length >= 1 && !audienceError && (
                    <div className="space-y-1">
                      {isAudienceLoading && availableInterests.length === 0 ? (
                        <div className="text-xs text-gray-500 px-2 py-1 text-center">
                          Loading interests...
                        </div>
                      ) : audienceInterests.length > 0 ? (
                        audienceInterests
                          .filter(interest => !selectedAudienceInterests.some(item => item.value === interest.name))
                          .slice(0, 10)
                          .map((interest) => (
                            <label 
                              key={interest.id} 
                              className="flex items-center p-1.5 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedAudienceInterests.some(item => item.value === interest.name)}
                                onChange={() => toggleAudienceInterest(interest.name)}
                                className="form-checkbox h-3 w-3 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                              />
                              <div className="ml-2 text-xs text-gray-700 flex-1">
                                <div className="font-medium text-gray-900 truncate">
                                  {interest.name}
                                </div>
                              </div>
                            </label>
                          ))
                      ) : (
                        <div className="text-xs text-gray-500 px-2 py-1 text-center">
                          No interests found for "{audienceSearchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Audience Interests */}
                {selectedAudienceInterests.length > 0 && (
                  <div className="border-t border-gray-200 pt-2">
                    <h4 className="text-xs font-medium text-gray-600 mb-1">
                      Selected ({selectedAudienceInterests.length}):
                    </h4>
                    <div className="space-y-1.5">
                      {selectedAudienceInterests.map((interest) => (
                        <div 
                          key={interest.value} 
                          className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          <span className="text-xs text-blue-800 flex-1 truncate font-medium">
                            {interest.value}
                          </span>
                          <div className="flex items-center gap-1 ml-2">
                            <PercentageDropdown
                              value={interest.percentage_value}
                              onChange={(newPercentage) => handleAudiencePercentageChange(interest.value, newPercentage)}
                              interestValue={interest.value}
                            />
                            <button
                              onClick={() => removeAudienceInterest(interest.value)}
                              className="ml-1 text-blue-600 hover:text-blue-800 flex-shrink-0 p-0.5"
                              title="Remove interest"
                            >
                              <IoClose size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Loading/Error States - Only show during initial load */}
            {isCreatorLoading && availableInterests.length === 0 && (
              <div className="text-center py-4 border-t border-gray-200">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <IoHeartOutline className="w-4 h-4 text-gray-600" />
                </div>
                <div className="text-sm text-gray-600">Loading all interests...</div>
              </div>
            )}

            {(creatorError || audienceError) && availableInterests.length === 0 && (
              <div className="text-center py-4 border-t border-gray-200">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <IoClose className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-sm text-red-600 font-medium">Failed to load interests</div>
                <button
                  onClick={() => fetchAllInterests()}
                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        </FilterComponent>
      </div>
    </div>
  );
};

export default Interests;