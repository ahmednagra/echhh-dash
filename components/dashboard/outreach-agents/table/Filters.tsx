// src/components/dashboard/outreach-agents/table/Filters.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Instagram, Mail, MessageCircle, X, ChevronDown } from 'react-feather';

interface FiltersProps {
  searchTerm: string;
  filterType: string;
  filterStatus: string;
  onSearchChange: (term: string) => void;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
}

// Type options with enhanced metadata and color themes
const typeOptions = [
  { 
    value: 'all', 
    label: 'All Types', 
    icon: null, 
    color: 'gray', 
    bgHover: 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100',
    description: 'View all agent types' 
  },
  { 
    value: 'instagram', 
    label: 'Instagram', 
    icon: Instagram, 
    color: 'pink', 
    bgHover: 'hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50',
    description: 'Social media outreach' 
  },
  { 
    value: 'email', 
    label: 'Email', 
    icon: Mail, 
    color: 'blue', 
    bgHover: 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50',
    description: 'Email campaigns' 
  },
  { 
    value: 'whatsapp', 
    label: 'WhatsApp', 
    icon: MessageCircle, 
    color: 'green', 
    bgHover: 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50',
    description: 'Messaging outreach' 
  }
];

// Status options with enhanced metadata and color themes
const statusOptions = [
  { 
    value: 'all', 
    label: 'All Status', 
    color: 'gray', 
    dotColor: 'bg-gray-400',
    bgHover: 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100',
    description: 'View all statuses' 
  },
  { 
    value: 'active', 
    label: 'Active', 
    color: 'green', 
    dotColor: 'bg-green-500',
    bgHover: 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50',
    description: 'Currently working' 
  },
  { 
    value: 'inactive', 
    label: 'Inactive', 
    color: 'gray', 
    dotColor: 'bg-gray-400',
    bgHover: 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50',
    description: 'Not active' 
  },
  { 
    value: 'pending', 
    label: 'Pending', 
    color: 'yellow', 
    dotColor: 'bg-yellow-500',
    bgHover: 'hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50',
    description: 'Awaiting action' 
  },
  { 
    value: 'suspended', 
    label: 'Suspended', 
    color: 'red', 
    dotColor: 'bg-red-500',
    bgHover: 'hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50',
    description: 'Temporarily disabled' 
  }
];

