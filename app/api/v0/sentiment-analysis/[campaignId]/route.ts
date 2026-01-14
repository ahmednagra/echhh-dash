// src/app/api/v0/sentiment-analysis/[campaignId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import {
  getCampaignSentimentAnalyticsServer,
  generateCampaignSentimentAnalysisServer,
} from '@/services/sentiment-analysis/sentiment-analysis.server';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

/**
 * GET /api/v0/sentiment-analysis/[campaignid]
 * Retrieves sentiment analytics for a specific campaign
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ campaignId: string }> }
) {
  try {

    // Validate authentication
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.warn('⚠️ API Route: Missing authentication token');
      return NextResponse.json(
        { success: false, error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const campaignId = params.campaignId;
    
    // Validate campaign ID presence
    if (!campaignId || campaignId.trim() === '') {
      console.warn('⚠️ API Route: Missing or empty campaign ID');
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    console.log(`📊 API Route: Fetching analytics for campaign ${campaignId}`);

    // Call server service - throws on error
    const result = await getCampaignSentimentAnalyticsServer(campaignId, authToken);
    
    console.log('✅ API Route: Analytics retrieved successfully');
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('❌ API Route: Error in GET sentiment analytics:', error);

    // Handle specific error types
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while fetching sentiment analytics';
    
    // Determine appropriate status code based on error
    const statusCode = error instanceof Error && error.message.includes('not found')
      ? 404
      : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * POST /api/v0/sentiment-analysis/[campaignId]
 * Triggers sentiment analysis generation for a campaign
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ campaignId: string }> }
) {
  try {
    console.log('🔷 API Route: POST sentiment generation request received');

    // Validate authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.warn('⚠️ API Route: Missing authentication token');
      return NextResponse.json(
        { success: false, error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const campaignId = params.campaignId;
    
    // Validate campaign ID presence
    if (!campaignId || campaignId.trim() === '') {
      console.warn('⚠️ API Route: Missing or empty campaign ID');
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(campaignId)) {
      console.warn('⚠️ API Route: Invalid campaign ID format:', campaignId);
      return NextResponse.json(
        { success: false, error: 'Invalid campaign ID format' },
        { status: 400 }
      );
    }

    console.log(`⚙️ API Route: Generating sentiment analysis for campaign ${campaignId}`);

    // Call server service - throws on error
    const response = await generateCampaignSentimentAnalysisServer(campaignId, authToken);

    console.log('✅ API Route: Sentiment generation initiated successfully');

    // Return 202 Accepted for async job processing
    const httpStatus = response.status === 'failed' ? 500 : 202;
    return NextResponse.json(response, { status: httpStatus });

  } catch (error) {
    console.error('❌ API Route: Error in POST sentiment generation:', error);

    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred while generating sentiment analysis';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}