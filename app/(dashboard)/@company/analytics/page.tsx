// src/app/(dashboard)/@company/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, RefreshCw, ExternalLink, ChevronLeft, ChevronRight } from 'react-feather';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { getStoredCompany } from '@/services/auth/auth.utils';
import { getCompanyAnalytics } from '@/services/company-analytics';
import { 
  CompanyAnalyticsInfluencer,
  CompanyAnalyticsData,
  GetCompanyAnalyticsRequest
} from '@/types/company-analytics';

type SortKey = keyof CompanyAnalyticsInfluencer;
type SortOrder = 'asc' | 'desc';

// Format number function
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Sortable Header Component
const SortableHeader: React.FC<{
  children: React.ReactNode;
  sortKey: SortKey;
  currentSort: { key: SortKey; order: SortOrder } | null;
  onSort: (key: SortKey) => void;
}> = ({ children, sortKey, currentSort, onSort }) => {
  const isActive = currentSort?.key === sortKey;
  
  return (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <ChevronUp 
            className={`w-3 h-3 ${
              isActive && currentSort?.order === 'asc' ? 'text-purple-600' : 'text-gray-400'
            }`} 
          />
          <ChevronDown 
            className={`w-3 h-3 -mt-1 ${
              isActive && currentSort?.order === 'desc' ? 'text-purple-600' : 'text-gray-400'
            }`} 
          />
        </div>
      </div>
    </th>
  );
};

