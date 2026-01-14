// src/app/(dashboard)/@company/campaigns/page.tsx
'use client';

import { useState } from 'react';
import { Campaign, DeleteType } from '@/services/campaign';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useCampaigns } from '@/hooks/useCampaigns';
import {
  CampaignsLayout,
  CampaignsContent,
  CampaignsHero,
  CampaignsSearchBar,
  CampaignsGrid,
  CampaignsEmptyState,
  ErrorMessage
} from '@/components/dashboard/campaigns';
import CampaignsHeaderWithTrash from '@/components/dashboard/campaigns/CampaignsHeaderWithTrash';
import DeleteConfirmationModal from '@/components/dashboard/campaigns/DeleteConfirmationModal';

interface DeleteModalState {
  isOpen: boolean;
  campaign: Campaign | null;
}

function CampaignsPage() {
  // Use the enhanced campaigns hook - DO NOT include deleted campaigns on load
  const {
    filteredCampaigns,
    deletedCampaigns,
    isLoading,
    isDeleting,
    isLoadingDeleted,
    error,
    deleteError,
    deletedError,
    searchQuery,
    setSearchQuery,
    isTrashView,
    setIsTrashView,
    handleCampaignAction,
    loadDeletedCampaigns,
    refreshAll,
    clearError,
    hasSearchResults,
    deletedCount,
    activeCount
  } = useCampaigns({ 
    includeDeleted: false // Don't auto-load deleted campaigns
  });

  // Local state for delete modal
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    campaign: null
  });

  // Handle delete campaign click (for active campaigns)
  const handleDeleteClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      campaign
    });
  };

  // Handle edit campaign click (for active campaigns)
  const handleEditClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit campaign:', campaign.name);
    // TODO: Navigate to edit page or open edit modal
    // For now, just log the action
  };

  // Handle restore campaign click (for deleted campaigns)
  const handleRestoreClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Directly restore without confirmation modal
    handleCampaignAction(campaign.id, 'restore');
  };

  // Confirm campaign action (only for delete actions now)
  const handleActionConfirm = async (actionType: DeleteType) => {
    if (deleteModal.campaign) {
      const success = await handleCampaignAction(deleteModal.campaign.id, actionType);
      
      if (success) {
        setDeleteModal({
          isOpen: false,
          campaign: null
        });
        
        // Show success message based on action
        const actionMessages = {
          soft: 'Campaign moved to trash',
          hard: 'Campaign permanently deleted',
          restore: 'Campaign restored successfully'
        };
        
        console.log(actionMessages[actionType]);
      }
      // If action fails, modal stays open and error is handled by the hook
    }
  };

  // Cancel campaign action
  const handleActionCancel = () => {
    setDeleteModal({
      isOpen: false,
      campaign: null
    });
  };

  // Handle search functionality - placeholder implementations
  const handleFilterClick = () => {
    console.log('Filter clicked');
    // TODO: Implement filter functionality
  };

  const handleMenuClick = () => {
    console.log('Menu clicked');
    // TODO: Implement menu functionality
  };

  const handleSearchClick = () => {
    console.log('Search clicked');
    // TODO: Implement advanced search functionality
  };

  // Handle retry on error
  const handleRetry = () => {
    clearError();
    refreshAll();
  };

  // Handle toggle between main view and trash view
  const handleToggleTrashView = (showTrash: boolean) => {
    console.log('🔄 Campaigns Page: Toggling trash view to:', showTrash);
    setIsTrashView(showTrash);
    setSearchQuery(''); // Clear search when switching views
  };

  // Show loading spinner while data is being fetched
  if (isLoading && !isTrashView) {
    return <LoadingSpinner message="Loading campaigns..." />;
  }

  if (isLoadingDeleted && isTrashView) {
    return <LoadingSpinner message="Loading deleted campaigns..." />;
  }

  // Filter deleted campaigns based on search query (same logic as active campaigns)
  const filteredDeletedCampaigns = deletedCampaigns.filter(campaign => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      campaign.name?.toLowerCase().includes(query) ||
      campaign.brand_name?.toLowerCase().includes(query) ||
      campaign.status_id?.toLowerCase().includes(query)
    );
  });

  // Determine which campaigns to show based on current view
  const currentCampaigns = isTrashView ? filteredDeletedCampaigns : filteredCampaigns;
  const currentError = isTrashView ? deletedError : error;
  const currentIsLoading = isTrashView ? isLoadingDeleted : isLoading;

  // Determine if we have search results
  const currentHasResults = isTrashView 
    ? (searchQuery.trim() ? filteredDeletedCampaigns.length > 0 : deletedCampaigns.length > 0)
    : hasSearchResults && filteredCampaigns.length > 0;

  return (
    <CampaignsLayout>
      {/* Hero Section - always show */}
      <CampaignsHero />

      <CampaignsContent>
        {/* Page Header with Trash Toggle */}
        <CampaignsHeaderWithTrash
          isTrashView={isTrashView}
          onToggleTrashView={handleToggleTrashView}
          deletedCount={deletedCount}
        />

        {/* Search and Filter Bar */}
        <CampaignsSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder={isTrashView ? "Search deleted campaigns..." : "Search campaigns..."}
          onFilterClick={handleFilterClick}
          onMenuClick={handleMenuClick}
          onSearchClick={handleSearchClick}
        />

        {/* Error Messages */}
        {/* {currentError && (
          <ErrorMessage
            message={currentError}
            title={`Error Loading ${isTrashView ? 'Deleted ' : ''}Campaigns`}
            onRetry={handleRetry}
            className="mb-6"
          />
        )} */}

        {deleteError && (
          <ErrorMessage
            message={deleteError}
            title="Error Processing Campaign"
            onRetry={() => clearError()}
            retryButtonText="Dismiss"
            className="mb-6"
          />
        )}

        {/* Main Content - Same Grid Layout for Both Views */}
        {currentHasResults && currentCampaigns.length > 0 ? (
          <CampaignsGrid
            campaigns={currentCampaigns}
            onDeleteCampaign={handleDeleteClick}
            onEditCampaign={handleEditClick}
            onRestoreCampaign={handleRestoreClick}
            showDeleteButtons={!isTrashView}
            showEditButtons={!isTrashView}
            showRestoreButtons={isTrashView}
            continueButtonText="Continue"
            isTrashView={isTrashView}
          />
        ) : (
          <CampaignsEmptyState
            searchQuery={searchQuery}
            showActionButton={!searchQuery && !isTrashView} // Only show create button when not searching and not in trash view
            title={
              isTrashView 
                ? (searchQuery ? "No deleted campaigns found" : "No deleted campaigns") 
                : (searchQuery ? "No campaigns found" : "No campaigns yet")
            }
            description={
              isTrashView
                ? (searchQuery 
                    ? "No deleted campaigns match your search criteria. Try adjusting your search terms."
                    : "You don't have any campaigns in the trash. All your campaigns are active."
                  )
                : (searchQuery 
                    ? "No campaigns match your search criteria. Try adjusting your search terms."
                    : "You haven't created any campaigns yet. Get started by creating your first campaign."
                  )
            }
          />
        )}

        {/* Delete Confirmation Modal - Only for delete actions */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          itemName={deleteModal.campaign?.name || ''}
          onConfirm={handleActionConfirm}
          onCancel={handleActionCancel}
          isLoading={isDeleting}
          isDeleted={false} // This modal is only for active campaigns now
          showDeleteOptions={true}
        />
      </CampaignsContent>
    </CampaignsLayout>
  );
}

// Protected Route Wrapper
export default function Campaigns() {
  return (
    <ProtectedRoute>
      <CampaignsPage />
    </ProtectedRoute>
  );
}