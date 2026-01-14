// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/InfluencerCard.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { Status } from '@/types/statuses';
import { formatNumber } from '@/utils/format';
import ActionColumn from './columns/ActionColumn';
import ShortlistedStatusCell from './ShortlistedStatusCell';
import ViewContactsModal from './ViewContactsModal';
import ContactDetailsPopup from './ContactDetailsPopup';
import { MapPin, User, Mail, ExternalLink, Phone } from 'react-feather';
import {
  BsInstagram,
  BsTiktok,
  BsYoutube,
  BsWhatsapp,
  BsTelephone,
  BsLinkedin,
  BsTwitter,
  BsFacebook,
  BsThreads,
} from 'react-icons/bs';

interface InfluencerCardProps {
  member: CampaignListMember;
  isSelected: boolean;
  onSelectionChange: (id: string) => void;
  visibleColumns: Set<string>;
  // Helper functions passed from parent
  getAdditionalMetric: (
    member: CampaignListMember,
    key: string,
    defaultValue?: any,
  ) => any;
  getProfilePicture: (member: CampaignListMember) => string;
  getPlatformName: (member: CampaignListMember) => string;
  getPlatformIcon: (member: CampaignListMember) => React.ReactNode;
  formatLocation: (member: CampaignListMember) => string;
  formatEngagementRate: (member: CampaignListMember) => string;
  getCombinedAverageViews: (member: CampaignListMember) => number | null;
  // Action handlers
  onProfileInsights: (member: CampaignListMember) => void;
  onProfilePanel?: (member: CampaignListMember) => void;
  onRowUpdate: (updatedMember: CampaignListMember) => void;
  onRemovingChange: (removing: string[]) => void;
  removingInfluencers: string[];
  selectedInfluencers: string[];
  onInfluencerRemoved?: () => void;
  onRefreshProfileData?: (member: CampaignListMember) => void;
  isRefreshingProfileData?: boolean;
  // Status props
  shortlistedStatuses: Status[];
  onShortlistedStatusChange: (
    influencerId: string,
    statusId: string,
  ) => Promise<void>;
  updatingStatus: Set<string>;
  statusesLoading: boolean;
  localInfluencerUpdates: Record<string, any>;
}

// Contact types for filtering
const CONTACT_TYPES = ['email', 'phone', 'whatsapp', 'telegram'];
const SOCIAL_TYPES = [
  'instagram',
  'tiktok',
  'youtube',
  'linkedin',
  'twitter',
  'facebook',
  'threads',
];

