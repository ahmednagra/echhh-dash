// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/AddUserButton.tsx
'use client';

import { useState } from 'react';
import { UserPlus, X } from 'react-feather';
import { Campaign } from '@/types/campaign';
import { Platform } from '@/types/platform';
import { addInfluencerToCampaign } from '@/services/campaign-influencers/campaign-influencers.client';
import { AddToCampaignRequest } from '@/types/campaign-influencers';
import { toast } from 'react-hot-toast';

interface AddUserButtonProps {
  campaignData?: Campaign | null;
  selectedPlatform?: Platform | null;
  onInfluencerAdded?: () => void;
  className?: string;
}

const AddUserButton: React.FC<AddUserButtonProps> = ({
  campaignData,
  selectedPlatform,
  onInfluencerAdded,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setUsername('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUsername('');
    setIsAdding(false);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove @ symbol if user types it
    const value = e.target.value.replace(/^@/, '');
    setUsername(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddToList(e as any);
    }
  };

  const handleAddToList = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    if (
      !campaignData ||
      !campaignData.campaign_lists ||
      !campaignData.campaign_lists.length
    ) {
      toast.error('No campaign list found');
      return;
    }

    if (!selectedPlatform || !selectedPlatform.id) {
      toast.error('Please select a platform first');
      return;
    }

    setIsAdding(true);

    try {
      const request: AddToCampaignRequest = {
        username: username.trim(),
        platform: selectedPlatform.name.toLowerCase() as
          | 'instagram'
          | 'tiktok'
          | 'youtube',
        campaign_list_id: campaignData.campaign_lists[0].id,
        platform_id: selectedPlatform.id,
        preferred_provider: 'nanoinfluencer',
        added_through: 'search',
      };

      console.log('Adding influencer manually with username:', request);

      const response = await addInfluencerToCampaign(request);

      if (response.success) {
        toast.success(`Successfully added @${username}`);

        // Refresh the shortlisted members list
        onInfluencerAdded && onInfluencerAdded();

        // Close modal
        handleCloseModal();
      } else {
        console.error('Failed to add influencer:', response.message);
        toast.error(
          `Failed to add @${username}: ${response.message || 'Unknown error'}`,
        );
      }
    } catch (error) {
      console.error('Error adding influencer:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Error adding @${username}: ${errorMessage}`);
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = !selectedPlatform;

  return (
    <>
      {/* Add User Button - Updated styling to match project buttons */}
      <button
        onClick={handleOpenModal}
        disabled={isDisabled}
        className={`flex items-center px-3 py-2 bg-gray-50 border border-blue-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-60 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
        title={
          isDisabled
            ? 'Please select a platform first'
            : 'Add influencer manually'
        }
      >
        <UserPlus className="w-4 h-4 mr-1 text-gray-500" />
        <span className="hidden sm:inline">Add</span>
      </button>

      {/* Modal Overlay - Transparent background to show page content */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 relative border border-gray-200"
            onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
          >
            {/* Modal Header - Matching reference design */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Influencer
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                disabled={isAdding}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleAddToList} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Add Influencer Username{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                      @
                    </span>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={handleUsernameChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter username"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-sm"
                      disabled={isAdding}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the username without the @ symbol
                  </p>
                </div>

                {/* Platform Info - Matching reference style */}
                {selectedPlatform && (
                  <div className="p-3 bg-pink-50 rounded-md border border-pink-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <img
                        src={selectedPlatform.logo_url}
                        alt={selectedPlatform.name}
                        className="w-4 h-4 object-contain rounded-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iMiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K';
                        }}
                      />
                      <span className="font-medium">
                        Platform: {selectedPlatform.name}
                      </span>
                    </div>
                  </div>
                )}

                {/* Modal Footer - Updated button styling to match reference */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
                    disabled={isAdding}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!username.trim() || isAdding}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-medium text-sm shadow-md hover:shadow-lg"
                  >
                    {isAdding ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add to List
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddUserButton;
