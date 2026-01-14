"use client";
// src/components/dashboard/campaign-funnel/discover/discover-influencers/DiscoverFilters.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BsInstagram } from 'react-icons/bs';
import {
  IoChevronDown,
  IoChevronUp,
  IoClose,
  IoFilterOutline,
} from 'react-icons/io5';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { Platform } from '@/types/platform';
import { useClickOutside } from '@/hooks/useClickOutside';
import { CreatorLocationSelection } from '@/lib/types';

// Import utility functions
import {
  getActiveFilters,
  removeFilter,
  getActiveFilterCounts,
  hasActiveFilters,
  FilterContext,
} from '@/utils/filter-utils';

// Import filter section components
import DemographicsFilters from './filters/Demographics';
import PerformanceFilters from './filters/Performance';
import ContentFilters from './filters/Content';
import AccountFilters from './filters/Account';

type DiscoverFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  onApplyFilters: (appliedFilters: Partial<InfluencerSearchFilter>) => void;
  onClear: () => void;
  // Platform props
  platforms?: Platform[];
  selectedPlatform?: Platform | null;
  onPlatformChange?: (platform: Platform) => void;
  isLoadingPlatforms?: boolean;
  // Filter context for displaying names instead of counts
  filterContext?: FilterContext;
};

export default function DiscoverFilters({
  searchParams,
  onFilterChange,
  onApplyFilters,
  onClear,
  platforms = [],
  selectedPlatform = null,
  onPlatformChange,
  isLoadingPlatforms = false,
  filterContext = {},
}: DiscoverFiltersProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  console.log('searchParams: ', searchParams);
  // State to track pending filter changes before applying
  const [pendingFilters, setPendingFilters] = useState<
    Partial<InfluencerSearchFilter>
  >({});

  // State to track which filter dropdown is open
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  // State to track which sections are collapsed - Default all collapsed except Demographics
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(['performance', 'content', 'account']),
  );

  // Platform dropdown states
  const [isPlatformDropdownOpen, setIsPlatformDropdownOpen] = useState(false);
  const [platformSearchQuery, setPlatformSearchQuery] = useState<string>('');

  // Define popular platforms that should appear first
  const POPULAR_PLATFORMS = [
    'instagram',
    'tiktok',
    'youtube',
    'twitter',
    'facebook',
  ];
  const updateQueueRef = useRef<any>(null);
  // Professional click outside handling - one hook per dropdown
  const platformDropdownRef = useClickOutside<HTMLDivElement>(
    () => setIsPlatformDropdownOpen(false),
    isPlatformDropdownOpen,
  );

  // ESC key handling (this is still good practice)
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenFilterId(null);
        setIsPlatformDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Handle filter changes by updating pending filters
  const handlePendingFilterChange = (
    updates: Partial<InfluencerSearchFilter>,
  ) => {
    setPendingFilters((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Toggle section collapse
  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
        // Close any open filter dropdowns in the collapsed section
        setOpenFilterId(null);
      }
      return newSet;
    });
  };

  // Check if section is collapsed
  const isSectionCollapsed = (sectionId: string) => {
    return collapsedSections.has(sectionId);
  };

  // Handle platform selection
  const handlePlatformSelect = (platform: Platform) => {
    if (onPlatformChange) {
      onPlatformChange(platform);
      // Also update the search params for the current filter session
      handlePendingFilterChange({
        work_platform_id: platform.work_platform_id,
      });
    }
    setIsPlatformDropdownOpen(false);
    setPlatformSearchQuery(''); // Reset search when selecting
  };

  // Function to get popular platforms
  const getPopularPlatforms = () => {
    return platforms
      .filter(
        (platform) =>
          platform.status === 'ACTIVE' &&
          POPULAR_PLATFORMS.some((popular) =>
            platform.name.toLowerCase().includes(popular),
          ),
      )
      .sort((a, b) => {
        // Sort by popularity order
        const aIndex = POPULAR_PLATFORMS.findIndex((popular) =>
          a.name.toLowerCase().includes(popular),
        );
        const bIndex = POPULAR_PLATFORMS.findIndex((popular) =>
          b.name.toLowerCase().includes(popular),
        );
        return aIndex - bIndex;
      });
  };

  // Function to get filtered platforms based on search
  const getFilteredPlatforms = () => {
    if (!platformSearchQuery.trim()) {
      return getPopularPlatforms();
    }

    return platforms.filter(
      (platform) =>
        platform.status === 'ACTIVE' &&
        (platform.name
          .toLowerCase()
          .includes(platformSearchQuery.toLowerCase()) ||
          platform.description
            ?.toLowerCase()
            .includes(platformSearchQuery.toLowerCase())),
    );
  };

  // Function to get other platforms (non-popular ones)
  const getOtherPlatforms = () => {
    const popularPlatforms = getPopularPlatforms();
    const popularIds = popularPlatforms.map((p) => p.id);

    return platforms.filter(
      (platform) =>
        platform.status === 'ACTIVE' && !popularIds.includes(platform.id),
    );
  };

  // Apply all pending filters when button is clicked
  const applyFilters = async () => {
    if (Object.keys(pendingFilters).length > 0) {
      setIsApplying(true);
      try {
        await onApplyFilters(pendingFilters);
        setPendingFilters({});
        setOpenFilterId(null); // Close any open dropdowns
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setIsApplying(false);
      }
    }
  };

  // MODIFIED: Clear all filters without triggering API call
  const clearAllFilters = () => {
    console.log('🧹 Clearing all filters...');

    setIsClearing(true);

    try {
      // Clear all local states immediately
      setPendingFilters({});
      setOpenFilterId(null);
      setSearchQuery('');
      setPlatformSearchQuery('');

      // IMPORTANT: Clear preserved location data
      setPreservedLocationData({
        selectedCreatorLocations: [],
        allFetchedLocations: [],
      });

      // Reset section collapse states to default (only demographics expanded)
      setCollapsedSections(new Set(['performance', 'content', 'account']));

      // Call the parent's clear function
      onClear();

      console.log('✅ All filters cleared');
    } catch (error) {
      console.error('❌ Error clearing filters:', error);
    } finally {
      setIsClearing(false);
    }
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = (filterId: string) => {
    setOpenFilterId((prev) => (prev === filterId ? null : filterId));
  };

  // Check if a filter dropdown is open
  const isFilterOpen = (filterId: string) => {
    return openFilterId === filterId;
  };

  // Combine current searchParams with pending changes for display
  const getDisplayFilters = (): InfluencerSearchFilter => {
    return {
      ...searchParams,
      ...pendingFilters,
    };
  };

  const displayFilters = getDisplayFilters();

  // Common style for filter buttons
  const filterButtonStyle =
    'flex justify-between items-center w-full bg-white text-gray-700 px-4 py-3 rounded-full border border-gray-200 hover:border-gray-300 focus:outline-none';

  // Check if there are any pending changes
  const hasPendingChanges = Object.keys(pendingFilters).length > 0;

  // Add state to preserve location data across collapses
  const [preservedLocationData, setPreservedLocationData] = useState<{
    selectedCreatorLocations: CreatorLocationSelection[];
    allFetchedLocations: any[];
  }>({
    selectedCreatorLocations: [],
    allFetchedLocations: [],
  });

  // Get platform icon based on platform name
  const getPlatformIcon = (platform: Platform) => {
    if (platform.logo_url) {
      return (
        <img
          src={platform.logo_url}
          alt={platform.name}
          className="w-5 h-5 object-contain"
          onError={(e) => {
            // Fallback to default icon if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }

    // Fallback icons based on platform name
    switch (platform.name.toLowerCase()) {
      case 'instagram':
        return <BsInstagram className="text-pink-500" size={20} />;
      case 'tiktok':
        return <div className="w-5 h-5 bg-black rounded-sm" />; // Simple TikTok icon
      default:
        return <div className="w-5 h-5 bg-gray-400 rounded-sm" />; // Generic icon
    }
  };

  // Merge preserved data with context for active filters
  const enhancedFilterContext = {
    ...filterContext,
    selectedCreatorLocations:
      preservedLocationData.selectedCreatorLocations.length > 0
        ? preservedLocationData.selectedCreatorLocations
        : (filterContext as any).selectedCreatorLocations || [],
    allFetchedLocations:
      preservedLocationData.allFetchedLocations.length > 0
        ? preservedLocationData.allFetchedLocations
        : (filterContext as any).allFetchedLocations || [],
  };

  // Use utility functions for active filters with context
  const activeFilters = getActiveFilters(
    searchParams,
    pendingFilters,
    enhancedFilterContext,
  );
  const filterCounts = getActiveFilterCounts(
    searchParams,
    pendingFilters,
    enhancedFilterContext,
  );

  console.log('activeFilters: ', activeFilters, pendingFilters, searchParams);
  // Remove specific filter using utility function
  const handleRemoveFilter = (filterKey: string) => {
    const updatedFilters = removeFilter(filterKey, pendingFilters);
    setPendingFilters(updatedFilters);
  };

  const FILTER_SECTION_IDS = [
    'demographics',
    'performance',
    'content',
    'account',
  ];

  const areAllSectionsCollapsed = () => {
    return FILTER_SECTION_IDS.every((id) => collapsedSections.has(id));
  };

  const areAllSectionsExpanded = () => {
    return FILTER_SECTION_IDS.every((id) => !collapsedSections.has(id));
  };

  const handleExpandCollapseAll = () => {
    setCollapsedSections((prev) => {
      if (areAllSectionsCollapsed()) {
        // Expand all
        return new Set();
      } else {
        // Collapse all
        return new Set(FILTER_SECTION_IDS);
      }
    });
  };

  useEffect(() => {
    if (filterContext) {
      // Initialize from parent context if available
      if ((filterContext as any).selectedCreatorLocations) {
        setPreservedLocationData((prev) => ({
          ...prev,
          selectedCreatorLocations: (filterContext as any)
            .selectedCreatorLocations,
        }));
      }
      if ((filterContext as any).allFetchedLocations) {
        setPreservedLocationData((prev) => ({
          ...prev,
          allFetchedLocations: (filterContext as any).allFetchedLocations,
        }));
      }
    }
  }, []);

  // Update the handler to preserve data
  const handleUpdateFilterContext = useCallback(
    (updates: any) => {
      // Use setTimeout to defer state updates
      setTimeout(() => {
        // Preserve location data
        if (updates.selectedCreatorLocations || updates.allFetchedLocations) {
          setPreservedLocationData((prev) => ({
            selectedCreatorLocations:
              updates.selectedCreatorLocations || prev.selectedCreatorLocations,
            allFetchedLocations:
              updates.allFetchedLocations || prev.allFetchedLocations,
          }));
        }

        // Pass to parent context if available
        if (
          filterContext &&
          typeof filterContext === 'object' &&
          'onUpdateContext' in filterContext
        ) {
          (filterContext as any).onUpdateContext(updates);
        }
      }, 0);
    },
    [filterContext],
  );

  useEffect(() => {
    if (updateQueueRef.current) {
      const updates = updateQueueRef.current;
      updateQueueRef.current = null;

      // Process the updates after render
      const timeoutId = setTimeout(() => {
        // Preserve location data
        if (updates.selectedCreatorLocations || updates.allFetchedLocations) {
          setPreservedLocationData((prev) => ({
            selectedCreatorLocations:
              updates.selectedCreatorLocations || prev.selectedCreatorLocations,
            allFetchedLocations:
              updates.allFetchedLocations || prev.allFetchedLocations,
          }));
        }

        // Pass to parent context if available
        if (
          filterContext &&
          typeof filterContext === 'object' &&
          'onUpdateContext' in filterContext
        ) {
          (filterContext as any).onUpdateContext(updates);
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [filterContext]); // Add this dependency

  // Updated Section Header Component with distinct colors
  const SectionHeader: React.FC<{
    title: string;
    sectionId: string;
    description?: string;
    activeCount?: number;
  }> = ({ title, sectionId, description, activeCount = 0 }) => {
    const isCollapsed = isSectionCollapsed(sectionId);
    const [showTooltip, setShowTooltip] = useState(false);

    // Get section-specific colors
    const getSectionColors = (sectionId: string, isCollapsed: boolean) => {
      const colorSchemes = {
        demographics: {
          collapsed: {
            bg: 'bg-blue-50/50 hover:bg-blue-100/50',
            border: 'border-blue-200/50',
            title: 'text-blue-700 group-hover:text-blue-900',
            icon: 'text-blue-400 hover:text-blue-600',
            chevron: 'text-blue-400 group-hover:text-blue-600',
            indicator: activeCount > 0 ? 'bg-blue-400' : 'bg-gray-300',
            badge: 'bg-blue-100 text-blue-700',
          },
          expanded: {
            bg: 'bg-blue-100/50 hover:bg-blue-150/50',
            border: 'border-blue-300/50',
            title: 'text-blue-800 group-hover:text-blue-900',
            icon: 'text-blue-500 hover:text-blue-700',
            chevron: 'text-blue-600',
            indicator: 'bg-blue-500',
            badge: 'bg-white/80 text-blue-800',
          },
        },
        performance: {
          collapsed: {
            bg: 'bg-emerald-50/50 hover:bg-emerald-100/50',
            border: 'border-emerald-200/50',
            title: 'text-emerald-700 group-hover:text-emerald-900',
            icon: 'text-emerald-400 hover:text-emerald-600',
            chevron: 'text-emerald-400 group-hover:text-emerald-600',
            indicator: activeCount > 0 ? 'bg-emerald-400' : 'bg-gray-300',
            badge: 'bg-emerald-100 text-emerald-700',
          },
          expanded: {
            bg: 'bg-emerald-100/50 hover:bg-emerald-150/50',
            border: 'border-emerald-300/50',
            title: 'text-emerald-800 group-hover:text-emerald-900',
            icon: 'text-emerald-500 hover:text-emerald-700',
            chevron: 'text-emerald-600',
            indicator: 'bg-emerald-500',
            badge: 'bg-white/80 text-emerald-800',
          },
        },
        content: {
          collapsed: {
            bg: 'bg-orange-50/50 hover:bg-orange-100/50',
            border: 'border-orange-200/50',
            title: 'text-orange-700 group-hover:text-orange-900',
            icon: 'text-orange-400 hover:text-orange-600',
            chevron: 'text-orange-400 group-hover:text-orange-600',
            indicator: activeCount > 0 ? 'bg-orange-400' : 'bg-gray-300',
            badge: 'bg-orange-100 text-orange-700',
          },
          expanded: {
            bg: 'bg-orange-100/50 hover:bg-orange-150/50',
            border: 'border-orange-300/50',
            title: 'text-orange-800 group-hover:text-orange-900',
            icon: 'text-orange-500 hover:text-orange-700',
            chevron: 'text-orange-600',
            indicator: 'bg-orange-500',
            badge: 'bg-white/80 text-orange-800',
          },
        },
        account: {
          collapsed: {
            bg: 'bg-purple-50/50 hover:bg-purple-100/50',
            border: 'border-purple-200/50',
            title: 'text-purple-700 group-hover:text-purple-900',
            icon: 'text-purple-400 hover:text-purple-600',
            chevron: 'text-purple-400 group-hover:text-purple-600',
            indicator: activeCount > 0 ? 'bg-purple-400' : 'bg-gray-300',
            badge: 'bg-purple-100 text-purple-700',
          },
          expanded: {
            bg: 'bg-purple-100/50 hover:bg-purple-150/50',
            border: 'border-purple-300/50',
            title: 'text-purple-800 group-hover:text-purple-900',
            icon: 'text-purple-500 hover:text-purple-700',
            chevron: 'text-purple-600',
            indicator: 'bg-purple-500',
            badge: 'bg-white/80 text-purple-800',
          },
        },
      };

      const scheme = colorSchemes[sectionId as keyof typeof colorSchemes];
      return isCollapsed ? scheme.collapsed : scheme.expanded;
    };

    const colors = getSectionColors(sectionId, isCollapsed);

    return (
      <div
        data-section-header
        className={`w-full flex items-center justify-between p-3 text-left transition-all duration-200 group border rounded-t-lg cursor-pointer ${
          isCollapsed
            ? `${colors.border} ${colors.bg} rounded-b-lg`
            : `${colors.border} ${colors.bg}`
        }`}
        onClick={() => toggleSectionCollapse(sectionId)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3
              className={`text-base font-semibold transition-colors ${colors.title}`}
            >
              {title}
            </h3>

            {/* Info icon with tooltip */}
            {description && (
              <div className="relative">
                <div
                  className={`transition-colors cursor-help ${colors.icon}`}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip(!showTooltip);
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                {showTooltip && (
                  <div className="absolute left-0 top-6 z-[200] w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
                    <div className="relative">
                      {/* Tooltip arrow */}
                      <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-800 transform rotate-45"></div>

                      {/* Tooltip content */}
                      <div className="leading-relaxed">{description}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Active filter count badge */}
            {activeCount > 0 && (
              <span
                className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium rounded-full transition-colors ${colors.badge}`}
              >
                {activeCount}
              </span>
            )}

            {/* Status indicator */}
            <div
              className={`w-2 h-2 rounded-full transition-colors ${colors.indicator}`}
            />
          </div>
        </div>

        <div
          className={`transition-all duration-200 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
        >
          <IoChevronDown
            className={`w-5 h-5 transition-colors ${colors.chevron}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="space-y-3">
        {/* Header with Platform selector and Controls */}
        <div className="flex justify-between items-start gap-2.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold text-gray-800">
                Filter Influencers
              </h2>
              {/* Info tooltip */}
              <div className="relative group">
                <button
                  className="text-gray-400 hover:text-purple-500 transition-colors p-1"
                  title=""
                  style={{ cursor: 'default' }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Tooltip content */}
                <div className="absolute left-0 top-8 z-[200] w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="relative">
                    {/* Tooltip arrow */}
                    <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-800 transform rotate-45"></div>

                    {/* Tooltip content */}
                    <div className="leading-relaxed">
                      Narrow down your search with advanced filters to find the
                      perfect influencers for your campaign.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Expand/Collapse Control - Same height as Platform button */}
            <button
              type="button"
              onClick={handleExpandCollapseAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200 hover:shadow-md min-h-[40px]"
              title={
                areAllSectionsCollapsed()
                  ? 'Expand all filter sections'
                  : 'Collapse all filter sections'
              }
            >
              {areAllSectionsCollapsed() ? (
                <>
                  <IoChevronDown className="w-4 h-4" />
                  <span>Expand Filters</span>
                </>
              ) : (
                <>
                  <IoChevronUp className="w-4 h-4" />
                  <span>Collapse Filters</span>
                </>
              )}
            </button>

            {/* Platform selector dropdown */}
            <div className="relative" ref={platformDropdownRef}>
              {isLoadingPlatforms ? (
                <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg text-gray-500 min-h-[40px]">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      setIsPlatformDropdownOpen(!isPlatformDropdownOpen)
                    }
                    className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 hover:border-purple-300 px-4 py-2 rounded-lg text-gray-700 transition-all duration-200 hover:shadow-md min-h-[40px]"
                  >
                    {selectedPlatform ? (
                      <>
                        {getPlatformIcon(selectedPlatform)}
                        <span className="font-medium">
                          {selectedPlatform.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <BsInstagram className="text-pink-500" size={20} />
                        <span className="font-medium">Select Platform</span>
                      </>
                    )}
                    <IoChevronDown
                      className={`text-gray-500 transition-transform ${
                        isPlatformDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Platform dropdown menu */}
                  {isPlatformDropdownOpen && platforms.length > 0 && (
                    <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
                      {/* Search box */}
                      <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search platforms..."
                            value={platformSearchQuery}
                            onChange={(e) =>
                              setPlatformSearchQuery(e.target.value)
                            }
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <svg
                            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Platforms list */}
                      <div className="py-1 max-h-80 overflow-y-auto">
                        {(() => {
                          const filteredPlatforms = getFilteredPlatforms();
                          const otherPlatforms = !platformSearchQuery.trim()
                            ? getOtherPlatforms()
                            : [];

                          if (
                            filteredPlatforms.length === 0 &&
                            otherPlatforms.length === 0
                          ) {
                            return (
                              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                No platforms found matching "
                                {platformSearchQuery}"
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* Popular/Filtered platforms */}
                              {filteredPlatforms.length > 0 && (
                                <>
                                  {!platformSearchQuery.trim() && (
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                                      Popular Platforms
                                    </div>
                                  )}
                                  {filteredPlatforms.map((platform) => (
                                    <button
                                      key={platform.id}
                                      onClick={() =>
                                        handlePlatformSelect(platform)
                                      }
                                      className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                        selectedPlatform?.id === platform.id
                                          ? 'bg-purple-50 text-purple-700'
                                          : 'text-gray-700'
                                      }`}
                                    >
                                      {getPlatformIcon(platform)}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">
                                          {platform.name}
                                        </div>
                                        {platform.description && (
                                          <div className="text-xs text-gray-500 truncate">
                                            {platform.description}
                                          </div>
                                        )}
                                      </div>
                                      {selectedPlatform?.id === platform.id && (
                                        <div className="flex-shrink-0">
                                          <svg
                                            className="w-4 h-4 text-purple-600"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </>
                              )}

                              {/* Other platforms */}
                              {!platformSearchQuery.trim() &&
                                otherPlatforms.length > 0 && (
                                  <>
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 border-t border-gray-100">
                                      Other Platforms
                                    </div>
                                    {otherPlatforms
                                      .slice(0, 5)
                                      .map((platform) => (
                                        <button
                                          key={platform.id}
                                          onClick={() =>
                                            handlePlatformSelect(platform)
                                          }
                                          className={`flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                            selectedPlatform?.id === platform.id
                                              ? 'bg-purple-50 text-purple-700'
                                              : 'text-gray-700'
                                          }`}
                                        >
                                          {getPlatformIcon(platform)}
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">
                                              {platform.name}
                                            </div>
                                            {platform.description && (
                                              <div className="text-xs text-gray-500 truncate">
                                                {platform.description}
                                              </div>
                                            )}
                                          </div>
                                          {selectedPlatform?.id ===
                                            platform.id && (
                                            <div className="flex-shrink-0">
                                              <svg
                                                className="w-4 h-4 text-purple-600"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                              >
                                                <path
                                                  fillRule="evenodd"
                                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                  clipRule="evenodd"
                                                />
                                              </svg>
                                            </div>
                                          )}
                                        </button>
                                      ))}
                                    {otherPlatforms.length > 5 && (
                                      <div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
                                        +{otherPlatforms.length - 5} more
                                        platforms (use search to find them)
                                      </div>
                                    )}
                                  </>
                                )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filter Sections */}
        <div className="space-y-3">
          {/* Demographics Filters */}
          <div className="border border-gray-200 rounded-lg shadow-sm">
            <SectionHeader
              title="Demographics"
              sectionId="demographics"
              description="Filter by creator and audience demographics"
              activeCount={filterCounts.demographics || 0}
            />
            {!isSectionCollapsed('demographics') && (
              <div className="p-4 border-t border-gray-200">
                <DemographicsFilters
                  searchParams={displayFilters}
                  onFilterChange={handlePendingFilterChange}
                  filterButtonStyle={filterButtonStyle}
                  openFilterId={openFilterId}
                  toggleFilterDropdown={toggleFilterDropdown}
                  isFilterOpen={isFilterOpen}
                  onCloseFilter={() => setOpenFilterId(null)}
                  onUpdateContext={handleUpdateFilterContext}
                  preservedLocations={
                    preservedLocationData.selectedCreatorLocations
                  }
                  allFetchedLocations={
                    preservedLocationData.allFetchedLocations
                  }
                  selectedPlatform={selectedPlatform} // ADD
                />
              </div>
            )}
          </div>

          {/* Performance Filters */}
          <div className="border border-gray-200 rounded-lg shadow-sm">
            <SectionHeader
              title="Performance"
              sectionId="performance"
              description="Filter by engagement, followers, and performance metrics"
              activeCount={filterCounts.performance || 0}
            />
            {!isSectionCollapsed('performance') && (
              <div className="p-4 border-t border-gray-200">
                <PerformanceFilters
                  searchParams={displayFilters}
                  onFilterChange={handlePendingFilterChange}
                  filterButtonStyle={filterButtonStyle}
                  openFilterId={openFilterId}
                  toggleFilterDropdown={toggleFilterDropdown}
                  isFilterOpen={isFilterOpen}
                  onCloseFilter={() => setOpenFilterId(null)}
                  selectedPlatform={selectedPlatform} // ADD
                />
              </div>
            )}
          </div>

          {/* Content Filters */}
          <div className="border border-gray-200 rounded-lg shadow-sm">
            <SectionHeader
              title="Relevance"
              sectionId="content"
              description="Filter by content topics, hashtags, and partnerships"
              activeCount={filterCounts.content || 0}
            />
            {!isSectionCollapsed('content') && (
              <div className="p-4 border-t border-gray-200">
                <ContentFilters
                  searchParams={displayFilters}
                  onFilterChange={handlePendingFilterChange}
                  filterButtonStyle={filterButtonStyle}
                  openFilterId={openFilterId}
                  toggleFilterDropdown={toggleFilterDropdown}
                  isFilterOpen={isFilterOpen}
                  onCloseFilter={() => setOpenFilterId(null)}
                  selectedPlatform={selectedPlatform} // ADD
                />
              </div>
            )}
          </div>

          {/* Account Filters */}
          <div className="border border-gray-200 rounded-lg shadow-sm">
            <SectionHeader
              title="Account"
              sectionId="account"
              description="Filter by account settings and verification status"
              activeCount={filterCounts.account || 0}
            />
            {!isSectionCollapsed('account') && (
              <div className="p-4 border-t border-gray-200">
                <AccountFilters
                  searchParams={displayFilters}
                  onFilterChange={handlePendingFilterChange}
                  filterButtonStyle={filterButtonStyle}
                  openFilterId={openFilterId}
                  toggleFilterDropdown={toggleFilterDropdown}
                  isFilterOpen={isFilterOpen}
                  onCloseFilter={() => setOpenFilterId(null)}
                  selectedPlatform={selectedPlatform} // ADD
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {hasActiveFilters(
              searchParams,
              pendingFilters,
              enhancedFilterContext,
            ) && (
              <span>
                {activeFilters.length} filter
                {activeFilters.length !== 1 ? 's' : ''} active
              </span>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={clearAllFilters}
              disabled={isClearing || isApplying}
              className={`border border-gray-300 px-8 py-2 rounded-full shadow-sm transition-colors flex items-center gap-2 ${
                isClearing || isApplying
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {isClearing && (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              )}
              Clear
            </button>
            <button
              onClick={applyFilters}
              disabled={!hasPendingChanges || isApplying || isClearing}
              className={`px-8 py-2 rounded-full shadow-md transition-colors flex items-center gap-2 ${
                hasPendingChanges && !isApplying && !isClearing
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isApplying && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Apply Filters{' '}
              {hasPendingChanges &&
                !isApplying &&
                `(${Object.keys(pendingFilters).length})`}
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span
                key={filter.key}
                className="inline-flex items-center gap-2 bg-white border border-purple-300 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="font-medium">{filter.label}:</span>
                <span>{filter.value}</span>
                <button
                  onClick={() => handleRemoveFilter(filter.key)}
                  className="ml-1 text-purple-500 hover:text-purple-700 transition-colors"
                  title={`Remove ${filter.label} filter`}
                >
                  <IoClose size={16} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
