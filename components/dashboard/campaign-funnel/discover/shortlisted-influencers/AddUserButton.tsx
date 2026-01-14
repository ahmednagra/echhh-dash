// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/AddUserButton.tsx
'use client';

import { useState } from 'react';
import ReactDOM from 'react-dom';
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
  iconOnly?: boolean;
}

const AddUserButton: React.FC<AddUserButtonProps> = ({
  campaignData,
  selectedPlatform,
  onInfluencerAdded,
  className = '',
  iconOnly = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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

      const response = await addInfluencerToCampaign(request);

      if (response.success) {
        toast.success(`Successfully added @${username}`);
        onInfluencerAdded && onInfluencerAdded();
        handleCloseModal();
      } else {
        toast.error(
          `Failed to add @${username}: ${response.message || 'Unknown error'}`,
        );
      }
    } catch (error) {
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
      {/* Add User Button */}
      {iconOnly ? (
        <div className="relative">
          <button
            onClick={handleOpenModal}
            disabled={isDisabled}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={`p-2.5 rounded-xl border transition-all duration-200 ${
              isDisabled
                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10'
            } ${className}`}
            title={isDisabled ? 'Select platform first' : 'Add Influencer'}
          >
            <UserPlus className="w-4 h-4" />
          </button>
          {/* Tooltip */}
          {showTooltip && !isModalOpen && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
              <div className="px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg whitespace-nowrap shadow-lg">
                {isDisabled ? 'Select platform' : 'Add Influencer'}
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          )}
        </div>
      ) : (
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
      )}

{/* Modal with Portal - Renders at body level */}
      {isModalOpen && typeof document !== 'undefined' && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Influencer
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-lg"
                disabled={isAdding}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              <form onSubmit={handleAddToList} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={handleUsernameChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter username"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                      disabled={isAdding}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Enter the username without the @ symbol
                  </p>
                </div>

                {/* Platform Info */}
                {selectedPlatform && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <img
                        src={selectedPlatform.logo_url}
                        alt={selectedPlatform.name}
                        className="w-5 h-5 object-contain rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <span>
                        Platform: <span className="font-medium">{selectedPlatform.name}</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Modal Footer */}
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                    disabled={isAdding}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!username.trim() || isAdding}
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center font-medium text-sm shadow-md hover:shadow-lg"
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
        </div>,
        document.body
      )}
    </>
  );
};

export default AddUserButton;