// src/components/public/PublicShortlisted.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicCampaignInfluencersResponse } from '@/types/public-campaign-influencers';
import { formatNumber } from '@/utils/format';
import { Status } from '@/types/statuses';
import { getStatuses } from '@/services/statuses/statuses.client';
import { toast } from 'react-hot-toast';
import {
  updatePublicShortlistedStatus,
  bulkUpdatePublicShortlistedStatus, // 🆕 ADD THIS
} from '@/services/public-campaign-influencers';
import ShortlistedInfluencersSummary from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencersSummary';
import ShortlistedSummaryV2 from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedSummaryV2';
import ColumnVisibility, {
  ColumnDefinition,
} from '@/components/ui/table/ColumnVisibility';
import ShortlistedStatusCell from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedStatusCell';
// Add these imports at the top
import { BsInstagram, BsTiktok, BsYoutube } from 'react-icons/bs';
import { formatLocation } from '@/utils/formatLocation';
import TagsColumn from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/TagsColumn';
import SocialColumn from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/SocialColumn';
import {
  useColumnResize,
  calculateMaxWidthFromTags,
} from '@/hooks/useColumnResize';
import ResizeHandle from '@/components/ui/table/ResizeHandle';
import XCampaignsColumn from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/XCampaignsColumn';
import { PastCampaign } from '@/types/campaign-influencers';
import ShortlistedGridView from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedGridView';

interface PublicShortlistedProps {
  data: PublicCampaignInfluencersResponse;
}

