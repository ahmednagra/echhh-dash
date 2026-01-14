// // src/components/common/DataTable/DataTable.tsx
// 'use client';

// import { useState } from 'react';
// import { DataTableProps } from '@/types/DataTable_types';
// import DataTableHeader from './DataTableHeader';
// import DataTablePagination from './DataTablePagination';

// export default function DataTable<T extends Record<string, any>>({
//   data,
//   columns,
//   pagination,
//   filters,
//   inlineFilters,
//   searchable = false,
//   searchPlaceholder = 'Search...',
//   onSearch,
//   onSort,
//   onFilter,
//   onInlineFilterChange,
//   actions,
//   bulkActions,
//   loading = false,
//   emptyState,
// }: DataTableProps<T>) {
//   const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
//   const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

//   const handleSort = (key: string) => {
//     const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
//     setSortConfig({ key, direction });
//     onSort?.(key, direction);
//   };

//   const handleSelectAll = () => {
//     if (selectedRows.size === data.length) {
//       setSelectedRows(new Set());
//     } else {
//       setSelectedRows(new Set(data.map((_, idx) => idx.toString())));
//     }
//   };

//   return (
//     <div className="w-full space-y-4">
//       {/* Unified Header - Search and Filters */}
//       <DataTableHeader
//         searchable={searchable}
//         searchPlaceholder={searchPlaceholder}
//         onSearch={onSearch}
//         inlineFilters={inlineFilters}
//         filters={filters}
//         onInlineFilterChange={onInlineFilterChange}
//         onFilter={onFilter}
//       />

//       {/* Bulk Actions */}
//       {selectedRows.size > 0 && bulkActions && (
//         <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
//           <span className="text-sm text-blue-700">
//             {selectedRows.size} selected
//           </span>
//           {bulkActions}
//         </div>
//       )}

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
//         <table className="w-full">
//           <thead className="bg-gray-50 border-b border-gray-200">
//             <tr>
//               {bulkActions && (
//                 <th className="w-12 px-4 py-3">
//                   <input
//                     type="checkbox"
//                     checked={selectedRows.size === data.length && data.length > 0}
//                     onChange={handleSelectAll}
//                     className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
//                   />
//                 </th>
//               )}
//               {columns.map((column) => (
//                 <th
//                   key={column.key.toString()}
//                   className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
//                   style={{ width: column.width }}
//                 >
//                   {column.sortable ? (
//                     <button
//                       onClick={() => handleSort(column.key.toString())}
//                       className="flex items-center gap-1 hover:text-gray-900 transition-colors group"
//                     >
//                       <span>{column.label}</span>
//                       <span className="text-gray-400 group-hover:text-gray-600">
//                         {sortConfig?.key === column.key ? (
//                           sortConfig.direction === 'asc' ? '↑' : '↓'
//                         ) : (
//                           '↕'
//                         )}
//                       </span>
//                     </button>
//                   ) : (
//                     column.label
//                   )}
//                 </th>
//               ))}
//               {actions && (
//                 <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
//                   Actions
//                 </th>
//               )}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {loading ? (
//               <tr>
//                 <td 
//                   colSpan={columns.length + (actions ? 1 : 0) + (bulkActions ? 1 : 0)} 
//                   className="px-4 py-12 text-center"
//                 >
//                   <div className="flex flex-col items-center justify-center space-y-3">
//                     <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600"></div>
//                     <p className="text-sm text-gray-500">Loading...</p>
//                   </div>
//                 </td>
//               </tr>
//             ) : data.length === 0 ? (
//               <tr>
//                 <td 
//                   colSpan={columns.length + (actions ? 1 : 0) + (bulkActions ? 1 : 0)} 
//                   className="px-4 py-12"
//                 >
//                   {emptyState || (
//                     <div className="text-center">
//                       <svg 
//                         className="mx-auto h-12 w-12 text-gray-400"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
//                         />
//                       </svg>
//                       <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
//                       <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             ) : (
//               data.map((row, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50 transition-colors">
//                   {bulkActions && (
//                     <td className="px-4 py-4">
//                       <input
//                         type="checkbox"
//                         checked={selectedRows.has(idx.toString())}
//                         onChange={() => {
//                           const newSelected = new Set(selectedRows);
//                           if (newSelected.has(idx.toString())) {
//                             newSelected.delete(idx.toString());
//                           } else {
//                             newSelected.add(idx.toString());
//                           }
//                           setSelectedRows(newSelected);
//                         }}
//                         className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
//                       />
//                     </td>
//                   )}
//                   {columns.map((column) => (
//                     <td 
//                       key={column.key.toString()} 
//                       className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap"
//                     >
//                       {column.render
//                         ? column.render(row[column.key as keyof T], row)
//                         : row[column.key as keyof T]?.toString() || '-'}
//                     </td>
//                   ))}
//                   {actions && (
//                     <td className="px-4 py-4 text-right whitespace-nowrap">
//                       {actions(row)}
//                     </td>
//                   )}
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {pagination && pagination.total > 0 && (
//         <DataTablePagination {...pagination} />
//       )}
//     </div>
//   );
// }


// src/components/common/DataTable/DataTable.tsx
'use client';

import { useState } from 'react';
import { DataTableProps } from '@/types/DataTable_types';
import DataTableHeader from './DataTableHeader';
import DataTablePagination from './DataTablePagination';

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pagination,
  filters,
  inlineFilters,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  onSort,
  onFilter,
  onInlineFilterChange,
  actions,
  bulkActions,
  loading = false,
  emptyState,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, idx) => idx.toString())));
    }
  };

  return (
    <div className="w-full space-y-0">
      {/* Unified Header - Search and Filters */}
      <DataTableHeader
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        onSearch={onSearch}
        inlineFilters={inlineFilters}
        filters={filters}
        onInlineFilterChange={onInlineFilterChange}
        onFilter={onFilter}
      />

      {/* Bulk Actions */}
      {selectedRows.size > 0 && bulkActions && (
        <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg mb-4">
          <span className="text-sm text-blue-700">
            {selectedRows.size} selected
          </span>
          {bulkActions}
        </div>
      )}

      {/* Table - Matching Users page styling */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ overflowX: 'auto', overflowY: 'visible' }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {bulkActions && (
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key.toString())}
                      className="flex items-center gap-1 hover:text-gray-900 transition-colors group"
                    >
                      <span>{column.label}</span>
                      <span className="text-gray-400 group-hover:text-gray-600">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : (
                          '↕'
                        )}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0) + (bulkActions ? 1 : 0)} 
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                    <p className="text-gray-500">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions ? 1 : 0) + (bulkActions ? 1 : 0)} 
                  className="px-6 py-12"
                >
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg 
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-gray-500 font-medium">No data found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  {bulkActions && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(idx.toString())}
                        onChange={() => {
                          const newSelected = new Set(selectedRows);
                          if (newSelected.has(idx.toString())) {
                            newSelected.delete(idx.toString());
                          } else {
                            newSelected.add(idx.toString());
                          }
                          setSelectedRows(newSelected);
                        }}
                        className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td 
                      key={column.key.toString()} 
                      className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(row[column.key as keyof T], row)
                        : row[column.key as keyof T]?.toString() || '-'}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <DataTablePagination {...pagination} />
      )}
    </div>
  );
}