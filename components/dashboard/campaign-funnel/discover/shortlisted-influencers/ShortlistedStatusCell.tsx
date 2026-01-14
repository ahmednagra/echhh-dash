// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedStatusCell.tsx
'use client';

import React, { useMemo } from 'react';
import { Status } from '@/types/statuses';

interface ShortlistedStatusCellProps {
  influencer: any;
  shortlistedStatuses: Status[];
  onStatusChange: (influencerId: string, statusId: string) => Promise<void>;
  isUpdating: boolean;
  statusesLoading?: boolean;
  localUpdate?: any;
}

const ShortlistedStatusCell: React.FC<ShortlistedStatusCellProps> = ({
  influencer,
  shortlistedStatuses,
  onStatusChange,
  isUpdating,
  statusesLoading = false,
  localUpdate
}) => {
  const statusConfig = useMemo(() => {
    const configs = {
      'pending': { textColor: 'text-yellow-700', bgColor: '#fef3c7', hexColor: '#b45309' },
      'approved': { textColor: 'text-green-700', bgColor: '#dcfce7', hexColor: '#15803d' },
      'dropped': { textColor: 'text-red-700', bgColor: '#fecaca', hexColor: '#b91c1c' },
    };
    
    return {
      get: (statusName: string) => configs[statusName as keyof typeof configs] || 
        { textColor: 'text-yellow-700', bgColor: '#fef3c7', hexColor: '#b45309' }
    };
  }, []);

  const getDefaultShortlistedStatus = (): Status | undefined => {
    return shortlistedStatuses.find(status => status.name === 'pending');
  };

  const getCurrentShortlistedStatus = (): Status => {
    // Check for local update first
    const currentStatus = localUpdate?.shortlisted_status || influencer.shortlisted_status;
    
    if (currentStatus) {
      return currentStatus;
    }
    
    // If shortlisted_status_id is null or undefined, default to pending
    if (!influencer.shortlisted_status_id) {
      const defaultStatus = getDefaultShortlistedStatus();
      return defaultStatus || { id: '', name: 'pending' };
    }
    
    // Find status by ID
    const statusById = shortlistedStatuses.find(s => s.id === influencer.shortlisted_status_id);
    if (statusById) {
      return statusById;
    }
    
    // Fallback to default pending status
    const defaultStatus = getDefaultShortlistedStatus();
    return defaultStatus || { id: '', name: 'pending' };
  };

  const currentStatus = getCurrentShortlistedStatus();
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
          shortlistedStatuses.map(status => (
            <option key={status.id} value={status.id}>
              {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
            </option>
          ))
        )}
      </select>
      
      {/* Loading indicator */}
      {isUpdating && (
        <div className="inline-block ml-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

export default ShortlistedStatusCell;