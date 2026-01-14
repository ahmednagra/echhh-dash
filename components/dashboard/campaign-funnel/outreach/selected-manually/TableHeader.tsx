// src/components/dashboard/campaign-funnel/outreach/selected-manually/TableHeader.tsx
'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createPublicSession } from '@/services/public-sessions';
import { Campaign } from '@/types/campaign';

interface TableHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOnboard: () => void;
  onBack: () => void;
  selectedCount: number;
  isOnboarding: boolean;
  campaignData?: Campaign | null;
  isPublicView?: boolean;
  visibleColumns?: Set<string>; // Add visible columns prop
}

const TableHeader: React.FC<TableHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onOnboard,
  onBack,
  selectedCount,
  isOnboarding,
  campaignData,
  isPublicView = false,
  visibleColumns // New prop for column visibility
}) => {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // UPDATED handleShareUrl function for TableHeader.tsx (Ready to Onboard)
// Location: src/components/dashboard/campaign-funnel/outreach/selected-manually/TableHeader.tsx

// UPDATED handleShareUrl function for TableHeader.tsx (Ready to Onboard)
// Location: src/components/dashboard/campaign-funnel/outreach/selected-manually/TableHeader.tsx

const handleShareUrl = async () => {
  if (isCreatingSession || !campaignData) {
    return;
  }

  setIsCreatingSession(true);
  
  try {
    // Get current user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    
    // Create session metadata with user info AND column visibility
    const sessionMetadata = {
      client_name: userInfo.full_name || 'Client User',
      client_company: userInfo.company_name || 'Client Company', 
      client_email: userInfo.email || 'client@example.com',
      client_role: userInfo.role || 'Client',
      // IMPORTANT: Save visible columns configuration
      visible_columns: visibleColumns ? 
        Array.from(visibleColumns) : [
          'name', 'followers', 'engagementRate', 'engagements', 'avgLikes', 
          'viewsMultiplier', 'budget', 'cpv', 'status', 'counterBudget', 'comment'
        ],
      page_name: "ready-to-onboard" // 👈 MOVED: page_name now inside session_metadata
    };

    if (!campaignData.campaign_lists || !campaignData.campaign_lists[0]?.id) {
      toast.error('Campaign List ID is required to create a shareable link');
      return;
    }

    // Create public session with real user data
    const sessionData = {
      session_type: "campaign_influencers",
      resource_type: "campaign_list", 
      resource_id: campaignData.campaign_lists[0].id,
      expires_in_hours: 72,
      page_name: "ready-to-onboard", // 👈 NEW: Add page_name parameter
      permissions: {
        read: true,
        "comment:create": true,
        "comment:read": true,
        "comment:reply": true,
        "price_negotiation:create": true,
        "price_negotiation:read": true,
        "price_negotiation:approve": true,
        "price_negotiation:reject": true,
        "campaign_influencer:client_review": true,
      },
      session_metadata: sessionMetadata
    };

    console.log('🔐 Creating public session with page_name: "ready-to-onboard"');

    const sessionResponse = await createPublicSession(sessionData);

    if (sessionResponse && sessionResponse.public_url) {
      // Copy the public URL to clipboard
      await navigator.clipboard.writeText(sessionResponse.public_url);
      setUrlCopied(true);
      toast.success(`Shareable URL copied! (${visibleColumns?.size || 0} columns visible)`);
      
      console.log('✅ Share URL created successfully:', sessionResponse.public_url);
      
      setTimeout(() => setUrlCopied(false), 3000);
    } else {
      throw new Error('No public URL received from server');
    }

  } catch (error) {
    console.error('❌ Error creating shareable URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create shareable URL';
    toast.error(errorMessage);
  } finally {
    setIsCreatingSession(false);
  }
};

  return (
    <div className="flex items-center justify-between mb-4">
      {/* Search Bar */}
      <div className="relative w-1/2 mr-3">
        <input
          type="text"
          placeholder="Search Influencer"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-11 pl-4 pr-10 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
          </svg>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {!isPublicView && (
          <>
            <button className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-full border border-gray-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
            
            <button
              onClick={handleShareUrl}
              disabled={isCreatingSession}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
                urlCopied 
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/20' 
                  : isCreatingSession
                  ? 'bg-gray-50 text-gray-500 border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-gray-50 border-blue-200 text-gray-700 hover:bg-gray-60 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
              }`}
              title={`Generate public shareable link with ${visibleColumns?.size || 'default'} visible columns`}
            >
              {isCreatingSession ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Creating...</span>
                </>
              ) : urlCopied ? (
                <>
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>URL Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share URL</span>
                </>
              )}
            </button>
          </>
        )}
        
        <button 
          onClick={onOnboard}
          disabled={selectedCount === 0 || isOnboarding}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md border transition-all duration-200 ${
            selectedCount > 0 && !isOnboarding
              ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/20' 
              : 'bg-gray-50 text-gray-500 border-gray-200 opacity-50 cursor-not-allowed'
          }`}
        >
          {isOnboarding ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              <span>Onboarding...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{`Onboard Selected${selectedCount > 0 ? ` (${selectedCount})` : ''}`}</span>
            </>
          )}
        </button>
        
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-gray-50 border border-red-200 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 hover:border-red-300 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {isPublicView ? 'Close' : 'Close Tab'}
        </button>
      </div>
    </div>
  );
};

export default TableHeader;