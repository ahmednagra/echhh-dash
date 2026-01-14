// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/ActionColumn.tsx

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MoreVertical, Eye, Users, Trash2, RotateCcw, RefreshCw } from 'react-feather';
import { CampaignListMember, removeInfluencerFromList } from '@/services/campaign/campaign-list.service';
import { restoreCampaignInfluencer } from '@/services/campaign-influencers/campaign-influencers.client';
import ViewContactsModal from '../ViewContactsModal';
import toast from 'react-hot-toast';

// Contact interface matching ViewContactsModal and campaign-influencers API
interface Contact {
  id: string;
  contact_type: string;
  value: string;
  contact_value?: string;
  is_primary: boolean;
  platform_specific: boolean;
  name?: string;
}

interface ActionColumnProps {
  member: CampaignListMember;
  isRemoving: boolean;
  onRemovingChange: (removing: string[]) => void;
  removingInfluencers: string[];
  selectedInfluencers: string[];
  onSelectionChange: (selected: string[]) => void;
  onInfluencerRemoved?: () => void;
  onContactsChanged?: () => void;
  onRowUpdate?: (updatedMember: CampaignListMember) => void;
  // New props for refresh profile data functionality
  onRefreshProfileData?: (member: CampaignListMember) => void;
  isRefreshingProfileData?: boolean;
}

