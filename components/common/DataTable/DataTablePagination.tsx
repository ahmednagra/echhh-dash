// src/components/common/DataTable/DataTablePagination.tsx
'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { PaginationConfig } from '@/types/DataTable_types';

export default function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationConfig) {
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
  
  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const pageSizeOptions = [10, 25, 50, 100];

  // Advanced page number calculation with ellipsis
  const getVisiblePages = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (page <= 4) {
        // Near start: show 1, 2, 3, 4, 5, ..., last
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push('...');
        }
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        // Near end: show 1, ..., last-4, last-3, last-2, last-1, last
        if (totalPages > 6) {
          pages.push('...');
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          if (i > 1) {
            pages.push(i);
          }
        }
      } else {
        // In middle: show 1, ..., current-1, current, current+1, ..., last
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side - Results info and page size selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </span>
          
          {/* Page Size Selector with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 hover:shadow-md transition-all duration-200"
            >
              <span className="text-gray-700">{pageSize} per page</span>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showPageSizeDropdown && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowPageSizeDropdown(false)}
                />
                {/* Dropdown Menu */}
                <div className="absolute bottom-full left-0 mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  {pageSizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        onPageSizeChange(size);
                        setShowPageSizeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors ${
                        pageSize === size ? 'bg-pink-50 text-pink-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {size} per page
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right side - Page navigation */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-200"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getVisiblePages().map((pageItem, index) => (
              <React.Fragment key={index}>
                {pageItem === '...' ? (
                  <span className="px-3 py-2 text-sm text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(pageItem as number)}
                    className={`min-w-[40px] px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      pageItem === page
                        ? 'bg-pink-600 text-white font-medium shadow-lg shadow-pink-500/20'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    {pageItem}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-200"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}