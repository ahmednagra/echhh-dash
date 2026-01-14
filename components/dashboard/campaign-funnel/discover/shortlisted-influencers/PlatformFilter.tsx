// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/PlatformFilter.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'react-feather';
import { BsInstagram, BsTiktok, BsYoutube } from 'react-icons/bs';
import { Globe } from 'lucide-react';
import {
  PlatformFilterProps,
  PlatformFilterOption,
  PlatformFilterOptionConfig,
} from '@/types/platform-filter';

const PlatformFilter: React.FC<PlatformFilterProps> = ({
  currentFilter,
  onFilterChange,
  filterCounts,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options configuration
  const filterOptions: PlatformFilterOptionConfig[] = [
    {
      value: 'all',
      label: 'All Platforms',
      icon: <Globe className="w-4 h-4" />,
      color: 'text-gray-600',
    },
    {
      value: 'instagram',
      label: 'Instagram',
      icon: <BsInstagram className="w-4 h-4" />,
      color: 'text-pink-500',
    },
    {
      value: 'tiktok',
      label: 'TikTok',
      icon: <BsTiktok className="w-4 h-4" />,
      color: 'text-black',
    },
    {
      value: 'youtube',
      label: 'YouTube',
      icon: <BsYoutube className="w-4 h-4" />,
      color: 'text-red-600',
    },
  ];

  const handleOptionSelect = (option: PlatformFilterOption) => {
    onFilterChange(option);
    setIsOpen(false);
  };

  const getCurrentOption = () => {
    return (
      filterOptions.find((option) => option.value === currentFilter) ||
      filterOptions[0]
    );
  };

  const isFilterActive = currentFilter !== 'all';
  const currentOption = getCurrentOption();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center px-4 py-2 text-sm rounded-full transition-all duration-200 border relative
          ${isFilterActive 
            ? 'font-bold bg-[#E8DFF5] text-[#6B4C9A] border-[#A590D1]' 
            : 'font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-sm transform hover:scale-[1.01]'
          }
        `}
      >
        <span className={`mr-2 ${currentOption.color}`}>
          {currentOption.icon}
        </span>
        <span className={isFilterActive ? 'text-purple-700' : 'text-gray-700'}>
          {currentOption.label}
        </span>
        <span className="ml-2 text-xs text-gray-500">
          ({filterCounts[currentFilter]})
        </span>
        <ChevronDown
          className={`ml-2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`
                  w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors 
                  flex items-center justify-between
                  ${currentFilter === option.value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className={option.color}>{option.icon}</span>
                  <span>{option.label}</span>
                </div>
                <span className="text-xs text-gray-500">
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

export default PlatformFilter;
