// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Demographics/Age.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IoTimeOutline, IoChevronDown, IoClose } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, AudienceAgeFilter, NumericRange } from '@/lib/creator-discovery-types';

interface AgeFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
      // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
}

// Predefined age ranges
const AGE_OPTIONS = [
  { value: 13, label: '13' },
  { value: 18, label: '18' },
  { value: 25, label: '25' },
  { value: 35, label: '35' },
  { value: 45, label: '45' },
  { value: 55, label: '55' },
  { value: 65, label: '65+' },
];

// Percentage options for audience age
const PERCENTAGE_OPTIONS = [
  { value: 1, label: '>1%' },
  { value: 5, label: '>5%' },
  { value: 10, label: '>10%' },
  { value: 15, label: '>15%' },
  { value: 20, label: '>20%' },
  { value: 25, label: '>25%' },
  { value: 30, label: '>30%' },
  { value: 35, label: '>35%' },
  { value: 40, label: '>40%' },
  { value: 45, label: '>45%' },
  { value: 50, label: '>50%' },
  { value: 55, label: '>55%' },
  { value: 60, label: '>60%' },
  { value: 65, label: '>65%' },
  { value: 70, label: '>70%' },
  { value: 75, label: '>75%' },
  { value: 80, label: '>80%' },
  { value: 85, label: '>85%' },
  { value: 90, label: '>90%' },
  { value: 95, label: '>95%' }
];

const Age: React.FC<AgeFilterProps> = ({ 
  filters, 
  onFilterChange, 
  isOpen, 
  onToggle,
  onCloseFilter,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close dropdowns when age filter closes
  useEffect(() => {
    if (!isOpen) {
      setOpenDropdown(null);
    }
  }, [isOpen]);

  // Creator age handlers
  const handleCreatorAgeChange = (type: 'min' | 'max', value: number) => {
    const currentAge = filters.creator_age || { min: 0, max: 0 };
    onFilterChange({
      creator_age: {
        ...currentAge,
        [type]: value
      }
    });
  };

  const clearCreatorAge = () => {
    onFilterChange({ creator_age: undefined });
  };

  // Audience age handlers
  const handleAudienceAgeChange = (type: 'min' | 'max' | 'percentage_value', value: number) => {
    const currentAge = filters.audience_age || { min: 0, max: 0, percentage_value: 0 };
    onFilterChange({
      audience_age: {
        ...currentAge,
        [type]: value
      }
    });
  };

  const clearAudienceAge = () => {
    onFilterChange({ audience_age: undefined });
  };

  // Mini dropdown component
  const MiniDropdown: React.FC<{
    id: string;
    value?: number;
    options: { value: number; label: string }[];
    onChange: (value: number) => void;
    placeholder: string;
  }> = ({ id, value, options, onChange, placeholder }) => {
    const isOpen = openDropdown === id;
    const selectedOption = value !== undefined ? options.find(opt => opt.value === value) : undefined;

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <IoChevronDown 
              size={14} 
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpenDropdown(null);
                }}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${
                  value === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
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

  const hasCreatorAge = filters.creator_age !== undefined;
  const hasAudienceAge = filters.audience_age !== undefined;
  const selectedCount = (hasCreatorAge ? 1 : 0) + (hasAudienceAge ? 1 : 0);

  const hasActiveFilters = hasCreatorAge || hasAudienceAge;
  
  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoTimeOutline size={18} />}
      title="Age"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme
      // selectedCount={selectedCount}
    >
      <div className="space-y-4">
        
        {/* Audience Age Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-800">Audience</h4>
            </div>
            {hasAudienceAge && (
              <button
                onClick={clearAudienceAge}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Clear audience age filter"
              >
                <IoClose size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MiniDropdown
              id="audience-percentage"
              value={filters.audience_age?.percentage_value}
              options={PERCENTAGE_OPTIONS}
              onChange={(value) => handleAudienceAgeChange('percentage_value', value)}
              placeholder=">%"
            />
            <MiniDropdown
              id="audience-min"
              value={filters.audience_age?.min}
              options={AGE_OPTIONS.filter(opt => 
                !filters.audience_age?.max || opt.value < filters.audience_age.max
              )}
              onChange={(value) => handleAudienceAgeChange('min', value)}
              placeholder="Min"
            />
            <MiniDropdown
              id="audience-max"
              value={filters.audience_age?.max}
              options={AGE_OPTIONS.filter(opt => 
                !filters.audience_age?.min || opt.value > filters.audience_age.min
              )}
              onChange={(value) => handleAudienceAgeChange('max', value)}
              placeholder="Max"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Influencer Age Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-800">Influencer</h4>
            </div>
            {hasCreatorAge && (
              <button
                onClick={clearCreatorAge}
                className="text-purple-600 hover:text-purple-800 transition-colors"
                title="Clear influencer age filter"
              >
                <IoClose size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MiniDropdown
              id="creator-min"
              value={filters.creator_age?.min}
              options={AGE_OPTIONS.filter(opt => 
                !filters.creator_age?.max || opt.value < filters.creator_age.max
              )}
              onChange={(value) => handleCreatorAgeChange('min', value)}
              placeholder="Min"
            />
            <MiniDropdown
              id="creator-max"
              value={filters.creator_age?.max}
              options={AGE_OPTIONS.filter(opt => 
                !filters.creator_age?.min || opt.value > filters.creator_age.min
              )}
              onChange={(value) => handleCreatorAgeChange('max', value)}
              placeholder="Max"
            />
          </div>
        </div>

      </div>
    </FilterComponent>
  );
};

export default Age;