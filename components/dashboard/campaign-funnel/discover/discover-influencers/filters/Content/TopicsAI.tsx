// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/TopicsAI.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IoDocumentTextOutline, IoClose, IoSearch, IoInformationCircleOutline } from 'react-icons/io5';
import { FaRobot } from 'react-icons/fa';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface TopicsAIFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
            // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
  // Add context update handler
  onUpdateContext?: (updates: {
    selectedTopics?: string[];
  }) => void;
}

interface ProcessedTopic {
  id: string;
  name: string;
  value: string;
  searchable: string;
}

interface TopicsApiResponse {
  success: boolean;
  data: ProcessedTopic[];
  total: number;
  query: string | null;
  error?: string;
}

const TopicsAI: React.FC<TopicsAIFilterProps> = ({ 
  filters, 
  onFilterChange, 
  isOpen, 
  onToggle,
  onCloseFilter,
  onUpdateContext,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProcessedTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Initialize with existing filters
  useEffect(() => {
    if (filters.topic_relevance?.name) {
      setSelectedTopics(filters.topic_relevance.name);
    }
  }, [filters.topic_relevance]);

  // Update context when topics change
  useEffect(() => {
    if (onUpdateContext) {
      onUpdateContext({
        selectedTopics: selectedTopics
      });
    }
  }, [selectedTopics, onUpdateContext]);

  // Search topics with autocomplete
  const searchTopics = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const platform_id = '9bb8913b-ddd9-430b-a66a-d74d846e6c66';
      const response = await fetch(
        `/api/v0/discover/topics?q=${encodeURIComponent(query)}&limit=50&work_platform_id=${platform_id}`,
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: TopicsApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to search topics');
      }

      console.log(`✅ Found ${data.data.length} topics for "${query}"`);

      setSearchResults(data.data);
      setShowDropdown(data.data.length > 0);

    } catch (error) {
      console.error('❌ Error searching topics:', error);
      setError(error instanceof Error ? error.message : 'Failed to search topics');
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
        searchTopics(searchQuery);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchTopics]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle topic selection
  const handleSelectTopic = (topicName: string) => {
    if (selectedTopics.includes(topicName)) {
      return; // Already selected
    }

    const updatedTopics = [...selectedTopics, topicName];
    setSelectedTopics(updatedTopics);
    
    // Update filters with topic relevance
    onFilterChange({ 
      topic_relevance: {
        name: updatedTopics,
        weight: 0.5,
        threshold: 0.55
      }
    });
    
    // Clear search
    setSearchQuery('');
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Handle topic removal
  const handleRemoveTopic = (topicName: string) => {
    const updatedTopics = selectedTopics.filter(topic => topic !== topicName);
    setSelectedTopics(updatedTopics);
    
    // Update filters
    if (updatedTopics.length > 0) {
      onFilterChange({ 
        topic_relevance: {
          name: updatedTopics,
          weight: 0.5,
          threshold: 0.55
        }
      });
    } else {
      onFilterChange({ topic_relevance: undefined });
    }
  };

  // Clear all topics
  const clearAllTopics = () => {
    setSelectedTopics([]);
    onFilterChange({ topic_relevance: undefined });
  };

  // Clear search when component closes
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

  const hasTopics = selectedTopics.length > 0;

  return (
    <FilterComponent
      hasActiveFilters={hasTopics}
      icon={
        <div className="flex items-center">
          <IoDocumentTextOutline size={16} />
          <FaRobot size={10} className="ml-1" />
        </div>
      }
      title="Topics AI"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      selectedCount={ selectedTopics.length }
      colorTheme={colorTheme}
    >
      <div className="space-y-3">         
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-800">AI Topic Discovery</h3>
            
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
                      Enter topics and get AI generated results of creators who create content based on the entered topics
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {hasTopics && (
            <button
              onClick={clearAllTopics}
              className="text-purple-600 hover:text-purple-800 transition-colors"
              title="Clear all topics"
            >
              <IoClose size={16} />
            </button>
          )}
        </div>
        
        {/* Search Input */}
        <div className="space-y-2">
          <div className="relative" ref={dropdownRef}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={handleSearchChange}
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
                {searchResults.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-purple-50 transition-colors"
                    onClick={() => handleSelectTopic(topic.name)}
                    disabled={selectedTopics.includes(topic.name)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 font-medium">
                        {topic.name}
                      </span>
                      {selectedTopics.includes(topic.name) && (
                        <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    {topic.value && topic.value !== topic.name && (
                      <div className="text-xs text-gray-500 mt-1">
                        {topic.value}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {showDropdown && searchResults.length === 0 && searchQuery.length >= 2 && !isLoading && (
              <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  No topics found for "{searchQuery}"
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Topics */}
        {selectedTopics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-600">
              Selected Topics ({selectedTopics.length}):
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
              {selectedTopics.map((topicName) => (
                <div
                  key={topicName}
                  className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                >
                  <span className="font-medium max-w-28 truncate" title={topicName}>
                    {topicName}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTopic(topicName)}
                    className="ml-1.5 text-purple-600 hover:text-purple-800 transition-colors flex-shrink-0"
                    title="Remove topic"
                  >
                    <IoClose size={12} />
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

export default TopicsAI;