// src/components/dashboard/campaign-funnel/outreach/selected-manually/index.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useOutreach } from '@/context/OutreachContext';
import { Campaign } from '@/types/campaign';
import { Status } from '@/types/statuses';
import { formatNumber } from '@/utils/format';
import SelectedInfluencersSummary from './SelectedInfluencersSummary';
import TableHeader from './TableHeader';
import TableRow from './TableRow';
import ColumnToggleDropdown from './ColumnToggleDropdown';
import Pagination from './Pagination';
import CounterBudgetPopup from './CounterBudgetPopup';
import CommentThreadPopup from './CommentThreadPopup';
import AvgViewsPopup from './AvgViewsPopup'; // NEW: Import the new popup
import { updateCampaignInfluencerClientReviewStatus } from '@/services/campaign-influencers/campaign-influencers.client';
import { updateInfluencerAverageViews } from '@/services/avg-views'; // NEW: Import the service
import { toast } from 'react-hot-toast';

interface SelectedManuallyProps {
  onBack: () => void;
  onAllOnboarded?: () => void;
  campaignData?: Campaign | null;
  clientReviewStatuses: Status[];
  statusesLoading: boolean;
  onStatusUpdate?: () => Promise<void>;
}

export interface ColumnConfig {
  key: string;
  label: string;
  width: string;
  defaultVisible: boolean;
}

