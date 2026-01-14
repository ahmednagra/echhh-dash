// src/app/api/v0/statuses/model/[model]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getStatusesServer } from '@/services/statuses/statuses.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/statuses/model/[model]
 * Get statuses by model type
 * 
 * @param model - The model name (e.g., 'campaign_influencer', 'list_member')
 * @query column - Optional column filter (e.g., 'status_id', 'client_review_status_id', 'shortlisted_status_id')
 * 
 * Examples:
 * - GET /api/v0/statuses/model/campaign_influencer?column=status_id
 * - GET /api/v0/statuses/model/campaign_influencer?column=client_review_status_id
 * - GET /api/v0/statuses/model/campaign_influencer?column=shortlisted_status_id
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ model: string }> }
) {
  try {
    const { model } = await context.params;
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model parameter is required' },
        { status: 400 }
      );
    }

    // Extract column query parameter (optional filter for applies_to_field)
    const { searchParams } = new URL(request.url);
    const column = searchParams.get('column') || undefined;
    
    console.log(`API Route: Fetching statuses for model="${model}"${column ? `, column="${column}"` : ''}`);
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    // if (!authToken) {
    //   console.log('API Route: No Bearer token provided');
    //   return NextResponse.json(
    //     { error: 'Bearer token is required' },
    //     { status: 401 }
    //   );
    // }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token and column filter
    const statusesData = await getStatusesServer(model, authToken || '', column);
    
    console.log(`API Route: Successfully fetched ${statusesData.length} statuses`);
    return NextResponse.json(statusesData);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch statuses' },
      { status: 500 }
    );
  }
}