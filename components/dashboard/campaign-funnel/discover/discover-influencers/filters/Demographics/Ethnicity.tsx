// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Demographics/Ethnicity.tsx
import React from 'react';
import { IoEarthOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { useFilterClickOutside } from '@/hooks/useClickOutside';

interface EthnicityFilterProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Ethnicity: React.FC<EthnicityFilterProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle
}) => {
  const ethnicityOptions = [
    { code: '', name: 'Any Ethnicity' },
    { code: 'AFRICAN', name: 'African' },
    { code: 'ASIAN', name: 'Asian' },
    { code: 'CAUCASIAN', name: 'White/Caucasian' },
    { code: 'HISPANIC', name: 'Hispanic' },
    { code: 'BLACK', name: 'Black' },
    { code: 'MIXED', name: 'Mixed' },
    { code: 'OTHER', name: 'Other' }
  ];

  const percentageOptions = Array.from({ length: 18 }, (_, i) => (i + 1) * 5);

  const handleEthnicityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // const selectedCode = e.target.value;
    // const currentWeight = filters.audience_race?.weight || 0;

    // onFilterChange({
    //   audience_race: {
    //     code: selectedCode,
    //     weight: selectedCode ? currentWeight || 0.3 : 0
    //   }
    // });
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // const percentage = parseInt(e.target.value || '0');
    // onFilterChange({
    //   audience_race: {
    //     ...filters.audience_race,
    //     weight: percentage / 100
    //   }
    // });
  };

  return (
    <FilterComponent
      icon={<IoEarthOutline size={18} />}
      title="Ethnicity"
      isOpen={isOpen}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
    >
      <div className="space-y-3 p-3">
        {/* Ethnicity Dropdown */}
        <select
          // value={filters.audience_race?.code || ''}
          onChange={handleEthnicityChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          {ethnicityOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>

        {/* Percentage Threshold Dropdown */}
        <select
          // value={filters.audience_race?.weight ? Math.round(filters.audience_race.weight * 100) : ''}
          onChange={handlePercentageChange}
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Any percentage</option>
          {percentageOptions.map((percent) => (
            <option key={percent} value={percent}>
              &gt;{percent}% of audience
            </option>
          ))}
        </select>

        {/* Display Current Filter */}
        {/* {filters.audience_race?.code && (
          <div className="text-xs text-purple-600 mt-2">
            Filtering: {ethnicityOptions.find(o => o.code === filters.audience_race?.code)?.name}
            {filters.audience_race?.weight
              ? ` (>${Math.round(filters.audience_race.weight * 100)}% audience)`
              : ''}
          </div>
        )} */}
      </div>
    </FilterComponent>
  );
};

export default Ethnicity;
