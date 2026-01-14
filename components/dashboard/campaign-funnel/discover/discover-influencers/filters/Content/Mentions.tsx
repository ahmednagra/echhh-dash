// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/Mentions.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoAtOutline, IoClose, IoSearch, IoInformationCircleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, MentionFilter } from '@/lib/creator-discovery-types';

interface MentionsProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
            // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
  // Add context update handler
  onUpdateContext?: (updates: {
    selectedMentions?: { name: string }[];
  }) => void;
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

const Mentions: React.FC<MentionsProps> = ({ 
  filters, 
  onFilterChange, 
  isOpen, 
  onToggle,
  onCloseFilter,
  onUpdateContext,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserhandleResult[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<MentionFilter[]>(
    filters.mentions || []
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Initialize with existing filters
  useEffect(() => {
    if (filters.mentions) {
      const areArraysDifferent =
        filters.mentions.length !== selectedMentions.length ||
        filters.mentions.some(mention => 
          !selectedMentions.find(selected => selected.name === mention.name)
        );

      if (areArraysDifferent) {
        setSelectedMentions(filters.mentions);
      }
    }
  }, [filters.mentions]);

  // Update context when mentions change
  useEffect(() => {
    if (onUpdateContext) {
      onUpdateContext({
        selectedMentions: selectedMentions
      });
    }
  }, [selectedMentions, onUpdateContext]);

  // Search userhandles with API
  const searchUserhandles = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Remove @ prefix if present for API call
      const cleanQuery = query.replace(/^@/, '');
      const url = `/api/v0/discover/userhandles?q=${encodeURIComponent(cleanQuery)}&type=search&limit=10`;

      console.log('🎯 Searching userhandles for mentions:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to search userhandles');
      }

      console.log(`✅ Found ${data.data.length} userhandles for mentions`);

      setSearchResults(data.data || []);
      setShowDropdown(data.data.length > 0);

    } catch (error) {
      console.error('❌ Error searching userhandles:', error);
      setError(error instanceof Error ? error.message : 'Failed to search userhandles');
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchUserhandles(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchUserhandles]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMention();
    }
  };

  // Handle selection from dropdown
  const handleSelectUserhandle = (username: string) => {
    // Clean username (remove @ if present)
    const cleanUsername = username.replace(/^@/, '');
    
    // Check if already selected
    const alreadySelected = selectedMentions.some(mention => 
      mention.name.toLowerCase() === cleanUsername.toLowerCase()
    );
    
    if (alreadySelected) {
      setSearchQuery('');
      setShowDropdown(false);
      return;
    }

    const newMention: MentionFilter = {
      name: cleanUsername
    };

    const updatedMentions = [...selectedMentions, newMention];
    setSelectedMentions(updatedMentions);
    onFilterChange({ mentions: updatedMentions });
    
    // Clear search
    setSearchQuery('');
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Add mention function (for manual entry)
  const addMention = () => {
    if (!searchQuery.trim()) return;

    // Clean username (remove @ if present and trim whitespace)
    const cleanUsername = searchQuery.trim().replace(/^@/, '');
    
    // Validate username (basic validation)
    if (cleanUsername.length === 0) return;
    
    // Check if already selected
    const alreadySelected = selectedMentions.some(mention => 
      mention.name.toLowerCase() === cleanUsername.toLowerCase()
    );
    
    if (alreadySelected) {
      setSearchQuery('');
      return;
    }

    const newMention: MentionFilter = {
      name: cleanUsername
    };

    const updatedMentions = [...selectedMentions, newMention];
    setSelectedMentions(updatedMentions);
    onFilterChange({ mentions: updatedMentions });
    
    // Clear input
    setSearchQuery('');
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Remove mention from selected list
  const handleRemoveMention = (mentionName: string) => {
    const updatedMentions = selectedMentions.filter(mention => mention.name !== mentionName);
    setSelectedMentions(updatedMentions);
    onFilterChange({ mentions: updatedMentions.length > 0 ? updatedMentions : undefined });
  };

  // Clear all mentions
  const clearAllMentions = () => {
    setSelectedMentions([]);
    onFilterChange({ mentions: undefined });
  };

  // Clear input when component closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setShowDropdown(false);
      setSearchResults([]);
      setError(null);
      setShowTooltip(false);
    } else {
      // Focus input when component opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const hasMentions = selectedMentions.length > 0;

  return (
    <FilterComponent
      hasActiveFilters={hasMentions}
      icon={<IoAtOutline size={18} />}
      title="Mentions"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      selectedCount={selectedMentions.length}
      colorTheme={colorTheme}
    >
      <div className="space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-800">Add Mentions</h3>
              
              {/* Info Icon with Tooltip */}
              <div className="relative" ref={tooltipRef}>
                <button
                  type="button"
                  className="text-gray-400 hover:text-purple-500 transition-colors"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                >
                  <IoInformationCircleOutline size={14} />
                </button>
                
                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute left-0 top-6 z-[200] w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
                    <div className="relative">
                      {/* Tooltip arrow */}
                      <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                      
                      {/* Tooltip content */}
                      <div className="leading-relaxed">
                        Shows creators who have mentioned the added usernames in their posts.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {hasMentions && (
              <button
                onClick={clearAllMentions}
                className="text-purple-600 hover:text-purple-800 transition-colors"
                title="Clear all mentions"
              >
                <IoClose size={16} />
              </button>
            )}
          </div>

          {/* Input Field with Search */}
          <div className="space-y-2">
            <div className="relative" ref={dropdownRef}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search usernames..."
                value={searchQuery}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-400 transition-colors"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-1 text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
                  {error}
                </div>
              )}

              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.user_id}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-purple-50 transition-colors"
                      onClick={() => handleSelectUserhandle(result.username)}
                      disabled={selectedMentions.some(mention => mention.name.toLowerCase() === result.username.toLowerCase())}
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
                              <div className="w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                            )}
                            {selectedMentions.some(mention => mention.name.toLowerCase() === result.username.toLowerCase()) && (
                              <span className="text-xs text-gray-500">(Selected)</span>
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

              {/* No Results */}
              {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && !isLoading && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    No users found for "@{searchQuery}"
                    <div className="text-xs text-gray-400 mt-1">
                      Press Enter to add manually
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Mentions */}
          {selectedMentions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600">
                Selected Mentions ({selectedMentions.length}):
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedMentions.map((mention) => (
                  <div
                    key={mention.name}
                    className="flex items-center justify-between p-2 bg-purple-50 rounded-md border border-purple-200"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-purple-800 font-medium">
                        @{mention.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMention(mention.name)}
                      className="text-purple-600 hover:text-purple-800 transition-colors"
                      title="Remove mention"
                    >
                      <IoClose size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
    </FilterComponent>
  );
};

export default Mentions;