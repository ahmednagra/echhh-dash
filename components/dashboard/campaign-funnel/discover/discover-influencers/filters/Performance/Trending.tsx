// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Performance/Trending.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IoTrendingUpOutline, IoClose, IoChevronDown } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface TrendingFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
        // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
}

interface TimeOption {
  label: string;
  value: number;
  months: number;
}

const Trending: React.FC<TrendingFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  const [selectedOption, setSelectedOption] = useState<TimeOption | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Local state for growth rate input
  const [growthRateInput, setGrowthRateInput] = useState<string>(
    filters?.follower_growth?.percentage_value?.toString() || '5'
  );

  // Time period options
  const timeOptions: TimeOption[] = [
    { label: '1 month', value: 1, months: 1 },
    { label: '2 months', value: 2, months: 2 },
    { label: '3 months', value: 3, months: 3 },
    { label: '4 months', value: 4, months: 4 },
    { label: '5 months', value: 5, months: 5 },
    { label: '6 months', value: 6, months: 6 },
  ];

  // Find matching option from filter
  const findOptionFromFilter = (interval: number): TimeOption | null => {
    if (!interval) return null;
    return timeOptions.find(option => option.value === interval) || null;
  };

  // Sync internal state with parent props
  useEffect(() => {
    if (filters?.follower_growth?.interval) {
      const matchingOption = findOptionFromFilter(filters.follower_growth.interval);
      setSelectedOption(matchingOption);
    } else {
      setSelectedOption(null);
    }
    
    if (filters?.follower_growth?.percentage_value) {
      setGrowthRateInput(filters.follower_growth.percentage_value.toString());
    }
  }, [filters?.follower_growth]);

  // Close dropdowns when filter closes
  useEffect(() => {
    if (!isOpen) {
      setOpenDropdown(null);
    }
  }, [isOpen]);

  const handleOptionSelect = (option: TimeOption) => {
    setSelectedOption(option);
    setOpenDropdown(null);
    
    const currentGrowth = filters?.follower_growth || {
      interval: option.value,
      interval_unit: "MONTH",
      operator: "GT",
      percentage_value: parseFloat(growthRateInput) || 5
    };

    onFilterChange({
      follower_growth: {
        ...currentGrowth,
        interval: option.value,
        interval_unit: "MONTH",
        operator: "GT"
      }
    });
  };

  // Handle growth rate input change
  const handleGrowthRateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGrowthRateInput(value);
    
    // Only update filter if value is a valid number and we have a selected period
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0 && selectedOption) {
      const currentGrowth = filters?.follower_growth || {
        interval: selectedOption.value,
        interval_unit: "MONTH",
        operator: "GT",
        percentage_value: numValue
      };

      onFilterChange({
        follower_growth: {
          ...currentGrowth,
          percentage_value: numValue,
          interval_unit: "MONTH",
          operator: "GT"
        }
      });
    } else if (value === '' && selectedOption) {
      // If rate is cleared but period is selected, just remove percentage
      onFilterChange({
        follower_growth: {
          interval: selectedOption.value,
          interval_unit: "MONTH",
          operator: "GT",
          percentage_value: 5 // Default back to 5%
        }
      });
    }
  };

  const clearSelection = () => {
    onFilterChange({ follower_growth: undefined });
    setSelectedOption(null);
    setGrowthRateInput('5');
    setOpenDropdown(null);
  };

  // Mini dropdown component
  const MiniDropdown: React.FC<{
    id: string;
    value: number | null;
    options: TimeOption[];
    onChange: (option: TimeOption) => void;
    placeholder: string;
  }> = ({ id, value, options, onChange, placeholder }) => {
    const isDropdownOpen = openDropdown === id;
    const selectedOption = options.find(opt => opt.value === value);

    const handleOptionClick = (option: TimeOption) => {
      onChange(option);
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
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors"
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
                  handleOptionClick(option);
                }}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-green-50 transition-colors ${
                  value === option.value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
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

  const hasFilter = filters?.follower_growth !== undefined;
  const hasActiveFilters = hasFilter;
  
  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoTrendingUpOutline size={18} />}
      title="Trending"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className=""
      colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme
    >
      <div className="space-y-3">
        {/* Header with clear button */}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-gray-800">Follower Growth</h4>
          </div>
          {selectedOption && (
            <button
              onClick={clearSelection}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              title="Clear selection"
            >
              <IoClose size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Single Row Layout - Period and Growth Rate */}
        <div className="grid grid-cols-2 gap-3">
          {/* Period Dropdown */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Period</label>
            <MiniDropdown
              id="growth-period"
              value={selectedOption?.value || null}
              options={timeOptions}
              onChange={handleOptionSelect}
              placeholder="Select period"
            />
          </div>

          {/* Growth Rate Input */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Growth Rate (%)</label>
            <input
              type="number"
              min="0"
              max="1000"
              step="0.1"
              value={growthRateInput}
              onChange={handleGrowthRateInputChange}
              placeholder="5"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 hover:border-gray-400 transition-colors"
            />
          </div>
        </div>
      </div>
    </FilterComponent>
  );
};

export default Trending;