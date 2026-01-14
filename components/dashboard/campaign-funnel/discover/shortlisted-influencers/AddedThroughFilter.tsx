// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/AddedThroughFilter.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, FileText, Search, Compass } from 'react-feather';
import { 
  AddedThroughFilterProps, 
  AddedThroughFilterOption, 
  AddedThroughFilterOptionConfig 
} from '@/types/added-through-filter';
const AddedThroughFilter: React.FC<AddedThroughFilterProps> = ({
  currentFilter,
  onFilterChange,
  filterCounts
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options configuration
  const filterOptions: AddedThroughFilterOptionConfig[] = [
  {
    value: 'all',
    label: 'All',
    icon: <Filter className="w-4 h-4" />
  },
  {
    value: 'import',
    label: 'Import', 
    icon: <FileText className="w-4 h-4" />
  },
  {
    value: 'search',
    label: 'Search',
    icon: <Search className="w-4 h-4" />
  },
  {
    value: 'discovery',
    label: 'Discovery',
    icon: <Compass className="w-4 h-4" />
  }
];

  const handleOptionSelect = (option: AddedThroughFilterOption) => {
    onFilterChange(option);
    setIsOpen(false);
  };

  const getCurrentOption = () => {
    return filterOptions.find(option => option.value === currentFilter) || filterOptions[0];
  };

  const isFilterActive = currentFilter !== 'all';
  const currentOption = getCurrentOption();
  

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
          bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
          transition-colors duration-200 relative
          ${isFilterActive ? 'border-purple-300 bg-purple-50' : ''}
        `}
      >
        {/* Icon */}
        <span className="mr-2 text-gray-500">
          {currentOption.icon}
        </span>
        
        {/* Label */}
        <span className="text-gray-700 hidden sm:inline">
          {currentOption.label}
        </span>

        {/* Count Badge */}
        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
          {filterCounts[currentFilter]}
        </span>

        {/* Active Filter Indicator */}
        {isFilterActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"></span>
        )}

        {/* Dropdown Arrow */}
        <ChevronDown className={`ml-2 w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150
                  flex items-center justify-between
                  ${currentFilter === option.value ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}
                `}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-gray-500">
                    {option.icon}
                  </span>
                  <span>{option.label}</span>
                </div>
                
                <span className={`
                  px-2 py-0.5 text-xs rounded-full font-medium
                  ${currentFilter === option.value ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}
                `}>
                  {filterCounts[option.value]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddedThroughFilter;