// =====================================
// src/components/dashboard/platform/components/MembersTable/EditableAttempts.tsx
// =====================================

'use client';

import { useState } from 'react';
import { Mail, Edit2 } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { recordContactAttempt } from '@/services/assignments/assignments.client';
import InlineSpinner from '@/components/ui/InlineSpinner';

interface EditableAttemptsProps {
  member: AssignmentInfluencer;
  onUpdate?: (updatedMember: AssignmentInfluencer) => void;
}

export default function EditableAttempts({ 
  member, 
  onUpdate 
}: EditableAttemptsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const canMakeAttempt = () => {
    if (!member.next_contact_at) return true;
    const now = new Date().getTime();
    const nextContact = new Date(member.next_contact_at).getTime();
    return now >= nextContact;
  };

  const handleRecordAttempt = async () => {
    if (!canMakeAttempt()) {
      alert('Cannot make contact attempt yet. Please wait for the next contact time.');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await recordContactAttempt(member.id);
      
      if (response.success && response.assigned_influencer) {
        const updatedMember: AssignmentInfluencer = {
          ...member,
          id: response.assigned_influencer.id,
          status_id: response.assigned_influencer.status_id,
          attempts_made: response.assigned_influencer.attempts_made,
          last_contacted_at: response.assigned_influencer.last_contacted_at,
          next_contact_at: response.assigned_influencer.next_contact_at,
          responded_at: response.assigned_influencer.responded_at,
          updated_at: response.assigned_influencer.updated_at,
          status: {
            ...member.status,
            ...response.assigned_influencer.status
          },
          campaign_influencer: {
            ...member.campaign_influencer,
            ...response.assigned_influencer.campaign_influencer,
            total_contact_attempts: response.assigned_influencer.campaign_influencer?.total_contact_attempts || member.campaign_influencer.total_contact_attempts,
            social_account: response.assigned_influencer.campaign_influencer?.social_account || member.campaign_influencer.social_account
          }
        };
        
        onUpdate?.(updatedMember);
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Failed to record contact attempt');
      }
    } catch (error) {
      console.error('Error recording contact attempt:', error);
      alert('Failed to record contact attempt. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const isDisabled = !canMakeAttempt();

  if (isEditing) {
    return (
      <div className="space-y-1">
        <div className="text-xs text-blue-600">Record attempt?</div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleRecordAttempt}
            disabled={isUpdating}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isUpdating ? 'Recording...' : 'Yes'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          {isUpdating && <InlineSpinner size="sm" />}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => !isDisabled && setIsEditing(true)}
      disabled={isDisabled}
      className={`flex items-center text-xs px-1 py-0.5 rounded transition-colors ${
        isDisabled 
          ? 'text-gray-400 cursor-not-allowed opacity-60' 
          : 'hover:text-blue-600 hover:bg-blue-50'
      }`}
      title={isDisabled ? 'Cannot make contact attempt until next contact time' : 'Click to record contact attempt'}
    >
      <Mail className="w-3 h-3 mr-1" />
      <span>Attempts: {member.attempts_made}</span>
      {!isDisabled && <Edit2 className="w-3 h-3 ml-1 opacity-50" />}
    </button>
  );
}