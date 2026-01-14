// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Demographics/Gender.tsx
import React from 'react';
import { IoPersonOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, CreatorGenderType, AudienceGenderType, AudienceGenderFilter } from '@/lib/creator-discovery-types';

interface GenderFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
    // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
}

const Gender: React.FC<GenderFilterProps> = ({ 
  filters, 
  onFilterChange, 
  isOpen, 
  onToggle,
  onCloseFilter,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  // Creator gender options
  const creatorGenderOptions: { value: CreatorGenderType | 'ANY'; label: string }[] = [
    { value: 'ANY', label: 'Any' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'MALE', label: 'Male' },
    { value: 'GENDER_NEUTRAL', label: 'Gender Neutral' },
    { value: 'ORGANIZATION', label: 'Organization' },
    { value: 'MALE_OR_FEMALE', label: 'Male or Female' }
  ];

  // Audience gender options
  const audienceGenderOptions: { value: AudienceGenderType | 'ANY'; label: string }[] = [
    { value: 'ANY', label: 'Any' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' }
  ];

  // Handle creator gender change
  const handleCreatorGenderChange = (value: CreatorGenderType | 'ANY') => {
    onFilterChange({
      creator_gender: value === 'ANY' ? undefined : value as CreatorGenderType
    });
  };

  // Handle audience gender change
  const handleAudienceGenderChange = (value: AudienceGenderType | 'ANY') => {
    if (value === 'ANY') {
      onFilterChange({ audience_gender: undefined });
    } else {
      onFilterChange({
        audience_gender: {
          type: value as AudienceGenderType,
          operator: 'GT',
          percentage_value: filters.audience_gender?.percentage_value || 50
        }
      });
    }
  };

  // Handle audience percentage change
  const handleAudiencePercentageChange = (percentage: number) => {
    if (filters.audience_gender) {
      onFilterChange({
        audience_gender: {
          ...filters.audience_gender,
          operator: 'GT',
          percentage_value: Math.min(100, Math.max(1, percentage))
        }
      });
    }
  };

  // Get current selections
  const selectedCreatorGender = filters.creator_gender || 'ANY';
  const selectedAudienceGender = filters.audience_gender?.type || 'ANY';

  // Calculate active state for FilterComponent (simplified)
  const hasActiveFilters = selectedCreatorGender !== 'ANY' || selectedAudienceGender !== 'ANY';


  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoPersonOutline size={18} />}
      title="Gender"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      selectedCount={0} // No count
      colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme
    >
      {/* Empty content to prevent default padding/content */}
      <div className="hidden"></div>
      
      {/* Compact dropdown content */}
      <div className="absolute left-0 top-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[500px]">
        <div className="flex gap-4 p-4">
          
          {/* Creator Gender Section */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h3 className="text-xs font-semibold text-gray-800">Creator Gender</h3>
            </div>
            
            <div className="space-y-1">
              {creatorGenderOptions.map((option) => (
                <label 
                  key={option.value}
                  className={`flex items-center p-0.5 rounded cursor-pointer transition-colors ${
                    selectedCreatorGender === option.value
                      ? 'bg-purple-100 border border-purple-200'
                      : 'hover:bg-purple-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="creator_gender"
                    value={option.value}
                    checked={selectedCreatorGender === option.value}
                    onChange={() => handleCreatorGenderChange(option.value)}
                    className="form-radio h-3 w-3 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <span className={`ml-2 text-xs ${
                    selectedCreatorGender === option.value 
                      ? 'text-purple-800 font-medium' 
                      : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-gray-200"></div>

          {/* Audience Gender Section */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-xs font-semibold text-gray-800">Audience Gender</h3>
            </div>
            
            <div className="space-y-1">
              {audienceGenderOptions.map((option) => (
                <label 
                  key={option.value}
                  className={`flex items-center p-0.5 rounded cursor-pointer transition-colors ${
                    selectedAudienceGender === option.value
                      ? 'bg-blue-100 border border-blue-200'
                      : 'hover:bg-blue-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="audience_gender"
                    value={option.value}
                    checked={selectedAudienceGender === option.value}
                    onChange={() => handleAudienceGenderChange(option.value)}
                    className="form-radio h-3 w-3 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className={`ml-2 text-xs ${
                    selectedAudienceGender === option.value 
                      ? 'text-blue-800 font-medium' 
                      : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Audience Percentage Input */}
            {selectedAudienceGender !== 'ANY' && filters.audience_gender && (
              <div className="border-t border-gray-200 pt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Min Percentage
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={filters.audience_gender.percentage_value}
                    onChange={(e) => handleAudiencePercentageChange(parseInt(e.target.value) || 1)}
                    className="w-20 text-xs text-center border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                  <span className="text-xs text-blue-600 font-medium">%</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </FilterComponent>
  );
};

export default Gender;