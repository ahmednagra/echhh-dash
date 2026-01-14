// src/components/dashboard/campaign-funnel/outreach/OnBoarded.tsx
'use client';

import { useState, useMemo, useRef } from 'react';
import { useOutreach } from '@/context/OutreachContext';
import { formatNumber } from '@/utils/format';
import { exportInfluencers } from '@/utils/exportUtils';

interface OnBoardedProps {
  enableDrop?: boolean; // NEW: Enable drop functionality
  onInfluencerDrop?: (influencerId: string) => Promise<void>; // NEW: Drop handler
}

const OnBoarded: React.FC<OnBoardedProps> = ({ 
  enableDrop = false, 
  onInfluencerDrop 
}) => {
  const { onboardedInfluencers, loading, error, removeFromOnboarded } = useOutreach();
  const [searchText, setSearchText] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // NEW: Drop state
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  // NEW: Bottom buttons visibility state
  const [showBottomButtons, setShowBottomButtons] = useState(true);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Filter influencers based on search
  const filteredInfluencers = useMemo(() => {
    if (!searchText.trim()) return onboardedInfluencers;

    const searchLower = searchText.toLowerCase();
    return onboardedInfluencers.filter(influencer => {
      const fullName = (influencer.social_account?.full_name || '').toLowerCase();
      const accountHandle = (influencer.social_account?.account_handle || '').toLowerCase();
      
      return fullName.includes(searchLower) || accountHandle.includes(searchLower);
    });
  }, [onboardedInfluencers, searchText]);

  // Format onboarded date
  const formatOnboardedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  // Handle remove influencer
  const handleRemoveInfluencer = async (influencerId: string) => {
    setLocalError(null); // Clear any local errors
    
    try {
      await removeFromOnboarded(influencerId);
      console.log('✅ OnBoarded: Successfully removed influencer:', influencerId);
      // The context will automatically update the state, causing real-time updates
    } catch (err) {
      console.error('❌ OnBoarded: Failed to remove influencer:', err);
      setLocalError(err instanceof Error ? err.message : 'Failed to remove influencer');
    }
  };

  // NEW: Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    if (!enableDrop) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!enableDrop) return;
    
    // Only hide drag over state if we're actually leaving the component
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (!enableDrop || !onInfluencerDrop) return;
    
    e.preventDefault();
    setIsDragOver(false);
    setIsDropping(true);
    
    try {
      const influencerId = e.dataTransfer.getData('text/plain');
      console.log('🔄 OnBoarded: Dropping influencer:', influencerId);
      
      await onInfluencerDrop(influencerId);
      console.log('✅ OnBoarded: Successfully onboarded influencer via drop');
    } catch (error) {
      console.error('❌ OnBoarded: Error onboarding influencer via drop:', error);
      setLocalError(error instanceof Error ? error.message : 'Failed to onboard influencer');
    } finally {
      setIsDropping(false);
    }
  };

  // Handle export to Excel
  const handleExport = async () => {
    if (onboardedInfluencers.length === 0) {
      alert('No onboarded influencers to export');
      return;
    }

    setIsExporting(true);

    try {
      // Transform onboarded influencers data to match the export function format
      const exportData = onboardedInfluencers.map(influencer => ({
        // Keep all original data structure
        ...influencer,
        social_account: influencer.social_account,
        collaboration_price: influencer.collaboration_price, // This is at root level
        currency: influencer.currency, // This is at root level
        onboarded_at: influencer.onboarded_at, // This is at root level
        additional_metrics: influencer.social_account?.additional_metrics
      }));

      // CORRECTED: Define columns for onboarded influencers with separated contact types
      const exportColumns = [
        'name',
        'username', 
        'followers',
        'verified',
        'engagement_rate',
        'avg_likes',
        'collaboration_price', // Now correctly accessing from root level
        'currency',            // Now correctly accessing from root level
        // 'email',               // NEW: Separate Email column
        'whatsapp',            // NEW: Separate WhatsApp column  
        // 'telegram',            // NEW: Separate Telegram column
        // 'phone',               // NEW: Separate Phone column
        'onboarded_date'       // Now correctly accessing from root level
      ];

      await exportInfluencers(exportData as any, 'Onboarded_Influencers', exportColumns);
      console.log('✅ Onboarded influencers exported successfully with separated contact columns and correct pricing!');
      
    } catch (error) {
      console.error('Export failed:', error);
      alert(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">On Boarded</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  // Show error state only for persistent errors, not after successful operations
  const displayError = localError || (error && !onboardedInfluencers.length);
  if (displayError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative h-[600px] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900 text-red-600">Error</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-medium">Failed to load data</p>
            <p className="text-gray-500 text-sm mt-1">{displayError}</p>
            <button 
              onClick={() => setLocalError(null)}
              className="mt-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border overflow-hidden relative h-[600px] flex flex-col transition-all duration-200 ${
        enableDrop && isDragOver 
          ? 'border-green-400 bg-green-50 shadow-lg scale-105' 
          : 'border-gray-100'
      } ${
        isDropping ? 'opacity-75' : ''
      }`}
      // NEW: Drop functionality
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* NEW: Drop overlay */}
      {enableDrop && isDragOver && (
        <div className="absolute inset-0 bg-green-100/90 border-2 border-dashed border-green-400 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-green-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-green-800 font-semibold text-lg">Drop to Onboard</p>
            <p className="text-green-600 text-sm">Release to add influencer to onboarded list</p>
          </div>
        </div>
      )}

      {/* Header with Export Button */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-900">
          On Boarded ({formatNumber(filteredInfluencers.length)})
        </h3>
        
        {/* Export Button */}
        {onboardedInfluencers.length > 0 && (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border border-green-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export to Excel"
          >
            {isExporting ? (
              <>
                <div className="animate-spin w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full mr-1.5" />
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </>
            )}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search Influencer"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <svg 
              className="w-3.5 h-3.5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Influencers List */}
      <div 
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-3"
        onMouseEnter={() => setShowBottomButtons(false)}
        onMouseLeave={() => setShowBottomButtons(true)}
        onScroll={() => setShowBottomButtons(false)}
      >
        {filteredInfluencers.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 font-medium">No Onboarded Influencers</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchText ? 'Try adjusting your search' : enableDrop ? 'Drag influencer cards here to onboard them' : 'No influencers have been onboarded yet'}
              </p>
              {/* NEW: Visual drop zone when empty (removed text as requested) */}
              {enableDrop && !searchText && (
                <div className="mt-4 p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Drop area</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredInfluencers.map((influencer) => (
              <div key={influencer.id} className="relative p-2 hover:bg-gray-50 transition-colors duration-150 border border-gray-200 rounded-md">
                {/* Remove button positioned absolutely at top-right corner */}
                <button
                  onClick={() => handleRemoveInfluencer(influencer.id)}
                  className="absolute -top-1 -right-1 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-150 bg-white border border-gray-200 shadow-sm z-10"
                  title="Remove from onboarded"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Main content */}
                <div className="flex items-start justify-between">
                  {/* Left side - Profile info */}
                  <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={
                          influencer.social_account?.profile_pic_url || 
                          influencer.social_account?.additional_metrics?.profileImage ||
                          '/default-avatar.png'
                        }
                        alt="avatar"
                        className="rounded-full w-8 h-8 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                      {/* Platform icon overlaid on profile picture */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center border border-white">
                        <svg 
                          className="w-2 h-2 text-white" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                        </svg>
                      </div>
                      {/* Verification badge */}
                      {influencer.social_account?.is_verified && (
                        <div className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {influencer.social_account?.full_name || 'Unknown'}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        @{influencer.social_account?.account_handle || 'unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right side - Details */}
                  <div className="flex flex-col items-end space-y-1 text-right pr-6">
                    {/* Followers Count */}
                    <span className="text-[9px] text-gray-400">
                      {formatNumber(influencer.social_account?.followers_count || 0)} followers
                    </span>
                    
                    {/* Onboarded Date */}
                    <span className="text-[9px] text-gray-500">
                      {formatOnboardedDate(influencer.onboarded_at!)}
                    </span>
                    
                    {/* Collaboration Price */}
                    {influencer.collaboration_price ? (
                      <span className="text-[9px] text-green-600 font-medium">
                        ${formatNumber(influencer.collaboration_price)} {influencer.currency || 'USD'}
                      </span>
                    ) : (
                      <span className="text-[9px] text-gray-400">
                        Price TBD
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NEW: Drop indicator when dragging */}
      {enableDrop && isDropping && (
        <div className="absolute inset-0 bg-blue-100/90 flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-800 font-semibold">Onboarding Influencer...</p>
          </div>
        </div>
      )}

      {/* NEW: Bottom Buttons Overlay with Working Slide Animation */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent backdrop-blur-sm flex items-center justify-center py-3 rounded-b-xl transition-transform duration-300 ease-in-out z-20 ${
          showBottomButtons ? 'translate-y-0' : 'translate-y-full'
        }`}
        onMouseEnter={() => setShowBottomButtons(true)}
      >
        <button className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-all duration-300 font-medium text-xs shadow-md hover:shadow-lg transform hover:scale-105">
          Start Campaign
        </button>
      </div>
    </div>
  );
};

export default OnBoarded;