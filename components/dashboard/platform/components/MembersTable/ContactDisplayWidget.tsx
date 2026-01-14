// src/components/dashboard/platform/components/MembersTable/ContactDisplayWidget.tsx

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, MessageCircle, Send, X, Edit2, Save, ExternalLink } from 'react-feather';
import { AssignmentInfluencer, ContactBrief } from '@/types/assignment-influencers';

interface ContactDisplayWidgetProps {
  member: AssignmentInfluencer;
  onContactClick: (member: AssignmentInfluencer, event: React.MouseEvent) => void;
}

// Contact Details Popup Component
const ContactDetailsPopup = ({ 
  isOpen, 
  onClose, 
  contact, 
  position, 
  onUpdate 
}: {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactBrief | null;
  position: { x: number; y: number };
  onUpdate?: (contactId: string, updatedValue: string) => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (contact) {
      setEditValue(contact.value || '');
      setIsEditing(false);
    }
  }, [contact]);

  // Close on scroll (but allow scrolling inside popup)
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

  if (!isOpen || !contact || !mounted) return null;

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

  const handleSave = async () => {
    if (!onUpdate || editValue.trim() === contact.value) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(contact.id, editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditValue(contact.value);
    setIsEditing(false);
  };

  const handleOpenContact = () => {
    const contactLink = getContactLink(contact.contact_type, contact.value);
    if (contactLink) {
      window.open(contactLink, '_blank', 'noopener,noreferrer');
    }
  };

  const contactLink = getContactLink(contact.contact_type, contact.value);

  const popupContent = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[99998]" onClick={onClose} />
      
      {/* Popup */}
      <div 
        ref={popupRef}
        className="fixed z-[99999] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
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
                    {contact.value}
                  </p>
                  {contact.name && (
                    <p className="text-xs text-gray-500 mt-1">
                      Name: {contact.name}
                    </p>
                  )}
                </div>
                {onUpdate && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="ml-2 p-1 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Edit contact"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
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

  return createPortal(popupContent, document.body);
};

// Main Contact Display Widget Component
const ContactDisplayWidget: React.FC<ContactDisplayWidgetProps> = ({ 
  member, 
  onContactClick
}) => {
  // Contact details popup state
  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactBrief | null>(null);
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });

  // Get contacts directly from member object
  const getContacts = (): ContactBrief[] => {
    return member?.campaign_influencer?.social_account?.contacts || [];
  };

  // Calculate popup position using fixed positioning
  const calculatePopupPosition = (triggerElement: HTMLElement, modalWidth: number, modalHeight: number) => {
    const rect = triggerElement.getBoundingClientRect();
    const padding = 8;
    
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    let x = rect.left;
    let y = rect.bottom + padding;
    
    // Adjust horizontal position if going off-screen
    if (x + modalWidth > viewportWidth - padding) {
      x = rect.right - modalWidth;
    }
    if (x < padding) {
      x = padding;
    }
    
    // Adjust vertical position if going off-screen
    if (y + modalHeight > viewportHeight - padding) {
      y = rect.top - modalHeight - padding;
    }
    if (y < padding) {
      y = padding;
    }
    
    return { x, y };
  };

  // Handle clicking on contact icon - opens popup
  const handleContactIconClick = (contactType: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const contacts = getContacts();
    const contact = contacts.find(c => 
      c.contact_type?.toLowerCase() === contactType.toLowerCase()
    );
    
    if (contact) {
      const position = calculatePopupPosition(event.currentTarget as HTMLElement, 280, 250);
      
      setSelectedContact(contact);
      setDetailsPosition(position);
      setContactDetailsOpen(true);
    }
  };

  // Handle updating contact from popup
  const handleContactUpdate = async (contactId: string, updatedValue: string) => {
    try {
      // Import service dynamically
      const influencerContactsService = await import('@/services/influencer-contacts/influencer-contacts.service');
      
      // Check if updateInfluencerContact exists
      if ('updateInfluencerContact' in influencerContactsService) {
        const { updateInfluencerContact } = influencerContactsService as { updateInfluencerContact: (id: string, data: any) => Promise<void> };
        
        await updateInfluencerContact(contactId, {
          contact_value: updatedValue,
          name: selectedContact?.name || '',
          is_primary: selectedContact?.is_primary || false,
          platform_specific: selectedContact?.platform_specific || false
        });
        
        // Update selected contact for popup
        if (selectedContact) {
          setSelectedContact({
            ...selectedContact,
            value: updatedValue
          });
        }
      } else {
        console.warn('Update function not available, updating local state only');
        
        // Update selected contact for popup
        if (selectedContact) {
          setSelectedContact({
            ...selectedContact,
            value: updatedValue
          });
        }
        
        alert('Contact updated locally. Update functionality is not available in the backend yet.');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  };

  // Helper function to get contact type icon
  const getContactTypeIcon = (contactType: string) => {
    const type = contactType?.toLowerCase();
    switch (type) {
      case 'whatsapp':
        return (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63" fill="#25D366"/>
          </svg>
        );
      case 'email':
        return (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h3.819v.545L12 10.09l6.545-5.724v-.545h3.819c.904 0 1.636.732 1.636 1.636Z" fill="#EA4335"/>
          </svg>
        );
      case 'telegram':
        return (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" fill="#0088cc"/>
          </svg>
        );
      default:
        return <MessageCircle className="w-3 h-3" />;
    }
  };

  // Helper function to get unique contact types
  const getUniqueContactTypes = (contacts: ContactBrief[]) => {
    const types = new Set<string>();
    contacts.forEach(contact => {
      if (contact.contact_type) {
        types.add(contact.contact_type.toLowerCase());
      }
    });
    return Array.from(types);
  };

  const contacts = getContacts();
  const hasContacts = contacts.length > 0;
  const uniqueContactTypes = hasContacts ? getUniqueContactTypes(contacts) : [];

  return (
    <div className="flex flex-col items-center">
      {/* Single Row with Contact Icons and Add Button */}
      <div className="flex items-center space-x-1">
        {/* Existing Contact Icons */}
        {hasContacts && uniqueContactTypes.length > 0 && (
          <>
            {uniqueContactTypes.slice(0, 3).map((contactType, index) => (
              <button
                key={`${contactType}-${index}`}
                onClick={(e) => handleContactIconClick(contactType, e)}
                className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer border border-gray-300"
                title={`Click to view ${contactType} details`}
                type="button"
              >
                {getContactTypeIcon(contactType)}
              </button>
            ))}
            {uniqueContactTypes.length > 3 && (
              <div className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full text-gray-600 text-xs font-medium">
                +{uniqueContactTypes.length - 3}
              </div>
            )}
          </>
        )}
        
        {/* Add Contact Button - Always visible as + icon */}
        <button
          onClick={(e) => onContactClick(member, e)}
          className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-700 transition-colors border border-purple-300 font-bold text-sm"
          title="Click to add contact"
          type="button"
        >
          +
        </button>
      </div>

      {/* Contact Details Popup - Now uses Portal */}
      <ContactDetailsPopup
        isOpen={contactDetailsOpen}
        onClose={() => setContactDetailsOpen(false)}
        contact={selectedContact}
        position={detailsPosition}
        onUpdate={handleContactUpdate}
      />
    </div>
  );
};

export default ContactDisplayWidget;