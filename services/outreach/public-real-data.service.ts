// src/services/outreach/public-real-data.service.ts
/**
 * Public service for fetching REAL outreach data without authentication
 * This bypasses the authentication layer to get the same data as private view
 */

export interface PublicOutreachResponse {
  success: boolean;
  influencers: any[];
  statuses: any[];
  error?: string;
  isDevelopmentMode?: boolean; // Add this for development mode detection
  message?: string; // Add this for development messages
}

export interface PublicUpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Get REAL public outreach data - same as private view but without auth
 */
export async function getRealPublicOutreachData(): Promise<PublicOutreachResponse> {
  try {
    console.log('🔓 PUBLIC REAL DATA SERVICE: Fetching actual campaign data');
    
    // Use your Next.js API route to bypass authentication
    const response = await fetch('/api/v0/public/outreach/real-data', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header - handled by the API route
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ PUBLIC REAL DATA SERVICE: API error:', response.status, errorData);
      
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API returned unsuccessful response');
    }

    console.log(`✅ PUBLIC REAL DATA SERVICE: Successfully fetched ${data.influencers?.length || 0} real influencers`);
    
    return {
      success: true,
      influencers: data.influencers || [],
      statuses: data.statuses || []
    };
    
  } catch (error) {
    console.error('💥 PUBLIC REAL DATA SERVICE: Error fetching real data:', error);
    
    return {
      success: false,
      influencers: [],
      statuses: [],
      error: error instanceof Error ? error.message : 'Failed to load real data'
    };
  }
}

/**
 * Update REAL public outreach data - same functionality as private view
 */
export async function updateRealPublicOutreachData(
  action: 'onboard' | 'budget' | 'comments' | 'status',
  influencerIds: string[],
  data?: any
): Promise<PublicUpdateResponse> {
  try {
    console.log(`🔄 PUBLIC REAL DATA SERVICE: Updating ${action} for real influencers:`, influencerIds);
    
    const response = await fetch(`/api/v0/public/outreach/update/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header - handled by the API route
      },
      body: JSON.stringify({
        influencer_ids: influencerIds,
        ...data
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ PUBLIC REAL DATA SERVICE: Update ${action} error:`, response.status, errorData);
      
      throw new Error(errorData.error || `Update ${action} failed: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.error || `Update ${action} was not successful`);
    }

    console.log(`✅ PUBLIC REAL DATA SERVICE: Successfully updated ${action}`);
    
    return responseData;
    
  } catch (error) {
    console.error(`💥 PUBLIC REAL DATA SERVICE: Error updating ${action}:`, error);
    throw error;
  }
}