// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedGridView.tsx

'use client';

import React, { useMemo, useState } from 'react';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { Status } from '@/types/statuses';
import InfluencerCard from './InfluencerCard';
import InfluencerProfilePanel from './InfluencerProfilePanel';

interface ShortlistedGridViewProps {
  members: CampaignListMember[];
  selectedInfluencers: string[];
  onSelectionChange: (selected: string[]) => void;
  visibleColumns: Set<string>;
  // Helper functions
  getAdditionalMetric: (
    member: CampaignListMember,
    key: string,
    defaultValue?: any,
  ) => any;
  getProfilePicture: (member: CampaignListMember) => string;
  getPlatformName: (member: CampaignListMember) => string;
  getPlatformIcon: (member: CampaignListMember) => React.ReactNode;
  formatLocation: (member: CampaignListMember) => string;
  formatEngagementRate: (member: CampaignListMember) => string;
  getCombinedAverageViews: (member: CampaignListMember) => number | null;
  // Action handlers
  onProfileInsights: (member: CampaignListMember) => void;
  onRowUpdate: (updatedMember: CampaignListMember) => void;
  onRemovingChange: (removing: string[]) => void;
  removingInfluencers: string[];
  onInfluencerRemoved?: () => void;
  onRefreshProfileData?: (member: CampaignListMember) => void;
  refreshingMemberId?: string | null;
  isRefreshingProfile?: boolean;
  // Status props
  shortlistedStatuses: Status[];
  onShortlistedStatusChange: (
    influencerId: string,
    statusId: string,
  ) => Promise<void>;
  updatingStatus: Set<string>;
  statusesLoading: boolean;
  localInfluencerUpdates: Record<string, any>;
  // Search text for empty state
  searchText?: string;
}

const ShortlistedGridView: React.FC<ShortlistedGridViewProps> = ({
  members,
  selectedInfluencers,
  onSelectionChange,
  visibleColumns,
  getAdditionalMetric,
  getProfilePicture,
  getPlatformName,
  getPlatformIcon,
  formatLocation,
  formatEngagementRate,
  getCombinedAverageViews,
  onProfileInsights,
  onRowUpdate,
  onRemovingChange,
  removingInfluencers,
  onInfluencerRemoved,
  onRefreshProfileData,
  refreshingMemberId,
  isRefreshingProfile,
  shortlistedStatuses,
  onShortlistedStatusChange,
  updatingStatus,
  statusesLoading,
  localInfluencerUpdates,
  searchText,
}) => {
  // Profile Panel state
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [selectedMemberForPanel, setSelectedMemberForPanel] =
    useState<CampaignListMember | null>(null);

  // Handle individual selection toggle
  const handleSelectionChange = (id: string) => {
    const newSelected = selectedInfluencers.includes(id)
      ? selectedInfluencers.filter((item) => item !== id)
      : [...selectedInfluencers, id];
    onSelectionChange(newSelected);
  };

  // Handle profile panel open
  const handleProfilePanel = (member: CampaignListMember) => {
    setSelectedMemberForPanel(member);
    setProfilePanelOpen(true);
  };

  // Handle profile panel close
  const handleProfilePanelClose = () => {
    setProfilePanelOpen(false);
    // Delay clearing the member to allow animation to complete
    setTimeout(() => setSelectedMemberForPanel(null), 300);
  };

  // Check if all members are selected
  const allMemberIds = useMemo(
    () =>
      members.map((m) => m.id).filter((id): id is string => id !== undefined),
    [members],
  );

  const isAllSelected = useMemo(
    () =>
      allMemberIds.length > 0 &&
      allMemberIds.every((id) => selectedInfluencers.includes(id)),
    [allMemberIds, selectedInfluencers],
  );

  const isPartiallySelected = useMemo(
    () => selectedInfluencers.length > 0 && !isAllSelected,
    [selectedInfluencers.length, isAllSelected],
  );

  // Handle select all toggle
  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all current page members
      const newSelected = selectedInfluencers.filter(
        (id) => !allMemberIds.includes(id),
      );
      onSelectionChange(newSelected);
    } else {
      // Select all current page members
      const newSelected = [
        ...new Set([...selectedInfluencers, ...allMemberIds]),
      ];
      onSelectionChange(newSelected);
    }
  };

  // Empty state
  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchText
              ? 'No influencers match your search'
              : 'No shortlisted influencers yet'}
          </h3>
          <p className="text-sm text-gray-500">
            {searchText
              ? 'Try adjusting your search criteria'
              : 'Add influencers from the Discovery section to get started'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Grid Container - NO Select All Header here (moved to ShortlistedTable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {members.map((member) => (
          <InfluencerCard
            key={member.id}
            member={member}
            isSelected={selectedInfluencers.includes(member.id ?? '')}
            onSelectionChange={handleSelectionChange}
            visibleColumns={visibleColumns}
            getAdditionalMetric={getAdditionalMetric}
            getProfilePicture={getProfilePicture}
            getPlatformName={getPlatformName}
            getPlatformIcon={getPlatformIcon}
            formatLocation={formatLocation}
            formatEngagementRate={formatEngagementRate}
            getCombinedAverageViews={getCombinedAverageViews}
            onProfileInsights={onProfileInsights}
            onProfilePanel={handleProfilePanel}
            onRowUpdate={onRowUpdate}
            onRemovingChange={onRemovingChange}
            removingInfluencers={removingInfluencers}
            selectedInfluencers={selectedInfluencers}
            onInfluencerRemoved={onInfluencerRemoved}
            onRefreshProfileData={onRefreshProfileData}
            isRefreshingProfileData={
              isRefreshingProfile && refreshingMemberId === member.id
            }
            shortlistedStatuses={shortlistedStatuses}
            onShortlistedStatusChange={onShortlistedStatusChange}
            updatingStatus={updatingStatus}
            statusesLoading={statusesLoading}
            localInfluencerUpdates={localInfluencerUpdates}
          />
        ))}
      </div>

      {/* Profile Panel (Fix #6 - no black background) */}
      <InfluencerProfilePanel
        member={selectedMemberForPanel}
        isOpen={profilePanelOpen}
        onClose={handleProfilePanelClose}
        getAdditionalMetric={getAdditionalMetric}
        formatLocation={formatLocation}
        formatEngagementRate={formatEngagementRate}
        getPlatformIcon={getPlatformIcon}
      />
    </>
  );
};

export default ShortlistedGridView;
