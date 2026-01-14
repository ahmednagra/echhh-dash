// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedTable.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CampaignListMember,
  CampaignListMembersResponse,
} from '@/services/campaign/campaign-list.service';
import { ColumnDefinition } from '@/components/ui/table/ColumnVisibility';
import { formatNumber } from '@/utils/format';
// import PriceColumn from './columns/PriceColumn';
import ContactColumn from './columns/ContactColumn';
import SocialColumn from './columns/SocialColumn'; // ADD THIS
import { BsInstagram, BsTiktok, BsYoutube } from 'react-icons/bs';
import { List, Grid } from 'react-feather';
import ActionColumn from './columns/ActionColumn';
import TableSkeleton from '@/components/ui/TableSkeleton';
// Import the ProfileInsightsModal from the discover section
import ProfileInsightsModal from '../discover-influencers/ProfileInsightsModal';
import { Platform } from '@/types/platform';
import { Influencer } from '@/types/insights-iq';
// Add these imports after the existing imports, around line 16
import ShortlistedStatusCell from './ShortlistedStatusCell';
import BulkStatusUpdate from './BulkStatusUpdate';
import { getStatuses } from '@/services/statuses/statuses.client';
import { Status } from '@/types/statuses';
import {
  updateCampaignInfluencerShortlistedStatus,
  bulkUpdateShortlistedStatus,
} from '@/services/campaign-influencers/campaign-influencers.client';
import { toast } from 'react-hot-toast';

import { useRefreshProfileData } from '@/hooks/useRefreshProfileData';
import RefreshProfileConfirmationModal from '@/components/ui/RefreshProfileConfirmationModal';
import TagsColumn from './columns/TagsColumn';
import {
  useColumnResize,
  calculateMaxWidthFromTags,
} from '@/hooks/useColumnResize';
import ResizeHandle from '@/components/ui/table/ResizeHandle';
import XCampaignsColumn from './columns/XCampaignsColumn';
import ShortlistedInfluencersSummary from './ShortlistedInfluencersSummary';
import ShortlistedGridView from './ShortlistedGridView';

// View mode type
type ViewMode = 'table' | 'grid';

// Local storage key for view preference
const VIEW_MODE_STORAGE_KEY = 'shortlisted_view_mode';

interface ShortlistedTableProps {
  shortlistedMembers: CampaignListMembersResponse;
  isLoading: boolean;
  searchText: string;
  selectedInfluencers: string[];
  removingInfluencers: string[];
  onInfluencerRemoved?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSelectionChange: (selected: string[]) => void;
  onRemovingChange: (removing: string[]) => void;
  onVisibleColumnsChange?: (visibleColumns: string[]) => void;
  onDataRefresh?: () => void;
  // New props for insights functionality
  selectedPlatform?: Platform | null;
  onFetchInfluencerPosts?: (influencer: Influencer) => Promise<any[]>;
  // Platform filter for dynamic column labels
  platformFilter?: 'all' | 'instagram' | 'tiktok' | 'youtube';
  allInfluencersForSummary?: CampaignListMember[];
  campaignListId?: string;
}

