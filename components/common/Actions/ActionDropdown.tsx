// src/components/common/Actions/ActionDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Edit, Trash2, MoreVertical } from 'react-feather';

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ActionDropdownProps {
  actions: Action[];
  mode?: 'dropdown' | 'inline'; // New prop to support inline buttons like Users page
}

export default function ActionDropdown({ actions, mode = 'dropdown' }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Inline mode - render buttons directly (like Users page)
  if (mode === 'inline' && actions.length <= 3) {
    return (
      <div className="flex items-center justify-center gap-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              action.variant === 'danger'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-blue-600 hover:bg-blue-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={action.label}
          >
            {action.icon || (
              action.label.toLowerCase().includes('edit') ? (
                <Edit className="w-4 h-4" />
              ) : action.label.toLowerCase().includes('delete') ? (
                <Trash2 className="w-4 h-4" />
              ) : (
                <MoreVertical className="w-4 h-4" />
              )
            )}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown mode - render three-dot menu
  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Actions menu"
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!action.disabled) {
                      action.onClick();
                      setIsOpen(false);
                    }
                  }}
                  disabled={action.disabled}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                    action.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}