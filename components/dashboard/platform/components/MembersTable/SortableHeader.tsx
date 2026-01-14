// src/components/dashboard/platform/components/MembersTable/SortableHeader.tsx

'use client';

import { SortConfig } from './types';

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort: SortConfig | null;
  onSort: (key: string) => void;
}

export default function SortableHeader({ 
  children, 
  sortKey, 
  currentSort, 
  onSort 
}: SortableHeaderProps) {
  const isActive = currentSort?.key === sortKey;
  const direction = currentSort?.direction;

  return (
    <button
      onClick={() => onSort(sortKey)}
      className="flex items-center gap-1.5 text-left w-full hover:text-gray-900 transition-colors group"
    >
      <span className="group-hover:text-teal-600 transition-colors">{children}</span>
      <div className="flex flex-col">
        <svg 
          className={`w-3 h-3 ${isActive && direction === 'asc' ? 'text-teal-600' : 'text-gray-300'}`}
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 5l-8 8h16z"/>
        </svg>
        <svg 
          className={`w-3 h-3 -mt-1 ${isActive && direction === 'desc' ? 'text-teal-600' : 'text-gray-300'}`}
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 19l-8-8h16z"/>
        </svg>
      </div>
    </button>
  );
}