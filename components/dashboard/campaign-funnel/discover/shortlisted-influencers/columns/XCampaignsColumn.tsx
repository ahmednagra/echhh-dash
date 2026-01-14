// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/XCampaignsColumn.tsx

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Briefcase } from 'lucide-react';
import { CampaignListMember, PastCampaign } from '@/types/campaign-influencers';
import XCampaignsModal from './XCampaignsModal';

interface XCampaignsColumnProps {
  member: CampaignListMember;
  pastCampaigns: PastCampaign[];
  readOnly?: boolean;
}

const XCampaignsColumn: React.FC<XCampaignsColumnProps> = ({
  member,
  pastCampaigns,
  readOnly = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const campaignCount = pastCampaigns?.length || 0;
  const hasCampaigns = campaignCount > 0;

  // Handle click to open modal
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (buttonRef.current) {
      // Get fresh bounding rect at click time
      const rect = buttonRef.current.getBoundingClientRect();
      setAnchorRect(rect);
    }
    setIsModalOpen(true);
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setAnchorRect(null);
  }, []);

  // Get badge color based on campaign count
  const getBadgeStyle = (): string => {
    if (campaignCount === 0) {
      return 'bg-gray-100 text-gray-500 border-gray-200';
    }
    if (campaignCount === 1) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (campaignCount <= 3) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    // 4+ campaigns
    return 'bg-green-50 text-green-700 border-green-200';
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={!hasCampaigns}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          border transition-all duration-200
          ${getBadgeStyle()}
          ${hasCampaigns 
            ? 'cursor-pointer hover:shadow-md hover:scale-105 active:scale-95' 
            : 'cursor-default'
          }
        `}
        title={hasCampaigns ? `View ${campaignCount} past campaign${campaignCount !== 1 ? 's' : ''}` : 'No past campaigns'}
      >
        <Briefcase className="w-3 h-3" />
        <span>{campaignCount}</span>
      </button>

      {/* Modal */}
      <XCampaignsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        influencerName={member.social_account?.full_name || 'Unknown'}
        pastCampaigns={pastCampaigns}
        anchorRect={anchorRect}
      />
    </>
  );
};

export default XCampaignsColumn;