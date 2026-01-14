// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Demographics/index.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IoChevronDown } from 'react-icons/io5';
import Location from './Location';
import Gender from './Gender';
import Language from './Language';
import Age from './Age';
import AudienceType from './AudienceType';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { CreatorLocationSelection } from '@/lib/types';
import { Platform } from '@/types/platform';

type DemographicsFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
  onCloseFilter: () => void;
  onUpdateContext?: (updates: {
    selectedCreatorLocations?: CreatorLocationSelection[];
    allFetchedLocations?: any[];
  }) => void;
  preservedLocations?: CreatorLocationSelection[];
  allFetchedLocations?: any[];
  selectedPlatform?: Platform | null;
};

const DemographicsFilters: React.FC<DemographicsFiltersProps> = ({
  searchParams,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen,
  onCloseFilter,
  onUpdateContext,
  preservedLocations = [],
  allFetchedLocations = [],
  selectedPlatform,
}) => {
  const [selectedLocations, setSelectedLocations] = useState<
    CreatorLocationSelection[]
  >([]);

  // Initialize with preserved locations or from searchParams
  useEffect(() => {
    if (preservedLocations && preservedLocations.length > 0) {
      setSelectedLocations(preservedLocations);
    } else if (
      searchParams.creator_locations &&
      searchParams.creator_locations.length > 0
    ) {
      const locationsFromParams = searchParams.creator_locations.map((id) => {
        const fetched = allFetchedLocations.find((loc) => loc.id === id);
        if (fetched) {
          return {
            id: fetched.id,
            name: fetched.name || fetched.display_name,
            display_name: fetched.display_name,
            type: fetched.type,
          };
        }

        return {
          id,
          name: `Location ${id}`,
          display_name: undefined,
          type: undefined,
        };
      });
      setSelectedLocations(locationsFromParams);
    }
  }, [searchParams.creator_locations, preservedLocations, allFetchedLocations]);

  // Clear local state when filters are cleared
  useEffect(() => {
    if (
      !searchParams.creator_locations ||
      searchParams.creator_locations.length === 0
    ) {
      setSelectedLocations([]);
    }
  }, [searchParams.creator_locations]);

  // Clear STATE/CITY type locations when switching to TikTok
  useEffect(() => {
    const isTikTok = selectedPlatform?.name?.toLowerCase() === 'tiktok';
    const isYoutube = selectedPlatform?.name?.toLowerCase() === 'youtube';
    const isRestrictedPlatform = isTikTok || isYoutube;

    if (
      isRestrictedPlatform &&
      searchParams.creator_locations &&
      searchParams.creator_locations.length > 0
    ) {
      // Filter out STATE and CITY type locations
      const countryOnlyLocations = selectedLocations.filter(
        (loc) => loc.type === 'COUNTRY',
      );

      if (countryOnlyLocations.length !== selectedLocations.length) {
        const countryOnlyIds = countryOnlyLocations.map((loc) => loc.id);
        onFilterChange({ creator_locations: countryOnlyIds });
        setSelectedLocations(countryOnlyLocations);

        if (onUpdateContext) {
          onUpdateContext({ selectedCreatorLocations: countryOnlyLocations });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, searchParams.creator_locations, allFetchedLocations]);

  const handleLocationSelect = useCallback(
    (locations: CreatorLocationSelection[]) => {
      setSelectedLocations(locations);

      setTimeout(() => {
        if (onUpdateContext) {
          onUpdateContext({ selectedCreatorLocations: locations });
        }
      }, 0);
    },
    [onUpdateContext],
  );

  return (
    <div className="grid grid-cols-4 gap-3">
      <Location
        selectedLocations={selectedLocations}
        onSelect={handleLocationSelect}
        isOpen={isFilterOpen('location')}
        onToggle={() => toggleFilterDropdown('location')}
        searchParams={searchParams}
        onFilterChange={onFilterChange}
        onCloseFilter={onCloseFilter}
        colorTheme="blue"
        onUpdateContext={onUpdateContext}
        allFetchedLocations={allFetchedLocations}
        selectedPlatform={selectedPlatform}
      />

      <Gender
        filters={searchParams}
        onFilterChange={onFilterChange}
        isOpen={isFilterOpen('gender')}
        onToggle={() => toggleFilterDropdown('gender')}
        onCloseFilter={onCloseFilter}
        colorTheme="blue"
      />

      <Language
        filters={searchParams}
        onFilterChange={onFilterChange}
        isOpen={isFilterOpen('language')}
        onToggle={() => toggleFilterDropdown('language')}
        onCloseFilter={onCloseFilter}
        colorTheme="blue"
      />

      <Age
        filters={searchParams}
        onFilterChange={onFilterChange}
        isOpen={isFilterOpen('age')}
        onToggle={() => toggleFilterDropdown('age')}
        onCloseFilter={onCloseFilter}
        colorTheme="blue"
      />

      <AudienceType
        filters={searchParams}
        onFilterChange={onFilterChange}
        isOpen={isFilterOpen('audienceType')}
        onToggle={() => toggleFilterDropdown('audienceType')}
        onCloseFilter={onCloseFilter}
        colorTheme="blue"
      />
    </div>
  );
};

export default DemographicsFilters;
