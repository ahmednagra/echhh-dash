// src/components/dashboard/campaigns/CampaignCard.tsx
'use client';

import Link from 'next/link';
import { Trash2, Edit3, RotateCcw } from 'react-feather';
import { Campaign } from '@/types/campaign';  

interface CampaignCardProps {
  campaign: Campaign;
  onDelete?: (campaign: Campaign, e: React.MouseEvent) => void;
  onEdit?: (campaign: Campaign, e: React.MouseEvent) => void;
  onRestore?: (campaign: Campaign, e: React.MouseEvent) => void;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
  showRestoreButton?: boolean;
  continueButtonText?: string;
  className?: string;
  isDeleted?: boolean;
}

export default function CampaignCard({
  campaign,
  onDelete,
  onEdit,
  onRestore,
  showDeleteButton = true,
  showEditButton = true,
  showRestoreButton = false,
  continueButtonText = "Continue",
  className = "",
  isDeleted = false
}: CampaignCardProps) {
  const getStatusColor = (statusId: string) => {
    switch (statusId?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusProgress = (statusId: string) => {
    switch (statusId?.toLowerCase()) {
      case 'active':
        return '80% Completed';
      case 'completed':
        return '100% Completed';
      case 'draft':
        return 'Draft';
      case 'paused':
        return 'Paused';
      default:
        return 'Draft';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate total influencers count from campaign_lists
  const getTotalInfluencersCount = () => {
    if (!campaign.campaign_lists || campaign.campaign_lists.length === 0) {
      return 0;
    }
    return campaign.campaign_lists.reduce((total, list) => {
      return total + (list.total_influencers_count || 0);
    }, 0);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(campaign, e);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(campaign, e);
    }
  };

  const handleRestoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRestore) {
      onRestore(campaign, e);
    }
  };

  const cardClassName = `block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-5 border border-gray-100 hover:border-purple-200 ${
    isDeleted ? 'opacity-75 cursor-default' : ''
  }`;

  const totalInfluencers = getTotalInfluencersCount();

  const cardContent = (
    <>
      {/* Campaign Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="text-xs text-purple-600 font-medium mb-1">
            Brand: {campaign.brand_name}
          </p>
          <h3 className="font-bold text-base text-gray-800 leading-tight">
            {campaign.name}
          </h3>
        </div>

        {/* Action Buttons - NO INFLUENCER COUNT HERE */}
        <div className="flex space-x-1">
          {/* Edit Button - only for active campaigns */}
          {showEditButton && onEdit && !isDeleted && (
            <button
              onClick={handleEditClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-blue-50 rounded-lg"
              title="Edit campaign"
            >
              <Edit3 className="h-4 w-4 text-blue-500 hover:text-blue-700" />
            </button>
          )}

          {/* Delete Button - only for active campaigns */}
          {showDeleteButton && onDelete && !isDeleted && (
            <button
              onClick={handleDeleteClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-red-50 rounded-lg"
              title="Delete campaign"
            >
              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
            </button>
          )}

          {/* Restore Button - only for deleted campaigns */}
          {showRestoreButton && onRestore && isDeleted && (
            <button
              onClick={handleRestoreClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-green-50 rounded-lg"
              title="Restore campaign"
            >
              <RotateCcw className="h-4 w-4 text-green-500 hover:text-green-700" />
            </button>
          )}
        </div>
      </div>

      {/* Campaign Date */}
      <p className="text-xs text-gray-500 mb-4">
        {isDeleted && campaign.deleted_at 
          ? `Deleted: ${formatDate(campaign.deleted_at)}`
          : formatDate(campaign.updated_at)
        }
      </p>

      {/* Bottom Section - INFLUENCER COUNT ONLY HERE */}
      <div className="flex justify-between items-center">
        {/* Status and Influencer Count */}
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isDeleted 
              ? 'bg-red-100 text-red-800' 
              : getStatusColor(campaign.status_id)
          }`}>
            {isDeleted ? 'Deleted' : getStatusProgress(campaign.status_id)}
          </span>
          
          {/* Influencer Count Badge - ONLY LOCATION */}
          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium border border-purple-200">
            {totalInfluencers} {totalInfluencers === 1 ? 'Influencer' : 'Influencers'}
          </span>
        </div>

        {/* Continue Button - only for active campaigns */}
        {!isDeleted && (
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
            {continueButtonText}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className={`relative group ${className}`}>
      {isDeleted ? (
        <div className={cardClassName}>
          {cardContent}
        </div>
      ) : (
        <Link href={`/campaigns/${campaign.id}`} className={cardClassName}>
          {cardContent}
        </Link>
      )}
    </div>
  );
}