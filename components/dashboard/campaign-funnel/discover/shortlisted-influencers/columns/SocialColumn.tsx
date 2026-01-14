// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/SocialColumn.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import SocialPopup from '../SocialPopup';
import SocialDetailsPopup from '../SocialDetailsPopup';
import {
  SOCIAL_TYPES,
  isSocialType,
  getSocialIcon,
  getEffectiveSocialType,
} from '@/utils/socialIcons';

interface SocialColumnProps {
  member: CampaignListMember;
  onUpdate?: (updatedMember: CampaignListMember) => void;
  readOnly?: boolean;
}

const SocialColumn: React.FC<SocialColumnProps> = ({
  member,
  onUpdate,
  readOnly = false,
}) => {
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [socialPosition, setSocialPosition] = useState({ x: 0, y: 0 });

  // Social details popup state
  const [socialDetailsOpen, setSocialDetailsOpen] = useState(false);
  const [selectedSocial, setSelectedSocial] = useState<any>(null);
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

  // Get social links from all available sources, filtering for SOCIAL_TYPES only
  const getSocialDetails = useMemo(() => {
    const allContacts: any[] = [];

    // Priority 1: Use contacts from campaign-influencers API
    const socialAccountContacts = member.social_account?.contacts || [];
    if (socialAccountContacts.length > 0) {
      socialAccountContacts.forEach((contact) => {
        // Use the new helper function to get effective social type
        const effectiveType = getEffectiveSocialType(contact);

        if (effectiveType) {
          allContacts.push({
            ...contact,
            contact_type: effectiveType,
            type: effectiveType,
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
        // Use the new helper function to get effective social type
        const effectiveType = getEffectiveSocialType(contact);

        if (effectiveType) {
          // Check if not already added
          const exists = allContacts.some(
            (c) => c.type === effectiveType && c.value === contact.value,
          );
          if (!exists) {
            allContacts.push({
              ...contact,
              contact_type: effectiveType,
              type: effectiveType,
              value: contact.value || '',
              contact_value: contact.value || '',
              social_account_id: member.social_account?.id,
            });
          }
        }
      });
    }

    return allContacts;
  }, [member.social_account]);

  // Helper function to get unique social types
  const getUniqueSocialTypes = (socials: any[]) => {
    const types = new Set<string>();
    socials.forEach((social) => {
      const type = social.contact_type || social.type;
      if (type) {
        types.add(type.toLowerCase());
      }
    });
    return Array.from(types);
  };

  // Handle clicking on social icon
  const handleSocialIconClick = (
    socialType: string,
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const socials = getSocialDetails;
    const social = socials.find(
      (s) =>
        (s.contact_type || s.type)?.toLowerCase() === socialType.toLowerCase(),
    );

    if (social) {
      const position = calculatePopupPosition(
        event.currentTarget as HTMLElement,
        280,
        200,
      );
      setSelectedSocial(social);
      setDetailsPosition(position);
      setSocialDetailsOpen(true);
    }
  };

  // Handle social update
  const handleSocialUpdate = async (socialId: string, updatedValue: string) => {
    console.log(
      'SocialColumn: Handling social update:',
      socialId,
      updatedValue,
    );

    if (selectedSocial) {
      setSelectedSocial({
        ...selectedSocial,
        contact_value: updatedValue,
        value: updatedValue,
      });
    }

    if (onUpdate && member.social_account) {
      const updatedContacts = (member.social_account.contacts || []).map(
        (contact) =>
          contact.id === socialId
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
  // Calculate popup position (fixed positioning - no scroll offsets needed)
  const calculatePopupPosition = (
    triggerElement: HTMLElement,
    modalWidth: number,
    modalHeight: number,
  ) => {
    const rect = triggerElement.getBoundingClientRect();
    const padding = 10;

    let x = rect.left;
    let y = rect.bottom + padding;

    // Adjust if popup would go off-screen to the right
    if (x + modalWidth > window.innerWidth - padding) {
      x = rect.right - modalWidth;
    }

    // Adjust if popup would go off-screen at the bottom - show above instead
    if (y + modalHeight > window.innerHeight - padding) {
      y = rect.top - modalHeight - padding;
    }

    // Ensure popup doesn't go off-screen to the left
    if (x < padding) {
      x = padding;
    }

    // Ensure popup doesn't go off-screen at the top
    if (y < padding) {
      y = rect.bottom + padding;
    }

    return { x, y };
  };

  // Handle social popup
  const handleSocialClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const position = calculatePopupPosition(
      event.currentTarget as HTMLElement,
      320,
      300,
    );
    setSocialPosition(position);
    setSocialModalOpen(true);
  };

  // Handle social addition
  const handleMemberUpdate = (updatedMember: CampaignListMember) => {
    console.log(
      'SocialColumn: Social added:',
      updatedMember.social_account?.full_name,
    );

    if (onUpdate) {
      onUpdate(updatedMember);
    }
  };

  const socials = getSocialDetails;
  const hasSocials = socials.length > 0;
  const uniqueSocialTypes = hasSocials ? getUniqueSocialTypes(socials) : [];

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-1">
          {/* Existing Social Icons */}
          {hasSocials && uniqueSocialTypes.length > 0 && (
            <>
              {uniqueSocialTypes.slice(0, 3).map((socialType, index) => (
                <button
                  key={`${socialType}-${index}`}
                  onClick={(e) => handleSocialIconClick(socialType, e)}
                  className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer border border-gray-300"
                  title={`Click to view ${socialType} details`}
                  type="button"
                >
                  {getSocialIcon(socialType)}
                </button>
              ))}
              {uniqueSocialTypes.length > 3 && (
                <div className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full text-gray-600 text-xs font-medium border border-gray-300">
                  +{uniqueSocialTypes.length - 3}
                </div>
              )}
            </>
          )}

          {/* Add Social Button - Only show if not readOnly */}
          {!readOnly && (
            <button
              onClick={handleSocialClick}
              className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 hover:text-purple-700 transition-colors border border-purple-300 font-bold text-sm"
              title="Click to add social link"
              type="button"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Social Modal - Only render if not readOnly */}
      {!readOnly && (
        <SocialPopup
          member={member}
          isOpen={socialModalOpen}
          onClose={() => setSocialModalOpen(false)}
          onSocialAdded={handleMemberUpdate}
          position={socialPosition}
        />
      )}

      {/* Social Details Popup */}
      <SocialDetailsPopup
        isOpen={socialDetailsOpen}
        onClose={() => setSocialDetailsOpen(false)}
        social={selectedSocial}
        position={detailsPosition}
        onUpdate={readOnly ? undefined : handleSocialUpdate}
      />
    </>
  );
};

export default SocialColumn;
