// src/components/dashboard/campaign-funnel/outreach/selected-manually/ActionsDropdown.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { MoreVertical, Eye, Edit, DollarSign } from 'react-feather';

interface ActionsDropdownProps {
  influencerId: string;
  onView?: () => void;
  onEdit?: () => void;
  onCounterBudget?: (event: React.MouseEvent) => void;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  influencerId,
  onView,
  onEdit,
  onCounterBudget
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Check if we're on the ready-to-onboard page with token
  const isReadyToOnboardPage = pathname === '/ready-to-onboard' && searchParams.has('token');

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

  const handleAction = (action: (() => void) | undefined) => {
    if (action) {
      action();
    }
    setIsOpen(false);
  };

  const handleCounterBudgetAction = (event: React.MouseEvent) => {
    if (onCounterBudget) {
      onCounterBudget(event);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-50 rounded transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="py-1">
            <button
              onClick={() => handleAction(onView)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <Eye className="w-4 h-4 mr-3" />
              View Details
            </button>
            {/* <button
              onClick={() => handleAction(onEdit)}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <Edit className="w-4 h-4 mr-3" />
              Edit
            </button> */}
            
            {/* Hide Counter Budget button on ready-to-onboard page with token */}
            {!isReadyToOnboardPage && (
              <button
                onClick={handleCounterBudgetAction}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <DollarSign className="w-4 h-4 mr-3" />
                Counter Budget
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsDropdown;