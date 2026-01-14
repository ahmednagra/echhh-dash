// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/BulkStatusUpdate.tsx
'use client';

import React, { useState } from 'react';
import { Status } from '@/types/statuses';
import { Users, ChevronDown } from 'react-feather';

interface BulkStatusUpdateProps {
  selectedInfluencers: string[];
  shortlistedStatuses: Status[];
  onBulkStatusUpdate: (statusId: string) => Promise<void>;
  isUpdating: boolean;
  statusesLoading?: boolean;
}

const BulkStatusUpdate: React.FC<BulkStatusUpdateProps> = ({
  selectedInfluencers,
  shortlistedStatuses,
  onBulkStatusUpdate,
  isUpdating,
  statusesLoading = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleBulkUpdate = async () => {
    if (!selectedStatus || selectedInfluencers.length === 0) return;
    
    try {
      await onBulkStatusUpdate(selectedStatus);
      setSelectedStatus('');
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const getStatusConfig = (statusName: string) => {
    const configs = {
      'pending': { textColor: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-300' },
      'approved': { textColor: 'text-green-700', bgColor: 'bg-green-100', borderColor: 'border-green-300' },
      'dropped': { textColor: 'text-red-700', bgColor: 'bg-red-100', borderColor: 'border-red-300' },
    };
    
    return configs[statusName as keyof typeof configs] || configs['pending'];
  };

  const selectedStatusObj = shortlistedStatuses.find(s => s.id === selectedStatus);
  const selectedStatusConfig = selectedStatusObj ? getStatusConfig(selectedStatusObj.name) : null;

  if (selectedInfluencers.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-md relative">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-700">
              <Users size={18} />
              <span className="font-semibold text-sm">
                {selectedInfluencers.length} influencer(s) selected
              </span>
            </div>
            
            <div className="text-gray-400">•</div>
            
            <span className="text-sm text-blue-600 font-medium">
              Bulk update shortlisted status:
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => !statusesLoading && setIsDropdownOpen(!isDropdownOpen)}
                disabled={statusesLoading || isUpdating}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                  selectedStatusObj
                    ? `${selectedStatusConfig?.textColor} ${selectedStatusConfig?.bgColor} ${selectedStatusConfig?.borderColor}`
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                } ${(statusesLoading || isUpdating) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
              >
                {statusesLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Loading...</span>
                  </>
                ) : selectedStatusObj ? (
                  <>
                    <span>{selectedStatusObj.name.charAt(0).toUpperCase() + selectedStatusObj.name.slice(1)}</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </>
                ) : (
                  <>
                    <span>Select Status</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {/* Dropdown Menu - Fixed positioning and z-index */}
              {isDropdownOpen && !statusesLoading && (
                <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {shortlistedStatuses.map(status => {
                      const config = getStatusConfig(status.name);
                      return (
                        <button
                          key={status.id}
                          onClick={() => {
                            setSelectedStatus(status.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm font-medium transition-all duration-150 hover:bg-gray-50 ${config.textColor}`}
                        >
                          {status.name.charAt(0).toUpperCase() + status.name.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Update Button */}
            <button
              onClick={handleBulkUpdate}
              disabled={!selectedStatus || isUpdating || statusesLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                !selectedStatus || isUpdating || statusesLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
              }`}
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                'Update Status'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown - Fixed z-index */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default BulkStatusUpdate;