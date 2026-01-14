// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ViewContactsModal.tsx

'use client';

import React, { useState } from 'react';
import { X, Plus, Edit3, Trash2, Check, Mail, Phone, MessageCircle, Send, ExternalLink } from 'react-feather';
import { BsWhatsapp, BsTelephone, BsInstagram, BsTiktok, BsYoutube, BsLinkedin, BsTwitter, BsFacebook, BsThreads } from 'react-icons/bs';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';
import { toast } from 'react-hot-toast';

// Contact types for the modal
type ContactType = 'email' | 'phone' | 'whatsapp' | 'telegram';
type SocialType = 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'facebook' | 'threads';

// Contact interface - id is now optional to fix type errors
interface Contact {
  id?: string;
  contact_type?: string;
  type?: string;
  value?: string;
  contact_value?: string;
  is_primary?: boolean;
  name?: string;
  platform_specific?: boolean;
}

interface ViewContactsModalProps {
  member: CampaignListMember;
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onContactUpdate: (contactId: string, updatedContact: Contact) => void;
  onContactDelete: (contactId: string) => void;
  onContactAdded?: () => void;
  onRowUpdate?: (updatedMember: CampaignListMember) => void;
}

// Contact type options
const contactTypes: { value: ContactType; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp', icon: <BsWhatsapp className="w-4 h-4" />, placeholder: 'Enter WhatsApp number' },
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, placeholder: 'Enter email address' },
  { value: 'phone', label: 'Phone', icon: <BsTelephone className="w-4 h-4" />, placeholder: 'Enter phone number' },
  { value: 'telegram', label: 'Telegram', icon: <Send className="w-4 h-4" />, placeholder: 'Enter Telegram username' },
];

// Social type options
const socialTypes: { value: SocialType; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: <BsInstagram className="w-4 h-4" />, placeholder: 'Enter Instagram URL or @username' },
  { value: 'tiktok', label: 'TikTok', icon: <BsTiktok className="w-4 h-4" />, placeholder: 'Enter TikTok URL or @username' },
  { value: 'youtube', label: 'YouTube', icon: <BsYoutube className="w-4 h-4" />, placeholder: 'Enter YouTube channel URL' },
  { value: 'linkedin', label: 'LinkedIn', icon: <BsLinkedin className="w-4 h-4" />, placeholder: 'Enter LinkedIn profile URL' },
  { value: 'twitter', label: 'Twitter/X', icon: <BsTwitter className="w-4 h-4" />, placeholder: 'Enter Twitter URL or @username' },
  { value: 'facebook', label: 'Facebook', icon: <BsFacebook className="w-4 h-4" />, placeholder: 'Enter Facebook profile URL' },
  { value: 'threads', label: 'Threads', icon: <BsThreads className="w-4 h-4" />, placeholder: 'Enter Threads URL or @username' },
];

// CONTACT_TYPES and SOCIAL_TYPES for filtering
const CONTACT_TYPE_VALUES = ['email', 'phone', 'whatsapp', 'telegram'];
const SOCIAL_TYPE_VALUES = ['instagram', 'tiktok', 'youtube', 'linkedin', 'twitter', 'facebook', 'threads'];

// Get badge color for contact type
const getContactTypeBadgeColor = (contactType: string): string => {
  switch (contactType?.toLowerCase()) {
    case 'email':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'whatsapp':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'telegram':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'phone':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Get badge color for social type
const getSocialTypeBadgeColor = (socialType: string): string => {
  switch (socialType?.toLowerCase()) {
    case 'instagram':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'tiktok':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'youtube':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'linkedin':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'twitter':
      return 'bg-sky-100 text-sky-800 border-sky-200';
    case 'facebook':
      return 'bg-blue-100 text-blue-600 border-blue-200';
    case 'threads':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Get icon for contact type
const getContactIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'email':
      return <Mail className="w-4 h-4" />;
    case 'phone':
      return <BsTelephone className="w-4 h-4" />;
    case 'whatsapp':
      return <BsWhatsapp className="w-4 h-4" />;
    case 'telegram':
      return <Send className="w-4 h-4" />;
    default:
      return <MessageCircle className="w-4 h-4" />;
  }
};

// Get icon for social type
const getSocialIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'instagram':
      return <BsInstagram className="w-4 h-4" />;
    case 'tiktok':
      return <BsTiktok className="w-4 h-4" />;
    case 'youtube':
      return <BsYoutube className="w-4 h-4" />;
    case 'linkedin':
      return <BsLinkedin className="w-4 h-4" />;
    case 'twitter':
      return <BsTwitter className="w-4 h-4" />;
    case 'facebook':
      return <BsFacebook className="w-4 h-4" />;
    case 'threads':
      return <BsThreads className="w-4 h-4" />;
    default:
      return <ExternalLink className="w-4 h-4" />;
  }
};

