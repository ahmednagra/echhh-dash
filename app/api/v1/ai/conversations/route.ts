// src/app/api/v1/ai/conversations/route.ts

/**
 * AI Conversations API Route
 * 
 * GET /api/v1/ai/conversations - Get conversations list
 * POST /api/v1/ai/conversations - Create new conversation
 * 
 * Supports query parameters:
 * - campaign_id: Filter by campaign
 * - limit: Number of results (default: 20)
 * - offset: Pagination offset (default: 0)
 * - is_active: Filter by active status
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getConversationsServer,
  createConversationServer,
} from '@/services/ai/conversations.server';
import { GetConversationsParams, CreateConversationRequest } from '@/types/ai';
import { extractBearerToken } from '@/lib/auth-utils';
// =============================================================================
// GET - List Conversations
// =============================================================================

export async function GET(request: NextRequest) {
  try {

    // Get auth token from request headers
    const accessToken = extractBearerToken(request);
    
    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          data: null,
          error: 'No access token found',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params: GetConversationsParams = {
      campaign_id: searchParams.get('campaign_id') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      is_active: searchParams.get('is_active') === 'true' ? true : 
                 searchParams.get('is_active') === 'false' ? false : undefined,
    };

    console.log('📋 API Route: Fetching conversations', params);

    // Call server service
    const response = await getConversationsServer(params, accessToken);

    console.log(`✅ API Route: Fetched ${response.data?.conversations?.length || 0} conversations`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v1/ai/conversations:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch conversations',
        data: null,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST - Create Conversation
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const accessToken = extractBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          data: null,
          error: 'No access token found',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreateConversationRequest = await request.json();

    console.log('📝 API Route: Creating conversation', body);

    // Call server service
    const response = await createConversationServer(body, accessToken);

    console.log('✅ API Route: Conversation created:', response.data?.id);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('💥 API Route: Error in POST /api/v1/ai/conversations:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create conversation',
        data: null,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}