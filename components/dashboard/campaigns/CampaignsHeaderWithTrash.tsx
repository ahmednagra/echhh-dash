// src/components/dashboard/campaigns/CampaignsHeaderWithTrash.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, ArrowLeft } from 'react-feather';

interface CampaignsHeaderWithTrashProps {
  title?: string;
  createButtonText?: string;
  createButtonHref?: string;
  className?: string;
  onCreateClick?: () => void;
  showCreateButton?: boolean;
  // Trash view props
  isTrashView?: boolean;
  onToggleTrashView?: (isTrashView: boolean) => void;
  deletedCount?: number;
}

export default function CampaignsHeaderWithTrash({
  title, // This will be ignored - we'll use logical titles
  createButtonText = "Create Campaign",
  createButtonHref = "/campaigns/new",
  className = "",
  onCreateClick,
  showCreateButton = true,
  isTrashView = false,
  onToggleTrashView,
  deletedCount = 0
}: CampaignsHeaderWithTrashProps) {
  const handleCreateClick = () => {
    if (onCreateClick) {
      onCreateClick();
    }
  };

  const handleToggleTrash = () => {
    if (onToggleTrashView) {
      onToggleTrashView(!isTrashView);
    }
  };

  // Logical titles based on view
  const getTitle = () => {
    if (isTrashView) {
      return "Deleted Campaigns";
    }
    return "All Campaigns";
  };

  return (
    <div className={`flex justify-between items-center mb-6 ${className}`}>
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            {isTrashView && (
              <Trash2 className="h-6 w-6 mr-2 text-red-500" />
            )}
            {getTitle()}
          </h2>
        </div>
        
        {/* Toggle between main view and trash view */}
        {onToggleTrashView && (
          <div className="flex items-center">
            {!isTrashView ? (
              <button
                onClick={handleToggleTrash}
                className="flex items-center px-4 py-2 text-sm rounded-full transition-all duration-200 border font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 hover:shadow-sm transform hover:scale-[1.01]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                View Trash
                {deletedCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {deletedCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={handleToggleTrash}
                className="flex items-center px-4 py-2 text-sm rounded-full transition-all duration-200 border font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 hover:shadow-sm transform hover:scale-[1.01]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Campaigns
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Create button - only show in main view */}
      {showCreateButton && !isTrashView && (
        <div>
          {onCreateClick ? (
            <button
              onClick={handleCreateClick}
              className="px-5 py-2 text-sm rounded-full transition-all duration-200 border font-bold bg-[#E8DFF5] text-[#6B4C9A] border-[#A590D1] flex items-center hover:shadow-sm transform hover:scale-[1.01]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </button>
          ) : (
            <Link
              href={createButtonHref}
              className="px-5 py-2 text-sm rounded-full transition-all duration-200 border font-bold bg-[#E8DFF5] text-[#6B4C9A] border-[#A590D1] flex items-center hover:shadow-sm transform hover:scale-[1.01]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}