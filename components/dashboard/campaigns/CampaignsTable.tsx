// src/components/dashboard/campaigns/CampaignsTable.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Trash2, Edit3, RotateCcw } from 'react-feather';
import { Campaign } from '@/types/campaign';

interface CampaignsTableProps {
  campaigns: Campaign[];
  onDeleteCampaign?: (campaign: Campaign, e: React.MouseEvent) => void;
  onEditCampaign?: (campaign: Campaign, e: React.MouseEvent) => void;
  onRestoreCampaign?: (campaign: Campaign, e: React.MouseEvent) => void;
  showDeleteButtons?: boolean;
  showEditButtons?: boolean;
  showRestoreButtons?: boolean;
  isTrashView?: boolean;
}

type SortDirection = 'asc' | 'desc';
type SortKey = 'name' | 'brand_name' | 'status_id' | 'influencers' | 'updated_at';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export default function CampaignsTable({
  campaigns,
  onDeleteCampaign,
  onEditCampaign,
  onRestoreCampaign,
  showDeleteButtons = true,
  showEditButtons = true,
  showRestoreButtons = false,
  isTrashView = false,
}: CampaignsTableProps) {
  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

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
      month: 'short',
      day: 'numeric',
    });
  };

  const getTotalInfluencersCount = (campaign: Campaign) => {
    if (!campaign.campaign_lists || campaign.campaign_lists.length === 0) {
      return 0;
    }
    return campaign.campaign_lists.reduce((total, list) => {
      return total + (list.total_influencers_count || 0);
    }, 0);
  };

  // Sort handler
  const handleSort = (key: SortKey) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null; // Reset sorting
        }
      }
      return { key, direction: 'asc' };
    });
  };

  // Sorted campaigns
  const sortedCampaigns = useMemo(() => {
    if (!sortConfig) return campaigns;

    return [...campaigns].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'brand_name':
          aValue = a.brand_name?.toLowerCase() || '';
          bValue = b.brand_name?.toLowerCase() || '';
          break;
        case 'status_id':
          aValue = a.status_id?.toLowerCase() || 'draft';
          bValue = b.status_id?.toLowerCase() || 'draft';
          break;
        case 'influencers':
          aValue = getTotalInfluencersCount(a);
          bValue = getTotalInfluencersCount(b);
          break;
        case 'updated_at':
          aValue = new Date(isTrashView && a.deleted_at ? a.deleted_at : a.updated_at).getTime();
          bValue = new Date(isTrashView && b.deleted_at ? b.deleted_at : b.updated_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [campaigns, sortConfig, isTrashView]);

  // Sortable Header Component
  const SortableHeader = ({
    label,
    sortKey,
    className = '',
  }: {
    label: string;
    sortKey: SortKey;
    className?: string;
  }) => {
    const isActive = sortConfig?.key === sortKey;
    const direction = isActive ? sortConfig.direction : null;

    return (
      <th
        className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
        onClick={() => handleSort(sortKey)}
      >
        <div className={`flex items-center gap-1.5 ${className.includes('text-center') ? 'justify-center' : ''}`}>
          <span>{label}</span>
          <div className="flex flex-col">
            <svg
              className={`w-3 h-3 ${isActive && direction === 'asc' ? 'text-purple-600' : 'text-gray-300'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 5l-8 8h16z" />
            </svg>
            <svg
              className={`w-3 h-3 -mt-1 ${isActive && direction === 'desc' ? 'text-purple-600' : 'text-gray-300'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 19l-8-8h16z" />
            </svg>
          </div>
        </div>
      </th>
    );
  };

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <SortableHeader
                label="Campaign"
                sortKey="name"
                className="text-left"
              />
              <SortableHeader
                label="Brand"
                sortKey="brand_name"
                className="text-left"
              />
              <SortableHeader
                label="Status"
                sortKey="status_id"
                className="text-left"
              />
              <SortableHeader
                label="Influencers"
                sortKey="influencers"
                className="text-left"
              />
              <SortableHeader
                label={isTrashView ? 'Deleted' : 'Updated'}
                sortKey="updated_at"
                className="text-left"
              />
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedCampaigns.map((campaign, index) => (
              <tr
                key={campaign.id}
                className={`hover:bg-purple-50/50 transition-all duration-200 group ${isTrashView ? 'opacity-75' : ''}`}
                style={{
                  animation: `fadeSlideIn 0.3s ease-out ${index * 0.03}s forwards`,
                  opacity: 0,
                }}
              >
                <td className="px-6 py-4">
                  {isTrashView ? (
                    <span className="font-medium text-gray-800">{campaign.name}</span>
                  ) : (
                    <Link
                      href={`/campaigns/${campaign.id}`}
                      className="font-medium text-gray-800 hover:text-purple-600 transition-colors"
                    >
                      {campaign.name}
                    </Link>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-purple-600 font-medium">
                    {campaign.brand_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      isTrashView ? 'bg-red-100 text-red-800' : getStatusColor(campaign.status_id)
                    }`}
                  >
                    {isTrashView ? 'Deleted' : getStatusProgress(campaign.status_id)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-purple-200">
                    {getTotalInfluencersCount(campaign)} Influencers
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {isTrashView && campaign.deleted_at
                    ? formatDate(campaign.deleted_at)
                    : formatDate(campaign.updated_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* Continue Button - only for active campaigns */}
                    {!isTrashView && (
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="px-4 py-1.5 text-xs rounded-full transition-all duration-200 border font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      >
                        Continue
                      </Link>
                    )}

                    {/* Edit Button */}
                    {showEditButtons && onEditCampaign && !isTrashView && (
                      <button
                        onClick={(e) => onEditCampaign(campaign, e)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit campaign"
                      >
                        <Edit3 className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                      </button>
                    )}

                    {/* Delete Button */}
                    {showDeleteButtons && onDeleteCampaign && !isTrashView && (
                      <button
                        onClick={(e) => onDeleteCampaign(campaign, e)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </button>
                    )}

                    {/* Restore Button */}
                    {showRestoreButtons && onRestoreCampaign && isTrashView && (
                      <button
                        onClick={(e) => onRestoreCampaign(campaign, e)}
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        title="Restore campaign"
                      >
                        <RotateCcw className="h-4 w-4 text-green-500 hover:text-green-700" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}