const ShortlistedTable: React.FC<ShortlistedTableProps> = ({
  shortlistedMembers,
  isLoading,
  searchText,
  selectedInfluencers,
  removingInfluencers,
  onInfluencerRemoved,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
  onRemovingChange,
  onVisibleColumnsChange,
  onDataRefresh,
  // New props
  selectedPlatform,
  onFetchInfluencerPosts,
  platformFilter = 'all',
  allInfluencersForSummary, // NEW
  campaignListId,
}) => {
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  // ========== VIEW MODE STATE (with localStorage persistence) ==========
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      return (saved as ViewMode) || 'table';
    }
    return 'table';
  });

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    }
  }, [viewMode]);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });

  // ROW-LEVEL UPDATE: Local members state for individual row updates
  const [localMembers, setLocalMembers] = useState<CampaignListMember[]>([]);

  // Profile Insights Modal state
  const [selectedInfluencerForInsights, setSelectedInfluencerForInsights] =
    useState<Influencer | null>(null);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);

  // Add these after the existing useState declarations around line 43
  const [shortlistedStatuses, setShortlistedStatuses] = useState<Status[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [localInfluencerUpdates, setLocalInfluencerUpdates] = useState<
    Record<string, any>
  >({});

  // Country name to abbreviation mapping
  const countryToAbbreviation: { [key: string]: string } = {
    Pakistan: 'PK',
    'United States': 'US',
    India: 'IN',
    'Saudi Arabia': 'SA',
    'United Kingdom': 'GB',
    'United Arab Emirates': 'AE',
    Bangladesh: 'BD',
    Turkey: 'TR',
    Canada: 'CA',
    Australia: 'AU',
    France: 'FR',
    Germany: 'DE',
    Italy: 'IT',
    Spain: 'ES',
    Brazil: 'BR',
    Mexico: 'MX',
    Indonesia: 'ID',
    Malaysia: 'MY',
    Thailand: 'TH',
    Singapore: 'SG',
    Japan: 'JP',
    'South Korea': 'KR',
    China: 'CN',
    Russia: 'RU',
    Egypt: 'EG',
    Nigeria: 'NG',
    'South Africa': 'ZA',
    Argentina: 'AR',
    Chile: 'CL',
    Colombia: 'CO',
    Peru: 'PE',
  };

  // ========== PLATFORM DETECTION HELPERS ==========
  // Helper to get platform name from member
  const getPlatformName = useCallback((member: CampaignListMember): string => {
    const additionalMetrics = member.social_account?.additional_metrics as any;

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
    const directPlatform = (member.social_account as any)?.platform?.name;
    if (directPlatform) {
      return directPlatform.toLowerCase();
    }

    // 4️⃣ FOURTH: Check account_url
    const accountUrl = member.social_account?.account_url || '';
    if (accountUrl.includes('tiktok.com')) return 'tiktok';
    if (accountUrl.includes('youtube.com')) return 'youtube';
    if (accountUrl.includes('instagram.com')) return 'instagram';

    return 'instagram'; // Default fallback
  }, []);

  // Get platform icon component
  const getPlatformIcon = useCallback(
    (member: CampaignListMember): React.ReactNode => {
      const platform = getPlatformName(member);

      if (platform.includes('tiktok')) {
        return <BsTiktok className="text-black" size={12} />;
      }
      if (platform.includes('youtube')) {
        return <BsYoutube className="text-red-600" size={12} />;
      }
      // Default: Instagram
      return <BsInstagram className="text-pink-500" size={12} />;
    },
    [getPlatformName],
  );

  // Extract members and pagination from API response
  const members = shortlistedMembers?.influencers || [];
  const pagination = shortlistedMembers?.pagination || {
    page: 1,
    page_size: 25,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  };

  // Initialize local members when API data changes
  useEffect(() => {
    setLocalMembers(members);
  }, [members]);

  // ========== TAGS COLUMN RESIZE (using reusable hook) ==========
  const maxTagsCount = useMemo(() => {
    return Math.max(
      ...localMembers.map((m) => ((m as any).tags || []).length),
      3,
    );
  }, [localMembers]);

  const tagsColumnResize = useColumnResize({
    defaultWidth: 96,
    minWidth: 96,
    maxWidth: calculateMaxWidthFromTags(maxTagsCount),
  });

  // Add this useEffect after the existing useEffect hooks around line 116
  useEffect(() => {
    const fetchShortlistedStatuses = async () => {
      try {
        setStatusesLoading(true);
        console.log('🔄 ShortlistedTable: Fetching shortlisted statuses');

        const statuses = await getStatuses('campaign_influencer');

        // Filter for shortlisted statuses only
        const shortlistedOnly = statuses.filter(
          (status) => status.applies_to_field === 'shortlisted_status_id',
        );

        console.log(
          '✅ ShortlistedTable: Shortlisted statuses fetched:',
          shortlistedOnly.length,
        );
        setShortlistedStatuses(shortlistedOnly);
      } catch (error) {
        console.error(
          '❌ ShortlistedTable: Error fetching shortlisted statuses:',
          error,
        );
        toast.error('Failed to load status options');
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchShortlistedStatuses();
  }, []);

  // ROW-LEVEL UPDATE: Handle individual row updates without full table refresh
  const handleRowUpdate = useCallback((updatedMember: CampaignListMember) => {
    console.log(
      'ShortlistedTable: Individual row update for:',
      updatedMember.social_account?.full_name,
    );

    setLocalMembers((prevMembers) =>
      prevMembers.map((member) =>
        member.id === updatedMember.id ? updatedMember : member,
      ),
    );
  }, []);

  // Handle contacts changed - minimal contact refresh tracking
  const handleContactsChanged = useCallback(() => {
    console.log('Contacts changed, using row-level updates...');
    // No full table refresh needed - row-level updates handle this
  }, []);

  // Helper function to safely access additional metrics
  const getAdditionalMetric = useCallback(
    (member: CampaignListMember, key: string, defaultValue: any = null) => {
      const additionalMetrics = member?.social_account?.additional_metrics;
      if (!additionalMetrics || typeof additionalMetrics !== 'object') {
        return defaultValue;
      }

      const metricsObj = additionalMetrics as Record<string, any>;
      return metricsObj[key] ?? defaultValue;
    },
    [],
  );

  // Enhanced profile picture getter
  const getProfilePicture = useCallback(
    (member: CampaignListMember): string => {
      const profileImageFromMetrics = getAdditionalMetric(
        member,
        'profileImage',
      );
      if (profileImageFromMetrics) {
        return profileImageFromMetrics;
      }

      const standardProfilePic = member.social_account?.profile_pic_url;
      if (standardProfilePic) {
        return standardProfilePic;
      }

      return `https://i.pravatar.cc/150?u=${member.social_account?.id}`;
    },
    [getAdditionalMetric],
  );

  // Enhanced following count getter
  const getFollowingCount = useCallback(
    (member: CampaignListMember): number | null => {
      const standardFollowing = member.social_account?.following_count;
      if (typeof standardFollowing === 'number') {
        return standardFollowing;
      }

      const followingFromMetrics = getAdditionalMetric(
        member,
        'following_count',
      );
      if (typeof followingFromMetrics === 'number') {
        return followingFromMetrics;
      }

      if (typeof followingFromMetrics === 'string') {
        const parsed = parseInt(followingFromMetrics);
        if (!isNaN(parsed)) {
          return parsed;
        }
      }

      return null;
    },
    [getAdditionalMetric],
  );

  // Helper function to parse JSON strings safely
  const parseJSONSafely = useCallback(
    (jsonString: any, defaultValue: any = null) => {
      if (!jsonString) return defaultValue;
      if (typeof jsonString === 'object') return jsonString;
      if (typeof jsonString === 'string') {
        try {
          return JSON.parse(jsonString);
        } catch {
          return defaultValue;
        }
      }
      return defaultValue;
    },
    [],
  );

  // Helper function to get reel views from member data
  const getReelViews = useCallback(
    (member: CampaignListMember) => {
      const instagramOptions = getAdditionalMetric(member, 'instagram_options');
      if (instagramOptions?.reel_views) {
        if (
          typeof instagramOptions.reel_views === 'object' &&
          instagramOptions.reel_views.min !== undefined
        ) {
          const avg =
            (instagramOptions.reel_views.min +
              instagramOptions.reel_views.max) /
            2;
          return avg;
        }
        if (typeof instagramOptions.reel_views === 'number') {
          return instagramOptions.reel_views;
        }
      }

      const filterMatch = getAdditionalMetric(member, 'filter_match');
      if (filterMatch?.instagram_options?.reel_views) {
        const reelViews = filterMatch.instagram_options.reel_views;
        if (typeof reelViews === 'number') {
          return reelViews;
        }
      }

      const averageReelViews = getAdditionalMetric(
        member,
        'average_reel_views',
      );
      if (averageReelViews !== null && averageReelViews !== undefined) {
        return averageReelViews;
      }

      const reelViews = getAdditionalMetric(member, 'reel_views');
      if (reelViews !== null && reelViews !== undefined) {
        return reelViews;
      }

      return null;
    },
    [getAdditionalMetric],
  );

  // Helper function to get combined average views with reel views fallback
  const getCombinedAverageViews = useCallback(
    (member: CampaignListMember) => {
      // First try to get average_views
      const averageViews = getAdditionalMetric(member, 'average_views');

      // Check if average_views is valid (not null, undefined, 0, or empty)
      if (
        averageViews !== null &&
        averageViews !== undefined &&
        typeof averageViews === 'number' &&
        averageViews > 0
      ) {
        return averageViews;
      }

      // If average_views is 0, null, undefined, or N/A, fall back to reel views
      return getReelViews(member);
    },
    [getAdditionalMetric, getReelViews],
  );

  // Helper function to format engagement rate consistently
  const formatEngagementRate = useCallback(
    (member: CampaignListMember): string => {
      // Try both field names to ensure consistency
      const engagementRate =
        getAdditionalMetric(member, 'engagementRate') ||
        getAdditionalMetric(member, 'engagement_rate');

      if (typeof engagementRate === 'number') {
        // Check if value is less than 1 (0.something format)
        if (engagementRate < 1) {
          // For values like 0.095235404231272 -> multiply by 100 and show 2 decimal places
          return `${(engagementRate * 100).toFixed(2)}%`;
        } else {
          // For values like 7.295235404231272 -> show as-is with up to 2 decimal places
          const roundedRate = Math.round(engagementRate * 100) / 100; // Round to 2 decimal places
          return `${roundedRate}%`;
        }
      }

      // Check if it's already in percentage format as string
      if (typeof engagementRate === 'string' && engagementRate.includes('%')) {
        // Keep as-is for string values that already have % sign
        return engagementRate;
      }

      return 'N/A';
    },
    [getAdditionalMetric],
  );

  // Helper function to format location with country abbreviations
  const formatLocation = useCallback(
    (member: CampaignListMember) => {
      const locationData = getAdditionalMetric(member, 'creator_location');
      const parsed = parseJSONSafely(locationData, null);

      // Handle parsed object
      if (parsed && typeof parsed === 'object') {
        // If both city and country exist
        if (parsed.city && parsed.country) {
          const countryAbbr =
            countryToAbbreviation[parsed.country] || parsed.country;
          return `${parsed.city}, ${countryAbbr}`;
        }
        // If only country exists
        if (parsed.country) {
          const countryAbbr =
            countryToAbbreviation[parsed.country] || parsed.country;
          return countryAbbr;
        }
      }

      // Fallback to separate city/country fields
      const city = getAdditionalMetric(member, 'creator_city');
      const country = getAdditionalMetric(member, 'creator_country');

      if (city && country) {
        const countryAbbr = countryToAbbreviation[country] || country;
        return `${city}, ${countryAbbr}`;
      }

      if (country) {
        const countryAbbr = countryToAbbreviation[country] || country;
        return countryAbbr;
      }

      return 'N/A';
    },
    [getAdditionalMetric, parseJSONSafely, countryToAbbreviation],
  );

  // Helper function to format audience age groups - Updated for CampaignListMember structure
  const formatAudienceAgeGroups = useCallback(
    (member: CampaignListMember) => {
      // Check direct audience_age_groups field first
      let ageGroups = getAdditionalMetric(member, 'audience_age_groups');

      // Fallback to filter_match
      if (!ageGroups) {
        const filterMatch = getAdditionalMetric(member, 'filter_match');
        if (filterMatch?.audience_age) {
          ageGroups = filterMatch.audience_age;
        }
      }

      // Fallback to audience_demographics
      if (!ageGroups) {
        const audienceDemographics = getAdditionalMetric(
          member,
          'audience_demographics',
        );
        if (audienceDemographics?.age_distribution) {
          ageGroups = audienceDemographics.age_distribution;
        }
      }

      if (!ageGroups) {
        return 'N/A';
      }

      // Handle object with min/max structure
      const ageData = ageGroups as any;
      if (
        typeof ageData === 'object' &&
        !Array.isArray(ageData) &&
        'min' in ageData &&
        'max' in ageData
      ) {
        const percentage = ageData.percentage_value;
        const ageRange = `${ageData.min}-${ageData.max}`;

        if (percentage !== null && percentage !== undefined) {
          return `${ageRange} (${Math.round(percentage)}%)`;
        } else {
          return ageRange;
        }
      }

      // Handle array format
      if (Array.isArray(ageGroups)) {
        return ageGroups
          .slice(0, 2)
          .map((ageGroup: any) => {
            if (
              ageGroup &&
              typeof ageGroup === 'object' &&
              'min' in ageGroup &&
              'max' in ageGroup
            ) {
              const percentage = ageGroup.percentage_value;
              const ageRange = `${ageGroup.min}-${ageGroup.max}`;
              return percentage
                ? `${ageRange} (${Math.round(percentage)}%)`
                : ageRange;
            }
            return String(ageGroup);
          })
          .filter(Boolean)
          .join(', ');
      }

      return 'N/A';
    },
    [getAdditionalMetric],
  );

  // Helper function to format gender distribution - returns string
  const formatGenderDistribution = useCallback(
    (member: CampaignListMember): string => {
      // Check filter_match first
      const filterMatch = getAdditionalMetric(member, 'filter_match');
      let genderData = filterMatch?.audience_gender;

      // Fallback to audience_demographics
      if (!genderData) {
        const audienceDemographics = getAdditionalMetric(
          member,
          'audience_demographics',
        );
        if (audienceDemographics?.gender_distribution) {
          genderData = audienceDemographics.gender_distribution;
        }
      }

      if (
        !genderData ||
        !Array.isArray(genderData) ||
        genderData.length === 0
      ) {
        return 'N/A';
      }

      // Extract male and female percentages from the data
      let malePercentage: number | null = null;
      let femalePercentage: number | null = null;

      genderData.forEach((gender: any) => {
        const type = (gender.type || '').toUpperCase();
        const percentage = gender.percentage_value;

        if (
          type === 'MALE' &&
          percentage !== null &&
          percentage !== undefined
        ) {
          malePercentage = Math.round(percentage);
        } else if (
          type === 'FEMALE' &&
          percentage !== null &&
          percentage !== undefined
        ) {
          femalePercentage = Math.round(percentage);
        }
      });

      // If only one gender exists, calculate the other
      if (malePercentage !== null && femalePercentage === null) {
        femalePercentage = 100 - malePercentage;
      } else if (femalePercentage !== null && malePercentage === null) {
        malePercentage = 100 - femalePercentage;
      }

      // Build the result string
      const parts: string[] = [];

      if (malePercentage !== null) {
        parts.push(`M: ${malePercentage}%`);
      }
      if (femalePercentage !== null) {
        parts.push(`F: ${femalePercentage}%`);
      }

      return parts.length > 0 ? parts.join(' | ') : 'N/A';
    },
    [getAdditionalMetric],
  );

  // Helper function to format age distribution (alternative format)
  const formatAgeDistribution = useCallback(
    (member: CampaignListMember) => {
      const audienceDemographics = getAdditionalMetric(
        member,
        'audience_demographics',
      );
      const ageDistribution = audienceDemographics?.age_distribution;

      if (!ageDistribution) {
        return 'N/A';
      }

      // Handle object with min/max structure
      const ageData = ageDistribution as any;
      if (
        typeof ageData === 'object' &&
        !Array.isArray(ageData) &&
        'min' in ageData &&
        'max' in ageData
      ) {
        const percentage = ageData.percentage_value;
        const ageRange = `${ageData.min}-${ageData.max}`;

        if (percentage !== null && percentage !== undefined) {
          return `${ageRange} (${Math.round(percentage)}%)`;
        } else {
          return ageRange;
        }
      }

      return 'N/A';
    },
    [getAdditionalMetric],
  );

  // Helper function to format audience locations with percentages
  const formatAudienceLocations = useCallback(
    (member: CampaignListMember) => {
      // Check direct audience_locations field first
      let audienceLocations = getAdditionalMetric(member, 'audience_locations');

      // Fallback to filter_match if not available
      if (!audienceLocations) {
        const filterMatch = getAdditionalMetric(member, 'filter_match');
        if (filterMatch?.audience_locations) {
          audienceLocations = filterMatch.audience_locations;
        }
      }

      // Fallback to audience_demographics
      if (!audienceLocations) {
        const audienceDemographics = getAdditionalMetric(
          member,
          'audience_demographics',
        );
        if (audienceDemographics?.location_distribution) {
          audienceLocations = audienceDemographics.location_distribution;
        }
      }

      if (
        !audienceLocations ||
        !Array.isArray(audienceLocations) ||
        audienceLocations.length === 0
      ) {
        return 'N/A';
      }

      // Handle different possible data structures
      const formattedLocations = audienceLocations
        .slice(0, 2) // Show top 2 locations
        .map((location: any) => {
          const locationName = location.name || location.country || 'Unknown';
          const percentage = location.percentage_value;

          if (percentage !== null && percentage !== undefined) {
            return `${locationName} (${Math.round(percentage)}%)`;
          } else {
            return locationName;
          }
        })
        .filter(Boolean);

      return formattedLocations.length > 0
        ? formattedLocations.join(', ')
        : 'N/A';
    },
    [getAdditionalMetric],
  );

  // Helper function to get contact details from main API (contacts already included)
  const getContactDetails = useCallback(
    (member: CampaignListMember) => {
      // Use contacts from main campaign-influencers API (already included in response)
      const socialAccountContacts = member.social_account?.contacts || [];
      if (socialAccountContacts.length > 0) {
        return socialAccountContacts;
      }

      // Fallback to additional_metrics if needed (rare case)
      const contactsData = getAdditionalMetric(member, 'contact_details');
      const parsed = parseJSONSafely(contactsData, []);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }

      return [];
    },
    [getAdditionalMetric, parseJSONSafely],
  );

  // Helper function to get social details from main API
  const getSocialDetails = useCallback(
    (member: CampaignListMember) => {
      const SOCIAL_TYPES = [
        'tiktok',
        'youtube',
        'threads',
        'linkedin',
        'instagram',
        'twitter',
        'facebook',
        'snapchat',
      ];

      // Helper to get effective type (checks both contact_type and name)
      const getEffectiveType = (contact: any): string | null => {
        const contactType = (
          contact.contact_type ||
          contact.type ||
          ''
        ).toLowerCase();
        const name = (contact.name || '').toLowerCase();

        if (SOCIAL_TYPES.includes(contactType)) return contactType;
        if (contactType === 'other' && SOCIAL_TYPES.includes(name)) return name;
        if (SOCIAL_TYPES.includes(name)) return name;
        return null;
      };

      // Use contacts from main campaign-influencers API
      const socialAccountContacts = member.social_account?.contacts || [];
      const socialContacts = socialAccountContacts
        .filter((contact) => getEffectiveType(contact) !== null)
        .map((contact) => ({
          ...contact,
          contact_type: getEffectiveType(contact),
          type: getEffectiveType(contact),
        }));

      if (socialContacts.length > 0) {
        return socialContacts;
      }

      // Fallback to additional_metrics if needed
      const contactsData = getAdditionalMetric(member, 'contact_details');
      const parsed = parseJSONSafely(contactsData, []);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((contact: any) => getEffectiveType(contact) !== null)
          .map((contact: any) => ({
            ...contact,
            contact_type: getEffectiveType(contact),
            type: getEffectiveType(contact),
          }));
      }

      return [];
    },
    [getAdditionalMetric, parseJSONSafely],
  );

  // Profile Insights handlers
  const handleProfileInsights = useCallback(
    (member: CampaignListMember) => {
      // Convert CampaignListMember to Influencer format for the modal
      const influencerData: Influencer = {
        id:
          member.social_account?.platform_account_id ||
          member.social_account?.id ||
          '',
        username: member.social_account?.account_handle || '',
        name: member.social_account?.full_name || '',
        profileImage: member.social_account?.profile_pic_url || '',
        followers: member.social_account?.followers_count || 0,
        engagementRate:
          getAdditionalMetric(member, 'engagementRate') ||
          getAdditionalMetric(member, 'engagement_rate') ||
          0,
        isVerified:
          member.social_account?.is_verified ||
          getAdditionalMetric(member, 'isVerified') ||
          false,
        url:
          member.social_account?.account_url ||
          getAdditionalMetric(member, 'url') ||
          '',
        work_platform: {
          id: 'instagram',
          name: 'Instagram',
          logo_url: '/instagram-logo.png',
        },
        // Required properties with default values
        contact_details: [],
        engagements: '',
        external_id:
          member.social_account?.platform_account_id ||
          member.social_account?.id ||
          '',
        introduction: '',
        livestream_metrics: undefined,
        // Optional fields with fallbacks
        average_likes: getAdditionalMetric(member, 'average_likes'),
        creator_location: (() => {
          const locationData = getAdditionalMetric(member, 'creator_location');
          const parsed = parseJSONSafely(locationData, null);
          if (parsed && parsed.city && parsed.country) {
            return {
              city: parsed.city,
              country: parsed.country,
              state: parsed.state || undefined,
            };
          }
          return undefined;
        })(),
        gender: getAdditionalMetric(member, 'gender'),
        language: getAdditionalMetric(member, 'language'),
        age_group: getAdditionalMetric(member, 'age_group'),
        platform_account_type: getAdditionalMetric(
          member,
          'platform_account_type',
        ),
        average_views: getCombinedAverageViews(member),
        content_count:
          getAdditionalMetric(member, 'content_count') ||
          member.social_account?.media_count,
        subscriber_count:
          member.social_account?.subscribers_count ||
          getAdditionalMetric(member, 'subscriber_count'),
        // ADD THIS LINE - Pass import_metadata to the influencer object
        import_metadata:
          member.social_account?.import_metadata ||
          getAdditionalMetric(member, 'import_metadata') ||
          undefined,
      };

      setSelectedInfluencerForInsights(influencerData);
      setIsInsightsModalOpen(true);
    },
    [getAdditionalMetric, parseJSONSafely, getCombinedAverageViews],
  );

  const handleCloseInsightsModal = useCallback(() => {
    setIsInsightsModalOpen(false);
    setSelectedInfluencerForInsights(null);
  }, []);

  // Truncate name function
  const truncateName = useCallback(
    (name: string, maxLength: number = 15): string => {
      if (!name) return '';
      if (name.length <= maxLength) return name;
      return name.substring(0, maxLength) + '...';
    },
    [],
  );

  // Handle clicking on name to open account URL
  const handleNameClick = useCallback(
    (member: CampaignListMember) => {
      const accountUrl =
        member.social_account?.account_url ||
        getAdditionalMetric(member, 'url');
      if (accountUrl) {
        window.open(accountUrl, '_blank', 'noopener,noreferrer');
      }
    },
    [getAdditionalMetric],
  );

  // Handle member updates - simplified for price/currency updates
  const handleMemberUpdate = useCallback(
    (updatedMember: CampaignListMember) => {
      console.log('Member updated:', updatedMember);
      // Use row-level updates instead of full refresh
      handleRowUpdate(updatedMember);
    },
    [handleRowUpdate],
  );

  const handleShortlistedStatusChange = async (
    influencerId: string,
    statusId: string,
  ) => {
    try {
      setUpdatingStatus((prev) => new Set([...prev, influencerId]));

      const selectedStatus = shortlistedStatuses.find(
        (status) => status.id === statusId,
      );
      console.log(
        `🔄 ShortlistedTable: Updating status for ${influencerId} to ${selectedStatus?.name}`,
      );

      // 1. Update local state immediately WITHOUT re-sorting
      setLocalMembers((prevMembers) =>
        prevMembers.map((member) => {
          if (member.id === influencerId) {
            return {
              ...member,
              shortlisted_status: selectedStatus,
            };
          }
          return member;
        }),
      );

      // 2. Also update localInfluencerUpdates for the StatusCell component
      setLocalInfluencerUpdates((prev) => ({
        ...prev,
        [influencerId]: {
          shortlisted_status: selectedStatus,
        },
      }));

      // 3. Make the API call in background
      const updatedInfluencer = await updateCampaignInfluencerShortlistedStatus(
        influencerId,
        statusId,
      );

      console.log('✅ ShortlistedTable: Status updated via API');

      // 4. Verify and sync with API response
      if (updatedInfluencer) {
        setLocalInfluencerUpdates((prev) => ({
          ...prev,
          [influencerId]: {
            shortlisted_status:
              (updatedInfluencer as any).shortlisted_status || selectedStatus,
          },
        }));
      }

      toast.success(
        `Status updated to "${selectedStatus?.name || 'unknown'}" successfully!`,
      );
    } catch (error) {
      console.error(
        '❌ ShortlistedTable: Error updating shortlisted status:',
        error,
      );

      // 5. On error, revert the local change
      setLocalMembers((prevMembers) => {
        const originalMember = members.find((m) => m.id === influencerId);
        if (originalMember) {
          return prevMembers.map((member) =>
            member.id === influencerId ? originalMember : member,
          );
        }
        return prevMembers;
      });

      setLocalInfluencerUpdates((prev) => {
        const newUpdates = { ...prev };
        delete newUpdates[influencerId];
        return newUpdates;
      });

      toast.error(
        error instanceof Error ? error.message : 'Failed to update status',
      );
    } finally {
      setUpdatingStatus((prev) => {
        const newSet = new Set(prev);
        newSet.delete(influencerId);
        return newSet;
      });
    }
  };

  const handleBulkStatusUpdate = async (statusId: string) => {
    try {
      setBulkUpdating(true);

      const selectedStatus = shortlistedStatuses.find(
        (status) => status.id === statusId,
      );
      console.log(
        `🔄 ShortlistedTable: Bulk updating ${selectedInfluencers.length} influencers to ${selectedStatus?.name}`,
      );

      // 1. Update local state immediately WITHOUT re-sorting
      if (selectedStatus) {
        // Update localMembers to keep positions stable
        setLocalMembers((prevMembers) =>
          prevMembers.map((member) => {
            if (selectedInfluencers.includes(member.id!)) {
              return {
                ...member,
                shortlisted_status: selectedStatus,
              };
            }
            return member;
          }),
        );

        // Also update localInfluencerUpdates for StatusCell components
        const bulkUpdates: Record<string, any> = {};
        selectedInfluencers.forEach((influencerId) => {
          bulkUpdates[influencerId] = {
            shortlisted_status: selectedStatus,
          };
        });

        setLocalInfluencerUpdates((prev) => ({
          ...prev,
          ...bulkUpdates,
        }));

        console.log(
          '✅ ShortlistedTable: Local state updated for bulk operation',
        );
      }

      // 2. Clear selection immediately
      onSelectionChange([]);

      // 3. Make API call in background (DON'T wait for onDataRefresh)
      const result = await bulkUpdateShortlistedStatus(
        selectedInfluencers,
        statusId,
      );

      // 4. Show success message
      if (result.failed_count > 0) {
        toast.success(
          `${result.updated_count} influencer(s) updated successfully. ${result.failed_count} failed.`,
        );
      } else {
        toast.success(
          `All ${result.updated_count} influencer(s) updated successfully!`,
        );
      }
    } catch (error) {
      console.error('❌ ShortlistedTable: Error bulk updating status:', error);

      // On error, revert the local changes
      // Since we don't know which specific influencers failed, we could optionally refresh
      // But for now, we just show an error and let the user decide
      toast.error(
        error instanceof Error ? error.message : 'Failed to bulk update status',
      );
    } finally {
      setBulkUpdating(false);
    }
  };

  // Helper function to check if a column has meaningful data
  const columnHasMeaningfulData = useCallback(
    (column: ColumnDefinition) => {
      return localMembers.some((member) => {
        const value = column.getValue(member);

        if (
          value === null ||
          value === undefined ||
          value === '' ||
          value === 'N/A'
        ) {
          return false;
        }

        if (Array.isArray(value) && value.length === 0) {
          return false;
        }

        if (typeof value === 'number' && value === 0) {
          return [
            'followers',
            'engagement_rate',
            'avg_likes',
            'price',
          ].includes(column.key);
        }

        return true;
      });
    },
    [localMembers],
  );

  // Define all available columns with enhanced data access and symmetrical widths (w-24 for all)
  const allColumns: ColumnDefinition[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        width: 'w-32', // Slightly wider for name column to accommodate profile picture
        defaultVisible: true,
        getValue: (member) =>
          member.social_account?.full_name ||
          getAdditionalMetric(member, 'name') ||
          '',
        render: (value, member) => (
          <div className="flex items-center min-w-0">
            <div className="flex-shrink-0 h-12 w-12 relative">
              <img
                className="rounded-full object-cover h-12 w-12 border-2 border-gray-200 shadow-sm"
                src={getProfilePicture(member)}
                alt={member.social_account?.full_name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.includes('pravatar')) {
                    target.style.display = 'none';
                    const initials: string = (
                      member.social_account?.full_name || 'U'
                    )
                      .split(' ')
                      .map((n: string): string => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2);

                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.initials-fallback')) {
                      const fallbackDiv = document.createElement('div');
                      fallbackDiv.className =
                        'initials-fallback absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm';
                      fallbackDiv.textContent = initials;
                      parent.appendChild(fallbackDiv);
                    }
                  } else {
                    target.src = `https://i.pravatar.cc/150?u=${member.social_account?.id}`;
                  }
                }}
              />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-900 flex items-center min-w-0">
                <span
                  className="truncate cursor-pointer hover:text-purple-600 transition-colors"
                  title={member.social_account?.full_name || ''}
                  onClick={() => handleNameClick(member)}
                >
                  {truncateName(
                    member.social_account?.full_name ||
                      getAdditionalMetric(member, 'name') ||
                      '',
                    20,
                  )}
                </span>
                {(member.social_account?.is_verified ||
                  getAdditionalMetric(member, 'isVerified')) && (
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
                onClick={() => handleNameClick(member)}
              >
                <span className="truncate">
                  @
                  {truncateName(
                    member.social_account?.account_handle ||
                      getAdditionalMetric(member, 'username') ||
                      '',
                    20,
                  )}
                </span>
                {getPlatformIcon(member)}
              </div>
            </div>
          </div>
        ),
      },

      // Tags Column - with dynamic width for resize
      {
        key: 'tags',
        label: 'Tags',
        width: '', // Dynamic - controlled by tagsColumnWidth state
        defaultVisible: true,
        getValue: (member) => (member as any).tags || [],
        // In column definition
        render: (value, member) => (
          <TagsColumn
            member={member}
            onUpdate={handleRowUpdate}
            columnWidth={tagsColumnResize.width} // Use .width from hook
          />
        ),
      },
      // X-Campaigns Column - Shows past campaigns count with modal
      {
        key: 'x_campaigns',
        label: 'X-Campaigns',
        width: 'w-24',
        defaultVisible: true,
        getValue: (member) => (member as any).past_campaigns?.length || 0,
        render: (value, member) => (
          <XCampaignsColumn
            member={member}
            pastCampaigns={(member as any).past_campaigns || []}
          />
        ),
      },
      {
        key: 'followers',
        label: 'Followers',
        width: 'w-24',
        defaultVisible: true,
        getValue: (member) => {
          // Check if this is a YouTube influencer
          const platformName =
            (member.social_account as any)?.platform?.name?.toLowerCase() ||
            getAdditionalMetric(member, 'work_platform')?.name?.toLowerCase();

          // For YouTube, prioritize subscriber_count
          if (platformName === 'youtube') {
            return (
              member.social_account?.subscribers_count ||
              getAdditionalMetric(member, 'subscriber_count') ||
              member.social_account?.followers_count ||
              getAdditionalMetric(member, 'followers') ||
              0
            );
          }

          // For Instagram/TikTok, use followers_count
          return (
            member.social_account?.followers_count ||
            getAdditionalMetric(member, 'followers') ||
            0
          );
        },
        render: (value) => formatNumber(value) || 'N/A',
      },
      {
        key: 'engagement_rate',
        label: 'Eng Rate',
        width: 'w-24',
        defaultVisible: true,
        getValue: (member: CampaignListMember) => formatEngagementRate(member),
        render: (value: string) => (
          <span className="text-gray-700 text-sm">{value}</span>
        ),
      },
      {
        key: 'avg_likes',
        label: 'Avg Likes',
        width: 'w-24',
        defaultVisible: true,
        getValue: (member) => getAdditionalMetric(member, 'average_likes'),
        render: (value) =>
          typeof value === 'number' ? formatNumber(value) : 'N/A',
      },

      {
        key: 'avg_views',
        label: 'Avg Views',
        width: 'w-24',
        defaultVisible: true,
        getValue: (member) => getCombinedAverageViews(member),
        render: (value) =>
          typeof value === 'number' ? formatNumber(value) : 'N/A',
      },

      {
        key: 'location',
        label: 'Location',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) => formatLocation(member),
        render: (value) => (
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
            {value}
          </span>
        ),
      },
      {
        key: 'gender',
        label: 'Gender',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) => getAdditionalMetric(member, 'gender'),
        render: (value) => {
          if (!value) return 'N/A';
          const displayValue =
            String(value).charAt(0).toUpperCase() +
            String(value).slice(1).toLowerCase();
          const colorClass =
            value?.toLowerCase() === 'female'
              ? 'bg-pink-100 text-pink-800'
              : value?.toLowerCase() === 'male'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800';
          return (
            <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
              {displayValue}
            </span>
          );
        },
      },
      {
        key: 'language',
        label: 'Lang',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) => getAdditionalMetric(member, 'language'),
        render: (value: any) => (value ? String(value).toUpperCase() : 'N/A'),
      },
      {
        key: 'age_group',
        label: 'Age',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) => getAdditionalMetric(member, 'age_group'),
        render: (value) => value || 'N/A',
      },
      {
        key: 'audience_age_groups',
        label: 'Audience Age',
        width: 'w-32',
        defaultVisible: false,
        getValue: (member) => formatAudienceAgeGroups(member),
        render: (value) => (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {value}
          </span>
        ),
      },
      {
        key: 'age_distribution',
        label: 'Age Distribution',
        width: 'w-32',
        defaultVisible: false,
        getValue: (member) => formatAgeDistribution(member),
        render: (value) => (
          <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
            {value}
          </span>
        ),
      },
      {
        key: 'audience_gender_distribution',
        label: 'Audience Gender',
        width: 'w-36',
        defaultVisible: false,
        getValue: (member) => formatGenderDistribution(member),
        render: (value) => {
          if (value === 'N/A') return 'N/A';

          // Parse the gender data and convert to M/F format with colors
          const genderParts = value.split(' | '); // Split "MALE: 19% | FEMALE: 81%"

          return (
            <div className="flex flex-wrap gap-1">
              {genderParts.map((genderPart: string, index: number) => {
                // Extract gender type and percentage
                const isMale =
                  genderPart.toLowerCase().includes('male') &&
                  !genderPart.toLowerCase().includes('female');
                const isFemale = genderPart.toLowerCase().includes('female');

                // Extract percentage from the string (e.g., "19%" from "MALE: 19%")
                const percentageMatch = genderPart.match(/(\d+)%/);
                const percentage = percentageMatch
                  ? percentageMatch[1] + '%'
                  : '';

                // Determine display text and color
                let displayText = '';
                let colorClass = '';

                if (isMale) {
                  displayText = `M: ${percentage}`;
                  colorClass = 'bg-blue-100 text-blue-800'; // Same blue as Gender column
                } else if (isFemale) {
                  displayText = `F: ${percentage}`;
                  colorClass = 'bg-pink-100 text-pink-800'; // Same pink as Gender column
                } else {
                  displayText = genderPart;
                  colorClass = 'bg-gray-100 text-gray-800';
                }

                return (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full ${colorClass}`}
                  >
                    {displayText}
                  </span>
                );
              })}
            </div>
          );
        },
      },
      {
        key: 'audience_locations',
        label: 'Audience Locations',
        width: 'w-40',
        defaultVisible: false,
        getValue: (member) => formatAudienceLocations(member),
        render: (value) => {
          if (value === 'N/A') return 'N/A';

          // Parse and render multiple locations with different colors
          const locations = value.split(', ');
          return (
            <div className="flex flex-wrap gap-1">
              {locations.map((location: string, index: number) => {
                // Assign colors based on index
                const colorClasses = [
                  'bg-green-100 text-green-800',
                  'bg-purple-100 text-purple-800',
                  'bg-orange-100 text-orange-800',
                ];
                const colorClass =
                  colorClasses[index % colorClasses.length] ||
                  'bg-gray-100 text-gray-800';

                return (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full ${colorClass}`}
                  >
                    {location}
                  </span>
                );
              })}
            </div>
          );
        },
      },
      {
        key: 'content_count',
        label: 'Posts',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) =>
          getAdditionalMetric(member, 'content_count') ||
          member.social_account?.media_count,
        render: (value) =>
          typeof value === 'number' ? formatNumber(value) : 'N/A',
      },
      {
        key: 'platform_account_type',
        label: 'Type',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) =>
          getAdditionalMetric(member, 'platform_account_type'),
        render: (value) => {
          if (!value) return 'N/A';
          const displayValue = String(value)
            .replace('_', ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
          const colorClass =
            value === 'BUSINESS'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800';
          return (
            <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
              {displayValue}
            </span>
          );
        },
      },
      // Price Column - READ-ONLY display (non-editable, shows total_price)
      {
        key: 'price',
        label: 'Price',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) =>
          member.price_approved
            ? member.total_price ||
              getAdditionalMetric(member, 'total_price') ||
              0
            : 0,
        render: (value, member) => {
          // If price is not approved, show a professional badge
          if (!member.price_approved) {
            return (
              <div className="flex items-center">
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
              </div>
            );
          }

          // If price is approved, show the total_price with currency
          const currentCurrency = member.currency || 'USD';
          const currencySymbols: { [key: string]: string } = {
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

          const symbol = currencySymbols[currentCurrency] || '$';
          const displayPrice = parseFloat(member.total_price) || 0;

          return (
            <div className="flex items-center text-xs text-gray-700">
              <span className="mr-1 text-gray-600 font-medium">{symbol}</span>
              <span className="text-gray-900 font-medium">
                {Math.round(displayPrice).toLocaleString()}
              </span>
            </div>
          );
        },
      },
      // Contact Column - Uses contacts from main API response (no separate API calls needed)
      {
        key: 'contact',
        label: 'Contact',
        width: 'w-24',
        defaultVisible: true,
        getValue: (member) => getContactDetails(member).length,
        render: (value, member) => (
          <ContactColumn member={member} onUpdate={handleRowUpdate} />
        ),
      },

      // ADD THIS: Social Column - Shows social platform links (tiktok, youtube, threads, etc.)
      {
        key: 'social',
        label: 'Social',
        width: 'w-24',
        defaultVisible: true,
        getValue: (member) => getSocialDetails(member).length,
        render: (value, member) => (
          <SocialColumn member={member} onUpdate={handleRowUpdate} />
        ),
      },

      // CPV Column - Cost Per View calculation
      {
        key: 'cpv',
        label: 'CPV',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) => {
          // Only calculate CPV when price is approved
          const priceApproved = Boolean(member.price_approved);

          if (!priceApproved) {
            return null;
          }

          const budget = parseFloat(member.total_price) || 0;
          const avgViews = getCombinedAverageViews(member) || 0;

          if (budget <= 0 || avgViews <= 0) {
            return null;
          }

          return budget / avgViews;
        },
        render: (value) => {
          if (value === null || typeof value !== 'number' || value <= 0) {
            return <span className="text-gray-400">-</span>;
          }
          return (
            <span className="text-gray-700 font-medium">
              {value.toFixed(4)}
            </span>
          );
        },
      },
      {
        key: 'agent',
        label: 'Agent',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) => member.assigned_agent?.name || null,
        render: (value) => {
          if (!value) {
            return (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                Unassigned
              </span>
            );
          }
          return (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              {value}
            </span>
          );
        },
      },
      {
        key: 'following_count',
        label: 'Following',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) => getFollowingCount(member),
        render: (value) =>
          typeof value === 'number' ? formatNumber(value) : 'N/A',
      },
      {
        key: 'livestream_metrics',
        label: 'Livestream',
        width: 'w-24',
        defaultVisible: false,
        getValue: (member) => getAdditionalMetric(member, 'livestream_metrics'),
        render: (value) => {
          if (value && typeof value === 'object') {
            return (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Available
              </span>
            );
          }
          return 'N/A';
        },
      },

      {
        key: 'outreach_status',
        label: 'Outreach Status',
        width: 'w-28',
        defaultVisible: false,
        getValue: (member) => (member as any).status?.name || 'N/A',
        render: (value) => {
          if (!value || value === 'N/A') {
            return <span className="text-xs text-gray-400">N/A</span>;
          }

          // Format status name: "info_requested" -> "Info Requested"
          const formattedStatus = value
            .split('_')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          // Define color based on status
          const statusColors: Record<string, string> = {
            discovered: 'bg-gray-100 text-gray-700',
            contacted: 'bg-blue-100 text-blue-800',
            info_requested: 'bg-yellow-100 text-yellow-800',
            negotiating: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
          };

          const colorClass = statusColors[value] || 'bg-gray-100 text-gray-700';

          return (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${colorClass}`}
            >
              {formattedStatus}
            </span>
          );
        },
      },

      {
        key: 'added_at',
        label: 'Added At',
        width: 'w-28',
        defaultVisible: false,
        getValue: (member) => (member as any).created_at || null,
        render: (value) => {
          if (!value) {
            return <span className="text-xs text-gray-400">N/A</span>;
          }

          try {
            const date = new Date(value);
            return (
              <span className="text-xs text-gray-700">
                {date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            );
          } catch {
            return <span className="text-xs text-gray-400">N/A</span>;
          }
        },
      },

      // Add this column definition in the allColumns array, as second-last item
      {
        key: 'shortlisted_status',
        label: 'Status',
        width: 'w-24',
        defaultVisible: true,
        getValue: (member) =>
          (member as any).shortlisted_status || { name: 'pending' },
        render: (value, member) => (
          <ShortlistedStatusCell
            influencer={member}
            shortlistedStatuses={shortlistedStatuses}
            onStatusChange={handleShortlistedStatusChange}
            isUpdating={updatingStatus.has(member.id)}
            statusesLoading={statusesLoading}
            localUpdate={localInfluencerUpdates[member.id]}
          />
        ),
      },
    ],
    [
      getAdditionalMetric,
      getProfilePicture,
      truncateName,
      handleNameClick,
      getPlatformIcon,
      formatLocation,
      getReelViews,
      handleMemberUpdate,
      getContactDetails,
      handleRowUpdate,
      getFollowingCount,
      formatAudienceAgeGroups,
      formatGenderDistribution,
      formatAgeDistribution,
      formatAudienceLocations,
      formatEngagementRate,
      shortlistedStatuses,
      handleShortlistedStatusChange,
      updatingStatus,
      statusesLoading,
      localInfluencerUpdates,
    ],
  );

  // Initialize visible columns based on meaningful data availability and default visibility
  useEffect(() => {
    if (localMembers.length > 0 && visibleColumns.size === 0) {
      const initialVisible = new Set<string>();

      allColumns.forEach((column) => {
        if (column.defaultVisible) {
          if (columnHasMeaningfulData(column)) {
            initialVisible.add(column.key);
          }
        } else {
          if (columnHasMeaningfulData(column)) {
            initialVisible.add(column.key);
          }
        }
      });

      setVisibleColumns(initialVisible);
    }
  }, [
    localMembers.length,
    allColumns,
    columnHasMeaningfulData,
    visibleColumns.size,
  ]);

  // Notify parent component when visible columns change
  useEffect(() => {
    if (onVisibleColumnsChange && visibleColumns.size > 0) {
      const visibleColumnKeys = Array.from(visibleColumns);
      onVisibleColumnsChange(visibleColumnKeys);
    }
  }, [visibleColumns, onVisibleColumnsChange]);

  // Filter shortlisted members based on search text
  const filteredMembers = useMemo(() => {
    return searchText
      ? localMembers.filter((member) => {
          const fullName =
            member.social_account?.full_name ||
            getAdditionalMetric(member, 'name') ||
            '';
          const accountHandle =
            member.social_account?.account_handle ||
            getAdditionalMetric(member, 'username') ||
            '';
          return (
            fullName.toLowerCase().includes(searchText.toLowerCase()) ||
            accountHandle.toLowerCase().includes(searchText.toLowerCase())
          );
        })
      : localMembers;
  }, [localMembers, searchText, getAdditionalMetric]);

  // Handle sorting
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

  // Sort filtered members based on sort configuration
  const sortedMembers = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredMembers;
    }

    const column = allColumns.find((col) => col.key === sortConfig.key);
    if (!column) return filteredMembers;

    return [...filteredMembers].sort((a, b) => {
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
  }, [filteredMembers, sortConfig, allColumns]);

  // Get sort icon for column headers
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

  // Get visible columns in order
  const visibleColumnsData = useMemo(
    () => allColumns.filter((column) => visibleColumns.has(column.key)),
    [allColumns, visibleColumns],
  );

  // Toggle row selection
  const toggleRowSelection = useCallback(
    (id: string) => {
      const newSelected = selectedInfluencers.includes(id)
        ? selectedInfluencers.filter((item) => item !== id)
        : [...selectedInfluencers, id];
      onSelectionChange(newSelected);
    },
    [selectedInfluencers, onSelectionChange],
  );

  // Toggle column visibility
  const toggleColumnVisibility = useCallback(
    (columnKey: string) => {
      const newVisible = new Set(visibleColumns);
      if (newVisible.has(columnKey)) {
        newVisible.delete(columnKey);
      } else {
        newVisible.add(columnKey);
      }
      setVisibleColumns(newVisible);

      if (onVisibleColumnsChange) {
        const visibleColumnKeys = Array.from(newVisible);
        onVisibleColumnsChange(visibleColumnKeys);
      }
    },
    [visibleColumns, onVisibleColumnsChange],
  );

  // Toggle all selection
  const toggleAllSelection = useCallback(() => {
    const currentPageIds = sortedMembers
      .map((member) => member.id ?? '')
      .filter((id) => id);

    if (
      selectedInfluencers.length === currentPageIds.length &&
      currentPageIds.every((id) => selectedInfluencers.includes(id))
    ) {
      onSelectionChange(
        selectedInfluencers.filter((id) => !currentPageIds.includes(id)),
      );
    } else {
      const newSelected = [...selectedInfluencers];
      currentPageIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onSelectionChange(newSelected);
    }
  }, [sortedMembers, selectedInfluencers, onSelectionChange]);

  // Check if all current page items are selected
  const isAllCurrentPageSelected = useMemo(() => {
    const currentPageIds = sortedMembers
      .map((member) => member.id ?? '')
      .filter((id) => id);
    return (
      currentPageIds.length > 0 &&
      currentPageIds.every((id) => selectedInfluencers.includes(id))
    );
  }, [sortedMembers, selectedInfluencers]);

  // Pagination helpers
  const generatePageNumbers = useCallback(() => {
    const { page: currentPage, total_pages: totalPages } = pagination;
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3);
        if (totalPages > 4) pages.push('...');
        if (totalPages > 3) pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        if (totalPages > 4) pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  }, [pagination]);

  const pageNumbers = useMemo(
    () => generatePageNumbers(),
    [generatePageNumbers],
  );
  const startItem = (pagination.page - 1) * pagination.page_size + 1;
  const endItem = Math.min(
    pagination.page * pagination.page_size,
    pagination.total_items,
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (onPageChange) {
        onPageChange(page);
      }
    },
    [onPageChange],
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setShowPageSizeDropdown(false);
      if (onPageSizeChange) {
        onPageSizeChange(newPageSize);
      }
    },
    [onPageSizeChange],
  );

  const pageSizeOptions = useMemo(
    () => [
      10,
      25,
      50,
      100,
      { label: 'Show All', value: pagination.total_items || 999999 },
    ],
    [pagination.total_items],
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (showPageSizeDropdown && !target.closest('.page-size-dropdown')) {
        setShowPageSizeDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPageSizeDropdown]);

  // Refresh Profile Data Hook
  const {
    isRefreshing: isRefreshingProfile,
    showConfirmationModal: showRefreshModal,
    progress: refreshProgress,
    initiateRefresh: initiateProfileRefresh,
    confirmRefresh: confirmProfileRefresh,
    cancelRefresh: cancelProfileRefresh,
  } = useRefreshProfileData({
    platformId: selectedPlatform?.work_platform_id || '',
    platform:
      (selectedPlatform?.name?.toLowerCase() as
        | 'instagram'
        | 'tiktok'
        | 'youtube') || 'instagram',
    campaignListId:
      campaignListId ||
      shortlistedMembers?.influencers?.[0]?.campaign_list_id ||
      '',
    onSuccess: (result) => {
      // Update the local row with refreshed data
      if (result.updatedMember) {
        handleRowUpdate(result.updatedMember as CampaignListMember);
      }
      // Optionally trigger a data refresh
      if (onDataRefresh) {
        onDataRefresh();
      }
    },
    onError: (error) => {
      console.error('Profile refresh error:', error);
    },
  });

  // Track which member is being refreshed for the modal
  const [refreshingMemberId, setRefreshingMemberId] = useState<string | null>(
    null,
  );
  const [refreshingUsername, setRefreshingUsername] = useState<string | null>(
    null,
  );

  // Handler for initiating refresh from ActionColumn
  const handleRefreshProfileData = useCallback(
    (member: CampaignListMember) => {
      setRefreshingMemberId(member.id || null);
      setRefreshingUsername(member.social_account?.account_handle || null);
      // Type assertion: CampaignListMember is compatible with CampaignInfluencerResponse at runtime
      initiateProfileRefresh(member as any);
    },
    [initiateProfileRefresh],
  );

  // Show skeleton during loading
  if (isLoading) {
    return (
      <TableSkeleton
        columns={7}
        rows={5}
        showCheckbox={true}
        showActionColumn={true}
        className="w-full"
      />
    );
  }

  return (
    <>
      {/* Bulk Status Update - Only show when influencers are selected */}
      {selectedInfluencers.length > 0 && (
        <div className="mb-4">
          <BulkStatusUpdate
            selectedInfluencers={selectedInfluencers}
            shortlistedStatuses={shortlistedStatuses}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            isUpdating={bulkUpdating}
            statusesLoading={statusesLoading}
          />
        </div>
      )}

      {/* ========== VIEW TOGGLE TOOLBAR ========== */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">View:</span>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-lg ${
                  viewMode === 'table'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors rounded-lg ${
                  viewMode === 'grid'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>
            </div>
          </div>

          {/* Select All - Only show in Grid view (Fix #1) */}
          {viewMode === 'grid' && sortedMembers.length > 0 && (
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllCurrentPageSelected}
                  ref={(el) => {
                    if (el) {
                      el.indeterminate =
                        selectedInfluencers.length > 0 &&
                        !isAllCurrentPageSelected;
                    }
                  }}
                  onChange={toggleAllSelection}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                />
                <span className="ml-2 text-sm text-gray-600">Select all</span>
              </label>
              {selectedInfluencers.length > 0 && (
                <span className="text-sm text-purple-600 font-medium">
                  ({selectedInfluencers.length} selected)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side - Count */}
        <span className="text-sm text-gray-500">
          {sortedMembers.length} influencer
          {sortedMembers.length !== 1 ? 's' : ''}
        </span>
      </div>
      {/* ========== CONDITIONAL VIEW RENDERING ========== */}
      {viewMode === 'grid' ? (
        <ShortlistedGridView
          members={sortedMembers}
          selectedInfluencers={selectedInfluencers}
          onSelectionChange={onSelectionChange}
          visibleColumns={visibleColumns}
          getAdditionalMetric={getAdditionalMetric}
          getProfilePicture={getProfilePicture}
          getPlatformName={getPlatformName}
          getPlatformIcon={getPlatformIcon}
          formatLocation={formatLocation}
          formatEngagementRate={formatEngagementRate}
          getCombinedAverageViews={getCombinedAverageViews}
          onProfileInsights={handleProfileInsights}
          onRowUpdate={handleRowUpdate}
          onRemovingChange={onRemovingChange}
          removingInfluencers={removingInfluencers}
          onInfluencerRemoved={onInfluencerRemoved}
          onRefreshProfileData={handleRefreshProfileData}
          refreshingMemberId={refreshingMemberId}
          isRefreshingProfile={isRefreshingProfile}
          shortlistedStatuses={shortlistedStatuses}
          onShortlistedStatusChange={handleShortlistedStatusChange}
          updatingStatus={updatingStatus}
          statusesLoading={statusesLoading}
          localInfluencerUpdates={localInfluencerUpdates}
          searchText={searchText}
        />
      ) : (
        <div className="w-12/12 bg-white rounded-lg shadow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-hidden">
            <div className="max-h-[735px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th
                      scope="col"
                      className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"
                    >
                      <input
                        type="checkbox"
                        checked={isAllCurrentPageSelected}
                        onChange={toggleAllSelection}
                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                      />
                    </th>
                    {visibleColumnsData.map((column) => (
                      <th
                        key={column.key}
                        scope="col"
                        className={`px-2 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none relative ${
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
                            {column.key === 'name'
                              ? `${column.label} (${pagination.total_items})`
                              : column.label}
                          </span>
                          <div className="transform group-hover:scale-110 transition-transform duration-200">
                            {getSortIcon(column.key)}
                          </div>
                        </div>

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

                    {/* Insights Column */}
                    <th
                      scope="col"
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20"
                    >
                      <span>Insights</span>
                    </th>

                    <th
                      scope="col"
                      className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 relative"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="column-dropdown">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowColumnDropdown(!showColumnDropdown);
                            }}
                            className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                            title="Toggle Columns"
                          >
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                          </button>

                          {/* Column Toggle Dropdown */}
                          {showColumnDropdown && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowColumnDropdown(false)}
                              ></div>

                              <div className="fixed right-4 top-20 w-56 bg-white rounded-lg shadow-2xl border border-gray-300 z-50 max-h-[28rem] overflow-hidden">
                                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                                  <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                                    <svg
                                      className="w-4 h-4 mr-2 text-purple-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z"
                                      />
                                    </svg>
                                    Column Visibility
                                  </h3>
                                  <p className="text-xs text-gray-600 mt-1">
                                    Select columns to display
                                  </p>
                                </div>

                                <div className="py-3 max-h-80 overflow-y-auto">
                                  {allColumns.map((column) => {
                                    const hasData =
                                      columnHasMeaningfulData(column);

                                    return (
                                      <label
                                        key={column.key}
                                        className="flex items-center px-5 py-3 hover:bg-gradient-to-r hover:from-purple-25 hover:to-pink-25 cursor-pointer transition-all duration-150 group"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={visibleColumns.has(
                                            column.key,
                                          )}
                                          onChange={() =>
                                            toggleColumnVisibility(column.key)
                                          }
                                          className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 transition-colors"
                                        />
                                        <div className="ml-3 flex-1 min-w-0">
                                          <span
                                            className={`text-sm font-medium block truncate transition-colors ${
                                              hasData
                                                ? 'text-gray-900 group-hover:text-purple-700'
                                                : 'text-gray-400 group-hover:text-gray-500'
                                            }`}
                                          >
                                            {column.label}
                                          </span>
                                        </div>
                                        <div className="ml-2 flex-shrink-0">
                                          {hasData ? (
                                            <div
                                              className="w-2 h-2 bg-green-400 rounded-full"
                                              title="Data available"
                                            ></div>
                                          ) : (
                                            <div
                                              className="w-2 h-2 bg-gray-300 rounded-full"
                                              title="No data"
                                            ></div>
                                          )}
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>

                                <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                  <button
                                    onClick={() => {
                                      const columnsWithData = new Set<string>();
                                      allColumns.forEach((column) => {
                                        if (
                                          columnHasMeaningfulData(column) ||
                                          column.defaultVisible
                                        ) {
                                          columnsWithData.add(column.key);
                                        }
                                      });
                                      setVisibleColumns(columnsWithData);

                                      if (onVisibleColumnsChange) {
                                        const visibleColumnKeys =
                                          Array.from(columnsWithData);
                                        onVisibleColumnsChange(
                                          visibleColumnKeys,
                                        );
                                      }
                                    }}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                  >
                                    Select All
                                  </button>
                                  <button
                                    onClick={() => {
                                      const defaultColumns = new Set<string>();
                                      allColumns.forEach((column) => {
                                        if (
                                          column.defaultVisible &&
                                          columnHasMeaningfulData(column)
                                        ) {
                                          defaultColumns.add(column.key);
                                        }
                                      });
                                      setVisibleColumns(defaultColumns);

                                      if (onVisibleColumnsChange) {
                                        const visibleColumnKeys =
                                          Array.from(defaultColumns);
                                        onVisibleColumnsChange(
                                          visibleColumnKeys,
                                        );
                                      }
                                    }}
                                    className="text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors"
                                  >
                                    Reset
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedMembers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={visibleColumnsData.length + 3}
                        className="px-3 py-8 text-center text-gray-500"
                      >
                        {searchText
                          ? 'No influencers match your search.'
                          : 'No shortlisted influencers yet.'}
                      </td>
                    </tr>
                  ) : (
                    sortedMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedInfluencers.includes(
                              member.id ?? '',
                            )}
                            onChange={() => toggleRowSelection(member.id ?? '')}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                          />
                        </td>
                        {visibleColumnsData.map((column) => (
                          <td
                            key={column.key}
                            className={`px-2 py-4 whitespace-nowrap text-sm text-gray-500 ${
                              column.key === 'tags' ? '' : column.width
                            }`}
                            style={
                              column.key === 'tags'
                                ? tagsColumnResize.getColumnStyle()
                                : undefined
                            }
                          >
                            <span
                              className={
                                column.key === 'tags' ? '' : 'truncate block'
                              }
                            >
                              {column.render
                                ? column.render(column.getValue(member), member)
                                : column.getValue(member) || 'N/A'}
                            </span>
                          </td>
                        ))}

                        {/* Insights Column */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs">
                          <button
                            onClick={() => handleProfileInsights(member)}
                            className="text-gray-500 flex items-center hover:text-gray-700 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              />
                            </svg>
                            <span className="truncate">Profile Insights</span>
                          </button>
                        </td>

                        <td className="px-2 py-4 whitespace-nowrap text-center w-20">
                          <ActionColumn
                            member={member}
                            isRemoving={removingInfluencers.includes(
                              member.id ?? '',
                            )}
                            onRemovingChange={onRemovingChange}
                            removingInfluencers={removingInfluencers}
                            selectedInfluencers={selectedInfluencers}
                            onSelectionChange={onSelectionChange}
                            onInfluencerRemoved={onInfluencerRemoved}
                            onContactsChanged={handleContactsChanged}
                            onRowUpdate={handleRowUpdate}
                            // New props for refresh functionality
                            onRefreshProfileData={handleRefreshProfileData}
                            isRefreshingProfileData={
                              isRefreshingProfile &&
                              refreshingMemberId === member.id
                            }
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Pagination */}
      <div className="mt-4 px-3 py-3 flex items-center justify-between bg-white rounded-lg shadow">
        <div className="flex-1 flex justify-between items-center">
          <div className="flex">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.has_previous}
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

            {pageNumbers.map((pageNum, index) => (
              <div key={index}>
                {pageNum === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageChange(pageNum as number)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                      pageNum === pagination.page
                        ? 'bg-pink-50 text-pink-600 border-pink-300'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.has_next}
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
          </div>
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{startItem}</span> to{' '}
              <span className="font-medium">{endItem}</span> of{' '}
              <span className="font-medium">{pagination.total_items}</span>{' '}
              entries
            </p>
            <div className="ml-2 relative page-size-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPageSizeDropdown(!showPageSizeDropdown);
                }}
                className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center"
              >
                Show{' '}
                {pagination.page_size >= pagination.total_items
                  ? 'All'
                  : pagination.page_size}
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
                    {pageSizeOptions.map((option, index) => {
                      const isObject = typeof option === 'object';
                      const value = isObject ? option.value : option;
                      const label = isObject ? option.label : `Show ${option}`;

                      let isActive;
                      if (isObject) {
                        isActive = pagination.page_size === value;
                      } else {
                        isActive = pagination.page_size === value;
                      }

                      return (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePageSizeChange(value);
                          }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            isActive
                              ? 'bg-pink-50 text-pink-600 font-medium'
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
      {/* Profile Insights Modal */}
      <ProfileInsightsModal
        selectedPlatform={selectedPlatform}
        isOpen={isInsightsModalOpen}
        onClose={handleCloseInsightsModal}
        influencer={selectedInfluencerForInsights}
        onFetchPosts={onFetchInfluencerPosts}
      />

      {/* Refresh Profile Confirmation Modal */}
      <RefreshProfileConfirmationModal
        isOpen={showRefreshModal}
        isRefreshing={isRefreshingProfile}
        progress={refreshProgress}
        username={refreshingUsername || undefined}
        onConfirm={confirmProfileRefresh}
        onCancel={() => {
          cancelProfileRefresh();
          setRefreshingMemberId(null);
          setRefreshingUsername(null);
        }}
      />
    </>
  );
};

export default ShortlistedTable;
