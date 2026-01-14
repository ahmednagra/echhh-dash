// src/types/outreach-agent-manager.ts

/**
 * Outreach Agent Manager Statistics Interface
 */
export interface OutreachAgentManagerStats {
  total_agents: number;
  active_agents: number;
  inactive_agents: number;
  available_agents: number;
  total_assignments: number;
  total_influencers_managed: number;
  total_completed: number;
  total_archived: number;
  overall_completion_rate: number;
  overall_response_rate: number;
  total_messages_sent: number;
  messages_sent_today: number;
  agents_by_type: Record<string, number>;
  available_by_type: Record<string, number>;
  generated_at: string;
}

/**
 * Response wrapper for stats API
 */
export interface OutreachAgentManagerStatsResponse {
  success: boolean;
  data?: OutreachAgentManagerStats;
  error?: string;
}