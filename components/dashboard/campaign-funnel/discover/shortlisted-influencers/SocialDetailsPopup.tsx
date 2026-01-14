// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/SocialDetailsPopup.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Copy, Check, Edit3 } from 'react-feather';
import { getSocialIcon } from '@/utils/socialIcons';

interface SocialDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  social: any;
  position: { x: number; y: number };
  onUpdate?: (socialId: string, updatedValue: string) => void;
}

const SocialDetailsPopup: React.FC<SocialDetailsPopupProps> = ({
  isOpen,
  onClose,
  social,
  position,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [copied, setCopied] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (social) {
      setEditValue(social.value || social.contact_value || '');
    }
  }, [social]);

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

  if (!isOpen || !social) return null;

  const socialType = (
    social.contact_type ||
    social.type ||
    'unknown'
  ).toLowerCase();
  const socialValue = social.value || social.contact_value || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(socialValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenLink = () => {
    let url = socialValue;

    // If value doesn't start with http, construct the URL
    if (!url.startsWith('http')) {
      switch (socialType) {
        case 'tiktok':
          url = `https://www.tiktok.com/@${url}`;
          break;
        case 'youtube':
          url = url.includes('youtube.com')
            ? url
            : `https://www.youtube.com/@${url}`;
          break;
        case 'threads':
          url = `https://www.threads.net/@${url}`;
          break;
        case 'linkedin':
          url = url.includes('linkedin.com')
            ? url
            : `https://www.linkedin.com/in/${url}`;
          break;
        case 'instagram':
          url = `https://www.instagram.com/${url}`;
          break;
        case 'twitter':
          url = `https://twitter.com/${url}`;
          break;
        case 'facebook':
          url = url.includes('facebook.com')
            ? url
            : `https://www.facebook.com/${url}`;
          break;
        default:
          if (!url.startsWith('http')) {
            url = `https://${url}`;
          }
      }
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSave = () => {
    if (onUpdate && social.id) {
      onUpdate(social.id, editValue);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={popupRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-72"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
            {getSocialIcon(socialType)}
          </div>
          <span className="font-medium text-gray-800 capitalize">
            {socialType}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={`Enter ${socialType} URL or username`}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* URL Display - scrollable for long URLs */}
            <div
              className="bg-gray-50 px-3 py-2 rounded-md overflow-x-auto"
              title={socialValue || 'No value'}
            >
              <p className="text-sm text-gray-700 whitespace-nowrap">
                {socialValue || 'No value'}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleOpenLink}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
              {onUpdate && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center px-2 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialDetailsPopup;
