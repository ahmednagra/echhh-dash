// src/services/outreach/public-outreach.service.ts
/**
 * Public service for fetching and updating outreach data without authentication
 * This service provides full read-write access to outreach data for public URLs
 */

export interface PublicOutreachResponse {
  success: boolean;
  influencers: any[];
  statuses: any[];
  error?: string;
}

export interface PublicUpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Get public outreach data without authentication
 * Updated to fetch real campaign data from the API
 */
export async function getPublicOutreachData(): Promise<PublicOutreachResponse> {
  try {
    console.log('🔓 PUBLIC OUTREACH SERVICE: Fetching public outreach data');
    
    // Get the base URL for the current environment
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'local';
    let baseUrl = '';
    
    if (appEnv === 'production') {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_PRO!;
    } else if (appEnv === 'development') {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV!;
    } else if (appEnv === 'local') {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
    } else {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
    }

    // Fallback if not set
    if (!baseUrl) {
      console.warn('⚠️ No base URL set for environment. Using localhost fallback.');
      baseUrl = 'http://127.0.0.1:8000';
    }

    // First, get campaigns to find the campaign with influencers
    const campaignsUrl = `${baseUrl}/v0/campaigns`;
    
    console.log(`🌐 PUBLIC OUTREACH SERVICE: Fetching campaigns from: ${campaignsUrl}`);
    
    const campaignsResponse = await fetch(campaignsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // For now, you may need to include auth token - update this based on your API requirements
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE', // Remove this line if truly public
      },
    });

    if (!campaignsResponse.ok) {
      throw new Error(`Failed to fetch campaigns: ${campaignsResponse.status}`);
    }

    const campaignsData = await campaignsResponse.json();
    console.log('📊 Campaigns data:', campaignsData);

    // Find a campaign that has influencers
    let selectedCampaign = null;
    if (campaignsData.success && campaignsData.data && campaignsData.data.length > 0) {
      // Find the first campaign with influencers
      selectedCampaign = campaignsData.data.find((campaign: any) => 
        campaign.campaign_lists && 
        campaign.campaign_lists.length > 0 && 
        campaign.campaign_lists[0].total_influencers_count > 0
      );
      
      // If no campaign with influencers found, use the first campaign
      if (!selectedCampaign) {
        selectedCampaign = campaignsData.data[0];
      }
    }

    if (!selectedCampaign) {
      console.warn('⚠️ No campaigns found');
      return {
        success: true,
        influencers: [],
        statuses: []
      };
    }

    console.log('🎯 Selected campaign:', selectedCampaign.name, selectedCampaign.id);

    // Now fetch influencers for this campaign
    const campaignListId = selectedCampaign.campaign_lists[0]?.id;
    if (!campaignListId) {
      console.warn('⚠️ No campaign list found');
      return {
        success: true,
        influencers: [],
        statuses: []
      };
    }

    const influencersUrl = `${baseUrl}/v0/campaign-list-members/${campaignListId}?ready_to_onboard=true`;
    
    console.log(`🌐 PUBLIC OUTREACH SERVICE: Fetching influencers from: ${influencersUrl}`);
    
    const influencersResponse = await fetch(influencersUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // For now, you may need to include auth token - update this based on your API requirements
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE', // Remove this line if truly public
      },
    });

    if (!influencersResponse.ok) {
      console.error('❌ Failed to fetch influencers:', influencersResponse.status);
      // Return empty data instead of throwing error
      return {
        success: true,
        influencers: [],
        statuses: []
      };
    }

    const influencersData = await influencersResponse.json();
    console.log('👥 Influencers data:', influencersData);

    // Fetch statuses
    const statusesUrl = `${baseUrl}/v0/statuses?type=client_review`;
    
    const statusesResponse = await fetch(statusesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // For now, you may need to include auth token - update this based on your API requirements
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE', // Remove this line if truly public
      },
    });

    let statuses = [];
    if (statusesResponse.ok) {
      const statusesData = await statusesResponse.json();
      statuses = statusesData.success ? statusesData.data || [] : [];
    }

    const influencers = influencersData.success ? influencersData.members || [] : [];
    
    console.log(`✅ PUBLIC OUTREACH SERVICE: Successfully fetched ${influencers.length} influencers and ${statuses.length} statuses`);
    
    return {
      success: true,
      influencers: influencers,
      statuses: statuses
    };
    
  } catch (error) {
    console.error('💥 PUBLIC OUTREACH SERVICE: Error fetching public outreach data:', error);
    
    // Return empty data instead of throwing error to prevent UI crashes
    return {
      success: false,
      influencers: [],
      statuses: [],
      error: error instanceof Error ? error.message : 'Failed to load data'
    };
  }
}

