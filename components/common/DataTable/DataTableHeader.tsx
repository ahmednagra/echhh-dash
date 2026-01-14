// src/components/common/DataTable/DataTableHeader.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter } from 'react-feather';
import { FilterConfig, InlineFilter } from '@/types/DataTable_types';

interface DataTableHeaderProps {
  // Search props
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  debounceMs?: number;
  
  // Filter props
  inlineFilters?: InlineFilter[];
  filters?: FilterConfig[];
  onInlineFilterChange?: (field: string, value: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
}

// Custom debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) clearTimeout(timeout);
  };

  return debounced;
}

export default function DataTableHeader({
  searchable,
  searchPlaceholder = 'Search...',
  onSearch,
  debounceMs = 500,
  inlineFilters,
  filters,
  onInlineFilterChange,
  onFilter,
}: DataTableHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onSearch?.(query);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...activeFilters };
    
    if (value === '' || value === null || value === undefined) {
      delete newFilters[field];
    } else {
      newFilters[field] = value;
    }
    
    setActiveFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilter?.(activeFilters);
    setIsFilterDropdownOpen(false);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    onFilter?.({});
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  const renderFilterInput = (filter: FilterConfig) => {
    const value = activeFilters[filter.field] || '';

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            placeholder={`Enter ${filter.label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="">All</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          />
        );

      case 'daterange':
        return (
          <div className="space-y-2">
            <input
              type="date"
              value={activeFilters[`${filter.field}_from`] || ''}
              onChange={(e) => handleFilterChange(`${filter.field}_from`, e.target.value)}
              placeholder="From"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
            <input
              type="date"
              value={activeFilters[`${filter.field}_to`] || ''}
              onChange={(e) => handleFilterChange(`${filter.field}_to`, e.target.value)}
              placeholder="To"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Don't render if no search or filters
  if (!searchable && !inlineFilters && !filters) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar - Left Side */}
        {searchable && (
          <div className="flex-1 max-w-full sm:max-w-md relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white"
            />
            
            {/* Search Icon or Clear Button */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {searchQuery ? (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <Search className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        )}

        {/* Filters - Right Side */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* Inline Filters (Users Page Style) */}
          {inlineFilters && inlineFilters.length > 0 && (
            <>
              {inlineFilters.map((filter) => (
                <select
                  key={filter.field}
                  value={filter.value || ''}
                  onChange={(e) => onInlineFilterChange?.(filter.field, e.target.value)}
                  className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-200 min-w-[140px] focus:outline-none cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </>
          )}

          {/* Advanced Dropdown Filters (Plans Page Style) */}
          {filters && filters.length > 0 && (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 whitespace-nowrap"
              >
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium text-white bg-pink-600 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Dropdown Panel */}
              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">Filter Options</h3>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={handleClearFilters}
                          className="text-sm text-pink-600 hover:text-pink-700 font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Fields */}
                  <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {filters.map((filter) => (
                      <div key={filter.field}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {filter.label}
                        </label>
                        {renderFilterInput(filter)}
                      </div>
                    ))}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={handleClearFilters}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Active Filter Badges */}
              {activeFilterCount > 0 && !isFilterDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 flex flex-wrap gap-2 max-w-md">
                  {Object.entries(activeFilters).map(([field, value]) => {
                    const filter = filters.find((f) => f.field === field || field.startsWith(f.field));
                    if (!filter || !value) return null;

                    return (
                      <span
                        key={field}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-xs font-medium"
                      >
                        <span>
                          {filter.label}: {value.toString()}
                        </span>
                        <button
                          onClick={() => handleFilterChange(field, null)}
                          className="hover:text-pink-900"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}