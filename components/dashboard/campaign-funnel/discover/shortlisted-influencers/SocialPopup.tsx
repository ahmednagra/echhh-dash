// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/SocialPopup.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'react-feather';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';
import { SOCIAL_TYPES, getSocialIcon } from '@/utils/socialIcons';
import { toast } from 'react-hot-toast';

interface SocialPopupProps {
  member: CampaignListMember;
  isOpen: boolean;
  onClose: () => void;
  onSocialAdded: (updatedMember: CampaignListMember) => void;
  position: { x: number; y: number };
}

const SocialPopup: React.FC<SocialPopupProps> = ({
  member,
  isOpen,
  onClose,
  onSocialAdded,
  position,
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [socialValue, setSocialValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Social type options with placeholders
  const socialOptions = [
    {
      value: 'tiktok',
      label: 'TikTok',
      placeholder: 'Enter TikTok URL or @username',
    },
    {
      value: 'youtube',
      label: 'YouTube',
      placeholder: 'Enter YouTube channel URL',
    },
    {
      value: 'threads',
      label: 'Threads',
      placeholder: 'Enter Threads URL or @username',
    },
    {
      value: 'linkedin',
      label: 'LinkedIn',
      placeholder: 'Enter LinkedIn profile URL',
    },
    {
      value: 'instagram',
      label: 'Instagram',
      placeholder: 'Enter Instagram URL or @username',
    },
    {
      value: 'twitter',
      label: 'Twitter/X',
      placeholder: 'Enter Twitter URL or @username',
    },
    {
      value: 'facebook',
      label: 'Facebook',
      placeholder: 'Enter Facebook profile URL',
    },
  ];

  // NEW: Auto-detect platform from URL
  const detectPlatformFromUrl = (url: string): string | null => {
    const lowerUrl = url.toLowerCase().trim();

    // Only detect if it looks like a URL (contains domain patterns)
    if (
      !lowerUrl.includes('.com') &&
      !lowerUrl.includes('.net') &&
      !lowerUrl.includes('.be') &&
      !lowerUrl.includes('http://') &&
      !lowerUrl.includes('https://')
    ) {
      return null; // Not a URL, user must select platform manually
    }

    // Platform detection patterns
    if (lowerUrl.includes('tiktok.com')) {
      return 'tiktok';
    }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
      return 'youtube';
    }
    if (lowerUrl.includes('threads.net')) {
      return 'threads';
    }
    if (lowerUrl.includes('linkedin.com')) {
      return 'linkedin';
    }
    if (lowerUrl.includes('instagram.com')) {
      return 'instagram';
    }
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
      return 'twitter';
    }
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) {
      return 'facebook';
    }

    return null; // Unknown URL pattern
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType || !socialValue.trim()) {
      toast.error('Please select a platform and enter a value');
      return;
    }

    if (!member.social_account?.id) {
      toast.error('Social account ID not found');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createInfluencerContact({
        social_account_id: member.social_account.id,
        contact_type: 'other', // Backend only accepts: email, phone, whatsapp, telegram, discord, other
        contact_value: socialValue.trim(),
        name: selectedType, // Store actual social type (youtube, tiktok, etc.) in name field
        is_primary: false,
        platform_specific: true,
      });

      if (response.success && response.data) {
        // Create updated member with new social link
        const newContact = {
          id: response.data.id,
          contact_type: selectedType,
          type: selectedType,
          value: socialValue.trim(),
          is_primary: false,
          platform_specific: true,
          name: `${selectedType} link`,
        };

        const existingContacts = member.social_account?.contacts || [];

        const updatedMember: CampaignListMember = {
          ...member,
          social_account: {
            ...member.social_account,
            id: member.social_account.id!,
            contacts: [...existingContacts, newContact],
          },
        };

        onSocialAdded(updatedMember);
        toast.success(`${selectedType} link added successfully`);

        // Reset form
        setSelectedType('');
        setSocialValue('');
        onClose();
      } else {
        throw new Error(response.error || 'Failed to add social link');
      }
    } catch (error) {
      console.error('Error adding social link:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to add social link',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedOption = socialOptions.find(
    (opt) => opt.value === selectedType,
  );

  return (
    <div
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
        <h3 className="font-medium text-gray-800">Add Social Link</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Platform Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform
          </label>
          <div className="grid grid-cols-4 gap-2">
            {socialOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedType(option.value)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                  selectedType === option.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                title={option.label}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {getSocialIcon(option.value)}
                </div>
                <span className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL or Username
          </label>
          <input
            type="text"
            value={socialValue}
            onChange={(e) => {
              const value = e.target.value;
              setSocialValue(value);

              // Auto-detect platform from URL
              const detectedPlatform = detectPlatformFromUrl(value);
              if (detectedPlatform) {
                setSelectedType(detectedPlatform);
              }
            }}
            placeholder={selectedOption?.placeholder || 'Enter URL or username'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {/* Auto-detection hint for usernames */}
          {socialValue.trim() &&
            !selectedType &&
            !detectPlatformFromUrl(socialValue) && (
              <p className="text-xs text-amber-600 mt-1">
                Please select a platform for this username
              </p>
            )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedType || !socialValue.trim()}
          className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Adding...
            </>
          ) : (
            'Add Social Link'
          )}
        </button>
      </form>
    </div>
  );
};

export default SocialPopup;
