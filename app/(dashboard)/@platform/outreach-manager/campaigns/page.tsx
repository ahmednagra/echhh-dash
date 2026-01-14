// src/app/(dashboard)/@platform/outreach-manager/campaigns/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle,
  Clock,
  Archive,
  TrendingUp,
} from 'react-feather';
import { withRoleAccess } from '@/components/auth/withRoleAccess';
import { getOutreachManagerCampaigns } from '@/services/outreach-manager-campaigns';
import { OutreachManagerCampaign } from '@/types/outreach-manager-campaigns';
import { Grid, List } from 'react-feather'; // or lucide-react
import CampaignsTable from '@/components/dashboard/campaigns/CampaignsTable';

function OutreachManagerCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<OutreachManagerCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  });
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const pageSizeOptions = [
    10,
    20,
    50,
    100,
    { label: 'Show All', value: pagination.total_items || 999999 },
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOutreachManagerCampaigns({
        page: pagination.page,
        page_size: pagination.page_size,
        search: debouncedSearch || undefined,
      });
      setCampaigns(response.campaigns || []);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.page_size, debouncedSearch]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/outreach-manager/campaigns/${campaignId}`);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setShowPageSizeDropdown(false);
    setPagination((prev) => ({ ...prev, page: 1, page_size: newSize }));
  };

  // Sort handler
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null; // Reset sorting
        }
      }
      return { key, direction: 'asc' };
    });
  };

  // Sort campaigns
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortConfig.key) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'brand_name':
        aValue = a.brand_name.toLowerCase();
        bValue = b.brand_name.toLowerCase();
        break;
      case 'status':
        aValue = a.status?.name?.toLowerCase() || 'active';
        bValue = b.status?.name?.toLowerCase() || 'active';
        break;
      case 'total_assigned':
        aValue = a.total_assigned;
        bValue = b.total_assigned;
        break;
      case 'total_completed':
        aValue = a.total_completed;
        bValue = b.total_completed;
        break;
      case 'total_pending':
        aValue = a.total_pending;
        bValue = b.total_pending;
        break;
      case 'total_archived':
        aValue = a.total_archived;
        bValue = b.total_archived;
        break;
      case 'total_agents_assigned':
        aValue = a.total_agents_assigned;
        bValue = b.total_agents_assigned;
        break;
      case 'completion_rate':
        aValue = a.completion_rate;
        bValue = b.completion_rate;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Sortable Header Component
  const SortableHeader = ({
    label,
    sortKey,
    className = '',
  }: {
    label: string;
    sortKey: string;
    className?: string;
  }) => {
    const isActive = sortConfig?.key === sortKey;
    const direction = isActive ? sortConfig.direction : null;

    return (
      <th
        className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
        onClick={() => handleSort(sortKey)}
      >
        <div
          className={`flex items-center gap-1.5 ${className.includes('text-center') ? 'justify-center' : ''}`}
        >
          <span>{label}</span>
          <div className="flex flex-col">
            <svg
              className={`w-3 h-3 ${isActive && direction === 'asc' ? 'text-teal-600' : 'text-gray-300'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 5l-8 8h16z" />
            </svg>
            <svg
              className={`w-3 h-3 -mt-1 ${isActive && direction === 'desc' ? 'text-teal-600' : 'text-gray-300'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 19l-8-8h16z" />
            </svg>
          </div>
        </div>
      </th>
    );
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">All Campaigns</h1>
              <p className="text-teal-100 mt-2">
                View all campaigns and their outreach progress across agents.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Search and Refresh */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <button
              onClick={fetchCampaigns}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      'Campaign',
                      'Status',
                      'Total',
                      'Completed',
                      'Pending',
                      'Archived',
                      'Agents',
                      'Progress',
                    ].map((header) => (
                      <th key={header} className="px-6 py-4 text-left">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...Array(6)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                          <div className="h-3 bg-gray-100 rounded w-24 animate-pulse" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="h-6 bg-gray-200 rounded-full w-16 mx-auto animate-pulse" />
                      </td>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-6 py-4 text-center">
                          <div className="h-6 bg-gray-200 rounded w-10 mx-auto animate-pulse" />
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <div className="h-2 bg-gray-200 rounded-full w-full animate-pulse" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Campaigns Table */}
        {!loading && campaigns.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <SortableHeader
                      label="Campaign"
                      sortKey="name"
                      className="text-left"
                    />
                    <SortableHeader
                      label="Status"
                      sortKey="status"
                      className="text-center"
                    />
                    <SortableHeader
                      label="Total"
                      sortKey="total_assigned"
                      className="text-center"
                    />
                    <SortableHeader
                      label="Completed"
                      sortKey="total_completed"
                      className="text-center"
                    />
                    <SortableHeader
                      label="Pending"
                      sortKey="total_pending"
                      className="text-center"
                    />
                    <SortableHeader
                      label="Archived"
                      sortKey="total_archived"
                      className="text-center"
                    />
                    <SortableHeader
                      label="Agents"
                      sortKey="total_agents_assigned"
                      className="text-center"
                    />
                    <SortableHeader
                      label="Progress"
                      sortKey="completion_rate"
                      className="text-left min-w-[200px]"
                    />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedCampaigns.map((campaign, index) => (
                    <tr
                      key={campaign.id}
                      className="hover:bg-teal-50/50 transition-all duration-200 group"
                      style={{
                        animation: `fadeSlideIn 0.4s ease-out ${index * 0.05}s forwards`,
                        opacity: 0,
                      }}
                    >
                      {/* Campaign Name & Brand */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            onClick={() => handleCampaignClick(campaign.id)}
                            className="text-sm font-semibold text-gray-900 hover:text-teal-600 transition-colors cursor-pointer hover:underline"
                          >
                            {campaign.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {campaign.brand_name}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                          Active
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-sm">
                          {campaign.total_assigned}
                        </span>
                      </td>

                      {/* Completed */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg bg-green-50 text-green-700 font-semibold text-sm">
                          {campaign.total_completed}
                        </span>
                      </td>

                      {/* Pending */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg bg-orange-50 text-orange-700 font-semibold text-sm">
                          {campaign.total_pending}
                        </span>
                      </td>

                      {/* Archived */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-semibold text-sm">
                          {campaign.total_archived}
                        </span>
                      </td>

                      {/* Agents */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          {campaign.total_agents_assigned}
                        </span>
                      </td>

                      {/* Progress Bar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(campaign.completion_rate, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 min-w-[50px]">
                            {campaign.completion_rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && campaigns.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-500">
              {debouncedSearch
                ? 'No campaigns match your search criteria.'
                : 'There are no active campaigns with agent assignments.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && campaigns.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.page_size + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.page_size,
                      pagination.total_items,
                    )}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.total_items}</span>{' '}
                  campaigns
                </span>

                {/* Page Size Dropdown */}
                <div className="relative page-size-dropdown">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPageSizeDropdown(!showPageSizeDropdown);
                    }}
                    className="ml-2 bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    Show{' '}
                    {pagination.page_size >= pagination.total_items
                      ? 'All'
                      : pagination.page_size}
                    <svg
                      className={`ml-1 h-5 w-5 transform transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`}
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
                    <div className="absolute left-0 bottom-full mb-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {pageSizeOptions.map((option, index) => {
                          const isObject = typeof option === 'object';
                          const value = isObject ? option.value : option;
                          const label = isObject
                            ? option.label
                            : `Show ${option}`;
                          const isActive = pagination.page_size === value;
                          return (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePageSizeChange(value);
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${isActive ? 'bg-teal-50 text-teal-600 font-medium' : 'text-gray-700'}`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.has_previous}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 px-3">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.has_next}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withRoleAccess(OutreachManagerCampaignsPage, {
  allowedRoles: [
    'platform_outreach_manager',
    'platform_super_admin',
    'platform_admin',
  ],
  requiredPermissions: [{ resource: 'agent_assignment', action: 'read' }],
});
