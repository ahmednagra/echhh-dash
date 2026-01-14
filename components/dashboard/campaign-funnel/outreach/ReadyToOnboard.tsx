// src/components/dashboard/campaign-funnel/outreach/ReadyToOnboard.tsx
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useOutreach } from '@/context/OutreachContext';
import { formatNumber } from '@/utils/format';
import { Status } from '@/types/statuses';
import { Upload } from 'react-feather';
import { exportInfluencers } from '@/utils/exportUtils';

// Dynamic status configuration - generates colors based on status names
const generateStatusConfig = (statusName: string) => {
  // Convert status name to a consistent hash for color generation
  const hash = statusName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  // Predefined color sets for consistency and readability
  const colorSets = [
    { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
    { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  ];

  // Special cases for common status names
  const specialCases: Record<string, (typeof colorSets)[0]> = {
    approved: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    pending_review: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    on_hold: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
    dropped: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    needs_info: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    under_negotiation: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    rejected: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    completed: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    in_progress: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
  };

  // Check for special case first
  if (specialCases[statusName]) {
    return specialCases[statusName];
  }

  // Use hash to select a color set
  const colorIndex = Math.abs(hash) % colorSets.length;
  return colorSets[colorIndex];
};

// Convert status name to readable label
const getStatusLabel = (statusName: string): string => {
  return statusName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Client Review Status Badge Component - Now Dynamic
const ClientReviewStatusBadge = ({ status }: { status: string }) => {
  const config = generateStatusConfig(status);
  const label = getStatusLabel(status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {label}
    </span>
  );
};

// Add interface for props
interface ReadyToOnboardProps {
  clientReviewStatuses?: Status[];
  statusesLoading?: boolean;
  enableDrag?: boolean; // NEW: Enable drag functionality
  onSelectManually?: () => void; // NEW: Select manually handler
}

const ReadyToOnboard: React.FC<ReadyToOnboardProps> = ({
  clientReviewStatuses = [],
  statusesLoading = false,
  enableDrag = false, // NEW: Default to false
  onSelectManually, // NEW: Select manually handler
}) => {
  const { readyToOnboardInfluencers, loading, error } = useOutreach();
  const [searchText, setSearchText] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDirectionDropdown, setShowDirectionDropdown] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(
    'Cost Per View (CPV)',
  );
  const [selectedDirection, setSelectedDirection] = useState('Low to High');
  const [sortField, setSortField] = useState<
    | 'name'
    | 'followers'
    | 'engagements'
    | 'avgLikes'
    | 'organicRatio'
    | 'budget'
    | 'cpv'
    | 'engagementRate'
    | 'clientReview'
    | 'updated_at'
  >('updated_at'); // ✅ ADD updated_at and set as default
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // ✅ DESC for most recent first

  // NEW: Drag state
  const [draggedInfluencer, setDraggedInfluencer] = useState<string | null>(
    null,
  );
  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // NEW: Bottom buttons visibility state
  const [showBottomButtons, setShowBottomButtons] = useState(true);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Get unique statuses that exist in current influencers list
  const availableStatuses = useMemo(() => {
    const statusesInList = new Set<string>();

    readyToOnboardInfluencers.forEach((influencer) => {
      const status = influencer.client_review_status?.name || 'pending_review';
      statusesInList.add(status);
    });

    // Filter clientReviewStatuses to only include ones that exist in the current list
    const filteredStatuses = clientReviewStatuses.filter((status) =>
      statusesInList.has(status.name),
    );

    // Add pending_review if it exists in the list but not in clientReviewStatuses
    if (
      statusesInList.has('pending_review') &&
      !filteredStatuses.some((s) => s.name === 'pending_review')
    ) {
      filteredStatuses.unshift({
        id: 'pending_review',
        name: 'pending_review',
        model: 'campaign_influencer',
        applies_to_field: 'client_review_status_id',
        description: 'Default pending review status',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return filteredStatuses;
  }, [readyToOnboardInfluencers, clientReviewStatuses]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (showSortDropdown && !target.closest('.sort-dropdown-container')) {
        setShowSortDropdown(false);
      }

      if (
        showDirectionDropdown &&
        !target.closest('.direction-dropdown-container')
      ) {
        setShowDirectionDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSortDropdown, showDirectionDropdown]);

  // NEW: Drag handlers
  const handleDragStart = (e: React.DragEvent, influencerId: string) => {
    if (!enableDrag) return;

    console.log(
      '🔄 ReadyToOnboard: Drag started for influencer:',
      influencerId,
    );
    setDraggedInfluencer(influencerId);
    e.dataTransfer.setData('text/plain', influencerId);
    e.dataTransfer.effectAllowed = 'move';

    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!enableDrag) return;

    console.log('🔄 ReadyToOnboard: Drag ended');
    setDraggedInfluencer(null);

    // Remove visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  // Handle export to Excel
  const handleExport = async () => {
    if (readyToOnboardInfluencers.length === 0) {
      alert('No ready to onboard influencers to export');
      return;
    }

    setIsExporting(true);

    try {
      // Transform ready to onboard influencers data to match the export function format
      const exportData = readyToOnboardInfluencers.map((influencer) => ({
        // Keep all original data structure
        ...influencer,
        social_account: influencer.social_account,
        collaboration_price: influencer.collaboration_price,
        currency: influencer.currency,
        additional_metrics: influencer.social_account?.additional_metrics,
        // Add status for export instead of onboarded_date
        status: influencer.client_review_status?.name || 'pending_review',
      }));

      // Define columns for ready to onboard influencers (with status instead of onboarded_date)
      const exportColumns = [
        'name',
        'username',
        'followers',
        'verified',
        'engagement_rate',
        'avg_likes',
        'collaboration_price',
        'currency',
        'whatsapp',
        'status', // Using status instead of onboarded_date
      ];

      await exportInfluencers(
        exportData as any,
        'Ready_to_Onboard_Influencers',
        exportColumns,
      );
      console.log('✅ Ready to onboard influencers exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert(
        `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Filter and sort influencers
  const filteredInfluencers = useMemo(() => {
    let influencers = [...readyToOnboardInfluencers];

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      influencers = influencers.filter((influencer) => {
        const fullName = (
          influencer.social_account?.full_name || ''
        ).toLowerCase();
        const accountHandle = (
          influencer.social_account?.account_handle || ''
        ).toLowerCase();

        return (
          fullName.includes(searchLower) || accountHandle.includes(searchLower)
        );
      });
    }

    // Apply sorting
    influencers.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortField) {
        case 'name':
          aValue = a.social_account?.full_name || '';
          bValue = b.social_account?.full_name || '';
          break;
        case 'followers':
          aValue = a.social_account?.followers_count || 0;
          bValue = b.social_account?.followers_count || 0;
          break;
        case 'engagements':
          aValue = a.social_account?.additional_metrics?.average_likes || 0;
          bValue = b.social_account?.additional_metrics?.average_likes || 0;
          break;
        case 'avgLikes':
          aValue = a.social_account?.additional_metrics?.average_likes || 0;
          bValue = b.social_account?.additional_metrics?.average_likes || 0;
          break;
        case 'organicRatio':
          aValue = a.social_account?.additional_metrics?.engagementRate || 0;
          bValue = b.social_account?.additional_metrics?.engagementRate || 0;
          break;
        case 'budget':
          aValue = a.collaboration_price || 0;
          bValue = b.collaboration_price || 0;
          break;
        case 'cpv':
          const aIndex = Math.abs((a.id || '').charCodeAt(0)) % 9;
          const bIndex = Math.abs((b.id || '').charCodeAt(0)) % 9;
          aValue = parseFloat(
            [
              '0.53',
              '0.34',
              '0.24',
              '0.64',
              '0.24',
              '2.53',
              '1.64',
              '0.86',
              '3.55',
            ][aIndex] || '0',
          );
          bValue = parseFloat(
            [
              '0.53',
              '0.34',
              '0.24',
              '0.64',
              '0.24',
              '2.53',
              '1.64',
              '0.86',
              '3.55',
            ][bIndex] || '0',
          );
          break;
        case 'engagementRate':
          aValue = a.social_account?.additional_metrics?.engagementRate || 0;
          bValue = b.social_account?.additional_metrics?.engagementRate || 0;
          break;

        case 'updated_at': // ✅ ADD THIS CASE
          aValue = new Date(a.updated_at || 0).getTime();
          bValue = new Date(b.updated_at || 0).getTime();
          break;
        case 'clientReview':
          // Create dynamic priority map from availableStatuses (not all clientReviewStatuses)
          const createStatusPriority = () => {
            const priority: Record<string, number> = {};
            availableStatuses.forEach((status, index) => {
              priority[status.name] = index + 1;
            });
            // Add default for pending_review if not in the list
            if (!priority['pending_review']) {
              priority['pending_review'] = 1;
            }
            return priority;
          };

          const statusPriority = createStatusPriority();

          // Get status names, treating null as 'pending_review'
          const aStatus = a.client_review_status?.name || 'pending_review';
          const bStatus = b.client_review_status?.name || 'pending_review';

          // For specific status sorting (desc), we need to find the target status and prioritize it
          if (sortDirection === 'desc') {
            // Check if we're sorting by a specific status
            const targetStatus = selectedDirection
              .replace(' First', '')
              .toLowerCase()
              .replace(' ', '_');

            if (targetStatus === 'approved') {
              const approvedStatus = availableStatuses.find(
                (s) => s.name === 'approved',
              );
              if (approvedStatus) {
                // Create reversed priority with approved first
                const reversedPriority: Record<string, number> = {};
                reversedPriority['approved'] = 1;

                let counter = 2;
                availableStatuses.forEach((status) => {
                  if (status.name !== 'approved') {
                    reversedPriority[status.name] = counter++;
                  }
                });

                if (!reversedPriority['pending_review']) {
                  reversedPriority['pending_review'] = counter;
                }

                aValue = reversedPriority[aStatus] || 999;
                bValue = reversedPriority[bStatus] || 999;
              } else {
                // Fallback to regular priority if no approved status found
                aValue = statusPriority[aStatus] || 999;
                bValue = statusPriority[bStatus] || 999;
              }
            } else {
              // Handle other "X First" sortings
              const reversedPriority: Record<string, number> = {};
              const targetStatusObj = availableStatuses.find(
                (s) => s.name === targetStatus,
              );

              if (targetStatusObj) {
                reversedPriority[targetStatus] = 1;
                let counter = 2;
                availableStatuses.forEach((status) => {
                  if (status.name !== targetStatus) {
                    reversedPriority[status.name] = counter++;
                  }
                });

                if (!reversedPriority['pending_review']) {
                  reversedPriority['pending_review'] = counter;
                }

                aValue = reversedPriority[aStatus] || 999;
                bValue = reversedPriority[bStatus] || 999;
              } else {
                aValue = statusPriority[aStatus] || 999;
                bValue = statusPriority[bStatus] || 999;
              }
            }
          } else {
            aValue = statusPriority[aStatus] || 999;
            bValue = statusPriority[bStatus] || 999;
          }
          break;
      }

      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else {
        // For clientReview, we already handled the direction in the switch case
        if (sortField === 'clientReview') {
          return aValue - bValue; // Always ascending since we handled direction above
        }
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return influencers;
  }, [
    readyToOnboardInfluencers,
    searchText,
    sortField,
    sortDirection,
    availableStatuses,
    selectedDirection,
  ]);

  // Sort and direction options
  const sortOptions = [
    { label: 'Cost Per View (CPV)', field: 'cpv' as const },
    { label: 'By Price', field: 'budget' as const },
    { label: 'Engagement Rate', field: 'engagementRate' as const },
    { label: 'Client Review', field: 'clientReview' as const },
  ];

  const directionOptions = [
    { label: 'Low to High', value: 'asc' as const },
    { label: 'High to Low', value: 'desc' as const },
    { label: 'Average', value: 'asc' as const },
  ];

  // Client Review specific sort options - dynamically generated from availableStatuses
  const clientReviewSortOptions = useMemo(() => {
    const options: Array<{
      label: string;
      value: 'asc' | 'desc';
      statusName?: string;
    }> = [{ label: 'Pending First', value: 'asc' }];

    // Add options for each available status
    availableStatuses.forEach((status) => {
      if (status.name !== 'pending_review') {
        const displayName = getStatusLabel(status.name);
        options.push({
          label: `${displayName} First`,
          value: 'desc',
          statusName: status.name,
        });
      }
    });

    return options;
  }, [availableStatuses]);

  const handleSortOptionChange = (option: (typeof sortOptions)[0]) => {
    setSelectedSortOption(option.label);
    setSortField(option.field);
    setShowSortDropdown(false);

    if (option.field === 'budget' || option.field === 'cpv') {
      setSelectedDirection('Low to High');
      setSortDirection('asc');
    } else if (option.field === 'clientReview') {
      setSelectedDirection('Pending First');
      setSortDirection('asc');
    }
  };

  const handleDirectionChange = (
    direction:
      | (typeof directionOptions)[0]
      | (typeof clientReviewSortOptions)[0],
  ) => {
    setSelectedDirection(direction.label);
    setSortDirection(direction.value);
    setShowDirectionDropdown(false);
  };

  const handleSortDropdownToggle = () => {
    if (showDirectionDropdown) {
      setShowDirectionDropdown(false);
    }
    setShowSortDropdown(!showSortDropdown);
  };

  const handleDirectionDropdownToggle = () => {
    if (showSortDropdown) {
      setShowSortDropdown(false);
    }
    setShowDirectionDropdown(!showDirectionDropdown);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">
            Ready to Onboard
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Show error state only for persistent errors, not after successful operations
  const displayError = error && !readyToOnboardInfluencers.length;
  if (displayError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">Error</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-medium">Failed to load data</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">
          Ready to Onboard ({formatNumber(filteredInfluencers.length)})
        </h3>

        <div className="flex items-center space-x-2">
          {/* Export Button */}
          {readyToOnboardInfluencers.length > 0 && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border border-green-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to Excel"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full mr-1.5" />
                  Exporting...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  Export
                </>
              )}
            </button>
          )}
          {/* Filter Controls */}
          <div className="flex items-center space-x-2">
            {/* Sort Dropdown */}
            <div className="relative sort-dropdown-container">
              <button
                onClick={handleSortDropdownToggle}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
              </button>

              {/* Sort Dropdown Menu */}
              {showSortDropdown && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Sort by
                    </h3>
                    <button
                      onClick={() => setShowSortDropdown(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.field}
                        onClick={() => handleSortOptionChange(option)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-full border-2 transition-colors text-xs ${
                          selectedSortOption === option.label
                            ? 'border-purple-300 bg-purple-50 text-purple-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                        {selectedSortOption === option.label && (
                          <svg
                            className="w-3 h-3 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Direction Dropdown (show for "By Price" and "Client Review") */}
            {(selectedSortOption === 'By Price' ||
              selectedSortOption === 'Client Review') && (
              <div className="relative direction-dropdown-container">
                <button
                  onClick={handleDirectionDropdownToggle}
                  className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </button>

                {/* Direction Dropdown Menu */}
                {showDirectionDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Sort by
                      </h3>
                      <button
                        onClick={() => setShowDirectionDropdown(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {/* Show different options based on selected sort */}
                      {(selectedSortOption === 'Client Review'
                        ? clientReviewSortOptions
                        : directionOptions
                      ).map((option) => (
                        <button
                          key={option.label}
                          onClick={() => handleDirectionChange(option)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-full border-2 transition-colors text-xs ${
                            selectedDirection === option.label
                              ? 'border-purple-300 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className="font-medium">{option.label}</span>
                          {selectedDirection === option.label && (
                            <svg
                              className="w-3 h-3 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Influencer"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Influencers List */}
      <div
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-3"
        onMouseEnter={() => setShowBottomButtons(false)}
        onMouseLeave={() => setShowBottomButtons(true)}
        onScroll={() => setShowBottomButtons(false)}
      >
        {filteredInfluencers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 font-medium">
                No Completed Influencers
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {searchText
                  ? 'Try adjusting your search'
                  : 'No influencers have completed status yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredInfluencers.map((influencer) => (
              <div
                key={influencer.id}
                className={`flex items-center justify-between p-2 transition-all duration-150 border border-gray-200 rounded-md ${
                  enableDrag
                    ? 'cursor-move hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                    : 'hover:bg-gray-50'
                } ${
                  draggedInfluencer === influencer.id
                    ? 'opacity-50 scale-95'
                    : ''
                }`}
                // NEW: Drag functionality
                draggable={enableDrag}
                onDragStart={(e) => handleDragStart(e, influencer.id)}
                onDragEnd={handleDragEnd}
                title={
                  enableDrag
                    ? 'Drag to OnBoarded section to onboard this influencer'
                    : ''
                }
              >
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        influencer.social_account?.profile_pic_url ||
                        influencer.social_account?.additional_metrics
                          ?.profileImage ||
                        '/default-avatar.png'
                      }
                      alt="avatar"
                      className="rounded-full w-8 h-8 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          '/default-avatar.png';
                      }}
                    />
                    {/* Platform icon overlaid on profile picture */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center border border-white">
                      <svg
                        className="w-2 h-2 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                      </svg>
                    </div>
                    {/* Verification badge */}
                    {influencer.social_account?.is_verified && (
                      <div className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-2 h-2 text-white"
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
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {influencer.social_account?.full_name || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                      @{influencer.social_account?.account_handle || 'unknown'}
                    </p>
                  </div>
                </div>

                {/* Right side - Followers and Price */}
                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                  {/* Followers Count */}
                  <span className="text-[9px] text-gray-400">
                    {formatNumber(
                      influencer.social_account?.followers_count || 0,
                    )}{' '}
                    followers
                  </span>

                  {/* Collaboration Price - with price_approved check */}
                  {(() => {
                    const priceApproved = Boolean(influencer.price_approved);

                    if (!priceApproved) {
                      return (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <svg
                            className="w-2.5 h-2.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Pending
                        </span>
                      );
                    }

                    // Show total_price when approved
                    const totalPrice =
                      typeof influencer.total_price === 'number'
                        ? influencer.total_price
                        : parseFloat(influencer.total_price || '0') || 0;
                    const currency = influencer.currency || 'USD';
                    const CURRENCY_SYMBOLS: Record<string, string> = {
                      USD: '$',
                      EUR: '€',
                      GBP: '£',
                      INR: '₹',
                      PKR: '₨',
                      AED: 'د.إ',
                      CAD: 'C$',
                      AUD: 'A$',
                      JPY: '¥',
                      SAR: '﷼',
                      KWD: 'د.ك',
                      QAR: '﷼',
                      BHD: '.د.ب',
                      OMR: '﷼',
                      CNY: '¥',
                      SGD: 'S$',
                    };
                    const symbol = CURRENCY_SYMBOLS[currency] || '$';

                    return (
                      <span className="text-[9px] text-green-600 font-medium">
                        {symbol}
                        {formatNumber(totalPrice)}
                      </span>
                    );
                  })()}

                  {/* Client Review Status Badge - Added under the price */}
                  <ClientReviewStatusBadge
                    status={
                      influencer.client_review_status?.name || 'pending_review'
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW: Bottom Buttons Overlay with Working Slide Animation */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent backdrop-blur-sm flex items-center justify-center py-3 rounded-b-xl transition-transform duration-300 ease-in-out z-20 ${
          showBottomButtons ? 'translate-y-0' : 'translate-y-full'
        }`}
        onMouseEnter={() => setShowBottomButtons(true)}
      >
        <div className="flex space-x-2">
          <button
            onClick={onSelectManually}
            disabled={readyToOnboardInfluencers.length === 0}
            className={`px-4 py-2 border-2 rounded-full transition-all duration-300 font-medium text-xs shadow-md hover:shadow-lg transform hover:scale-105 ${
              readyToOnboardInfluencers.length > 0
                ? 'bg-white border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500'
                : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
            }`}
          >
            Select Manually
          </button>
          <button
            disabled={readyToOnboardInfluencers.length === 0}
            className={`px-4 py-2 rounded-full transition-all duration-300 font-medium text-xs shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-1.5 ${
              readyToOnboardInfluencers.length > 0
                ? 'bg-purple-500 text-white hover:bg-purple-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>✨</span>
            <span>Select with AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadyToOnboard;
