// src/app/social-accounts/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, Upload, Users, ExternalLink, Trash2, DollarSign, ChevronLeft, ChevronRight } from 'react-feather';
import { 
  getSocialAccounts, 
  deleteSocialAccount
} from '@/services/social-accounts/social-accounts.service';
import type { 
  SocialAccount,
  SocialAccountsListResponse,
  BulkImportResponse 
} from '@/types/social-accounts';
import EnhancedSocialAccountsTable from '@/components/social-accounts/EnhancedSocialAccountsTable';

// Platform interface that matches DiscoverTab structure
interface Platform {
  id: string;
  name: string;
  work_platform_id: string;
}

// Pagination Component
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

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700">Show:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
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
                  : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Import the CSVImportModal
const CSVImportModal = React.lazy(() => import('@/components/social-accounts/CSVImportModal'));

const SocialAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [localAccounts, setLocalAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  const [selectedPlatformForImport, setSelectedPlatformForImport] = useState<Platform | null>(null);

  // Fetch platforms from your actual API
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/v0/platforms');
        if (response.ok) {
          const data = await response.json();
          setPlatforms(data.platforms || []);
        } else {
          console.warn('Failed to fetch platforms, using fallback');
          setPlatforms([
            { id: '1', name: 'Instagram', work_platform_id: 'instagram' },
            { id: '2', name: 'YouTube', work_platform_id: 'youtube' },
            { id: '3', name: 'TikTok', work_platform_id: 'tiktok' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching platforms:', error);
        setPlatforms([
          { id: '1', name: 'Instagram', work_platform_id: 'instagram' },
          { id: '2', name: 'YouTube', work_platform_id: 'youtube' },
          { id: '3', name: 'TikTok', work_platform_id: 'tiktok' },
        ]);
      }
    };

    fetchPlatforms();
  }, []);

  // Initialize local accounts when accounts change
  useEffect(() => {
    setLocalAccounts(accounts);
  }, [accounts]);

  // Fetch social accounts
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const result = await getSocialAccounts(
        currentPage, 
        pageSize, 
        searchTerm || undefined, 
        selectedPlatform || undefined
      );
      
      if (result.success) {
        setAccounts(result.data);
        setTotalPages(result.pagination.total_pages);
        setTotalItems(result.pagination.total_items);
      } else {
        setAccounts([]);
        setTotalPages(0);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch accounts when dependencies change
  useEffect(() => {
    fetchAccounts();
  }, [currentPage, pageSize, searchTerm, selectedPlatform]);

  // Handle budget update that updates database
  const handleBudgetUpdate = (updatedAccount: SocialAccount) => {
    setLocalAccounts(prev => 
      prev.map(account => 
        account.id === updatedAccount.id ? updatedAccount : account
      )
    );
    console.log('Budget updated successfully');
  };

  // Handle contact added
  const handleContactAdded = async (accountId: string) => {
    try {
      // You could refresh the specific account data here if needed
      // For now, just show success message
      console.log('Contact added successfully for account:', accountId);
    } catch (error) {
      console.error('Error handling contact addition:', error);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (accountId: string, influencerId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete the account "${username}"?`)) {
      return;
    }

    try {
      setDeleteLoading(prev => ({ ...prev, [accountId]: true }));
      const success = await deleteSocialAccount(influencerId, accountId);
      
      if (success) {
        alert(`Account "${username}" deleted successfully!`);
        fetchAccounts(); // Refresh the list
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [accountId]: false }));
    }
  };

  // Handle CSV import completion
  const handleImportComplete = (result: BulkImportResponse) => {
    console.log('Import completed:', result);
    setShowImportModal(false);
    fetchAccounts(); // Refresh the accounts list
    
    if (result.successful_imports > 0) {
      alert(`Successfully imported ${result.successful_imports} accounts with budget and contact data stored in database!`);
    }
    if (result.failed_imports > 0) {
      alert(`${result.failed_imports} accounts failed to import. Check console for details.`);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Helper functions for account data
  const hasStoredBudget = (account: SocialAccount): boolean => {
    return !!(account.collaboration_price || account.additional_metrics?.csv_data?.budget);
  };

  const hasStoredContacts = (account: SocialAccount): boolean => {
    return !!(account.additional_metrics?.csv_data?.email || account.additional_metrics?.csv_data?.phone);
  };

  // Calculate summary stats
  const totalFollowers = localAccounts.reduce((sum, account) => sum + (account.followers_count || 0), 0);
  const verifiedAccounts = localAccounts.filter(account => account.is_verified).length;
  const businessAccounts = localAccounts.filter(account => account.is_business).length;
  const accountsWithBudget = localAccounts.filter(account => hasStoredBudget(account)).length;

  // Optional: Account status indicators component
  const AccountStatusIndicators = ({ account }: { account: SocialAccount }) => (
    <div className="flex items-center space-x-1">
      {hasStoredBudget(account) && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          Budget ✓
        </span>
      )}
      {hasStoredContacts(account) && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          Contacts ✓
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Left side */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 text-purple-600" size={32} />
                Social Accounts
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage social media accounts with budget and contact information
              </p>
            </div>
            
            {/* Right side */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              >
                <Upload className="mr-2" size={16} />
                Import CSV with Budget
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                <Users className="mr-2" size={16} />
                Add Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Accounts</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalItems.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Followers</dt>
                    <dd className="text-lg font-medium text-gray-900">{totalFollowers.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Verified Accounts</dt>
                    <dd className="text-lg font-medium text-gray-900">{verifiedAccounts.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Accounts with Budget</dt>
                    <dd className="text-lg font-medium text-gray-900">{accountsWithBudget.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search Input */}
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Search accounts by name, username, or platform..."
                />
              </div>
            </div>

            {/* Platform Filter */}
            <div className="flex-shrink-0">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="">All Platforms</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Social Accounts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <EnhancedSocialAccountsTable
            accounts={localAccounts}
            isLoading={loading}
            searchText={searchTerm}
            pagination={{
              page: currentPage,
              page_size: pageSize,
              total_items: totalItems,
              total_pages: totalPages,
              has_next: currentPage < totalPages,
              has_previous: currentPage > 1,
            }}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onDeleteAccount={handleDeleteAccount}
            deleteLoading={deleteLoading}
          />
          
          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <CSVImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImportComplete={handleImportComplete}
            platforms={platforms}
            selectedPlatform={selectedPlatformForImport}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default SocialAccountsPage;