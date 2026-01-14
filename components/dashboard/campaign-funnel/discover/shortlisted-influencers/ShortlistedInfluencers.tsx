'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Search } from 'react-feather';
import { Campaign } from '@/types/campaign';
import {
  CampaignListMember,
  CampaignListMembersResponse,
  removeInfluencerFromList,
  addInfluencerToList,
} from '@/services/campaign/campaign-list.service';
import { executeBulkAssignments } from '@/services/bulk-assignments/bulk-assignments.service';
import { BulkAssignmentRequest } from '@/types/bulk-assignments';
import {
  MessageTemplate,
  CreateMessageTemplateWithFollowupsRequest,
} from '@/types/message-templates';
import {
  createMessageTemplateWithFollowups,
  getMessageTemplatesByCampaignWithFollowups,
} from '@/services/message-templates/message-templates.client';
import ShortlistedAnalytics from './ShortlistedAnalytics';
import OutreachMessageForm from './OutreachMessageForm';
import ShortlistedTable from './ShortlistedTable';
import ExportButton from './ExportButton';
import ImportCsvButton from './ImportCsvButton';
import AddUserButton from './AddUserButton';
import ShortlistedInfluencersSummary from './ShortlistedInfluencersSummary';
import ShortlistedSummaryV2 from './ShortlistedSummaryV2';
import AddedThroughFilter from './AddedThroughFilter';
import {
  AddedThroughFilterOption,
  AddedThroughFilterCounts,
} from '@/types/added-through-filter';
import { Platform } from '@/types/platform';
import { toast } from 'react-hot-toast';
import {
  createInfluencerContact,
  getInfluencerContacts,
  updateInfluencerContact,
} from '@/services/influencer-contacts/influencer-contacts.service';
import { createPublicSession } from '@/services/public-sessions/public-sessions.client';
import { Copy, Check, ChevronDown, Download, Upload, UserPlus, Share2, FileText, Trash2 } from 'lucide-react';

// ✅ ADD CONTEXT IMPORT
import { useCampaigns } from '@/context/CampaignContext';

// ✅ IMPORT ONLY copyInfluencersToCampaign (not fetchCampaignsByCompany)
import {
  copyInfluencersToCampaign,
  getAllCampaignInfluencers,
} from '@/services/campaign-influencers/campaign-influencers.client';
// Add after existing imports
import PlatformFilter from './PlatformFilter';
import {
  PlatformFilterOption,
  PlatformFilterCounts,
} from '@/types/platform-filter';

// Type declarations
declare module '@/services/campaign/campaign-list.service' {
  interface CampaignListMember {
    is_deleted?: boolean;
    deleted_at?: string | null;
  }
}

// Helper to create import metadata
const createImportMetadata = (csvRow: CSVRow) => {
  const metadata: any = {
    other_array: [],
  };

  if (csvRow.budgetEntries && csvRow.budgetEntries.length > 0) {
    metadata.budget = csvRow.budgetEntries.map((entry) => ({
      currency: entry.currency,
      price: entry.price,
    }));
  }

  return Object.keys(metadata).length > 1 ? metadata : null;
};

interface CSVRow {
  username: string;
  phone?: string;
  currency?: string;
  price?: string;
  budgetEntries?: Array<{ currency: string; price: number }>;
}

// Helper to get added_through value
const getAddedThrough = (member: CampaignListMember): string | undefined => {
  const directAddedThrough = (member as any).social_account?.added_through;
  if (directAddedThrough) {
    return directAddedThrough;
  }

  const additionalMetrics = member.social_account?.additional_metrics as any;
  const nestedAddedThrough = additionalMetrics?.added_through;
  if (nestedAddedThrough) {
    return nestedAddedThrough;
  }

  return undefined;
};

// Helper to get platform name from member
const getPlatformName = (member: CampaignListMember): string | undefined => {
  // Try direct platform access (with type assertion)
  const directPlatform = (member.social_account as any)?.platform?.name;
  if (directPlatform) {
    return directPlatform.toLowerCase();
  }

  // Fallback: Try work_platform from additional_metrics
  const additionalMetrics = member.social_account?.additional_metrics as any;
  const workPlatform = additionalMetrics?.work_platform?.name;
  if (workPlatform) {
    return workPlatform.toLowerCase();
  }

  return undefined;
};

// Profile interfaces
interface ProfileRequest {
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  include_detailed_info?: boolean;
  preferredProvider?: 'nanoinfluencer' | 'ensembledata';
}

interface ProfileResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  provider_used?: string;
}

