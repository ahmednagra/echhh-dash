// src/services/outreach-manager-campaigns/outreach-manager-campaigns.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { OutreachAgent } from '@/types/outreach-agents';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import {
  OutreachManagerCampaign,
  OutreachManagerCampaignsResponse,
  CampaignInfluencersWithAgentResponse,
  AgentInfo,
  UnapprovedInfluencersResponse, // ← ADD THIS
} from '@/types/outreach-manager-campaigns';

interface AgentAssignmentFromAPI {
  id: string;
  outreach_agent_id: string;
  campaign_list_id: string;
  assigned_influencers_count: number;
  completed_influencers_count: number;
  pending_influencers_count: number;
  archived_influencers_count: number | null;
  campaign: {
    id: string;
    name: string;
    brand_name: string;
  };
  status: {
    id: string;
    name: string;
  };
}

/**
 * Get all campaigns with aggregated assignment stats (server-side)
 */
export async function getOutreachManagerCampaignsServer(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  authToken?: string,
): Promise<OutreachManagerCampaignsResponse> {
  try {
    console.log('🚀 Server: Starting getOutreachManagerCampaignsServer');

    // Step 1: Get all outreach agents
    const agentsResponse = await serverApiClient.get<{
      agents: OutreachAgent[];
    }>(ENDPOINTS.OUTREACH_AGENTS.LIST, {}, authToken);

    if (agentsResponse.error || !agentsResponse.data?.agents) {
      console.error('❌ Server: Failed to fetch agents:', agentsResponse.error);
      throw new Error('Failed to fetch outreach agents');
    }

    const agents = agentsResponse.data.agents;
    console.log(`✅ Server: Fetched ${agents.length} agents`);

    // Step 2: Get all assignments for all agents
    const campaignStatsMap = new Map<
      string,
      {
        campaign: any;
        campaignListId: string | null;
        totalAssigned: number;
        totalCompleted: number;
        totalPending: number;
        totalArchived: number;
        agentCount: number;
      }
    >();

    for (const agent of agents) {
      try {
        const assignmentsResponse = await serverApiClient.get<{
          assignments: AgentAssignmentFromAPI[];
        }>(
          `${ENDPOINTS.AGENT_ASSIGNMENTS.BY_AGENT_ID(agent.id)}?completion_status=incomplete`,
          {},
          authToken,
        );

        if (assignmentsResponse.data?.assignments) {
          for (const assignment of assignmentsResponse.data.assignments) {
            const campaignId = assignment.campaign?.id;
            if (!campaignId) continue;

            const existing = campaignStatsMap.get(campaignId);
            if (existing) {
              existing.totalAssigned +=
                assignment.assigned_influencers_count || 0;
              existing.totalCompleted +=
                assignment.completed_influencers_count || 0;
              existing.totalPending +=
                assignment.pending_influencers_count || 0;
              existing.totalArchived +=
                assignment.archived_influencers_count || 0;
              existing.agentCount += 1;
            } else {
              campaignStatsMap.set(campaignId, {
                campaign: assignment.campaign,
                campaignListId: assignment.campaign_list_id,
                totalAssigned: assignment.assigned_influencers_count || 0,
                totalCompleted: assignment.completed_influencers_count || 0,
                totalPending: assignment.pending_influencers_count || 0,
                totalArchived: assignment.archived_influencers_count || 0,
                agentCount: 1,
              });
            }
          }
        }
      } catch (err) {
        console.warn(
          `⚠️ Server: Failed to fetch assignments for agent ${agent.id}:`,
          err,
        );
      }
    }

    // Step 3: Convert map to array and apply search filter
    let campaigns: OutreachManagerCampaign[] = Array.from(
      campaignStatsMap.entries(),
    ).map(([campaignId, stats]) => {
      const completionRate =
        stats.totalAssigned > 0
          ? (stats.totalCompleted / stats.totalAssigned) * 100
          : 0;

      return {
        id: campaignId,
        name: stats.campaign.name || 'Unknown Campaign',
        brand_name: stats.campaign.brand_name || 'Unknown Brand',
        status: {
          id: 'active',
          name: 'Active',
        },
        company_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_assigned: stats.totalAssigned,
        total_completed: stats.totalCompleted,
        total_pending: stats.totalPending,
        total_archived: stats.totalArchived,
        completion_rate: Math.round(completionRate * 100) / 100,
        campaign_list_id: stats.campaignListId,
        total_influencers_in_list: stats.totalAssigned,
        total_agents_assigned: stats.agentCount,
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      campaigns = campaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.brand_name.toLowerCase().includes(searchLower),
      );
    }

    // Apply pagination
    const totalItems = campaigns.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedCampaigns = campaigns.slice(
      startIndex,
      startIndex + pageSize,
    );

    console.log(
      `✅ Server: Returning ${paginatedCampaigns.length} campaigns (page ${page} of ${totalPages})`,
    );

    return {
      success: true,
      campaigns: paginatedCampaigns,
      pagination: {
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
      },
    };
  } catch (error) {
    console.error(
      '💥 Server: Error in getOutreachManagerCampaignsServer:',
      error,
    );
    throw error;
  }
}

/**
 * Get campaign influencers with agent info (server-side)
 * Returns AssignmentInfluencer[] format for MembersTable compatibility
 */
export async function getCampaignInfluencersForManagerServer(
  campaignId: string,
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  authToken?: string,
): Promise<CampaignInfluencersWithAgentResponse> {
  try {
    console.log(
      `🚀 Server: Starting getCampaignInfluencersForManagerServer for campaign ${campaignId}`,
    );

    // Step 1: Get all outreach agents
    const agentsResponse = await serverApiClient.get<{
      agents: OutreachAgent[];
    }>(ENDPOINTS.OUTREACH_AGENTS.LIST, {}, authToken);

    if (agentsResponse.error || !agentsResponse.data?.agents) {
      throw new Error('Failed to fetch outreach agents');
    }

    const agents = agentsResponse.data.agents;
    const agentNameMap = new Map(
      agents.map((a) => [a.id, a.assigned_user?.full_name || 'Unknown Agent']),
    );

    // Step 2: Find all assignments for this campaign across all agents
    const allInfluencers: AssignmentInfluencer[] = [];
    const agentMap: Record<string, AgentInfo> = {};
    let totalAssigned = 0;
    let totalCompleted = 0;
    let totalPending = 0;
    let totalArchived = 0;
    let campaignName = ''; // ✅ ADD THIS LINE

    for (const agent of agents) {
      try {
        // Get assignments for this agent
        const assignmentsResponse = await serverApiClient.get<{
          assignments: AgentAssignmentFromAPI[];
        }>(ENDPOINTS.AGENT_ASSIGNMENTS.BY_AGENT_ID(agent.id), {}, authToken);

        if (!assignmentsResponse.data?.assignments) continue;

        // Find assignments for this specific campaign
        const campaignAssignments = assignmentsResponse.data.assignments.filter(
          (a) => a.campaign?.id === campaignId,
        );

        // ✅ Extract campaign name from first matching assignment
        if (!campaignName && campaignAssignments.length > 0) {
          campaignName = campaignAssignments[0].campaign?.name || '';
        }

        for (const assignment of campaignAssignments) {
          // Aggregate stats
          totalAssigned += assignment.assigned_influencers_count || 0;
          totalCompleted += assignment.completed_influencers_count || 0;
          totalPending += assignment.pending_influencers_count || 0;
          totalArchived += assignment.archived_influencers_count || 0;

          // Get influencers for this assignment (fetch all types)
          for (const type of ['active', 'archived', 'completed']) {
            try {
              const influencersResponse = await serverApiClient.get<{
                influencers: AssignmentInfluencer[];
              }>(
                `${ENDPOINTS.AGENT_ASSIGNMENTS.INFLUENCERS_LIST(assignment.id)}?page=1&page_size=100&type=${type}`,
                {},
                authToken,
              );

              if (influencersResponse.data?.influencers) {
                for (const inf of influencersResponse.data.influencers) {
                  // Add influencer to list
                  allInfluencers.push(inf);

                  // Map influencer.id to agent info
                  agentMap[inf.id] = {
                    id: agent.id,
                    name: agentNameMap.get(agent.id) || 'Unknown Agent',
                  };
                }
              }
            } catch (err) {
              console.warn(
                `⚠️ Server: Failed to fetch ${type} influencers for assignment ${assignment.id}:`,
                err,
              );
            }
          }
        }
      } catch (err) {
        console.warn(
          `⚠️ Server: Failed to fetch data for agent ${agent.id}:`,
          err,
        );
      }
    }

    // Apply search filter
    let filteredInfluencers = allInfluencers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInfluencers = allInfluencers.filter((inf) => {
        const name = inf.campaign_influencer?.social_account?.full_name || '';
        const username =
          inf.campaign_influencer?.social_account?.account_handle || '';
        const agentInfo = agentMap[inf.id];
        const agentName = agentInfo?.name || '';

        return (
          name.toLowerCase().includes(searchLower) ||
          username.toLowerCase().includes(searchLower) ||
          agentName.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply pagination
    const totalItems = filteredInfluencers.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedInfluencers = filteredInfluencers.slice(
      startIndex,
      startIndex + pageSize,
    );

    const completionRate =
      totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;

    console.log(
      `✅ Server: Returning ${paginatedInfluencers.length} influencers for campaign ${campaignId}`,
    );

    return {
      success: true,
      influencers: paginatedInfluencers,
      agentMap,
      campaign_name: campaignName, // ✅ ADD THIS LINE
      stats: {
        total_assigned: totalAssigned,
        total_completed: totalCompleted,
        total_pending: totalPending,
        total_archived: totalArchived,
        completion_rate: Math.round(completionRate * 100) / 100,
      },
      pagination: {
        page,
        page_size: pageSize,
        total_items: totalItems,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1,
      },
    };
  } catch (error) {
    console.error(
      '💥 Server: Error in getCampaignInfluencersForManagerServer:',
      error,
    );
    throw error;
  }
}

/**
 * Get all unapproved influencers across all campaigns (server-side)
 * Returns AssignmentInfluencer[] format for MembersTable compatibility
 */
export async function getUnapprovedInfluencersServer(
  page: number = 1,
  pageSize: number = 50,
  search?: string,
  authToken?: string,
): Promise<UnapprovedInfluencersResponse> {
  try {
    console.log('🚀 Server: Starting getUnapprovedInfluencersServer');

    // Build query params
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString(),
    });

    if (search) {
      queryParams.append('search', search);
    }

    // Call the backend endpoint directly
    const response = await serverApiClient.get<{
      success: boolean;
      influencers: AssignmentInfluencer[];
      pagination: {
        page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
        has_next: boolean;
        has_previous: boolean;
      };
      stats: {
        total_unapproved: number;
        total_unapproved_value: number;
        currency_breakdown: Record<string, number>;
      };
      agent_map: Record<string, AgentInfo>;
    }>(
      `/assigned-influencers/unapproved-influencers?${queryParams.toString()}`,
      {},
      authToken,
    );

    if (response.error || !response.data) {
      console.error(
        '❌ Server: Failed to fetch unapproved influencers:',
        response.error,
      );
      throw new Error(
        response.error?.message || 'Failed to fetch unapproved influencers',
      );
    }

    console.log(
      `✅ Server: Returning ${response.data.influencers?.length || 0} unapproved influencers`,
    );

    return {
      success: true,
      influencers: response.data.influencers || [],
      pagination: response.data.pagination || {
        page,
        page_size: pageSize,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
      },
      stats: response.data.stats || {
        total_unapproved: 0,
        total_unapproved_value: 0,
        currency_breakdown: {},
      },
      agent_map: response.data.agent_map || {},
    };
  } catch (error) {
    console.error('💥 Server: Error in getUnapprovedInfluencersServer:', error);
    throw error;
  }
}
