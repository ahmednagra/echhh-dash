// src/app/api/v0/public/outreach/real-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllCampaignInfluencersServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { getStatusesServer } from '@/services/statuses/statuses.server';

/**
 * Public API endpoint to fetch REAL outreach data without user authentication
 * This uses system-level access to get the same data as the private view
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔓 PUBLIC REAL DATA API: Processing request for real campaign data');
    
    // Get system/service token from environment - with fallbacks for development
    let authToken = process.env.SYSTEM_SERVICE_TOKEN || 
                    process.env.PUBLIC_ACCESS_TOKEN || 
                    process.env.DEVELOPMENT_TOKEN;
    
    if (!authToken) {
      console.warn('⚠️ PUBLIC REAL DATA API: No system token configured, trying request authentication');
      
      // Try to get token from request headers or cookies
      const authHeader = request.headers.get('Authorization');
      const cookieHeader = request.headers.get('Cookie');
      authToken = authHeader?.replace('Bearer ', '');
      
      if (!authToken && cookieHeader) {
        // Extract accessToken from cookies
        const match = cookieHeader.match(/accessToken=([^;]+)/);
        authToken = match ? match[1] : undefined;
      }
      
      // DEVELOPMENT: Try to use any token from localStorage simulation
      if (!authToken) {
        console.warn('⚠️ PUBLIC REAL DATA API: Attempting to fetch with demo/admin token approach');
        
        // For development, let's create a demo admin token request to your backend
        try {
          const adminToken = await getDemoAdminToken();
          if (adminToken) {
            return await fetchDataWithToken(adminToken, request);
          }
        } catch (adminError) {
          console.warn('⚠️ Could not get admin token:', adminError);
        }
        
        // Final fallback to development sample data
        console.warn('⚠️ PUBLIC REAL DATA API: Using sample data as final fallback');
        return await fetchDataWithoutAuth();
      }
    }

    return await fetchDataWithToken(authToken, request);
    
  } catch (error) {
    console.error('💥 PUBLIC REAL DATA API: Error fetching real data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch real outreach data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Helper function to get a demo admin token by making a login request
 */
async function getDemoAdminToken(): Promise<string | null> {
  try {
    console.log('🔐 Attempting to get demo admin token...');
    
    // Try to login with demo credentials to get a token
    // You can replace these with actual demo credentials or remove this approach
    const demoCredentials = {
      username: 'demo@example.com', // Replace with actual demo credentials
      password: 'demo123' // Replace with actual demo password
    };
    
    // Get your backend base URL
    const baseUrl = getBackendBaseUrl();
    
    const formData = new FormData();
    formData.append('username', demoCredentials.username);
    formData.append('password', demoCredentials.password);
    
    const response = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully obtained demo admin token');
      return data.access_token;
    } else {
      console.warn('⚠️ Demo admin login failed:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting demo admin token:', error);
    return null;
  }
}
    
  

/**
 * Development fallback - fetch data without authentication (for testing only)
 */
async function fetchDataWithoutAuth() {
  console.log('🔄 PUBLIC REAL DATA API: Attempting development mode without authentication');
  
  // Return sample data that matches the real data structure for testing
  // This is only used when no authentication is available in development
  const sampleInfluencers = [
    {
      id: 'dev-inf-1',
      social_account: {
        id: 'dev-social-1',
        full_name: 'Development User 1',
        account_handle: '@dev_user_1',
        followers_count: 125000,
        profile_pic_url: 'https://images.unsplash.com/photo-1494790108755-2616b612de10?w=150&h=150&fit=crop&crop=face&auto=format',
        additional_metrics: {
          engagementRate: 3.8,
          avgLikes: 4750,
          avgComments: 120
        }
      },
      collaboration_price: 2500,
      counter_budget: { amount: 0, currency: 'USD' },
      notes: '',
      client_review_status_id: 'status-2',
      ready_to_onboard: true,
      status: { name: 'completed' },
      onboarded_at: null
    },
    {
      id: 'dev-inf-2',
      social_account: {
        id: 'dev-social-2',
        full_name: 'Development User 2',
        account_handle: '@dev_user_2',
        followers_count: 89000,
        profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
        additional_metrics: {
          engagementRate: 4.2,
          avgLikes: 3740,
          avgComments: 95
        }
      },
      collaboration_price: 1800,
      counter_budget: { amount: 0, currency: 'USD' },
      notes: '',
      client_review_status_id: 'status-1',
      ready_to_onboard: true,
      status: { name: 'completed' },
      onboarded_at: null
    }
  ];

  const sampleStatuses = [
    {
      id: 'status-1',
      name: 'Pending Review',
      applies_to_field: 'client_review_status_id'
    },
    {
      id: 'status-2',
      name: 'Approved',
      applies_to_field: 'client_review_status_id'
    },
    {
      id: 'status-3',
      name: 'Needs Changes',
      applies_to_field: 'client_review_status_id'
    }
  ];

  console.log('✅ PUBLIC REAL DATA API: Returning development sample data');
  
  return NextResponse.json({
    success: true,
    influencers: sampleInfluencers,
    statuses: sampleStatuses,
    isDevelopmentMode: true,
    message: 'Using development sample data - configure SYSTEM_SERVICE_TOKEN for real data'
  });
}
    
 

