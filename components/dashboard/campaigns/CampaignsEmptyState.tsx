// src/components/dashboard/campaigns/CampaignsEmptyState.tsx
'use client';

import Link from 'next/link';
import { Plus, Filter } from 'react-feather';

interface CampaignsEmptyStateProps {
  searchQuery?: string;
  title?: string;
  description?: string;
  actionButtonText?: string;
  actionButtonHref?: string;
  onActionClick?: () => void;
  showActionButton?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function CampaignsEmptyState({
  searchQuery = "",
  title,
  description,
  actionButtonText = "Create Your First Campaign",
  actionButtonHref = "/campaigns/new",
  onActionClick,
  showActionButton = true,
  icon,
  className = ""
}: CampaignsEmptyStateProps) {
  // Determine content based on whether there's a search query
  const isSearchResult = Boolean(searchQuery);
  
  const defaultTitle = isSearchResult 
    ? "No campaigns found" 
    : "No campaigns found";
    
  const defaultDescription = isSearchResult
    ? "No campaigns match your search criteria. Try adjusting your search terms."
    : "You haven't created any campaigns yet. Get started by creating your first campaign.";

  const defaultIcon = (
    <Filter className="h-8 w-8 text-purple-500" />
  );

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick();
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-8 text-center ${className}`}>
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
        {icon || defaultIcon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title || defaultTitle}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
        {description || defaultDescription}
      </p>
      
      {/* Only show action button if not searching or explicitly enabled */}
      {showActionButton && !isSearchResult && (
        <div>
          {onActionClick ? (
            <button
              onClick={handleActionClick}
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {actionButtonText}
            </button>
          ) : (
            <Link
              href={actionButtonHref}
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {actionButtonText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}