// src/components/dashboard/platform/modals/EditCampaignStatusModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, MessageSquare, ExternalLink, CheckCircle } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
import InlineSpinner from '@/components/ui/InlineSpinner';

interface EditCampaignStatusModalProps {
  member: AssignmentInfluencer | null;
  isOpen: boolean;
  onClose: () => void;
  onMemberUpdate: (updatedMember: AssignmentInfluencer) => void;
  availableStatuses: Status[];
}

export default function EditCampaignStatusModal({
  member,
  isOpen,
  onClose,
  onMemberUpdate,
  availableStatuses
}: EditCampaignStatusModalProps) {
  const [formData, setFormData] = useState({
    status_id: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        status_id: member.campaign_influencer.status?.id || '',
        notes: member.campaign_influencer.notes || ''
      });
      setError(null);
      setSuccess(false);
    }
  }, [member]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // For now, we'll just simulate the update since we don't have the actual API call
      // In a real implementation, you would call an API here to update campaign_influencer status
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create updated member object
      const updatedMember: AssignmentInfluencer = {
        ...member,
        campaign_influencer: {
          ...member.campaign_influencer,
          notes: formData.notes,
          status: (() => {
            const foundStatus = availableStatuses.find(s => s.id === formData.status_id);
            if (foundStatus) {
              return {
                id: foundStatus.id,
                name: foundStatus.name,
                model: 'campaign_influencer',
              };
            }
            return member.campaign_influencer.status;
          })()
        },
        updated_at: new Date().toISOString()
      };

      setSuccess(true);
      onMemberUpdate(updatedMember);
      
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating campaign status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update campaign status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
 
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Update Campaign Status</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mx-4 mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center text-green-800 text-sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Campaign status updated successfully!
            </div>
          </div>
        )}

        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-800 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Influencer Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={member.campaign_influencer.social_account.profile_pic_url}
              alt={member.campaign_influencer.social_account.full_name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {member.campaign_influencer.social_account.full_name}
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <a
                  href={member.campaign_influencer.social_account.account_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-600 flex items-center"
                >
                  @{member.campaign_influencer.social_account.account_handle}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                {member.campaign_influencer.social_account.is_verified && (
                  <CheckCircle className="w-3 h-3 ml-1 text-blue-500" />
                )}
              </div>
              <div className="text-xs text-gray-400">
                {formatNumber(member.campaign_influencer.social_account.followers_count)} followers
              </div>
            </div>
          </div>

          {/* Campaign Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Status
            </label>
            <select
              name="status_id"
              value={formData.status_id}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
            >
              <option value="">Select Status</option>
              {availableStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              disabled={isSubmitting}
              placeholder="Add notes about this influencer's campaign status..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="px-3 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <InlineSpinner size="sm" />
                  <span className="ml-2">Updating...</span>
                </>
              ) : success ? (
                <span>Updated</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Update Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}