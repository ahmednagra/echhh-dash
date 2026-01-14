// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Performance/Engagements.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IoHeartOutline, IoChevronDown, IoClose } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, NumericRange, EngagementRate } from '@/lib/creator-discovery-types';

interface EngagementsFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
        // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
}

// Predefined engagement count options
const ENGAGEMENT_OPTIONS = [
  { value: 100, label: '100' },
  { value: 500, label: '500' },
  { value: 1000, label: '1K' },
  { value: 2500, label: '2.5K' },
  { value: 5000, label: '5K' },
  { value: 10000, label: '10K' },
  { value: 25000, label: '25K' },
  { value: 50000, label: '50K' },
  { value: 100000, label: '100K' },
  { value: 250000, label: '250K' },
  { value: 500000, label: '500K' },
  { value: 1000000, label: '1M+' }
];

const Engagements: React.FC<EngagementsFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Local state for engagement rate input
  const [engagementRateInput, setEngagementRateInput] = useState<string>(
    filters?.engagement_rate?.percentage_value || '1'
  );

  // Sync local state with filters
  useEffect(() => {
    if (filters?.engagement_rate?.percentage_value) {
      setEngagementRateInput(filters.engagement_rate.percentage_value);
    }
  }, [filters?.engagement_rate?.percentage_value]);

  // Close dropdowns when filter closes
  useEffect(() => {
    if (!isOpen) {
      setOpenDropdown(null);
    }
  }, [isOpen]);

  // Handle total engagements changes
  const handleTotalEngagementsChange = (type: 'min' | 'max', value: number) => {
    const currentRange = filters?.total_engagements || { min: 100, max: 100000 };
    const newRange = {
      ...currentRange,
      [type]: value
    };
    
    onFilterChange({
      total_engagements: newRange
    });
  };

  // Handle engagement rate input change
  const handleEngagementRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEngagementRateInput(value);
    
    // Only update filter if value is a valid number
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onFilterChange({
        engagement_rate: {
          percentage_value: value
        }
      });
    } else if (value === '') {
      // Clear filter if input is empty
      onFilterChange({
        engagement_rate: undefined
      });
    }
  };

  // Clear filters
  const clearAllFilters = () => {
    onFilterChange({ 
      total_engagements: undefined,
      engagement_rate: undefined 
    });
    setEngagementRateInput('1');
    setOpenDropdown(null);
  };

  // Mini dropdown component
  const MiniDropdown: React.FC<{
    id: string;
    value: number | string;
    options: { value: number | string; label: string }[];
    onChange: (value: number | string) => void;
    placeholder: string;
  }> = ({ id, value, options, onChange, placeholder }) => {
    const isDropdownOpen = openDropdown === id;
    const selectedOption = options.find(opt => opt.value === value);

    const handleOptionClick = (optionValue: number | string) => {
      onChange(optionValue);
      setOpenDropdown(null);
    };

    return (
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpenDropdown(isDropdownOpen ? null : id);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <IoChevronDown 
              size={14} 
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOptionClick(option.value);
                }}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-purple-50 transition-colors ${
                  value === option.value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const hasTotalEngagements = filters?.total_engagements !== undefined;
  const hasEngagementRate = filters?.engagement_rate !== undefined;
  const hasActiveFilters = hasTotalEngagements || hasEngagementRate;

  // Get available options based on current selection
  const getMinOptions = () => {
    const maxValue = filters?.total_engagements?.max || 1000000;
    return ENGAGEMENT_OPTIONS.filter(opt => (opt.value as number) < maxValue);
  };

  const getMaxOptions = () => {
    const minValue = filters?.total_engagements?.min || 100;
    return ENGAGEMENT_OPTIONS.filter(opt => (opt.value as number) > minValue);
  };
  
  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoHeartOutline size={18} />}
      title="Engagements"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className=""
      colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme'
    >
      <div className="space-y-3">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-800">Total Engagements</h4>
            </div>
            {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              title="Clear all filters"
            >
              <IoClose size={14} />
              Clear
            </button>
          )}
          </div>

        {/* Single Row Layout - Min, Max, Rate */}
        <div className="grid grid-cols-3 gap-3">
          {/* Engagement Rate Input */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Rate (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={engagementRateInput}
              onChange={handleEngagementRateInputChange}
              placeholder="1"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors"
            />
          </div>
          
          {/* Minimum Engagements */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Minimum</label>
            <MiniDropdown
              id="engagements-min"
              value={filters?.total_engagements?.min || 100}
              options={getMinOptions()}
              onChange={(value) => handleTotalEngagementsChange('min', value as number)}
              placeholder="Min"
            />
          </div>

          {/* Maximum Engagements */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Maximum</label>
            <MiniDropdown
              id="engagements-max"
              value={filters?.total_engagements?.max || 100000}
              options={getMaxOptions()}
              onChange={(value) => handleTotalEngagementsChange('max', value as number)}
              placeholder="Max"
            />
          </div>
        </div>
      </div>
    </FilterComponent>
  );
};

export default Engagements;