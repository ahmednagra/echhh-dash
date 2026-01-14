// src/app/(dashboard)/@platform/billing/subscriptions/page.tsx

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, RefreshCw } from 'react-feather';
import { getSubscriptions } from '@/services/billing/subscription/subscription.client';
import { fetchCompanies } from '@/services/companies/companies.client';
import { fetchPlans } from '@/services/billing/plans';
import type { Subscription } from '@/types/billing/subscription';
import type { Company } from '@/types/company';
import type { Plan } from '@/types/billing/plans';
import { getStatuses } from '@/services/statuses/statuses.service';
import type { Status } from '@/types/statuses';
import {
  SubscriptionTable,
  SubscriptionStats,
  SubscriptionFilters,
  DEFAULT_FILTER_VALUES,
} from '@/components/billing/subscription';
import type { SubscriptionFilterValues } from '@/components/billing/subscription';
import {
  SubscriptionTypeSelector,
  PlanSubscriptionForm,
  CustomSubscriptionForm,
} from '@/components/billing/subscription/forms';
import type { SubscriptionType } from '@/components/billing/subscription/forms';

export default function SubscriptionsPage() {
  const router = useRouter();

  // Data State
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Stats State
  const [activeCount, setActiveCount] = useState(0);
  const [trialingCount, setTrialingCount] = useState(0);
  const [canceledCount, setCanceledCount] = useState(0);

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SubscriptionFilterValues>(DEFAULT_FILTER_VALUES);

  // Modal State
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  // ✅ REMOVED: formLoading (forms manage their own loading now)

  // Companies State (for forms)
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Plans State (for filters & forms)
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // Statuses State (for filters)
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);

  // Fetch Subscriptions
  const fetchSubscriptions = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Build API filters
      const apiFilters: any = {
        page: currentPage,
        page_size: pageSize,
        is_deleted: false,
        sort_by: filters.sortBy,
        sort_order: filters.sortDirection,
      };

      // Add optional filters
      if (filters.search) apiFilters.search = filters.search;
      if (filters.status !== 'all') apiFilters.status = filters.status;
      if (filters.plan !== 'all') apiFilters.plan_id = filters.plan;
      if (filters.createdAfter) apiFilters.created_after = filters.createdAfter;
      if (filters.createdBefore) apiFilters.created_before = filters.createdBefore;
      if (filters.hasTrialPeriod) apiFilters.has_trial_period = true;
      if (filters.trialCurrentlyActive) apiFilters.trial_currently_active = true;
      if (filters.willNotAutoRenew) apiFilters.will_not_auto_renew = true;
      if (filters.cancelledSubscriptions) apiFilters.is_cancelled = true;

      const response = await getSubscriptions(apiFilters);

      setSubscriptions(response.subscriptions || []);
      setTotalItems(response.total || 0);
      setTotalPages(response.total_pages || 0);

      // Calculate stats from response
      const subs = response.subscriptions || [];
      setActiveCount(subs.filter((s: Subscription) => s.status?.name === 'active').length);
      setTrialingCount(subs.filter((s: Subscription) => s.status?.name === 'trialing').length);
      setCanceledCount(subs.filter((s: Subscription) => s.status?.name === 'canceled').length);

    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscriptions';
      setError(errorMessage);
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, pageSize, filters]);

  // Initial load and on filter/pagination changes
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // ============ Companies Fetch ============

  const fetchCompaniesForForms = async () => {
    try {
      setCompaniesLoading(true);
      const response = await fetchCompanies(0, 100);
      setCompanies(response || []);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setCompanies([]);
    } finally {
      setCompaniesLoading(false);
    }
  };

  // ✅ NEW: Fetch statuses for filters dropdown
  const fetchStatusesForFilters = async () => {
    try {
      setStatusesLoading(true);
      const response = await getStatuses('subscription');
      setStatuses(response || []);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setStatuses([]);
    } finally {
      setStatusesLoading(false);
    }
  };

  // ============ Plans Fetch ============

  const fetchPlansForDropdowns = async () => {
    try {
      console.log('Fetching plans for dropdowns from main page...');
      setPlansLoading(true);
      const response = await fetchPlans({ is_active: true, page_size: 100 });
      setPlans(response.data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  };

  // ============ Modal Handlers ============
  
  const handleAddNew = () => {
    setShowTypeSelector(true);
  };

  // Fresh API calls when subscription type selected
  const handleTypeSelect = (type: SubscriptionType) => {
    setShowTypeSelector(false);
    fetchCompaniesForForms();  // Fresh fetch for BOTH types
    if (type === 'plan') {
      fetchPlansForDropdowns();  // Fresh fetch
      setShowPlanForm(true);
    } else {
      setShowCustomForm(true);
    }
  };

  const handleBackToTypeSelector = () => {
    setShowPlanForm(false);
    setShowCustomForm(false);
    setShowTypeSelector(true);
  };

  const handleCloseAllModals = () => {
    setShowTypeSelector(false);
    setShowPlanForm(false);
    setShowCustomForm(false);
  };

  // ✅ UPDATED: Changed from onSubmit to onSuccess (forms handle API internally)
  const handlePlanFormSuccess = () => {
    console.log('Plan Subscription created successfully!');
    setShowPlanForm(false);
    fetchSubscriptions(true); // Refresh subscription list
  };

  // ✅ UPDATED: Changed from onSubmit to onSuccess (forms handle API internally)
  const handleCustomFormSuccess = () => {
    console.log('Custom Subscription created successfully!');
    setShowCustomForm(false);
    fetchSubscriptions(true); // Refresh subscription list
  };

  // ============ Existing Handlers ============

  const handleRefresh = () => {
    fetchSubscriptions(true);
  };

  const handleToggleFilters = () => {
    if (!showFilters) {
      fetchStatusesForFilters();  // Fresh fetch
      fetchPlansForDropdowns();   // Fresh fetch
    }
    setShowFilters(!showFilters);
  };

  const handleFiltersChange = (newFilters: SubscriptionFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTER_VALUES);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="p-4">
      <div className="max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Subscription Management</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Subscription</span>
            </button>
            <button
              onClick={handleToggleFilters}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg font-medium border transition-all duration-200 ${
                showFilters
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <SubscriptionStats
          totalSubscriptions={totalItems}
          activeCount={activeCount}
          trialingCount={trialingCount}
          canceledCount={canceledCount}
          loading={loading}
        />

        {/* Filters Panel */}
        {showFilters && (
          <SubscriptionFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            onClose={() => setShowFilters(false)}
            plans={plans}
            plansLoading={plansLoading}
            statuses={statuses}
            statusesLoading={statusesLoading}
          />
        )}

        {/* Table */}
        <SubscriptionTable
          subscriptions={subscriptions}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* ============ Modals ============ */}
      
      <SubscriptionTypeSelector
        isOpen={showTypeSelector}
        onClose={handleCloseAllModals}
        onSelect={handleTypeSelect}
      />

      {/* ✅ UPDATED: Changed props from onSubmit/loading to onSuccess */}
      <PlanSubscriptionForm
        isOpen={showPlanForm}
        onClose={handleCloseAllModals}
        onSuccess={handlePlanFormSuccess}
        onBack={handleBackToTypeSelector}
        companies={companies}
        companiesLoading={companiesLoading}
        plans={plans}
        plansLoading={plansLoading}
      />

      {/* ✅ UPDATED: Changed props from onSubmit/loading to onSuccess */}
      <CustomSubscriptionForm
        isOpen={showCustomForm}
        onClose={handleCloseAllModals}
        onSuccess={handleCustomFormSuccess}
        onBack={handleBackToTypeSelector}
        companies={companies}
        companiesLoading={companiesLoading}
      />
    </div>
  );
}