const ActionColumn: React.FC<ActionColumnProps> = ({
  member,
  isRemoving,
  onRemovingChange,
  removingInfluencers,
  selectedInfluencers,
  onSelectionChange,
  onInfluencerRemoved,
  onContactsChanged,
  onRowUpdate,
  onRefreshProfileData,
  isRefreshingProfileData = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down');
  const [showViewContactsModal, setShowViewContactsModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check if influencer is deleted
  const isDeleted = useMemo(() => {
    return member.is_deleted === true || member.deleted_at !== null;
  }, [member.is_deleted, member.deleted_at]);

  // Get contacts from existing campaign-influencers API data
  const contacts = useMemo(() => {
    const socialAccountContacts = member.social_account?.contacts || [];
    
    // Map to ViewContactsModal's expected Contact interface using campaign-influencers API data
    const formattedContacts: Contact[] = socialAccountContacts.map((contact, index) => ({
      id: contact.id || `contact_${Date.now()}_${index}`,
      contact_type: contact.contact_type || contact.type || 'email',
      value: contact.value || '',
      contact_value: contact.value || '',
      is_primary: contact.is_primary || false,
      platform_specific: contact.platform_specific || false,
      name: contact.name || ''
    }));
    
    return formattedContacts;
  }, [member.social_account?.contacts]);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const dropdownHeight = 180; // Increased for new menu item
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('up');
      } else {
        setDropdownPosition('down');
      }
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
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

  // Handle view profile
  const handleViewProfile = () => {
    const accountUrl = member.social_account?.account_url;
    if (accountUrl) {
      window.open(accountUrl, '_blank', 'noopener,noreferrer');
    }
    setIsOpen(false);
  };

  // Handle view contacts - uses existing campaign-influencers API data
  const handleViewContacts = async () => {
    setIsOpen(false);
    setShowViewContactsModal(true);
  };

  // Handle refresh profile data
  const handleRefreshProfileData = () => {
    setIsOpen(false);
    if (onRefreshProfileData) {
      onRefreshProfileData(member);
    }
  };

  // Handle remove influencer
  const handleRemoveInfluencer = async () => {
    if (!member.id) return;

    setIsOpen(false);
    
    try {
      onRemovingChange([...removingInfluencers, member.id]);
      await removeInfluencerFromList(member.id);
      
      if (selectedInfluencers.includes(member.id)) {
        onSelectionChange(selectedInfluencers.filter(id => id !== member.id));
      }

      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
    } catch (error) {
      console.error('Error removing influencer:', error);
      onRemovingChange(removingInfluencers.filter(id => id !== member.id));
    }
  };

  // Handle restore influencer
  const handleRestoreInfluencer = async () => {
    if (!member.id) return;

    setIsOpen(false);
    setIsRestoring(true);
    
    try {
      await restoreCampaignInfluencer(member.id);
      
      toast.success('Influencer restored successfully');

      if (onInfluencerRemoved) {
        onInfluencerRemoved();
      }
    } catch (error) {
      console.error('Error restoring influencer:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to restore influencer');
    } finally {
      setIsRestoring(false);
    }
  };

  // ROW-LEVEL UPDATE: Handle contact update with optimistic UI update
  const handleContactUpdate = (contactId: string, updatedContact: Contact) => {
    (async () => {
      try {
        if (!member.social_account) return;

        // 1. Optimistic UI update - update row data immediately
        const updatedContacts = (member.social_account.contacts || []).map(contact => {
          const isMatchingContact = contact.id === contactId || 
                                  (contact.value === updatedContact.value && contact.type === updatedContact.contact_type);
          
          return isMatchingContact
            ? { 
                ...contact, 
                value: updatedContact.value || updatedContact.contact_value || contact.value,
                name: updatedContact.name || contact.name || '',
                is_primary: updatedContact.is_primary,
                platform_specific: updatedContact.platform_specific
              }
            : contact;
        });

        const updatedMember: CampaignListMember = {
          ...member,
          social_account: {
            ...member.social_account,
            id: member.social_account.id,
            contacts: updatedContacts
          }
        };

        // 2. Update row immediately for instant UI feedback
        if (onRowUpdate) {
          onRowUpdate(updatedMember);
        }

        // 3. Update backend
        const influencerContactsService = await import('@/services/influencer-contacts/influencer-contacts.service');
        
        if ('updateInfluencerContact' in influencerContactsService) {
          const { updateInfluencerContact } = influencerContactsService as { updateInfluencerContact: (id: string, data: any) => Promise<void> };
          
          await updateInfluencerContact(contactId, {
            contact_value: updatedContact.contact_value || updatedContact.value || '',
            name: updatedContact.name || '',
            is_primary: updatedContact.is_primary,
            platform_specific: updatedContact.platform_specific
          });

          console.log('Contact updated successfully in backend');
        } else {
          console.warn('Update function not available');
        }
      } catch (error) {
        console.error('Error updating contact:', error);
        
        // 4. Revert optimistic update on error
        if (onRowUpdate) {
          onRowUpdate(member);
        }
        
        toast.error('Failed to update contact. Please try again.');
      }
    })();
  };

  // ROW-LEVEL UPDATE: Handle deleting contact
  const handleContactDelete = (contactId: string) => {
    (async () => {
      try {
        if (!member.social_account) return;

        // 1. Optimistic UI update - remove contact from row immediately
        const updatedContacts = (member.social_account.contacts || []).filter(
          contact => contact.id !== contactId
        );

        const updatedMember: CampaignListMember = {
          ...member,
          social_account: {
            ...member.social_account,
            id: member.social_account.id,
            contacts: updatedContacts
          }
        };

        // 2. Update row immediately
        if (onRowUpdate) {
          onRowUpdate(updatedMember);
        }

        // 3. Delete from backend
        const influencerContactsService = await import('@/services/influencer-contacts/influencer-contacts.service');
        
        if ('deleteInfluencerContact' in influencerContactsService) {
          const { deleteInfluencerContact } = influencerContactsService as { deleteInfluencerContact: (id: string) => Promise<void> };
          
          await deleteInfluencerContact(contactId);
          console.log('Contact deleted successfully');
        } else {
          console.warn('Delete functionality is not available in the backend yet.');
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
        
        // 4. Revert optimistic update on error
        if (onRowUpdate) {
          onRowUpdate(member);
        }
        
        toast.error('Failed to delete contact. Please try again.');
      }
    })();
  };

  // ROW-LEVEL UPDATE: Handle adding new contact
  const handleContactAdded = async () => {
    console.log('Contact added through modal');
  };

  // Determine if we're in a loading state
  const isLoading = isRemoving || isRestoring || isRefreshingProfileData;

  // Build actions array
  const actions = [
    {
      label: 'View Profile',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewProfile,
      disabled: isLoading
    },
    {
      label: 'View Contacts',
      icon: <Users className="w-4 h-4" />,
      onClick: handleViewContacts,
      disabled: isLoading
    },
    // Refresh Profile Data action - only show if callback is provided
    ...(onRefreshProfileData ? [{
      label: isRefreshingProfileData ? 'Refreshing...' : 'Refresh Profile Data',
      icon: <RefreshCw className={`w-4 h-4 ${isRefreshingProfileData ? 'animate-spin' : ''}`} />,
      onClick: handleRefreshProfileData,
      disabled: isLoading,
      className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
    }] : []),
    // Conditionally show Restore or Remove based on deleted status
    isDeleted
      ? {
          label: 'Restore',
          icon: <RotateCcw className="w-4 h-4" />,
          onClick: handleRestoreInfluencer,
          disabled: isLoading,
          className: 'text-green-600 hover:text-green-700 hover:bg-green-50'
        }
      : {
          label: 'Remove',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: handleRemoveInfluencer,
          disabled: isLoading,
          className: 'text-red-600 hover:text-red-700 hover:bg-red-50'
        }
  ];

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`p-2 rounded-lg transition-colors ${
            isLoading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-100'
          }`}
          title={isLoading ? 'Processing...' : 'More actions'}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
          ) : (
            <MoreVertical className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isOpen && !isLoading && (
          <div 
            className={`absolute ${
              dropdownPosition === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
            } right-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20`}
          >
            <div className="py-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center ${
                    action.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : action.className || 'text-gray-700'
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

      {/* View Contacts Modal */}
      <ViewContactsModal
        member={member}
        isOpen={showViewContactsModal}
        onClose={() => setShowViewContactsModal(false)}
        contacts={contacts}
        onContactUpdate={handleContactUpdate}
        onContactDelete={handleContactDelete}
        onContactAdded={handleContactAdded}
      />
    </>
  );
};

export default ActionColumn;