/**
 * Update public outreach data (FULL FUNCTIONALITY)
 * Supports: onboarding, budget updates, comment updates, status changes
 */
export async function updatePublicOutreachData(
  action: 'onboard' | 'budget' | 'comments' | 'status',
  influencerIds: string[],
  data?: any
): Promise<PublicUpdateResponse> {
  try {
    console.log(`🔄 PUBLIC OUTREACH SERVICE: Updating ${action} for influencers:`, influencerIds);
    
    // Get the base URL for the current environment
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'local';
    let baseUrl = '';
    
    if (appEnv === 'production') {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_PRO!;
    } else if (appEnv === 'development') {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV!;
    } else if (appEnv === 'local') {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
    } else {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
    }

    // Fallback if not set
    if (!baseUrl) {
      console.warn('⚠️ No base URL set for environment. Using localhost fallback.');
      baseUrl = 'http://127.0.0.1:8000';
    }

    const url = `${baseUrl}/v0/public/outreach/${action}`;
    
    console.log(`🌐 PUBLIC OUTREACH SERVICE: Making ${action} request to: ${url}`);
    
    const requestBody = {
      influencer_ids: influencerIds,
      ...data
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // CRITICAL: No Authorization header for public access
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ PUBLIC OUTREACH SERVICE: ${action} API Error:`, response.status, errorData);
      
      let errorMessage = `Failed to update ${action}`;
      
      if (response.status === 404) {
        errorMessage = `${action} endpoint not found or not available for public access`;
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = `${action} updates are not available for public access`;
      } else if (response.status >= 500) {
        errorMessage = `Server error occurred while updating ${action}`;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      throw new Error(errorMessage);
    }

    const responseData: PublicUpdateResponse = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.error || `Public API returned unsuccessful response for ${action}`);
    }

    console.log(`✅ PUBLIC OUTREACH SERVICE: Successfully updated ${action} for ${influencerIds.length} influencers`);
    
    return responseData;
    
  } catch (error) {
    console.error(`💥 PUBLIC OUTREACH SERVICE: Error updating ${action}:`, error);
    throw error;
  }
}

/**
 * Server-side version for Next.js API routes
 */
export async function getPublicOutreachDataServer(): Promise<PublicOutreachResponse> {
  try {
    console.log('🔓 PUBLIC OUTREACH SERVICE SERVER: Fetching public outreach data');
    
    // Get the base URL for the current environment
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/v0/public/outreach/ready-to-onboard`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // CRITICAL: No Authorization header for public access
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ PUBLIC OUTREACH SERVICE SERVER: API Error:', response.status, errorData);
      
      let errorMessage = 'Failed to fetch public outreach data';
      
      if (response.status === 404) {
        errorMessage = 'Outreach data not found or not available for public access';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'This outreach data is not available for public sharing';
      } else if (response.status >= 500) {
        errorMessage = 'Server error occurred while loading outreach data';
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Public API returned unsuccessful response');
    }

    console.log(`✅ PUBLIC OUTREACH SERVICE SERVER: Successfully fetched ${data.influencers?.length || 0} influencers`);
    
    return {
      success: true,
      influencers: data.influencers || [],
      statuses: data.statuses || []
    };
    
  } catch (error) {
    console.error('💥 PUBLIC OUTREACH SERVICE SERVER: Error fetching public outreach data:', error);
    throw error;
  }
}

/**
 * Fallback function to try multiple endpoints if public API fails
 */
export async function getPublicOutreachDataWithFallback(): Promise<PublicOutreachResponse> {
  try {
    // First, try the main public endpoint
    return await getPublicOutreachData();
  } catch (error) {
    console.warn('🔄 PUBLIC OUTREACH SERVICE: Main endpoint failed, trying fallback...');
    
    try {
      // Try server-side endpoint as fallback
      return await getPublicOutreachDataServer();
    } catch (fallbackError) {
      console.error('💥 PUBLIC OUTREACH SERVICE: All endpoints failed');
      
      // Return empty data instead of throwing
      return {
        success: false,
        influencers: [],
        statuses: [],
        error: 'Unable to load outreach data. Please try again later.'
      };
    }
  }
}