// src/components/dashboard/campaigns/CampaignsHeader.tsx
'use client';

import Link from 'next/link';
import { Plus } from 'react-feather';

interface CampaignsHeaderProps {
  title?: string;
  createButtonText?: string;
  createButtonHref?: string;
  className?: string;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
}

export default function CampaignsHeader({
  title = "Your Campaigns",
  createButtonText = "Create Campaign",
  createButtonHref = "/campaigns/new",
  className = "",
  onCreateClick,
  showCreateButton = true
}: CampaignsHeaderProps) {
  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    }
  };

  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      
      {showCreateButton && (
        <div>
          {onCreateClick ? (
            <button
              onClick={handleCreateClick}
              className="px-5 py-2 text-sm rounded-full transition-all duration-200 border font-bold bg-[#E8DFF5] text-[#6B4C9A] border-[#A590D1] flex items-center hover:shadow-sm transform hover:scale-[1.01]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </button>
          ) : (
            <Link
              href={createButtonHref}
              className="px-5 py-2 text-sm rounded-full transition-all duration-200 border font-bold bg-[#E8DFF5] text-[#6B4C9A] border-[#A590D1] flex items-center hover:shadow-sm transform hover:scale-[1.01]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}