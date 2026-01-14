// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/index.tsx
import React from 'react';
import { IoChevronDown } from 'react-icons/io5';
import BioPhrase from './BioPhrase';
import TopicsAI from './TopicsAI';
import Hashtags from './Hashtags';
import LookalikeAI from './LookalikeAI';
import Mentions from './Mentions';
import Interests from './Interests';
import CaptionKeyword from './CaptionKeyword';
import Partnerships from './Partnerships';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { isFilterAvailable } from '@/utils/filter-utils';
import { Platform } from '@/types/platform';

type ContentFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
  onCloseFilter: () => void;
  selectedPlatform?: Platform | null; // ADD
};

const ContentFilters: React.FC<ContentFiltersProps> = ({
  searchParams,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen,
  onCloseFilter,
  selectedPlatform, // ✅ ADD THIS PARAMETER
}) => {
  return (
    <>
      {/* First Row - 4 filters */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <BioPhrase
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('bioPhrase')}
          onToggle={() => toggleFilterDropdown('bioPhrase')}
          onCloseFilter={onCloseFilter}
          colorTheme="orange"
        />

        <TopicsAI
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('topicsAI')}
          onToggle={() => toggleFilterDropdown('topicsAI')}
          onCloseFilter={onCloseFilter}
          colorTheme="orange"
        />

        <LookalikeAI
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('lookalikeAI')}
          onToggle={() => toggleFilterDropdown('lookalikeAI')}
          onCloseFilter={onCloseFilter}
          colorTheme="orange"
        />

        <Hashtags
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('hashtags')}
          onToggle={() => toggleFilterDropdown('hashtags')}
          onCloseFilter={onCloseFilter}
          colorTheme="orange"
        />
      </div>

      {/* Second Row - 4 remaining filters */}
      <div className="grid grid-cols-4 gap-3">
        <CaptionKeyword
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('captionKeyword')}
          onToggle={() => toggleFilterDropdown('captionKeyword')}
          onCloseFilter={onCloseFilter}
          colorTheme="orange"
        />

        {/* // Wrap Interests and Partnerships */}
        {isFilterAvailable(selectedPlatform?.name, 'content', 'interests') && (
          <Interests
            filters={searchParams}
            onFilterChange={onFilterChange}
            isOpen={isFilterOpen('interests')}
            onToggle={() => toggleFilterDropdown('interests')}
            onCloseFilter={onCloseFilter}
            colorTheme="orange"
          />
        )}
        <Mentions
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('mentions')}
          onToggle={() => toggleFilterDropdown('mentions')}
          onCloseFilter={onCloseFilter}
          colorTheme="orange"
        />
        {isFilterAvailable(
          selectedPlatform?.name,
          'content',
          'partnerships',
        ) && (
          <Partnerships
            filters={searchParams}
            onFilterChange={onFilterChange}
            isOpen={isFilterOpen('partnerships')}
            onToggle={() => toggleFilterDropdown('partnerships')}
            onCloseFilter={onCloseFilter}
            colorTheme="orange"
          />
        )}
      </div>
    </>
  );
};

export default ContentFilters;
