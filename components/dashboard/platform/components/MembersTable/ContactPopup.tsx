// src/components/dashboard/platform/components/MembersTable/ContactPopup.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, MessageCircle, Send } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { ContactType, CreateInfluencerContactResponse } from '@/types/influencer-contacts';
import { createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';

interface ContactPopupProps {
  member: AssignmentInfluencer | null;
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: (member: AssignmentInfluencer) => void;
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
  const [mounted, setMounted] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && member) {
      setContactType('whatsapp');
      setContactValue('');
    }
  }, [isOpen, member]);

  // Close on scroll (but allow interaction inside popup)
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (event: Event) => {
      if (popupRef.current && popupRef.current.contains(event.target as Node)) {
        return;
      }
      onClose();
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!member || !contactValue.trim()) return;

    setIsSubmitting(true);
    try {
      // Call the service which now returns the full response with campaign status updates
      const response: CreateInfluencerContactResponse = await createInfluencerContact({
        social_account_id: member.campaign_influencer.social_account.id,
        contact_type: contactType,
        contact_value: contactValue.trim(),
        is_primary: true,
        platform_specific: false,
        name: ''
      });
     
      if (response.success && response.data) {
        // Check if campaign influencer status was updated
        if (response.data.campaign_influencer) {
          // Create the updated member object with the new status
          const updatedMember: AssignmentInfluencer = {
            ...member,
            campaign_influencer: {
              ...member.campaign_influencer,
              
              // Update status information from response
              status_id: response.data.campaign_influencer.status_id || member.campaign_influencer.status_id,
              status: response.data.campaign_influencer.status ? {
                id: response.data.campaign_influencer.status.id,
                name: response.data.campaign_influencer.status.name
              } : member.campaign_influencer.status,
            },
            // Update timestamps
            updated_at: response.data.updated_at || new Date().toISOString()
          };
          
          // Pass the updated member with new status
          onContactAdded(updatedMember);
        } else {
          // No status change occurred, just pass the original member
          onContactAdded(member);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !member || !mounted) return null;

  const selectedType = contactTypes.find(type => type.value === contactType) || contactTypes[0];

  const popupContent = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[99998]" onClick={onClose} />
      
      {/* Popup - Use fixed positioning */}
      <div 
        ref={popupRef}
        className="fixed z-[99999] bg-white rounded-lg shadow-2xl border border-gray-200"
        style={{
          left: position.x,
          top: position.y,
          width: '320px',
          maxWidth: 'calc(100vw - 32px)'
        }}
      >
        <div className="flex items-center space-x-2 p-3 border-b border-gray-200">
          <img
            src={member.campaign_influencer.social_account.profile_pic_url || '/default-avatar.png'}
            alt={member.campaign_influencer.social_account.full_name}
            className="w-6 h-6 rounded-full"
          />
          <span className="font-medium text-gray-900 text-sm">
            {member.campaign_influencer.social_account.full_name}
          </span>
        </div>
        
        <div className="p-3 space-y-3">
          {/* Contact Type Selection - Single Row with Icons */}
          <div className="flex gap-1">
            {contactTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setContactType(type.value)}
                className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-md border transition-colors text-xs font-medium ${
                  contactType === type.value 
                    ? 'bg-teal-50 border-teal-200 text-teal-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title={type.label}
              >
                {type.icon}
                <span className="hidden sm:inline">{type.label}</span>
              </button>
            ))}
          </div>
          
          {/* Contact Value Input */}
          <div>
            <input
              type="text"
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={selectedType.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
              autoFocus
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-teal-600 hover:text-teal-700 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !contactValue.trim()}
              className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  <span>Adding...</span>
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(popupContent, document.body);
}