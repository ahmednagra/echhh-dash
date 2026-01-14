// src/app/api/v0/campaign-influencers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { 
  updateCampaignInfluencerServer, 
  getCampaignInfluencerServer 
} from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { UpdateCampaignInfluencerRequest } from '@/types/campaign-influencers';

/**
 * Helper function to parse JSON safely
 */
function parseJSONSafely(jsonString: any, defaultValue: any = null) {
  if (!jsonString) return defaultValue;
  if (typeof jsonString === 'object') return jsonString;
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

/**
 * Enhanced function to reconstruct complete influencer data from stored additional_metrics
 */
function enhanceInfluencerData(memberData: any) {
  if (!memberData?.social_account?.additional_metrics) {
    return memberData;
  }

  const metrics = memberData.social_account.additional_metrics;
  
  // Parse JSON fields back to objects
  const enhancedMetrics = {
    ...metrics,
    // Parse location data
    creator_location: parseJSONSafely(metrics.creator_location, {
      city: metrics.creator_city || 'Unknown',
      state: metrics.creator_state || null,
      country: metrics.creator_country || 'Unknown'
    }),
    
    // Parse contact details
    contact_details: parseJSONSafely(metrics.contact_details, []),
    
    // Parse filter match data
    filter_match: parseJSONSafely(metrics.filter_match, {
      creator_gender: metrics.creator_gender_filter || 'UNKNOWN',
      creator_locations: parseJSONSafely(metrics.creator_locations_filter, []),
      brand_sponsors: null,
      creator_age: null,
      creator_brand_affinities: null,
      follower_growth: null,
      subscriber_growth: null,
      creator_interests: null,
      creator_language: null,
      creator_lookalikes: null,
      content_count: null,
      instagram_options: null,
      audience_age: null,
      audience_gender: null,
      audience_brand_affinities: null,
      audience_interests: null,
      audience_language: null,
      audience_locations: null,
      audience_lookalikes: null,
      topic_relevance: null,
      views_growth: null,
      audience_ethnicity: null,
      audience_credibility_score: null,
      share_count: null,
      save_count: null
    }),
    
    // Parse work platform data
    work_platform: parseJSONSafely(metrics.work_platform, {
      id: metrics.platform_id || 'unknown',
      name: metrics.platform_name || 'Unknown Platform',
      logo_url: metrics.platform_logo || ''
    }),
    
    // Parse livestream metrics
    livestream_metrics: parseJSONSafely(metrics.livestream_metrics, null),
    
    // Ensure numeric values are properly typed
    engagement_rate: typeof metrics.engagement_rate === 'number' ? metrics.engagement_rate : parseFloat(metrics.engagement_rate) || 0,
    average_likes: typeof metrics.average_likes === 'number' ? metrics.average_likes : parseInt(metrics.average_likes) || 0,
    average_views: typeof metrics.average_views === 'number' ? metrics.average_views : (metrics.average_views ? parseInt(metrics.average_views) : null),
    content_count: typeof metrics.content_count === 'number' ? metrics.content_count : (metrics.content_count ? parseInt(metrics.content_count) : null),
    subscriber_count: typeof metrics.subscriber_count === 'number' ? metrics.subscriber_count : (metrics.subscriber_count ? parseInt(metrics.subscriber_count) : null),
  };

  // Return enhanced member data
  return {
    ...memberData,
    social_account: {
      ...memberData.social_account,
      additional_metrics: enhancedMetrics
    }
  };
}

/**
 * GET /api/v0/campaign-list-members/[id]
 * Get campaign list member by ID with enhanced data parsing
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`API Route: GET /api/v0/campaign-influencers/${id} called`);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Member ID parameter is required' },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const memberData = await getCampaignInfluencerServer(id, authToken);
    
    // Enhance the data with parsed JSON fields
    const enhancedMemberData = enhanceInfluencerData(memberData);
    
    console.log(`API Route: Successfully fetched and enhanced campaign list member ${id}`);
    console.log('Enhanced metrics keys:', Object.keys(enhancedMemberData?.social_account?.additional_metrics || {}));
    
    return NextResponse.json(enhancedMemberData);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch campaign list member' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v0/campaign-influencers/[id]
 * Update campaign influencer
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`API Route: PATCH /api/v0/campaign-influencers/${id} called`);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Member ID parameter is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const updateData: UpdateCampaignInfluencerRequest = await request.json();
    console.log('API Route: Update data:', updateData);
    
    // Basic validation
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Update data is required' },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const updatedMember = await updateCampaignInfluencerServer(id, updateData, authToken);
    
    // Enhance the updated data with parsed JSON fields
    const enhancedUpdatedMember = enhanceInfluencerData(updatedMember);
    
    console.log(`API Route: Successfully updated campaign list member ${id}`);
    return NextResponse.json({
      success: true,
      data: enhancedUpdatedMember
    });
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update campaign list member' 
      },
      { status: 500 }
    );
  }
}