const PublicShortlisted: React.FC<PublicShortlistedProps> = ({ data }) => {
  const { influencers } = data;
  const searchParams = useSearchParams();

  // SECURITY: Get admin-approved visible columns from session metadata
  const getAdminApprovedColumns = (): string[] => {
    const sessionMetadata = data?.session?.session_metadata as any;

    if (
      sessionMetadata?.visible_columns &&
      Array.isArray(sessionMetadata.visible_columns)
    ) {
      console.log(
        '📋 Admin-approved columns:',
        sessionMetadata.visible_columns,
      );
      return sessionMetadata.visible_columns;
    }

    console.warn(
      '⚠️ No admin-approved columns found in session metadata. Showing default columns.',
    );
    // Default columns if none specified
    return ['name', 'followers', 'engagement_rate', 'avg_likes', 'location'];
  };

  const adminApprovedColumns = getAdminApprovedColumns();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInfluencers, setSelectedInfluencers] = useState<Set<string>>(
    new Set(),
  );
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(adminApprovedColumns),
  );
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
  // View mode state (table or grid)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null,
  });

  // Status management
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [shortlistedStatuses, setShortlistedStatuses] = useState<Status[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const token = searchParams.get('token') || '';
  // NEW: Track local updates for immediate UI feedback
  const [localInfluencerUpdates, setLocalInfluencerUpdates] = useState<
    Record<string, any>
  >({});

  // ========== PLATFORM DETECTION HELPERS ==========
  // ========== PLATFORM DETECTION HELPERS ==========
  // Helper to get platform name from influencer
  const getPlatformName = (influencer: any): string => {
    const additionalMetrics = influencer.social_account
      ?.additional_metrics as any;

    // 1️⃣ FIRST: Check additional_metrics.url (most reliable for TikTok!)
    const metricsUrl = additionalMetrics?.url || '';
    if (metricsUrl.includes('tiktok.com')) return 'tiktok';
    if (metricsUrl.includes('youtube.com')) return 'youtube';
    if (metricsUrl.includes('instagram.com')) return 'instagram';

    // 2️⃣ SECOND: Try work_platform from additional_metrics
    const workPlatform = additionalMetrics?.work_platform?.name;
    if (workPlatform) {
      return workPlatform.toLowerCase();
    }

    // 3️⃣ THIRD: Try direct platform access
    const directPlatform = influencer.social_account?.platform?.name;
    if (directPlatform) {
      return directPlatform.toLowerCase();
    }

    // 4️⃣ FOURTH: Check account_url
    const accountUrl = influencer.social_account?.account_url || '';
    if (accountUrl.includes('tiktok.com')) return 'tiktok';
    if (accountUrl.includes('youtube.com')) return 'youtube';
    if (accountUrl.includes('instagram.com')) return 'instagram';

    return 'instagram'; // Default fallback
  };

  // Platform-specific checks
  const isInstagram = (influencer: any): boolean =>
    getPlatformName(influencer).includes('instagram');

  const isTikTok = (influencer: any): boolean =>
    getPlatformName(influencer).includes('tiktok');

  const isYouTube = (influencer: any): boolean =>
    getPlatformName(influencer).includes('youtube');

  // Get the correct profile URL based on platform
  const getProfileUrl = (influencer: any): string => {
    const additionalMetrics = influencer.social_account
      ?.additional_metrics as any;
    const username = influencer.social_account?.account_handle;

    // 1️⃣ FIRST: Check additional_metrics.url (contains actual platform URL)
    const metricsUrl = additionalMetrics?.url;
    if (metricsUrl && metricsUrl.startsWith('http')) {
      return metricsUrl;
    }

    // 2️⃣ SECOND: Check account_url
    const accountUrl = influencer.social_account?.account_url;
    if (accountUrl && accountUrl.startsWith('http')) {
      return accountUrl;
    }

    // 3️⃣ THIRD: Generate URL based on detected platform
    if (!username) return '';

    const platformName = getPlatformName(influencer);

    if (platformName.includes('tiktok')) {
      return `https://www.tiktok.com/@${username}`;
    }
    if (platformName.includes('youtube')) {
      return `https://www.youtube.com/@${username}`;
    }
    // Default to Instagram
    return `https://www.instagram.com/${username}`;
  };

  // Get follower/subscriber count based on platform
  const getFollowerCount = (influencer: any): number => {
    if (isYouTube(influencer)) {
      // YouTube uses subscribers
      const metrics = influencer.social_account?.additional_metrics as any;
      return (
        influencer.social_account?.subscribers_count ||
        metrics?.subscriber_count ||
        influencer.social_account?.followers_count ||
        0
      );
    }
    // Instagram and TikTok use followers
    return influencer.social_account?.followers_count || 0;
  };

  // Get follower/subscriber label based on platform
  const getFollowerLabel = (influencer: any): string => {
    if (isYouTube(influencer)) {
      return 'Subscribers';
    }
    return 'Followers';
  };

  // Get platform icon color
  const getPlatformColor = (influencer: any): string => {
    const platform = getPlatformName(influencer);
    if (platform.includes('tiktok')) return 'text-black';
    if (platform.includes('youtube')) return 'text-red-600';
    return 'text-pink-500'; // Instagram
  };

  // Get platform icon component
  const getPlatformIcon = (influencer: any): React.ReactNode => {
    const platform = getPlatformName(influencer);

    if (platform.includes('tiktok')) {
      return <BsTiktok className="text-black" size={12} />;
    }
    if (platform.includes('youtube')) {
      return <BsYoutube className="text-red-600" size={12} />;
    }
    // Default: Instagram
    return <BsInstagram className="text-pink-500" size={12} />;
  };

  // ========== LINK EXPIRY HELPERS ==========
  // Format expiry date for display
  const formatExpiryDate = (expiresAt: string | undefined): string => {
    if (!expiresAt) return 'Unknown';

    try {
      const date = new Date(expiresAt);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'Unknown';
    }
  };

  // Calculate remaining time
  const getRemainingTime = (expiresAt: string | undefined): string => {
    if (!expiresAt) return '';

    try {
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diffMs = expiry.getTime() - now.getTime();

      if (diffMs <= 0) return 'Expired';

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );

      if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours}h remaining`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    } catch {
      return '';
    }
  };

  // ========== TAGS COLUMN RESIZE (using reusable hook) ==========
  const maxTagsCount = useMemo(() => {
    return Math.max(
      ...(influencers || []).map((inf) => ((inf as any).tags || []).length),
      3,
    );
  }, [influencers]);

  const tagsColumnResize = useColumnResize({
    defaultWidth: 96,
    minWidth: 96,
    maxWidth: calculateMaxWidthFromTags(maxTagsCount),
  });
  // Fetch shortlisted statuses
  useEffect(() => {
    const fetchShortlistedStatuses = async () => {
      try {
        setStatusesLoading(true);
        const allStatuses = await getStatuses('campaign_influencer');
        const shortStatuses = allStatuses.filter(
          (status) => status.applies_to_field === 'shortlisted_status_id',
        );
        setShortlistedStatuses(shortStatuses);
        console.log('📊 Loaded shortlisted statuses:', shortStatuses.length);
      } catch (error) {
        console.error('❌ Error fetching shortlisted statuses:', error);
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchShortlistedStatuses();
  }, []);
  // Filter out deleted influencers for summary
  const activeInfluencers = useMemo(() => {
    return (influencers || []).filter((inf) => !(inf as any).deleted_at);
  }, [influencers]);

  // Close page size dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowPageSizeDropdown(false);
    };

    if (showPageSizeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPageSizeDropdown]);

  // Helper function to get token from URL
  const getTokenFromURL = (): string | null => {
    return searchParams.get('token');
  };

  // Handle shortlisted status change
  const handleShortlistedStatusChange = async (
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

      const selectedStatus = shortlistedStatuses.find(
        (status) => status.id === statusId,
      );

      console.log(
        `📤 Updating shortlisted status for ${influencerId} to ${statusId}`,
      );

      await updatePublicShortlistedStatus(influencerId, {
        token,
        shortlisted_status_id: statusId,
      });

      // ✅ NEW: Update local state immediately for instant UI feedback
      setLocalInfluencerUpdates((prev) => ({
        ...prev,
        [influencerId]: {
          ...prev[influencerId],
          shortlisted_status: {
            id: statusId,
            name: selectedStatus?.name || 'pending',
            color: selectedStatus?.color || '#6B7280',
          },
        },
      }));

      toast.success(
        `Status updated to "${selectedStatus?.name || 'unknown'}" successfully!`,
      );

      console.log('✅ Status updated successfully');
    } catch (error) {
      console.error('❌ Error updating status:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(influencerId);
        return newSet;
      });
    }
  };

  // 🆕 NEW: Bulk status update handler
  const handleBulkShortlistedStatusUpdate = async (statusId: string) => {
    const token = getTokenFromURL();

    if (!token) {
      toast.error('Authentication token is required');
      return;
    }

    if (selectedInfluencers.size === 0) {
      toast.error('Please select influencers first');
      return;
    }

    try {
      // Mark all selected as updating
      const selectedIds = Array.from(selectedInfluencers);
      setUpdatingStatus((prev) => new Set([...prev, ...selectedIds]));

      const selectedStatus = shortlistedStatuses.find(
        (status) => status.id === statusId,
      );

      console.log(
        `📤 Bulk updating ${selectedIds.length} influencers to ${statusId}`,
      );

      const result = await bulkUpdatePublicShortlistedStatus(
        selectedIds,
        statusId,
        token,
      );

      // ✅ Update local state for all selected influencers
      if (result.success && selectedStatus) {
        const bulkUpdates: Record<string, any> = {};

        selectedIds.forEach((influencerId) => {
          bulkUpdates[influencerId] = {
            shortlisted_status: {
              id: statusId,
              name: selectedStatus.name,
              color: selectedStatus.color || '#6B7280',
            },
          };
        });

        setLocalInfluencerUpdates((prev) => ({
          ...prev,
          ...bulkUpdates,
        }));

        console.log('✅ Local state updated for bulk operation');
      }

      // Clear selection
      setSelectedInfluencers(new Set());

      // Show success message
      if (result.failed_count > 0) {
        toast.success(
          `${result.updated_count} influencer(s) updated successfully. ${result.failed_count} failed.`,
        );
      } else {
        toast.success(
          `All ${result.updated_count} influencer(s) updated successfully!`,
        );
      }

      console.log('✅ Bulk update completed:', result);
    } catch (error) {
      console.error('❌ Error bulk updating status:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to bulk update status';
      toast.error(errorMessage);
    } finally {
      // Clear updating status for all
      setUpdatingStatus(new Set());
    }
  };

  // Column definitions for Shortlisted table
  // Column definitions for Shortlisted table - with getValue for ColumnVisibility component
  const allColumnsDefinition: ColumnDefinition<any>[] = [
    {
      key: 'name',
      label: 'Name',
      width: 'w-56',
      defaultVisible: true,
      getValue: (influencer) => influencer.social_account?.full_name || null,
    },
    // Inside allColumnsDefinition array, add after 'name' column:
    {
      key: 'tags',
      label: 'Tags',
      width: '', // Dynamic - controlled by tagsColumnWidth state
      defaultVisible: true,
      getValue: (influencer) => (influencer as any).tags || [],
    },
    // X-Campaigns Column
    {
      key: 'x_campaigns',
      label: 'X-Campaigns',
      width: 'w-28',
      defaultVisible: true,
      getValue: (influencer) => (influencer as any).past_campaigns?.length || 0,
    },
    {
      key: 'followers',
      label: 'Followers',
      width: 'w-24',
      defaultVisible: true,
      getValue: (influencer) => getFollowerCount(influencer),
    },
    {
      key: 'engagement_rate',
      label: 'Eng Rate',
      width: 'w-24',
      defaultVisible: true,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return metrics?.engagementRate || metrics?.engagement_rate || null;
      },
    },
    {
      key: 'avg_likes',
      label: 'Avg Likes',
      width: 'w-24',
      defaultVisible: true,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return metrics?.average_likes || null;
      },
    },
    {
      key: 'avg_views',
      label: 'Avg Views',
      width: 'w-24',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        if (metrics?.average_views) return metrics.average_views;
        if (metrics?.instagram_options?.reel_views) {
          const reelViews = metrics.instagram_options.reel_views;
          if (typeof reelViews === 'object' && reelViews.min !== undefined) {
            return (reelViews.min + reelViews.max) / 2;
          }
          return reelViews;
        }
        return null;
      },
    },
    {
      key: 'location',
      label: 'Location',
      width: 'w-32',
      defaultVisible: true,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        const location =
          metrics?.creator_location ||
          influencer.social_account?.creator_location;
        return formatLocation(location);
      },
    },
    {
      key: 'gender',
      label: 'Gender',
      width: 'w-20',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return metrics?.gender || influencer.social_account?.gender || null;
      },
    },
    {
      key: 'language',
      label: 'Language',
      width: 'w-24',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return metrics?.language || influencer.social_account?.language || null;
      },
    },
    {
      key: 'age_group',
      label: 'Age Group',
      width: 'w-24',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return (
          metrics?.age_group || influencer.social_account?.age_group || null
        );
      },
    },
    {
      key: 'audience_age_groups',
      label: 'Audience Age',
      width: 'w-32',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return (
          metrics?.audience_age_groups ||
          metrics?.filter_match?.audience_age ||
          null
        );
      },
    },
    {
      key: 'age_distribution',
      label: 'Age Dist',
      width: 'w-32',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return metrics?.audience_demographics?.age_distribution || null;
      },
    },
    {
      key: 'audience_gender_distribution',
      label: 'Audience Gender',
      width: 'w-32',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return (
          metrics?.filter_match?.audience_gender ||
          metrics?.audience_demographics?.gender_distribution ||
          null
        );
      },
    },
    {
      key: 'audience_locations',
      label: 'Audience Location',
      width: 'w-36',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return (
          metrics?.audience_locations ||
          metrics?.filter_match?.audience_locations ||
          null
        );
      },
    },
    {
      key: 'content_count',
      label: 'Posts',
      width: 'w-20',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return (
          metrics?.content_count ||
          influencer.social_account?.media_count ||
          null
        );
      },
    },
    {
      key: 'platform_account_type',
      label: 'Account Type',
      width: 'w-28',
      defaultVisible: false,
      getValue: (influencer) => {
        const metrics = influencer.social_account?.additional_metrics as any;
        return (
          metrics?.platform_account_type ||
          influencer.social_account?.platform_account_type ||
          null
        );
      },
    },
    // Add this in allColumnsDefinition array
    {
      key: 'social',
      label: 'Social',
      width: 'w-24',
      defaultVisible: true,
      getValue: (influencer) => {
        const SOCIAL_TYPES = [
          'tiktok',
          'youtube',
          'threads',
          'linkedin',
          'instagram',
          'twitter',
          'facebook',
        ];
        const contacts = influencer.social_account?.contacts || [];
        const additionalMetrics = influencer.social_account
          ?.additional_metrics as any;
        const contactDetails = additionalMetrics?.contact_details || [];

        const allContacts = [...contacts, ...contactDetails];
        const socialCount = allContacts.filter((c: any) => {
          const type = (c.contact_type || c.type || '').toLowerCase();
          return SOCIAL_TYPES.includes(type);
        }).length;

        return socialCount;
      },
    },
    {
      key: 'price',
      label: 'Price',
      width: 'w-28',
      defaultVisible: true,
      getValue: (influencer) => {
        const priceApproved = Boolean((influencer as any).price_approved);
        if (!priceApproved) return null;
        return Number((influencer as any).total_price) || null;
      },
    },
    {
      key: 'cpv',
      label: 'CPV',
      width: 'w-24',
      defaultVisible: true,
      getValue: (influencer) => {
        const priceApproved = Boolean((influencer as any).price_approved);
        if (!priceApproved) return null;
        const budget = Number((influencer as any).total_price) || 0;
        const metrics = influencer.social_account?.additional_metrics as any;
        const avgViews =
          metrics?.average_views || metrics?.instagram_options?.reel_views || 0;
        if (budget <= 0 || avgViews <= 0) return null;
        return budget / avgViews;
      },
    },

    {
      key: 'shortlisted_status',
      label: 'Status',
      width: 'w-28',
      defaultVisible: true,
      getValue: (influencer) =>
        (influencer as any).shortlisted_status?.name || 'pending',
    },
  ];

  // Filter columns to only show admin-approved ones
  const allColumns = useMemo(() => {
    return allColumnsDefinition.filter((col) =>
      adminApprovedColumns.includes(col.key),
    );
  }, [adminApprovedColumns]);

  // Get visible columns
  const visibleColumnsData = useMemo(() => {
    return allColumns.filter((column) => visibleColumns.has(column.key));
  }, [allColumns, visibleColumns]);

  // Search filtering
  const filteredInfluencers = useMemo(() => {
    if (!searchTerm) return influencers || [];

    const term = searchTerm.toLowerCase();
    return (influencers || []).filter((influencer) => {
      const name = influencer.social_account?.full_name?.toLowerCase() || '';
      const username =
        influencer.social_account?.account_handle?.toLowerCase() || '';
      return name.includes(term) || username.includes(term);
    });
  }, [influencers, searchTerm]);

  // Sorting - using column.getValue() for all columns (matching main ShortlistedTable)
  const sortedInfluencers = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredInfluencers;
    }

    const column = allColumns.find((col) => col.key === sortConfig.key);
    if (!column) return filteredInfluencers;

    return [...filteredInfluencers].sort((a, b) => {
      // Special handling for Tags column
      if (sortConfig.key === 'tags') {
        const aTags: any[] = (a as any).tags || [];
        const bTags: any[] = (b as any).tags || [];

        // First: Sort by tag count
        if (aTags.length !== bTags.length) {
          return sortConfig.direction === 'asc'
            ? aTags.length - bTags.length
            : bTags.length - aTags.length;
        }

        // Second: If counts are equal, sort by first tag name alphabetically
        const aFirstTag =
          aTags.length > 0 ? (aTags[0].tag || '').toLowerCase() : '';
        const bFirstTag =
          bTags.length > 0 ? (bTags[0].tag || '').toLowerCase() : '';

        return sortConfig.direction === 'asc'
          ? aFirstTag.localeCompare(bFirstTag)
          : bFirstTag.localeCompare(aFirstTag);
      }

      // Special handling for Engagement Rate column
      if (sortConfig.key === 'engagement_rate') {
        const aMetrics = (a.social_account?.additional_metrics as any) || {};
        const bMetrics = (b.social_account?.additional_metrics as any) || {};

        // Get raw engagement rate value
        let aRate = aMetrics.engagementRate ?? aMetrics.engagement_rate ?? 0;
        let bRate = bMetrics.engagementRate ?? bMetrics.engagement_rate ?? 0;

        // Convert string to number if needed (e.g., "90.60%" -> 90.60)
        if (typeof aRate === 'string') {
          aRate = parseFloat(aRate.replace('%', '')) || 0;
        }
        if (typeof bRate === 'string') {
          bRate = parseFloat(bRate.replace('%', '')) || 0;
        }

        // Normalize: if value < 1, it's in decimal form (0.09 = 9%)
        if (aRate > 0 && aRate < 1) aRate = aRate * 100;
        if (bRate > 0 && bRate < 1) bRate = bRate * 100;

        return sortConfig.direction === 'asc' ? aRate - bRate : bRate - aRate;
      }

      const aValue = column.getValue(a);
      const bValue = column.getValue(b);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined)
        return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined)
        return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      // String comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredInfluencers, sortConfig, allColumns]);

  // Pagination
  const paginatedInfluencers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedInfluencers.slice(startIndex, endIndex);
  }, [sortedInfluencers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedInfluencers.length / itemsPerPage);

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    if (!adminApprovedColumns.includes(columnKey)) {
      console.warn(`⚠️ Attempted to toggle non-approved column: ${columnKey}`);
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

  // Handle sorting - matching main ShortlistedTable logic
  const handleSort = useCallback(
    (columnKey: string) => {
      let direction: 'asc' | 'desc' = 'asc';

      if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
        direction = 'desc';
      }

      setSortConfig({ key: columnKey, direction });
    },
    [sortConfig],
  );

  // Get sort icon for column headers - matching main ShortlistedTable
  const getSortIcon = useCallback(
    (columnKey: string) => {
      if (sortConfig.key !== columnKey) {
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
    },
    [sortConfig],
  );

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedInfluencers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedInfluencers(newSelected);
  };

  // Toggle all selection
  const toggleAllSelection = () => {
    if (selectedInfluencers.size === paginatedInfluencers.length) {
      setSelectedInfluencers(new Set());
    } else {
      setSelectedInfluencers(
        new Set(paginatedInfluencers.map((inf) => inf.id)),
      );
    }
  };

  // Helper function to get value from influencer
  const getInfluencerValue = (influencer: any, columnKey: string): any => {
    const account = influencer.social_account;
    const metrics = (account?.additional_metrics as any) || {};

    switch (columnKey) {
      case 'name':
        return account?.full_name || 'N/A';
      case 'followers':
        return getFollowerCount(influencer);
      case 'engagement_rate':
        const engRate = metrics.engagementRate || metrics.engagement_rate || 0;
        // Convert decimal to percentage (0.0832 -> 8.32)
        return typeof engRate === 'number'
          ? engRate > 1
            ? engRate
            : engRate * 100
          : 0;
      case 'avg_likes':
        return metrics.average_likes || 0;
      case 'avg_views':
        // First try average_views
        if (metrics.average_views && metrics.average_views > 0) {
          return metrics.average_views;
        }

        // Fallback to instagram_options.reel_views
        const instagramOptions = metrics.instagram_options;
        if (instagramOptions?.reel_views) {
          if (
            typeof instagramOptions.reel_views === 'object' &&
            instagramOptions.reel_views.min !== undefined
          ) {
            return (
              (instagramOptions.reel_views.min +
                instagramOptions.reel_views.max) /
              2
            );
          }
          if (typeof instagramOptions.reel_views === 'number') {
            return instagramOptions.reel_views;
          }
        }

        // Fallback to filter_match
        const filterMatchViews = metrics.filter_match;
        if (filterMatchViews?.instagram_options?.reel_views) {
          const reelViews = filterMatchViews.instagram_options.reel_views;
          if (typeof reelViews === 'number') {
            return reelViews;
          }
        }

        return 0;
      case 'location':
        const locationData =
          metrics.creator_location || account?.creator_location;
        return formatLocation(locationData);
      case 'gender':
        return metrics.gender || account?.gender || 'N/A';
      case 'language':
        return metrics.language || account?.language || 'N/A';
      case 'age_group':
        return metrics.age_group || account?.age_group || 'N/A';
      case 'audience_age_groups':
        // Check multiple sources
        let ageGroups = metrics.audience_age_groups;

        if (!ageGroups) {
          const filterMatch = metrics.filter_match;
          if (filterMatch?.audience_age) {
            ageGroups = filterMatch.audience_age;
          }
        }

        if (!ageGroups) {
          const audienceDemographics = metrics.audience_demographics;
          if (audienceDemographics?.age_distribution) {
            ageGroups = audienceDemographics.age_distribution;
          }
        }

        if (!ageGroups) return 'N/A';

        // Handle object with min/max
        if (
          typeof ageGroups === 'object' &&
          !Array.isArray(ageGroups) &&
          'min' in ageGroups &&
          'max' in ageGroups
        ) {
          const percentage = ageGroups.percentage_value;
          const ageRange = `${ageGroups.min}-${ageGroups.max}`;
          return percentage
            ? `${ageRange} (${Math.round(percentage)}%)`
            : ageRange;
        }

        return 'N/A';

      case 'age_distribution':
        const audienceDemographics = metrics.audience_demographics;
        const ageDistribution = audienceDemographics?.age_distribution;

        if (!ageDistribution) return 'N/A';

        const ageData = ageDistribution as any;
        if (
          typeof ageData === 'object' &&
          !Array.isArray(ageData) &&
          'min' in ageData &&
          'max' in ageData
        ) {
          const percentage = ageData.percentage_value;
          const ageRange = `${ageData.min}-${ageData.max}`;
          return percentage
            ? `${ageRange} (${Math.round(percentage)}%)`
            : ageRange;
        }

        return 'N/A';

      case 'audience_gender_distribution':
        const filterMatch = metrics.filter_match;
        let genderData = filterMatch?.audience_gender;

        if (!genderData) {
          const audienceDemographicsGender = metrics.audience_demographics;
          if (audienceDemographicsGender?.gender_distribution) {
            genderData = audienceDemographicsGender.gender_distribution;
          }
        }

        if (
          !genderData ||
          !Array.isArray(genderData) ||
          genderData.length === 0
        ) {
          return 'N/A';
        }

        // Format gender data
        const formattedGenders = genderData
          .slice(0, 2)
          .map((gender: any) => {
            const type = gender.type || 'Unknown';
            const percentage = gender.percentage_value;
            return percentage ? `${type}: ${Math.round(percentage)}%` : type;
          })
          .filter(Boolean);

        // FIXED: Calculate missing gender percentage
        if (formattedGenders.length === 1) {
          // If only MALE is provided, calculate FEMALE
          if (
            formattedGenders[0].includes('MALE:') &&
            !formattedGenders[0].includes('FEMALE')
          ) {
            const maleMatch = formattedGenders[0].match(
              /MALE: (\d+(?:\.\d+)?)%/,
            );
            if (maleMatch) {
              const malePercentage = parseFloat(maleMatch[1]);
              const femalePercentage = 100 - malePercentage;
              return `MALE: ${Math.round(malePercentage)}% | FEMALE: ${Math.round(femalePercentage)}%`;
            }
          }

          // If only FEMALE is provided, calculate MALE
          if (formattedGenders[0].includes('FEMALE:')) {
            const femaleMatch = formattedGenders[0].match(
              /FEMALE: (\d+(?:\.\d+)?)%/,
            );
            if (femaleMatch) {
              const femalePercentage = parseFloat(femaleMatch[1]);
              const malePercentage = 100 - femalePercentage;
              return `MALE: ${Math.round(malePercentage)}% | FEMALE: ${Math.round(femalePercentage)}%`;
            }
          }
        }

        return formattedGenders.length > 0
          ? formattedGenders.join(', ')
          : 'N/A';

      case 'audience_locations':
        let audienceLocations = metrics.audience_locations;

        if (!audienceLocations) {
          const filterMatchLoc = metrics.filter_match;
          if (filterMatchLoc?.audience_locations) {
            audienceLocations = filterMatchLoc.audience_locations;
          }
        }

        if (!audienceLocations) {
          const audienceDemographicsLoc = metrics.audience_demographics;
          if (audienceDemographicsLoc?.location_distribution) {
            audienceLocations = audienceDemographicsLoc.location_distribution;
          }
        }

        if (
          !audienceLocations ||
          !Array.isArray(audienceLocations) ||
          audienceLocations.length === 0
        ) {
          return 'N/A';
        }

        // Format location data
        const formattedLocations = audienceLocations
          .slice(0, 2)
          .map((location: any) => {
            const locationName = location.name || location.country || 'Unknown';
            const percentage = location.percentage_value;
            return percentage
              ? `${locationName} (${Math.round(percentage)}%)`
              : locationName;
          })
          .filter(Boolean);

        return formattedLocations.length > 0
          ? formattedLocations.join(', ')
          : 'N/A';

      case 'platform_account_type':
        return (
          metrics.platform_account_type ||
          account?.platform_account_type ||
          'personal'
        );
      case 'content_count':
        return metrics.content_count || account?.media_count || 0;
      case 'platform_account_type':
        return account?.platform_account_type || 'personal';
      case 'price':
        return {
          priceApproved: Boolean((influencer as any).price_approved),
          totalPrice: Number((influencer as any).total_price) || 0,
          currency: influencer.currency || 'USD',
        };
      case 'cpv':
        const priceApproved = Boolean((influencer as any).price_approved);
        if (!priceApproved) return null;

        const budget = Number((influencer as any).total_price) || 0;
        const avgViewsValue =
          metrics?.average_views ||
          metrics?.instagram_options?.reel_views ||
          metrics?.filter_match?.instagram_options?.reel_views ||
          0;

        if (budget <= 0 || avgViewsValue <= 0) return null;
        return budget / avgViewsValue;
      case 'contact':
        const contacts = account?.contact_details || [];
        const phoneContact = contacts.find(
          (c: any) => c.contact_type === 'phone',
        );
        return phoneContact?.contact_value || 'N/A';
      case 'shortlisted_status':
        return (influencer as any).shortlisted_status?.name || 'pending';
      default:
        return 'N/A';
    }
  };

  // Format value for display
  const formatValue = (value: any, columnKey: string): string => {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';

    switch (columnKey) {
      case 'followers':
      case 'avg_likes':
      case 'avg_views':
      case 'content_count':
        return formatNumber(value);
      case 'engagement_rate':
        return typeof value === 'number' ? `${value.toFixed(2)}%` : 'N/A';
      case 'price':
        return value; // Return raw object, handled in render
      case 'cpv':
        return value; // Return raw value, handled in render
      default:
        return String(value);
    }
  };

  // Security check
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
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
              No columns have been approved for viewing
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add custom styles for enhanced hover effects */}
      <style jsx>{`
        table tbody tr:hover {
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.1);
        }

        th {
          position: sticky;
          top: 0;
          background: #f9fafb;
          z-index: 10;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto px-6 py-6">
          {/* Header */}
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Shortlisted</h1>

            {/* Link Expiry Info */}
            {data?.session?.expires_at && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <svg
                  className="w-4 h-4 text-amber-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-amber-800">
                    <span className="font-medium">Link expires:</span>{' '}
                    {formatExpiryDate(data.session.expires_at)}
                  </span>
                  <span className="text-amber-600 text-xs">
                    ({getRemainingTime(data.session.expires_at)})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Influencer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-2 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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

          {/* Summary - Always visible (shows all when none selected, selected when some selected) */}
          <ShortlistedSummaryV2
            selectedInfluencers={Array.from(selectedInfluencers)}
            influencers={activeInfluencers as any}
            onClearSelection={() => setSelectedInfluencers(new Set())}
          />

          {/* ============ VIEW TOGGLE ============ */}
          <div className="flex items-center justify-end mb-4">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
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
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Grid
              </button>
            </div>
          </div>

          {/* Bulk Status Update - Show when influencers are selected */}
          {selectedInfluencers.size > 0 && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedInfluencers.size} influencer
                    {selectedInfluencers.size !== 1 ? 's' : ''} selected
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkShortlistedStatusUpdate(e.target.value);
                        e.target.value = ''; // Reset dropdown
                      }
                    }}
                    disabled={statusesLoading}
                    className="text-sm px-3 py-1.5 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Update Status...</option>
                    {shortlistedStatuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setSelectedInfluencers(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* ============ CONDITIONAL VIEW RENDERING ============ */}
          {viewMode === 'grid' ? (
            /* ========== GRID VIEW ========== */
            <ShortlistedGridView
              members={paginatedInfluencers as any}
              selectedInfluencers={Array.from(selectedInfluencers)}
              onSelectionChange={(selected: string[]) =>
                setSelectedInfluencers(new Set(selected))
              }
              visibleColumns={visibleColumns}
              getAdditionalMetric={(member: any, key: string) => {
                const metrics = member?.social_account
                  ?.additional_metrics as any;
                return metrics?.[key] || null;
              }}
              getProfilePicture={(member: any) =>
                member?.social_account?.profile_pic_url ||
                '/placeholder-avatar.png'
              }
              getPlatformName={getPlatformName}
              getPlatformIcon={getPlatformIcon}
              formatLocation={(location: any) => formatLocation(location)}
              formatEngagementRate={(member: any) => {
                const metrics = member?.social_account
                  ?.additional_metrics as any;
                const rate =
                  metrics?.engagementRate || metrics?.engagement_rate || 0;
                return typeof rate === 'number'
                  ? `${(rate > 1 ? rate : rate * 100).toFixed(2)}%`
                  : 'N/A';
              }}
              getCombinedAverageViews={(member: any) => {
                const metrics = member?.social_account
                  ?.additional_metrics as any;
                return (
                  metrics?.average_views ||
                  metrics?.instagram_options?.reel_views ||
                  0
                );
              }}
              shortlistedStatuses={shortlistedStatuses}
              onShortlistedStatusChange={handleShortlistedStatusChange}
              updatingStatus={updatingStatus}
              statusesLoading={statusesLoading}
              localInfluencerUpdates={localInfluencerUpdates}
              searchText={searchTerm}
              // {/* ========== MISSING REQUIRED PROPS (Public page - pass empty handlers) ========== */}
              onProfileInsights={() => {}}
              onRowUpdate={() => {}}
              onRemovingChange={() => {}}
              removingInfluencers={[]}
              onInfluencerRemoved={() => {}}
              onRefreshProfileData={() => {}}
              isRefreshingProfile={false}
              refreshingMemberId={null}
            />
          ) : (
            /* ========== TABLE VIEW (Original) ========== */
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="max-h-[735px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left w-8">
                        <input
                          type="checkbox"
                          checked={
                            selectedInfluencers.size ===
                              paginatedInfluencers.length &&
                            paginatedInfluencers.length > 0
                          }
                          onChange={toggleAllSelection}
                          className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                      </th>
                      {visibleColumnsData.map((column) => (
                        <th
                          key={column.key}
                          className={`px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none relative ${
                            column.key === 'tags' ? '' : column.width
                          }`}
                          style={
                            column.key === 'tags'
                              ? tagsColumnResize.getColumnStyle()
                              : undefined
                          }
                          onClick={() => {
                            if (tagsColumnResize.justResized) return;
                            handleSort(column.key);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="group-hover:text-purple-700 transition-colors duration-200">
                              {column.label}
                            </span>
                            <div className="transform group-hover:scale-110 transition-transform duration-200">
                              {getSortIcon(column.key)}
                            </div>
                          </div>

                          {/* Resize Handle for Tags Column */}
                          {/* Resize Handle for Tags Column */}
                          {column.key === 'tags' && (
                            <ResizeHandle
                              onMouseDown={tagsColumnResize.handleResizeStart}
                              isResizing={tagsColumnResize.isResizing}
                              title="Drag to resize - show more tags"
                            />
                          )}
                        </th>
                      ))}
                      {/* Column Visibility Toggle */}
                      {/* Column Visibility Toggle - Using shared component */}
                      <th className="px-4 py-3 text-right relative">
                        <button
                          onClick={() =>
                            setShowColumnDropdown(!showColumnDropdown)
                          }
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Toggle columns"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                            />
                          </svg>
                        </button>

                        {/* Use shared ColumnVisibility component */}
                        <ColumnVisibility
                          isOpen={showColumnDropdown}
                          onClose={() => setShowColumnDropdown(false)}
                          columns={allColumns}
                          visibleColumns={visibleColumns}
                          onToggleColumn={toggleColumnVisibility}
                          data={influencers}
                          position="top-right"
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedInfluencers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={visibleColumnsData.length + 2}
                          className="px-6 py-12 text-center text-gray-500 text-sm"
                        >
                          {searchTerm
                            ? 'No influencers match your search'
                            : 'No influencers found'}
                        </td>
                      </tr>
                    ) : (
                      paginatedInfluencers.map((influencer) => (
                        <tr
                          key={influencer.id}
                          className="hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 transition-all duration-150 border-b border-gray-100"
                        >
                          <td className="px-4 py-3 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedInfluencers.has(influencer.id)}
                              onChange={() => toggleRowSelection(influencer.id)}
                              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                          </td>
                          {visibleColumnsData.map((column) => {
                            const value = getInfluencerValue(
                              influencer,
                              column.key,
                            );
                            const displayValue = formatValue(value, column.key);

                            // Special rendering for name column with profile picture - CLICKABLE
                            if (column.key === 'name') {
                              const accountUrl = getProfileUrl(influencer);

                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <div className="flex items-center min-w-0">
                                    <div className="flex-shrink-0 h-12 w-12 relative">
                                      <img
                                        className="rounded-full object-cover h-12 w-12 border-2 border-gray-200 shadow-sm"
                                        src={
                                          influencer.social_account
                                            ?.profile_pic_url ||
                                          '/placeholder-avatar.png'
                                        }
                                        alt={
                                          influencer.social_account?.full_name
                                        }
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            '/placeholder-avatar.png';
                                        }}
                                      />
                                    </div>
                                    <div className="ml-4 min-w-0 flex-1">
                                      <div className="text-sm font-medium text-gray-900 flex items-center min-w-0">
                                        <span
                                          className="truncate cursor-pointer hover:text-purple-600 transition-colors"
                                          title={
                                            influencer.social_account
                                              ?.full_name || ''
                                          }
                                          onClick={() =>
                                            accountUrl &&
                                            window.open(
                                              accountUrl,
                                              '_blank',
                                              'noopener,noreferrer',
                                            )
                                          }
                                        >
                                          {influencer.social_account
                                            ?.full_name || 'Unknown'}
                                        </span>
                                        {influencer.social_account
                                          ?.is_verified && (
                                          <span
                                            className="ml-1 flex-shrink-0 text-blue-500"
                                            title="Verified"
                                          >
                                            <svg
                                              className="w-3 h-3"
                                              fill="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z" />
                                            </svg>
                                          </span>
                                        )}
                                      </div>
                                      <div
                                        className="text-xs text-gray-500 flex items-center gap-1 mt-1 cursor-pointer hover:text-gray-700 transition-colors"
                                        onClick={() =>
                                          accountUrl &&
                                          window.open(
                                            accountUrl,
                                            '_blank',
                                            'noopener,noreferrer',
                                          )
                                        }
                                      >
                                        <span className="truncate">
                                          @
                                          {influencer.social_account
                                            ?.account_handle || 'unknown'}
                                        </span>
                                        {getPlatformIcon(influencer)}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              );
                            }

                            // Special rendering for gender
                            if (column.key === 'gender') {
                              if (!value || value === 'N/A') {
                                return (
                                  <td
                                    key={column.key}
                                    className="px-4 py-3 text-sm text-gray-700"
                                  >
                                    N/A
                                  </td>
                                );
                              }
                              const displayGender =
                                String(value).charAt(0).toUpperCase() +
                                String(value).slice(1).toLowerCase();
                              const colorClass =
                                value?.toLowerCase() === 'female'
                                  ? 'bg-pink-100 text-pink-800'
                                  : value?.toLowerCase() === 'male'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800';
                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${colorClass}`}
                                  >
                                    {displayGender}
                                  </span>
                                </td>
                              );
                            }

                            // Special rendering for location
                            if (column.key === 'location') {
                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                    {displayValue}
                                  </span>
                                </td>
                              );
                            }

                            // Special rendering for audience age groups
                            if (column.key === 'audience_age_groups') {
                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {displayValue}
                                  </span>
                                </td>
                              );
                            }

                            // Special rendering for age distribution
                            if (column.key === 'age_distribution') {
                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                                    {displayValue}
                                  </span>
                                </td>
                              );
                            }

                            // Special rendering for audience gender distribution
                            if (column.key === 'audience_gender_distribution') {
                              if (displayValue === 'N/A') {
                                return (
                                  <td
                                    key={column.key}
                                    className="px-4 py-3 text-sm text-gray-700"
                                  >
                                    N/A
                                  </td>
                                );
                              }

                              const genderParts = displayValue.split(' | ');
                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {genderParts.map(
                                      (genderPart: string, index: number) => {
                                        const isMale =
                                          genderPart
                                            .toLowerCase()
                                            .includes('male') &&
                                          !genderPart
                                            .toLowerCase()
                                            .includes('female');
                                        const isFemale = genderPart
                                          .toLowerCase()
                                          .includes('female');
                                        const percentageMatch =
                                          genderPart.match(/(\d+)%/);
                                        const percentage = percentageMatch
                                          ? percentageMatch[1] + '%'
                                          : '';

                                        let displayText = '';
                                        let colorClass = '';

                                        if (isMale) {
                                          displayText = `M: ${percentage}`;
                                          colorClass =
                                            'bg-blue-100 text-blue-800';
                                        } else if (isFemale) {
                                          displayText = `F: ${percentage}`;
                                          colorClass =
                                            'bg-pink-100 text-pink-800';
                                        } else {
                                          displayText = genderPart;
                                          colorClass =
                                            'bg-gray-100 text-gray-800';
                                        }

                                        return (
                                          <span
                                            key={index}
                                            className={`text-xs px-2 py-1 rounded-full ${colorClass}`}
                                          >
                                            {displayText}
                                          </span>
                                        );
                                      },
                                    )}
                                  </div>
                                </td>
                              );
                            }

                            // Special rendering for audience locations
                            if (column.key === 'audience_locations') {
                              if (displayValue === 'N/A') {
                                return (
                                  <td
                                    key={column.key}
                                    className="px-4 py-3 text-sm text-gray-700"
                                  >
                                    N/A
                                  </td>
                                );
                              }

                              const locations = displayValue.split(', ');
                              const colorClasses = [
                                'bg-green-100 text-green-800',
                                'bg-purple-100 text-purple-800',
                                'bg-orange-100 text-orange-800',
                              ];

                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <div className="flex flex-wrap gap-1">
                                    {locations.map(
                                      (location: string, index: number) => {
                                        const colorClass =
                                          colorClasses[
                                            index % colorClasses.length
                                          ] || 'bg-gray-100 text-gray-800';
                                        return (
                                          <span
                                            key={index}
                                            className={`text-xs px-2 py-1 rounded-full ${colorClass}`}
                                          >
                                            {location}
                                          </span>
                                        );
                                      },
                                    )}
                                  </div>
                                </td>
                              );
                            }

                            // Special rendering for platform account type
                            if (column.key === 'platform_account_type') {
                              if (!value || value === 'N/A') {
                                return (
                                  <td
                                    key={column.key}
                                    className="px-4 py-3 text-sm text-gray-700"
                                  >
                                    N/A
                                  </td>
                                );
                              }
                              const displayType = String(value)
                                .replace('_', ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase());
                              const colorClass =
                                value === 'BUSINESS'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800';
                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${colorClass}`}
                                  >
                                    {displayType}
                                  </span>
                                </td>
                              );
                            }

                            // Special rendering for price column
                            if (column.key === 'price') {
                              const priceData = value as any;
                              const currencySymbols: Record<string, string> = {
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
                              };

                              if (!priceData?.priceApproved) {
                                return (
                                  <td key={column.key} className="px-4 py-3">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                      <svg
                                        className="w-3 h-3"
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
                                  </td>
                                );
                              }

                              const symbol =
                                currencySymbols[priceData.currency] || '$';
                              return (
                                <td
                                  key={column.key}
                                  className="px-4 py-3 text-sm font-medium text-gray-900"
                                >
                                  {symbol}
                                  {Math.round(
                                    priceData.totalPrice,
                                  ).toLocaleString()}
                                </td>
                              );
                            }

                            // Special rendering for CPV column
                            if (column.key === 'cpv') {
                              if (
                                value === null ||
                                typeof value !== 'number' ||
                                value <= 0
                              ) {
                                return (
                                  <td
                                    key={column.key}
                                    className="px-4 py-3 text-sm text-gray-400"
                                  >
                                    -
                                  </td>
                                );
                              }
                              return (
                                <td
                                  key={column.key}
                                  className="px-4 py-3 text-sm font-medium text-gray-700"
                                >
                                  {value.toFixed(4)}
                                </td>
                              );
                            }

                            if (column.key === 'tags') {
                              return (
                                <td
                                  key={column.key}
                                  className="px-4 py-3"
                                  style={tagsColumnResize.getColumnStyle()}
                                >
                                  <TagsColumn
                                    member={influencer as any}
                                    readOnly={true}
                                    columnWidth={tagsColumnResize.width}
                                  />
                                </td>
                              );
                            }

                            // Special rendering for social column
                            if (column.key === 'social') {
                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <SocialColumn
                                    member={influencer as any}
                                    readOnly={true}
                                  />
                                </td>
                              );
                            }

                            // Special rendering for X-Campaigns column
                            if (column.key === 'x_campaigns') {
                              const pastCampaigns: PastCampaign[] =
                                (influencer as any).past_campaigns || [];
                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <XCampaignsColumn
                                    member={influencer as any}
                                    pastCampaigns={pastCampaigns}
                                    readOnly={true}
                                  />
                                </td>
                              );
                            }
                            // Special rendering for status - Using shared component
                            if (column.key === 'shortlisted_status') {
                              return (
                                <td key={column.key} className="px-4 py-3">
                                  <ShortlistedStatusCell
                                    influencer={influencer}
                                    shortlistedStatuses={shortlistedStatuses}
                                    onStatusChange={
                                      handleShortlistedStatusChange
                                    }
                                    isUpdating={updatingStatus.has(
                                      influencer.id,
                                    )}
                                    statusesLoading={statusesLoading}
                                    localUpdate={
                                      localInfluencerUpdates[influencer.id]
                                    }
                                  />
                                </td>
                              );
                            }

                            // Default rendering for all other columns
                            return (
                              <td
                                key={column.key}
                                className="px-4 py-3 text-sm text-gray-700"
                              >
                                {displayValue}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {/* Pagination */}
              {sortedInfluencers.length > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    {/* Page Navigation Buttons */}
                    <div className="flex items-center">
                      {totalPages > 1 && (
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          {/* Previous Button */}
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {/* Page Number Buttons */}
                          {(() => {
                            const pageNumbers: (number | string)[] = [];
                            const showEllipsisStart = currentPage > 3;
                            const showEllipsisEnd =
                              currentPage < totalPages - 2;

                            if (totalPages <= 7) {
                              for (let i = 1; i <= totalPages; i++) {
                                pageNumbers.push(i);
                              }
                            } else {
                              pageNumbers.push(1);
                              if (showEllipsisStart) pageNumbers.push('...');

                              const start = Math.max(2, currentPage - 1);
                              const end = Math.min(
                                totalPages - 1,
                                currentPage + 1,
                              );

                              for (let i = start; i <= end; i++) {
                                pageNumbers.push(i);
                              }

                              if (showEllipsisEnd) pageNumbers.push('...');
                              pageNumbers.push(totalPages);
                            }

                            return pageNumbers.map((pageNum, idx) => (
                              <div key={idx}>
                                {pageNum === '...' ? (
                                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    ...
                                  </span>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setCurrentPage(pageNum as number)
                                    }
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      pageNum === currentPage
                                        ? 'bg-purple-50 text-purple-600 border-purple-300 z-10'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                )}
                              </div>
                            ));
                          })()}

                          {/* Next Button */}
                          <button
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1),
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </nav>
                      )}
                    </div>

                    {/* Results Counter + Page Size Selector */}
                    <div className="flex items-center">
                      <p className="text-sm text-gray-700 mr-2">
                        Showing{' '}
                        <span className="font-medium">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(
                            currentPage * itemsPerPage,
                            sortedInfluencers.length,
                          )}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">
                          {sortedInfluencers.length}
                        </span>{' '}
                        entries
                      </p>

                      {/* Page Size Dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPageSizeDropdown(!showPageSizeDropdown);
                          }}
                          className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center"
                        >
                          Show{' '}
                          {itemsPerPage >= sortedInfluencers.length
                            ? 'All'
                            : itemsPerPage}
                          <svg
                            className={`-mr-1 ml-1 h-5 w-5 transform transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`}
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {showPageSizeDropdown && (
                          <div className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                            <div className="py-1">
                              {[
                                10,
                                25,
                                50,
                                100,
                                { value: 999999, label: 'Show All' },
                              ].map((option, index) => {
                                const isObject = typeof option === 'object';
                                const size = isObject ? option.value : option;
                                const label = isObject
                                  ? option.label
                                  : `Show ${option}`;
                                const isActive = itemsPerPage === size;

                                return (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setItemsPerPage(size);
                                      setCurrentPage(1);
                                      setShowPageSizeDropdown(false);
                                    }}
                                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                      isActive
                                        ? 'bg-purple-50 text-purple-600 font-medium'
                                        : 'text-gray-700'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PublicShortlisted;