// UTILITY: Emit custom event to notify all ContactColumn components
const emitContactsChangedEvent = () => {
  console.log('Emitting contactsChanged event...');
  const event = new CustomEvent('contactsChanged');
  window.dispatchEvent(event);
};

export default function ViewContactsModal({
  member,
  isOpen,
  onClose,
  contacts,
  onContactUpdate,
  onContactDelete,
  onContactAdded,
  onRowUpdate
}: ViewContactsModalProps) {
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Add new contact form state
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newContactType, setNewContactType] = useState<ContactType>('whatsapp');
  const [newContactValue, setNewContactValue] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Add new social form state
  const [showAddSocialForm, setShowAddSocialForm] = useState(false);
  const [newSocialType, setNewSocialType] = useState<SocialType>('instagram');
  const [newSocialValue, setNewSocialValue] = useState('');
  const [isSubmittingSocial, setIsSubmittingSocial] = useState(false);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'contacts' | 'social'>('contacts');

  if (!isOpen || !member) return null;

  // Get all contacts from member
  const allContacts = member.social_account?.contacts || [];

  // Filter contacts vs social accounts
  const contactItems = allContacts.filter((contact: any) => {
    const type = (contact.contact_type || contact.type || contact.name || '').toLowerCase();
    return CONTACT_TYPE_VALUES.includes(type);
  });

  const socialItems = allContacts.filter((contact: any) => {
    const type = (contact.contact_type || contact.type || contact.name || '').toLowerCase();
    return SOCIAL_TYPE_VALUES.includes(type);
  });

  const handleEditStart = (contact: Contact) => {
    if (!contact.id) return;
    setEditingContact(contact.id);
    setEditValue(contact.value || contact.contact_value || '');
  };

  const handleEditSave = async (contact: Contact) => {
    if (!contact.id) return;
    if (editValue.trim() && editValue !== (contact.value || contact.contact_value)) {
      const updatedContact = {
        ...contact,
        value: editValue.trim(),
        contact_value: editValue.trim()
      };
      await onContactUpdate(contact.id, updatedContact);
      emitContactsChangedEvent();
    }
    setEditingContact(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingContact(null);
    setEditValue('');
  };

  const handleDelete = async (contactId: string | undefined) => {
    if (!contactId) return;
    if (window.confirm('Are you sure you want to delete this?')) {
      await onContactDelete(contactId);
      emitContactsChangedEvent();
    }
  };

  // Handle adding new contact
  const handleAddContact = async () => {
    if (!member?.social_account?.id || !newContactValue.trim()) return;

    setIsSubmittingContact(true);
    try {
      const response = await createInfluencerContact({
        social_account_id: member.social_account.id,
        contact_type: newContactType,
        contact_value: newContactValue.trim(),
        is_primary: false,
        platform_specific: false,
        name: ''
      });

      if (response.success && response.data) {
        const newContact = {
          id: response.data.id,
          contact_type: newContactType,
          value: newContactValue.trim(),
          type: newContactType,
          is_primary: false,
          platform_specific: false,
          name: ''
        };

        if (onRowUpdate) {
          const updatedContacts = [...(member.social_account?.contacts || []), newContact];
          const updatedMember = {
            ...member,
            social_account: {
              ...member.social_account,
              contacts: updatedContacts
            }
          };
          onRowUpdate(updatedMember as CampaignListMember);
        }

        setNewContactValue('');
        setNewContactType('whatsapp');
        setShowAddContactForm(false);
        
        if (onContactAdded) {
          onContactAdded();
        }

        emitContactsChangedEvent();
        toast.success('Contact added successfully');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      toast.error('Failed to add contact. Please try again.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  // Handle adding new social account
  const handleAddSocial = async () => {
    if (!member?.social_account?.id || !newSocialValue.trim()) return;

    setIsSubmittingSocial(true);
    try {
      const response = await createInfluencerContact({
        social_account_id: member.social_account.id,
        contact_type: 'other',
        contact_value: newSocialValue.trim(),
        name: newSocialType,
        is_primary: false,
        platform_specific: true,
      });

      if (response.success && response.data) {
        const newSocial = {
          id: response.data.id,
          contact_type: newSocialType,
          type: newSocialType,
          value: newSocialValue.trim(),
          is_primary: false,
          platform_specific: true,
          name: newSocialType,
        };

        if (onRowUpdate) {
          const updatedContacts = [...(member.social_account?.contacts || []), newSocial];
          const updatedMember = {
            ...member,
            social_account: {
              ...member.social_account,
              contacts: updatedContacts
            }
          };
          onRowUpdate(updatedMember as CampaignListMember);
        }

        setNewSocialValue('');
        setNewSocialType('instagram');
        setShowAddSocialForm(false);
        
        if (onContactAdded) {
          onContactAdded();
        }

        emitContactsChangedEvent();
        toast.success(`${newSocialType} link added successfully`);
      }
    } catch (error) {
      console.error('Error adding social link:', error);
      toast.error('Failed to add social link. Please try again.');
    } finally {
      setIsSubmittingSocial(false);
    }
  };

  // Get contact link
  const getContactLink = (type: string, value: string): string | null => {
    switch (type?.toLowerCase()) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value}`;
      case 'whatsapp':
        return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
      case 'telegram':
        return `https://t.me/${value.startsWith('@') ? value.slice(1) : value}`;
      default:
        return null;
    }
  };

  // Get social link
  const getSocialLink = (type: string, value: string): string => {
    let url = value;
    if (!url.startsWith('http')) {
      switch (type?.toLowerCase()) {
        case 'instagram':
          url = `https://www.instagram.com/${url.replace('@', '')}`;
          break;
        case 'tiktok':
          url = `https://www.tiktok.com/@${url.replace('@', '')}`;
          break;
        case 'youtube':
          url = url.includes('youtube.com') ? url : `https://www.youtube.com/@${url}`;
          break;
        case 'linkedin':
          url = url.includes('linkedin.com') ? url : `https://www.linkedin.com/in/${url}`;
          break;
        case 'twitter':
          url = `https://twitter.com/${url.replace('@', '')}`;
          break;
        case 'facebook':
          url = url.includes('facebook.com') ? url : `https://www.facebook.com/${url}`;
          break;
        case 'threads':
          url = `https://www.threads.net/@${url.replace('@', '')}`;
          break;
        default:
          url = `https://${url}`;
      }
    }
    return url;
  };

  const selectedContactType = contactTypes.find(type => type.value === newContactType) || contactTypes[0];
  const selectedSocialType = socialTypes.find(type => type.value === newSocialType) || socialTypes[0];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full max-h-[85vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center space-x-3">
              <img
                src={member.social_account?.profile_pic_url || '/default-avatar.png'}
                alt={member.social_account?.full_name || ''}
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.social_account?.full_name}
                </h3>
                <p className="text-sm text-gray-500">
                  @{member.social_account?.account_handle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'contacts'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contact Details ({contactItems.length})
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'social'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Social Accounts ({socialItems.length})
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {/* Contacts Tab */}
            {activeTab === 'contacts' && (
              <div>
                {/* Add Contact Button */}
                {!showAddContactForm && (
                  <button
                    onClick={() => setShowAddContactForm(true)}
                    className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Contact
                  </button>
                )}

                {/* Add Contact Form */}
                {showAddContactForm && (
                  <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-sm font-medium text-purple-900">Add New Contact</h5>
                      <button
                        onClick={() => {
                          setShowAddContactForm(false);
                          setNewContactValue('');
                          setNewContactType('whatsapp');
                        }}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Contact Type Selection */}
                      <div className="flex gap-1">
                        {contactTypes.map(type => (
                          <button
                            key={type.value}
                            onClick={() => setNewContactType(type.value)}
                            className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-md border transition-colors text-xs font-medium ${
                              newContactType === type.value 
                                ? 'bg-purple-600 text-white border-purple-600' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {type.icon}
                            <span className="hidden sm:inline">{type.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Contact Value Input */}
                      <input
                        type={newContactType === 'email' ? 'email' : 'text'}
                        value={newContactValue}
                        onChange={(e) => setNewContactValue(e.target.value)}
                        placeholder={selectedContactType.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />

                      {/* Submit Button */}
                      <button
                        onClick={handleAddContact}
                        disabled={isSubmittingContact || !newContactValue.trim()}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isSubmittingContact ? 'Adding...' : 'Add Contact'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Contact List */}
                {contactItems.length === 0 && !showAddContactForm ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No contacts added yet</p>
                    <p className="text-sm mt-1">Click "Add Contact" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contactItems.map((contact: any, index: number) => {
                      const type = contact.contact_type || contact.type || '';
                      const value = contact.value || contact.contact_value || '';
                      const contactId = contact.id || `temp-${index}`;
                      const isEditing = editingContact === contactId;

                      return (
                        <div
                          key={contactId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-full ${getContactTypeBadgeColor(type)}`}>
                              {getContactIcon(type)}
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                autoFocus
                              />
                            ) : (
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
                                <p className="text-xs text-gray-500 capitalize">{type}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleEditSave(contact)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                {getContactLink(type, value) && (
                                  <button
                                    onClick={() => window.open(getContactLink(type, value)!, '_blank')}
                                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                    title="Open"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditStart(contact)}
                                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(contact.id)}
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Social Accounts Tab */}
            {activeTab === 'social' && (
              <div>
                {/* Add Social Button */}
                {!showAddSocialForm && (
                  <button
                    onClick={() => setShowAddSocialForm(true)}
                    className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Social Account
                  </button>
                )}

                {/* Add Social Form */}
                {showAddSocialForm && (
                  <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-sm font-medium text-purple-900">Add Social Account</h5>
                      <button
                        onClick={() => {
                          setShowAddSocialForm(false);
                          setNewSocialValue('');
                          setNewSocialType('instagram');
                        }}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Social Type Selection */}
                      <div className="grid grid-cols-4 gap-1">
                        {socialTypes.map(type => (
                          <button
                            key={type.value}
                            onClick={() => setNewSocialType(type.value)}
                            className={`flex flex-col items-center justify-center p-2 rounded-md border transition-colors ${
                              newSocialType === type.value 
                                ? 'bg-purple-600 text-white border-purple-600' 
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            {type.icon}
                            <span className="text-[10px] mt-1">{type.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Social Value Input */}
                      <input
                        type="text"
                        value={newSocialValue}
                        onChange={(e) => setNewSocialValue(e.target.value)}
                        placeholder={selectedSocialType.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />

                      {/* Submit Button */}
                      <button
                        onClick={handleAddSocial}
                        disabled={isSubmittingSocial || !newSocialValue.trim()}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isSubmittingSocial ? 'Adding...' : 'Add Social Account'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Social List */}
                {socialItems.length === 0 && !showAddSocialForm ? (
                  <div className="text-center py-8 text-gray-500">
                    <ExternalLink className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No social accounts added yet</p>
                    <p className="text-sm mt-1">Click "Add Social Account" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {socialItems.map((social: any, index: number) => {
                      const type = social.contact_type || social.type || social.name || '';
                      const value = social.value || social.contact_value || '';
                      const socialId = social.id || `temp-social-${index}`;
                      const isEditing = editingContact === socialId;

                      return (
                        <div
                          key={socialId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-full ${getSocialTypeBadgeColor(type)}`}>
                              {getSocialIcon(type)}
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                autoFocus
                              />
                            ) : (
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
                                <p className="text-xs text-gray-500 capitalize">{type}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleEditSave(social)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={handleEditCancel}
                                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => window.open(getSocialLink(type, value), '_blank')}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                  title="Open"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditStart(social)}
                                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(social.id)}
                                  className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}