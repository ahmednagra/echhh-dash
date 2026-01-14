// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Demographics/Location.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IoLocationOutline,
  IoClose,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import {
  Location,
  LocationSearchResponse,
  CreatorLocationSelection,
} from '@/lib/types';
import {
  InfluencerSearchFilter,
  AudienceLocationsFilter,
} from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';

interface LocationFilterProps {
  selectedLocations: CreatorLocationSelection[];
  onSelect: (locations: CreatorLocationSelection[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  onCloseFilter: () => void;
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
  onUpdateContext?: (updates: {
    selectedCreatorLocations?: CreatorLocationSelection[];
    allFetchedLocations?: Location[];
  }) => void;
  allFetchedLocations?: Location[];
  selectedPlatform?: Platform | null; // ✅ ADD THIS
}

export default function LocationFilter({
  selectedLocations,
  onSelect,
  isOpen,
  onToggle,
  searchParams,
  onFilterChange,
  onCloseFilter,
  onUpdateContext,
  colorTheme = 'purple',
  allFetchedLocations: initialFetchedLocations = [],
  selectedPlatform, // ✅ ADD THIS
}: LocationFilterProps) {
  // Creator locations state
  const [creatorQuery, setCreatorQuery] = useState('');
  const [creatorLocations, setCreatorLocations] = useState<Location[]>([]);
  const [isCreatorLoading, setIsCreatorLoading] = useState(false);
  const [creatorError, setCreatorError] = useState<string | null>(null);
  const [selectedCreatorLocations, setSelectedCreatorLocations] = useState<
    CreatorLocationSelection[]
  >([]);

  // Audience locations state
  const [audienceQuery, setAudienceQuery] = useState('');
  const [audienceLocations, setAudienceLocations] = useState<Location[]>([]);
  const [isAudienceLoading, setIsAudienceLoading] = useState(false);
  const [audienceError, setAudienceError] = useState<string | null>(null);
  const [selectedAudienceLocations, setSelectedAudienceLocations] = useState<
    AudienceLocationsFilter[]
  >([]);
  const [audienceLocationDetails, setAudienceLocationDetails] = useState<
    Map<string, Location>
  >(new Map());
  // Common state - Initialize with passed prop
  const [allFetchedLocations, setAllFetchedLocations] = useState<Location[]>(
    initialFetchedLocations,
  );
  const isInitializedRef = useRef(false);
  const contextUpdateQueueRef = useRef<any>(null);

  // Update allFetchedLocations when prop changes (for persistence across collapses)
  useEffect(() => {
    if (
      initialFetchedLocations.length > 0 &&
      allFetchedLocations.length === 0
    ) {
      setAllFetchedLocations(initialFetchedLocations);
    }
  }, [initialFetchedLocations]);

  // Filter locations by platform - only COUNTRY for TikTok
  const filterLocationsByPlatform = useCallback(
    (locations: Location[]) => {
      const isTikTok = selectedPlatform?.name?.toLowerCase() === 'tiktok';
      const isYoutube = selectedPlatform?.name?.toLowerCase() === 'youtube';

      if (isTikTok || isYoutube) {
        return locations.filter((loc) => loc.type === 'COUNTRY');
      }

      return locations;
    },
    [selectedPlatform],
  );

  // Initialize from searchParams
  useEffect(() => {
    // Only run initialization once
    if (isInitializedRef.current) return;

    // Initialize creator locations
    if (
      searchParams.creator_locations &&
      searchParams.creator_locations.length > 0
    ) {
      const creatorLocs = searchParams.creator_locations.map((id) => {
        // First check in allFetchedLocations (includes persisted data)
        const fetchedLocation = allFetchedLocations.find(
          (loc) => loc.id === id,
        );
        if (fetchedLocation) {
          return {
            id: fetchedLocation.id,
            name: fetchedLocation.name,
            display_name: fetchedLocation.display_name,
            type: fetchedLocation.type,
          };
        }

        // Then check in selectedLocations passed from parent
        const existing = selectedLocations.find((loc) => loc.id === id);
        if (existing && !existing.name.startsWith('Location ')) {
          return existing;
        }

        // Fallback
        return {
          id,
          name: `Location ${id}`,
          display_name: undefined,
          type: undefined,
        };
      });

      setSelectedCreatorLocations(creatorLocs);

      // Queue context update for next tick
      setTimeout(() => {
        if (onUpdateContext) {
          onUpdateContext({
            selectedCreatorLocations: creatorLocs,
            allFetchedLocations: allFetchedLocations,
          });
        }
      }, 0);

      isInitializedRef.current = true;
    }

    // Initialize audience locations
    if (
      searchParams.audience_locations &&
      searchParams.audience_locations.length > 0
    ) {
      setSelectedAudienceLocations(searchParams.audience_locations);
    }
  }, []);

  useEffect(() => {
    // Initialize audience location details if we have them in allFetchedLocations
    if (
      searchParams.audience_locations &&
      searchParams.audience_locations.length > 0
    ) {
      const newDetails = new Map<string, Location>();
      searchParams.audience_locations.forEach((audienceLoc) => {
        const found = allFetchedLocations.find(
          (loc) => loc.id === audienceLoc.location_id,
        );
        if (found) {
          newDetails.set(audienceLoc.location_id, found);
        }
      });
      if (newDetails.size > 0) {
        setAudienceLocationDetails(newDetails);
      }
    }
  }, [searchParams.audience_locations, allFetchedLocations]);
  const fetchLocations = useCallback(
    async (
      query: string,
      setLocations: (locations: Location[]) => void,
      setLoading: (loading: boolean) => void,
      setError: (error: string | null) => void,
    ) => {
      if (query.length < 2) {
        setLocations([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchParams = new URLSearchParams({
          search_string: query.trim(),
          limit: '20',
          offset: '0',
        });

        const response = await fetch(
          `/api/v0/discover/locations?${searchParams}`,
        );
        const result: LocationSearchResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error?.message || `HTTP ${response.status} error`,
          );
        }

        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch locations');
        }

        const fetchedLocations = result.data || [];

        // ✅ APPLY PLATFORM FILTER
        const filteredLocations = filterLocationsByPlatform(fetchedLocations);
        setLocations(filteredLocations);

        setAllFetchedLocations((prev) => {
          const newLocations = fetchedLocations.filter(
            (newLoc: Location) =>
              !prev.some((prevLoc) => prevLoc.id === newLoc.id),
          );
          const updated = [...prev, ...newLocations];

          contextUpdateQueueRef.current = { allFetchedLocations: updated };

          return updated;
        });
      } catch (error) {
        console.error('Error fetching locations:', error);
        setError(
          error instanceof Error ? error.message : 'Failed to fetch locations',
        );
        setLocations([]);
      } finally {
        setLoading(false);
      }
    },
    [filterLocationsByPlatform],
  ); // ✅ ADD DEPENDENCY

  // Debounced fetch for creator locations
  useEffect(() => {
    if (!isOpen) return; // Don't fetch if dropdown is closed

    const debounceTimer = setTimeout(() => {
      fetchLocations(
        creatorQuery,
        setCreatorLocations,
        setIsCreatorLoading,
        setCreatorError,
      );
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [creatorQuery, isOpen, fetchLocations]);

  // Debounced fetch for audience locations
  useEffect(() => {
    if (!isOpen) return; // Don't fetch if dropdown is closed

    const debounceTimer = setTimeout(() => {
      fetchLocations(
        audienceQuery,
        setAudienceLocations,
        setIsAudienceLoading,
        setAudienceError,
      );
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [audienceQuery, isOpen, fetchLocations]);

  // Creator location handlers with proper async handling
  const toggleCreatorLocation = useCallback(
    (location: Location) => {
      const isSelected = selectedCreatorLocations.some(
        (loc) => loc.id === location.id,
      );

      let updatedSelections: CreatorLocationSelection[];

      if (isSelected) {
        updatedSelections = selectedCreatorLocations.filter(
          (loc) => loc.id !== location.id,
        );
      } else {
        const newSelection: CreatorLocationSelection = {
          id: location.id,
          name: location.name,
          display_name: location.display_name,
          type: location.type,
        };
        updatedSelections = [...selectedCreatorLocations, newSelection];
      }

      // Update local state immediately
      setSelectedCreatorLocations(updatedSelections);
      onSelect(updatedSelections);

      // Defer ALL parent updates to prevent render cycle issues
      setTimeout(() => {
        // Update filter
        const creatorLocationIds = updatedSelections.map((loc) => loc.id);
        onFilterChange({ creator_locations: creatorLocationIds });

        // Update context
        if (onUpdateContext) {
          onUpdateContext({
            selectedCreatorLocations: updatedSelections,
            allFetchedLocations: allFetchedLocations,
          });
        }
      }, 0);
    },
    [
      selectedCreatorLocations,
      onSelect,
      onFilterChange,
      onUpdateContext,
      allFetchedLocations,
    ],
  );

  const removeCreatorLocation = useCallback(
    (id: string) => {
      const updatedSelections = selectedCreatorLocations.filter(
        (loc) => loc.id !== id,
      );

      // Update local state immediately
      setSelectedCreatorLocations(updatedSelections);
      onSelect(updatedSelections);

      // Defer parent updates
      setTimeout(() => {
        const creatorLocationIds = updatedSelections.map((loc) => loc.id);
        onFilterChange({ creator_locations: creatorLocationIds });

        if (onUpdateContext) {
          onUpdateContext({
            selectedCreatorLocations: updatedSelections,
            allFetchedLocations: allFetchedLocations,
          });
        }
      }, 0);
    },
    [
      selectedCreatorLocations,
      onSelect,
      onFilterChange,
      onUpdateContext,
      allFetchedLocations,
    ],
  );

  // Audience location handlers
  const toggleAudienceLocation = useCallback(
    (location: Location) => {
      const isSelected = selectedAudienceLocations.some(
        (loc) => loc.location_id === location.id,
      );

      let updatedSelections: AudienceLocationsFilter[];

      if (isSelected) {
        updatedSelections = selectedAudienceLocations.filter(
          (loc) => loc.location_id !== location.id,
        );
        // Remove from details map
        setAudienceLocationDetails((prev) => {
          const newMap = new Map(prev);
          newMap.delete(location.id);
          return newMap;
        });
      } else {
        const currentTotal = selectedAudienceLocations.reduce(
          (sum, loc) => sum + loc.percentage_value,
          0,
        );
        const defaultPercentage = Math.min(20, Math.max(1, 100 - currentTotal));

        const newSelection: AudienceLocationsFilter = {
          location_id: location.id,
          percentage_value: defaultPercentage,
        };
        updatedSelections = [...selectedAudienceLocations, newSelection];

        // Store location details
        setAudienceLocationDetails((prev) => {
          const newMap = new Map(prev);
          newMap.set(location.id, location);
          return newMap;
        });
      }

      setSelectedAudienceLocations(updatedSelections);

      // Defer parent update
      setTimeout(() => {
        onFilterChange({ audience_locations: updatedSelections });

        // Also update context with audience location details
        if (onUpdateContext) {
          const allLocs = [...allFetchedLocations];
          // Add audience location to allFetchedLocations if not already there
          if (!allLocs.find((loc) => loc.id === location.id)) {
            allLocs.push(location);
          }
          onUpdateContext({
            allFetchedLocations: allLocs,
            selectedCreatorLocations: selectedCreatorLocations,
          });
        }
      }, 0);
    },
    [
      selectedAudienceLocations,
      selectedCreatorLocations,
      allFetchedLocations,
      onFilterChange,
      onUpdateContext,
    ],
  );

  // Clear STATE/CITY type selections when switching to TikTok
  useEffect(() => {
    const isTikTok = selectedPlatform?.name?.toLowerCase() === 'tiktok';
    const isYoutube = selectedPlatform?.name?.toLowerCase() === 'youtube';

    if ((isTikTok || isYoutube) && selectedCreatorLocations.length > 0) {
      const countryOnly = selectedCreatorLocations.filter(
        (loc) => loc.type === 'COUNTRY',
      );

      if (countryOnly.length !== selectedCreatorLocations.length) {
        setSelectedCreatorLocations(countryOnly);
        onSelect(countryOnly);

        setTimeout(() => {
          const countryOnlyIds = countryOnly.map((loc) => loc.id);
          onFilterChange({ creator_locations: countryOnlyIds });

          if (onUpdateContext) {
            onUpdateContext({
              selectedCreatorLocations: countryOnly,
              allFetchedLocations: allFetchedLocations,
            });
          }
        }, 0);
      }
    }
  }, [selectedPlatform]);

  useEffect(() => {
    // Reset local state when searchParams are cleared
    if (
      !searchParams.creator_locations ||
      searchParams.creator_locations.length === 0
    ) {
      setSelectedCreatorLocations([]);
    }
    if (
      !searchParams.audience_locations ||
      searchParams.audience_locations.length === 0
    ) {
      setSelectedAudienceLocations([]);
    }
  }, [searchParams.creator_locations, searchParams.audience_locations]);

  const removeAudienceLocation = useCallback(
    (id: string) => {
      const updatedSelections = selectedAudienceLocations.filter(
        (loc) => loc.location_id !== id,
      );
      setSelectedAudienceLocations(updatedSelections);

      // Remove from details map
      setAudienceLocationDetails((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });

      // Defer parent update
      setTimeout(() => {
        onFilterChange({ audience_locations: updatedSelections });
      }, 0);
    },
    [selectedAudienceLocations, onFilterChange],
  );

  const updateAudiencePercentage = useCallback(
    (id: string, percentage: number) => {
      const validPercentage = Math.min(100, Math.max(1, percentage));

      setSelectedAudienceLocations((prev) => {
        const updatedSelections = prev.map((loc) =>
          loc.location_id === id
            ? { ...loc, percentage_value: validPercentage }
            : loc,
        );

        // Defer the parent update to prevent render cycle error
        setTimeout(() => {
          onFilterChange({ audience_locations: updatedSelections });
        }, 0);

        return updatedSelections;
      });
    },
    [onFilterChange],
  );

  // Get location name by ID
  const getLocationNameById = useCallback(
    (id: string): string => {
      // Check audience location details first
      const audienceLocation = audienceLocationDetails.get(id);
      if (audienceLocation) {
        return audienceLocation.display_name || audienceLocation.name;
      }

      // Then check allFetchedLocations
      const location =
        allFetchedLocations.find((loc) => loc.id === id) ||
        selectedCreatorLocations.find((loc) => loc.id === id);
      return location?.display_name || location?.name || `Location ${id}`;
    },
    [allFetchedLocations, selectedCreatorLocations, audienceLocationDetails],
  );

  // Calculate audience total percentage
  const audienceTotalPercentage = selectedAudienceLocations.reduce(
    (sum, loc) => sum + loc.percentage_value,
    0,
  );

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      // Clear search states when closing
      setCreatorQuery('');
      setAudienceQuery('');
      setCreatorLocations([]);
      setAudienceLocations([]);
      setCreatorError(null);
      setAudienceError(null);
    }
  }, [isOpen]);

  const totalSelectedCount =
    selectedCreatorLocations.length + selectedAudienceLocations.length;
  const hasActiveFilters = totalSelectedCount > 0;

  return (
    <FilterComponent
      hasActiveFilters={hasActiveFilters}
      icon={<IoLocationOutline size={18} />}
      title="Location"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
      selectedCount={totalSelectedCount}
      colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme
    >
      {/* Empty content to prevent default padding/content */}
      <div className="hidden"></div>

      {/* Compact dropdown - positioned to extend right */}
      <div className="absolute left-0 top-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-[500px]">
        <div className="flex gap-3 p-4">
          {/* Creator Locations Section */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h3 className="text-xs font-semibold text-gray-800">
                Creator Locations
              </h3>
            </div>

            {/* Creator Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search creator locations..."
                value={creatorQuery}
                onChange={(e) => setCreatorQuery(e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-400 transition-colors"
              />
              {isCreatorLoading && (
                <div className="absolute right-2 top-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-purple-600"></div>
                </div>
              )}
            </div>

            {/* Creator Error Message */}
            {creatorError && (
              <div className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
                {creatorError}
              </div>
            )}

            {/* Creator Search Results */}
            <div className="max-h-32 overflow-y-auto">
              {creatorQuery.length >= 2 && !creatorError && (
                <div className="space-y-1">
                  {isCreatorLoading ? (
                    <div className="text-xs text-gray-500 px-2 py-1 text-center">
                      Searching...
                    </div>
                  ) : creatorLocations.length > 0 ? (
                    creatorLocations.slice(0, 6).map((location) => (
                      <label
                        key={location.id}
                        className="flex items-center p-1.5 hover:bg-purple-50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCreatorLocations.some(
                            (loc) => loc.id === location.id,
                          )}
                          onChange={() => toggleCreatorLocation(location)}
                          className="form-checkbox h-3 w-3 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                        />
                        <div className="ml-2 text-xs text-gray-700 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {location.display_name || location.name}
                          </div>
                          {location.type && (
                            <div className="text-xs text-gray-500 capitalize">
                              {location.type.toLowerCase()}
                            </div>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 px-2 py-1 text-center">
                      No locations found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Creator Locations */}
            {selectedCreatorLocations.length > 0 && (
              <div className="border-t border-gray-200 pt-2">
                <h4 className="text-xs font-medium text-gray-600 mb-1">
                  Selected ({selectedCreatorLocations.length}):
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {selectedCreatorLocations.map((location) => (
                    <span
                      key={location.id}
                      className="inline-flex items-center text-xs bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full"
                    >
                      <span
                        className="max-w-28 truncate"
                        title={location.display_name || location.name}
                      >
                        {location.display_name || location.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCreatorLocation(location.id);
                        }}
                        className="ml-1.5 text-purple-600 hover:text-purple-800 flex-shrink-0"
                        title="Remove location"
                      >
                        <IoClose size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="w-px bg-gray-200"></div>

          {/* Audience Locations Section */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h3 className="text-xs font-semibold text-gray-800">
                Audience Locations
              </h3>
            </div>

            {/* Audience Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search audience locations..."
                value={audienceQuery}
                onChange={(e) => setAudienceQuery(e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400 transition-colors"
              />
              {isAudienceLoading && (
                <div className="absolute right-2 top-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Audience Error Message */}
            {audienceError && (
              <div className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
                {audienceError}
              </div>
            )}

            {/* Audience Search Results */}
            <div className="max-h-32 overflow-y-auto">
              {audienceQuery.length >= 2 && !audienceError && (
                <div className="space-y-1">
                  {isAudienceLoading ? (
                    <div className="text-xs text-gray-500 px-2 py-1 text-center">
                      Searching...
                    </div>
                  ) : audienceLocations.length > 0 ? (
                    audienceLocations.slice(0, 6).map((location) => (
                      <label
                        key={location.id}
                        className="flex items-center p-1.5 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAudienceLocations.some(
                            (loc) => loc.location_id === location.id,
                          )}
                          onChange={() => toggleAudienceLocation(location)}
                          className="form-checkbox h-3 w-3 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <div className="ml-2 text-xs text-gray-700 flex-1">
                          <div className="font-medium text-gray-900 truncate">
                            {location.display_name || location.name}
                          </div>
                          {location.type && (
                            <div className="text-xs text-gray-500 capitalize">
                              {location.type.toLowerCase()}
                            </div>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 px-2 py-1 text-center">
                      No locations found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Audience Locations */}
            {selectedAudienceLocations.length > 0 && (
              <div className="border-t border-gray-200 pt-2">
                <h4 className="text-xs font-medium text-gray-600 mb-1">
                  Selected ({selectedAudienceLocations.length}):
                </h4>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {selectedAudienceLocations.map((audienceLocation) => (
                    <div
                      key={audienceLocation.location_id}
                      className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <span
                        className="text-xs text-blue-800 flex-1 truncate font-medium max-w-[140px]"
                        title={getLocationNameById(
                          audienceLocation.location_id,
                        )}
                      >
                        {getLocationNameById(audienceLocation.location_id)}
                      </span>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={audienceLocation.percentage_value}
                          onChange={(e) =>
                            updateAudiencePercentage(
                              audienceLocation.location_id,
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-12 text-xs text-center border border-blue-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        />
                        <span className="text-xs text-blue-600 font-medium">
                          %
                        </span>
                        <button
                          onClick={() =>
                            removeAudienceLocation(audienceLocation.location_id)
                          }
                          className="ml-1 text-blue-600 hover:text-blue-800 flex-shrink-0 p-0.5"
                          title="Remove location"
                        >
                          <IoClose size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FilterComponent>
  );
}
