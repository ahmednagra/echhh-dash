// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Performance/ReelsPlays.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IoPlayOutline, IoClose, IoChevronDown } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import {
  InfluencerSearchFilter,
  NumericRange,
} from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';

interface ReelsPlaysProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
  selectedPlatform?: Platform | null; // ✅ ADD THIS
}

const ReelsPlays: React.FC<ReelsPlaysProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter,
  colorTheme = 'purple',
  selectedPlatform, // ✅ ADD THIS
}) => {
  // ✅ ADD THESE 3 LINES - Dynamic logic based on platform
  const isInstagram = selectedPlatform?.name
    ?.toLowerCase()
    .includes('instagram');
  const filterKey = isInstagram
    ? 'instagram_options.reel_views'
    : 'average_views';
  const displayLabel = isInstagram ? 'Reel Views' : 'Average Views';

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Predefined views options
  const VIEWS_OPTIONS = [
    { value: 100, label: '100' },
    { value: 500, label: '500' },
    { value: 1000, label: '1K' },
    { value: 2000, label: '2K' },
    { value: 5000, label: '5K' },
    { value: 10000, label: '10K' },
    { value: 20000, label: '20K' },
    { value: 50000, label: '50K' },
    { value: 100000, label: '100K' },
    { value: 200000, label: '200K' },
    { value: 500000, label: '500K' },
    { value: 1000000, label: '1M' },
    { value: 2000000, label: '2M' },
    { value: 5000000, label: '5M' },
    { value: 10000000, label: '10M' },
  ];

  // Close dropdowns when filter closes
  useEffect(() => {
    if (!isOpen) {
      setOpenDropdown(null);
    }
  }, [isOpen]);

  // ✅ UPDATED - Handle min/max changes dynamically
  const handleViewsChange = (type: 'min' | 'max', value: number | null) => {
    console.log(`handleViewsChange: ${type} = ${value}`);

    // Get current filter value based on platform
    const currentViews = isInstagram
      ? filters?.instagram_options?.reel_views
      : filters?.average_views;

    // If clearing a value and only one exists, clear the entire filter
    if (value === null) {
      if (type === 'min' && currentViews?.max === undefined) {
        clearFilter();
        return;
      }
      if (type === 'max' && currentViews?.min === undefined) {
        clearFilter();
        return;
      }
    }

    // Create the new filter object
    let newViews: NumericRange | undefined;

    if (type === 'min') {
      if (value !== null) {
        newViews = {
          min: value,
          max: currentViews?.max || 10000000,
        };
      } else {
        if (currentViews?.max !== undefined) {
          newViews = {
            min: 0,
            max: currentViews.max,
          };
        }
      }
    } else {
      if (value !== null) {
        newViews = {
          min: currentViews?.min || 0,
          max: value,
        };
      } else {
        if (currentViews?.min !== undefined) {
          newViews = {
            min: currentViews.min,
            max: 10000000,
          };
        }
      }
    }

    console.log('New views:', newViews);

    // ✅ UPDATED - Apply filter based on platform
    if (isInstagram) {
      onFilterChange({
        instagram_options: {
          ...filters?.instagram_options,
          reel_views: newViews,
        },
      });
    } else {
      onFilterChange({
        average_views: newViews,
      } as any);
    }

    setOpenDropdown(null);
  };

  // ✅ UPDATED - Clear filter dynamically
  const clearFilter = () => {
    console.log(`Clearing ${filterKey} filter`);

    if (isInstagram) {
      onFilterChange({
        instagram_options: {
          ...filters?.instagram_options,
          reel_views: undefined,
        },
      });
    } else {
      onFilterChange({
        average_views: undefined,
      } as any);
    }
    setOpenDropdown(null);
  };

  // ✅ UPDATED - Get current filter value dynamically
  const currentViews = isInstagram
    ? filters?.instagram_options?.reel_views
    : filters?.average_views;

  const hasFilter = currentViews !== undefined;

  // Get available options based on current selection
  const getMinOptions = () => {
    const maxValue = currentViews?.max;
    if (maxValue === undefined) {
      return VIEWS_OPTIONS;
    }
    return VIEWS_OPTIONS.filter((opt) => opt.value < maxValue);
  };

  const getMaxOptions = () => {
    const minValue = currentViews?.min;
    const options = minValue
      ? VIEWS_OPTIONS.filter((opt) => opt.value > minValue)
      : VIEWS_OPTIONS;

    return [
      { value: 10000000, label: 'No Limit', isSpecial: true },
      ...options.filter((opt) => opt.value < 10000000),
    ];
  };

  // Mini dropdown component
  const MiniDropdown: React.FC<{
    id: string;
    value: number | undefined;
    options: { value: number; label: string; isSpecial?: boolean }[];
    onChange: (value: number) => void;
    placeholder: string;
  }> = ({ id, value, options, onChange, placeholder }) => {
    const isDropdownOpen = openDropdown === id;
    const selectedOption = options.find((opt) => opt.value === value);

    const handleOptionClick = (optionValue: number) => {
      console.log(`MiniDropdown ${id}: selecting value ${optionValue}`);
      onChange(optionValue);
    };

    return (
      <div className="relative">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`MiniDropdown ${id}: toggle dropdown`);
            setOpenDropdown(isDropdownOpen ? null : id);
          }}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span
              className={selectedOption ? 'text-gray-900' : 'text-gray-500'}
            >
              {selectedOption
                ? selectedOption.value === 10000000 && selectedOption.isSpecial
                  ? 'No Limit'
                  : selectedOption.label
                : placeholder}
            </span>
            <IoChevronDown
              size={14}
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOptionClick(option.value);
                }}
                className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                  option.isSpecial
                    ? 'bg-gray-50 text-blue-600 hover:bg-blue-50 border-b border-gray-200 font-medium'
                    : value === option.value
                      ? 'bg-purple-50 text-purple-700 font-medium hover:bg-purple-100'
                      : 'text-gray-700 hover:bg-purple-50'
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

  const hasActiveFilters = hasFilter;

  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoPlayOutline size={18} />}
      title={displayLabel} // ✅ CHANGED - Dynamic title
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      selectedCount={0}
      colorTheme={colorTheme}
    >
      <div className="space-y-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-800">
              {displayLabel}
            </h3>{' '}
            {/* ✅ CHANGED */}
          </div>
          {hasFilter && (
            <button
              onClick={clearFilter}
              className="text-purple-600 hover:text-purple-800 transition-colors"
              title={`Clear ${displayLabel.toLowerCase()} filter`} // ✅ CHANGED
            >
              <IoClose size={16} />
            </button>
          )}
        </div>

        {/* Select Fields */}
        <div className="grid grid-cols-2 gap-3">
          {/* Min Field */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Minimum</label>
            <MiniDropdown
              id={`${filterKey}-min`} // ✅ CHANGED - Dynamic ID
              value={currentViews?.min}
              options={getMinOptions()}
              onChange={(value) => handleViewsChange('min', value)}
              placeholder="min"
            />
          </div>

          {/* Max Field */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Maximum</label>
            <MiniDropdown
              id={`${filterKey}-max`} // ✅ CHANGED - Dynamic ID
              value={currentViews?.max}
              options={getMaxOptions()}
              onChange={(value) => handleViewsChange('max', value)}
              placeholder="max"
            />
          </div>
        </div>
      </div>
    </FilterComponent>
  );
};

export default ReelsPlays;
