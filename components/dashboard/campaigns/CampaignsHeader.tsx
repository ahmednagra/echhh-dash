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
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl flex items-center hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </button>
          ) : (
            <Link
              href={createButtonHref}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl flex items-center hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg text-sm"
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