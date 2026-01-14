// src/components/dashboard/campaign-funnel/outreach/selected-manually/StatusCell.tsx
'use client';

import React, { useMemo } from 'react';
import { Status } from '@/types/statuses';
import { getStatusShortForm } from '@/types/campaign-influencers';

interface StatusCellProps {
  influencer: any;
  clientReviewStatuses: Status[];
  onStatusChange: (influencerId: string, statusId: string) => Promise<void>;
  isUpdating: boolean;
  statusesLoading?: boolean;
  localUpdate?: any;
}

const StatusCell: React.FC<StatusCellProps> = ({
  influencer,
  clientReviewStatuses,
  onStatusChange,
  isUpdating,
  statusesLoading = false,
  localUpdate
}) => {
  const statusConfig = useMemo(() => {
    const configs = {
      'on_hold': { textColor: 'text-gray-700', bgColor: '#f3f4f6', hexColor: '#374151' },
      'pending_review': { textColor: 'text-yellow-700', bgColor: '#fef3c7', hexColor: '#b45309' },
      'approved': { textColor: 'text-green-700', bgColor: '#dcfce7', hexColor: '#15803d' },
      'dropped': { textColor: 'text-red-700', bgColor: '#fecaca', hexColor: '#b91c1c' },
      'needs_info': { textColor: 'text-blue-700', bgColor: '#dbeafe', hexColor: '#1d4ed8' },
      'under_negotiation': { textColor: 'text-purple-700', bgColor: '#e9d5ff', hexColor: '#7c3aed' },
    };
    
    return {
      get: (statusName: string) => configs[statusName as keyof typeof configs] || 
        { textColor: 'text-gray-700', bgColor: '#f3f4f6', hexColor: '#374151' }
    };
  }, []);

  const getDefaultClientReviewStatus = (): Status | undefined => {
    return clientReviewStatuses.find(status => status.name === 'pending_review');
  };

  const getCurrentClientReviewStatus = (): Status => {
    const currentStatus = localUpdate?.client_review_status || influencer.client_review_status;
    
    if (currentStatus) {
      return currentStatus;
    }
    
    const defaultStatus = getDefaultClientReviewStatus();
    return defaultStatus || { id: '', name: 'pending_review' };
  };

  const currentStatus = getCurrentClientReviewStatus();
  const currentConfig = statusConfig.get(currentStatus.name);

  return (
    <div className={isUpdating ? 'opacity-50' : ''}>
      <select
        value={currentStatus.id}
        onChange={(e) => onStatusChange(influencer.id, e.target.value)}
        disabled={isUpdating || statusesLoading}
        className={`text-xs px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[80px] cursor-pointer ${currentConfig.textColor}`}
        style={{
          background: `linear-gradient(to right, ${currentConfig.bgColor}, white 30%)`
        }}
      >
        {statusesLoading ? (
          <option>Loading...</option>
        ) : (
          clientReviewStatuses.map(status => {
            const config = statusConfig.get(status.name);
            return (
              <option 
                key={status.id} 
                value={status.id}
                style={{ 
                  color: config.hexColor,
                  backgroundColor: 'white'
                }}
              >
                {getStatusShortForm(status.name)}
              </option>
            );
          })
        )}
      </select>
      {isUpdating && (
        <div className="text-xs text-gray-500 mt-1">Updating...</div>
      )}
    </div>
  );
};

export default StatusCell;