// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Account/LastPost.tsx

import React, { useState, useEffect } from 'react';
import { IoCalendarOutline, IoClose, IoChevronDown } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface LastPostProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
} 

interface TimeOption {
  label: string;
  value: string;
  days: number;
}

const LastPost: React.FC<LastPostProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter 
}) => {
  const [selectedOption, setSelectedOption] = useState<TimeOption | null>(null);

  // Time period options
  const timeOptions: TimeOption[] = [
    { label: '1 month ago', value: '1_month', days: 30 },
    { label: '2 months ago', value: '2_months', days: 60 },
    { label: '3 months ago', value: '3_months', days: 90 },
    { label: '4 months ago', value: '4_months', days: 120 },
    { label: '5 months ago', value: '5_months', days: 150 },
    { label: '6 months ago', value: '6_months', days: 180 },
  ];

  // Calculate timestamp from days ago
  const calculateTimestamp = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0); // Set to start of day
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  // Find matching option from timestamp
  const findOptionFromTimestamp = (timestamp: string): TimeOption | null => {
    if (!timestamp) return null;
    
    try {
      const filterDate = new Date(timestamp);
      const now = new Date();
      const diffTime = now.getTime() - filterDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Find closest matching option (with some tolerance)
      const matchingOption = timeOptions.find(option => 
        Math.abs(option.days - diffDays) <= 1
      );
      
      return matchingOption || null;
    } catch {
      return null;
    }
  };

  // Sync internal state with parent props
  useEffect(() => {
    if (filters.last_post_timestamp) {
      const matchingOption = findOptionFromTimestamp(filters.last_post_timestamp);
      setSelectedOption(matchingOption);
    } else {
      setSelectedOption(null);
    }
  }, [filters.last_post_timestamp]);

  const handleOptionSelect = (option: TimeOption) => {
    setSelectedOption(option);
    const timestamp = calculateTimestamp(option.days);
    onFilterChange({ last_post_timestamp: timestamp });
  };

  const clearSelection = () => {
    setSelectedOption(null);
    onFilterChange({ last_post_timestamp: undefined });
  };

  return (
    <FilterComponent
      hasActiveFilters={!!selectedOption}
      icon={<IoCalendarOutline size={18} />}
      title="Last Post"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className=""
    >
      <div className="space-y-3">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Posted After</h4>
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

        {/* Options Grid - 3 columns, 2 rows */}
        <div className="grid grid-cols-3 gap-2">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionSelect(option)}
              className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                selectedOption?.value === option.value
                  ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-purple-200 hover:bg-purple-25'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </FilterComponent>
  );
};

export default LastPost;