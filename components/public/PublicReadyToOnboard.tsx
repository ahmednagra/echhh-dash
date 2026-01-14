// src/components/public/PublicReadyToOnboard.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  PublicCampaignInfluencersResponse,
  PublicCampaignInfluencer,
} from '@/types/public-campaign-influencers';
import { formatNumber } from '@/utils/format';
import TableRow from '@/components/dashboard/campaign-funnel/outreach/selected-manually/TableRow';
import ColumnToggleDropdown from '@/components/dashboard/campaign-funnel/outreach/selected-manually/ColumnToggleDropdown';
import Pagination from '@/components/dashboard/campaign-funnel/outreach/selected-manually/Pagination';
import PublicCounterBudgetPopup from '@/components/public/PublicCounterBudgetPopup';
import PublicCommentThreadPopup from '@/components/public/PublicCommentThreadPopup';
import SelectedInfluencersSummary from '@/components/dashboard/campaign-funnel/outreach/selected-manually/SelectedInfluencersSummary';
import { Status } from '@/types/statuses';
import { getStatuses } from '@/services/statuses/statuses.service';
import { updatePublicClientReviewStatus } from '@/services/public-campaign-influencers';
import { toast } from 'react-hot-toast';

interface PublicReadyToOnboardProps {
  data: PublicCampaignInfluencersResponse;
}

export interface ColumnConfig {
  key: string;
  label: string;
  width: string;
  defaultVisible: boolean;
}

