// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/CaptionKeyword.tsx
import React, { useState, useEffect, useRef } from 'react';
import { IoTextOutline, IoInformationCircleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface CaptionKeywordProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
          // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
}

const CaptionKeyword: React.FC<CaptionKeywordProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  const [keyword, setKeyword] = useState<string>(filters.description_keywords || '');
  const [inputValue, setInputValue] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const shouldUpdateParent = useRef<boolean>(false);

  // Initialize with existing filters
  useEffect(() => {
    if (filters.description_keywords !== undefined && filters.description_keywords !== keyword) {
      setKeyword(filters.description_keywords);
    }
  }, [filters.description_keywords]);

  // Handle clicks outside dropdown and tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle(); // Close when clicking outside
      }
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  // Debounced update to parent
  useEffect(() => {
    if (!shouldUpdateParent.current) return;

    const timer = setTimeout(() => {
      const trimmed = keyword.trim();
      onFilterChange({ description_keywords: trimmed || undefined });
      shouldUpdateParent.current = false;
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, onFilterChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const trimmedValue = inputValue.trim();
      shouldUpdateParent.current = true;
      setKeyword(trimmedValue);
      setInputValue('');
    }
  };

  const clearKeyword = () => {
    shouldUpdateParent.current = true;
    setKeyword('');
    setInputValue('');
    onFilterChange({ description_keywords: undefined });
  };

  // Clear tooltip when component closes
  useEffect(() => {
    if (!isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  return (
    <FilterComponent
      hasActiveFilters={!!keyword}
      icon={<IoTextOutline size={18} />}
      title="Caption Keywords"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className=''
      colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme'
    >
      <div className="space-y-3 relative" ref={dropdownRef}>
        
        {/* Header with Tooltip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-600">Caption Keywords</h4>
            
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
                      Filter creators by keywords that can be found in creator's posts captions.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          
          {/* Show input only when no keyword is set */}
          {!keyword && (
            <div className="relative">
              <input
                type="text"
                placeholder="Enter keyword and press Enter..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          )}
        </div>

        {/* Show selected keyword */}
        {keyword && (
          <div className="mt-2">
            <span className="text-xs text-gray-500">Filtering by keyword:</span>
            <div className="bg-purple-100 inline-flex items-center rounded-full px-3 py-1 mt-1">
              <span className="text-xs text-purple-800">{keyword}</span>
              <button
                onClick={clearKeyword}
                className="ml-2 text-purple-600 hover:text-purple-800 focus:outline-none"
              >
                &times;
              </button>
            </div>
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default CaptionKeyword;