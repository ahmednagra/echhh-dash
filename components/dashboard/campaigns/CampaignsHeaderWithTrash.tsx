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
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors text-sm bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-lg"
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
                className="flex items-center text-gray-600 hover:text-purple-600 transition-colors text-sm bg-gray-100 hover:bg-purple-50 px-3 py-2 rounded-lg"
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
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl flex items-center hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </button>
          ) : (
            <Link
              href={createButtonHref}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl flex items-center hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg text-sm"
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