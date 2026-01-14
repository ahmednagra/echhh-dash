// src/components/dashboard/outreach-agents/table/ActionDropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Users } from 'react-feather';

interface ActionDropdownProps {
  agentId: string;
  agentName: string;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ agentId, agentName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleViewProfile = () => {
    setIsOpen(false);
    console.log(`🔍 Navigating to agent profile: ${agentName} (ID: ${agentId})`);
    
    // Navigate to agent detail page
    const url = `/outreach-agents/${agentId}`;
    window.open(url, '_blank');
  };
  
  const handleViewContacts = () => {
    setIsOpen(false);
    alert(`View Contacts: ${agentName} (ID: ${agentId})`);
    // TODO: Implement actual contacts view logic
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Three Dots Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        aria-label="More actions"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* View Profile */}
          <button
            type="button"
            onClick={handleViewProfile}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
            <span>View Profile</span>
          </button>

          {/* View Contacts */}
          <button
            type="button"
            onClick={handleViewContacts}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Users className="w-4 h-4 text-gray-500" />
            <span>View Contacts</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;