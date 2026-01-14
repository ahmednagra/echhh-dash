// src/components/dashboard/platform/components/MembersTable/StatusDropdown.tsx

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
import { updateCampaignInfluencerStatus } from '@/services/campaign-influencers/campaign-influencers.client';
import InlineSpinner from '@/components/ui/InlineSpinner';
import { formatStatusName } from './constants';

interface StatusDropdownProps {
  influencer: AssignmentInfluencer;
  availableStatuses: Status[];
  onUpdate?: (updatedMember: AssignmentInfluencer) => void;
}

export const ContactStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(/_/g, '');

    switch (normalizedStatus) {
      case 'discovered':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
        };
      case 'contacted':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
        };
      case 'awaitingresponse':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
        };
      case 'responded':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
        };
      case 'completed':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
        };
      case 'declined':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
        };
      case 'discovered':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
        };
      case 'unreachable':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
        };
      case 'inforequested':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
        };
      case 'inactive':
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
        };
      case 'inconversation':
        return {
          bg: 'bg-cyan-50',
          text: 'text-cyan-700',
          border: 'border-cyan-200',
        };
      case 'dropped':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
        };
      case 'contactonnumber':
        return {
          bg: 'bg-violet-50',
          text: 'text-violet-700',
          border: 'border-violet-200',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);
  const formattedLabel = formatStatusName(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.text.replace('text-', 'bg-')}`}
      ></div>
      {formattedLabel}
    </span>
  );
};

export default function StatusDropdown({
  influencer,
  availableStatuses,
  onUpdate,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get the current campaign_influencer status_id (this is what we match against availableStatuses)
  const currentStatusId = useMemo(() => {
    // Priority: campaign_influencer.status_id (since availableStatuses are campaign_influencer statuses)
    return influencer.campaign_influencer?.status_id || null;
  }, [influencer.campaign_influencer?.status_id]);

  // Find the current status object from availableStatuses
  const currentStatus = useMemo(() => {
    if (!currentStatusId) return null;
    return availableStatuses.find((s) => s.id === currentStatusId) || null;
  }, [currentStatusId, availableStatuses]);

  // Get the display name for the badge
  const currentStatusName = useMemo(() => {
    // First try to get from matched availableStatuses (most accurate)
    if (currentStatus?.name) return currentStatus.name;
    // Fallback to campaign_influencer.status object if available
    if (influencer.campaign_influencer?.status?.name) {
      return influencer.campaign_influencer.status.name;
    }
    // Last fallback to assigned_influencer status or default
    return influencer.status?.name || 'discovered';
  }, [currentStatus, influencer.campaign_influencer?.status, influencer.status]);

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate optimal dropdown position
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    const buttonRect = button.getBoundingClientRect();
    const dropdownHeight = Math.min(availableStatuses.length * 44 + 16, 240);
    const dropdownWidth = 208;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - buttonRect.bottom - 8;
    const spaceAbove = buttonRect.top - 8;

    let top: number;
    let left: number;

    // Vertical positioning
    if (spaceBelow >= dropdownHeight || spaceBelow > spaceAbove) {
      top = buttonRect.bottom + 4;
    } else {
      top = buttonRect.top - dropdownHeight - 4;
    }

    // Horizontal positioning - align with button
    left = buttonRect.left;

    // Adjust if going off-screen
    if (left + dropdownWidth > viewportWidth - 8) {
      left = buttonRect.right - dropdownWidth;
    }

    // Boundary checks
    if (left < 8) left = 8;
    if (top < 8) top = 8;
    if (top + dropdownHeight > viewportHeight - 8) {
      top = viewportHeight - dropdownHeight - 8;
    }

    setDropdownStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${dropdownWidth}px`,
      maxHeight: `${Math.min(dropdownHeight, viewportHeight - top - 16)}px`,
      zIndex: 99999,
    });
  };

  // Calculate position when opening
  useEffect(() => {
    if (isOpen) {
      calculateDropdownPosition();
    }
  }, [isOpen, availableStatuses.length]);

  // Close dropdown on scroll (but allow scrolling inside dropdown)
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (event: Event) => {
      // Don't close if scrolling inside the dropdown
      if (
        dropdownRef.current &&
        dropdownRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setIsOpen(false);
    };

    // Listen to scroll on window and all scrollable parents
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  // Close dropdown on window resize
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setIsOpen(false);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    // Small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleStatusChange = async (statusId: string) => {
    setIsUpdating(true);
    try {
      const result = await updateCampaignInfluencerStatus(
        influencer.campaign_influencer_id,
        influencer.id,
        statusId,
      );

      const foundStatus = availableStatuses.find((s) => s.id === statusId);
      if (foundStatus && onUpdate) {
        const updatedMember: AssignmentInfluencer = {
          ...influencer,
          // Keep assigned_influencer status as-is (or update if needed)
          status: influencer.status,
          campaign_influencer: {
            ...influencer.campaign_influencer,
            // Update campaign_influencer status_id
            status_id: statusId,
            status: {
              id: foundStatus.id,
              name: foundStatus.name,
              model: 'campaign_influencer',
            },
          },
          updated_at: new Date().toISOString(),
        };
        onUpdate(updatedMember);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert(
        `Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Check if a status option is the currently selected one
  const isCurrentStatus = (statusId: string) => {
    return statusId === currentStatusId;
  };

  // Dropdown content to be portaled
  const dropdownContent =
    isOpen && mounted ? (
      <div
        ref={dropdownRef}
        className="bg-white rounded-lg shadow-2xl border border-gray-200 py-1 overflow-hidden"
        style={dropdownStyle}
      >
        <div className="overflow-y-auto" style={{ maxHeight: 'inherit' }}>
          {availableStatuses.map((status) => (
            <button
              key={status.id}
              onClick={() => handleStatusChange(status.id)}
              disabled={isUpdating}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center ${
                isCurrentStatus(status.id)
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-700'
              }`}
            >
              {isUpdating && isCurrentStatus(status.id) ? (
                <div className="flex items-center">
                  <InlineSpinner size="sm" />
                  <span className="ml-2">Updating...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-3 bg-current opacity-60"></div>
                  {formatStatusName(status.name)}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <>
      <div className="inline-flex items-center space-x-1">
        <ContactStatusBadge status={currentStatusName} />
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors group"
          title="Change status"
        >
          <ChevronDown
            className={`w-3 h-3 text-gray-400 group-hover:text-teal-600 transition-all ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Render dropdown via Portal to document.body */}
      {mounted &&
        dropdownContent &&
        createPortal(dropdownContent, document.body)}
    </>
  );
}