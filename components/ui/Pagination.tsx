"use client";
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5; // Number of page buttons to show
  const halfVisible = Math.floor(maxVisiblePages / 2);

  // Calculate range of pages to show
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, currentPage + halfVisible);

  // Adjust if we're at the beginning or end
  if (currentPage <= halfVisible) {
    endPage = Math.min(maxVisiblePages, totalPages);
  }
  if (currentPage > totalPages - halfVisible) {
    startPage = Math.max(1, totalPages - maxVisiblePages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center mt-6">
      <nav className="inline-flex rounded-md shadow-sm -space-x-px">
        {/* First & Previous buttons */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          &laquo;
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          &lsaquo;
        </button>

        {/* Show first page + ellipsis if needed */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`px-4 py-2 border border-gray-300 ${
                1 === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              1
            </button>
            {startPage > 2 && <span className="px-4 py-2 border border-gray-300 bg-white">...</span>}
          </>
        )}

        {/* Page numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 border border-gray-300 ${
              page === currentPage
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Show last page + ellipsis if needed */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-4 py-2 border border-gray-300 bg-white">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`px-4 py-2 border border-gray-300 ${
                totalPages === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next & Last buttons */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          &raquo;
        </button>
      </nav>
    </div>
  );
};

export default Pagination;