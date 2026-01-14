// src/components/dashboard/platform/components/MembersTable/types.ts

import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { AgentAssignment } from '@/types/assignments';
import { Status } from '@/types/statuses';

export type InfluencerType = 'active' | 'archived' | 'completed';

export interface MembersTableProps {
  members: AssignmentInfluencer[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditCampaignStatus: (member: AssignmentInfluencer) => void;
  onViewMember: (member: AssignmentInfluencer) => void;
  onAddContact: (member: AssignmentInfluencer) => void;
  onViewContacts: (member: AssignmentInfluencer) => void;
  availableStatuses: Status[];
  onTypeChange: (type: InfluencerType) => void;
  currentType: InfluencerType;
  assignment: AgentAssignment;
  onMemberUpdate?: (updatedMember: AssignmentInfluencer) => void;
  onMemberArchived?: (archivedMember: AssignmentInfluencer) => void;
  showCampaignColumn?: boolean;
  assignmentMap?: Record<string, AgentAssignment>;
  agentId?: string;

  // NEW PROPS for Campaign Influencers Page
  /** Hide Contact Timeline column */
  hideContactTimeline?: boolean;
  /** Hide Message column */
  hideMessageColumn?: boolean;
  /** Show Agent column with agent info */
  showAgentColumn?: boolean;
  /** Disable Contact Info column click functionality */
  disableContactInfoClick?: boolean;
  /** Show only attempts count (non-editable, renamed header to "Attempts") */
  showAttemptsOnly?: boolean;
  /** Hide Search field */
  hideSearchField?: boolean;
  /** Agent mapping for showing agent names - key is assignment_id or influencer_id */
  agentMap?: Record<string, { id: string; name: string }>;
  /** Hide Actions column (archive, reassign dropdown) */
  hideActionsColumn?: boolean;

  // NEW PROPS for Tags, X-Campaigns, CPV columns
  /** Show Tags column */
  showTagsColumn?: boolean;
  /** Show X-Campaigns column */
  showXCampaignsColumn?: boolean;
  /** Show CPV column */
  showCPVColumn?: boolean;
    /** Show Campaign Name column (for unapproved influencers page) */
  showCampaignNameColumn?: boolean;
    /** Show Assigned At column (for unapproved influencers page) */
  showAssignedAtColumn?: boolean;
  // Add this new prop to MembersTableProps interface
  showClientStatusColumn?: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}