const InfluencerCard: React.FC<InfluencerCardProps> = ({
  member,
  isSelected,
  onSelectionChange,
  visibleColumns,
  getAdditionalMetric,
  getProfilePicture,
  getPlatformName,
  getPlatformIcon,
  formatLocation,
  formatEngagementRate,
  getCombinedAverageViews,
  onProfileInsights,
  onProfilePanel,
  onRowUpdate,
  onRemovingChange,
  removingInfluencers,
  selectedInfluencers,
  onInfluencerRemoved,
  onRefreshProfileData,
  isRefreshingProfileData,
  shortlistedStatuses,
  onShortlistedStatusChange,
  updatingStatus,
  statusesLoading,
  localInfluencerUpdates,
}) => {
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [iconsExpanded, setIconsExpanded] = useState(false);

  // Contact details popup state
  const [contactPopupOpen, setContactPopupOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [contactPopupPosition, setContactPopupPosition] = useState({
    x: 0,
    y: 0,
  });

  // Check if this member is being removed (required for ActionColumn)
  const isRemoving = removingInfluencers.includes(member.id ?? '');

  // Get profile picture
  const profilePicture = getProfilePicture(member);

  // Get full name (no truncation)
  const fullName =
    member.social_account?.full_name ||
    getAdditionalMetric(member, 'name') ||
    getAdditionalMetric(member, 'full_name') ||
    'Unknown';

  // Get username
  const username =
    member.social_account?.account_handle ||
    getAdditionalMetric(member, 'username') ||
    '';

  // Get verified status
  const isVerified =
    member.social_account?.is_verified ||
    getAdditionalMetric(member, 'isVerified') ||
    false;

  // Get bio/introduction
  const bio =
    getAdditionalMetric(member, 'introduction') ||
    getAdditionalMetric(member, 'biography') ||
    '';

  // Get location
  const location = formatLocation(member);

  // Get gender
  const gender =
    getAdditionalMetric(member, 'gender') ||
    getAdditionalMetric(member, 'creator_gender') ||
    '';

  // Get followers count
  const followersCount =
    member.social_account?.followers_count ||
    getAdditionalMetric(member, 'followers') ||
    0;

  // Get engagement rate
  const engagementRate = formatEngagementRate(member);

  // Get average views
  const avgViews = getCombinedAverageViews(member);

  // Get average likes
  const avgLikes = getAdditionalMetric(member, 'average_likes') || 0;

  // Get platform URL for redirect
  const platformUrl =
    member.social_account?.account_url ||
    getAdditionalMetric(member, 'url') ||
    '';

  // Handle name/username click - redirect to platform
  const handleNameClick = () => {
    if (platformUrl) {
      window.open(platformUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle selection change for ActionColumn (required prop)
  const handleActionSelectionChange = (selected: string[]) => {
    // ActionColumn expects full array, but we don't need to do anything here
    // since selection is managed at the grid level
  };

  // Get contacts for modal - ensure all have id
  const getContactDetails = useMemo(() => {
    const contacts = member.social_account?.contacts || [];
    return contacts
      .filter((contact: any) => {
        const type = (contact.contact_type || contact.type || '').toLowerCase();
        return CONTACT_TYPES.includes(type);
      })
      .map((contact: any, index: number) => ({
        id: contact.id || `temp-${Date.now()}-${index}`,
        contact_type: contact.contact_type || contact.type || '',
        value: contact.value || contact.contact_value || '',
        contact_value: contact.value || contact.contact_value || '',
        is_primary: contact.is_primary || false,
        platform_specific: contact.platform_specific || false,
        name: contact.name || '',
      }));
  }, [member.social_account?.contacts]);

  // Get all contacts and social accounts for display
  const getAllContactsAndSocials = useMemo(() => {
    const allItems: {
      type: string;
      value: string;
      isContact: boolean;
      url?: string;
      id?: string;
      contact_type?: string;
    }[] = [];
    const contacts = member.social_account?.contacts || [];

    contacts.forEach((contact: any) => {
      const contactType = (contact.contact_type || '').toLowerCase();
      const contactName = (contact.name || '').toLowerCase();
      const value = contact.value || contact.contact_value || '';

      // Determine the effective type for display
      // For platform_specific social accounts, the 'name' field contains the actual platform
      let effectiveType = contactType;

      // Check if name matches a known social type (tiktok, youtube, instagram, etc.)
      const matchedSocial = SOCIAL_TYPES.find((s) => contactName.includes(s));
      if (matchedSocial) {
        effectiveType = matchedSocial;
      }

      // Check if name matches a known contact type (whatsapp, email, phone, etc.)
      const matchedContact = CONTACT_TYPES.find((c) => contactName.includes(c));
      if (matchedContact) {
        effectiveType = matchedContact;
      }

      // Also check contact_type directly
      if (CONTACT_TYPES.includes(contactType)) {
        effectiveType = contactType;
      }

      // Add to list based on effective type
      if (CONTACT_TYPES.includes(effectiveType)) {
        allItems.push({
          type: effectiveType,
          value,
          isContact: true,
          id: contact.id,
          contact_type: effectiveType,
        });
      } else if (SOCIAL_TYPES.includes(effectiveType)) {
        allItems.push({
          type: effectiveType,
          value,
          isContact: false,
          url: value,
          id: contact.id,
        });
      }
    });

    // Also check additional_metrics for contact_details
    const contactDetails = getAdditionalMetric(member, 'contact_details');
    if (Array.isArray(contactDetails)) {
      contactDetails.forEach((contact: any) => {
        const type = (contact.type || contact.contact_type || '').toLowerCase();
        const value = contact.value || '';

        // Check if already added
        const exists = allItems.some(
          (item) => item.type === type && item.value === value,
        );
        if (!exists) {
          if (CONTACT_TYPES.includes(type)) {
            allItems.push({
              type,
              value,
              isContact: true,
              id: contact.id,
              contact_type: type,
            });
          } else if (SOCIAL_TYPES.includes(type)) {
            allItems.push({
              type,
              value,
              isContact: false,
              url: value,
              id: contact.id,
            });
          }
        }
      });
    }

    return allItems;
  }, [member, getAdditionalMetric]);

  // Get icon for contact/social type
  const getTypeIcon = (type: string, className: string = 'w-3.5 h-3.5') => {
    switch (type.toLowerCase()) {
      case 'email':
        return <Mail className={className} />;
      case 'phone':
        return <BsTelephone className={className} />;
      case 'whatsapp':
        return <BsWhatsapp className={className} />;
      case 'telegram':
        return <Mail className={className} />;
      case 'instagram':
        return <BsInstagram className={className} />;
      case 'tiktok':
        return <BsTiktok className={className} />;
      case 'youtube':
        return <BsYoutube className={className} />;
      case 'linkedin':
        return <BsLinkedin className={className} />;
      case 'twitter':
        return <BsTwitter className={className} />;
      case 'facebook':
        return <BsFacebook className={className} />;
      case 'threads':
        return <BsThreads className={className} />;
      default:
        return <Mail className={className} />;
    }
  };

  // Get color for icon type
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100';
      case 'phone':
        return 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100';
      case 'whatsapp':
        return 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100';
      case 'telegram':
        return 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100';
      case 'instagram':
        return 'bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100';
      case 'tiktok':
        return 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100';
      case 'youtube':
        return 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100';
      case 'linkedin':
        return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'twitter':
        return 'bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100';
      case 'facebook':
        return 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100';
      case 'threads':
        return 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100';
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

    let x = rect.left;
    let y = rect.bottom + padding;

    if (x + modalWidth > window.innerWidth - padding) {
      x = rect.right - modalWidth;
    }
    if (y + modalHeight > window.innerHeight - padding) {
      y = rect.top - modalHeight - padding;
    }
    if (x < padding) {
      x = padding;
    }
    if (y < padding) {
      y = rect.bottom + padding;
    }

    return { x, y };
  };

  // Handle icon click
  const handleIconClick = (
    item: {
      type: string;
      value: string;
      isContact: boolean;
      url?: string;
      id?: string;
      contact_type?: string;
    },
    event: React.MouseEvent,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (item.isContact) {
      const position = calculatePopupPosition(
        event.currentTarget as HTMLElement,
        300,
        200,
      );
      setSelectedContact({
        id: item.id || '',
        contact_type: item.type,
        type: item.type,
        value: item.value,
        contact_value: item.value,
      });
      setContactPopupPosition(position);
      setContactPopupOpen(true);
    } else {
      let url = item.url || item.value;
      if (url) {
        if (!url.startsWith('http')) {
          switch (item.type) {
            case 'instagram':
              url = `https://www.instagram.com/${url.replace('@', '')}`;
              break;
            case 'tiktok':
              url = `https://www.tiktok.com/@${url.replace('@', '')}`;
              break;
            case 'youtube':
              url = url.includes('youtube.com')
                ? url
                : `https://www.youtube.com/@${url}`;
              break;
            case 'linkedin':
              url = url.includes('linkedin.com')
                ? url
                : `https://www.linkedin.com/in/${url}`;
              break;
            case 'twitter':
              url = `https://twitter.com/${url.replace('@', '')}`;
              break;
            case 'facebook':
              url = url.includes('facebook.com')
                ? url
                : `https://www.facebook.com/${url}`;
              break;
            case 'threads':
              url = `https://www.threads.net/@${url.replace('@', '')}`;
              break;
            default:
              url = `https://${url}`;
          }
        }
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };

  // Handle contact update from popup
  const handleContactUpdate = async (
    contactId: string,
    updatedValue: string,
  ) => {
    if (member.social_account) {
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
          id: member.social_account.id,
          contacts: updatedContacts as typeof member.social_account.contacts,
        },
      };
      onRowUpdate(updatedMember);
    }
  };

  // Generate initials for fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Bio display logic
  const MAX_BIO_LENGTH = 200;
  const shouldTruncateBio = bio.length > MAX_BIO_LENGTH;
  const displayBio = bioExpanded ? bio : bio.slice(0, MAX_BIO_LENGTH);

  // Format gender display
  const formatGender = (g: string) => {
    if (!g) return '';
    const lower = g.toLowerCase();
    if (lower === 'male' || lower === 'm') return 'Male';
    if (lower === 'female' || lower === 'f') return 'Female';
    return g.charAt(0).toUpperCase() + g.slice(1);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        {/* Main Content */}
        {/* Main Content - Two Column Layout */}
        <div className="flex">
          {/* Left Section */}
          <div
            className="flex-1 p-3 min-w-0"
            style={{ maxWidth: 'calc(100% - 160px)' }}
          >
            {/* Profile Header with Checkbox */}
            <div className="flex gap-3">
              {/* Checkbox */}
              <div className="flex-shrink-0 pt-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectionChange(member.id ?? '')}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                />
              </div>

              {/* Profile Image - LARGER SIZE */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {!imageError ? (
                    <img
                      src={profilePicture}
                      alt={fullName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {getInitials(fullName)}
                    </div>
                  )}
                  {/* Platform Badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200">
                    {getPlatformIcon(member)}
                  </div>
                </div>
              </div>

              {/* Name Info */}
              <div className="flex-1 min-w-0">
                {/* Username on top (smaller) */}
                <p
                  className="text-xs text-gray-500 hover:text-purple-600 cursor-pointer transition-colors truncate"
                  onClick={handleNameClick}
                >
                  @{username}
                </p>

                {/* Full Name + Verified */}
                <div className="flex items-center gap-1 mt-0.5">
                  <h3
                    className="font-semibold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors text-sm leading-tight"
                    onClick={handleNameClick}
                    title={fullName}
                  >
                    {fullName}
                  </h3>
                  {isVerified && (
                    <span
                      className="flex-shrink-0 text-blue-500"
                      title="Verified"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z" />
                      </svg>
                    </span>
                  )}
                </div>

                {/* Location + Gender */}
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  {location && location !== 'N/A' && (
                    <div className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{location}</span>
                    </div>
                  )}
                  {gender && (
                    <div className="flex items-center gap-0.5">
                      <User className="w-3 h-3" />
                      <span>{formatGender(gender)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {bio && (
              <div className="mt-2 ml-7">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {displayBio}
                  {shouldTruncateBio && !bioExpanded && '...'}
                </p>
                {shouldTruncateBio && (
                  <button
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {bioExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Contact/Social Icons Row */}
            {getAllContactsAndSocials.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-gray-100 ml-7">
                {getAllContactsAndSocials
                  .slice(0, iconsExpanded ? undefined : 10)
                  .map((item, index) => (
                    <button
                      key={`${item.type}-${index}`}
                      onClick={(e) => handleIconClick(item, e)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${getTypeColor(item.type)}`}
                      title={`${item.type}: ${item.value}`}
                    >
                      {getTypeIcon(item.type, 'w-3 h-3')}
                    </button>
                  ))}
                {getAllContactsAndSocials.length > 10 && !iconsExpanded && (
                  <button
                    onClick={() => setIconsExpanded(true)}
                    className="h-6 px-2 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-[10px] font-medium text-purple-600 hover:bg-purple-100 transition-colors"
                  >
                    +{getAllContactsAndSocials.length - 10} more
                  </button>
                )}
                {iconsExpanded && getAllContactsAndSocials.length > 10 && (
                  <button
                    onClick={() => setIconsExpanded(false)}
                    className="h-6 px-2 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Show less
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Section - FIXED WIDTH */}
          <div className="w-44 flex-shrink-0 border-l border-gray-100 bg-gray-50/30 p-2.5 flex flex-col">
            {/* Action Menu - Top Right */}
            <div className="flex justify-end mb-2">
              <ActionColumn
                member={member}
                isRemoving={isRemoving}
                onRemovingChange={onRemovingChange}
                removingInfluencers={removingInfluencers}
                selectedInfluencers={selectedInfluencers}
                onSelectionChange={handleActionSelectionChange}
                onInfluencerRemoved={onInfluencerRemoved}
                onRowUpdate={onRowUpdate}
                onRefreshProfileData={onRefreshProfileData}
                isRefreshingProfileData={isRefreshingProfileData}
              />
            </div>

            {/* Stats with Labels ONLY */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Followers:</span>
                <span className="font-medium text-gray-900">
                  {formatNumber(followersCount)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Eng:</span>
                <span className="font-medium text-gray-900">
                  {engagementRate}
                </span>
              </div>
              {avgViews !== null && avgViews > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Views:</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(avgViews)}
                  </span>
                </div>
              )}
              {avgLikes > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Likes:</span>
                  <span className="font-medium text-gray-900">
                    {formatNumber(avgLikes)}
                  </span>
                </div>
              )}
            </div>

            {/* Buttons Section - at bottom (ALL SAME STYLE) */}
            <div className="mt-auto pt-2 space-y-1.5">
              {/* Row 1: Profile + Insights */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    onProfilePanel
                      ? onProfilePanel(member)
                      : onProfileInsights(member)
                  }
                  className="flex-1 flex items-center justify-center px-2 py-1.5 border border-gray-200 text-gray-600 rounded-md hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-colors text-xs font-medium"
                >
                  Profile
                </button>
                <button
                  onClick={() => onProfileInsights(member)}
                  className="flex-1 flex items-center justify-center px-2 py-1.5 border border-gray-200 text-gray-600 rounded-md hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-colors text-xs font-medium"
                >
                  Insights
                </button>
              </div>

              {/* Row 2: Status + Contact */}
              <div className="flex items-center gap-1.5">
                <div className="flex-1">
                  <ShortlistedStatusCell
                    influencer={member}
                    shortlistedStatuses={shortlistedStatuses}
                    onStatusChange={onShortlistedStatusChange}
                    isUpdating={updatingStatus.has(member.id || '')}
                    statusesLoading={statusesLoading}
                    localUpdate={localInfluencerUpdates[member.id || '']}
                  />
                </div>
                <button
                  onClick={() => setShowContactsModal(true)}
                  className="flex-1 flex items-center justify-center px-2 py-1.5 border border-gray-200 text-gray-600 rounded-md hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-colors text-xs font-medium"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details Popup */}
      <ContactDetailsPopup
        isOpen={contactPopupOpen}
        onClose={() => setContactPopupOpen(false)}
        contact={selectedContact}
        position={contactPopupPosition}
        onUpdate={handleContactUpdate}
      />

      {/* View Contacts Modal */}
      <ViewContactsModal
        member={member}
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
        contacts={getContactDetails}
        onContactUpdate={(contactId, updatedContact) => {
          if (member.social_account) {
            const updatedContacts = (member.social_account.contacts || []).map(
              (contact) =>
                contact.id === contactId
                  ? {
                      ...contact,
                      value:
                        updatedContact.value ||
                        updatedContact.contact_value ||
                        contact.value ||
                        '',
                    }
                  : contact,
            );
            const updatedMember: CampaignListMember = {
              ...member,
              social_account: {
                ...member.social_account,
                id: member.social_account.id,
                contacts:
                  updatedContacts as typeof member.social_account.contacts,
              },
            };
            onRowUpdate(updatedMember);
          }
        }}
        onContactDelete={(contactId) => {
          if (member.social_account) {
            const updatedContacts = (
              member.social_account.contacts || []
            ).filter((contact) => contact.id !== contactId);
            const updatedMember: CampaignListMember = {
              ...member,
              social_account: {
                ...member.social_account,
                id: member.social_account.id,
                contacts:
                  updatedContacts as typeof member.social_account.contacts,
              },
            };
            onRowUpdate(updatedMember);
          }
        }}
        onContactAdded={() => {
          console.log('Contact added');
        }}
        onRowUpdate={onRowUpdate}
      />
    </>
  );
};

export default InfluencerCard;
