// src/components/dashboard/platform/modals/ViewContactsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Phone, MessageSquare, Star, RefreshCw, Plus, ExternalLink, CheckCircle } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { InfluencerContact, ContactType } from '@/types/influencer-contacts';
import { getInfluencerContacts } from '@/services/influencer-contacts/influencer-contacts.service';
import InlineSpinner from '@/components/ui/InlineSpinner';

interface ViewContactsModalProps {
  member: AssignmentInfluencer | null;
  isOpen: boolean;
  onClose: () => void;
  onAddContact: () => void;
}

const getContactTypeIcon = (type: ContactType) => {
  switch (type) {
    case 'email':
      return <Mail className="w-4 h-4" />;
    case 'phone':
    case 'whatsapp':
      return <Phone className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
};

const getContactTypeColor = (type: ContactType): string => {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-800';
    case 'phone':
      return 'bg-green-100 text-green-800';
    case 'whatsapp':
      return 'bg-green-100 text-green-800';
    case 'telegram':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatContactValue = (type: ContactType, value: string): string => {
  switch (type) {
    case 'telegram':
      return value.startsWith('@') ? value : `@${value}`;
    default:
      return value;
  }
};

const isClickableContact = (type: ContactType): boolean => {
  return ['email', 'phone', 'whatsapp', 'linkedin', 'facebook', 'youtube', 'instagram', 'twitter', 'tiktok'].includes(type);
};

const getContactLink = (type: ContactType, value: string): string => {
  switch (type) {
    case 'email':
      return `mailto:${value}`;
    case 'phone':
      return `tel:${value}`;
    case 'whatsapp':
      return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
    default:
      return '#';
  }
};

export default function ViewContactsModal({
  member,
  isOpen,
  onClose,
  onAddContact
}: ViewContactsModalProps) {
  const [contacts, setContacts] = useState<InfluencerContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && member) {
      fetchContacts();
    }
  }, [isOpen, member]);

  const fetchContacts = async () => {
    if (!member) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedContacts = await getInfluencerContacts(member.campaign_influencer.social_account.id);
      setContacts(fetchedContacts);
      
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactClick = (contact: InfluencerContact) => {
    if (isClickableContact(contact.contact_type)) {
      const link = getContactLink(contact.contact_type, contact.contact_value);
      if (link !== '#') {
        window.open(link, '_blank');
      }
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
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={fetchContacts}
              disabled={isLoading}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh contacts"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Influencer Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
            <img
              src={member.campaign_influencer.social_account.profile_pic_url}
              alt={member.campaign_influencer.social_account.full_name}
              className="w-10 h-10 rounded-full object-cover"
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

          {/* Header with Add Button */}
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-900">Contact Methods</h4>
            {contacts.length !== 0 && (
              <button
                onClick={() => {
                  onClose(); // Close view modal first
                  onAddContact(); // Then open add modal
                }}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <InlineSpinner />
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <Mail className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-red-800 font-medium">Failed to load contacts</p>
              <p className="text-xs text-red-600 mt-1 mb-3">{error}</p>
              <button
                onClick={fetchContacts}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Try Again
              </button>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-6">
              <Mail className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No contacts found</p>
              <p className="text-xs text-gray-400 mb-3">
                Add contact information to reach this influencer
              </p>
              <button
                onClick={() => {
                  onClose(); // Close view modal first
                  onAddContact(); // Then open add modal
                }}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              >
                Add First Contact
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`p-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors ${
                    isClickableContact(contact.contact_type) ? 'cursor-pointer hover:bg-gray-50' : ''
                  }`}
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div className={`p-1 rounded-full ${getContactTypeColor(contact.contact_type)}`}>
                        {getContactTypeIcon(contact.contact_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {formatContactValue(contact.contact_type, contact.contact_value)}
                          </p>
                          {contact.is_primary && (
                            <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                          )}
                          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getContactTypeColor(contact.contact_type)}`}>
                            {contact.contact_type}
                          </span>
                          {contact.name && (
                            <span className="text-xs text-gray-500 truncate">{contact.name}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {new Date(contact.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}