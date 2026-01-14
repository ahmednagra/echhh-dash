// src/components/navbar/CampaignsDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Plus, List } from 'react-feather';
import { useCampaigns } from '@/context/CampaignContext';

interface CampaignsDropdownProps {
  isOpen: boolean;
  toggleDropdown: (e: React.MouseEvent) => void;
  closeDropdown: () => void;
}

export default function CampaignsDropdown({ 
  isOpen, 
  toggleDropdown,
  closeDropdown
}: CampaignsDropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { campaigns, isLoading, error, refreshCampaigns } = useCampaigns();

  // Auto-close functionality
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    
    // Only add listeners when dropdown is open
    if (isOpen) {
      // Add a small delay to prevent immediate closing
      setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
      }, 0);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, closeDropdown]);

  // Handle ESC key to close dropdown
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeDropdown();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, closeDropdown]);

  // Refresh campaigns when dropdown opens
  useEffect(() => {
    if (isOpen) {
      refreshCampaigns();
    }
  }, [isOpen, refreshCampaigns]);

  // Filter campaigns based on search query
  const filteredCampaigns = searchQuery
    ? campaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : campaigns;

  // Handle dropdown click to prevent immediate closing
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Determine campaign status display
  const getCampaignStatusDisplay = (status: string) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    switch(status) {
      case 'active':
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        break;
      case 'draft':
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-800';
        break;
      case 'scheduled':
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        break;
      case 'completed':
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        break;
      case 'paused':
        bgColor = 'bg-yellow-100';
        textColor = 'text-yellow-800';
        break;
      default:
        break;
    }

    return `${bgColor} ${textColor}`;
  };

  // Format status text
  const formatStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        onClick={toggleDropdown}
        className="bg-white text-gray-700 px-4 py-2 rounded-full border border-gray-200 flex items-center space-x-2 hover:bg-gray-50 transition"
      >
        <span className="text-sm font-medium">Campaigns</span>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-1 w-80 bg-white rounded-md shadow-lg z-10 border border-gray-200"
          onClick={handleDropdownClick}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-gray-700 font-medium">Your Campaigns</h3>
          </div>
          
          {/* Search bar */}
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          {/* Campaign list */}
          <div className="max-h-72 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin h-6 w-6 border-t-2 border-b-2 border-purple-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Loading campaigns...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-red-500">{error}</p>
                <button 
                  onClick={() => refreshCampaigns()}
                  className="mt-2 text-xs text-purple-600 hover:text-purple-800"
                >
                  Try again
                </button>
              </div>
            ) : filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                  onClick={closeDropdown}
                >
                  <span className="text-gray-700 truncate pr-2 flex-1">{campaign.name}</span>
                  <span className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                    getCampaignStatusDisplay(campaign.status?.name)
                  }`}>
                    {formatStatusText(campaign.status?.name)}
                  </span>
                </Link>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'No campaigns match your search.' : 'No campaigns found.'}
                </p>
              </div>
            )}
          </div>
          
          {/* Create new button and view all */}
          <div className="border-t border-gray-100">
            <div className="px-4 py-3">
              <Link
                href="/campaigns/new"
                className="flex items-center text-purple-600 hover:text-purple-800"
                onClick={closeDropdown}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Campaign
              </Link>
            </div>
            
            <div className="border-t border-gray-100 text-center py-2">
              <Link
                href="/campaigns"
                className="text-blue-500 hover:text-blue-700 text-sm flex items-center justify-center"
                onClick={closeDropdown}
              >
                <List className="h-3 w-3 mr-1" />
                View All Campaigns
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}