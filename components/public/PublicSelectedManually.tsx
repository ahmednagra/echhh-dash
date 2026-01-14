// src/components/public/PublicSelectedManually.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Status } from '@/types/statuses';
import { formatNumber } from '@/utils/format';
import TableHeader from '@/components/dashboard/campaign-funnel/outreach/selected-manually/TableHeader';
import TableRow from '@/components/dashboard/campaign-funnel/outreach/selected-manually/TableRow';
import ColumnToggleDropdown from '@/components/dashboard/campaign-funnel/outreach/selected-manually/ColumnToggleDropdown';
import Pagination from '@/components/dashboard/campaign-funnel/outreach/selected-manually/Pagination';
import CounterBudgetPopup from '@/components/dashboard/campaign-funnel/outreach/selected-manually/CounterBudgetPopup';
import CommentThreadPopup from '@/components/dashboard/campaign-funnel/outreach/selected-manually/CommentThreadPopup';
import SelectedInfluencersSummary from '@/components/dashboard/campaign-funnel/outreach/selected-manually/SelectedInfluencersSummary';

// Import services for REAL data functionality
import {
  getRealPublicOutreachData,
  updateRealPublicOutreachData,
} from '@/services/outreach/public-real-data.service';
import { updateCampaignInfluencerClientReviewStatus } from '@/services/campaign-influencers/campaign-influencers.client';
import { UpdateClientReviewStatusRequest } from '@/types/campaign-influencers';

export interface ColumnConfig {
  key: string;
  label: string;
  width: string;
  defaultVisible: boolean;
}