// Unified profile fetching
async function fetchUnifiedProfile(
  request: ProfileRequest,
): Promise<ProfileResponse> {
  try {
    const response = await fetch('/api/v0/creator-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Platform name mapper
function mapPlatformName(
  platformName: string,
): 'instagram' | 'tiktok' | 'youtube' {
  const name = platformName.toLowerCase();
  if (name.includes('instagram')) return 'instagram';
  if (name.includes('tiktok')) return 'tiktok';
  if (name.includes('youtube')) return 'youtube';
  return 'instagram';
}

// Transform profile for campaign list
function transformProfileForCampaignList(
  profile: any,
  platform: Platform,
  additionalData?: {
    price?: number;
    contact?: string;
    phone?: string;
    import_metadata?: any;
  },
  addedThrough?: string,
): any {
  const baseData: any = {
    id: profile.id || profile.username,
    username: profile.username,
    name: profile.name || profile.full_name,
    profileImage: profile.profileImage || profile.profile_pic_url,
    followers: profile.followers || profile.followers_count,
    isVerified: profile.isVerified || profile.is_verified,
    url: profile.url || profile.account_url,
    age_group: profile.age_group || null,
    average_likes: profile.average_likes || 0,
    average_views: profile.average_views || 0,
    contact_details: profile.contact_details || [],
    content_count: profile.content_count || 0,
    creator_location: profile.creator_location || null,
    external_id: profile.external_id || null,
    gender: profile.gender || null,
    introduction: profile.introduction || profile.biography || null,
    language: profile.language || null,
    platform_account_type: profile.platform_account_type || 'personal',
    subscriber_count: profile.subscriber_count || 0,
    provider_source: profile.provider_source || 'managed',
    fetched_at: profile.fetched_at || new Date().toISOString(),
    following_count: profile.following_count || profile.following || 0,
    engagementRate: profile.engagementRate || profile.engagement_rate || 0,
    filter_match: {
      creator_gender: profile.gender || '',
      creator_language: profile.language || '',
      creator_locations: profile.creator_location?.country
        ? [profile.creator_location.country]
        : [],
    },
    work_platform: {
      id: platform.id,
      name: platform.name,
      logo_url: platform.logo_url || '',
    },
  };

  if (addedThrough) {
    baseData.added_through = addedThrough;
  }

  if (additionalData?.price !== undefined) {
    baseData.collaboration_price = additionalData.price;
    baseData.price = additionalData.price;

    if (!baseData.additional_metrics) {
      baseData.additional_metrics = {};
    }
    baseData.additional_metrics.collaboration_price = additionalData.price;
    baseData.additional_metrics.price = additionalData.price;
  }

  if (
    (additionalData?.phone && additionalData.phone.trim()) ||
    (additionalData?.contact && additionalData.contact.trim())
  ) {
    const phoneNumber = (additionalData.phone ||
      additionalData.contact)!.trim();

    const contactDetails = Array.isArray(baseData.contact_details)
      ? baseData.contact_details
      : [];
    const newPhoneContact = {
      type: 'phone',
      value: phoneNumber,
      contact_type: 'phone',
      is_primary: true,
      platform_specific: false,
      name: 'CSV Import Phone',
    };

    contactDetails.push(newPhoneContact);
    baseData.contact_details = contactDetails;

    if (!baseData.additional_metrics) {
      baseData.additional_metrics = {};
    }
    baseData.additional_metrics.mobile = phoneNumber;
    baseData.additional_metrics.phone = phoneNumber;
    baseData.additional_metrics.primary_contact_type = 'phone';
    baseData.additional_metrics.primary_contact_value = phoneNumber;
  }

  if (additionalData?.import_metadata) {
    baseData.import_metadata = additionalData.import_metadata;
  }

  return baseData;
}

// Filter types
type InfluencerFilterType = 'all' | 'active' | 'deleted';

interface ShortlistedInfluencersProps {
  campaignData?: Campaign | null;
  shortlistedMembers: CampaignListMembersResponse;
  isLoading: boolean;
  onInfluencerRemoved?: () => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  selectedPlatform?: Platform | null;
  onInfluencerAdded?: () => void;
  searchText?: string;
  onSearchChange?: (search: string) => void;
  onFilterChange?: (filter: InfluencerFilterType) => void;
}

const ShortlistedInfluencers: React.FC<ShortlistedInfluencersProps> = ({
  campaignData = null,
  shortlistedMembers,
  isLoading = false,
  onInfluencerRemoved,
  onPageChange,
  onPageSizeChange,
  selectedPlatform = null,
  onInfluencerAdded,
  searchText: parentSearchText,
  onSearchChange,
  onFilterChange,
}) => {
  const [localSearchText, setLocalSearchText] = useState('');
  const searchText = parentSearchText ?? localSearchText;

  // ✅ GET CAMPAIGNS FROM CONTEXT
  const { campaigns } = useCampaigns();

  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([]);
  const [addedThroughFilter, setAddedThroughFilter] =
    useState<AddedThroughFilterOption>('discovery');
  const [platformFilter, setPlatformFilter] =
    useState<PlatformFilterOption>('all'); // ← ADD HERE with other states
  const [removingInfluencers, setRemovingInfluencers] = useState<string[]>([]);
  const [isOutreachFormOpen, setIsOutreachFormOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(false);
  const [influencerFilter, setInfluencerFilter] =
    useState<InfluencerFilterType>('active');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(
    [],
  );
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isProcessingOutreach, setIsProcessingOutreach] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  // State for all influencers (used for accurate filter counts across all pages)
  const [allInfluencersForCounts, setAllInfluencersForCounts] = useState<
    CampaignListMember[]
  >([]);

  // ✅ COMPUTE AVAILABLE CAMPAIGNS FROM CONTEXT
  const availableCampaigns = useMemo(() => {
    if (!campaignData?.id) return [];

    // Filter out current campaign
    const filtered = campaigns.filter(
      (campaign) => campaign.id !== campaignData.id,
    );

    console.log('✅ COMPONENT: Available target campaigns:', filtered.length);

    return filtered;
  }, [campaigns, campaignData?.id]);

  // ✅ COPY-RELATED STATE
  const [selectedTargetCampaign, setSelectedTargetCampaign] =
    useState<Campaign | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const members = shortlistedMembers?.influencers || [];

  // Fetch ALL influencers for accurate filter counts (not paginated)
  useEffect(() => {
    const fetchAllInfluencersForCounts = async () => {
      if (!campaignData?.campaign_lists?.[0]?.id) return;

      const listId = campaignData.campaign_lists[0].id;

      try {
        const response = await getAllCampaignInfluencers(listId);
        if (response.success) {
          // Filter out deleted influencers for counts
          // Cast to any to handle type differences between CampaignInfluencerResponse and CampaignListMember
          const activeInfluencers = (response.influencers as any[]).filter(
            (inf) => !(inf as any).is_deleted && !(inf as any).deleted_at,
          ) as CampaignListMember[];
          setAllInfluencersForCounts(activeInfluencers);
          console.log(
            '📊 Fetched all influencers for filter counts:',
            activeInfluencers.length,
          );
        }
      } catch (error) {
        console.error('Error fetching all influencers for counts:', error);
      }
    };

    fetchAllInfluencersForCounts();
  }, [campaignData?.campaign_lists, onInfluencerAdded]);

  // Check if influencer is deleted
  const isDeleted = useCallback((member: CampaignListMember) => {
    return member.is_deleted === true || member.deleted_at !== null;
  }, []);

  // Calculate added-through filter counts using ALL influencers (not just current page)
  const filterCounts: AddedThroughFilterCounts = useMemo(() => {
    // Use allInfluencersForCounts if available, otherwise fall back to paginated members
    const influencersForCounting =
      allInfluencersForCounts.length > 0 ? allInfluencersForCounts : members;

    const counts = {
      all: influencersForCounting.length,
      import: 0,
      search: 0,
      discovery: 0,
    };

    influencersForCounting.forEach((member) => {
      const addedThrough = getAddedThrough(member);
      if (addedThrough && counts.hasOwnProperty(addedThrough)) {
        counts[addedThrough as keyof typeof counts]++;
      }
    });

    return counts;
  }, [allInfluencersForCounts, members]);

  // Calculate platform filter counts using ALL influencers (not just current page)
  const platformFilterCounts: PlatformFilterCounts = useMemo(() => {
    // Use allInfluencersForCounts if available, otherwise fall back to paginated members
    const influencersForCounting =
      allInfluencersForCounts.length > 0 ? allInfluencersForCounts : members;

    const counts: PlatformFilterCounts = {
      all: influencersForCounting.length,
      instagram: 0,
      tiktok: 0,
      youtube: 0,
    };

    influencersForCounting.forEach((member) => {
      const platformName = getPlatformName(member);
      if (platformName === 'instagram') counts.instagram++;
      else if (platformName === 'tiktok') counts.tiktok++;
      else if (platformName === 'youtube') counts.youtube++;
    });

    return counts;
  }, [allInfluencersForCounts, members]);

  // Backend handles deletion filtering, no client-side filtering needed
  const filteredMembers = useMemo(() => {
    let filtered = members;

    if (addedThroughFilter !== 'all') {
      filtered = filtered.filter(
        (member) => getAddedThrough(member) === addedThroughFilter,
      );
    }

    if (platformFilter !== 'all') {
      filtered = filtered.filter(
        (member) => getPlatformName(member) === platformFilter,
      );
    }

    return filtered;
  }, [members, addedThroughFilter, platformFilter]);

  // const [platformFilter, setPlatformFilter] = useState<PlatformFilterOption>('all');

  const filteredShortlistedMembers: CampaignListMembersResponse = useMemo(
    () => ({
      ...shortlistedMembers,
      influencers: filteredMembers,
    }),
    [shortlistedMembers, filteredMembers],
  );

  // ✅ COPY HANDLER
  const handleCopyConfirm = async () => {
    if (!selectedTargetCampaign) {
      console.warn('⚠️ COMPONENT: No target campaign selected');
      toast.error('Please select a target campaign');
      return;
    }

    if (selectedInfluencers.length === 0) {
      console.warn('⚠️ COMPONENT: No influencers selected');
      toast.error('Please select at least one influencer');
      return;
    }

    if (!campaignData?.campaign_lists?.[0]?.id) {
      console.error('❌ COMPONENT: Source campaign list not found');
      toast.error('Source campaign list not found');
      return;
    }

    const targetListId = selectedTargetCampaign.campaign_lists?.[0]?.id;
    if (!targetListId) {
      console.error('❌ COMPONENT: Target campaign list not found');
      toast.error('Target campaign list not found');
      return;
    }

    setIsCopying(true);

    try {
      const currentListId = campaignData.campaign_lists[0].id;

      const result = await copyInfluencersToCampaign(currentListId, {
        target_list_id: targetListId,
        influencer_ids: selectedInfluencers,
      });

      console.log('✅ COMPONENT: Copy successful, result:', result);

      setCopySuccess(true);

      toast.success(
        `Successfully copied ${result.copied_count}, Skipped ${result.skipped_count}`,
      );

      setTimeout(() => {
        console.log('🧹 COMPONENT: Cleaning up after copy success');
        setCopySuccess(false);
        setSelectedTargetCampaign(null);
        setShowCopyModal(false);
        setSelectedInfluencers([]);

        if (onInfluencerAdded) {
          onInfluencerAdded();
        }
      }, 1500);
    } catch (error) {
      console.error('❌ COMPONENT: Copy failed with error:', error);
      console.error('❌ COMPONENT: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      toast.error(
        `Failed to copy influencers: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
      setCopySuccess(false);
    } finally {
      console.log('🏁 COMPONENT: Copy operation finished');
      setIsCopying(false);
    }
  };

  // Get filter label with counts
  const getFilterLabel = () => {
    const totalCount =
      shortlistedMembers?.metadata?.total_count ??
      shortlistedMembers?.pagination?.total_items ??
      members.length;

    const deletedCount =
      shortlistedMembers?.metadata?.deleted_count ??
      members.filter((m) => isDeleted(m)).length;

    const activeCount =
      shortlistedMembers?.metadata?.active_count ?? totalCount - deletedCount;

    switch (influencerFilter) {
      case 'active':
        return `Active (${activeCount})`;
      case 'deleted':
        return `Deleted (${deletedCount})`;
      case 'all':
        return `All (${totalCount})`;
      default:
        return `Active (${activeCount})`;
    }
  };

  // Handle added-through filter change
  const handleAddedThroughFilterChange = (filter: AddedThroughFilterOption) => {
    setAddedThroughFilter(filter);
    setSelectedInfluencers([]);
  };

  // Handle platform filter change
  const handlePlatformFilterChange = (filter: PlatformFilterOption) => {
    setPlatformFilter(filter);
    setSelectedInfluencers([]); // Clear selection when filter changes
  };

  const handleClearSelection = () => {
    setSelectedInfluencers([]);
  };

  const toggleAnalytics = useCallback(() => {
    setIsAnalyticsVisible((prev) => !prev);
  }, []);

  const handleVisibleColumnsChange = useCallback((columns: string[]) => {
    setVisibleColumns(columns);
  }, []);

  const fetchInfluencerPosts = useCallback(
    async (influencer: any) => {
      try {
        if (!selectedPlatform) {
          return [];
        }

        const profileResponse = await fetchUnifiedProfile({
          username: influencer.username,
          platform: mapPlatformName(selectedPlatform.name),
          include_detailed_info: true,
        });

        if (!profileResponse.success || !profileResponse.data) {
          return [];
        }

        const profileData = profileResponse.data;

        if (profileData.detailed_info?.edge_owner_to_timeline_media?.edges) {
          const posts =
            profileData.detailed_info.edge_owner_to_timeline_media.edges;

          return posts.map((edge: any) => ({
            id: edge.node.id,
            imageUrl: edge.node.display_url,
            caption:
              edge.node.edge_media_to_caption?.edges[0]?.node?.text || '',
            likes: edge.node.edge_liked_by?.count || 0,
            comments: edge.node.edge_media_to_comment?.count || 0,
            views:
              edge.node.video_view_count || edge.node.video_play_count || 0,
            createdAt: new Date(
              edge.node.taken_at_timestamp * 1000,
            ).toISOString(),
            type: edge.node.is_video ? ('video' as const) : ('image' as const),
          }));
        }

        return [];
      } catch (error) {
        console.error('Error fetching influencer posts:', error);
        return [];
      }
    },
    [selectedPlatform],
  );

  const handleRefreshData = useCallback(() => {
    if (onInfluencerAdded) {
      onInfluencerAdded();
    }
  }, [onInfluencerAdded]);

  const handleShareUrl = async () => {
    if (isCreatingSession || !campaignData) {
      return;
    }

    setIsCreatingSession(true);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

      const columnsToShare =
        Array.isArray(visibleColumns) && visibleColumns.length > 0
          ? visibleColumns
          : [
              'name',
              'followers',
              'engagement_rate',
              'avg_likes',
              'location',
              'price',
              'shortlisted_status',
            ];

      console.log('📋 Visible columns being shared:', columnsToShare);

      const sessionMetadata: any = {
        client_name: userInfo.full_name || 'Client User',
        client_company: userInfo.company_name || 'Client Company',
        client_email: userInfo.email || 'client@example.com',
        client_role: userInfo.role || 'Client',
        visible_columns: columnsToShare,
        page_name: 'shortlisted',
      };

      if (selectedInfluencers.length > 0) {
        const selectedMemberIds = filteredMembers
          .filter((member) => selectedInfluencers.includes(member.id ?? ''))
          .map((member) => member.id)
          .filter((id): id is string => id !== undefined && id !== null);

        if (selectedMemberIds.length > 0) {
          sessionMetadata.selected_influencer_ids = selectedMemberIds;
          console.log(
            '📋 Selected influencers for sharing:',
            selectedMemberIds,
          );
        }
      }

      if (!campaignData.campaign_lists || !campaignData.campaign_lists[0]?.id) {
        toast.error('Campaign List ID is required to create a shareable link');
        return;
      }

      const sessionData = {
        session_type: 'campaign_influencers',
        resource_type: 'campaign_list',
        resource_id: campaignData.campaign_lists[0].id,
        expires_in_hours: 240,
        page_name: 'shortlisted',
        permissions: {
          read: true,
          'comment:create': true,
          'comment:read': true,
          'comment:reply': true,
          'price_negotiation:create': true,
          'price_negotiation:read': true,
          'price_negotiation:approve': true,
          'price_negotiation:reject': true,
          'campaign_influencer:client_review': true,
          'campaign_influencer:shortlisted_status': true,
        },
        session_metadata: sessionMetadata,
      };

      const sessionResponse = await createPublicSession(sessionData);

      if (sessionResponse && sessionResponse.public_url) {
        const originalUrl = new URL(sessionResponse.public_url);
        const token = originalUrl.searchParams.get('token');

        if (!token) {
          throw new Error('No token in public URL');
        }

        const baseUrl = window.location.origin;
        const customPublicUrl = `${baseUrl}/shortlisted?token=${token}`;

        await navigator.clipboard.writeText(customPublicUrl);
        setUrlCopied(true);

        const selectedCount = selectedInfluencers.length;
        const columnCount = columnsToShare.length;

        toast.success(
          selectedCount > 0
            ? `Shareable URL copied! (${selectedCount} influencer${selectedCount !== 1 ? 's' : ''}, ${columnCount} columns)`
            : `Shareable URL copied! (All influencers, ${columnCount} columns)`,
        );

        setTimeout(() => setUrlCopied(false), 3000);
      } else {
        throw new Error('No public URL received from server');
      }
    } catch (error) {
      console.error('Error creating shareable URL:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create shareable URL';
      toast.error(errorMessage);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const storePhoneContactForSocialAccount = async (
    socialAccountId: string,
    phoneNumber: string,
  ) => {
    try {
      const existingContacts = await getInfluencerContacts(socialAccountId);
      const existingPhoneContact = existingContacts.find(
        (contact) => contact.contact_type === 'phone',
      );

      if (existingPhoneContact) {
        await updateInfluencerContact(existingPhoneContact.id, {
          contact_value: phoneNumber,
          name: 'CSV Import Phone',
        });
        return;
      }

      const response = await createInfluencerContact({
        social_account_id: socialAccountId,
        contact_type: 'phone',
        contact_value: phoneNumber,
        name: 'CSV Import Phone',
        is_primary: true,
        platform_specific: false,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create phone contact');
      }
    } catch (error) {
      console.warn('Phone contact storage failed but import will continue');
    }
  };

  const handleImportInfluencer = async (csvRow: CSVRow): Promise<boolean> => {
    try {
      if (
        !campaignData ||
        !campaignData.campaign_lists ||
        !campaignData.campaign_lists.length
      ) {
        return false;
      }

      if (!selectedPlatform || !selectedPlatform.id) {
        return false;
      }

      const existingInfluencer = members.find(
        (member) =>
          member.social_account?.account_handle?.toLowerCase() ===
          csvRow.username.toLowerCase(),
      );

      if (existingInfluencer) {
        return false;
      }

      const profileResponse = await fetchUnifiedProfile({
        username: csvRow.username,
        platform: mapPlatformName(selectedPlatform.name),
        include_detailed_info: true,
      });

      if (!profileResponse.success || !profileResponse.data) {
        return false;
      }

      const additionalData: {
        price?: number;
        contact?: string;
        phone?: string;
        import_metadata?: any;
      } = {};

      if (csvRow.phone && csvRow.phone.trim()) {
        additionalData.contact = csvRow.phone.trim();
        additionalData.phone = csvRow.phone.trim();
      }

      const importMetadata = createImportMetadata(csvRow);
      if (importMetadata) {
        additionalData.import_metadata = importMetadata;
      }

      const transformedData = transformProfileForCampaignList(
        profileResponse.data,
        selectedPlatform,
        additionalData,
        'import',
      );

      const listId = campaignData.campaign_lists[0].id;
      const platformId = selectedPlatform.work_platform_id;

      const addResponse = await addInfluencerToList(
        listId,
        transformedData,
        platformId,
        'import', // Also add the addedThrough parameter
        selectedPlatform.name, // Also add the platform name
      );

      if (addResponse?.success) {
        if (csvRow.phone && (addResponse as any).social_account?.id) {
          try {
            await storePhoneContactForSocialAccount(
              (addResponse as any).social_account.id,
              csvRow.phone.trim(),
            );
          } catch (contactError) {
            console.warn('Failed to store phone contact:', contactError);
          }
        }

        if (onInfluencerAdded) {
          onInfluencerAdded();
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error importing influencer:', csvRow.username, error);
      return false;
    }
  };

  const hasMessageTemplateForCampaign = (): boolean => {
    if (!campaignData?.id) {
      return false;
    }

    const fetchedTemplateExists = messageTemplates.some(
      (template) => template.campaign_id === campaignData.id,
    );
    const campaignTemplateExists =
      campaignData.message_templates &&
      campaignData.message_templates.length > 0;

    return fetchedTemplateExists || campaignTemplateExists;
  };

  const hasListAssignmentsForCampaign = (): boolean => {
    if (!campaignData?.list_assignments) {
      return false;
    }

    return campaignData.list_assignments.length > 0;
  };

  const getUnassignedInfluencersCount = (): number => {
    return members.filter((member) => member.is_assigned_to_agent === false)
      .length;
  };

  // ✅ NEW: Get selected unassigned influencers count
  const getSelectedUnassignedInfluencersCount = (): number => {
    if (selectedInfluencers.length === 0) return 0;

    return selectedInfluencers.filter((id) => {
      const member = members.find((m) => m.id === id);
      return member && member.is_assigned_to_agent === false;
    }).length;
  };

  // ✅ NEW: Get selected unassigned influencer IDs
  const getSelectedUnassignedInfluencerIds = (): string[] => {
    if (selectedInfluencers.length === 0) return [];

    return selectedInfluencers.filter((id) => {
      const member = members.find((m) => m.id === id);
      return member && member.is_assigned_to_agent === false;
    });
  };

  const getOutreachButtonConfig = () => {
    const hasTemplate = hasMessageTemplateForCampaign();
    const hasAssignments = hasListAssignmentsForCampaign();
    const unassignedCount = getUnassignedInfluencersCount();

    if (!hasTemplate) {
      return {
        label: 'Start Outreach',
        action: 'open-form',
        variant: 'primary',
        disabled: isProcessingOutreach,
        showTemplateButton: false,
      };
    } else if (hasAssignments) {
      const assignments = campaignData?.list_assignments || [];

      const statusGroups = {
        active: assignments.filter((a) =>
          ['pending', 'active', 'in_progress'].includes(
            a.status?.name?.toLowerCase(),
          ),
        ),
      };

      if (unassignedCount > 0) {
        // ✅ NEW: Show selected count if influencers are selected
        const selectedUnassignedCount = getSelectedUnassignedInfluencersCount();
        const displayCount =
          selectedUnassignedCount > 0
            ? selectedUnassignedCount
            : unassignedCount;
        const labelSuffix = selectedUnassignedCount > 0 ? ' Selected' : '';

        return {
          label: `Assign (${displayCount}${labelSuffix})`,
          action: 'assign-new',
          variant: 'primary',
          disabled: isProcessingOutreach,
          showTemplateButton: true,
          statusText:
            selectedUnassignedCount > 0
              ? `${selectedUnassignedCount} selected unassigned influencer${selectedUnassignedCount !== 1 ? 's' : ''}`
              : `${unassignedCount} unassigned influencer${unassignedCount !== 1 ? 's' : ''}`,
        };
      }

      if (statusGroups.active.length > 0) {
        return {
          label: 'Outreach Active',
          action: 'view-status',
          variant: 'success',
          disabled: true,
          showTemplateButton: true,
        };
      }
    } else {
      return {
        label: 'Start Outreach',
        action: 'start-with-existing',
        variant: 'primary',
        disabled: isProcessingOutreach,
        showTemplateButton: true,
      };
    }

    return {
      label: 'Start Outreach',
      action: 'open-form',
      variant: 'primary',
      disabled: isProcessingOutreach,
      showTemplateButton: true,
    };
  };

  const saveMessageTemplate = async (data: {
    subject: string;
    message: string;
  }) => {
    if (!campaignData?.company_id || !campaignData?.id) {
      throw new Error('Missing required campaign data');
    }

    const requestData: CreateMessageTemplateWithFollowupsRequest = {
      subject: data.subject,
      content: data.message,
      company_id: campaignData.company_id,
      campaign_id: campaignData.id,
      template_type: 'initial',
      is_global: true,
      generate_followups: true,
    };

    const createdTemplate =
      await createMessageTemplateWithFollowups(requestData);
    await fetchMessageTemplates();

    const updatedTemplate =
      messageTemplates.find((t) => t.id === createdTemplate.id) ||
      createdTemplate;

    return updatedTemplate;
  };

  const executeBulkAssignmentsForCampaign = async (
    specificInfluencerIds?: string[],
  ) => {
    if (!campaignData?.id) {
      throw new Error('Campaign ID not available');
    }

    const bulkAssignmentData: BulkAssignmentRequest = {
      campaign_list_id: campaignData.campaign_lists[0].id,
      strategy: 'round_robin',
      preferred_agent_ids: null,
      max_influencers_per_agent: 40,
      force_new_assignments: false,
      // ✅ NEW: If specific IDs provided, use them; otherwise null (backend assigns all unassigned)
      influencer_ids:
        specificInfluencerIds && specificInfluencerIds.length > 0
          ? specificInfluencerIds
          : null,
    };

    const result = await executeBulkAssignments(bulkAssignmentData);
    return result;
  };

  const handleAssignNewInfluencers = async () => {
    try {
      setIsProcessingOutreach(true);

      // ✅ NEW: Get selected unassigned influencer IDs (if any selected)
      const selectedUnassignedIds = getSelectedUnassignedInfluencerIds();

      // Pass selected unassigned IDs (if any), otherwise backend assigns all unassigned
      const result = await executeBulkAssignmentsForCampaign(
        selectedUnassignedIds.length > 0 ? selectedUnassignedIds : undefined,
      );

      // ✅ NEW: Calculate assigned count from response or selection
      const assignedCount =
        result.assignment_summary?.successful_assignments ||
        result.total_influencers ||
        selectedUnassignedIds.length ||
        getUnassignedInfluencersCount();

      toast.success(
        `Successfully assigned ${assignedCount} influencer${assignedCount !== 1 ? 's' : ''} to agents`,
      );

      // ✅ NEW: Clear selection after successful assignment
      if (selectedInfluencers.length > 0) {
        setSelectedInfluencers([]);
      }

      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
    } catch (error) {
      console.error('Error assigning new influencers:', error);
      toast.error('Failed to assign influencers to outreach agents');
    }
  };

  const handleStartOutreach = async () => {
    const buttonConfig = getOutreachButtonConfig();

    try {
      switch (buttonConfig.action) {
        case 'open-form':
          setIsOutreachFormOpen(true);
          break;

        case 'start-with-existing':
          setIsProcessingOutreach(true);
          await handleStartWithExistingTemplate();
          break;

        case 'view-status':
          handleViewOutreachStatus();
          break;

        case 'assign-new':
          await handleAssignNewInfluencers();
          break;

        default:
          console.warn('Unknown button action:', buttonConfig.action);
      }
    } catch (error) {
      console.error('Error processing outreach action:', error);
    } finally {
      if (['start-with-existing', 'assign-new'].includes(buttonConfig.action)) {
        setIsProcessingOutreach(false);
      }
    }
  };

  const handleViewOutreachStatus = () => {
    if (
      !campaignData?.list_assignments ||
      campaignData.list_assignments.length === 0
    ) {
      toast.error('No outreach assignments found');
      return;
    }

    const statusCounts = campaignData.list_assignments.reduce(
      (acc, assignment) => {
        const status = assignment.status?.name?.toLowerCase() || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const activeCount = statusCounts.active || 0;
    const pendingCount = statusCounts.pending || 0;
    const inProgressCount = statusCounts.in_progress || 0;

    const activeTotal = activeCount + pendingCount + inProgressCount;

    if (activeTotal > 0) {
      toast.success(
        `Outreach is active for ${activeTotal} influencer${activeTotal !== 1 ? 's' : ''}`,
      );
    } else {
      toast.error('No active outreach campaigns found');
    }
  };

  const handleOpenTemplateManager = () => {
    setIsOutreachFormOpen(true);
  };

  const handleFormSubmit = async (templateData: {
    subject: string;
    message: string;
  }) => {
    try {
      setIsSavingTemplate(true);
      setIsProcessingOutreach(true);

      const savedTemplate = await saveMessageTemplate(templateData);
      const result = await executeBulkAssignmentsForCampaign();

      toast.success('Outreach campaign started successfully!');
      setIsOutreachFormOpen(false);

      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
    } catch (error) {
      console.error('Error in form submission:', error);

      if (error instanceof Error) {
        if (
          error.message.includes('AI Generation Failed') ||
          error.message.includes('AI service error')
        ) {
          toast.error('Campaign started but AI follow-ups failed to generate');
        } else if (error.message.includes('Missing required')) {
          toast.error('Setup error: Please check campaign configuration');
        } else if (error.message.includes('bulk assignments')) {
          toast.error('Template created but assignment failed');
        } else {
          toast.error('Failed to start outreach campaign');
        }
      } else {
        toast.error('Failed to start outreach campaign');
      }
    } finally {
      setIsSavingTemplate(false);
      setIsProcessingOutreach(false);
    }
  };

  const handleStartWithExistingTemplate = async () => {
    try {
      const result = await executeBulkAssignmentsForCampaign();

      toast.success(
        `Outreach started successfully! ${result.total_influencers} influencers assigned to ${result.total_agents} agents`,
      );

      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
    } catch (error) {
      console.error('Error starting outreach with existing template:', error);
      toast.error('Failed to start outreach with existing template');
      throw error;
    }
  };

  const fetchMessageTemplates = async () => {
    if (!campaignData?.id) {
      return;
    }

    setIsLoadingTemplates(true);
    try {
      const templates = await getMessageTemplatesByCampaignWithFollowups(
        campaignData.id,
      );

      setMessageTemplates(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setMessageTemplates([]);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    if (campaignData?.id) {
      fetchMessageTemplates();
    }
  }, [campaignData?.id]);

  useEffect(() => {
    setAddedThroughFilter('discovery');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showFilterDropdown && !target.closest('.filter-dropdown-container')) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  const handleBulkRemove = async () => {
    if (selectedInfluencers.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${selectedInfluencers.length} selected influencer${selectedInfluencers.length !== 1 ? 's' : ''}? This action cannot be undone.`,
    );

    if (!confirmed) return;

    const selectedMembers = filteredMembers.filter((member) =>
      selectedInfluencers.includes(member.id ?? ''),
    );

    if (selectedMembers.length === 0) {
      return;
    }

    setRemovingInfluencers((prev) => [...prev, ...selectedInfluencers]);

    try {
      const promises = selectedMembers.map((member) => {
        if (!member.id) {
          return Promise.reject(
            new Error(
              `Invalid data for member: ${member.social_account?.full_name}`,
            ),
          );
        }
        return removeInfluencerFromList(member.id);
      });

      const results = await Promise.allSettled(promises);

      const failures = results.filter(
        (result) =>
          result.status === 'rejected' ||
          (result.status === 'fulfilled' && !result.value.success),
      );

      if (failures.length === 0) {
        setSelectedInfluencers([]);

        toast.success(
          `Successfully removed ${selectedInfluencers.length} influencer${selectedInfluencers.length !== 1 ? 's' : ''}`,
        );

        if (onInfluencerRemoved) {
          onInfluencerRemoved();
        }
      } else {
        const successCount = selectedInfluencers.length - failures.length;

        if (successCount > 0) {
          toast.success(
            `Successfully removed ${successCount} influencer${successCount !== 1 ? 's' : ''}`,
          );
        }

        if (failures.length > 0) {
          toast.error(
            `Failed to remove ${failures.length} influencer${failures.length !== 1 ? 's' : ''}`,
          );
        }

        if (onInfluencerRemoved && successCount > 0) {
          onInfluencerRemoved();
        }
      }
    } catch (error) {
      console.error('Error in bulk remove:', error);
      toast.error('An error occurred while removing influencers');
    } finally {
      setRemovingInfluencers([]);
    }
  };

  const buttonConfig = getOutreachButtonConfig();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-0 filter-dropdown-container">
          <div className="flex items-center gap-2">
            {/* Deletion Status Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-l-full bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                title="Filter influencers"
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  {getFilterLabel()}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setInfluencerFilter('active');
                        setShowFilterDropdown(false);
                        if (onFilterChange) {
                          onFilterChange('active');
                        }
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        influencerFilter === 'active'
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Active Only</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {shortlistedMembers?.metadata?.active_count ||
                          members.filter((m) => !isDeleted(m)).length}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setInfluencerFilter('deleted');
                        setShowFilterDropdown(false);
                        if (onFilterChange) {
                          onFilterChange('deleted');
                        }
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        influencerFilter === 'deleted'
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span>Deleted Only</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {shortlistedMembers?.metadata?.deleted_count ||
                          members.filter((m) => isDeleted(m)).length}
                      </span>
                    </button>

                    <div className="border-t border-gray-200 my-1"></div>

                    <button
                      onClick={() => {
                        setInfluencerFilter('all');
                        setShowFilterDropdown(false);
                        if (onFilterChange) {
                          onFilterChange('all');
                        }
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                        influencerFilter === 'all'
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
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
                            d="M4 6h16M4 12h16M4 18h16"
                          />
                        </svg>
                        <span>All Influencers</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {shortlistedMembers?.metadata?.total_count ||
                          shortlistedMembers?.pagination?.total_items ||
                          members.length}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search Influencer"
                value={searchText}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setLocalSearchText(newValue);
                  if (onSearchChange) {
                    onSearchChange(newValue);
                  }
                }}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-r-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Button Group */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedInfluencers.length > 0 && (
            <>
              <button
                onClick={handleBulkRemove}
                disabled={removingInfluencers.length > 0}
                className="flex items-center px-3 py-2 bg-gray-50 border border-red-200 rounded-md text-sm font-medium hover:bg-gray-60 text-gray-700 hover:border-red-500 hover:shadow-md hover:shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title={`Remove ${selectedInfluencers.length} selected influencer${selectedInfluencers.length !== 1 ? 's' : ''}`}
              >
                {removingInfluencers.length > 0 ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-1" />
                    <span className="hidden sm:inline">Removing...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span className="hidden sm:inline">Remove</span>
                    <span className="sm:hidden">
                      ({selectedInfluencers.length})
                    </span>
                    <span className="hidden sm:inline ml-1">
                      ({selectedInfluencers.length})
                    </span>
                  </div>
                )}
              </button>

              {/* COPY BUTTON */}
              <button
                onClick={() => {
                  if (selectedInfluencers.length === 0) {
                    toast.error(
                      'Please select at least one influencer to copy',
                    );
                    return;
                  }
                  setShowCopyModal(true);
                }}
                disabled={selectedInfluencers.length === 0}
                className="flex items-center px-3 py-2 bg-gray-50 border border-purple-200 rounded-md text-sm font-medium hover:bg-gray-60 text-gray-700 hover:border-purple-500 hover:shadow-md hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                title={`Copy ${selectedInfluencers.length} selected influencer${selectedInfluencers.length !== 1 ? 's' : ''} to another campaign`}
              >
                <Copy className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Copy</span>
                <span className="ml-1">({selectedInfluencers.length})</span>
              </button>
            </>
          )}

{/* ============ ICON-ONLY ACTION TOOLBAR ============ */}
          <div className="relative z-50 flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
            {/* Import Button */}
            <div className="relative group">
              <ImportCsvButton
                onImportInfluencer={handleImportInfluencer}
                onImportComplete={(successCount: number) => {
                  if (onInfluencerAdded) {
                    onInfluencerAdded();
                  }
                  toast.success(
                    `Successfully imported ${successCount} influencer(s)${successCount > 0 ? ' with contact details' : ''}`,
                  );
                }}
                disabled={!selectedPlatform}
                iconOnly={true}
              />
            </div>

            {/* Export Button */}
            <div className="relative group">
              <ExportButton
                members={filteredMembers}
                campaignName={campaignData?.name}
                selectedMembers={
                  selectedInfluencers.length > 0
                    ? filteredMembers.filter((member) =>
                        selectedInfluencers.includes(member.id ?? ''),
                      )
                    : undefined
                }
                visibleColumns={visibleColumns}
                iconOnly={true}
              />
            </div>

            {/* Add User Button */}
            <div className="relative group">
              <AddUserButton
                campaignData={campaignData}
                selectedPlatform={selectedPlatform}
                onInfluencerAdded={onInfluencerAdded}
                iconOnly={true}
              />
            </div>

            {/* Share Button */}
            <div className="relative group">
              <button
                onClick={handleShareUrl}
                disabled={isCreatingSession}
                className={`p-2.5 rounded-xl border transition-all duration-200 ${
                  urlCopied
                    ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                    : isCreatingSession
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10'
                }`}
                title={
                  selectedInfluencers.length > 0
                    ? `Share ${selectedInfluencers.length} selected`
                    : 'Share All'
                }
              >
                {isCreatingSession ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
                ) : urlCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>
              {/* Tooltip */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg whitespace-nowrap shadow-lg">
                  {urlCopied ? 'Copied!' : 'Share'}
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            </div>

            {/* Templates Button */}
            {buttonConfig.showTemplateButton && (
              <div className="relative group">
                <button
                  onClick={handleOpenTemplateManager}
                  disabled={isSavingTemplate}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${
                    isSavingTemplate
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10'
                  }`}
                  title="Templates"
                >
                  {isSavingTemplate ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </button>
                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg whitespace-nowrap shadow-lg">
                    Templates
                  </div>
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              </div>
            )}
          </div>

          <AddedThroughFilter
            currentFilter={addedThroughFilter}
            onFilterChange={handleAddedThroughFilterChange}
            filterCounts={filterCounts}
          />

          {/* Platform Filter */}
          <PlatformFilter
            currentFilter={platformFilter}
            onFilterChange={handlePlatformFilterChange}
            filterCounts={platformFilterCounts}
          />

          <button
            onClick={() => handleStartOutreach()}
            disabled={buttonConfig.disabled}
            className={`px-5 py-2 text-sm rounded-full transition-all duration-200 border flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
              buttonConfig.variant === 'success'
                ? 'font-bold bg-[#DDE9DE] text-[#4A7A4F] border-[#94BF99]'
                : 'font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm transform hover:scale-[1.01]'
            }`}
          >
            {isProcessingOutreach ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-[#4A7A4F] border-t-transparent rounded-full mr-2" />
                <span className="hidden sm:inline">Processing...</span>
              </div>
            ) : (
              <span className="whitespace-nowrap">{buttonConfig.label}</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex space-x-6" style={{ minHeight: '750px' }}>
        <div
          className={`${isAnalyticsVisible ? 'w-8/12' : 'w-full'} transition-all duration-300`}
        >
          <ShortlistedSummaryV2
            selectedInfluencers={selectedInfluencers}
            influencers={filteredMembers}
            onClearSelection={handleClearSelection}
          />

          <ShortlistedTable
            shortlistedMembers={filteredShortlistedMembers}
            isLoading={isLoading}
            searchText={searchText}
            platformFilter={platformFilter} // ← ADD THIS
            selectedInfluencers={selectedInfluencers}
            removingInfluencers={removingInfluencers}
            onInfluencerRemoved={onInfluencerRemoved}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            onSelectionChange={setSelectedInfluencers}
            onRemovingChange={setRemovingInfluencers}
            onVisibleColumnsChange={handleVisibleColumnsChange}
            onDataRefresh={handleRefreshData}
            selectedPlatform={selectedPlatform}
            onFetchInfluencerPosts={fetchInfluencerPosts}
          />
        </div>

        {isAnalyticsVisible && (
          <ShortlistedAnalytics shortlistedInfluencers={filteredMembers} />
        )}
      </div>

      <OutreachMessageForm
        isOpen={isOutreachFormOpen}
        onClose={() => {
          setIsOutreachFormOpen(false);
        }}
        onSubmit={handleFormSubmit}
        messageTemplates={messageTemplates}
        isLoadingTemplates={isLoadingTemplates}
        isSavingTemplate={isSavingTemplate}
      />

      {/* COPY MODAL */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Copy Influencers to Campaign
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Select a campaign to copy {selectedInfluencers.length} influencers
              to:
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Campaign
              </label>
              <div className="relative">
                <select
                  value={selectedTargetCampaign?.id || ''}
                  onChange={(e) => {
                    const campaign = availableCampaigns.find(
                      (c) => c.id === e.target.value,
                    );
                    setSelectedTargetCampaign(campaign || null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  disabled={isCopying}
                >
                  <option value="">-- Select Campaign --</option>
                  {availableCampaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {availableCampaigns.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No other campaigns available
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCopyModal(false);
                  setSelectedTargetCampaign(null);
                }}
                disabled={isCopying}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleCopyConfirm}
                disabled={!selectedTargetCampaign || isCopying || copySuccess}
                className={`px-4 py-2 rounded-md text-white transition-all duration-200 flex items-center space-x-2 ${
                  copySuccess
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isCopying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Copying...</span>
                  </>
                ) : copySuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortlistedInfluencers;
