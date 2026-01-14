// src/components/dashboard/campaigns/CampaignsGrid.tsx
'use client';

import { Campaign } from '@/types/campaign';
import CampaignCard from './CampaignCard';

interface CampaignsGridProps {
  campaigns: Campaign[];
  onDeleteCampaign?: (campaign: Campaign, e: React.MouseEvent) => void;
  onEditCampaign?: (campaign: Campaign, e: React.MouseEvent) => void;
  onRestoreCampaign?: (campaign: Campaign, e: React.MouseEvent) => void;
  showDeleteButtons?: boolean;
  showEditButtons?: boolean;
  showRestoreButtons?: boolean;
  continueButtonText?: string;
  className?: string;
  gridClassName?: string;
  isTrashView?: boolean;
}

export default function CampaignsGrid({
  campaigns,
  onDeleteCampaign,
  onEditCampaign,
  onRestoreCampaign,
  showDeleteButtons = true,
  showEditButtons = true,
  showRestoreButtons = false,
  continueButtonText = "Continue",
  className = "",
  gridClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
  isTrashView = false
}: CampaignsGridProps) {
  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className={gridClassName}>
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onDelete={onDeleteCampaign}
            onEdit={onEditCampaign}
            onRestore={onRestoreCampaign}
            showDeleteButton={showDeleteButtons && !isTrashView}
            showEditButton={showEditButtons && !isTrashView}
            showRestoreButton={showRestoreButtons || isTrashView}
            continueButtonText={continueButtonText}
            isDeleted={isTrashView}
          />
        ))}
      </div>
    </div>
  );
}