const PublicReadyToOnboard: React.FC<PublicReadyToOnboardProps> = ({
  data,
}) => {
  const { influencers } = data;
  const searchParams = useSearchParams();
  // console.log('aaaaaaaaaaaa: ', data?.session?.session_metadata)
  // SECURITY: Get admin-approved visible columns from session metadata
  const getAdminApprovedColumns = (): string[] => {
    // Check both session_info and session for backwards compatibility
    const sessionMetadata =
      data?.session?.session_metadata ||
      (data?.session?.session_metadata as any);

    if (
      sessionMetadata?.visible_columns &&
      Array.isArray(sessionMetadata.visible_columns)
    ) {
      return sessionMetadata.visible_columns;
    }

    // Fallback: If no admin-approved columns found, return empty array (show nothing for security)
    console.warn(
      'No admin-approved columns found in session metadata. Restricting all columns.',
    );
    return [];
  };

  // Get admin-approved columns - use useMemo to prevent recalculation
  const adminApprovedColumns = useMemo(() => getAdminApprovedColumns(), [data]);

  // Get initial visible columns (intersection of admin-approved and user preference)
  const getInitialVisibleColumns = (): Set<string> => {
    // If no admin-approved columns, return empty set for security
    if (adminApprovedColumns.length === 0) {
      return new Set();
    }

    // Check URL parameters for user preferences (but filter by admin approval)
    const columnsParam = searchParams?.get('columns');
    if (columnsParam) {
      try {
        const requestedColumns = columnsParam
          .split(',')
          .map((col) => col.trim())
          .filter(Boolean);
        // Only allow columns that are admin-approved
        const allowedColumns = requestedColumns.filter((col) =>
          adminApprovedColumns.includes(col),
        );
        if (allowedColumns.length > 0) {
          return new Set(allowedColumns);
        }
      } catch (error) {
        console.warn('Failed to parse columns parameter:', error);
      }
    }

    // Default: Show all admin-approved columns
    return new Set(adminApprovedColumns);
  };

  // Local state
  const [localInfluencerUpdates, setLocalInfluencerUpdates] = useState<
    Record<string, any>
  >({});
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    getInitialVisibleColumns(),
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

  // Counter Budget and Comments states
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

  // Status management
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
    null,
  );
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(
    null,
  );
  const [clientReviewStatuses, setClientReviewStatuses] = useState<Status[]>(
    [],
  );
  const [statusesLoading, setStatusesLoading] = useState(false);

  useEffect(() => {
    const fetchClientReviewStatuses = async () => {
      try {
        setStatusesLoading(true);

        const allStatuses = await getStatuses('campaign_influencer');

        // Filter for client review statuses only
        const clientStatuses = allStatuses.filter(
          (status) => status.applies_to_field === 'client_review_status_id',
        );

        setClientReviewStatuses(clientStatuses);
      } catch (error) {
        console.error(
          '❌ PublicReadyToOnboard: Error fetching client review statuses:',
          error,
        );
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchClientReviewStatuses();
  }, []);

  // Clear success messages after timeout
  useEffect(() => {
    if (statusUpdateSuccess) {
      const timer = setTimeout(() => setStatusUpdateSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusUpdateSuccess]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // SECURITY: Column configuration - Only include admin-approved columns
  const allColumnsDefinition: ColumnConfig[] = [
    { key: 'name', label: 'Name', width: 'w-44', defaultVisible: true },
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
    { key: 'engagements', label: 'Eng', width: 'w-24', defaultVisible: true },
    {
      key: 'avgLikes',
      label: 'Avg Likes',
      width: 'w-20',
      defaultVisible: true,
    },
    {
      key: 'avgViews',
      label: 'Avg Views',
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
    { key: 'comment', label: 'Cmnt', width: 'w-20', defaultVisible: true },
  ];

  // SECURITY: Filter columns to only include admin-approved ones
  const allColumns: ColumnConfig[] = useMemo(() => {
    if (adminApprovedColumns.length === 0) {
      console.warn('No admin-approved columns, showing empty column set');
      return [];
    }

    const approvedColumns = allColumnsDefinition.filter((col) =>
      adminApprovedColumns.includes(col.key),
    );

    console.log(
      'Filtered columns based on admin approval:',
      approvedColumns.map((col) => col.key),
    );
    return approvedColumns;
  }, []); // Remove adminApprovedColumns from dependency to prevent recalculation

  // SECURITY: Ensure visible columns only contain admin-approved columns
  useEffect(() => {
    if (adminApprovedColumns.length === 0) {
      // If no admin-approved columns, clear all visible columns
      setVisibleColumns(new Set());
      return;
    }

    // Filter current visible columns to only include admin-approved ones
    const currentVisible = Array.from(visibleColumns);
    const filteredVisible = currentVisible.filter((col) =>
      adminApprovedColumns.includes(col),
    );

    if (filteredVisible.length !== currentVisible.length) {
      console.log(
        'Filtering visible columns to only include admin-approved ones',
      );
      setVisibleColumns(new Set(filteredVisible));
    }
  }, [adminApprovedColumns]); // Remove visibleColumns from dependency array to prevent infinite loop

  // Get token from URL search params
  const getTokenFromURL = (): string | null => {
    return searchParams?.get('token') || null;
  };

  // Initialize states
  useEffect(() => {
    const initialBudgets: Record<
      string,
      { amount: number | null; currency: string }
    > = {};
    const initialNotes: Record<string, string> = {};
    const initialComments: Record<string, any[]> = {};

    if (influencers) {
      influencers.forEach((inf) => {
        initialBudgets[inf.id] = {
          amount: 0,
          currency: 'USD',
        };
        initialNotes[inf.id] = inf.notes || '';
        initialComments[inf.id] = [];
      });
    }

    setCounterBudgets(initialBudgets);
    setInfluencerNotes(initialNotes);
    setComments(initialComments);
  }, [influencers]);

  // Clear error messages after timeout
  useEffect(() => {
    if (statusUpdateError) {
      const timer = setTimeout(() => setStatusUpdateError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusUpdateError]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (showColumnDropdown && !target.closest('.column-dropdown')) {
        setShowColumnDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showColumnDropdown]);

  // Helper function to calculate popup position
  const calculatePopupPosition = (
    triggerElement: HTMLElement,
    modalWidth: number,
    modalHeight: number,
  ) => {
    const rect = triggerElement.getBoundingClientRect();
    const padding = 10;

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Position to the left of the trigger element
    let x = rect.left + scrollX - modalWidth - padding;
    let y = rect.top + scrollY;

    // If there's not enough space on the left, position to the right
    if (x < scrollX + padding) {
      x = rect.right + scrollX + padding;
    }

    // Adjust vertical position if needed
    if (y + modalHeight > window.innerHeight + scrollY - padding) {
      y = Math.max(scrollY + padding, rect.bottom + scrollY - modalHeight);
    }

    // Ensure popup stays within viewport
    if (y < scrollY + padding) {
      y = scrollY + padding;
    }

    return { x: rect.left + scrollX, y }; // Return left position for the popup to calculate from
  };

  // Handle budget click
  const handleBudgetClick = (influencer: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const position = calculatePopupPosition(
      event.currentTarget as HTMLElement,
      300,
      250,
    );
    setBudgetPopupPosition(position);
    setSelectedInfluencerForBudget(influencer);
    setBudgetPopupOpen(true);
  };

  // Handle comment click with compact popup positioning
  const handleCommentClick = (influencer: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const buttonElement = event.currentTarget as HTMLElement;
    const rect = buttonElement.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Get absolute position of the button on the page
    const buttonAbsoluteX = rect.left + scrollX;
    const buttonAbsoluteY = rect.top + scrollY;

    // Use smaller popup dimensions for better fit
    const popupWidth = 350;
    const popupHeight = 300;
    const margin = 10;

    // Default: position to the left of the button
    let popupX = buttonAbsoluteX - popupWidth - margin;
    let popupY = buttonAbsoluteY;

    // If popup goes off the left edge, position to the right of the button
    if (popupX < scrollX + margin) {
      popupX = buttonAbsoluteX + rect.width + margin;
    }

    // If popup still goes off the right edge, position it within viewport
    if (popupX + popupWidth > scrollX + window.innerWidth - margin) {
      popupX = scrollX + window.innerWidth - popupWidth - margin;
    }

    // Vertical positioning adjustments
    const viewportTop = scrollY;
    const viewportBottom = scrollY + window.innerHeight;

    // If popup goes below viewport, move it up
    if (popupY + popupHeight > viewportBottom - margin) {
      popupY = viewportBottom - popupHeight - margin;
    }

    // If popup goes above viewport, move it down
    if (popupY < viewportTop + margin) {
      popupY = viewportTop + margin;
    }

    setCommentPopupPosition({ x: popupX, y: popupY });
    setSelectedInfluencerForComment(influencer);
    setCommentPopupOpen(true);
  };

  // Handle profile click - Opens Instagram profile in new tab
  const handleProfileClick = (influencer: any) => {
    if (influencer.social_account?.account_handle) {
      window.open(
        `https://instagram.com/${influencer.social_account.account_handle}`,
        '_blank',
      );
    }
  };

  // Handle client review status change
  const handleClientReviewStatusChange = async (
    influencerId: string,
    statusId: string,
  ) => {
    const token = getTokenFromURL();

    if (!token) {
      toast.error('Authentication token is required');
      return;
    }

    try {
      setUpdatingStatus((prev) => new Set([...prev, influencerId]));
      setStatusUpdateError(null);
      setStatusUpdateSuccess(null);

      // Find the selected status object
      const selectedStatus = clientReviewStatuses.find(
        (status) => status.id === statusId,
      );

      // Get current status before update for comparison
      const currentInfluencer = influencers?.find(
        (inf) => inf.id === influencerId,
      );
      const previousStatus =
        localInfluencerUpdates[influencerId]?.client_review_status ||
        currentInfluencer?.client_review_status;

      // Call the API to update status
      await updatePublicClientReviewStatus(influencerId, {
        token,
        client_review_status_id: statusId,
      });

      // Update local state directly with the new status
      setLocalInfluencerUpdates((prev) => ({
        ...prev,
        [influencerId]: {
          ...prev[influencerId],
          client_review_status: {
            id: statusId,
            name: selectedStatus?.name || 'pending_review',
          },
        },
      }));

      // Auto-select/deselect based on status change
      if (selectedStatus?.name === 'approved') {
        // If status changed to approved, add to selection
        setSelectedInfluencers((prev) => {
          const newSelected = new Set(prev);
          newSelected.add(influencerId);
          return newSelected;
        });
      } else if (
        previousStatus?.name === 'approved' &&
        selectedStatus?.name !== 'approved'
      ) {
        // If status changed from approved to something else, remove from selection
        setSelectedInfluencers((prev) => {
          const newSelected = new Set(prev);
          newSelected.delete(influencerId);
          return newSelected;
        });
      }

      // Show success toast notification
      toast.success(
        `Status updated to "${selectedStatus?.name || 'unknown'}" successfully!`,
      );
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update status';
      setStatusUpdateError(errorMessage);

      // Show error toast notification
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(influencerId);
        return newSet;
      });
    }
  };

  // Enhanced data extraction functions for accurate display
  const getEngagementRate = (influencer: PublicCampaignInfluencer): number => {
    const engagementRate =
      influencer.social_account?.additional_metrics?.engagementRate;

    if (engagementRate === undefined || engagementRate === null) {
      return 0;
    }

    if (typeof engagementRate === 'number') {
      return engagementRate > 1 ? engagementRate : engagementRate * 100;
    }

    const parsed = parseFloat(String(engagementRate));
    return isNaN(parsed) ? 0 : parsed > 1 ? parsed : parsed * 100;
  };

  const getAverageLikes = (influencer: PublicCampaignInfluencer): number => {
    return influencer.social_account?.additional_metrics?.average_likes || 0;
  };

  const getAverageViews = (influencer: PublicCampaignInfluencer): number => {
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

    // Priority 2: Check instagram_options.reel_views (for Instagram influencers)
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
    if (influencers) {
      influencers.forEach((inf) => {
        const views = getAverageViews(inf);
        map[inf.id] = views > 0 ? views : null;
      });
    }
    return map;
  }, [influencers]);
  const getBudgetInfo = (influencer: PublicCampaignInfluencer) => {
    // First check if collaboration_price exists
    if (influencer.collaboration_price && influencer.collaboration_price > 0) {
      return {
        amount: influencer.collaboration_price,
        currency: influencer.currency || 'USD',
      };
    }

    // If no collaboration_price, get from latest price negotiation
    if (
      influencer.price_negotiations &&
      influencer.price_negotiations.length > 0
    ) {
      // Get the latest negotiation (highest round number)
      const latestNegotiation = influencer.price_negotiations.reduce(
        (latest: any, current: any) => {
          return current.round_number > latest.round_number ? current : latest;
        },
      );

      return {
        amount: parseFloat(latestNegotiation.proposed_price) || 0,
        currency: latestNegotiation.currency || 'USD',
      };
    }

    // Fallback to 0 USD if no price information available
    return {
      amount: 0,
      currency: 'USD',
    };
  };

  const getBudgetSortingValue = (
    influencer: PublicCampaignInfluencer,
  ): number => {
    const budgetInfo = getBudgetInfo(influencer);
    const amount = budgetInfo.amount || 0;
    const currency = budgetInfo.currency || 'USD';

    // Create a compound sorting value: amount as primary, currency as secondary
    const currencyValue =
      currency.charCodeAt(0) + currency.charCodeAt(1) + currency.charCodeAt(2);

    return amount * 1000 + currencyValue / 1000;
  };

  // Get column value for sorting
  const getColumnValue = (
    influencer: PublicCampaignInfluencer,
    columnKey: string,
  ) => {
    switch (columnKey) {
      case 'name':
        return influencer.social_account?.full_name || '';
      case 'followers':
        return influencer.social_account?.followers_count || 0;
      case 'engagementRate':
        return getEngagementRate(influencer);
      case 'engagements':
        return getAverageLikes(influencer);
      case 'avgLikes':
        return getAverageLikes(influencer);
      case 'avgViews':
        return getAverageViews(influencer);
      case 'viewsMultiplier':
        const avgViewsForMulti = getAverageViews(influencer);
        const followersForMulti =
          influencer.social_account?.followers_count || 0;

        if (avgViewsForMulti <= 0 || followersForMulti <= 0) {
          return 0;
        }

        return avgViewsForMulti / followersForMulti;
      case 'budget':
        return getBudgetSortingValue(influencer);
      case 'cpv':
        const budgetInfo = getBudgetInfo(influencer);
        const budget = budgetInfo.amount || 0;
        const avgViewsForCPV = getAverageViews(influencer);

        if (budget <= 0 || avgViewsForCPV <= 0) {
          return 0;
        }

        return budget / avgViewsForCPV;
      case 'status':
        const localStatus =
          localInfluencerUpdates[influencer.id]?.client_review_status;
        return (
          localStatus?.name ||
          influencer.client_review_status?.name ||
          'pending_review'
        );
      case 'counterBudget':
        const clientOffers =
          influencer.price_negotiations?.filter(
            (n) => n.proposed_by_type === 'client',
          ) || [];
        if (clientOffers.length > 0) {
          const latest = clientOffers.reduce((a, b) =>
            a.round_number > b.round_number ? a : b,
          );
          return parseFloat(latest.proposed_price) || 0;
        }
        return counterBudgets[influencer.id]?.amount || 0;
      case 'comment':
        return comments[influencer.id]?.length || 0;
      default:
        return '';
    }
  };

  // Filter and sort influencers
  const filteredInfluencers = useMemo(() => {
    if (!influencers || !Array.isArray(influencers)) {
      return [];
    }
    return influencers.filter((influencer) => {
      const fullName = (
        influencer.social_account?.full_name || ''
      ).toLowerCase();
      const handle = (
        influencer.social_account?.account_handle || ''
      ).toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || handle.includes(search);
    });
  }, [influencers, searchTerm]);

  // Sort filtered influencers
  const sortedInfluencers = useMemo(() => {
    if (!sortConfig?.key || !sortConfig.direction) {
      return filteredInfluencers;
    }

    return [...filteredInfluencers].sort((a, b) => {
      const aValue = getColumnValue(a, sortConfig.key);
      const bValue = getColumnValue(b, sortConfig.key);

      if (aValue === null || aValue === undefined)
        return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined)
        return sortConfig.direction === 'asc' ? -1 : 1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [
    filteredInfluencers,
    sortConfig,
    counterBudgets,
    localInfluencerUpdates,
    comments,
  ]);

  // Pagination
  const totalPages = Math.ceil(sortedInfluencers.length / itemsPerPage);
  const paginatedInfluencers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedInfluencers.slice(startIndex, endIndex);
  }, [sortedInfluencers, currentPage, itemsPerPage]);

  // Toggle influencer selection
  const toggleInfluencerSelection = (id: string) => {
    const newSelected = new Set(selectedInfluencers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInfluencers(newSelected);
  };

  // Select All checkbox functionality
  const handleSelectAll = () => {
    if (selectedInfluencers.size === paginatedInfluencers.length) {
      const currentPageIds = new Set(paginatedInfluencers.map((inf) => inf.id));
      const newSelection = new Set(selectedInfluencers);
      currentPageIds.forEach((id) => newSelection.delete(id));
      setSelectedInfluencers(newSelection);
    } else {
      const newSelection = new Set(selectedInfluencers);
      paginatedInfluencers.forEach((inf) => newSelection.add(inf.id));
      setSelectedInfluencers(newSelection);
    }
  };

  // Check if all current page influencers are selected
  const isAllSelected =
    paginatedInfluencers.length > 0 &&
    paginatedInfluencers.every((inf) => selectedInfluencers.has(inf.id));
  const isPartiallySelected =
    paginatedInfluencers.some((inf) => selectedInfluencers.has(inf.id)) &&
    !isAllSelected;

  // Handle sorting
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig?.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key: columnKey, direction });
  };

  // Get sort icon
  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0.5">
          <svg
            className="w-3 h-3 text-gray-400 drop-shadow-sm"
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
            className="w-3 h-3 text-gray-400 -mt-0.5 drop-shadow-sm"
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

    if (sortConfig.direction === 'asc') {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg
            className="w-3.5 h-3.5 text-purple-600 drop-shadow-md filter brightness-110"
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
            className="w-3 h-3 text-gray-300 -mt-0.5 drop-shadow-sm"
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
            className="w-3 h-3 text-gray-300 drop-shadow-sm"
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
            className="w-3.5 h-3.5 text-purple-600 -mt-0.5 drop-shadow-md filter brightness-110"
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

  // SECURITY: Toggle column visibility - only allow admin-approved columns
  const toggleColumnVisibility = (columnKey: string) => {
    // Security check: Only allow toggling admin-approved columns
    if (!adminApprovedColumns.includes(columnKey)) {
      console.warn(`Attempted to toggle non-approved column: ${columnKey}`);
      return;
    }

    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  // Handle onboarding (for public view this might be different)
  const handleOnboardSelected = async () => {
    if (selectedInfluencers.size === 0) return;

    setIsOnboarding(true);
    setLocalError(null);

    try {
      // In public view, this might trigger different logic
      console.log('Onboard selected:', Array.from(selectedInfluencers));
      // Implement public onboarding logic here
      setSelectedInfluencers(new Set());
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Failed to onboard influencers',
      );
    } finally {
      setIsOnboarding(false);
    }
  };

  // SECURITY: Only show admin-approved columns
  const visibleColumnsData = allColumns.filter((column) =>
    visibleColumns.has(column.key),
  );

  // Loading state
  if (!influencers) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading influencers...</span>
        </div>
      </div>
    );
  }

  // Check if token is missing
  const token = getTokenFromURL();
  if (!token) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">
              Authentication Token Required
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Please access this page with a valid token parameter
            </p>
          </div>
        </div>
      </div>
    );
  }

  // SECURITY: If no admin-approved columns, show restricted access message
  if (adminApprovedColumns.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-orange-500 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 0h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-gray-700 font-medium">Access Restricted</p>
            <p className="text-gray-500 text-sm mt-1">
              No columns have been approved for viewing by the administrator
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Status Update Messages */}
      {statusUpdateError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {statusUpdateError}
        </div>
      )}

      {statusUpdateSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
          {statusUpdateSuccess}
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Ready to Onboard
        </h1>

        {/* Selected Influencers Summary Component */}
        <SelectedInfluencersSummary
          selectedInfluencers={selectedInfluencers}
          influencers={influencers || []}
          onClearSelection={() => setSelectedInfluencers(new Set())}
          averageViews={averageViewsMap}
        />

        {/* Search Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-2xl mr-3">
            <input
              type="text"
              placeholder="Search Influencer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-4 pr-10 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
              <svg
                className="w-5 h-5 text-gray-400"
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
      </div>

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

                {/* Dynamic Columns - Only show admin-approved columns */}
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

                {/* Column Toggle - Only show admin-approved columns */}
                <th
                  scope="col"
                  className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative min-w-[80px] w-[80px]"
                >
                  <ColumnToggleDropdown
                    allColumns={allColumns}
                    visibleColumns={visibleColumns}
                    onToggleColumn={toggleColumnVisibility}
                    showDropdown={showColumnDropdown}
                    onToggleDropdown={() =>
                      setShowColumnDropdown(!showColumnDropdown)
                    }
                  />
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
                        ? 'Try adjusting your search'
                        : 'No influencers are ready for onboarding yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedInfluencers.map((influencer, index) => (
                  <TableRow
                    key={influencer.id}
                    influencer={influencer}
                    index={index}
                    isSelected={selectedInfluencers.has(influencer.id)}
                    onToggleSelection={toggleInfluencerSelection}
                    visibleColumns={visibleColumns}
                    counterBudget={counterBudgets[influencer.id]}
                    onBudgetClick={(e) => handleBudgetClick(influencer, e)}
                    onCommentClick={(e) => handleCommentClick(influencer, e)}
                    averageViews={getAverageViews(influencer)}
                    onProfileClick={handleProfileClick}
                    clientReviewStatuses={clientReviewStatuses}
                    onStatusChange={handleClientReviewStatusChange}
                    isUpdatingStatus={updatingStatus.has(influencer.id)}
                    statusesLoading={statusesLoading}
                    localUpdate={localInfluencerUpdates[influencer.id]}
                    commentsCount={influencer?.comments_count || 0}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={sortedInfluencers.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            if (value === 'all') {
              setItemsPerPage(sortedInfluencers.length || 1);
            } else {
              setItemsPerPage(Number(value));
            }
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Popups */}
      <PublicCounterBudgetPopup
        influencer={selectedInfluencerForBudget}
        isOpen={budgetPopupOpen}
        onClose={() => {
          setBudgetPopupOpen(false);
          setSelectedInfluencerForBudget(null);
        }}
        position={budgetPopupPosition}
        onUpdate={(id, amount, currency) => {
          setCounterBudgets((prev) => ({
            ...prev,
            [id]: { amount, currency },
          }));
        }}
        currentBudget={
          selectedInfluencerForBudget
            ? counterBudgets[selectedInfluencerForBudget.id]
            : null
        }
        token={token}
      />

      <PublicCommentThreadPopup
        influencer={selectedInfluencerForComment}
        isOpen={commentPopupOpen}
        onClose={() => {
          setCommentPopupOpen(false);
          setSelectedInfluencerForComment(null);
        }}
        position={commentPopupPosition}
        onUpdate={(id, newComments) => {
          setComments((prev) => ({
            ...prev,
            [id]: newComments,
          }));
        }}
        token={token}
      />
    </div>
  );
};

export default PublicReadyToOnboard;
