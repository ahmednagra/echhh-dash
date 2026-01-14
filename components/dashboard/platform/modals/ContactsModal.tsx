// src/components/dashboard/platform/modals/ContactsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Phone, MessageSquare, Star, RefreshCw, Plus, ExternalLink, CheckCircle, Save, AlertCircle, ChevronDown, ChevronUp } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { InfluencerContact, ContactType, CreateInfluencerContactRequest } from '@/types/influencer-contacts';
import { getInfluencerContacts, createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';
import InlineSpinner from '@/components/ui/InlineSpinner';

interface ContactsModalProps {
  member: AssignmentInfluencer | null;
  isOpen: boolean;
  onClose: () => void;
  onContactAdded?: () => void;
}

const CONTACT_TYPES: { value: ContactType; label: string; icon: React.ReactNode }[] = [
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'telegram', label: 'Telegram', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <MessageSquare className="w-4 h-4" /> },
];

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

export default function ContactsModal({
  member,
  isOpen,
  onClose,
  onContactAdded
}: ContactsModalProps) {
  // Contacts list state
  const [contacts, setContacts] = useState<InfluencerContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [isContactsCollapsed, setIsContactsCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    contact_type: 'email' as ContactType,
    contact_value: '',
    name: '',
    is_primary: false,
    platform_specific: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      fetchContacts();
      resetForm();
    }
  }, [isOpen, member]);

  const fetchContacts = async () => {
    if (!member) return;

    try {
      setIsLoadingContacts(true);
      setContactsError(null);
      
      const fetchedContacts = await getInfluencerContacts(member.campaign_influencer.social_account.id);
      setContacts(fetchedContacts);
      
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setContactsError(error instanceof Error ? error.message : 'Failed to load contacts');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const resetForm = () => {
    setFormData({
      contact_type: 'email',
      contact_value: '',
      name: '',
      is_primary: false,
      platform_specific: false
    });
    setFormError(null);
    setFormSuccess(false);
    setShowAddForm(false);
    setIsContactsCollapsed(false);
  };

  const handleContactClick = (contact: InfluencerContact) => {
    if (isClickableContact(contact.contact_type)) {
      const link = getContactLink(contact.contact_type, contact.contact_value);
      if (link !== '#') {
        window.open(link, '_blank');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member) return;
    
    // Validation
    if (!formData.contact_value.trim()) {
      setFormError('Contact value is required');
      return;
    }
    
    if (formData.contact_type === 'email' && !validateEmail(formData.contact_value)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    if (formData.contact_type === 'phone' && !validatePhone(formData.contact_value)) {
      setFormError('Please enter a valid phone number');
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const contactData: CreateInfluencerContactRequest = {
        social_account_id: member.campaign_influencer.social_account.id,
        contact_type: formData.contact_type,
        contact_value: formData.contact_value.trim(),
        name: formData.name.trim() || '',
        is_primary: formData.is_primary,
        platform_specific: formData.platform_specific
      };
      
      await createInfluencerContact(contactData);
      
      setFormSuccess(true);
      onContactAdded?.();
      
      // Refresh contacts list
      await fetchContacts();
      
      // Reset form after a delay
      setTimeout(() => {
        resetForm();
      }, 1500);
      
    } catch (error) {
      console.error('Error adding contact:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to add contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewClick = () => {
    setShowAddForm(true);
    setIsContactsCollapsed(true);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setIsContactsCollapsed(false);
    resetForm();
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
          <h3 className="text-lg font-semibold text-gray-900">Manage Contacts</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={fetchContacts}
              disabled={isLoadingContacts}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              title="Refresh contacts"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${isLoadingContacts ? 'animate-spin' : ''}`} />
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

          {/* Existing Contacts Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={() => setIsContactsCollapsed(!isContactsCollapsed)}
                className="flex items-center text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                {isContactsCollapsed ? (
                  <ChevronDown className="w-4 h-4 mr-1" />
                ) : (
                  <ChevronUp className="w-4 h-4 mr-1" />
                )}
                Existing Contacts ({contacts.length})
              </button>
              {!showAddForm && contacts.length > 0 && (
                <button
                  onClick={handleAddNewClick}
                  className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add New
                </button>
              )}
            </div>

            {/* Collapsible Contacts List */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isContactsCollapsed ? 'max-h-0' : 'max-h-96'
            }`}>
              {isLoadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <InlineSpinner />
                  <span className="ml-2 text-sm text-gray-500">Loading...</span>
                </div>
              ) : contactsError ? (
                <div className="text-center py-6">
                  <Mail className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-800 font-medium">Failed to load contacts</p>
                  <p className="text-xs text-red-600 mt-1 mb-3">{contactsError}</p>
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
                  {!showAddForm && (
                    <button
                      onClick={handleAddNewClick}
                      className="px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                      Add First Contact
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
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
          </div>

          {/* Add New Contact Form */}
          {showAddForm && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-900">Add New Contact</h4>
                <button
                  onClick={handleCancelAdd}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>

              {/* Success/Error Messages */}
              {formSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Contact added successfully!
                  </div>
                </div>
              )}

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-800 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {formError}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Contact Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Type
                  </label>
                  <select
                    name="contact_type"
                    value={formData.contact_type}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                  >
                    {CONTACT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.contact_type === 'email' ? 'Email Address' : 
                     formData.contact_type === 'phone' ? 'Phone Number' : 
                     formData.contact_type === 'whatsapp' ? 'WhatsApp Number' :
                     formData.contact_type === 'telegram' ? 'Telegram Username' : 'Contact Value'}
                  </label>
                  <input
                    type={formData.contact_type === 'email' ? 'email' : 'text'}
                    name="contact_value"
                    value={formData.contact_value}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    placeholder={
                      formData.contact_type === 'email' ? 'example@email.com' :
                      formData.contact_type === 'phone' ? '+1234567890' :
                      formData.contact_type === 'whatsapp' ? '+1234567890' :
                      formData.contact_type === 'telegram' ? '@username' :
                      'Enter contact information'
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Contact Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    placeholder="Manager, Assistant, etc."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_primary"
                      checked={formData.is_primary}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Primary contact
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="platform_specific"
                      checked={formData.platform_specific}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Platform-specific
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    disabled={isSubmitting}
                    className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || formSuccess}
                    className="px-3 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <InlineSpinner size="sm" />
                        <span className="ml-2">Adding...</span>
                      </>
                    ) : formSuccess ? (
                      <span>Added</span>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1" />
                        Add Contact
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        {!showAddForm && (
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}