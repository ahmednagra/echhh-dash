// src/components/social-accounts/SocialAccountsFilters.tsx
'use client';

import React from 'react';
import { Search, Filter } from 'react-feather';

interface Platform {
  id: string;
  name: string;
  work_platform_id: string;
}

interface SocialAccountsFiltersProps {
  searchTerm: string;
  selectedPlatform: string;
  platforms: Platform[];
  onSearchChange: (value: string) => void;
  onPlatformChange: (platformId: string) => void;
  totalItems: number;
  selectedCount: number;
}

const SocialAccountsFilters: React.FC<SocialAccountsFiltersProps> = ({
  searchTerm,
  selectedPlatform,
  platforms,
  onSearchChange,
  onPlatformChange,
  totalItems,
  selectedCount
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Search by username or name..."
            />
          </div>
        </div>

        {/* Platform Filter */}
        <div className="sm:w-64">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            >
              <option value="">All Platforms</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-medium text-gray-900">{totalItems}</span>
            <span className="ml-1">total accounts</span>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center">
              <span className="font-medium text-purple-600">{selectedCount}</span>
              <span className="ml-1 text-purple-600">selected</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => onPlatformChange('')}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedPlatform === '' 
              ? 'bg-purple-100 text-purple-800 border border-purple-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          All Platforms
        </button>
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onPlatformChange(platform.id)}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedPlatform === platform.id
                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {platform.name}
          </button>
        ))}
      </div>

      {/* Active Filters Display */}
      {(searchTerm || selectedPlatform) && (
        <div className="mt-4 flex items-center space-x-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{searchTerm}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-400 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}
          {selectedPlatform && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Platform: {platforms.find(p => p.id === selectedPlatform)?.name}
              <button
                onClick={() => onPlatformChange('')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 text-green-400 hover:text-green-600"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={() => {
              onSearchChange('');
              onPlatformChange('');
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialAccountsFilters;