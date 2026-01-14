// src/components/common/DataTable/DataTableFilters.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { FilterConfig } from '@/types/DataTable_types';

interface DataTableFiltersProps {
  filters: FilterConfig[];
  onFilter?: (filters: Record<string, any>) => void;
}

export default function DataTableFilters({
  filters,
  onFilter,
}: DataTableFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
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
    setIsOpen(false);
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={activeFilters[`${filter.field}_to`] || ''}
              onChange={(e) => handleFilterChange(`${filter.field}_to`, e.target.value)}
              placeholder="To"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium text-white bg-blue-600 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Filter Options</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

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

          <div className="p-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && !isOpen && (
        <div className="absolute top-full left-0 mt-2 flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([field, value]) => {
            const filter = filters.find((f) => f.field === field || field.startsWith(f.field));
            if (!filter || !value) return null;

            return (
              <span
                key={field}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
              >
                <span>
                  {filter.label}: {value.toString()}
                </span>
                <button
                  onClick={() => handleFilterChange(field, null)}
                  className="hover:text-blue-900"
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
  );
}