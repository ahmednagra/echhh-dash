// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ContactPopup.tsx

'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send } from 'react-feather';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { ContactType, CreateInfluencerContactResponse } from '@/types/influencer-contacts';
import { createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';

interface ContactPopupProps {
  member: CampaignListMember | null;
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: (member: CampaignListMember) => void;
  position: { x: number; y: number };
}

const contactTypes: { 
  value: ContactType; 
  label: string; 
  placeholder: string;
  icon: React.ReactNode;
}[] = [
  { 
    value: 'whatsapp', 
    label: 'WhatsApp', 
    placeholder: 'Enter WhatsApp number',
    icon: <MessageCircle className="w-4 h-4" />
  },
  { 
    value: 'email', 
    label: 'Email', 
    placeholder: 'Enter email address',
    icon: <Mail className="w-4 h-4" />
  },
  { 
    value: 'telegram', 
    label: 'Telegram', 
    placeholder: 'Enter Telegram username',
    icon: <Send className="w-4 h-4" />
  },
];

export default function ContactPopup({ 
  member, 
  isOpen, 
  onClose,
  onContactAdded,
  position
}: ContactPopupProps) {
  const [contactType, setContactType] = useState<ContactType>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      setContactType('whatsapp');
      setContactValue('');
    }
  }, [isOpen, member]);

  const handleSubmit = async () => {
    if (!member || !contactValue.trim() || !member.social_account) return;

    setIsSubmitting(true);
    try {
      console.log('Adding contact for member:', member.social_account.full_name);

      // 1. Call the backend API to create the contact
      const response: CreateInfluencerContactResponse = await createInfluencerContact({
        social_account_id: member.social_account.id,
        contact_type: contactType,
        contact_value: contactValue.trim(),
        is_primary: false,
        platform_specific: false,
        name: `${contactType.charAt(0).toUpperCase() + contactType.slice(1)} Contact`
      });
     
      if (response.success && response.data) {
        console.log('Contact created successfully:', response.data);

        // 2. OPTIMIZED: Create new contact object using the response data (no extra API call)
        const newContact = {
          id: response.data.id,
          contact_type: contactType,
          type: contactType, // For backward compatibility
          value: contactValue.trim(),
          contact_value: contactValue.trim(),
          is_primary: response.data.is_primary || false,
          platform_specific: response.data.platform_specific || false,
          name: response.data.name || `${contactType.charAt(0).toUpperCase() + contactType.slice(1)} Contact`
        };

        // 3. OPTIMIZED: Update member with existing contacts + new contact (no extra API fetch)
        const existingContacts = member.social_account?.contacts || [];
        const updatedMember: CampaignListMember = {
          ...member,
          social_account: {
            ...member.social_account,
            id: member.social_account.id!, // Type assertion
            contacts: [...existingContacts, newContact] // Simply add to existing
          },
          updated_at: response.data.updated_at || new Date().toISOString()
        };
        
        console.log('Calling onContactAdded with updated member:', {
          memberName: updatedMember.social_account?.full_name,
          contactCount: updatedMember.social_account?.contacts?.length,
          newContactType: contactType,
          newContactValue: contactValue.trim()
        });

        // 4. Pass the updated member back to parent for row-level update
        onContactAdded(updatedMember);

        // 5. Close popup
        onClose();
      } else {
        console.error('Contact creation failed:', response.error);
        alert(response.error || 'Failed to add contact. Please try again.');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Popup */}
      <div 
        className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
          width: '320px',
          maxWidth: 'calc(100vw - 32px)'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium text-sm">Add Contact</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-sm opacity-90">
            For {member.social_account?.full_name}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Contact Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {contactTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setContactType(type.value)}
                  className={`flex items-center justify-center gap-1 p-2 rounded-md border transition-colors text-sm font-medium ${
                    contactType === type.value 
                      ? 'bg-purple-100 border-purple-300 text-purple-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                  disabled={isSubmitting}
                >
                  {type.icon}
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Value Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {contactType === 'email' ? 'Email Address' : 
               contactType === 'whatsapp' ? 'WhatsApp Number' :
               'Telegram Username'}
            </label>
            <input
              type={contactType === 'email' ? 'email' : 'text'}
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={contactTypes.find(t => t.value === contactType)?.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !contactValue.trim()}
              className="px-4 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                'Add Contact'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}