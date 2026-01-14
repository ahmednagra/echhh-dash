// src/services/outreach-agent-manager/outreach-agent-manager.server.ts
import { serverApiClient } from '@/lib/server-api';
import { OutreachAgentManagerStats } from '@/types/outreach-agent-manager';

/**
 * Get outreach agent manager statistics from FastAPI backend (server-side)
 */
export async function getOutreachAgentManagerStatsServer(
  authToken?: string
): Promise<OutreachAgentManagerStats> {
  try {
    console.log('🚀 Server: Starting getOutreachAgentManagerStatsServer call');
    
    const endpoint = '/outreach-agent-manager/stats';
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.get<OutreachAgentManagerStats>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching outreach agent manager stats:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No outreach agent manager stats data received from FastAPI');
      throw new Error('Failed to get outreach agent manager statistics');
    }
    
    console.log('✅ Server: Successfully fetched outreach agent manager statistics');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in getOutreachAgentManagerStatsServer:', error);
    throw error;
  }
}