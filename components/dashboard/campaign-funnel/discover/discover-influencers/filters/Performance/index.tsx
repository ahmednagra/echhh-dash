// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Performance/index.tsx
import React from 'react';
import { IoChevronDown } from 'react-icons/io5';
import Followers from './Followers';
import Engagements from './Engagements';
import Trending from './Trending';
import ReelsPlays from './ReelsPlays';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';

type PerformanceFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
  onCloseFilter: () => void;
  selectedPlatform?: Platform | null;
};

const PerformanceFilters: React.FC<PerformanceFiltersProps> = ({
  searchParams,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen,
  onCloseFilter,
  selectedPlatform,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <Followers
        filters={searchParams}
        onFilterChange={onFilterChange}
        isOpen={isFilterOpen('followers')}
        onToggle={() => toggleFilterDropdown('followers')}
        onCloseFilter={onCloseFilter}
        colorTheme="emerald"
        selectedPlatform={selectedPlatform}
      />
      <Trending
        filters={searchParams}
        onFilterChange={onFilterChange}
        isOpen={isFilterOpen('trending')}
        onToggle={() => toggleFilterDropdown('trending')}
        onCloseFilter={onCloseFilter}
        colorTheme="emerald"
      />
      <Engagements
        filters={searchParams}
        onFilterChange={onFilterChange}
        isOpen={isFilterOpen('engagements')}
        onToggle={() => toggleFilterDropdown('engagements')}
        onCloseFilter={onCloseFilter}
        colorTheme="emerald"
      />
      {/* ✅ REMOVED CONDITIONAL - Now always visible, label changes dynamically */}
      <ReelsPlays
        filters={searchParams}
        onFilterChange={onFilterChange}
        isOpen={isFilterOpen('reelsPlays')}
        onToggle={() => toggleFilterDropdown('reelsPlays')}
        onCloseFilter={onCloseFilter}
        colorTheme="emerald"
        selectedPlatform={selectedPlatform} // ✅ ADD THIS
      />
    </div>
  );
};

export default PerformanceFilters;