const PublicSelectedManually: React.FC = () => {
  const searchParams = useSearchParams();

  // Local state - identical to private component
  const [readyToOnboardInfluencers, setReadyToOnboardInfluencers] = useState<
    any[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localInfluencerUpdates, setLocalInfluencerUpdates] = useState<
    Record<string, any>
  >({});
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams?.get('search') || '',
  );
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      'name',
      'followers',
      'engagementRate',
      'engagements',
      'avgLikes',
      'viewsMultiplier',
      'budget',
      'cpv',
      'status',
      'counterBudget',
      'comment',
    ]),
  );
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [influencerNotes, setInfluencerNotes] = useState<
    Record<string, string>
  >({});

  // Counter Budget and Comment states
  const [counterBudgets, setCounterBudgets] = useState<
    Record<string, { amount: number | null; currency: string }>
  >({});
  const [comments, setComments] = useState<Record<string, any[]>>({});

  // Popup states
  const [budgetPopupOpen, setBudgetPopupOpen] = useState(false);
  const [selectedInfluencerForBudget, setSelectedInfluencerForBudget] =
    useState<any | null>(null);
  const [budgetPopupPosition, setBudgetPopupPosition] = useState({
    x: 0,
    y: 0,
  });

  const [commentPopupOpen, setCommentPopupOpen] = useState(false);
  const [selectedInfluencerForComment, setSelectedInfluencerForComment] =
    useState<any | null>(null);
  const [commentPopupPosition, setCommentPopupPosition] = useState({
    x: 0,
    y: 0,
  });

  // Status management - FULLY FUNCTIONAL
  const [clientReviewStatuses, setClientReviewStatuses] = useState<Status[]>(
    [],
  );
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
    null,
  );
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(
    null,
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Column configuration - identical to private component
  const allColumns: ColumnConfig[] = [
    {
      key: 'name',
      label: 'Influencer Name',
      width: 'w-44',
      defaultVisible: true,
    },
    {
      key: 'followers',
      label: 'Followers',
      width: 'w-20',
      defaultVisible: true,
    },
    {
      key: 'engagementRate',
      label: 'Eng Rate',
      width: 'w-16',
      defaultVisible: true,
    },
    {
      key: 'engagements',
      label: 'Engagements',
      width: 'w-24',
      defaultVisible: true,
    },
    {
      key: 'avgLikes',
      label: 'Avg Likes',
      width: 'w-20',
      defaultVisible: true,
    },
    {
      key: 'viewsMultiplier',
      label: 'Views Multi',
      width: 'w-20',
      defaultVisible: true,
    },
    { key: 'budget', label: 'Budget', width: 'w-20', defaultVisible: true },
    { key: 'cpv', label: 'CPV', width: 'w-16', defaultVisible: true },
    { key: 'status', label: 'Status', width: 'w-24', defaultVisible: true },
    {
      key: 'counterBudget',
      label: 'Counter Budget',
      width: 'w-28',
      defaultVisible: true,
    },
    { key: 'comment', label: 'Comment', width: 'w-20', defaultVisible: true },
  ];

  // Helper function to get average views with fallback logic
  const getAverageViews = (influencer: any): number => {
    const additionalMetrics = influencer.social_account
      ?.additional_metrics as any;

    // Priority 1: Check average_views first
    if (
      additionalMetrics?.average_views !== null &&
      additionalMetrics?.average_views !== undefined &&
      typeof additionalMetrics.average_views === 'number' &&
      additionalMetrics.average_views > 0
    ) {
      return additionalMetrics.average_views;
    }

    // Priority 2: Check instagram_options.reel_views
    if (additionalMetrics?.instagram_options?.reel_views) {
      const reelViews = additionalMetrics.instagram_options.reel_views;
      if (typeof reelViews === 'number') {
        return reelViews;
      }
    }

    // Priority 3: Check filter_match.instagram_options.reel_views
    if (additionalMetrics?.filter_match?.instagram_options?.reel_views) {
      const reelViews =
        additionalMetrics.filter_match.instagram_options.reel_views;
      if (typeof reelViews === 'number') {
        return reelViews;
      }
    }

    return 0;
  };

  // Build averageViews map for Summary component
  const averageViewsMap = useMemo(() => {
    const map: Record<string, number | null> = {};
    readyToOnboardInfluencers.forEach((inf) => {
      const views = getAverageViews(inf);
      map[inf.id] = views > 0 ? views : null;
    });
    return map;
  }, [readyToOnboardInfluencers]);
  // Fetch public data on component mount
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          '🔓 PublicSelectedManually: Fetching REAL outreach data...',
        );

        // Use the REAL data service to fetch actual campaign data
        const data = await getRealPublicOutreachData();

        console.log('🔓 PublicSelectedManually: Received data:', data);

        if (data.isDevelopmentMode) {
          console.log(
            '🔄 PublicSelectedManually: Running in development mode with sample data',
          );
        }

        setReadyToOnboardInfluencers(data.influencers || []);
        setClientReviewStatuses(data.statuses || []);

        // Initialize states for public data
        const initialBudgets: Record<
          string,
          { amount: number | null; currency: string }
        > = {};
        const initialNotes: Record<string, string> = {};

        data.influencers?.forEach((inf: any) => {
          initialBudgets[inf.id] = {
            amount: inf.counter_budget?.amount || 0,
            currency: inf.counter_budget?.currency || 'USD',
          };
          initialNotes[inf.id] = inf.notes || '';
        });

        setCounterBudgets(initialBudgets);
        setInfluencerNotes(initialNotes);

        console.log(
          `✅ PublicSelectedManually: Successfully loaded ${data.influencers?.length || 0} influencers`,
        );
      } catch (err) {
        console.error(
          '❌ PublicSelectedManually: Failed to fetch public outreach data:',
          err,
        );
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  // Initialize states when data changes
  useEffect(() => {
    const initialBudgets: Record<
      string,
      { amount: number | null; currency: string }
    > = {};
    const initialNotes: Record<string, string> = {};

    readyToOnboardInfluencers.forEach((inf) => {
      initialBudgets[inf.id] = {
        amount: inf.counter_budget?.amount || 0,
        currency: inf.counter_budget?.currency || 'USD',
      };
      initialNotes[inf.id] = inf.notes || '';
    });

    setCounterBudgets(initialBudgets);
    setInfluencerNotes(initialNotes);
  }, [readyToOnboardInfluencers]);

  // Clear messages after timeout
  useEffect(() => {
    if (statusUpdateSuccess) {
      const timer = setTimeout(() => setStatusUpdateSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusUpdateSuccess]);

  useEffect(() => {
    if (statusUpdateError) {
      const timer = setTimeout(() => setStatusUpdateError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusUpdateError]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showColumnDropdown) {
        setShowColumnDropdown(false);
      }
    };

    if (showColumnDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showColumnDropdown]);

  // Filter and sort logic - identical to private component
  const filteredInfluencers = useMemo(() => {
    if (!searchTerm.trim()) return readyToOnboardInfluencers;

    const lowercaseSearch = searchTerm.toLowerCase();
    return readyToOnboardInfluencers.filter(
      (influencer) =>
        influencer.social_account?.full_name
          ?.toLowerCase()
          .includes(lowercaseSearch) ||
        influencer.social_account?.account_handle
          ?.toLowerCase()
          .includes(lowercaseSearch),
    );
  }, [readyToOnboardInfluencers, searchTerm]);

  const sortedInfluencers = useMemo(() => {
    if (!sortConfig) return filteredInfluencers;

    return [...filteredInfluencers].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.social_account?.full_name || '';
          bValue = b.social_account?.full_name || '';
          break;
        case 'followers':
          aValue = a.social_account?.followers_count || 0;
          bValue = b.social_account?.followers_count || 0;
          break;
        case 'engagementRate':
          aValue = a.social_account?.additional_metrics?.engagementRate || 0;
          bValue = b.social_account?.additional_metrics?.engagementRate || 0;
          break;
        case 'budget':
          aValue = a.collaboration_price || 0;
          bValue = b.collaboration_price || 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredInfluencers, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedInfluencers.length / itemsPerPage);
  const paginatedInfluencers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedInfluencers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedInfluencers, currentPage, itemsPerPage]);

  // Selection logic
  const isAllSelected = useMemo(() => {
    return (
      paginatedInfluencers.length > 0 &&
      paginatedInfluencers.every((inf) => selectedInfluencers.has(inf.id))
    );
  }, [paginatedInfluencers, selectedInfluencers]);

  const isPartiallySelected = useMemo(() => {
    return (
      paginatedInfluencers.some((inf) => selectedInfluencers.has(inf.id)) &&
      !isAllSelected
    );
  }, [paginatedInfluencers, selectedInfluencers, isAllSelected]);

  // Event handlers - FULLY FUNCTIONAL
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      const newSelected = new Set(selectedInfluencers);
      paginatedInfluencers.forEach((inf) => newSelected.delete(inf.id));
      setSelectedInfluencers(newSelected);
    } else {
      // Select all
      const newSelected = new Set(selectedInfluencers);
      paginatedInfluencers.forEach((inf) => newSelected.add(inf.id));
      setSelectedInfluencers(newSelected);
    }
  };

  const handleToggleSelection = (id: string) => {
    const newSelected = new Set(selectedInfluencers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInfluencers(newSelected);
  };

  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'desc';

    if (sortConfig?.key === columnKey && sortConfig.direction === 'desc') {
      direction = 'asc';
    }

    setSortConfig({ key: columnKey, direction });
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return (
        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <svg
            className="w-3 h-3 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className="w-3 h-3 text-gray-400 -mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg
            className="w-3 h-3 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className="w-3.5 h-3.5 text-purple-600 -mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }
  };

  const toggleColumnVisibility = (columnKey: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  const visibleColumnsData = allColumns.filter((column) =>
    visibleColumns.has(column.key),
  );

  // FULLY FUNCTIONAL HANDLERS

  // Handle onboarding - FULL FUNCTIONALITY
  const handleOnboardSelected = async () => {
    if (selectedInfluencers.size === 0) return;

    setIsOnboarding(true);
    setLocalError(null);

    try {
      const influencerIds = Array.from(selectedInfluencers);

      console.log(
        '🔓 PublicSelectedManually: Onboarding influencers:',
        influencerIds,
      );

      // Use REAL data service to onboard influencers
      await updateRealPublicOutreachData('onboard', influencerIds);

      setSelectedInfluencers(new Set());

      // Refresh data to show updates
      const refreshedData = await getRealPublicOutreachData();
      setReadyToOnboardInfluencers(refreshedData.influencers || []);

      console.log(
        '✅ PublicSelectedManually: Successfully onboarded influencers',
      );
    } catch (err) {
      console.error('❌ PublicSelectedManually: Failed to onboard:', err);
      setLocalError(
        err instanceof Error ? err.message : 'Failed to onboard influencers',
      );
    } finally {
      setIsOnboarding(false);
    }
  };

  const handlePublicBack = () => {
    window.history.back();
  };

  // Status change handler - FULL FUNCTIONALITY
  const handleStatusChange = async (influencerId: string, statusId: string) => {
    setUpdatingStatus((prev) => new Set([...prev, influencerId]));
    setStatusUpdateError(null);
    setStatusUpdateSuccess(null);

    try {
      console.log(
        '🔓 PublicSelectedManually: Updating status for influencer:',
        influencerId,
        'to status:',
        statusId,
      );

      // Create the correct request object
      const updateData: UpdateClientReviewStatusRequest = {
        client_review_status_id: statusId,
      };

      // Update status using the same service as private component
      await updateCampaignInfluencerClientReviewStatus(
        influencerId,
        updateData,
      );
      setStatusUpdateSuccess('Status updated successfully');

      // Update local state
      setLocalInfluencerUpdates((prev) => ({
        ...prev,
        [influencerId]: { client_review_status_id: statusId },
      }));

      // If status is "Approved", auto-select the influencer and update summary
      const approvedStatus = clientReviewStatuses.find(
        (s) => s.name.toLowerCase() === 'approved',
      );
      if (statusId === approvedStatus?.id) {
        setSelectedInfluencers((prev) => new Set([...prev, influencerId]));
      }

      // Refresh data to get latest changes
      const refreshedData = await getRealPublicOutreachData();
      setReadyToOnboardInfluencers(refreshedData.influencers || []);

      console.log('✅ PublicSelectedManually: Successfully updated status');
    } catch (err) {
      console.error('❌ PublicSelectedManually: Failed to update status:', err);
      setStatusUpdateError(
        err instanceof Error ? err.message : 'Failed to update status',
      );
    } finally {
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(influencerId);
        return newSet;
      });
    }
  };

  // Budget click handler - FULL FUNCTIONALITY
  const handleBudgetClick = (e: React.MouseEvent, influencer: any) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setBudgetPopupPosition({ x: rect.left, y: rect.bottom + 5 });
    setSelectedInfluencerForBudget(influencer);
    setBudgetPopupOpen(true);
  };

  // Comment click handler - FULL FUNCTIONALITY
  const handleCommentClick = (e: React.MouseEvent, influencer: any) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setCommentPopupPosition({ x: rect.left, y: rect.bottom + 5 });
    setSelectedInfluencerForComment(influencer);
    setCommentPopupOpen(true);
  };

  // Budget update handler - FULL FUNCTIONALITY
  const handleBudgetUpdate = async (
    influencerId: string,
    amount: number | null,
    currency: string,
  ) => {
    try {
      console.log(
        '🔓 PublicSelectedManually: Updating budget for influencer:',
        influencerId,
        amount,
        currency,
      );

      // Update budget using REAL data service
      await updateRealPublicOutreachData('budget', [influencerId], {
        budget: { amount, currency },
      });

      setCounterBudgets((prev) => ({
        ...prev,
        [influencerId]: { amount, currency },
      }));

      // Refresh data
      const refreshedData = await getRealPublicOutreachData();
      setReadyToOnboardInfluencers(refreshedData.influencers || []);

      console.log('✅ PublicSelectedManually: Successfully updated budget');
    } catch (err) {
      console.error('❌ PublicSelectedManually: Failed to update budget:', err);
      alert('Failed to update budget. Please try again.');
    }
  };

  // Comment update handler - FULL FUNCTIONALITY
  const handleCommentUpdate = async (
    influencerId: string,
    newComments: any[],
  ) => {
    try {
      console.log(
        '🔓 PublicSelectedManually: Updating comments for influencer:',
        influencerId,
        newComments,
      );

      // Update comments using REAL data service
      await updateRealPublicOutreachData('comments', [influencerId], {
        comments: newComments,
      });

      setComments((prev) => ({
        ...prev,
        [influencerId]: newComments,
      }));

      // Refresh data
      const refreshedData = await getRealPublicOutreachData();
      setReadyToOnboardInfluencers(refreshedData.influencers || []);

      console.log('✅ PublicSelectedManually: Successfully updated comments');
    } catch (err) {
      console.error(
        '❌ PublicSelectedManually: Failed to update comments:',
        err,
      );
      alert('Failed to update comments. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading influencer data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="text-red-600 font-medium mb-2">
              Failed to Load Data
            </div>
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ready to Onboard Influencers
          </h1>
          <p className="text-gray-600">
            Manage and onboard selected influencers
          </p>
        </div>

        {/* Success/Error Messages */}
        {statusUpdateSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-green-600 font-medium">
              {statusUpdateSuccess}
            </div>
          </div>
        )}

        {statusUpdateError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-600 font-medium">
              Error updating status
            </div>
            <p className="text-red-500 text-sm">{statusUpdateError}</p>
          </div>
        )}

        {localError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-red-600 font-medium">Error</div>
            <p className="text-red-500 text-sm">{localError}</p>
          </div>
        )}

        {/* Summary */}
        <SelectedInfluencersSummary
          selectedInfluencers={selectedInfluencers}
          influencers={readyToOnboardInfluencers}
          onClearSelection={() => setSelectedInfluencers(new Set())}
          averageViews={averageViewsMap}
        />

        {/* Table Header */}
        <TableHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOnboard={handleOnboardSelected}
          onBack={handlePublicBack}
          selectedCount={selectedInfluencers.size}
          isOnboarding={isOnboarding}
          isPublicView={true}
        />

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Select All Checkbox */}
                  <th scope="col" className="w-10 px-2 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input)
                          input.indeterminate =
                            isPartiallySelected && !isAllSelected;
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-purple-500 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      title={isAllSelected ? 'Deselect All' : 'Select All'}
                    />
                  </th>

                  {/* Dynamic Columns */}
                  {visibleColumnsData.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="group-hover:text-purple-700 transition-colors duration-200">
                          {column.label}{' '}
                          {column.key === 'name' &&
                            `(${sortedInfluencers.length})`}
                        </span>
                        <div className="transform group-hover:scale-110 transition-transform duration-200">
                          {getSortIcon(column.key)}
                        </div>
                      </div>
                    </th>
                  ))}

                  {/* Actions Column with Column Toggle */}
                  <th
                    scope="col"
                    className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative min-w-[120px] w-[120px]"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Actions</span>
                      <ColumnToggleDropdown
                        allColumns={allColumns}
                        visibleColumns={visibleColumns}
                        onToggleColumn={toggleColumnVisibility}
                        showDropdown={showColumnDropdown}
                        onToggleDropdown={() =>
                          setShowColumnDropdown(!showColumnDropdown)
                        }
                      />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInfluencers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumnsData.length + 2}
                      className="text-center py-12"
                    >
                      <p className="text-gray-500 font-medium">
                        No Influencers Found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm
                          ? 'Try adjusting your search terms'
                          : 'No data available'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedInfluencers.map((influencer, index) => (
                    <TableRow
                      key={influencer.id}
                      influencer={influencer}
                      index={(currentPage - 1) * itemsPerPage + index}
                      isSelected={selectedInfluencers.has(influencer.id)}
                      onToggleSelection={handleToggleSelection}
                      visibleColumns={visibleColumns}
                      counterBudget={counterBudgets[influencer.id]}
                      onBudgetClick={(e) => handleBudgetClick(e, influencer)}
                      onCommentClick={(e) => handleCommentClick(e, influencer)}
                      clientReviewStatuses={clientReviewStatuses}
                      onStatusChange={handleStatusChange}
                      isUpdatingStatus={updatingStatus.has(influencer.id)}
                      statusesLoading={statusesLoading}
                      localUpdate={localInfluencerUpdates[influencer.id]}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={sortedInfluencers.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newSize: string) => {
            setItemsPerPage(parseInt(newSize));
            setCurrentPage(1);
          }}
        />

        {/* FULLY FUNCTIONAL POPUPS */}
        <CounterBudgetPopup
          influencer={selectedInfluencerForBudget}
          isOpen={budgetPopupOpen}
          onClose={() => {
            setBudgetPopupOpen(false);
            setSelectedInfluencerForBudget(null);
          }}
          position={budgetPopupPosition}
          onUpdate={handleBudgetUpdate}
          currentBudget={
            selectedInfluencerForBudget
              ? counterBudgets[selectedInfluencerForBudget.id]
              : null
          }
        />

        <CommentThreadPopup
          influencer={selectedInfluencerForComment}
          isOpen={commentPopupOpen}
          onClose={() => {
            setCommentPopupOpen(false);
            setSelectedInfluencerForComment(null);
          }}
          position={commentPopupPosition}
          onUpdate={handleCommentUpdate}
        />
      </div>
    </div>
  );
};

export default PublicSelectedManually;
