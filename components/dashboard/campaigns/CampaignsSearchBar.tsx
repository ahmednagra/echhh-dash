// src/components/dashboard/campaigns/CampaignsSearchBar.tsx
'use client';

import { Search, Menu, Filter } from 'react-feather';

interface CampaignsSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  className?: string;
  showActionButtons?: boolean;
}

export default function CampaignsSearchBar({
  searchQuery,
  onSearchChange,
  placeholder = "Search campaigns...",
  onFilterClick,
  onMenuClick,
  onSearchClick,
  className = "",
  showActionButtons = true
}: CampaignsSearchBarProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-4 mb-6 ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
        </div>
        
        {/* Action Buttons */}
        {showActionButtons && (
          <div className="flex space-x-2">
            <button
              onClick={onSearchClick}
              className="flex items-center border border-gray-200 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={onMenuClick}
              className="flex items-center border border-gray-200 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <button
              onClick={onFilterClick}
              className="flex items-center border border-gray-200 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              title="Filter"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}