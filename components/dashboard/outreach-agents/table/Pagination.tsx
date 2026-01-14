// src/components/agents/OutreachAgentsTable/Pagination.tsx
'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { OutreachAgentsPagination } from '@/types/outreach-agents';

interface PaginationProps {
  pagination: OutreachAgentsPagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onPageSizeChange
}) => {
  const { page, page_size, total_items, total_pages, has_next, has_previous } = pagination;

  const startItem = total_items === 0 ? 0 : (page - 1) * page_size + 1;
  const endItem = Math.min(page * page_size, total_items);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    
    if (total_pages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (page > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      for (let i = Math.max(2, page - 1); i <= Math.min(total_pages - 1, page + 1); i++) {
        pages.push(i);
      }
      
      if (page < total_pages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(total_pages);
    }
    
    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Results Info */}
        <div className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">{startItem}</span>
          {' '}-{' '}
          <span className="font-medium">{endItem}</span>
          {' '}of{' '}
          <span className="font-medium">{total_items}</span>
          {' '}agents
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-gray-700">
            Per page:
          </label>
<select
            id="pageSize"
            value={page_size}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value={total_items}>All</option>
          </select>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={!has_previous}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((pageNum, index) => (
              <React.Fragment key={index}>
                {pageNum === '...' ? (
                  <span className="px-3 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onPageChange(pageNum as number)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      page === pageNum
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={!has_next}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;