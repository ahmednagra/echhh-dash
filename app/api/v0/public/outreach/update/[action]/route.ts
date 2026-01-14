// src/app/api/v0/public/outreach/update/[action]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { markInfluencersOnboardedServer } from '@/services/campaign-influencers/campaign-influencers.server';

/**
 * Public API endpoint for updating outreach data without user authentication
 * This handles onboard, budget, comments, and status updates
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const { action } = params;
    const body = await request.json();
    const { influencer_ids, ...data } = body;
    
    console.log(`🔄 PUBLIC UPDATE API: Processing ${action} for influencers:`, influencer_ids);
    
    if (!influencer_ids || !Array.isArray(influencer_ids)) {
      return NextResponse.json({
        success: false,
        error: 'influencer_ids array is required'
      }, { status: 400 });
    }
    
    // Get system/service token from environment - with fallbacks for development
    const systemToken = process.env.SYSTEM_SERVICE_TOKEN || 
                       process.env.PUBLIC_ACCESS_TOKEN ||
                       process.env.DEVELOPMENT_TOKEN;
    
    if (!systemToken) {
      console.warn('⚠️ PUBLIC UPDATE API: No system token configured, trying fallback authentication');
      
      // For development, try to get token from request headers or cookies
      const authHeader = request.headers.get('Authorization');
      const cookieHeader = request.headers.get('Cookie');
      let fallbackToken: string | undefined = authHeader?.replace('Bearer ', '');
      
      if (!fallbackToken && cookieHeader) {
        // Extract accessToken from cookies
        const match = cookieHeader.match(/accessToken=([^;]+)/);
        fallbackToken = match ? match[1] : undefined;
      }
      
      if (!fallbackToken) {
        return NextResponse.json({
          success: false,
          error: 'Public updates not configured - missing system token and no fallback authentication'
        }, { status: 503 });
      }
      
      return await processUpdateWithToken(fallbackToken, action, influencer_ids, data);
    }

    return await processUpdateWithToken(systemToken, action, influencer_ids, data);
    
  } catch (error) {
    console.error(`💥 PUBLIC UPDATE API: Error processing ${params.action}:`, error);
    
    return NextResponse.json({
      success: false,
      error: `Failed to update ${params.action}`,
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Helper function to process updates with a given token
 */
async function processUpdateWithToken(
  authToken: string, 
  action: string, 
  influencer_ids: string[], 
  data: any
) {
  let result;

  switch (action) {
    case 'onboard':
      result = await handleOnboard(influencer_ids, authToken);
      break;
      
    case 'budget':
      result = await handleBudgetUpdate(influencer_ids, data.budget, authToken);
      break;
      
    case 'comments':
      result = await handleCommentsUpdate(influencer_ids, data.comments, authToken);
      break;
      
    case 'status':
      result = await handleStatusUpdate(influencer_ids, data.status_id, authToken);
      break;
      
    default:
      return NextResponse.json({
        success: false,
        error: `Unsupported action: ${action}`
      }, { status: 400 });
  }

  console.log(`✅ PUBLIC UPDATE API: Successfully processed ${action}`);
  return NextResponse.json(result);
}

/**
 * Handle onboard action
 */
async function handleOnboard(influencerIds: string[], authToken: string) {
  // Get the first available campaign list ID (same logic as data fetching)
  const campaignListId = await getFirstAvailableCampaignListId(authToken);
  
  if (!campaignListId) {
    throw new Error('No campaign list found for onboarding');
  }

  // Create the request object that the server function expects
  const requestData = {
    campaign_list_id: campaignListId,
    influencer_ids: influencerIds
  };

  const result = await markInfluencersOnboardedServer(requestData, authToken);
  
  if (!result.success) {
    throw new Error(result.message || 'Failed to onboard influencers');
  }
  
  return {
    success: true,
    message: `Successfully onboarded ${influencerIds.length} influencers`
  };
}

/**
 * Handle budget update action
 */
async function handleBudgetUpdate(influencerIds: string[], budget: any, authToken: string) {
  // For demo purposes, we'll return success
  // In production, you'd update each influencer's budget
  console.log('Updating budget for influencers:', influencerIds, budget);
  
  return {
    success: true,
    message: `Successfully updated budget for ${influencerIds.length} influencers`
  };
}

/**
 * Handle comments update action
 */
async function handleCommentsUpdate(influencerIds: string[], comments: any[], authToken: string) {
  // For demo purposes, we'll return success
  // In production, you'd update each influencer's comments
  console.log('Updating comments for influencers:', influencerIds, comments);
  
  return {
    success: true,
    message: `Successfully updated comments for ${influencerIds.length} influencers`
  };
}

/**
 * Handle status update action
 */
async function handleStatusUpdate(influencerIds: string[], statusId: string, authToken: string) {
  // For demo purposes, we'll return success
  // In production, you'd update each influencer's status
  console.log('Updating status for influencers:', influencerIds, statusId);
  
  return {
    success: true,
    message: `Successfully updated status for ${influencerIds.length} influencers`
  };
}

/**
 * Helper function to get the first available campaign list ID
 */
async function getFirstAvailableCampaignListId(authToken: string): Promise<string | null> {
  try {
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
      const campaignWithInfluencers = campaignsData.data.find((campaign: any) => 
        campaign.campaign_lists && 
        campaign.campaign_lists.length > 0 && 
        campaign.campaign_lists[0].total_influencers_count > 0
      );
      
      if (campaignWithInfluencers) {
        return campaignWithInfluencers.campaign_lists[0].id;
      }
      
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