// Pagination Component (same as ShortlistedTable)
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
  
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push('...');
        }
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        if (totalPages > 6) {
          pages.push('...');
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          if (i > 1) {
            pages.push(i);
          }
        }
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showPageSizeDropdown && !target.closest('.page-size-dropdown')) {
        setShowPageSizeDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPageSizeDropdown]);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700">Show:</label>
          <div className="relative page-size-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPageSizeDropdown(!showPageSizeDropdown);
              }}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white hover:bg-gray-50 flex items-center"
            >
              {pageSize}
              <svg
                className={`ml-1 h-4 w-4 transform transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            
            {showPageSizeDropdown && (
              <div className="absolute bottom-full mb-1 left-0 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                <div className="py-1">
                  {[10, 25, 50, 100].map((option) => (
                    <button
                      key={option}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPageSizeChange(option);
                        setShowPageSizeDropdown(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        pageSize === option
                          ? 'bg-purple-50 text-purple-600 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex space-x-1">
          {getVisiblePages().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-2 text-sm rounded-md min-w-[40px] ${
                page === currentPage
                  ? 'bg-purple-600 text-white'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

function CompanyAnalyticsContent() {
  const { user, loadAuthFromStorage } = useAuth();
  
  // State management
  const [searchText, setSearchText] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder } | null>(null);
  const [analyticsData, setAnalyticsData] = useState<CompanyAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Get company ID using existing project pattern
  const getCompanyId = (): string | null => {
    try {
      const company = getStoredCompany();
      const companyId = company?.id;
      
      if (companyId) {
        console.log('✅ Company ID found:', companyId);
        return companyId;
      }
      
      console.warn('⚠️ No company ID found via getStoredCompany()');
      return null;
    } catch (error) {
      console.error('❌ Error getting company ID:', error);
      return null;
    }
  };

  // Handle opening Instagram profile in new tab (same as DiscoveredInfluencers)
  const handleOpenProfile = (influencer: CompanyAnalyticsInfluencer) => {
    const instagramUrl = `https://www.instagram.com/${influencer.username}`;
    window.open(instagramUrl, '_blank', 'noopener,noreferrer');
  };

  // Handle profile insights (same functionality as DiscoveredInfluencers)
  const handleProfileInsights = (influencer: CompanyAnalyticsInfluencer) => {
    console.log('handleProfileAnalytics called: ', influencer);
    
    // Use the correct Instagram platform work_platform_id UUID
    const instagramPlatformId = '9bb8913b-ddd9-430b-a66a-d74d846e6c66'; // Instagram platform UUID
    
    const params = new URLSearchParams({
      user: influencer.platform_account_id, // Use platform_account_id instead of id
      username: influencer.username,
      platform: instagramPlatformId,
    });
    
    const url = `/profile-analytics?${params.toString()}`;
    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Check if user needs to complete company registration
  const needsCompanyRegistration = (): boolean => {
    if (!user || user.user_type !== 'b2c') {
      return false;
    }
    
    const companyId = getCompanyId();
    return !companyId;
  };

  // Refresh auth and retry
  const refreshAuthAndRetry = async () => {
    try {
      console.log('🔄 Refreshing auth state...');
      if (loadAuthFromStorage) {
        await loadAuthFromStorage();
        setTimeout(() => {
          fetchAnalyticsData();
        }, 500);
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Error refreshing auth:', error);
      window.location.reload();
    }
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    const companyId = getCompanyId();
    
    if (!companyId) {
      console.error('❌ Company ID not found');
      console.log('🔍 Debug info:', {
        userExists: !!user,
        userType: user?.user_type,
        userEmail: user?.email,
        needsRegistration: needsCompanyRegistration()
      });
      
      // Provide specific error message based on user state
      let errorMessage = 'Company ID not found. Please make sure you are logged in and have a company associated with your account.';
      
      if (needsCompanyRegistration()) {
        errorMessage = 'Your company registration is not complete. Please complete your company setup to access analytics.';
      } else if (!user) {
        errorMessage = 'You need to log in to access company analytics.';
      } else if (user.user_type !== 'b2c') {
        errorMessage = 'This feature is only available for company users. Please contact support if you believe this is an error.';
      }
      
      setError(errorMessage);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Fetching analytics for company:', companyId);
      console.log('📋 Pagination params:', { currentPage, pageSize });
      
      const request: GetCompanyAnalyticsRequest = {
        companyId,
        page: currentPage,
        limit: pageSize,
        search: searchText || undefined,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.order
      };

      console.log('📋 Full request parameters:', request);

      const data = await getCompanyAnalytics(request);
      
      console.log('✅ Analytics data received:', {
        total: data.total,
        influencers: data.influencers.length,
        page: data.page,
        totalPages: data.totalPages,
        currentPage: currentPage,
        pageSize: pageSize
      });
      
      setAnalyticsData(data);
    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      
      let errorMessage = 'Failed to load analytics data';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      // Add more context for common error scenarios
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Authentication failed. Please try refreshing your session or logging in again.';
      } else if (errorMessage.includes('404') || errorMessage.includes('Not found')) {
        errorMessage = 'No analytics data found for this company. Please check if the company ID is correct.';
      } else if (errorMessage.includes('500') || errorMessage.includes('Internal server error')) {
        errorMessage = 'Server error occurred while fetching analytics. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Server-side pagination - trigger API call when page/pageSize changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [currentPage, pageSize, sortConfig]); // Added currentPage and pageSize back

  // Search with debounce - reset page to 1 and trigger API call
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to page 1 when searching
      fetchAnalyticsData(); // Trigger API call for search
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev?.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading company analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const companyId = getCompanyId();
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">Profile Analytics Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor and analyze influencer performance metrics</p>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                
                {/* Debug Information - Only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border">
                    <p><strong>Debug Info:</strong></p>
                    <p>• User exists: {user ? 'Yes' : 'No'}</p>
                    <p>• User type: {user?.user_type || 'N/A'}</p>
                    <p>• User email: {user?.email || 'N/A'}</p>
                    <p>• Company ID: {companyId || 'None'}</p>
                    <p>• Needs registration: {needsCompanyRegistration() ? 'Yes' : 'No'}</p>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={fetchAnalyticsData}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </button>
                    
                    <button
                      onClick={refreshAuthAndRetry}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                    >
                      Refresh Session
                    </button>
                    
                    {!companyId && needsCompanyRegistration() && (
                      <button
                        onClick={() => window.location.href = '/register/complete'}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                      >
                        Complete Company Setup
                      </button>
                    )}
                  </div>
                  
                  {needsCompanyRegistration() && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded border">
                      <p><strong>Action Required:</strong> Complete your company registration to access analytics.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FIXED: Use data directly from API response (no client-side slicing)
  const influencers = analyticsData?.influencers || [];
  const total = analyticsData?.total || 0;
  const totalPages = analyticsData?.totalPages || Math.ceil(total / pageSize) || 1;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Pagination Debug:', {
      influencersFromAPI: influencers.length,
      totalFromAPI: total,
      totalPagesFromAPI: analyticsData?.totalPages,
      calculatedTotalPages: totalPages,
      currentPage,
      pageSize
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="flex items-center space-x-3">
            {/* Analytics Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
                Profile Analytics Dashboard
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header with Search */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search influencers..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-80"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {total} total results
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortableHeader 
                    sortKey="name" 
                    currentSort={sortConfig} 
                    onSort={handleSort}
                  >
                    Name
                  </SortableHeader>
                  <SortableHeader 
                    sortKey="followers" 
                    currentSort={sortConfig} 
                    onSort={handleSort}
                  >
                    Followers
                  </SortableHeader>
                  <SortableHeader 
                    sortKey="language" 
                    currentSort={sortConfig} 
                    onSort={handleSort}
                  >
                    Language
                  </SortableHeader>
                  <SortableHeader 
                    sortKey="mediaCount" 
                    currentSort={sortConfig} 
                    onSort={handleSort}
                  >
                    Media Count
                  </SortableHeader>
                  <SortableHeader 
                    sortKey="ageGroup" 
                    currentSort={sortConfig} 
                    onSort={handleSort}
                  >
                    Age Group
                  </SortableHeader>
                  <SortableHeader 
                    sortKey="accountType" 
                    currentSort={sortConfig} 
                    onSort={handleSort}
                  >
                    Account Type
                  </SortableHeader>
                  {/* Actions column (not sortable) */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {influencers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner />
                          <span className="ml-2">Loading influencers...</span>
                        </div>
                      ) : (
                        <div>
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M28 16a4 4 0 11-8 0 4 4 0 018 0zM40 16a4 4 0 11-8 0 4 4 0 018 0zM8 16a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-lg font-medium text-gray-900 mb-2">No influencers found</p>
                          <p className="text-sm text-gray-500">
                            {searchText 
                              ? `No results match your search "${searchText}". Try adjusting your search terms.` 
                              : 'No analytics data available for this company. Influencers will appear here once profile analytics are added.'
                            }
                          </p>
                          {!searchText && (
                            <div className="mt-4">
                              <p className="text-xs text-gray-400">
                                Make sure influencers have been added to your company and profile analytics have been fetched.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  influencers.map((influencer) => (
                    <tr key={influencer.id} className="hover:bg-gray-50">
                      {/* Name column with clickable profile */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="flex-shrink-0 h-10 w-10 cursor-pointer"
                            onClick={() => handleOpenProfile(influencer)}
                            title={`Visit @${influencer.username} on Instagram`}
                          >
                            <img 
                              className="h-10 w-10 rounded-full object-cover border-2 border-transparent hover:border-purple-300 transition-colors" 
                              src={influencer.profileImage || '/api/placeholder/40/40'} 
                              alt={influencer.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/api/placeholder/40/40';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div 
                                className="text-sm font-medium text-gray-900 cursor-pointer hover:text-purple-700 hover:underline transition-colors"
                                onClick={() => handleOpenProfile(influencer)}
                                title={`Visit @${influencer.username} on Instagram`}
                              >
                                {influencer.name}
                              </div>
                              {influencer.verified && (
                                <div className="ml-2 flex-shrink-0">
                                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div 
                              className="text-sm text-gray-500 cursor-pointer hover:text-purple-600 hover:underline transition-colors"
                              onClick={() => handleOpenProfile(influencer)}
                              title={`Visit @${influencer.username} on Instagram`}
                            >
                              @{influencer.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(influencer.followers)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {influencer.language}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {influencer.mediaCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {influencer.ageGroup}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          influencer.accountType === 'Creator' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {influencer.accountType}
                        </span>
                      </td>
                      {/* Actions column with Profile Insights link */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-normal">
                        <div className="flex items-center">
                          {/* Profile Insights Link */}
                          <button
                            onClick={() => handleProfileInsights(influencer)}
                            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-normal transition-colors group"
                            title="View detailed profile analytics"
                          >
                            <svg 
                              className="w-4 h-4 mr-1.5 group-hover:scale-110 transition-transform" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
                              />
                            </svg>
                            <span className="group-hover">Insights</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer - Always show when there are results */}
          {total > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Protected Dashboard Page
export default function CompanyAnalyticsPage() {
  return (
    <ProtectedRoute>
      <CompanyAnalyticsContent />
    </ProtectedRoute>
  );
}