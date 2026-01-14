// src/components/ui/TableSkeleton.tsx
'use client';

import React from 'react';

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showCheckbox?: boolean;
  showActionColumn?: boolean;
  className?: string;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columns,
  rows = 5,
  showCheckbox = true,
  showActionColumn = true,
  className = ''
}) => {
  const totalColumns = columns + (showCheckbox ? 1 : 0) + (showActionColumn ? 1 : 0);

  // Generate different skeleton patterns for variety
  const getSkeletonWidth = (index: number, isHeader: boolean = false) => {
    if (isHeader) {
      const headerWidths = ['w-20', 'w-24', 'w-16', 'w-28', 'w-32'];
      return headerWidths[index % headerWidths.length];
    }
    
    const contentWidths = ['w-16', 'w-20', 'w-12', 'w-24', 'w-14', 'w-18'];
    return contentWidths[index % contentWidths.length];
  };

  const getSkeletonHeight = (rowIndex: number) => {
    // Vary heights slightly for more realistic look
    const heights = ['h-4', 'h-3', 'h-4', 'h-3', 'h-4'];
    return heights[rowIndex % heights.length];
  };

  return (
    <div className={`w-full bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header Skeleton */}
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox Column */}
              {showCheckbox && (
                <th className="px-2 py-3 w-8">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              )}
              
              {/* Data Columns */}
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-2 py-3 text-left">
                  <div className={`${getSkeletonWidth(index, true)} h-4 bg-gray-200 rounded animate-pulse`}></div>
                </th>
              ))}
              
              {/* Action Column */}
              {showActionColumn && (
                <th className="px-2 py-3 w-20 text-center">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
                </th>
              )}
            </tr>
          </thead>

          {/* Body Skeleton */}
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {/* Checkbox Column */}
                {showCheckbox && (
                  <td className="px-2 py-4">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                )}

                {/* Data Columns */}
                {Array.from({ length: columns }).map((_, colIndex) => {
                  // Special handling for first column (usually name/avatar)
                  if (colIndex === 0) {
                    return (
                      <td key={colIndex} className="px-2 py-4">
                        <div className="flex items-center">
                          {/* Avatar skeleton */}
                          <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                          <div className="ml-4 flex-1">
                            {/* Name skeleton */}
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                            {/* Handle skeleton */}
                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                    );
                  }

                  // Regular column skeletons
                  return (
                    <td key={colIndex} className="px-2 py-4">
                      <div className={`${getSkeletonWidth(colIndex)} ${getSkeletonHeight(rowIndex)} bg-gray-200 rounded animate-pulse`}></div>
                    </td>
                  );
                })}

                {/* Action Column */}
                {showActionColumn && (
                  <td className="px-2 py-4 text-center">
                    <div className="flex justify-center space-x-1">
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="px-3 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex">
          {/* Previous/Next buttons */}
          <div className="h-8 w-8 bg-gray-200 rounded-l-md animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-r-md animate-pulse"></div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* "Showing X to Y" text */}
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          {/* Page size dropdown */}
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;