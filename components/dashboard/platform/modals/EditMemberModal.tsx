// src/components/dashboard/platform/modals/EditMemberModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Save, AlertCircle, MessageSquare } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status, getStatusDisplayConfig } from '@/types/statuses';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface EditMemberModalProps {
  member: AssignmentInfluencer | null;
  isOpen: boolean;
  onClose: () => void;
  onMemberUpdate: (updatedMember: AssignmentInfluencer) => void;
  availableStatuses: Status[];
}

export default function EditMemberModal({
  member,
  isOpen,
  onClose,
  onMemberUpdate,
  availableStatuses
}: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    status_id: '',
    attempts_made: 0,
    last_contacted_at: '',
    next_contact_at: '',
    responded_at: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (member) {
      setFormData({
        status_id: member.status_id || '',
        attempts_made: member.attempts_made || 0,
        last_contacted_at: member.last_contacted_at ? 
          new Date(member.last_contacted_at).toISOString().slice(0, 16) : '',
        next_contact_at: member.next_contact_at ? 
          new Date(member.next_contact_at).toISOString().slice(0, 16) : '',
        responded_at: member.responded_at ? 
          new Date(member.responded_at).toISOString().slice(0, 16) : '',
        notes: member.notes || ''
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
      // In a real implementation, you would call an API here
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create updated member object
      const updatedMember: AssignmentInfluencer = {
        ...member,
        status_id: formData.status_id,
        attempts_made: formData.attempts_made,
        last_contacted_at: formData.last_contacted_at ? 
          new Date(formData.last_contacted_at).toISOString() : null,
        next_contact_at: formData.next_contact_at ? 
          new Date(formData.next_contact_at).toISOString() : null,
        responded_at: formData.responded_at ? 
          new Date(formData.responded_at).toISOString() : null,
        notes: formData.notes,
        updated_at: new Date().toISOString(),
        status: (() => {
          const foundStatus = availableStatuses.find(s => s.id === formData.status_id);
          if (foundStatus) {
            // Map Status to AssignmentInfluencerStatus shape
            return {
              id: foundStatus.id,
              name: foundStatus.name,
              model: (foundStatus as any).model ?? '', // fallback if not present
              description: (foundStatus as any).description ?? null // fallback if not present
            };
          }
          return member.status;
        })()
      };

      setSuccess(true);
      onMemberUpdate(updatedMember);
      
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating member:', error);
      setError(error instanceof Error ? error.message : 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }); 
  };
 
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Update Influencer Status</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage outreach progress for {member.campaign_influencer.social_account.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              ✅ Influencer updated successfully!
            </p>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Influencer Information</h4>
            <div className="flex items-center space-x-4">
              <img
                src={member.campaign_influencer.social_account.profile_pic_url}
                alt={member.campaign_influencer.social_account.full_name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-gray-900">
                  {member.campaign_influencer.social_account.full_name}
                </p>
                <p className="text-sm text-gray-500">
                  @{member.campaign_influencer.social_account.account_handle}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status_id"
                value={formData.status_id}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              >
                <option value="">Select Status</option>
                {availableStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Attempts
              </label>
              <input
                type="number"
                name="attempts_made"
                value={formData.attempts_made}
                onChange={handleInputChange}
                min="0"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Last Contacted
              </label>
              <input
                type="datetime-local"
                name="last_contacted_at"
                value={formData.last_contacted_at}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Next Contact
              </label>
              <input
                type="datetime-local"
                name="next_contact_at"
                value={formData.next_contact_at}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Responded At
              </label>
              <input
                type="datetime-local"
                name="responded_at"
                value={formData.responded_at}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              disabled={isSubmitting}
              placeholder="Add any notes about this influencer..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Updating...</span>
                </>
              ) : success ? (
                <>
                  <span>✅ Updated</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Influencer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}