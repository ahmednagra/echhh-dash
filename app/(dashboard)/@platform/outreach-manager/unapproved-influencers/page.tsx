// src/app/(dashboard)/@platform/outreach-manager/unapproved-influencers/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Users,
  DollarSign,
  RefreshCw,
  Search,
  TrendingUp,
  PieChart,
} from 'react-feather';
import { withRoleAccess } from '@/components/auth/withRoleAccess';
import { getUnapprovedInfluencers } from '@/services/outreach-manager-campaigns';
import {
  UnapprovedInfluencersStats,
  AgentInfo,
} from '@/types/outreach-manager-campaigns';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
import { getStatusList } from '@/services/statuses/statuses.client';
import MembersTable from '@/components/dashboard/platform/components/MembersTable';

// ✅ FIXED: Currency symbols map with proper symbols
const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  PKR: 'Rs',
  AED: 'AED ',
  BHD: 'BHD ',
  SAR: 'SAR ',
  QAR: 'QAR ',
  KWD: 'KWD ',
  OMR: 'OMR ',
};

// ✅ FIXED: Format currency value with proper symbol handling
const formatCurrencyValue = (value: number, currency: string): string => {
  const symbol = currencySymbols[currency] || `${currency} `;

  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(1)}K`;
  }
  return `${symbol}${value.toLocaleString()}`;
};

// ✅ NEW: Animated Number Counter Hook
function useCountAnimation(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated || end === 0) {
      setCount(end);
      return;
    }

    setHasAnimated(true);
    let startTime: number | null = null;
    const startValue = 0;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(
        startValue + (end - startValue) * easeOutQuart,
      );

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, hasAnimated]);

  return count;
}

// ✅ NEW: Animated Stat Card Component
function AnimatedStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
  delay = 0,
  isNumeric = false,
  prefix = '',
  suffix = '',
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor: string;
  delay?: number;
  isNumeric?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedValue = useCountAnimation(isVisible ? numericValue : 0, 1500);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Determine the accent color for the bottom bar based on iconBg
  const getAccentColor = () => {
    if (iconBg.includes('amber')) return 'bg-amber-400';
    if (iconBg.includes('green')) return 'bg-green-400';
    if (iconBg.includes('purple')) return 'bg-purple-400';
    if (iconBg.includes('blue')) return 'bg-blue-400';
    return 'bg-gray-400';
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100 p-6 shadow-sm
        transform transition-all duration-700 ease-out cursor-default
        hover:shadow-xl hover:scale-[1.02] hover:border-gray-200
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <div className="overflow-hidden">
            <p
              className={`text-3xl font-bold ${valueColor} transition-all duration-300`}
            >
              {isNumeric ? (
                <>
                  {prefix}
                  {animatedValue.toLocaleString()}
                  {suffix}
                </>
              ) : (
                value
              )}
            </p>
          </div>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div
          className={`
            p-3 ${iconBg} rounded-xl shadow-sm
            transform transition-all duration-500
            hover:scale-110 hover:rotate-3
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}
          style={{
            transitionDelay: `${delay + 200}ms`,
          }}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>

      {/* Animated bottom border */}
      <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${getAccentColor()} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: isVisible ? '100%' : '0%',
            transitionDelay: `${delay + 400}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ✅ NEW: Animated Currency Card Component
function AnimatedCurrencyCard({
  currencyBreakdown,
  delay = 0,
}: {
  currencyBreakdown: Record<string, number>;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  const totalCurrencyValue = Object.values(currencyBreakdown).reduce(
    (sum, val) => sum + val,
    0,
  );

  const getCurrencyColors = (
    index: number,
  ): { color: string; bgColor: string } => {
    const colorPairs = [
      {
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        bgColor: 'text-blue-600',
      },
      {
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        bgColor: 'text-green-600',
      },
      {
        color: 'bg-gradient-to-r from-amber-500 to-amber-600',
        bgColor: 'text-amber-600',
      },
      {
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        bgColor: 'text-purple-600',
      },
      {
        color: 'bg-gradient-to-r from-pink-500 to-pink-600',
        bgColor: 'text-pink-600',
      },
    ];
    return colorPairs[index % colorPairs.length];
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100 p-6 shadow-sm
        transform transition-all duration-700 ease-out cursor-default
        hover:shadow-xl hover:scale-[1.02] hover:border-gray-200
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div
            className={`
              p-2 bg-purple-50 rounded-lg
              transform transition-all duration-500
              ${isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-12'}
            `}
            style={{ transitionDelay: `${delay + 200}ms` }}
          >
            <PieChart className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Currency Breakdown
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(currencyBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([currency, value], index) => {
            const colors = getCurrencyColors(index);
            const percentage =
              totalCurrencyValue > 0 ? (value / totalCurrencyValue) * 100 : 0;

            return (
              <div
                key={currency}
                className={`
                  flex items-center gap-3 group
                  transition-all duration-500
                  ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                `}
                style={{ transitionDelay: `${delay + 300 + index * 100}ms` }}
              >
                <div className="w-10 text-xs font-bold text-gray-600 uppercase tracking-wide">
                  {currency}
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full ${colors.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{
                      width: isVisible ? `${Math.max(percentage, 2)}%` : '0%',
                      transitionDelay: `${delay + 500 + index * 100}ms`,
                    }}
                  />
                </div>
                <div className="w-20 text-right">
                  <span className="text-xs font-semibold text-gray-700">
                    {formatCurrencyValue(value, currency)}
                  </span>
                </div>
                <div className="w-12 text-right">
                  <span className={`text-xs font-medium ${colors.bgColor}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        {Object.keys(currencyBreakdown).length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <PieChart className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

function UnapprovedInfluencersPage() {
  const router = useRouter();

  // Data state
  const [influencers, setInfluencers] = useState<AssignmentInfluencer[]>([]);
  const [agentMap, setAgentMap] = useState<Record<string, AgentInfo>>({});
  const [stats, setStats] = useState<UnapprovedInfluencersStats>({
    total_unapproved: 0,
    total_unapproved_value: 0,
    currency_breakdown: {},
  });
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 25, // ✅ CHANGED: Default to 25
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_previous: false,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce search - ✅ Increased debounce time for better UX
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ✅ Reset to page 1 when search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  // Fetch statuses
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statuses = await getStatusList('campaign_influencer');
        setAvailableStatuses(statuses);
      } catch (err) {
        console.error('Error fetching statuses:', err);
      }
    };
    fetchStatuses();
  }, []);

  // Fetch unapproved influencers
  const fetchUnapprovedInfluencers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUnapprovedInfluencers({
        page: pagination.page,
        page_size: pagination.page_size,
        search: debouncedSearch || undefined, // ✅ Server-side search
      });

      setInfluencers(response.influencers || []);
      setAgentMap(response.agent_map || {});
      setStats(
        response.stats || {
          total_unapproved: 0,
          total_unapproved_value: 0,
          currency_breakdown: {},
        },
      );
      setPagination((prev) => ({
        ...prev,
        ...response.pagination,
      }));
    } catch (err) {
      console.error('Error fetching unapproved influencers:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load unapproved influencers',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, pagination.page_size, debouncedSearch]);

  useEffect(() => {
    fetchUnapprovedInfluencers();
  }, [fetchUnapprovedInfluencers]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, page_size: newSize }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUnapprovedInfluencers();
  };

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  // Handle member update - remove from list after approval with delay
  const handleMemberUpdate = (updatedMember: AssignmentInfluencer) => {
    // Check if price was just approved
    if (updatedMember.campaign_influencer.price_approved) {
      // Show approved badge momentarily, then remove after 2 seconds
      setInfluencers((prev) =>
        prev.map((inf) => (inf.id === updatedMember.id ? updatedMember : inf)),
      );

      // Remove from list after delay
      setTimeout(() => {
        setInfluencers((prev) =>
          prev.filter((inf) => inf.id !== updatedMember.id),
        );
        // Update stats
        setStats((prev) => ({
          ...prev,
          total_unapproved: Math.max(0, prev.total_unapproved - 1),
          total_unapproved_value:
            prev.total_unapproved_value -
            Number(updatedMember.campaign_influencer.total_price || 0),
        }));
      }, 2000);
    } else {
      // Normal update
      setInfluencers((prev) =>
        prev.map((inf) => (inf.id === updatedMember.id ? updatedMember : inf)),
      );
    }
  };

  // Empty handlers for required props
  const handleEditCampaignStatus = () => {};
  const handleViewMember = () => {};
  const handleAddContact = () => {};
  const handleViewContacts = () => {};
  const handleTypeChange = () => {};

  // ✅ Format the total pending value for display
  const formattedTotalValue = formatCurrencyValue(
    stats.total_unapproved_value,
    'PKR',
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1 text-amber-100 hover:text-white mb-3 transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold tracking-tight">
                Un-Approved Influencers
              </h1>
              <p className="text-amber-100 mt-2 text-sm">
                View all influencers with pending price approval across all
                campaigns.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ ANIMATED: Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Unapproved Card */}
          <AnimatedStatCard
            title="Total Un-Approved"
            value={stats.total_unapproved}
            subtitle="influencers pending approval"
            icon={Users}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            valueColor="text-amber-600"
            delay={100}
            isNumeric={true}
          />

          {/* Total Value Card */}
          <AnimatedStatCard
            title="Total Pending Value"
            value={formattedTotalValue}
            subtitle="across all currencies"
            icon={TrendingUp}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            valueColor="text-green-600"
            delay={200}
            isNumeric={false}
          />

          {/* Currency Breakdown Card */}
          <AnimatedCurrencyCard
            currencyBreakdown={stats.currency_breakdown}
            delay={300}
          />
        </div>

        {/* ✅ IMPROVED: Search and Refresh */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by influencer name or campaign name..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm bg-gray-50 focus:bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="p-3 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all disabled:opacity-50 border border-gray-200 hover:border-amber-200"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
            {/* Show search results info */}
            {debouncedSearch && (
              <div className="text-sm text-gray-500">
                Found{' '}
                <span className="font-semibold text-amber-600">
                  {pagination.total_items}
                </span>{' '}
                results
              </div>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-red-600">⚠️</span>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={handleRefresh}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* MembersTable */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <MembersTable
            members={influencers}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onEditCampaignStatus={handleEditCampaignStatus}
            onViewMember={handleViewMember}
            onAddContact={handleAddContact}
            onViewContacts={handleViewContacts}
            availableStatuses={availableStatuses}
            onTypeChange={handleTypeChange}
            currentType="active"
            assignment={null as any}
            onMemberUpdate={handleMemberUpdate}
            // View configuration
            hideContactTimeline={true}
            hideMessageColumn={true}
            showAgentColumn={true}
            showAttemptsOnly={true}
            agentMap={agentMap}
            hideActionsColumn={true}
            hideSearchField={true}
            // New columns
            showTagsColumn={true}
            showXCampaignsColumn={true}
            showCPVColumn={true}
            // Campaign Name column
            showCampaignNameColumn={true}
            showAssignedAtColumn={true}
            showClientStatusColumn={true} // ✅ ADD THIS
          />
        </div>
      </div>
    </div>
  );
}

export default withRoleAccess(UnapprovedInfluencersPage, {
  allowedRoles: [
    'platform_outreach_manager',
    'platform_super_admin',
    'platform_admin',
  ],
  requiredPermissions: [{ resource: 'agent_assignment', action: 'read' }],
});