const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  filterType,
  filterStatus,
  onSearchChange,
  onTypeChange,
  onStatusChange
}) => {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected option labels
  const selectedTypeOption = typeOptions.find(opt => opt.value === filterType);
  const selectedStatusOption = statusOptions.find(opt => opt.value === filterStatus);

  // Clear search
  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
        <h3 className="text-sm font-semibold text-gray-700">Filter Agents</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ========================================
            SEARCH INPUT - Soft Border Design
        ======================================== */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm
                     border border-gray-200 rounded-lg
                     bg-gray-50/50 hover:bg-white hover:border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300
                     transition-all duration-200
                     placeholder:text-gray-400"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 
                       text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ========================================
            TYPE DROPDOWN - Animated Hover
        ======================================== */}
        <div className="relative" ref={typeDropdownRef}>
          <button
            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            className="w-full px-4 py-2.5 text-sm text-left
                     border border-gray-200 rounded-lg
                     bg-gray-50/50 hover:bg-white hover:border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300
                     transition-all duration-200
                     flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              {selectedTypeOption?.icon && (
                <selectedTypeOption.icon className={`w-4 h-4 text-${selectedTypeOption.color}-500`} />
              )}
              <span className="text-gray-700 font-medium">{selectedTypeOption?.label}</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 
                        ${isTypeDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu - Animated Hover Effects */}
          {isTypeDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden
                          animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-1.5 space-y-0.5">
                {typeOptions.map((option, index) => {
                  const Icon = option.icon;
                  const isSelected = filterType === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onTypeChange(option.value);
                        setIsTypeDropdownOpen(false);
                      }}
                      style={{
                        animationDelay: `${index * 30}ms`
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-left
                               transition-all duration-200 group
                               flex items-center gap-2.5
                               animate-in fade-in slide-in-from-left-1
                               transform hover:scale-[1.02] hover:shadow-md
                               ${option.bgHover}
                               ${isSelected 
                                 ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-200 shadow-sm' 
                                 : 'border border-transparent hover:border-gray-200'
                               }`}
                    >
                      {/* Icon with animated background */}
                      <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center
                                    transition-all duration-300
                                    ${isSelected 
                                      ? `bg-${option.color}-100 shadow-sm` 
                                      : 'bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-indigo-100 group-hover:to-purple-100'
                                    }
                                    group-hover:scale-110 group-hover:rotate-6`}>
                        {Icon ? (
                          <Icon className={`w-3.5 h-3.5 transition-all duration-300
                                         ${isSelected ? `text-${option.color}-600` : 'text-gray-500 group-hover:text-indigo-600'}`} />
                        ) : (
                          <div className={`w-2 h-2 rounded-full transition-all duration-300
                                        ${isSelected ? 'bg-gray-600' : 'bg-gray-400 group-hover:bg-indigo-500'}`}></div>
                        )}
                      </div>

                      {/* Text Content with hover animation */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-semibold leading-none transition-all duration-200
                                         ${isSelected ? 'text-indigo-700' : 'text-gray-700 group-hover:text-indigo-600'}`}>
                            {option.label}
                          </span>
                          <span className="text-xs text-gray-400 group-hover:text-indigo-400 transition-colors">·</span>
                          <span className="text-xs text-gray-500 group-hover:text-indigo-500 truncate transition-colors">
                            {option.description}
                          </span>
                        </div>
                      </div>

                      {/* Animated Check Mark */}
                      {isSelected && (
                        <div className="flex-shrink-0 animate-in zoom-in duration-200">
                          <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center
                                        group-hover:bg-indigo-600 transition-colors">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================
            STATUS DROPDOWN - Animated Hover
        ======================================== */}
        <div className="relative" ref={statusDropdownRef}>
          <button
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            className="w-full px-4 py-2.5 text-sm text-left
                     border border-gray-200 rounded-lg
                     bg-gray-50/50 hover:bg-white hover:border-gray-300
                     focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300
                     transition-all duration-200
                     flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${selectedStatusOption?.dotColor}`}></div>
              <span className="text-gray-700 font-medium">{selectedStatusOption?.label}</span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 
                        ${isStatusDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu - Animated Hover Effects */}
          {isStatusDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden
                          animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-1.5 space-y-0.5">
                {statusOptions.map((option, index) => {
                  const isSelected = filterStatus === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onStatusChange(option.value);
                        setIsStatusDropdownOpen(false);
                      }}
                      style={{
                        animationDelay: `${index * 30}ms`
                      }}
                      className={`w-full px-2.5 py-2 rounded-lg text-left
                               transition-all duration-200 group
                               flex items-center gap-2.5
                               animate-in fade-in slide-in-from-left-1
                               transform hover:scale-[1.02] hover:shadow-md
                               ${option.bgHover}
                               ${isSelected 
                                 ? 'bg-gradient-to-r from-indigo-50 to-indigo-100/50 border border-indigo-200 shadow-sm' 
                                 : 'border border-transparent hover:border-gray-200'
                               }`}
                    >
                      {/* Status Dot with animated container */}
                      <div className="flex-shrink-0">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center
                                      transition-all duration-300
                                      ${isSelected ? 'bg-indigo-100 shadow-sm' : 'bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-indigo-100 group-hover:to-purple-100'}
                                      group-hover:scale-110 group-hover:rotate-6`}>
                          <div className={`w-2.5 h-2.5 rounded-full ${option.dotColor}
                                        transition-all duration-300
                                        ${isSelected ? 'ring-2 ring-indigo-300 ring-offset-1' : 'group-hover:ring-2 group-hover:ring-indigo-200'}
                                        group-hover:scale-125 group-hover:animate-pulse`}>
                          </div>
                        </div>
                      </div>

                      {/* Text Content with hover animation */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-semibold leading-none transition-all duration-200
                                         ${isSelected ? 'text-indigo-700' : 'text-gray-700 group-hover:text-indigo-600'}`}>
                            {option.label}
                          </span>
                          <span className="text-xs text-gray-400 group-hover:text-indigo-400 transition-colors">·</span>
                          <span className="text-xs text-gray-500 group-hover:text-indigo-500 truncate transition-colors">
                            {option.description}
                          </span>
                        </div>
                      </div>

                      {/* Animated Check Mark */}
                      {isSelected && (
                        <div className="flex-shrink-0 animate-in zoom-in duration-200">
                          <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center
                                        group-hover:bg-indigo-600 transition-colors">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Active filters:</span>
            
            {searchTerm && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg
                            animate-in fade-in zoom-in duration-200">
                <Search className="w-3 h-3 text-indigo-600" />
                <span className="text-xs font-medium text-indigo-700">{searchTerm}</span>
                <button
                  onClick={handleClearSearch}
                  className="ml-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {filterType !== 'all' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg
                            animate-in fade-in zoom-in duration-200">
                {selectedTypeOption?.icon && (
                  <selectedTypeOption.icon className="w-3 h-3 text-indigo-600" />
                )}
                <span className="text-xs font-medium text-indigo-700">{selectedTypeOption?.label}</span>
                <button
                  onClick={() => onTypeChange('all')}
                  className="ml-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            {filterStatus !== 'all' && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg
                            animate-in fade-in zoom-in duration-200">
                <div className={`w-2 h-2 rounded-full ${selectedStatusOption?.dotColor}`}></div>
                <span className="text-xs font-medium text-indigo-700">{selectedStatusOption?.label}</span>
                <button
                  onClick={() => onStatusChange('all')}
                  className="ml-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;