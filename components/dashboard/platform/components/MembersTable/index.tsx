// src/components/dashboard/platform/components/MembersTable/index.tsx

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Search,
  Users,
  XCircle,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  DollarSign,
  Check,
  Mail,
  MessageCircle,
  Send,
  Info,
} from 'react-feather';
import { useRouter } from 'next/navigation';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { MessageTemplate } from '@/types/assignments';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusDropdown, { ContactStatusBadge } from './StatusDropdown';
import EditableAttempts from './EditableAttempts';
import ContactTimeline from './ContactTimeline';
import CopyMessageButton from './CopyMessageButton';
import CommentThreadPopup from '@/components/dashboard/campaign-funnel/outreach/selected-manually/CommentThreadPopup';
import PricePopup from './PricePopup';
import ContactPopup from './ContactPopup';
import SortableHeader from './SortableHeader';
import ActionsDropdown from './ActionsDropdown';
import Pagination from './Pagination';
import ContactDisplayWidget from './ContactDisplayWidget';
import { MembersTableProps, SortConfig } from './types';
import { formatNumber } from './constants';
import { getReassignmentReasonsForAgents } from '@/services/reassignment-reasons';
import { ReassignmentReason } from '@/types/reassignment-reasons';
import { getInfluencerContacts } from '@/services/influencer-contacts/influencer-contacts.service';
import { CommentsClientService } from '@/services/comments';
import { Comment as CommentType } from '@/types/comment';
// Add this import for platform icons
import { BsInstagram, BsTiktok, BsYoutube } from 'react-icons/bs';

// ✅ API service for price approval
import { approvePrice } from '@/services/campaign-influencers/campaign-influencers.client';
import { PriceApprovalRequest } from '@/types/campaign-influencers';

import { useAuth } from '@/context/AuthContext';
// Add these imports for Tags, X-Campaigns columns (reuse from shortlisted)
import TagsColumn from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/TagsColumn';
import XCampaignsColumn from '@/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/XCampaignsColumn';
import { PastCampaign } from '@/types/campaign-influencers';
import ColumnVisibility, {
  ColumnDefinition,
} from '@/components/ui/table/ColumnVisibility';
// import { useMemo } from 'react';

