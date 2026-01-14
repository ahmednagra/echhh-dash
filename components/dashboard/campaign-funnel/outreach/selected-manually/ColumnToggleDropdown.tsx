// src/components/dashboard/campaign-funnel/outreach/selected-manually/ColumnToggleDropdown.tsx
// UPDATED: Added security layer to only show admin-approved columns

'use client';

import React from 'react';
import { ColumnConfig } from './index';

interface ColumnToggleDropdownProps {
  allColumns: ColumnConfig[];
  visibleColumns: Set<string>;
  onToggleColumn: (columnKey: string) => void;
  showDropdown: boolean;
  onToggleDropdown: () => void;
}

const ColumnToggleDropdown: React.FC<ColumnToggleDropdownProps> = ({
  allColumns,
  visibleColumns,
  onToggleColumn,
  showDropdown,
  onToggleDropdown
}) => {
  // SECURITY NOTE: allColumns prop now only contains admin-approved columns
  // This component only displays what's passed to it, so security is handled upstream
  
  return (
    <div className="column-dropdown">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleDropdown();
        }}
        className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
        title="Toggle Columns"
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggleDropdown}></div>
          
          <div className="fixed right-4 top-20 w-56 bg-white rounded-lg shadow-2xl border border-gray-300 z-50 max-h-[28rem] overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Column Visibility
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {allColumns.length === 0 
                  ? 'No columns available'
                  : `Select from ${allColumns.length} available columns`
                }
              </p>
            </div>
            
            <div className="py-3 max-h-80 overflow-y-auto">
              {/* SECURITY: Only show admin-approved columns */}
              {allColumns.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-4a2 2 0 00-2-2H6a2 2 0 00-2 2v4a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No Columns Available</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Administrator has not approved any columns for display
                  </p>
                </div>
              ) : (
                allColumns.map((column) => (
                  <label key={column.key} className="flex items-center px-4 py-2 hover:bg-purple-50 cursor-pointer transition-colors duration-150">
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(column.key)}
                      onChange={() => onToggleColumn(column.key)}
                      className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                    />
                    <span className="text-sm text-gray-700 font-medium">{column.label}</span>
                    {/* Security indicator - show that this column is admin-approved */}
                    <div className="ml-auto flex-shrink-0">
                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Admin approved"></div>
                    </div>
                  </label>
                ))
              )}
            </div>
            
            {allColumns.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() => {
                    allColumns.forEach(col => {
                      if (!visibleColumns.has(col.key)) {
                        onToggleColumn(col.key);
                      }
                    });
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  title="Show all admin-approved columns"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    visibleColumns.forEach(key => {
                      if (!allColumns.find(col => col.key === key && col.defaultVisible)) {
                        onToggleColumn(key);
                      }
                    });
                    allColumns.forEach(col => {
                      if (col.defaultVisible && !visibleColumns.has(col.key)) {
                        onToggleColumn(col.key);
                      }
                    });
                  }}
                  className="text-xs text-gray-600 hover:text-gray-700 font-medium transition-colors"
                  title="Reset to default visible columns"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ColumnToggleDropdown;