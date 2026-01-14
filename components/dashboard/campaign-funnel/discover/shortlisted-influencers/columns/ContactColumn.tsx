// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/ContactColumn.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { MessageCircle } from 'react-feather';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import ContactPopup from '../ContactPopup';
import ContactDetailsPopup from '../ContactDetailsPopup';
import {
  CONTACT_TYPES,
  isContactType,
  getContactIcon,
} from '@/utils/socialIcons';

interface ContactColumnProps {
  member: CampaignListMember;
  onUpdate?: (updatedMember: CampaignListMember) => void;
}

const ContactColumn: React.FC<ContactColumnProps> = ({ member, onUpdate }) => {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactPosition, setContactPosition] = useState({ x: 0, y: 0 });

  // Contact details popup state
  const [contactDetailsOpen, setContactDetailsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [detailsPosition, setDetailsPosition] = useState({ x: 0, y: 0 });

  // Helper function to safely access additional metrics
  const getAdditionalMetric = (key: string, defaultValue: any = null) => {
    const additionalMetrics = member?.social_account?.additional_metrics;
    if (!additionalMetrics || typeof additionalMetrics !== 'object') {
      return defaultValue;
    }
    const metricsObj = additionalMetrics as Record<string, any>;
    return metricsObj[key] ?? defaultValue;
  };

  // Helper function to parse JSON strings safely
  const parseJSONSafely = (jsonString: any, defaultValue: any = null) => {
    if (!jsonString) return defaultValue;
    if (typeof jsonString === 'object') return jsonString;
    if (typeof jsonString === 'string') {
      try {
        return JSON.parse(jsonString);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  // UPDATED: Get contact details, filtering for CONTACT_TYPES only (phone, email, whatsapp, telegram)
  const getContactDetails = useMemo(() => {
    const allContacts: any[] = [];

    // Priority 1: Use contacts from campaign-influencers API
    const socialAccountContacts = member.social_account?.contacts || [];
    if (socialAccountContacts.length > 0) {
      socialAccountContacts.forEach((contact) => {
        const type = (contact.contact_type || contact.type || '').toLowerCase();
        // FILTER: Only include contact types (phone, email, whatsapp, telegram)
        if (isContactType(type)) {
          allContacts.push({
            ...contact,
            contact_type: type,
            type: type,
            value: contact.value || '',
            contact_value: contact.value || '',
            social_account_id: member.social_account?.id,
          });
        }
      });
    }

    // Priority 2: Fallback to additional_metrics contact_details
    const contactsData = getAdditionalMetric('contact_details');
    const parsed = parseJSONSafely(contactsData, []);

    if (Array.isArray(parsed) && parsed.length > 0) {
      parsed.forEach((contact) => {
        const type = (contact.contact_type || contact.type || '').toLowerCase();
        // FILTER: Only include contact types (phone, email, whatsapp, telegram)
        if (isContactType(type)) {
          // Check if not already added
          const exists = allContacts.some(
            (c) => c.type === type && c.value === contact.value,
          );
          if (!exists) {
            allContacts.push({
              ...contact,
              contact_type: type,
              type: type,
              value: contact.value || '',
              contact_value: contact.value || '',
              social_account_id: member.social_account?.id,
            });
          }
        }
      });
    }

    // Priority 3: Check for individual contact fields
    const primaryType = getAdditionalMetric('primary_contact_type');
    const primaryValue = getAdditionalMetric('primary_contact_value');

    if (
      primaryType &&
      primaryValue &&
      isContactType(primaryType.toLowerCase())
    ) {
      const exists = allContacts.some(
        (c) => c.type === primaryType.toLowerCase() && c.value === primaryValue,
      );
      if (!exists) {
        allContacts.push({
          id: `primary_${Date.now()}`,
          type: primaryType.toLowerCase(),
          contact_type: primaryType.toLowerCase(),
          value: primaryValue,
          contact_value: primaryValue,
          is_primary: true,
          platform_specific: false,
          name: 'Primary Contact',
          social_account_id: member.social_account?.id,
        });
      }
    }

    return allContacts;
  }, [member.social_account]);

  // Use the shared getContactIcon from utils
  const getContactTypeIcon = (contactType: string) => {
    return getContactIcon(contactType);
  };

  // Helper function to get unique contact types
  const getUniqueContactTypes = (contacts: any[]) => {
    const types = new Set<string>();
    contacts.forEach((contact) => {
      const type = contact.contact_type || contact.type;
      if (type) {
        types.add(type.toLowerCase());
      }
    });
    return Array.from(types);
  };

  // Handle clicking on contact icon
  const handleContactIconClick = (
    contactType: string,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const contacts = getContactDetails;
    const contact = contacts.find(
      (c) =>
        (c.contact_type || c.type)?.toLowerCase() === contactType.toLowerCase(),
    );

    if (contact) {
      const position = calculatePopupPosition(
        event.currentTarget as HTMLElement,
        280,
        200,
      );
      setSelectedContact(contact);
      setDetailsPosition(position);
      setContactDetailsOpen(true);
    }
  };

  // Handle contact update - only updates local state and parent
  const handleContactUpdate = async (
    contactId: string,
    updatedValue: string,
  ) => {
    console.log(
      'ContactColumn: Handling contact update (batch compatible):',
      contactId,
      updatedValue,
    );

    // Update the selected contact for popup display
    if (selectedContact) {
      setSelectedContact({
        ...selectedContact,
        contact_value: updatedValue,
        value: updatedValue,
      });
    }

    // Update parent component with updated member data
    if (onUpdate && member.social_account) {
      const updatedContacts = (member.social_account.contacts || []).map(
        (contact) =>
          contact.id === contactId
            ? { ...contact, value: updatedValue, contact_value: updatedValue }
            : contact,
      );

      const updatedMember: CampaignListMember = {
        ...member,
        social_account: {
          ...member.social_account,
          id: member.social_account.id!,
          contacts: updatedContacts,
        },
      };

      onUpdate(updatedMember);
    }
  };

  // Calculate popup position
  const calculatePopupPosition = (
    triggerElement: HTMLElement,
    modalWidth: number,
    modalHeight: number,
  ) => {
    const rect = triggerElement.getBoundingClientRect();
    const padding = 10;

    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let x = rect.left + scrollX;
    let y = rect.bottom + padding + scrollY;

    if (x + modalWidth > window.innerWidth + scrollX - padding) {
      x = rect.right + scrollX - modalWidth;
    }

    if (y + modalHeight > window.innerHeight + scrollY - padding) {
      y = rect.top + scrollY - modalHeight - padding;
    }

    if (x < scrollX + padding) {
      x = scrollX + padding;
    }

    if (y < scrollY + padding) {
      y = rect.bottom + padding + scrollY;
    }

    return { x, y };
  };

  // Handle contact popup
  const handleContactClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const position = calculatePopupPosition(
      event.currentTarget as HTMLElement,
      320,
      200,
    );
    setContactPosition(position);
    setContactModalOpen(true);
  };

  // Handle contact addition - works with batch approach
  const handleMemberUpdate = (updatedMember: CampaignListMember) => {
    console.log(
      'ContactColumn: Contact added (batch compatible):',
      updatedMember.social_account?.full_name,
    );

    // Update parent table through callback
    if (onUpdate) {
      onUpdate(updatedMember);
    }
  };

  const contacts = getContactDetails;
  const hasContacts = contacts.length > 0;
  const uniqueContactTypes = hasContacts ? getUniqueContactTypes(contacts) : [];

  return (
    <>
      <div className="flex flex-col items-center">
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

          {/* Add Contact Button */}
          <button
            onClick={handleContactClick}
            className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-700 transition-colors border border-purple-300 font-bold text-sm"
            title="Click to add contact"
            type="button"
          >
            +
          </button>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactPopup
        member={member}
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onContactAdded={handleMemberUpdate}
        position={contactPosition}
      />

      {/* Contact Details Popup */}
      <ContactDetailsPopup
        isOpen={contactDetailsOpen}
        onClose={() => setContactDetailsOpen(false)}
        contact={selectedContact}
        position={detailsPosition}
        onUpdate={handleContactUpdate}
      />
    </>
  );
};

export default ContactColumn;
