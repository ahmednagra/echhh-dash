// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ContactDetailsPopup.tsx

'use client';

import { useState, useEffect } from 'react';
import { Mail, MessageCircle, Send, X, Edit2, Save, ExternalLink } from 'react-feather';
import { updateInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';

interface ContactDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    id: string;
    contact_type: string;
    contact_value: string;
    value?: string; // For backward compatibility
    name?: string;
    is_primary?: boolean;
  } | null;
  position: { x: number; y: number };
  onUpdate?: (contactId: string, updatedValue: string) => Promise<void>;
}

const getContactIcon = (contactType: string) => {
  switch (contactType?.toLowerCase()) {
    case 'email':
      return <Mail className="w-5 h-5" />;
    case 'whatsapp':
      return <MessageCircle className="w-5 h-5" />;
    case 'telegram':
      return <Send className="w-5 h-5" />;
    default:
      return <MessageCircle className="w-5 h-5" />;
  }
};

const getContactTypeColor = (contactType: string) => {
  switch (contactType?.toLowerCase()) {
    case 'email':
      return 'from-blue-500 to-blue-600';
    case 'whatsapp':
      return 'from-green-500 to-green-600';
    case 'telegram':
      return 'from-purple-500 to-purple-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

const getContactLink = (contactType: string, value: string) => {
  switch (contactType?.toLowerCase()) {
    case 'email':
      return `mailto:${value}`;
    case 'whatsapp':
      return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
    case 'telegram':
      return `https://t.me/${value.replace('@', '')}`;
    default:
      return null;
  }
};

export default function ContactDetailsPopup({
  isOpen,
  onClose,
  contact,
  position,
  onUpdate
}: ContactDetailsPopupProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (contact) {
      setEditValue(contact.contact_value || contact.value || '');
      setIsEditing(false);
    }
  }, [contact]);

  if (!isOpen || !contact) return null;

  const contactValue = contact.contact_value || contact.value || '';
  const contactLink = getContactLink(contact.contact_type, contactValue);

  const handleSave = async () => {
    if (editValue.trim() === contactValue) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Update via the backend service
      console.log('Updating contact in backend:', contact.id, editValue.trim());
      await updateInfluencerContact(contact.id, {
        contact_value: editValue.trim(),
        name: contact.name || '',
        is_primary: contact.is_primary || false,
        platform_specific: false
      });

      // 2. Call the parent's onUpdate for immediate UI feedback (if provided)
      if (onUpdate) {
        await onUpdate(contact.id, editValue.trim());
      }

      console.log('Contact update completed successfully');
      setIsEditing(false);

      // NOTE: We're not refreshing all contacts here to avoid extra API calls
      // The parent table will be refreshed when user navigates or performs other actions
      // This provides immediate UI feedback while keeping API calls minimal
      
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditValue(contactValue);
    setIsEditing(false);
  };

  const handleOpenContact = () => {
    if (contactLink) {
      window.open(contactLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Popup */}
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
          width: '280px',
          maxWidth: 'calc(100vw - 32px)'
        }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${getContactTypeColor(contact.contact_type)} p-3 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getContactIcon(contact.contact_type)}
              <span className="font-medium text-sm capitalize">
                {contact.contact_type} Contact
              </span>
              {contact.is_primary && (
                <span className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                  Primary
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Contact Value */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Contact Details
            </label>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder={`Enter ${contact.contact_type} details`}
                  autoFocus
                  disabled={isUpdating}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating || !editValue.trim()}
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 break-all">
                    {contactValue}
                  </p>
                  {contact.name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Name: {contact.name}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-2 p-1 text-gray-400 hover:text-purple-600 transition-colors"
                  title="Edit contact"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          {!isEditing && contactLink && (
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={handleOpenContact}
                className={`w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r ${getContactTypeColor(contact.contact_type)} text-white rounded-md hover:opacity-90 transition-opacity text-sm`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open {contact.contact_type}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}