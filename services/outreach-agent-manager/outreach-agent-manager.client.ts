// src/services/outreach-agent-manager/outreach-agent-manager.client.ts
import { nextjsApiClient } from '@/lib/nextjs-api';
import { OutreachAgentManagerStats, OutreachAgentManagerStatsResponse } from '@/types/outreach-agent-manager';

/**
 * Get outreach agent manager statistics from Next.js API route (client-side)
 */
export async function getOutreachAgentManagerStats(): Promise<OutreachAgentManagerStats> {
  try {
    console.log('🚀 Client Service: Starting getOutreachAgentManagerStats call');
    
    const endpoint = '/api/v0/outreach-agent-manager/stats';
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<OutreachAgentManagerStatsResponse>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received');
    }

    // Handle the nested response structure
    if (response.data.success && response.data.data) {
      console.log('✅ Client Service: Successfully fetched stats');
      return response.data.data;
    }
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    throw new Error('Failed to get outreach agent manager statistics');
  } catch (error) {
    console.error('💥 Client Service: Error:', error);
    throw error;
  }
}