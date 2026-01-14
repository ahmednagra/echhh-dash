// src/components/dashboard/campaigns/DeletedCampaignsView.tsx
'use client';

import { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, RefreshCw } from 'react-feather';
import { 
  Campaign, 
  restoreCampaign, 
  hardDeleteCampaign 
} from '@/services/campaign';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/dashboard/campaigns';

interface DeletedCampaignCardProps {
  campaign: Campaign;
  onRestore: (campaign: Campaign) => void;
  onPermanentDelete: (campaign: Campaign) => void;
}

function DeletedCampaignCard({ campaign, onRestore, onPermanentDelete }: DeletedCampaignCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200 opacity-75 hover:opacity-100 transition-opacity duration-200">
      {/* Campaign Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <Trash2 className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-xs text-red-600 font-medium">
              Deleted Campaign
            </p>
          </div>
          <p className="text-xs text-purple-600 font-medium mb-1">
            Brand: {campaign.brand_name}
          </p>
          <h3 className="font-bold text-base text-gray-800 leading-tight">
            {campaign.name}
          </h3>
        </div>
      </div>

      {/* Deletion Info */}
      <div className="mb-4">
        <p className="text-xs text-gray-500">
          Deleted: {campaign.deleted_at ? formatDate(campaign.deleted_at) : 'Unknown'}
        </p>
        <p className="text-xs text-gray-500">
          Original Date: {formatDate(campaign.updated_at)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onRestore(campaign)}
          className="flex-1 flex items-center justify-center bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Restore
        </button>
        
        <button
          onClick={() => onPermanentDelete(campaign)}
          className="flex-1 flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Delete Forever
        </button>
      </div>
    </div>
  );
}

interface DeletedCampaignsViewProps {
  // Data from parent (useCampaigns hook)
  deletedCampaigns: Campaign[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  onRefresh: () => void;
  onCampaignRestored?: (campaign: Campaign) => void;
  onCampaignDeleted?: (campaignId: string) => void;
  
  className?: string;
}

export default function DeletedCampaignsView({
  deletedCampaigns,
  isLoading,
  error,
  onRefresh,
  onCampaignRestored,
  onCampaignDeleted,
  className = ""
}: DeletedCampaignsViewProps) {
  const [actionLoading, setActionLoading] = useState<{
    campaignId: string;
    action: 'restore' | 'delete';
  } | null>(null);

  const handleRestore = async (campaign: Campaign) => {
    try {
      setActionLoading({ campaignId: campaign.id, action: 'restore' });
      
      await restoreCampaign(campaign.id);
      
      // Notify parent component
      if (onCampaignRestored) {
        onCampaignRestored(campaign);
      }
      
      console.log('Campaign restored successfully:', campaign.name);
    } catch (error) {
      console.error('Error restoring campaign:', error);
      // Error handling should be done by parent component through the hook
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async (campaign: Campaign) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${campaign.name}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      setActionLoading({ campaignId: campaign.id, action: 'delete' });
      
      await hardDeleteCampaign(campaign.id);
      
      // Notify parent component
      if (onCampaignDeleted) {
        onCampaignDeleted(campaign.id);
      }
      
      console.log('Campaign permanently deleted:', campaign.name);
    } catch (error) {
      console.error('Error permanently deleting campaign:', error);
      // Error handling should be done by parent component through the hook
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading deleted campaigns..." />;
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            {/* <Trash2 className="h-5 w-5 mr-2 text-red-500" /> */}
            Deleted Campaigns
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage campaigns that have been moved to trash
          </p>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          title="Error"
          onRetry={onRefresh}
          className="mb-6"
        />
      )}

      {/* Deleted Campaigns Grid */}
      {deletedCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deletedCampaigns.map((campaign) => (
            <div key={campaign.id} className="relative">
              <DeletedCampaignCard
                campaign={campaign}
                onRestore={handleRestore}
                onPermanentDelete={handlePermanentDelete}
              />
              
              {/* Action Loading Overlay */}
              {actionLoading?.campaignId === campaign.id && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-2xl flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent mb-2"></div>
                    <p className="text-xs text-gray-600">
                      {actionLoading.action === 'restore' ? 'Restoring...' : 'Deleting...'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Deleted Campaigns</h3>
          <p className="text-gray-600 text-sm">
            You don't have any campaigns in the trash. All your campaigns are active.
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">About Deleted Campaigns</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Restore:</strong> Move the campaign back to your active campaigns list</li>
              <li>• <strong>Delete Forever:</strong> Permanently remove the campaign (cannot be undone)</li>
              <li>• Deleted campaigns are not visible in your main campaigns view</li>
              <li>• Campaign data and settings are preserved until permanently deleted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}