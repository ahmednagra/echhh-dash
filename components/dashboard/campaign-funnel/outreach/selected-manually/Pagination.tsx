// src/components/dashboard/campaign-funnel/outreach/selected-manually/Pagination.tsx
'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: string) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200">
      {/* Left side - Page navigation */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {totalPages <= 5 ? (
            // Show all pages if 5 or less
            Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                  page === currentPage 
                    ? 'bg-pink-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))
          ) : (
            // Smart pagination for many pages
            <>
              {currentPage > 2 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className="px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    1
                  </button>
                  {currentPage > 3 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                </>
              )}
              
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                const page = currentPage === 1 ? i + 1 : 
                             currentPage === totalPages ? totalPages - 2 + i :
                             currentPage - 1 + i;
                if (page > 0 && page <= totalPages) {
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-all ${
                        page === currentPage 
                          ? 'bg-pink-500 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              }).filter(Boolean)}
              
              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className="px-3.5 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </>
          )}
        </div>
        
        <button 
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Right side - Info and Show entries */}
      <div className="flex items-center space-x-6">
        <span className="text-sm text-gray-600">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> entries
        </span>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Show</span>
          <select 
            value={itemsPerPage === totalItems ? 'all' : itemsPerPage}
            onChange={(e) => onItemsPerPageChange(e.target.value)}
            className="text-sm text-gray-700 border border-gray-300 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-gray-400 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            {totalItems > 0 && (
              <option value="all">All</option>
            )}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Pagination;