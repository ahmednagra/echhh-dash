// src/components/dashboard/platform/components/MembersTable/ReassignmentPopup.tsx

'use client';

import { useState } from 'react';
import { ReassignmentReason } from '@/types/reassignment-reasons';
import Modal, { ModalAction } from '@/components/ui/Modal';
import UserAvatar from '@/components/ui/UserAvatar';

interface ReassignmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reasonId: string, notes: string) => void;
  influencerName?: string;
  influencerImage?: string | null;
  isLoading?: boolean;
  reasons: ReassignmentReason[]; // Get reasons from parent
  loadingReasons?: boolean;
}

export default function ReassignmentPopup({
  isOpen,
  onClose,
  onConfirm,
  influencerName = 'influencer',
  influencerImage,
  isLoading = false,
  reasons = [],
  loadingReasons = false
}: ReassignmentPopupProps) {
  const [selectedReasonId, setSelectedReasonId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Default reason ID for Agent Unavailable
  const DEFAULT_REASON_ID = '0b28dc8d-6c36-407f-a476-e0d15a397d12';

  // Auto-select default reason when reasons are loaded
  useState(() => {
    if (isOpen && reasons.length > 0 && !selectedReasonId) {
      // Try to find the default reason, otherwise select first one
      const defaultReason = reasons.find(r => r.id === DEFAULT_REASON_ID);
      setSelectedReasonId(defaultReason ? DEFAULT_REASON_ID : reasons[0].id);
      setNotes('');
      setError(null);
    }
  });

  const handleConfirm = () => {
    if (!selectedReasonId) {
      setError('Please select a reassignment reason');
      return;
    }

    onConfirm(selectedReasonId, notes);
  };

  const actions: ModalAction[] = [
    {
      label: 'Cancel',
      onClick: onClose,
      variant: 'secondary',
      disabled: isLoading,
    },
    {
      label: isLoading ? 'Reassigning...' : 'Archive & Reassign',
      onClick: handleConfirm,
      variant: 'danger',
      disabled: isLoading || !selectedReasonId || loadingReasons,
      loading: isLoading,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Archive & Reassign"
      size="xs"
      actions={actions}
      loading={isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <div className="p-4 space-y-4">
        {/* Influencer Header */}
        <UserAvatar 
          name={influencerName}
          imageUrl={influencerImage}
          size="sm"
          className="pb-2 border-b border-gray-100"
        />

        {/* Error Message */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Reassignment Reason */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Reassignment Reason *
          </label>
          {loadingReasons ? (
            <div className="flex items-center justify-center py-3">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-xs text-gray-500">Loading reasons...</span>
            </div>
          ) : (
            <select
              value={selectedReasonId}
              onChange={(e) => setSelectedReasonId(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="">Select a reason...</option>
              {reasons.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
            rows={2}
            className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
        </div>
      </div>
    </Modal>
  );
}