/**
 * Helper function to fetch data with a given token
 */
async function fetchDataWithToken(authToken: string, request: NextRequest) {
  try {
    // Get the first available campaign's list ID
    // You can modify this logic to target a specific campaign
    const campaignListId = await getFirstAvailableCampaignListId(authToken);
    
    if (!campaignListId) {
      console.warn('⚠️ PUBLIC REAL DATA API: No campaign list found');
      return NextResponse.json({
        success: true,
        influencers: [],
        statuses: []
      });
    }

    console.log(`🎯 PUBLIC REAL DATA API: Using campaign list: ${campaignListId}`);

    // Fetch real influencers data using the same service as private view
    const influencersResponse = await getAllCampaignInfluencersServer(campaignListId, authToken);
    
    // Filter for ready-to-onboard influencers (same logic as OutreachContext)
    const readyToOnboardInfluencers = influencersResponse.influencers.filter(
      influencer => influencer.status?.name?.toLowerCase() === 'completed' && !influencer.onboarded_at
    );

    // Fetch client review statuses using the same service
    const statusesResponse = await getStatusesServer('campaign_influencer', authToken);
    const clientReviewStatuses = statusesResponse.filter(
      status => status.applies_to_field === 'client_review_status_id'
    );

    console.log(`✅ PUBLIC REAL DATA API: Found ${readyToOnboardInfluencers.length} ready-to-onboard influencers and ${clientReviewStatuses.length} statuses`);
    
    // Return the same data structure as private view
    return NextResponse.json({
      success: true,
      influencers: readyToOnboardInfluencers,
      statuses: clientReviewStatuses
    });
  } catch (error) {
    console.error('💥 PUBLIC REAL DATA API: Error in fetchDataWithToken:', error);
    throw error;
  }
}

/**
 * Helper function to get the first available campaign list ID
 * You can modify this to target a specific campaign
 */
async function getFirstAvailableCampaignListId(authToken: string): Promise<string | null> {
  try {
    // Get campaigns using your existing API
    const baseUrl = getBackendBaseUrl();
    const response = await fetch(`${baseUrl}/v0/campaigns`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch campaigns: ${response.status}`);
    }

    const campaignsData = await response.json();
    
    if (campaignsData.success && campaignsData.data && campaignsData.data.length > 0) {
      // Find the first campaign with influencers
      const campaignWithInfluencers = campaignsData.data.find((campaign: any) => 
        campaign.campaign_lists && 
        campaign.campaign_lists.length > 0 && 
        campaign.campaign_lists[0].total_influencers_count > 0
      );
      
      if (campaignWithInfluencers) {
        return campaignWithInfluencers.campaign_lists[0].id;
      }
      
      // If no campaign with influencers, use the first campaign
      if (campaignsData.data[0].campaign_lists && campaignsData.data[0].campaign_lists.length > 0) {
        return campaignsData.data[0].campaign_lists[0].id;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching campaign list ID:', error);
    return null;
  }
}

/**
 * Helper function to get backend base URL
 */
function getBackendBaseUrl(): string {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'local';
  
  if (appEnv === 'production') {
    return process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_PRO!;
  } else if (appEnv === 'development') {
    return process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV!;
  } else {
    return process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
  }
}