export default function MembersTable({
  members: initialMembers,
  loading,
  error,
  pagination,
  onPageChange,
  onPageSizeChange,
  onEditCampaignStatus,
  onViewMember,
  onAddContact,
  onViewContacts,
  availableStatuses,
  onTypeChange,
  currentType,
  assignment,
  onMemberUpdate: parentOnMemberUpdate,
  showCampaignColumn = false,
  assignmentMap = {},
  agentId,
  // NEW PROPS
  hideContactTimeline = false,
  hideMessageColumn = false,
  showAgentColumn = false,
  disableContactInfoClick = false,
  agentMap = {},
  hideActionsColumn = false,
  showAttemptsOnly = false,
  hideSearchField = false, // ✅ ADD THIS NEW PROP
  // NEW PROPS for Tags, X-Campaigns, CPV columns
  showTagsColumn = false,
  showXCampaignsColumn = false,
  showCPVColumn = false,
  showCampaignNameColumn = false, // ← ADD THIS
  showAssignedAtColumn = false,
  showClientStatusColumn = false, // ← ADD THIS NEW PROP
}: MembersTableProps) {
  const { getPrimaryRole } = useAuth();
  const primaryRole = getPrimaryRole();
  const router = useRouter();

  const [searchText, setSearchText] = useState('');

  // Local members state to handle UI updates
  const [members, setMembers] =
    useState<AssignmentInfluencer[]>(initialMembers);

  // Comment thread state
  const [commentThreadOpen, setCommentThreadOpen] = useState(false);
  const [selectedMemberForComment, setSelectedMemberForComment] =
    useState<AssignmentInfluencer | null>(null);
  const [commentPosition, setCommentPosition] = useState({ x: 0, y: 0 });

  // Comments state for tracking comment counts
  const [memberComments, setMemberComments] = useState<
    Record<string, CommentType[]>
  >({});

  // Price modal state
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedMemberForPrice, setSelectedMemberForPrice] =
    useState<AssignmentInfluencer | null>(null);
  const [pricePosition, setPricePosition] = useState({ x: 0, y: 0 });

  // Contacts modal state
  const [contactsModalOpen, setContactsModalOpen] = useState(false);
  const [selectedMemberForContacts, setSelectedMemberForContacts] =
    useState<AssignmentInfluencer | null>(null);
  const [contactsPosition, setContactsPosition] = useState({ x: 0, y: 0 });

  // Campaign/Brand tooltip state with trigger element ref
  const [campaignTooltipOpen, setCampaignTooltipOpen] = useState(false);
  const [campaignTooltipContent, setCampaignTooltipContent] = useState({
    campaign: '',
    brand: '',
  });
  const [campaignTooltipPosition, setCampaignTooltipPosition] = useState({
    x: 0,
    y: 0,
  });
  const campaignTooltipTriggerRef = useRef<HTMLElement | null>(null);
  const campaignTooltipRef = useRef<HTMLDivElement | null>(null);

  // Contact refresh trigger for the enhanced component
  const [contactRefreshTrigger, setContactRefreshTrigger] = useState(0);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const messageTemplates: MessageTemplate[] =
    assignment?.campaign?.message_templates || [];
  const isCompletedTab = currentType === 'completed';

  const [reassignmentReasons, setReassignmentReasons] = useState<
    ReassignmentReason[]
  >([]);
  const [loadingReasons, setLoadingReasons] = useState<boolean>(false);
  const [reasonsError, setReasonsError] = useState<string | null>(null);

  // ✅ Loading state for price approval (track by member ID)
  const [approvingMemberId, setApprovingMemberId] = useState<string | null>(
    null,
  );

  // Column visibility state
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());

  const isManagerView = primaryRole === 'platform_outreach_manager';
  const isAgentView = !agentId;

  // Define all columns for visibility toggle
  const allColumns: ColumnDefinition<AssignmentInfluencer>[] = useMemo(() => {
    const columns: ColumnDefinition<AssignmentInfluencer>[] = [
      {
        key: 'tags',
        label: 'Tags',
        width: 'w-32',
        defaultVisible: false, // Hidden by default
        getValue: (item) => (item.campaign_influencer as any).tags?.length || 0,
      },
      {
        key: 'x_campaigns',
        label: 'X-Campaigns',
        width: 'w-28',
        defaultVisible: false, // Hidden by default
        getValue: (item) =>
          (item.campaign_influencer as any).past_campaigns?.length || 0,
      },
      {
        key: 'status',
        label: 'Agent Status',
        width: 'min-w-[120px]',
        defaultVisible: true,
        getValue: (item) => item.campaign_influencer.status?.name || '',
      },
      {
        key: 'attempts',
        label: showAttemptsOnly ? 'Attempts' : 'Contact Info',
        width: 'min-w-[100px]',
        defaultVisible: true, // Hidden by default
        getValue: (item) => item.attempts_made || 0,
      },
      {
        key: 'contactTimeline',
        label: 'Contact Timeline',
        width: 'w-28',
        defaultVisible: true,
        getValue: (item) => item.last_contacted_at || '',
      },
      {
        key: 'message',
        label: 'Message',
        width: 'min-w-[100px]',
        defaultVisible: true,
        getValue: () => '',
      },
      {
        key: 'price',
        label: 'Price',
        width: 'w-20',
        defaultVisible: true,
        getValue: (item) => item.campaign_influencer.collaboration_price || 0,
      },
      {
        key: 'priceType',
        label: 'Fee',
        width: 'w-24',
        defaultVisible: true,
        getValue: (item) => item.campaign_influencer.price_type || '',
      },
      {
        key: 'priceApproval',
        label: 'Approval',
        width: 'w-28',
        defaultVisible: true,
        getValue: (item) =>
          item.campaign_influencer.price_approved ? 'Approved' : 'Pending',
      },
      {
        key: 'totalPrice',
        label: 'Total Price',
        width: 'w-28',
        defaultVisible: true,
        getValue: (item) => Number(item.campaign_influencer.total_price) || 0,
      },
      {
        key: 'cpv',
        label: 'CPV',
        width: 'w-24',
        defaultVisible: true,
        getValue: (item) => {
          const totalPrice = Number(item.campaign_influencer.total_price) || 0;
          const avgViews =
            Number((item.campaign_influencer as any).average_views) || 0;
          if (totalPrice <= 0 || avgViews <= 0) return 0;
          return totalPrice / avgViews;
        },
      },
      {
        key: 'contacts',
        label: 'Contacts',
        width: 'w-24',
        defaultVisible: true,
        getValue: (item) =>
          item.campaign_influencer.social_account?.contacts?.length || 0,
      },
      {
        key: 'campaignBrand',
        label: 'Campaign / Brand',
        width: 'min-w-[150px]',
        defaultVisible: true,
        getValue: (item) =>
          assignmentMap[item.agent_assignment_id]?.campaign?.name || '',
      },
      {
        key: 'agent',
        label: 'Agent',
        width: 'min-w-[120px]',
        defaultVisible: false, // Hidden by default
        getValue: (item) => agentMap[item.id]?.name || '',
      },
      {
        key: 'assignedAt',
        label: 'Assigned At',
        width: 'min-w-[100px]',
        defaultVisible: false, // Hidden by default
        getValue: (item) => item.assigned_at || '',
      },
      {
        key: 'campaignName',
        label: 'Campaign',
        width: 'min-w-[150px]',
        defaultVisible: true,
        getValue: (item) =>
          (item.campaign_influencer as any).campaign_name || '',
      },
      // ✅ ADD THIS NEW COLUMN - Client Status (from shortlisted_status)
      {
        key: 'clientStatus',
        label: 'Client Status',
        width: 'w-28',
        defaultVisible: false, // Hidden by default, toggle via visibility
        getValue: (item) =>
          (item.campaign_influencer as any).shortlisted_status?.name || '',
      },
      {
        key: 'comment',
        label: 'Comment',
        width: 'w-20',
        defaultVisible: true,
        getValue: () => '',
      },
      {
        key: 'actions',
        label: 'Actions',
        width: 'w-20',
        defaultVisible: true,
        getValue: () => '',
      },
    ];

    return columns;
  }, [showAttemptsOnly, assignmentMap, agentMap]);

  // Initialize visible columns based on defaults
  useEffect(() => {
    if (visibleColumns.size === 0 && allColumns.length > 0) {
      const initialVisible = new Set<string>();
      allColumns.forEach((column) => {
        if (column.defaultVisible) {
          initialVisible.add(column.key);
        }
      });
      setVisibleColumns(initialVisible);
    }
  }, [allColumns, visibleColumns.size]);

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
  // Update local members when prop changes
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  // Fetch reassignment reasons on component mount
  useEffect(() => {
    fetchReassignmentReasons();
  }, []);

  // Handle scroll events to reposition tooltip
  useEffect(() => {
    if (!campaignTooltipOpen || !campaignTooltipTriggerRef.current) return;

    const updateTooltipPosition = () => {
      if (!campaignTooltipTriggerRef.current) return;

      const rect = campaignTooltipTriggerRef.current.getBoundingClientRect();

      // Check if trigger element is visible in viewport
      const isVisible =
        rect.top >= -10 &&
        rect.left >= -10 &&
        rect.bottom <= window.innerHeight + 10 &&
        rect.right <= window.innerWidth + 10;

      // If trigger icon is not visible, close the tooltip
      if (!isVisible) {
        setCampaignTooltipOpen(false);
        campaignTooltipTriggerRef.current = null;
        return;
      }

      const popupWidth = 320;
      const popupHeight = 160;
      const margin = 12;

      // Smart positioning: try right, left, bottom, top
      let popupX = rect.right + margin;
      let popupY = rect.top + rect.height / 2 - popupHeight / 2;

      // Try right side first
      if (popupX + popupWidth > window.innerWidth - margin) {
        // Try left side
        popupX = rect.left - popupWidth - margin;

        // If left doesn't fit either, try bottom
        if (popupX < margin) {
          popupX = rect.left + rect.width / 2 - popupWidth / 2;
          popupY = rect.bottom + margin;

          // If bottom doesn't fit, try top
          if (popupY + popupHeight > window.innerHeight - margin) {
            popupY = rect.top - popupHeight - margin;

            // Last resort: center on screen
            if (popupY < margin) {
              popupX = (window.innerWidth - popupWidth) / 2;
              popupY = (window.innerHeight - popupHeight) / 2;
            }
          }
        }
      }

      // Ensure tooltip stays within viewport bounds
      popupX = Math.max(
        margin,
        Math.min(popupX, window.innerWidth - popupWidth - margin),
      );
      popupY = Math.max(
        margin,
        Math.min(popupY, window.innerHeight - popupHeight - margin),
      );

      setCampaignTooltipPosition({ x: popupX, y: popupY });
    };

    // Initial position
    updateTooltipPosition();

    // Update position on scroll and resize
    const handleScroll = (e: Event) => {
      updateTooltipPosition();
    };

    const handleResize = () => {
      updateTooltipPosition();
    };

    // Listen to scroll on all scrollable parents
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [campaignTooltipOpen]);

  // Handle click outside to close tooltip
  useEffect(() => {
    if (!campaignTooltipOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Don't close if clicking the trigger button
      if (campaignTooltipTriggerRef.current?.contains(target)) {
        return;
      }

      // Don't close if clicking inside the tooltip
      if (campaignTooltipRef.current?.contains(target)) {
        return;
      }

      // Close tooltip
      setCampaignTooltipOpen(false);
      campaignTooltipTriggerRef.current = null;
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setCampaignTooltipOpen(false);
        campaignTooltipTriggerRef.current = null;
      }
    };

    // Add small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [campaignTooltipOpen]);

  // Function to load comments for all members
  const loadCommentsForMembers = async () => {
    try {
      const commentsMap: Record<string, CommentType[]> = {};

      // Load comments for each member
      await Promise.all(
        members.map(async (member) => {
          try {
            const response = await CommentsClientService.getCommentsByEntity({
              entity_type: 'campaign_influencer',
              entity_id: member.campaign_influencer.id,
              include_private: true,
              include_replies: true,
            });
            commentsMap[member.campaign_influencer.id] =
              response.comments || [];
          } catch (error) {
            console.error(
              `Failed to load comments for member ${member.campaign_influencer.id}:`,
              error,
            );
            commentsMap[member.campaign_influencer.id] = [];
          }
        }),
      );

      setMemberComments(commentsMap);
    } catch (error) {
      console.error('Error loading comments for members:', error);
    }
  };

  const fetchReassignmentReasons = async () => {
    try {
      setLoadingReasons(true);
      setReasonsError(null);
      const reasons = await getReassignmentReasonsForAgents();
      setReassignmentReasons(reasons);
    } catch (error) {
      console.error('Error fetching reassignment reasons:', error);
      setReasonsError('Failed to load reassignment reasons');
      // Set fallback reasons
      setReassignmentReasons([
        {
          id: '0b28dc8d-6c36-407f-a476-e0d15a397d12',
          code: 'agent_unavailable',
          name: "I'm Temporarily Unavailable",
          description: 'Agent is temporarily unavailable to continue outreach',
          is_system_triggered: false,
          is_user_triggered: true,
          is_agent_triggered: true,
          is_admin_triggered: true,
          is_support_triggered: false,
          user_category: 'outreach_agent',
          is_active: true,
          display_order: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoadingReasons(false);
    }
  };

  // Handle member updates (processing states, archiving, etc.)
  const handleMemberUpdate = useCallback(
    (updatedMember: AssignmentInfluencer) => {
      console.log('Updating member:', updatedMember.id, {
        isBeingReassigned: updatedMember.isBeingReassigned,
        isArchived: updatedMember.isArchived,
      });

      // Update local state immediately
      setMembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === updatedMember.id ? updatedMember : member,
        ),
      );

      // Call parent callback if provided
      if (parentOnMemberUpdate) {
        parentOnMemberUpdate(updatedMember);
      }
    },
    [parentOnMemberUpdate],
  );

  // Enhanced contact added handler with refresh trigger
  const handleContactAdded = useCallback(
    (member: AssignmentInfluencer) => {
      console.log(
        'Contact added for member:',
        member.id,
        'triggering refresh...',
      );
      setContactRefreshTrigger((prev) => prev + 1);
      handleMemberUpdate(member);
    },
    [handleMemberUpdate],
  );

  // Auto-cleanup archived members after delay
  useEffect(() => {
    const archivedMembers = members.filter((m) => m.isArchived);

    if (archivedMembers.length > 0) {
      // Auto-remove archived members after 5 seconds
      const timer = setTimeout(() => {
        setMembers((prevMembers) =>
          prevMembers.filter((member) => !member.isArchived),
        );
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [members]);

  // Calculate popup position
  const calculatePopupPosition = (
    triggerElement: HTMLElement,
    modalWidth: number,
    modalHeight: number,
  ) => {
    const rect = triggerElement.getBoundingClientRect();
    const padding = 10;

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = rect.left + scrollX;
    let y = rect.bottom + padding + scrollY;

    if (x + modalWidth > window.innerWidth + scrollX - padding) {
      x = rect.right + scrollX - modalWidth;
    }

    if (y + modalHeight > window.innerHeight + scrollY - padding) {
      y = rect.top + scrollY - modalHeight - padding;
    }

    if (x < scrollX + padding) {
      x = scrollX + padding;
    }

    if (y < scrollY + padding) {
      y = rect.bottom + padding + scrollY;
    }

    return { x, y };
  };

  // Comment click handler
  const handleCommentClick = (
    member: AssignmentInfluencer,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const buttonElement = event.currentTarget as HTMLElement;
    const rect = buttonElement.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    const popupWidth = 350;
    const popupHeight = 300;
    const margin = 10;

    // Default: position to the left of the button
    let popupX = buttonElement.offsetLeft - popupWidth - margin;
    let popupY = buttonElement.offsetTop;

    // If popup goes off the left edge, position to the right
    if (popupX < scrollX + margin) {
      popupX = buttonElement.offsetLeft + rect.width + margin;
    }

    // If popup still goes off the right edge, position it within viewport
    if (popupX + popupWidth > scrollX + window.innerWidth - margin) {
      popupX = scrollX + window.innerWidth - popupWidth - margin;
    }

    // Vertical positioning adjustments
    const viewportTop = scrollY;
    const viewportBottom = scrollY + window.innerHeight;

    if (popupY + popupHeight > viewportBottom - margin) {
      popupY = viewportBottom - popupHeight - margin;
    }

    if (popupY < viewportTop + margin) {
      popupY = viewportTop + margin;
    }

    console.log(
      'Comment button clicked for member:',
      member.campaign_influencer.id,
      'Position:',
      { x: popupX, y: popupY },
    );

    setCommentPosition({ x: popupX, y: popupY });
    setSelectedMemberForComment(member);
    setCommentThreadOpen(true);
  };

  // Handle comment update callback
  const handleCommentUpdate = useCallback(
    async (memberId: string, comments: CommentType[]) => {
      console.log(
        'Comments updated for member:',
        memberId,
        'New count:',
        comments.length,
      );

      // Update local comments state
      setMemberComments((prev) => ({
        ...prev,
        [memberId]: comments,
      }));
    },
    [],
  );

  const handlePriceClick = (
    member: AssignmentInfluencer,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const position = calculatePopupPosition(
      event.currentTarget as HTMLElement,
      350,
      250,
    );
    console.log('Price position calculated immediately:', position);

    setPricePosition(position);
    setSelectedMemberForPrice(member);
    setPriceModalOpen(true);
  };

  const handleContactsClick = (
    member: AssignmentInfluencer,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // Calculate position for fixed positioning (no scroll offset)
    const triggerElement = event.currentTarget as HTMLElement;
    const rect = triggerElement.getBoundingClientRect();
    const padding = 8;
    const modalWidth = 320;
    const modalHeight = 200;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let x = rect.left;
    let y = rect.bottom + padding;

    // Adjust horizontal position if going off-screen
    if (x + modalWidth > viewportWidth - padding) {
      x = rect.right - modalWidth;
    }
    if (x < padding) {
      x = padding;
    }

    // Adjust vertical position if going off-screen
    if (y + modalHeight > viewportHeight - padding) {
      y = rect.top - modalHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }

    const position = { x, y };
    console.log('Contacts position calculated:', position);

    setContactsPosition(position);
    setSelectedMemberForContacts(member);
    setContactsModalOpen(true);
  };

  // Handle campaign/brand tooltip click
  const handleCampaignTooltipClick = (
    event: React.MouseEvent,
    campaign: string,
    brand: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const buttonElement = event.currentTarget as HTMLElement;

    // Toggle tooltip if clicking same button
    if (
      campaignTooltipTriggerRef.current === buttonElement &&
      campaignTooltipOpen
    ) {
      setCampaignTooltipOpen(false);
      campaignTooltipTriggerRef.current = null;
      return;
    }

    campaignTooltipTriggerRef.current = buttonElement;
    setCampaignTooltipContent({ campaign, brand });
    setCampaignTooltipOpen(true);
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const filteredMembers = members.filter((member) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      member.campaign_influencer.social_account.full_name
        .toLowerCase()
        .includes(searchLower) ||
      member.campaign_influencer.social_account.account_handle
        .toLowerCase()
        .includes(searchLower)
    );
  });

  // Sort the filtered members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue, bValue;

    switch (sortConfig.key) {
      case 'name':
        aValue = a.campaign_influencer.social_account.full_name;
        bValue = b.campaign_influencer.social_account.full_name;
        break;
      case 'tags':
        // Sort by number of tags
        aValue = (a.campaign_influencer as any).tags?.length || 0;
        bValue = (b.campaign_influencer as any).tags?.length || 0;
        break;
      case 'x_campaigns':
        // Sort by number of past campaigns
        aValue = (a.campaign_influencer as any).past_campaigns?.length || 0;
        bValue = (b.campaign_influencer as any).past_campaigns?.length || 0;
        break;
      case 'cpv':
        // Sort by calculated CPV value
        const getCpv = (member: AssignmentInfluencer) => {
          const totalPrice =
            Number(member.campaign_influencer.total_price) || 0;
          const avgViews =
            Number((member.campaign_influencer as any).average_views) || 0;

          if (totalPrice <= 0 || avgViews <= 0) return 0;
          return totalPrice / avgViews;
        };

        aValue = getCpv(a);
        bValue = getCpv(b);
        break;
      case 'status':
        aValue = a.campaign_influencer.status?.name || '';
        bValue = b.campaign_influencer.status?.name || '';
        break;
      case 'followers':
        aValue = a.campaign_influencer.social_account.followers_count;
        bValue = b.campaign_influencer.social_account.followers_count;
        break;
      case 'price':
        aValue = a.campaign_influencer.collaboration_price || 0;
        bValue = b.campaign_influencer.collaboration_price || 0;
        break;
      case 'attempts':
        aValue = a.attempts_made || 0;
        bValue = b.attempts_made || 0;
        break;
      case 'agent':
        aValue = agentMap[a.id]?.name?.toLowerCase() || '';
        bValue = agentMap[b.id]?.name?.toLowerCase() || '';
        break;
      case 'totalPrice':
        aValue = a.campaign_influencer.total_price || 0;
        bValue = b.campaign_influencer.total_price || 0;
        break;
      case 'campaign_name':
        aValue =
          (a.campaign_influencer as any).campaign_name?.toLowerCase() || '';
        bValue =
          (b.campaign_influencer as any).campaign_name?.toLowerCase() || '';
        break;
      case 'priceType':
        // Fix: Sort by price_type string value
        aValue = (a.campaign_influencer.price_type || '').toLowerCase();
        bValue = (b.campaign_influencer.price_type || '').toLowerCase();
        break;
      case 'assigned_at':
        // Sort by assigned_at date
        aValue = a.assigned_at ? new Date(a.assigned_at).getTime() : 0;
        bValue = b.assigned_at ? new Date(b.assigned_at).getTime() : 0;
        break;
      // ✅ ADD THIS NEW CASE
      case 'clientStatus':
        // Sort by client status (shortlisted_status name)
        aValue = (
          (a.campaign_influencer as any).shortlisted_status?.name || ''
        ).toLowerCase();
        bValue = (
          (b.campaign_influencer as any).shortlisted_status?.name || ''
        ).toLowerCase();
        break;
      case 'contacts':
        // Sort by number of contacts
        aValue = a.campaign_influencer.social_account?.contacts?.length || 0;
        bValue = b.campaign_influencer.social_account?.contacts?.length || 0;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Truncate text with tooltip
  const TruncatedText = ({
    text,
    maxLength = 20,
    className = '',
  }: {
    text: string;
    maxLength?: number;
    className?: string;
  }) => {
    const shouldTruncate = text.length > maxLength;
    const displayText = shouldTruncate
      ? `${text.substring(0, maxLength)}...`
      : text;

    if (shouldTruncate) {
      return (
        <span className={`cursor-help ${className}`} title={text}>
          {displayText}
        </span>
      );
    }

    return <span className={className}>{text}</span>;
  };

  // ========== PLATFORM DETECTION HELPERS ==========
  // Helper to get platform name from member
  const getPlatformName = useCallback(
    (member: AssignmentInfluencer): string => {
      const socialAccount = member.campaign_influencer.social_account;
      const additionalMetrics = (socialAccount as any)?.additional_metrics;

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
      const directPlatform = (socialAccount as any)?.platform?.name;
      if (directPlatform) {
        return directPlatform.toLowerCase();
      }

      // 4️⃣ FOURTH: Check account_url
      const accountUrl = socialAccount?.account_url || '';
      if (accountUrl.includes('tiktok.com')) return 'tiktok';
      if (accountUrl.includes('youtube.com')) return 'youtube';
      if (accountUrl.includes('instagram.com')) return 'instagram';

      return 'instagram'; // Default fallback
    },
    [],
  );

  // Get platform icon component
  const getPlatformIcon = useCallback(
    (member: AssignmentInfluencer): React.ReactNode => {
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

  const PriceDisplay = ({ member }: { member: AssignmentInfluencer }) => {
    const currentCurrency = member.campaign_influencer.currency || 'USD';
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      PKR: '₨',
      AED: 'د.إ',
    };
    const symbol = currencySymbols[currentCurrency] || '$';

    return (
      <button
        onClick={(e) => handlePriceClick(member, e)}
        className="w-28 flex items-center text-sm text-gray-700 font-medium hover:text-teal-600 hover:bg-gray-50 px-1 py-1 rounded transition-colors"
        title="Click to edit price"
      >
        <span className="mr-0.5">{symbol}</span>
        <span>{member.campaign_influencer.collaboration_price || '0'}</span>
      </button>
    );
  };

  // ============================================
  // PRICE APPROVAL BADGE COMPONENT
  // Conditional UI based on Manager vs Agent view
  // ============================================
  // ✅ FIXED PriceApprovalBadge Component with Debug + Robust Field Checking

  const PriceApprovalBadge = ({
    member,
    isManagerView,
    onApproveClick,
  }: {
    member: AssignmentInfluencer;
    isManagerView: boolean;
    onApproveClick: (
      member: AssignmentInfluencer,
      event: React.MouseEvent,
    ) => void;
  }) => {
    const price = member.campaign_influencer.collaboration_price || 0;

    // ✅ ROBUST: Check multiple possible field names
    // Backend might send: price_approved, price_approval, priceApproved, etc.
    const priceApproved = Boolean(
      member.campaign_influencer.price_approved ||
        (member.campaign_influencer as any).price_approval ||
        (member.campaign_influencer as any).priceApproved ||
        (member.campaign_influencer as any).is_price_approved,
    );

    const isApproving = approvingMemberId === member.id;

    // ✅ DEBUG: Log when price > 0 to see what's happening
    if (price > 0 && typeof window !== 'undefined') {
      console.log('💰 PriceApprovalBadge Debug:', {
        influencer: member.campaign_influencer.social_account.full_name,
        price,
        priceApproved,
        isApproving,
        isManagerView,
        // Show all possible field values
        possible_fields: {
          price_approved: member.campaign_influencer.price_approved,
          price_approval: (member.campaign_influencer as any).price_approval,
          priceApproved: (member.campaign_influencer as any).priceApproved,
        },
        // Show raw object to see what fields exist
        raw_campaign_influencer_keys: Object.keys(member.campaign_influencer),
      });
    }

    // SCENARIO 1: Price = 0 → "Pending" (Both Views)
    if (!price || price === 0) {
      return (
        <div className="flex items-center justify-center">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold 
                        bg-gray-100 text-gray-600 border border-gray-200 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
            Pending
          </span>
        </div>
      );
    }

    // SCENARIO 2: price_approved = true → "Approved" (Both Views)
    if (priceApproved) {
      console.log(
        '✅ Showing Approved badge for:',
        member.campaign_influencer.social_account.full_name,
      );
      return (
        <div className="flex items-center justify-center">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold 
                        bg-green-100 text-green-700 border border-green-200 shadow-sm"
          >
            <Check className="w-3 h-3 mr-1" />
            Approved
          </span>
        </div>
      );
    }

    // SCENARIO 3: Price > 0 && !approved
    if (isManagerView) {
      console.log(
        '💰 Showing Approve button for:',
        member.campaign_influencer.social_account.full_name,
      );
      // MANAGER: Show "Approve" button with loading state
      return (
        <button
          onClick={(e) => onApproveClick(member, e)}
          disabled={isApproving}
          className="w-full px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg 
                  hover:from-amber-600 hover:to-amber-700 transition-all font-medium text-xs
                  flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md transform hover:-translate-y-0.5
                  border border-amber-600 hover:border-amber-700 active:scale-95
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          title="Review and approve price request"
        >
          {isApproving ? (
            <>
              <svg
                className="animate-spin h-3.5 w-3.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Approving...
            </>
          ) : (
            <>
              <DollarSign className="w-3.5 h-3.5" />
              Approve
            </>
          )}
        </button>
      );
    } else {
      // AGENT: Show "Requested" badge
      return (
        <div className="flex items-center justify-center">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold 
                        bg-yellow-100 text-yellow-700 border border-yellow-200 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5 animate-pulse"></span>
            Requested
          </span>
        </div>
      );
    }
  };

  // Get comment count for a member
  const getCommentCount = (memberId: string): number => {
    const comments = memberComments[memberId] || [];
    // Count all comments and replies
    const countCommentsWithReplies = (comments: CommentType[]): number => {
      return comments.reduce((total, comment) => {
        return (
          total +
          1 +
          (comment.replies ? countCommentsWithReplies(comment.replies) : 0)
        );
      }, 0);
    };
    return countCommentsWithReplies(comments);
  };

  // Handle price approval click
  // ✅ Direct API call for price approval (NO POPUP)
  const handlePriceApprovalClick = async (
    member: AssignmentInfluencer,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const memberId = member.id;
    const influencerId = member.campaign_influencer.id;
    const currentPrice = member.campaign_influencer.collaboration_price || 0;
    const currency = member.campaign_influencer.currency || 'USD';

    console.log(
      '💰 Approving price for:',
      member.campaign_influencer.social_account.full_name,
    );
    console.log('📊 Request data:', { influencerId, currentPrice, currency });

    // Set loading state
    setApprovingMemberId(memberId);

    try {
      const requestData: PriceApprovalRequest = {
        action: 'approve',
        approved_price: currentPrice,
        currency: currency,
      };

      const response = await approvePrice(influencerId, requestData);

      // ✅ ENHANCED LOGGING - Check what API returns
      console.log('🔍 Full API Response:', {
        price_approved: response.price_approved,
        collaboration_price: response.collaboration_price,
        currency: response.currency,
        full_response: response,
      });

      // ✅ CHECK: Verify price_approved is explicitly true
      if (response.price_approved === true) {
        console.log('✅ Price approved successfully - Updating UI');

        // ✅ CREATE: Updated member with API response data
        const updatedMember: AssignmentInfluencer = {
          ...member,
          campaign_influencer: {
            ...member.campaign_influencer,
            price_approved: true, // ✅ Force true
            collaboration_price: response.collaboration_price || currentPrice,
            currency: response.currency || currency,
          },
        };

        // ✅ UPDATE: Both local and parent state
        console.log('🔄 Updating local state...');
        handlePriceApprovalSuccess(updatedMember);

        // ✅ VERIFY: Log updated member
        console.log('✅ Updated member:', {
          id: updatedMember.id,
          price_approved: updatedMember.campaign_influencer.price_approved,
          price: updatedMember.campaign_influencer.collaboration_price,
        });
      } else {
        // ✅ ERROR: API didn't return price_approved: true
        console.error('⚠️ Unexpected API Response:', response);
        console.error(
          '⚠️ price_approved is not true:',
          response.price_approved,
        );
        console.error('⚠️ This might cause badge to revert after reload!');
        alert(
          '⚠️ Price approval response unexpected. Check console for details.',
        );
      }
    } catch (error: any) {
      console.error('❌ Error approving price:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response,
      });
      alert('Failed to approve price. Please try again.');
    } finally {
      // Clear loading state
      setApprovingMemberId(null);
    }
  };

  const handlePriceApprovalSuccess = useCallback(
    (updatedMember: AssignmentInfluencer) => {
      console.log('✅ handlePriceApprovalSuccess called');
      console.log('📝 Updated member data:', {
        id: updatedMember.id,
        influencer_id: updatedMember.campaign_influencer.id,
        price_approved: updatedMember.campaign_influencer.price_approved,
        collaboration_price:
          updatedMember.campaign_influencer.collaboration_price,
      });

      // Update local state
      setMembers((prevMembers) => {
        const updated = prevMembers.map((member) =>
          member.id === updatedMember.id ? updatedMember : member,
        );
        console.log('🔄 Local state updated, total members:', updated.length);
        return updated;
      });

      // Call parent callback if exists
      if (parentOnMemberUpdate) {
        console.log('📤 Calling parentOnMemberUpdate...');
        parentOnMemberUpdate(updatedMember);
        console.log('✅ parentOnMemberUpdate called successfully');
      } else {
        console.warn(
          "⚠️ parentOnMemberUpdate is not defined - parent won't be updated!",
        );
      }
    },
    [parentOnMemberUpdate],
  );

  return (
    <div className="bg-transparent">
      {!hideSearchField && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="w-1/2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search influencers..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {error ? (
        <div className="p-6 text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  {/* Influencer - Always visible */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <SortableHeader
                      sortKey="name"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    >
                      Influencer
                    </SortableHeader>
                  </th>

                  {/* Tags Column Header */}
                  {showTagsColumn && visibleColumns.has('tags') && (
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-32">
                      <SortableHeader
                        sortKey="tags"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Tags
                      </SortableHeader>
                    </th>
                  )}

                  {/* X-Campaigns Column Header */}
                  {showXCampaignsColumn &&
                    visibleColumns.has('x_campaigns') && (
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-28">
                        <SortableHeader
                          sortKey="x_campaigns"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        >
                          X-Campaigns
                        </SortableHeader>
                      </th>
                    )}

                  {/* Status Column */}
                  {visibleColumns.has('status') && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider">
                      <SortableHeader
                        sortKey="status"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Agent Status
                      </SortableHeader>
                    </th>
                  )}

                  {/* Attempts/Contact Info Column */}
                  {visibleColumns.has('attempts') && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider">
                      <SortableHeader
                        sortKey="attempts"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        {showAttemptsOnly ? 'Attempts' : 'Contact Info'}
                      </SortableHeader>
                    </th>
                  )}

                  {/* Contact Timeline Column */}
                  {!hideContactTimeline &&
                    visibleColumns.has('contactTimeline') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-28">
                        Contact Timeline
                      </th>
                    )}

                  {/* Message Column */}
                  {!hideMessageColumn && visibleColumns.has('message') && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider">
                      Message
                    </th>
                  )}

                  {/* Price Column */}
                  {visibleColumns.has('price') && (
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-20">
                      <SortableHeader
                        sortKey="price"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Price
                      </SortableHeader>
                    </th>
                  )}

                  {/* Price Type Column */}
                  {visibleColumns.has('priceType') && (
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-24">
                      <SortableHeader
                        sortKey="priceType"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Fee
                      </SortableHeader>
                    </th>
                  )}

                  {/* Price Approval Column */}
                  {isManagerView && visibleColumns.has('priceApproval') && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-20">
                      <SortableHeader
                        sortKey="priceApproval"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Approval
                      </SortableHeader>
                    </th>
                  )}

                  {/* Total Price Column */}
                  {isManagerView && visibleColumns.has('totalPrice') && (
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-28">
                      <SortableHeader
                        sortKey="totalPrice"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Total Price
                      </SortableHeader>
                    </th>
                  )}

                  {/* CPV Column */}
                  {showCPVColumn && visibleColumns.has('cpv') && (
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-24">
                      <SortableHeader
                        sortKey="cpv"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        CPV
                      </SortableHeader>
                    </th>
                  )}

                  {/* Contacts Column */}
                  {visibleColumns.has('contacts') && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-24">
                      <SortableHeader
                        sortKey="contacts"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Contacts
                      </SortableHeader>
                    </th>
                  )}

                  {/* Campaign / Brand Column */}
                  {showCampaignColumn &&
                    visibleColumns.has('campaignBrand') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider">
                        Campaign / Brand
                      </th>
                    )}

                  {/* Agent Column */}
                  {showAgentColumn && visibleColumns.has('agent') && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider">
                      <SortableHeader
                        sortKey="agent"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Agent
                      </SortableHeader>
                    </th>
                  )}

                  {/* Assigned At Column */}
                  {showAssignedAtColumn && visibleColumns.has('assignedAt') && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider">
                      <SortableHeader
                        sortKey="assigned_at"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      >
                        Assigned At
                      </SortableHeader>
                    </th>
                  )}

                  {/* Campaign Name Column */}
                  {showCampaignNameColumn &&
                    visibleColumns.has('campaignName') && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider">
                        <SortableHeader
                          sortKey="campaign_name"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        >
                          Campaign
                        </SortableHeader>
                      </th>
                    )}

                  {/* ✅ ADD THIS - Client Status Column Header */}
                  {showClientStatusColumn &&
                    visibleColumns.has('clientStatus') && (
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider min-w-[100px] whitespace-nowrap">
                        <SortableHeader
                          sortKey="clientStatus"
                          currentSort={sortConfig}
                          onSort={handleSort}
                        >
                          Client Status
                        </SortableHeader>
                      </th>
                    )}

                  {/* Comment Column */}
                  {visibleColumns.has('comment') && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider w-20">
                      Comment
                    </th>
                  )}

                  {/* Actions Column */}
                  {!hideActionsColumn && visibleColumns.has('actions') && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 tracking-wider">
                      {/* Actions */}
                    </th>
                  )}

                  {/* Column Visibility Toggle */}
                  <th className="px-4 py-4 text-right relative">
                    <button
                      onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                      className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-teal-600 transition-colors"
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

                    {/* Column Visibility Dropdown */}
                    <ColumnVisibility
                      isOpen={showColumnDropdown}
                      onClose={() => setShowColumnDropdown(false)}
                      columns={allColumns.filter(
                        (col) =>
                          !['message', 'campaignBrand', 'actions'].includes(
                            col.key,
                          ),
                      )}
                      visibleColumns={visibleColumns}
                      onToggleColumn={toggleColumnVisibility}
                      data={members}
                      position="top-right"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="ml-3 space-y-1">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                              <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : sortedMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={
                        9 -
                        (hideContactTimeline ? 1 : 0) -
                        (hideMessageColumn ? 1 : 0) -
                        (hideActionsColumn ? 1 : 0) +
                        (showCampaignColumn ? 1 : 0) +
                        (showAgentColumn ? 1 : 0) +
                        (showTagsColumn ? 1 : 0) +
                        (showXCampaignsColumn ? 1 : 0) +
                        (showCPVColumn ? 1 : 0) +
                        (showCampaignNameColumn ? 1 : 0) +
                        (showAssignedAtColumn ? 1 : 0) +
                        (showClientStatusColumn ? 1 : 0) // ✅ ADD THIS
                      }
                      className="px-6 py-12 text-center"
                    >
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-base font-medium text-gray-900 mb-2">
                        No influencers found
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {searchText
                          ? 'No influencers match your search criteria.'
                          : `No ${currentType} influencers in this assignment.`}
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedMembers.map((member, index) => {
                    const isDisabled =
                      member.isBeingReassigned || member.isArchived;
                    const commentCount = getCommentCount(
                      member?.campaign_influencer?.id,
                    );

                    return (
                      <tr
                        key={member.id}
                        className={`
                          ${isDisabled ? 'opacity-50 pointer-events-none bg-gray-50' : 'hover:bg-teal-50/50'}
                          ${member.isArchived ? 'bg-green-50 border-green-200' : ''}
                          transition-all duration-200
                        `}
                        style={{
                          animation: `fadeSlideIn 0.4s ease-out ${index * 0.03}s forwards`,
                          opacity: 0,
                        }}
                      >
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <button
                                onClick={() => {
                                  const instagramUrl = `https://www.instagram.com/${member.campaign_influencer.social_account.account_handle.replace('@', '')}`;
                                  window.open(
                                    instagramUrl,
                                    '_blank',
                                    'noopener,noreferrer',
                                  );
                                }}
                                className="h-8 w-8 rounded-full overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                                title="Open Instagram profile"
                              >
                                <img
                                  className="h-8 w-8 rounded-full object-cover"
                                  src={
                                    member.campaign_influencer.social_account
                                      .profile_pic_url || '/default-avatar.png'
                                  }
                                  alt={`${member.campaign_influencer.social_account.full_name} profile`}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      '/default-avatar.png';
                                  }}
                                />
                              </button>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                <button
                                  onClick={() => {
                                    const instagramUrl = `https://www.instagram.com/${member.campaign_influencer.social_account.account_handle.replace('@', '')}`;
                                    window.open(
                                      instagramUrl,
                                      '_blank',
                                      'noopener,noreferrer',
                                    );
                                  }}
                                  className="hover:text-blue-600 hover:underline focus:outline-none focus:text-blue-600 focus:underline transition-colors"
                                  title="Open Instagram profile"
                                >
                                  <TruncatedText
                                    text={
                                      member.campaign_influencer.social_account
                                        .full_name
                                    }
                                    maxLength={25}
                                  />
                                </button>
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    // Dynamic URL based on platform
                                    const platform = getPlatformName(member);
                                    const handle =
                                      member.campaign_influencer.social_account.account_handle.replace(
                                        '@',
                                        '',
                                      );
                                    let profileUrl = '';

                                    if (platform.includes('tiktok')) {
                                      profileUrl = `https://www.tiktok.com/@${handle}`;
                                    } else if (platform.includes('youtube')) {
                                      profileUrl = `https://www.youtube.com/@${handle}`;
                                    } else {
                                      profileUrl = `https://www.instagram.com/${handle}`;
                                    }

                                    window.open(
                                      profileUrl,
                                      '_blank',
                                      'noopener,noreferrer',
                                    );
                                  }}
                                  className="hover:text-blue-600 hover:underline focus:outline-none focus:text-blue-600 focus:underline transition-colors"
                                  title={`Open ${getPlatformName(member)} profile`}
                                >
                                  <TruncatedText
                                    text={`@${member.campaign_influencer.social_account.account_handle}`}
                                    maxLength={20}
                                  />
                                </button>
                                {getPlatformIcon(member)}
                                {member.campaign_influencer.social_account
                                  .is_verified && (
                                  <CheckCircle className="w-3 h-3 text-blue-500" />
                                )}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatNumber(
                                  member.campaign_influencer.social_account
                                    .followers_count,
                                )}{' '}
                                followers
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Tags Column Cell */}
                        {showTagsColumn && visibleColumns.has('tags') && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <TagsColumn
                              member={member.campaign_influencer as any}
                              onUpdate={(updatedMember) => {
                                // Update the member with new tags
                                const updated = {
                                  ...member,
                                  campaign_influencer: {
                                    ...member.campaign_influencer,
                                    tags: (updatedMember as any).tags,
                                  },
                                };
                                handleMemberUpdate(updated);
                              }}
                              columnWidth={128}
                            />
                          </td>
                        )}

                        {/* X-Campaigns Column Cell */}
                        {showXCampaignsColumn &&
                          visibleColumns.has('x_campaigns') && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              <XCampaignsColumn
                                member={member.campaign_influencer as any}
                                pastCampaigns={
                                  (member.campaign_influencer as any)
                                    .past_campaigns || []
                                }
                              />
                            </td>
                          )}

                        {visibleColumns.has('status') && (
                          <td className="px-6 py-3 whitespace-nowrap">
                            {member.isBeingReassigned ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-blue-600 font-medium">
                                  Processing...
                                </span>
                              </div>
                            ) : member.isArchived ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                                  <Check className="w-2.5 h-2.5 text-white" />
                                </div>
                                <span className="text-sm text-green-600 font-medium">
                                  Archived
                                </span>
                              </div>
                            ) : (
                              <StatusDropdown
                                influencer={member}
                                availableStatuses={availableStatuses}
                                onUpdate={handleMemberUpdate}
                              />
                            )}
                          </td>
                        )}

                        {visibleColumns.has('attempts') && (
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                            {showAttemptsOnly ? (
                              <span className="text-sm text-gray-600 font-medium">
                                {member.attempts_made || 0}
                              </span>
                            ) : (
                              <EditableAttempts
                                member={member}
                                onUpdate={handleMemberUpdate}
                              />
                            )}
                          </td>
                        )}

                        {!hideContactTimeline &&
                          visibleColumns.has('contactTimeline') && (
                            <td className="px-6 py-3 whitespace-nowrap">
                              <ContactTimeline
                                key={`${member.id}-${member.attempts_made}-${member.last_contacted_at}-${member.next_contact_at}`}
                                member={member}
                              />
                            </td>
                          )}

                        {!hideMessageColumn &&
                          visibleColumns.has('message') && (
                            <td className="px-6 py-3 whitespace-nowrap">
                              <CopyMessageButton
                                member={member}
                                messageTemplates={messageTemplates}
                                assignment={assignment}
                                onCopy={() =>
                                  console.log(
                                    'Message copied for:',
                                    member.campaign_influencer.social_account
                                      .full_name,
                                  )
                                }
                              />
                            </td>
                          )}

                        {visibleColumns.has('price') && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            <PriceDisplay member={member} />
                          </td>
                        )}

                        {/* Price Type Cell */}
                        {visibleColumns.has('priceType') && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            {(() => {
                              const priceType =
                                member.campaign_influencer.price_type;
                              if (!priceType) {
                                return (
                                  <span className="text-xs text-gray-400">
                                    -
                                  </span>
                                );
                              }
                              return (
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                    priceType === 'inclusive'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                                  }`}
                                >
                                  {priceType}
                                </span>
                              );
                            })()}
                          </td>
                        )}

                        {isManagerView &&
                          visibleColumns.has('priceApproval') && (
                            <td className="px-6 py-3 whitespace-nowrap">
                              <PriceApprovalBadge
                                member={member}
                                isManagerView={isManagerView}
                                onApproveClick={handlePriceApprovalClick}
                              />
                            </td>
                          )}

                        {isManagerView && visibleColumns.has('totalPrice') && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            {(() => {
                              const totalPrice =
                                Number(
                                  member.campaign_influencer.total_price,
                                ) || 0;
                              const priceApproved = Boolean(
                                member.campaign_influencer.price_approved,
                              );
                              const priceType =
                                member.campaign_influencer.price_type;
                              const currentCurrency =
                                member.campaign_influencer.currency || 'USD';

                              const currencySymbols: Record<string, string> = {
                                USD: '$',
                                EUR: '€',
                                GBP: '£',
                                INR: '₹',
                                PKR: '₨',
                                AED: 'د.إ',
                              };
                              const symbol =
                                currencySymbols[currentCurrency] || '$';

                              if (totalPrice === 0) {
                                return (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500">
                                    {symbol}0
                                  </span>
                                );
                              }

                              return (
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border ${
                                    priceApproved
                                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200'
                                      : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-200'
                                  }`}
                                  title={
                                    priceType === 'exclusive'
                                      ? 'Includes 15% echooo fee'
                                      : 'Inclusive price'
                                  }
                                >
                                  {symbol}
                                  {Math.round(totalPrice).toLocaleString()}
                                </span>
                              );
                            })()}
                          </td>
                        )}

                        {/* CPV Column Cell */}
                        {showCPVColumn && visibleColumns.has('cpv') && (
                          <td className="px-4 py-3 whitespace-nowrap">
                            {(() => {
                              // Get total_price and average_views directly from campaign_influencer
                              const totalPrice =
                                Number(
                                  member.campaign_influencer.total_price,
                                ) || 0;
                              const avgViews =
                                Number(
                                  (member.campaign_influencer as any)
                                    .average_views,
                                ) || 0;

                              // If either value is missing or zero, show dash
                              if (totalPrice <= 0 || avgViews <= 0) {
                                return <span className="text-gray-400">-</span>;
                              }

                              // Calculate CPV: total_price / average_views
                              const cpv = totalPrice / avgViews;

                              return (
                                <span className="text-sm text-gray-700 font-medium">
                                  {cpv.toFixed(4)}
                                </span>
                              );
                            })()}
                          </td>
                        )}
                        {visibleColumns.has('contacts') && (
                          <td className="px-6 py-3 whitespace-nowrap">
                            <ContactDisplayWidget
                              member={member}
                              onContactClick={
                                disableContactInfoClick
                                  ? () => {} // No-op function when disabled
                                  : handleContactsClick
                              }
                            />
                          </td>
                        )}

                        {/* Campaign/Brand Column */}
                        {showCampaignColumn &&
                          visibleColumns.has('campaignBrand') && (
                            <td className="px-6 py-3 whitespace-nowrap">
                              {(() => {
                                // Get the specific assignment for THIS member
                                const memberAssignment =
                                  assignmentMap[member.agent_assignment_id];
                                const memberCampaignName =
                                  memberAssignment?.campaign?.name || 'N/A';
                                const memberBrandName =
                                  memberAssignment?.campaign?.brand_name ||
                                  'N/A';
                                const showTooltip =
                                  memberCampaignName.length > 20 ||
                                  memberBrandName.length > 20;

                                return (
                                  <div className="flex items-center space-x-1">
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-gray-900">
                                        {memberCampaignName.length > 20
                                          ? `${memberCampaignName.substring(0, 20)}...`
                                          : memberCampaignName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {memberBrandName.length > 20
                                          ? `${memberBrandName.substring(0, 20)}...`
                                          : memberBrandName}
                                      </div>
                                    </div>
                                    {showTooltip && (
                                      <button
                                        onClick={(e) => {
                                          handleCampaignTooltipClick(
                                            e,
                                            memberCampaignName,
                                            memberBrandName,
                                          );
                                        }}
                                        className="text-gray-400 hover:text-teal-600 hover:bg-teal-50 p-1.5 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                                        title="View full campaign and brand names"
                                      >
                                        <Info className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                          )}

                        {/* Agent Column */}
                        {showAgentColumn && visibleColumns.has('agent') && (
                          <td className="px-6 py-3 whitespace-nowrap">
                            {(() => {
                              const agentInfo = agentMap[member.id];
                              return agentInfo ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-medium flex-shrink-0">
                                    {agentInfo.name?.charAt(0) || '?'}
                                  </div>
                                  <span className="text-sm text-gray-900 truncate max-w-[120px]">
                                    {agentInfo.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              );
                            })()}
                          </td>
                        )}

                        {/* Assigned At Column Cell */}
                        {showAssignedAtColumn &&
                          visibleColumns.has('assignedAt') && (
                            <td className="px-6 py-3 whitespace-nowrap">
                              {(() => {
                                const assignedAt = member.assigned_at;

                                if (!assignedAt) {
                                  return (
                                    <span className="text-sm text-gray-400">
                                      -
                                    </span>
                                  );
                                }

                                const date = new Date(assignedAt);
                                const formattedDate = date.toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  },
                                );

                                return (
                                  <span
                                    className="text-sm text-gray-600"
                                    title={date.toLocaleString()}
                                  >
                                    {formattedDate}
                                  </span>
                                );
                              })()}
                            </td>
                          )}
                        {/* Campaign Name Column Cell */}
                        {showCampaignNameColumn &&
                          visibleColumns.has('campaignName') && (
                            <td className="px-6 py-3 whitespace-nowrap">
                              {(() => {
                                const campaignName = (
                                  member.campaign_influencer as any
                                ).campaign_name;
                                const campaignId = (
                                  member.campaign_influencer as any
                                ).campaign_id;

                                if (!campaignName) {
                                  return (
                                    <span className="text-sm text-gray-400">
                                      -
                                    </span>
                                  );
                                }

                                return (
                                  <button
                                    onClick={() => {
                                      if (campaignId) {
                                        router.push(
                                          `/outreach-manager/campaigns/${campaignId}`,
                                        );
                                      }
                                    }}
                                    className="text-sm text-teal-600 hover:text-teal-800 hover:underline font-medium truncate max-w-[150px] block text-left"
                                    title={campaignName}
                                  >
                                    {campaignName.length > 20
                                      ? `${campaignName.substring(0, 20)}...`
                                      : campaignName}
                                  </button>
                                );
                              })()}
                            </td>
                          )}

                        {/* ✅ ADD THIS - Client Status Column Cell */}
                        {showClientStatusColumn &&
                          visibleColumns.has('clientStatus') && (
                            <td className="px-4 py-3 whitespace-nowrap">
                              {(() => {
                                const clientStatus = (
                                  member.campaign_influencer as any
                                ).shortlisted_status?.name;

                                if (!clientStatus) {
                                  return (
                                    <span className="text-gray-400 text-sm">
                                      -
                                    </span>
                                  );
                                }

                                // Style based on status
                                const getStatusStyle = (status: string) => {
                                  switch (status.toLowerCase()) {
                                    case 'approved':
                                      return 'bg-green-100 text-green-700 border-green-200';
                                    case 'pending':
                                      return 'bg-amber-100 text-amber-700 border-amber-200';
                                    case 'rejected':
                                      return 'bg-red-100 text-red-700 border-red-200';
                                    case 'review':
                                      return 'bg-blue-100 text-blue-700 border-blue-200';
                                    default:
                                      return 'bg-gray-100 text-gray-700 border-gray-200';
                                  }
                                };

                                return (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(clientStatus)}`}
                                  >
                                    {clientStatus.charAt(0).toUpperCase() +
                                      clientStatus.slice(1).toLowerCase()}
                                  </span>
                                );
                              })()}
                            </td>
                          )}
                        {visibleColumns.has('comment') && (
                          <td className="px-6 py-3 whitespace-nowrap">
                            <button
                              onClick={(e) => handleCommentClick(member, e)}
                              className="relative inline-flex items-center text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded transition-colors group"
                              title="View/Add comments"
                            >
                              <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                              {commentCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[12px] h-3 flex items-center justify-center px-0.5 font-medium leading-none">
                                  {commentCount > 99 ? '99+' : commentCount}
                                </span>
                              )}
                            </button>
                          </td>
                        )}

                        {!hideActionsColumn &&
                          visibleColumns.has('actions') && (
                            <td className="px-6 py-3 whitespace-nowrap">
                              <ActionsDropdown
                                member={member}
                                onViewMember={onViewMember}
                                onViewContacts={onViewContacts}
                                onMemberUpdate={handleMemberUpdate}
                                currentType={currentType}
                                disabled={isDisabled}
                                reassignmentReasons={reassignmentReasons}
                                loadingReasons={loadingReasons}
                              />
                            </td>
                          )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total_items}
            pageSize={pagination.page_size}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </>
      )}

      {/* Comment Thread Popup */}
      <CommentThreadPopup
        influencer={
          selectedMemberForComment
            ? {
                id: selectedMemberForComment.campaign_influencer.id,
                username:
                  selectedMemberForComment.campaign_influencer.social_account
                    .account_handle,
                name: selectedMemberForComment.campaign_influencer
                  .social_account.full_name,
                social_account: {
                  profile_pic_url:
                    selectedMemberForComment.campaign_influencer.social_account
                      .profile_pic_url,
                  full_name:
                    selectedMemberForComment.campaign_influencer.social_account
                      .full_name,
                  account_handle:
                    selectedMemberForComment.campaign_influencer.social_account
                      .account_handle,
                },
              }
            : null
        }
        isOpen={commentThreadOpen}
        onClose={() => {
          setCommentThreadOpen(false);
          setSelectedMemberForComment(null);
        }}
        position={commentPosition}
        onUpdate={handleCommentUpdate}
      />

      {/* Price Modal */}
      <PricePopup
        member={selectedMemberForPrice}
        isOpen={priceModalOpen}
        onClose={() => {
          setPriceModalOpen(false);
          setSelectedMemberForPrice(null);
        }}
        onUpdate={handleMemberUpdate}
        position={pricePosition}
      />

      {/* Contacts Modal */}
      <ContactPopup
        member={selectedMemberForContacts}
        isOpen={contactsModalOpen}
        onClose={() => {
          setContactsModalOpen(false);
          setSelectedMemberForContacts(null);
        }}
        onContactAdded={handleContactAdded}
        position={contactsPosition}
      />

      {/* Campaign/Brand Tooltip Popup */}
      {campaignTooltipOpen && (
        <div
          ref={campaignTooltipRef}
          className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${campaignTooltipPosition.x}px`,
            top: `${campaignTooltipPosition.y}px`,
            width: '320px',
            maxWidth: '90vw',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Content */}
          <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
            {/* Campaign Name */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Campaign Name
                </label>
              </div>
              <p className="text-sm font-medium text-gray-900 pl-3 break-words leading-relaxed">
                {campaignTooltipContent.campaign}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100"></div>

            {/* Brand Name */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Brand Name
                </label>
              </div>
              <p className="text-sm text-gray-700 pl-3 break-words leading-relaxed">
                {campaignTooltipContent.brand}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
