// src/app/(dashboard)/@platform/outreach-manager/campaigns/[campaignId]/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  Users,
  CheckCircle,
  Clock,
  Archive,
  TrendingUp,
} from 'react-feather';
import { withRoleAccess } from '@/components/auth/withRoleAccess';
import { getCampaignInfluencersForManager } from '@/services/outreach-manager-campaigns';
import { getStatuses } from '@/services/statuses/statuses.client';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
import { AgentInfo } from '@/types/outreach-manager-campaigns';
import MembersTable from '@/components/dashboard/platform/components/MembersTable';

function CampaignInfluencersPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params?.campaignId as string;

  const [influencers, setInfluencers] = useState<AssignmentInfluencer[]>([]);
  const [agentMap, setAgentMap] = useState<Record<string, AgentInfo>>({});
  const [campaignName, setCampaignName] = useState<string>(''); // ✅ ADD THIS
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [stats, setStats] = useState({
    total_assigned: 0,
    total_completed: 0,
    total_pending: 0,
    total_archived: 0,
    completion_rate: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch statuses on mount
  useEffect(() => {
    const fetchStatuses = async () => {
      try { 
        // ✅ FIXED: Pass 'campaign_influencer' as model parameter
        const statusesData = await getStatuses('campaign_influencer', 'status_id');
        setAvailableStatuses(statusesData);
      } catch (err) {
        console.error('Failed to fetch statuses:', err);
      }
    };
    fetchStatuses();
  }, []);

  const fetchInfluencers = useCallback(async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getCampaignInfluencersForManager(campaignId, {
        page: pagination.page,
        page_size: pagination.page_size,
        search: debouncedSearch || undefined,
      });
      setInfluencers(response.influencers || []);
      setAgentMap(response.agentMap || {});
      setStats(response.stats);
      setPagination(response.pagination);

      // ✅ Extract campaign name from response
      if (response.campaign_name) {
        setCampaignName(response.campaign_name);
      } else if (response.influencers?.[0]) {
        // Fallback: try to get from first influencer's assignment
        const firstInfluencer = response.influencers[0];
        const agentInfo = response.agentMap?.[firstInfluencer.id];
        if (agentInfo?.campaign_name) {
          setCampaignName(agentInfo.campaign_name);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load influencers',
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId, pagination.page, pagination.page_size, debouncedSearch]);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, page_size: newSize }));
  };

  // Handler for member updates from MembersTable
  const handleMemberUpdate = (updatedMember: AssignmentInfluencer) => {
    setInfluencers((prev) =>
      prev.map((inf) => (inf.id === updatedMember.id ? updatedMember : inf)),
    );
  };

  // Empty handlers for required props (not used in this view)
  const handleEditCampaignStatus = () => {};
  const handleViewMember = () => {};
  const handleAddContact = () => {};
  const handleViewContacts = () => {};
  const handleTypeChange = () => {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        {/* Header */}
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/outreach-manager/campaigns')}
                className="flex items-center gap-1 text-teal-100 hover:text-white mb-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Campaigns
              </button>
              <h1 className="text-3xl font-bold">Campaign Influencers</h1>
              <p className="text-teal-100 mt-2">
                View all influencers assigned to this campaign across all
                agents.
              </p>
            </div>
            {/* Campaign Name Display */}
            {campaignName && (
              <div className="ml-auto mr-8 md:mr-16 lg:mr-24">
                <p className="text-teal-200 text-xs uppercase tracking-widest mb-1 font-medium animate-pulse">
                  Campaign
                </p>
                <h2 className="text-2xl md:text-3xl text-white">
                  {campaignName}
                </h2>
                <div className="h-0.5 bg-gradient-to-r from-white/60 to-transparent mt-2 animate-pulse" />
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Assigned</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.total_assigned}
                </p>
                <p className="text-xs text-gray-400">
                  Influencers assigned to you
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.total_completed}
                </p>
                <p className="text-xs text-gray-400">
                  {stats.total_assigned > 0
                    ? `${((stats.total_completed / stats.total_assigned) * 100).toFixed(0)}% of active work`
                    : '0% of active work'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.total_pending}
                </p>
                <p className="text-xs text-gray-400">
                  {stats.total_assigned > 0
                    ? `${((stats.total_pending / stats.total_assigned) * 100).toFixed(0)}% remaining work`
                    : '0% remaining work'}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Archived</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.total_archived}
                </p>
                <p className="text-xs text-gray-400">
                  {stats.total_assigned > 0
                    ? `${((stats.total_archived / stats.total_assigned) * 100).toFixed(0)}% archived`
                    : '0% archived'}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <Archive className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.completion_rate}%
                </p>
                <p className="text-xs text-gray-400">Based on active work</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search influencers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <button
              onClick={fetchInfluencers}
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

        {/* MembersTable */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
            // NEW PROPS for Campaign Influencers view
            hideContactTimeline={true}
            hideMessageColumn={true}
            showAgentColumn={true}
            showAttemptsOnly={true}
            agentMap={agentMap}
            hideActionsColumn={true}
            hideSearchField={true}
            // Column visibility
            showTagsColumn={true}
            showXCampaignsColumn={true}
            showCPVColumn={true}
            showAssignedAtColumn={true}
            showClientStatusColumn={true} // ✅ ADD THIS
          />
        </div>
      </div>
    </div>
  );
}

export default withRoleAccess(CampaignInfluencersPage, {
  allowedRoles: [
    'platform_outreach_manager',
    'platform_super_admin',
    'platform_admin',
  ],
  requiredPermissions: [{ resource: 'agent_assignment', action: 'read' }],
});
