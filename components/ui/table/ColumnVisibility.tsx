// src/components/ui/table/ColumnVisibility.tsx
'use client';

import React from 'react';

export interface ColumnDefinition<T = any> {
  key: string;
  label: string;
  width: string;
  defaultVisible: boolean;
  getValue: (item: T) => string | number | null;
  render?: (value: any, item: T) => React.ReactNode;
}

interface ColumnVisibilityProps<T> {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnDefinition<T>[];
  visibleColumns: Set<string>;
  onToggleColumn: (columnKey: string) => void;
  data: T[];
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

function ColumnVisibility<T>({
  isOpen,
  onClose,
  columns,
  visibleColumns,
  onToggleColumn,
  data,
  position = 'top-right',
  className = ''
}: ColumnVisibilityProps<T>) {
  if (!isOpen) return null;

  // Position classes mapping
  const positionClasses = {
    'top-right': 'right-4 top-20',
    'top-left': 'left-4 top-20',
    'bottom-right': 'right-4 bottom-20',
    'bottom-left': 'left-4 bottom-20'
  };

  // Check if any item has data for a specific column
  const hasData = (column: ColumnDefinition<T>) => {
    return data.some(item => {
      const value = column.getValue(item);
      return value !== null && value !== undefined && value !== '';
    });
  };

  // Select all columns with data
  const handleSelectAll = () => {
    const columnsWithData = new Set<string>();
    columns.forEach(column => {
      if (hasData(column) || column.defaultVisible) {
        columnsWithData.add(column.key);
      }
    });
    
    // Apply all changes at once
    columnsWithData.forEach(key => {
      if (!visibleColumns.has(key)) {
        onToggleColumn(key);
      }
    });
  };

  // Reset to default visible columns
  const handleReset = () => {
    // First, hide all non-default columns
    columns.forEach(column => {
      if (!column.defaultVisible && visibleColumns.has(column.key)) {
        onToggleColumn(column.key);
      }
    });
    
    // Then, show all default columns
    columns.forEach(column => {
      if (column.defaultVisible && !visibleColumns.has(column.key)) {
        onToggleColumn(column.key);
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      
      {/* Dropdown */}
      <div className={`fixed ${positionClasses[position]} w-56 bg-white rounded-lg shadow-2xl border border-gray-300 z-50 max-h-[28rem] overflow-hidden ${className}`}>
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center">
            <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            Column Visibility
          </h3>
        </div>
        
        {/* Column List */}
        <div className="py-3 max-h-80 overflow-y-auto">
          {columns.map((column) => {
            const columnHasData = hasData(column);
            
            return (
              <label
                key={column.key}
                className="flex items-center px-5 py-3 hover:bg-gradient-to-r hover:from-purple-25 hover:to-pink-25 cursor-pointer transition-all duration-150 group"
              >
                <input
                  type="checkbox"
                  checked={visibleColumns.has(column.key)}
                  onChange={() => onToggleColumn(column.key)}
                  className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 transition-colors"
                />
                <div className="ml-3 flex-1 min-w-0">
                  <span className={`text-sm font-medium block truncate transition-colors ${
                    columnHasData 
                      ? 'text-gray-900 group-hover:text-purple-700' 
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}>
                    {column.label}
                  </span>
                </div>
                {/* Data availability indicator */}
                <div className="ml-2 flex-shrink-0">
                  {columnHasData ? (
                    <div className="w-2 h-2 bg-green-400 rounded-full" title="Data available"></div>
                  ) : (
                    <div className="w-2 h-2 bg-gray-300 rounded-full" title="No data"></div>
                  )}
                </div>
              </label>
            );
          })}
          {/* Extra spacing at bottom of column list */}
          <div className="h-2"></div>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handleSelectAll}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            Select All
          </button>
          <button
            onClick={handleReset}
            className="text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors"
          >
            Reset
          </button>
        </div>
        
        {/* Bottom spacing for visual separation */}
        <div className="h-3 bg-gray-50"></div>
      </div>
    </>
  );
}

export default ColumnVisibility;