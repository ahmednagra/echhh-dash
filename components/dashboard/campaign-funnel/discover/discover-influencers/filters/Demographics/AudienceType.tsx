// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Demographics/AudienceType.tsx
import React from 'react';
import { IoPeopleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, AudienceSource } from '@/lib/creator-discovery-types';
import { useFilterClickOutside } from '@/hooks/useClickOutside';

type AudienceTypeProps = {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
      // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
};

// Display label → Value to pass in audience_source
const AUDIENCE_SOURCE_OPTIONS: { label: string; value: AudienceSource; description?: string }[] = [
  { label: 'Any', value: 'ANY', description: 'All audience types' },
  { label: 'Engaged',  value: 'LIKERS', description: 'Users who like posts' },
  { label: 'Followers',  value: 'FOLLOWERS', description: 'Account followers' },
  { label: 'Commenters',  value: 'COMMENTERS', description: 'Users who comments'},
];

const AudienceType: React.FC<AudienceTypeProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter,
  colorTheme = 'purple' // ADD THIS LINE - Default value  
}) => {
  const handleChange = (value: AudienceSource) => {
    onFilterChange({
      audience_source: value
    });
  };

  const hasActiveFilters = filters.audience_source && filters.audience_source !== 'ANY';
  
  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoPeopleOutline size={18} />}
      title="Audience Type"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme'
    >
      {/* Radio Options */}
      <div className="space-y-1">
        {AUDIENCE_SOURCE_OPTIONS.map(({ label, value, description }) => (
          <label 
            key={value} 
            className="flex items-start p-0.5 hover:bg-green-50 rounded-lg cursor-pointer transition-colors group"
          >
            <input
              type="radio"
              name="audience_source"
              value={value}
              checked={filters.audience_source === value}
              onChange={() => handleChange(value)}
              className="form-radio h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500 mt-0.5"
            />
            <div className="ml-3 flex-1">
              <div className="text-sm font-medium text-gray-900">
                {label} {description && (
                <span className="text-xs text-gray-500">
                  ({description})
                </span>
              )}
              </div>
            </div>
          </label>
        ))}
      </div>
    </FilterComponent>
  );
};

export default AudienceType;