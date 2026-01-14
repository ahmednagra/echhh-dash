// src/components/ui/Modal.tsx

'use client';

import { ReactNode } from 'react';
import { X } from 'react-feather';

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
  actions?: ModalAction[];
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  loading?: boolean;
}

const sizeClasses = {
  xs: 'max-w-xs',   // ~320px
  sm: 'max-w-sm',   // ~384px  
  md: 'max-w-md',   // ~448px
  lg: 'max-w-lg',   // ~512px
  xl: 'max-w-xl',   // ~576px
};

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'sm',
  children,
  actions = [],
  showCloseButton = true,
  closeOnOverlayClick = true,
  loading = false,
}: ModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && !loading) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="fixed inset-0"
        onClick={handleOverlayClick}
      />
      <div className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            {title && (
              <h2 className="text-base font-semibold text-gray-900 truncate">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>

        {/* Actions Footer */}
        {actions.length > 0 && (
          <div className="flex items-center justify-end space-x-2 px-4 py-3 border-t border-gray-200">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled || loading}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                  buttonVariants[action.variant || 'secondary']
                }`}
              >
                {action.loading && (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                )}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}