// src/components/dashboard/platform/components/MembersTable/ActionsDropdown.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Eye, Users, Archive, Check } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { InfluencerType } from './types';
import { ReassignmentReason } from '@/types/reassignment-reasons';
import ReassignmentPopup from './ReassignmentPopup';
import { bulkReassignInfluencer } from '@/services/bulk-reassignments';
import { toast } from 'react-hot-toast';

interface ActionsDropdownProps {
  member: AssignmentInfluencer;
  onViewMember: (member: AssignmentInfluencer) => void;
  onViewContacts: (member: AssignmentInfluencer) => void;
  onMemberUpdate?: (updatedMember: AssignmentInfluencer) => void;
  currentType: InfluencerType;
  disabled?: boolean;
  reassignmentReasons: ReassignmentReason[];
  loadingReasons?: boolean;
}

export default function ActionsDropdown({ 
  member, 
  onViewMember,
  onViewContacts,
  onMemberUpdate,
  currentType,
  disabled = false,
  reassignmentReasons = [],
  loadingReasons = false
}: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down');
  const [showReassignmentPopup, setShowReassignmentPopup] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const dropdownHeight = 120;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('up');
      } else {
        setDropdownPosition('down');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleArchiveClick = () => {
    setIsOpen(false);
    setShowReassignmentPopup(true);
  };

  const handleReassignmentConfirm = async (reasonId: string, notes: string) => {
    try {
      setIsReassigning(true);
      
      // Step 1: Mark member as being processed (disable the row)
      if (onMemberUpdate) {
        const processingMember: AssignmentInfluencer = {
          ...member,
          isBeingReassigned: true // Add processing flag
        };
        onMemberUpdate(processingMember);
      }
      
      const reassignmentData = {
        assigned_influencer_id: member.id,
        reassignment_reason_id: reasonId,
        prefer_existing_assignments: true,
        notes: notes
      };

      // Step 2: Make API call
      const result = await bulkReassignInfluencer(reassignmentData);

      if (result.success) {
        toast.success(`${influencerName} successfully reassigned to a new agent`);
        
        // Step 3: Mark as successfully archived
        if (onMemberUpdate) {
          const archivedMember: AssignmentInfluencer = {
            ...member,
            type: 'archived' as const,
            archived_at: new Date().toISOString(),
            isBeingReassigned: false,
            isArchived: true // Flag to show it's been archived
          };
          onMemberUpdate(archivedMember);
        }
        
        setShowReassignmentPopup(false);
      } else {
        throw new Error('Reassignment failed');
      }
    } catch (error) {
      console.error('Error reassigning influencer:', error);
      
      // Step 4: Re-enable the row on error
      if (onMemberUpdate) {
        const reenabledMember: AssignmentInfluencer = {
          ...member,
          isBeingReassigned: false
        };
        onMemberUpdate(reenabledMember);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to reassign influencer';
      toast.error(errorMessage);
    } finally {
      setIsReassigning(false);
    }
  };

  // Check if member is disabled
  const isDisabled = disabled || member.isBeingReassigned || member.isArchived;

  const actions = [
    {
      label: 'View Profile',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => {
        onViewMember(member);
        setIsOpen(false);
      },
      disabled: isDisabled
    },
    {
      label: 'View Contacts',
      icon: <Users className="w-4 h-4" />,
      onClick: () => {
        onViewContacts(member);
        setIsOpen(false);
      },
      disabled: isDisabled
    },
    {
      label: member.isArchived ? 'Archived' : 'Archive',
      icon: member.isArchived ? 
        <Check className="w-4 h-4" /> : 
        <Archive className="w-4 h-4" />,
      onClick: handleArchiveClick,
      disabled: isDisabled || 
                currentType === 'archived' || 
                currentType === 'completed'
    }
  ];

  const influencerName = member.campaign_influencer?.social_account?.full_name || 'Influencer';
  const influencerImage = member.campaign_influencer?.social_account?.profile_pic_url;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => !isDisabled && setIsOpen(!isOpen)}
          disabled={isDisabled || isReassigning}
          className={`p-2 rounded-lg transition-colors ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
          title={isDisabled ? 'Processing...' : 'More actions'}
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>

        {isOpen && !isDisabled && (
          <div 
            className={`absolute ${dropdownPosition === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'} right-0 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-20`}
          >
            <div className="py-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center ${
                    action.disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'
                  }`}
                >
                  <span className="mr-3 text-gray-400">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isDisabled && (
        <ReassignmentPopup
          isOpen={showReassignmentPopup}
          onClose={() => setShowReassignmentPopup(false)}
          onConfirm={handleReassignmentConfirm}
          influencerName={influencerName}
          influencerImage={influencerImage}
          isLoading={isReassigning}
          reasons={reassignmentReasons}
          loadingReasons={loadingReasons}
        />
      )}
    </>
  );
}