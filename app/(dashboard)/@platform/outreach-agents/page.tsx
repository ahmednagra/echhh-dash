// src/app/(dashboard)/@platform/outreach-agents/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getOutreachAgents } from '@/services/outreach-agents';
import { OutreachAgent, OutreachAgentsPagination } from '@/types/outreach-agents';
import OutreachAgentsTable from '@/components/dashboard/outreach-agents/table/OutreachAgentsTable';
import StatsCards from '@/components/dashboard/outreach-agents/table/StatsCards';
import Filters from '@/components/dashboard/outreach-agents/table/Filters';
import { toast } from 'react-hot-toast';
import { withRoleAccess } from '@/components/auth/withRoleAccess';

function OutreachAgentsPage() {
  const [agents, setAgents] = useState<OutreachAgent[]>([]);
  const [pagination, setPagination] = useState<OutreachAgentsPagination>({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // Fetch agents function with filters
  const fetchAgents = async (
    page: number = 1, 
    pageSize: number = 10,
    search?: string,
    type?: string,
    status?: string
  ) => {
    console.log('🟢 fetchAgents called with:', { page, pageSize, search, type, status });
    
    try {
      setLoading(true);
      setError(null);

      // Build filters
      const filters: any = {};
      if (search) filters.search = search;
      if (type && type !== 'all') filters.agent_type = type;
      if (status && status !== 'all') filters.status = status;

      const result = await getOutreachAgents(page, pageSize, filters);

      console.log('✅ getOutreachAgents returned:', result);

      setAgents(result.agents || []);
      setPagination(result.pagination || {
        page: 1,
        page_size: 10,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      });

    } catch (error) {
      console.error('❌ Error in fetchAgents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load agents';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Show empty state instead of error in table
      setAgents([]);
      setPagination({
        page: 1,
        page_size: 10,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      });
    } finally {
      setLoading(false);
      console.log('🏁 fetchAgents finished');
    }
  };

  // Fetch on mount
  useEffect(() => {
    console.log('🎬 OutreachAgentsPage mounted');
    fetchAgents(1, 10, searchTerm, filterType, filterStatus);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (!loading) {
      fetchAgents(1, pagination.page_size, searchTerm, filterType, filterStatus);
    }
  }, [searchTerm, filterType, filterStatus]);

  // Debounced search handler
  const handleSearchChange = (term: string) => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timer = setTimeout(() => {
      setSearchTerm(term);
    }, 500);

    setSearchDebounce(timer);
  };

  const handleTypeChange = (type: string) => {
    setFilterType(type);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
  };

  const handlePageChange = (newPage: number) => {
    console.log('📄 Page change requested:', newPage);
    fetchAgents(newPage, pagination.page_size, searchTerm, filterType, filterStatus);
  };

  const handleAddAgent = () => {
    toast.success('Add agent feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-4">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Outreach Agents</h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor all outreach agents
            </p>
          </div>
          <button 
            onClick={handleAddAgent}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Add New Agent
          </button>
        </div>

        {/* Stats Cards */}
        <StatsCards agents={agents} loading={loading} />

        {/* Filters */}
        <Filters
          searchTerm={searchTerm}
          filterType={filterType}
          filterStatus={filterStatus}
          onSearchChange={handleSearchChange}
          onTypeChange={handleTypeChange}
          onStatusChange={handleStatusChange}
        />

        {/* Table */}
        <OutreachAgentsTable
          agents={agents || []}
          loading={loading}
          error={error}
        />

        {/* Pagination */}
        {!loading && agents.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.page_size) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.page_size, pagination.total_items)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.total_items}</span> results
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.has_previous}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700 px-3">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.has_next}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

// Protect the page with role-based access
export default withRoleAccess(OutreachAgentsPage, {
  allowedRoles: [
    'platform_super_admin',
    'platform_admin',
    'platform_outreach_manager',
    'platform_operations_manager'
  ],
  requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }]
});