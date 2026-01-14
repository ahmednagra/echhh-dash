// src/app/dashboard/@platform/billing/plans/page.tsx

'use client';

/**
 * Plan Management Page
 * 
 * Comprehensive interface for managing subscription plans, features, and their relationships.
 * Provides CRUD operations with advanced filtering, sorting, and feature assignment capabilities.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  Eye, 
  Settings,
  DollarSign,
  TrendingUp,
  Package,
  AlertCircle
} from 'react-feather';

import { 
  fetchPlans, 
  fetchActivePlans,
  deletePlan, 
  restorePlan,
  fetchPlanStatistics,
  fetchPlanWithFeatures
} from '@/services/billing/plans';

import type { Plan, PlanFilters, PlanStatistics,   SortDirection } from '@/types/billing/plans';

import PlanTable from  '@/components/billing/plan/PlanTable'
import PlanFormModal from '@/components/billing/plan/PlanFormModal';
import FeatureAssignmentModal from '@/components/billing/plan/FeatureAssignmentModal';
import DeleteConfirmModal from '@/components/billing/plan/DeleteConfirmModal';
import StatsCards from '@/components/billing/plan/StatsCards';
import FiltersPanel from '@/components/billing/plan/FiltersPanel';
import TableSkeleton from '@/components/ui/TableSkeleton';
import { toast } from 'react-hot-toast';

export default function PlanManagementPage() {
  // =========================================================================
  //                      STATE MANAGEMENT
  // =========================================================================

  // Data state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [statistics, setStatistics] = useState<PlanStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state
  const [filters, setFilters] = useState<PlanFilters>({
    page: 1,
    page_size: 25,
    is_deleted: false,
    sort_by: 'display_order',
    sort_order: 'asc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [planFormModal, setPlanFormModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    plan: Plan | null;
  }>({
    isOpen: false,
    mode: 'create',
    plan: null,
  });

  const [featureModal, setFeatureModal] = useState<{
    isOpen: boolean;
    plan: Plan | null;
  }>({
    isOpen: false,
    plan: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    plan: Plan | null;
    hardDelete: boolean;
  }>({
    isOpen: false,
    plan: null,
    hardDelete: false,
  });

  // =========================================================================
  //                      DATA FETCHING
  // =========================================================================

  /**
   * Load plans with current filters
   */
  const loadPlans = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const response = await fetchPlans(filters);
      
      setPlans(response.data || []);
      setTotalItems(response.pagination.total_items);
      setTotalPages(response.pagination.total_pages);
      setCurrentPage(response.pagination.page);
      setPageSize(response.pagination.page_size);
    } catch (error: any) {
      console.error('Error loading plans:', error);
      toast.error(error.message || 'Failed to load plans');
      setPlans([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [filters]);

  /**
   * Load statistics
   */
  const loadStatistics = useCallback(async () => {
    try {
      const response = await fetchPlanStatistics();
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Error loading statistics:', error);
      // Don't show toast for stats errors
    }
  }, []);

  /**
   * Refresh data
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadPlans(false), loadStatistics()]);
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  }, [loadPlans, loadStatistics]);

  // =========================================================================
  //                      FILTER HANDLERS
  // =========================================================================

  /**
   * Handle search input change
   */
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  /**
   * Apply search filter
   */
  const handleSearchSubmit = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery || undefined,
      page: 1,
    }));
  }, [searchQuery]);

  /**
   * Clear search
   */
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setFilters(prev => ({
      ...prev,
      search: undefined,
      page: 1,
    }));
  }, []);

  /**
   * Update filters
   */
  const handleFilterChange = useCallback((newFilters: Partial<PlanFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  /**
   * Clear all filters
   */
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({
      page: 1,
      page_size: pageSize,
      is_deleted: false,
      sort_by: 'display_order',
      sort_order: 'asc',
    });
    setShowFilters(false);
  }, [pageSize]);

  // =========================================================================
  //                      PAGINATION HANDLERS
  // =========================================================================

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setFilters(prev => ({ ...prev, page_size: size, page: 1 }));
  }, []);

  // =========================================================================
  //                      SORT HANDLERS
  // =========================================================================

  const handleSort = useCallback((field: string) => {
    setFilters(prev => ({
      ...prev,
      sort_by: field as any,
      sort_order: prev.sort_by === field && prev.sort_order === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // =========================================================================
  //                      CRUD HANDLERS
  // =========================================================================

  /**
   * Open create plan modal
   */
  const handleCreate = useCallback(() => {
    setPlanFormModal({
      isOpen: true,
      mode: 'create',
      plan: null,
    });
  }, []);

  /**
   * Open edit plan modal
   */
  const handleEdit = useCallback((plan: Plan) => {
    setPlanFormModal({
      isOpen: true,
      mode: 'edit',
      plan,
    });
  }, []);

  /**
   * Open view plan modal
   */
  const handleView = useCallback((plan: Plan) => {
    setPlanFormModal({
      isOpen: true,
      mode: 'view',
      plan,
    });
  }, []);

  /**
   * Open feature assignment modal
   */
  const handleManageFeatures = useCallback((plan: Plan) => {
    setFeatureModal({
      isOpen: true,
      plan,
    });
  }, []);

  /**
   * Open delete confirmation modal
   */
  const handleDeleteClick = useCallback((plan: Plan, hardDelete = false) => {
    setDeleteModal({
      isOpen: true,
      plan,
      hardDelete,
    });
  }, []);

  /**
   * Confirm delete plan
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModal.plan) return;

    try {
      await deletePlan(deleteModal.plan.id, deleteModal.hardDelete);
      toast.success(
        deleteModal.hardDelete 
          ? 'Plan permanently deleted' 
          : 'Plan moved to trash'
      );
      setDeleteModal({ isOpen: false, plan: null, hardDelete: false });
      loadPlans(false);
      loadStatistics();
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast.error(error.message || 'Failed to delete plan');
    }
  }, [deleteModal, loadPlans, loadStatistics]);

  /**
   * Restore deleted plan
   */
  const handleRestore = useCallback(async (plan: Plan) => {
    try {
      await restorePlan(plan.id);
      toast.success('Plan restored successfully');
      loadPlans(false);
      loadStatistics();
    } catch (error: any) {
      console.error('Error restoring plan:', error);
      toast.error(error.message || 'Failed to restore plan');
    }
  }, [loadPlans, loadStatistics]);

  /**
   * Handle form submission success
   */
  const handleFormSuccess = useCallback(() => {
    setPlanFormModal({ isOpen: false, mode: 'create', plan: null });
    loadPlans(false);
    loadStatistics();
  }, [loadPlans, loadStatistics]);

  /**
   * Handle feature assignment success
   */
  const handleFeatureSuccess = useCallback(() => {
    setFeatureModal({ isOpen: false, plan: null });
    loadPlans(false);
  }, [loadPlans]);

  // =========================================================================
  //                      EFFECTS
  // =========================================================================

  // Initial load
  useEffect(() => {
    loadPlans();
    loadStatistics();
  }, []);

  // Reload when filters change
  useEffect(() => {
    loadPlans();
  }, [filters]);

  // =========================================================================
  //                      COMPUTED VALUES
  // =========================================================================

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.billing_interval ||
      filters.visibility ||
      filters.is_active !== undefined ||
      filters.is_featured !== undefined ||
      filters.min_price ||
      filters.max_price ||
      filters.currency ||
      filters.search
    );
  }, [filters]);

  // =========================================================================
  //                      RENDER
  // =========================================================================

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage subscription plans, features, and pricing configurations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleCreate}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Plan
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <StatsCards statistics={statistics} loading={loading} />
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
              placeholder="Search plans by name, code, or description..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
              hasActiveFilters
                ? 'border-teal-600 bg-teal-50 text-teal-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-teal-600 text-white text-xs rounded-full">
                Active
              </span>
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearchSubmit}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Search
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <FiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        )}
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <TableSkeleton 
            columns={8} 
            rows={pageSize} 
            // showHeader 
            // showPagination 
            showActionColumn 
          />
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No plans found
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters or search query'
                : 'Get started by creating your first subscription plan'}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={handleCreate}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Plan
              </button>
            )}
          </div>
        ) : (
          <PlanTable
            plans={plans}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            sortField={filters.sort_by || 'display_order'}
            sortDirection={filters.sort_order || 'asc'}
            showDeleted={filters.is_deleted || false}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onRestore={handleRestore}
            onManageFeatures={handleManageFeatures}
          />
        )}
      </div>

      {/* Modals */}
      <PlanFormModal
        isOpen={planFormModal.isOpen}
        mode={planFormModal.mode}
        plan={planFormModal.plan}
        onClose={() => setPlanFormModal({ isOpen: false, mode: 'create', plan: null })}
        onSuccess={handleFormSuccess}
      />

      <FeatureAssignmentModal
        isOpen={featureModal.isOpen}
        plan={featureModal.plan}
        onClose={() => setFeatureModal({ isOpen: false, plan: null })}
        onSuccess={handleFeatureSuccess}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.hardDelete ? 'Permanently Delete Plan' : 'Move Plan to Trash'}
        message={
          deleteModal.hardDelete
            ? `Are you sure you want to permanently delete "${deleteModal.plan?.name}"? This action cannot be undone and will remove all associated data.`
            : `Are you sure you want to move "${deleteModal.plan?.name}" to trash? You can restore it later if needed.`
        }
        confirmText={deleteModal.hardDelete ? 'Delete Permanently' : 'Move to Trash'}
        confirmButtonClass={deleteModal.hardDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, plan: null, hardDelete: false })}
      />
    </div>
  );
}