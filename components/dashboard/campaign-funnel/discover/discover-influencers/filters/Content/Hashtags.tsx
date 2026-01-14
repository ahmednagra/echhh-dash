// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/Hashtags.tsx
import React, { useState, useEffect, useRef } from 'react';
import { IoDocumentTextOutline, IoClose, IoInformationCircleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, HashtagFilter } from '@/lib/creator-discovery-types';

interface HashtagsFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
          // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
}

const Hashtags: React.FC<HashtagsFilterProps> = ({ 
  filters, 
  onFilterChange, 
  isOpen, 
  onToggle,
  onCloseFilter,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<HashtagFilter[]>(
    filters.hashtags || []
  );
  const [showTooltip, setShowTooltip] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Initialize with existing filters
  useEffect(() => {
    if (filters.hashtags) {
      const areArraysDifferent =
        filters.hashtags.length !== selectedHashtags.length ||
        filters.hashtags.some(hashtag => 
          !selectedHashtags.find(selected => selected.name === hashtag.name)
        );

      if (areArraysDifferent) {
        setSelectedHashtags(filters.hashtags);
      }
    }
  }, [filters.hashtags]);

  // Handle click outside for tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  // Close tooltip when main dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    } else if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  // Add hashtag function
  const addHashtag = () => {
    if (!inputValue.trim()) return;

    // Clean hashtag (remove # if present and trim whitespace)
    const cleanHashtag = inputValue.trim().replace(/^#/, '');
    
    // Validate hashtag (basic validation)
    if (cleanHashtag.length === 0) return;
    
    // Check if already selected
    const alreadySelected = selectedHashtags.some(hashtag => 
      hashtag.name.toLowerCase() === cleanHashtag.toLowerCase()
    );
    
    if (alreadySelected) {
      setInputValue('');
      return;
    }

    const newHashtag: HashtagFilter = {
      name: cleanHashtag
    };

    const updatedHashtags = [...selectedHashtags, newHashtag];
    setSelectedHashtags(updatedHashtags);
    onFilterChange({ hashtags: updatedHashtags });
    
    // Clear input
    setInputValue('');
  };

  // Remove hashtag from selected list
  const handleRemoveHashtag = (hashtagName: string) => {
    const updatedHashtags = selectedHashtags.filter(hashtag => hashtag.name !== hashtagName);
    setSelectedHashtags(updatedHashtags);
    onFilterChange({ hashtags: updatedHashtags.length > 0 ? updatedHashtags : undefined });
  };

  // Clear all hashtags
  const clearAllHashtags = () => {
    setSelectedHashtags([]);
    onFilterChange({ hashtags: undefined });
  };

  // Clear input when component closes
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    } else {
      // Focus input when component opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const hasHashtags = selectedHashtags.length > 0;

  return (
    <div ref={wrapperRef}>
      <FilterComponent
        hasActiveFilters={hasHashtags}
        icon={<IoDocumentTextOutline size={16} />}
        title="Hashtags"
        isOpen={isOpen}
        onClose={onCloseFilter}
        onToggle={onToggle}
        className="border border-gray-200 rounded-md"
        selectedCount={selectedHashtags.length}
        colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme
      >
        <div className="space-y-3">         
          {/* Header with tooltip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-800">Add Hashtags</h3>
              
              {/* Info Icon with Tooltip */}
              <div className="relative" ref={tooltipRef}>
                <button
                  type="button"
                  className="text-gray-400 hover:text-green-500 transition-colors"
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
                        Shows creators who have mentioned the added hashtags in their posts. 
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {hasHashtags && (
              <button
                onClick={clearAllHashtags}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Clear all hashtags"
              >
                <IoClose size={16} />
              </button>
            )}
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type hashtag and press Enter..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-400 transition-colors"
              />
            </div>
          </div>

          {/* Selected Hashtags */}
          {selectedHashtags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-gray-600">
                Selected Hashtags ({selectedHashtags.length}):
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {selectedHashtags.map((hashtag) => (
                  <div
                    key={hashtag.name}
                    className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                  >
                    <span className="text-green-600 mr-1">#</span>
                    <span className="font-medium max-w-28 truncate" title={hashtag.name}>
                      {hashtag.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(hashtag.name)}
                      className="ml-1.5 text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
                      title="Remove hashtag"
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
    </div>
  );
};

export default Hashtags;