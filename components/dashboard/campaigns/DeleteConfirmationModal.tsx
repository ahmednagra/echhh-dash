// src/components/dashboard/campaigns/DeleteConfirmationModal.tsx
'use client';

import { useState } from 'react';
import { X, Trash2, AlertTriangle, RotateCcw } from 'react-feather';
import { DeleteType } from '@/types/campaign';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  itemName?: string;
  onConfirm: (deleteType: DeleteType) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
  // Enhanced props for different delete types
  showDeleteOptions?: boolean;
  isDeleted?: boolean; // If the item is already soft deleted
}

export default function DeleteConfirmationModal({
  isOpen,
  itemName = "",
  onConfirm,
  onCancel,
  isLoading = false,
  className = "",
  showDeleteOptions = true,
  isDeleted = false
}: DeleteConfirmationModalProps) {
  const [selectedDeleteType, setSelectedDeleteType] = useState<DeleteType>(() => {
    // Set default based on current state
    if (isDeleted) {
      return 'restore'; // Default to restore for deleted items
    } else {
      return 'soft'; // Default to soft delete for active items (only option now)
    }
  });

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDeleteType);
  };

  const getModalContent = () => {
    if (isDeleted) {
      // Campaign is already deleted, show restore/permanent delete options
      return {
        title: "Manage Deleted Campaign",
        description: `"${itemName}" is currently in trash. What would you like to do?`,
        options: [
          {
            value: 'restore' as DeleteType,
            title: 'Restore Campaign',
            description: 'Move the campaign back to your active campaigns',
            icon: <RotateCcw className="h-5 w-5 text-green-600" />,
            buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
            buttonText: 'Restore'
          },
          {
            value: 'hard' as DeleteType,
            title: 'Delete Permanently',
            description: 'This action cannot be undone',
            icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
            buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
            buttonText: 'Delete Forever'
          }
        ]
      };
    } else {
      // Campaign is active, show only soft delete option
      return {
        title: "Delete Campaign",
        description: `Are you sure you want to move "${itemName}" to trash?`,
        options: [
          {
            value: 'soft' as DeleteType,
            title: 'Move to Trash',
            description: 'Campaign can be restored later from the trash',
            icon: <Trash2 className="h-5 w-5 text-orange-600" />,
            buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
            buttonText: 'Move to Trash'
          }
        ]
      };
    }
  };

  const { title, description, options } = getModalContent();
  const selectedOption = options.find(option => option.value === selectedDeleteType);

  // For active campaigns with only one option, we can simplify the UI
  const isSimpleDelete = !isDeleted && options.length === 1;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {description}
        </p>

        {/* Delete Options - Show radio buttons only if multiple options */}
        {showDeleteOptions && !isSimpleDelete && (
          <div className="space-y-3 mb-6">
            {options.map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedDeleteType === option.value
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="deleteType"
                  value={option.value}
                  checked={selectedDeleteType === option.value}
                  onChange={(e) => setSelectedDeleteType(e.target.value as DeleteType)}
                  className="sr-only"
                  disabled={isLoading}
                />
                <div className="flex-shrink-0 mr-3 mt-1">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {option.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {option.description}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedDeleteType === option.value
                      ? 'border-purple-500 bg-purple-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedDeleteType === option.value && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Simple confirmation for single option (move to trash) */}
        {isSimpleDelete && (
          <div className="mb-6">
            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Trash2 className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-orange-800 font-medium">
                  The campaign will be moved to trash
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  You can restore it later from the trash if needed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Simple confirmation for non-delete-options mode */}
        {!showDeleteOptions && (
          <div className="mb-6">
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-sm text-red-800">
                This action cannot be undone. Are you sure you want to continue?
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              selectedOption?.buttonClass || 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              selectedOption?.buttonText || 'Confirm'
            )}
          </button>
        </div>

        {/* Warning footer only for permanent deletions (trash view) */}
        {selectedDeleteType === 'hard' && isDeleted && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-800">
                <strong>Warning:</strong> This action will permanently delete the campaign and all associated data. 
                This cannot be undone.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}