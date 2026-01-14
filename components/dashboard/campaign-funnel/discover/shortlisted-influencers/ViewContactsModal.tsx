// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ViewContactsModal.tsx

'use client';

import { useState } from 'react';
import { X, Mail, MessageCircle, Send, Phone, Edit3, Trash2, Plus } from 'react-feather';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { ContactType, CreateInfluencerContactRequest } from '@/types/influencer-contacts';
import { createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';

interface Contact {
  id: string;
  contact_type: string;
  value: string;
  contact_value?: string;
  is_primary: boolean;
  platform_specific: boolean;
  name?: string;
}

interface ViewContactsModalProps {
  member: CampaignListMember | null;
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onContactUpdate: (contactId: string, updatedContact: Contact) => void;
  onContactDelete: (contactId: string) => void;
  onContactAdded?: () => void;
  onRowUpdate?: (updatedMember: CampaignListMember) => void; // For row-level updates
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

const getContactIcon = (contactType: string) => {
  switch (contactType.toLowerCase()) {
    case 'email':
      return <Mail className="w-4 h-4" />;
    case 'whatsapp':
      return <MessageCircle className="w-4 h-4" />;
    case 'telegram':
      return <Send className="w-4 h-4" />;
    case 'phone':
      return <Phone className="w-4 h-4" />;
    default:
      return <MessageCircle className="w-4 h-4" />;
  }
};

const getContactTypeColor = (contactType: string) => {
  switch (contactType.toLowerCase()) {
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContactType, setNewContactType] = useState<ContactType>('whatsapp');
  const [newContactValue, setNewContactValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !member) return null;

  const handleEditStart = (contact: Contact) => {
    setEditingContact(contact.id);
    setEditValue(contact.value || contact.contact_value || '');
  };

  const handleEditSave = async (contact: Contact) => {
    if (editValue.trim() && editValue !== (contact.value || contact.contact_value)) {
      const updatedContact = {
        ...contact,
        value: editValue.trim(),
        contact_value: editValue.trim()
      };
      await onContactUpdate(contact.id, updatedContact);
      
      // FIXED: Emit event to notify ContactColumn components
      emitContactsChangedEvent();
    }
    setEditingContact(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingContact(null);
    setEditValue('');
  };

  const handleDelete = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await onContactDelete(contactId);
      
      // FIXED: Emit event to notify ContactColumn components
      emitContactsChangedEvent();
    }
  };

  // ROW-LEVEL UPDATE: Handle adding new contact with optimistic update
  const handleAddContact = async () => {
    if (!member?.social_account?.id || !newContactValue.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Create new contact in backend
      const response = await createInfluencerContact({
        social_account_id: member.social_account.id,
        contact_type: newContactType,
        contact_value: newContactValue.trim(),
        is_primary: false,
        platform_specific: false,
        name: ''
      });

      if (response.success && response.data) {
        // 2. Create new contact object for local update
        const newContact = {
          id: response.data.id,
          contact_type: newContactType,
          value: newContactValue.trim(),
          type: newContactType, // For backward compatibility
          is_primary: false,
          platform_specific: false,
          name: ''
        };

        // 3. Update row data immediately with optimistic update
        if (onRowUpdate) {
          const updatedContacts = [...(member.social_account?.contacts || []), newContact];
          const updatedMember = {
            ...member,
            social_account: {
              ...member.social_account,
              contacts: updatedContacts
            }
          };
          onRowUpdate(updatedMember);
        }

        // 4. Reset form
        setNewContactValue('');
        setNewContactType('whatsapp');
        setShowAddForm(false);
        
        console.log('Contact added successfully:', newContact);
        
        // 5. Notify parent (optional callback)
        if (onContactAdded) {
          onContactAdded();
        }

        // 6. FIXED: Emit event to notify ALL ContactColumn components to refresh
        emitContactsChangedEvent();
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      alert('Failed to add contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewContactValue('');
    setNewContactType('whatsapp');
  };

  const selectedType = contactTypes.find(type => type.value === newContactType) || contactTypes[0];

  return (
    <>
      {/* Simple backdrop that allows page to remain visible */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Modal positioning and styling to match existing popup style */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={member.social_account?.profile_pic_url || '/default-avatar.png'}
                alt={member.social_account?.full_name || ''}
                className="w-10 h-10 rounded-full"
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

          {/* Content */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                Contact Information ({contacts.length})
              </h4>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contact
                </button>
              )}
            </div>

            {/* Add New Contact Form */}
            {showAddForm && (
              <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-sm font-medium text-purple-900">Add New Contact</h5>
                  <button
                    onClick={handleCancelAdd}
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
                            ? 'bg-purple-100 border-purple-300 text-purple-700' 
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
                      value={newContactValue}
                      onChange={(e) => setNewContactValue(e.target.value)}
                      placeholder={selectedType.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleAddContact}
                      disabled={isSubmitting || !newContactValue.trim()}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        'Add Contact'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Existing Contacts List */}
            {contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No contacts available</p>
                <p className="text-sm">Use the "Add Contact" button above to add contacts</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {contacts.map((contact) => {
                  const contactValue = contact.value || contact.contact_value || '';
                  
                  return (
                    <div
                      key={contact.id}
                      className={`border rounded-lg p-3 ${getContactTypeColor(contact.contact_type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 mt-0.5">
                            {getContactIcon(contact.contact_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium capitalize">
                                {contact.contact_type}
                              </span>
                              {contact.is_primary && (
                                <span className="text-xs bg-white bg-opacity-70 px-2 py-0.5 rounded-full font-medium">
                                  Primary
                                </span>
                              )}
                            </div>
                            
                            {editingContact === contact.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                                  autoFocus
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditSave(contact)}
                                    className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={handleEditCancel}
                                    className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm break-all">
                                {contactValue}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {editingContact !== contact.id && (
                          <div className="flex space-x-1 flex-shrink-0 ml-2">
                            <button
                              onClick={() => handleEditStart(contact)}
                              className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                              title="Edit contact"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(contact.id)}
                              className="p-1 hover:bg-red-100 hover:bg-opacity-70 rounded transition-colors text-red-600"
                              title="Delete contact"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}