// Helper function to get average views with fallback logic
const getAverageViewsValue = (influencer: any): number | null => {
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

  return null;
};
const SelectedManually: React.FC<SelectedManuallyProps> = ({
  onBack,
  onAllOnboarded,
  clientReviewStatuses,
  statusesLoading,
  onStatusUpdate,
  campaignData,
}) => {
  const {
    readyToOnboardInfluencers,
    onboardSelected,
    loading,
    error,
    refreshData,
    updateInfluencer,
  } = useOutreach();

  // Local state
  const [localInfluencerUpdates, setLocalInfluencerUpdates] = useState<
    Record<string, any>
  >({});
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);

  // UPDATED: Commented out 'engagements' from default visible columns
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      'name',
      'followers',
      'engagementRate',
      /* 'engagements', */ 'avgLikes',
      'avgViews',
      'viewsMultiplier',
      'budget',
      'cpv',
      'status',
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

  // NEW: Average Views state
  const [averageViews, setAverageViews] = useState<
    Record<string, number | null>
  >({});

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

  // NEW: Average Views popup state
  const [viewsPopupOpen, setViewsPopupOpen] = useState(false);
  const [selectedInfluencerForViews, setSelectedInfluencerForViews] = useState<
    any | null
  >(null);
  const [viewsPopupPosition, setViewsPopupPosition] = useState({ x: 0, y: 0 });

  // Status management
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

  // UPDATED: Column configuration - commented out engagements column
  const allColumns: ColumnConfig[] = [
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
    // { key: 'engagements', label: 'Eng', width: 'w-24', defaultVisible: true }, // COMMENTED OUT
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
    }, // NEW: Added avgViews column
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

  // Initialize states
  useEffect(() => {
    const initialBudgets: Record<
      string,
      { amount: number | null; currency: string }
    > = {};
    const initialNotes: Record<string, string> = {};
    const initialViews: Record<string, number | null> = {}; // NEW: Initialize views

    readyToOnboardInfluencers.forEach((inf) => {
      initialBudgets[inf.id] = {
        amount: 0,
        currency: 'USD',
      };
      initialNotes[inf.id] = inf.notes || '';
      // NEW: Initialize average views from existing data with fallback logic
      initialViews[inf.id] = getAverageViewsValue(inf);
    });

    setCounterBudgets(initialBudgets);
    setInfluencerNotes(initialNotes);
    setAverageViews(initialViews); // NEW: Set initial views
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
    const popupWidth = 350; // Reduced from 400
    const popupHeight = 300; // Reduced from 500 for more compact popup
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

    console.log('Comment button position:', {
      buttonRect: rect,
      scrollX,
      scrollY,
      finalPosition: { x: popupX, y: popupY },
      compactDimensions: { width: popupWidth, height: popupHeight },
    });

    setCommentPopupPosition({ x: popupX, y: popupY });
    setSelectedInfluencerForComment(influencer);
    setCommentPopupOpen(true);
  };

  // NEW: Handle views click
  const handleViewsClick = (influencer: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const position = calculatePopupPosition(
      event.currentTarget as HTMLElement,
      320,
      300,
    );
    setViewsPopupPosition(position);
    setSelectedInfluencerForViews(influencer);
    setViewsPopupOpen(true);
  };

  // NEW: Handle profile click - Opens Instagram profile in new tab
  const handleProfileClick = (influencer: any) => {
    if (influencer.social_account?.account_handle) {
      window.open(
        `https://instagram.com/${influencer.social_account.account_handle}`,
        '_blank',
      );
    }
  };

  // NEW: Handle views update
  const handleViewsUpdate = async (
    influencerId: string,
    views: number | null,
  ) => {
    try {
      console.log(
        'Updating views for influencer:',
        influencerId,
        'New views:',
        views,
      );

      // Update via API
      const updatedInfluencer = await updateInfluencerAverageViews(
        influencerId,
        views,
      );

      // Update local state
      setAverageViews((prev) => ({
        ...prev,
        [influencerId]: views,
      }));

      // Update local influencer updates to reflect the change
      setLocalInfluencerUpdates((prev) => ({
        ...prev,
        [influencerId]: {
          ...prev[influencerId],
          social_account: {
            ...prev[influencerId]?.social_account,
            additional_metrics: {
              ...prev[influencerId]?.social_account?.additional_metrics,
              average_views: views,
            },
          },
        },
      }));

      // Update the context if available
      if (updateInfluencer) {
        const currentInfluencer = readyToOnboardInfluencers.find(
          (inf) => inf.id === influencerId,
        );
        if (currentInfluencer?.social_account) {
          updateInfluencer(influencerId, {
            social_account: {
              ...currentInfluencer.social_account,
              additional_metrics: {
                ...currentInfluencer.social_account.additional_metrics,
                average_views: views,
              },
            },
          });
        }
      }

      setStatusUpdateSuccess(`Average views updated successfully!`);
      setTimeout(() => setStatusUpdateSuccess(null), 3000);
    } catch (error) {
      console.error('Failed to update average views:', error);
      setStatusUpdateError(
        error instanceof Error
          ? error.message
          : 'Failed to update average views',
      );
      setTimeout(() => setStatusUpdateError(null), 5000);
    }
  };

  // Handle client review status change
  const handleClientReviewStatusChange = async (
    influencerId: string,
    statusId: string,
  ) => {
    try {
      setUpdatingStatus((prev) => new Set([...prev, influencerId]));
      setStatusUpdateError(null);
      setStatusUpdateSuccess(null);

      // Find the selected status object
      const selectedStatus = clientReviewStatuses.find(
        (status) => status.id === statusId,
      );

      // Get current status before update for comparison
      const currentInfluencer = readyToOnboardInfluencers.find(
        (inf) => inf.id === influencerId,
      );
      const previousStatus =
        localInfluencerUpdates[influencerId]?.client_review_status ||
        currentInfluencer?.client_review_status;

      const updatedInfluencer =
        await updateCampaignInfluencerClientReviewStatus(influencerId, {
          client_review_status_id: statusId,
        });

      setLocalInfluencerUpdates((prev) => ({
        ...prev,
        [influencerId]: {
          ...prev[influencerId],
          client_review_status: updatedInfluencer.client_review_status,
        },
      }));

      updateInfluencer(influencerId, {
        client_review_status: updatedInfluencer.client_review_status,
      });

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

      await refreshData();

      if (onStatusUpdate) {
        await onStatusUpdate();
      }

      toast.success(
        `Status updated to "${selectedStatus?.name || 'unknown'}" successfully!`,
      );

      setTimeout(() => setStatusUpdateSuccess(null), 3000);
    } catch (error) {
      setStatusUpdateError(
        error instanceof Error ? error.message : 'Failed to update status',
      );
      setTimeout(() => setStatusUpdateError(null), 5000);
    } finally {
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(influencerId);
        return newSet;
      });
    }
  };

  /**
   * Get the counter budget value for sorting from price_negotiations
   */
  const getCounterBudgetValue = (influencer: any): number => {
    if (
      !influencer.price_negotiations ||
      influencer.price_negotiations.length === 0
    ) {
      return 0;
    }

    // Sort negotiations by round_number in descending order (latest first)
    const sortedNegotiations = [...influencer.price_negotiations].sort(
      (a: any, b: any) => b.round_number - a.round_number,
    );

    // Find the latest client counter offer (proposed_by_type === 'client')
    const latestClientOffer = sortedNegotiations.find(
      (neg: any) => neg.proposed_by_type === 'client',
    );

    if (latestClientOffer) {
      return parseFloat(latestClientOffer.proposed_price) || 0;
    }

    return 0;
  };

  /**
   * UPDATED: Helper function for budget sorting - Two-tier sorting (amount first, then currency)
   */
  const getBudgetSortingValue = (influencer: any): number => {
    const amount = influencer.collaboration_price || 0;
    const currency = influencer.currency || 'USD';

    // Create a compound sorting value: amount as primary, currency as secondary
    // Multiply amount by 1000 to give it priority, then add currency code value for secondary sort
    const currencyValue =
      currency.charCodeAt(0) + currency.charCodeAt(1) + currency.charCodeAt(2);

    return amount * 1000 + currencyValue / 1000;
  };

  // Get column value for sorting
  const getColumnValue = (influencer: any, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return influencer.social_account?.full_name || '';
      case 'followers':
        return influencer.social_account?.followers_count || 0;
      case 'engagementRate':
        return (
          influencer.social_account?.additional_metrics?.engagementRate || 0
        );
      case 'engagements':
        return (
          influencer.social_account?.additional_metrics?.average_likes || 0
        );
      case 'avgLikes':
        return (
          influencer.social_account?.additional_metrics?.average_likes || 0
        );
      case 'avgViews': // NEW: Add sorting for avgViews with fallback logic
        return (
          averageViews[influencer.id] ?? getAverageViewsValue(influencer) ?? 0
        );
      case 'viewsMultiplier':
        // UPDATED: Use Avg Views ÷ Followers formula for sorting with fallback
        const avgViewsForMulti =
          averageViews[influencer.id] ?? getAverageViewsValue(influencer) ?? 0;
        const followersForMulti =
          influencer.social_account?.followers_count || 0;

        if (avgViewsForMulti <= 0 || followersForMulti <= 0) {
          return 0;
        }

        return avgViewsForMulti / followersForMulti;
      case 'budget':
        // UPDATED: Use two-tier sorting for budget
        return getBudgetSortingValue(influencer);
      case 'cpv':
        // UPDATED: Apply CPV formula: Budget ÷ Avg Views with fallback
        const budget = influencer.collaboration_price || 0;
        const avgViewsForCPV =
          averageViews[influencer.id] ?? getAverageViewsValue(influencer) ?? 0;

        // Return 0 if no budget or views to avoid division by zero
        if (budget <= 0 || avgViewsForCPV <= 0) {
          return 0;
        }

        return budget / avgViewsForCPV;
      case 'status':
        return influencer.client_review_status?.name || 'pending_review';
      case 'counterBudget':
        // Keep this for potential sorting functionality even though column is not displayed
        return getCounterBudgetValue(influencer);
      case 'comment':
        return comments[influencer.id]?.length || 0;
      default:
        return '';
    }
  };

  // Filter and sort influencers
  const filteredInfluencers = useMemo(() => {
    return readyToOnboardInfluencers.filter((influencer) => {
      const fullName = (
        influencer.social_account?.full_name || ''
      ).toLowerCase();
      const handle = (
        influencer.social_account?.account_handle || ''
      ).toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || handle.includes(search);
    });
  }, [readyToOnboardInfluencers, searchTerm]);

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
  }, [filteredInfluencers, sortConfig, counterBudgets, comments, averageViews]); // NEW: Added averageViews to dependency

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

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  // Handle onboarding
  const handleOnboardSelected = async () => {
    if (selectedInfluencers.size === 0) return;

    setIsOnboarding(true);
    setLocalError(null);

    try {
      const influencerIds = Array.from(selectedInfluencers);
      await onboardSelected(influencerIds);
      setSelectedInfluencers(new Set());

      if (
        selectedInfluencers.size === readyToOnboardInfluencers.length &&
        onAllOnboarded
      ) {
        onAllOnboarded();
      }
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Failed to onboard influencers',
      );
    } finally {
      setIsOnboarding(false);
    }
  };

  const visibleColumnsData = allColumns.filter((column) =>
    visibleColumns.has(column.key),
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Loading influencers...</span>
        </div>
      </div>
    );
  }

  // Error state
  const displayError =
    localError || (error && readyToOnboardInfluencers.length === 0);
  if (displayError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load influencers</p>
          <p className="text-gray-500 text-sm mt-1">{displayError}</p>
          <div className="flex justify-center space-x-3 mt-4">
            <button
              onClick={() => setLocalError(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Go Back
            </button>
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

        {/* Selected Influencers Summary Component - UPDATED: Pass averageViews */}
        <SelectedInfluencersSummary
          selectedInfluencers={selectedInfluencers}
          influencers={readyToOnboardInfluencers}
          onClearSelection={() => setSelectedInfluencers(new Set())}
          averageViews={averageViews}
        />

        {/* Search and Action Buttons */}
        <TableHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOnboard={handleOnboardSelected}
          onBack={onBack}
          selectedCount={selectedInfluencers.size}
          isOnboarding={isOnboarding}
          campaignData={campaignData}
          visibleColumns={visibleColumns}
        />
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
                    onViewsClick={(e) => handleViewsClick(influencer, e)}
                    averageViews={averageViews[influencer.id]}
                    onProfileClick={handleProfileClick} // NEW: Add profile click handler
                    clientReviewStatuses={clientReviewStatuses}
                    onStatusChange={handleClientReviewStatusChange}
                    isUpdatingStatus={updatingStatus.has(influencer.id)}
                    statusesLoading={statusesLoading}
                    localUpdate={localInfluencerUpdates[influencer.id]}
                    commentsCount={influencer?.comments_count || 0} // NEW: Pass actual comments count
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
      <CounterBudgetPopup
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
      />

      <CommentThreadPopup
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
      />

      {/* NEW: Average Views Popup */}
      <AvgViewsPopup
        influencer={selectedInfluencerForViews}
        isOpen={viewsPopupOpen}
        onClose={() => {
          setViewsPopupOpen(false);
          setSelectedInfluencerForViews(null);
        }}
        position={viewsPopupPosition}
        onUpdate={handleViewsUpdate}
        currentViews={
          selectedInfluencerForViews
            ? averageViews[selectedInfluencerForViews.id]
            : null
        }
      />
    </div>
  );
};

export default SelectedManually;
