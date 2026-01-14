// src/app/api/v1/ai/conversations/[conversationId]/messages/route.ts

/**
 * Conversation Messages API Route
 * 
 * GET /api/v1/ai/conversations/:conversationId/messages - Get messages with cursor-based pagination
 * 
 * Query parameters:
 * - limit: Number of messages (default: 50)
 * - cursor: Message ID for pagination
 * - direction: 'before' (older) or 'after' (newer)
 * 
 * Usage:
 * - Initial load: GET .../messages?limit=50
 * - Load older (scroll up): GET .../messages?limit=50&cursor=oldest-msg-id&direction=before
 * - Load newer (check new): GET .../messages?limit=50&cursor=newest-msg-id&direction=after
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMessagesServer } from '@/services/ai/messages.server';
import { GetMessagesParams } from '@/types/ai';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteParams {
  params: Promise<{
    conversationId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { conversationId } = await params;

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

    // Validate conversation ID
    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          data: null,
          error: 'Conversation ID is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Parse query parameters for cursor-based pagination
    const { searchParams } = new URL(request.url);
    const params_: GetMessagesParams = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      cursor: searchParams.get('cursor') || undefined,
      direction: (searchParams.get('direction') as 'before' | 'after') || undefined,
    };

    console.log(`📬 API Route: Fetching messages for conversation ${conversationId}`);
    console.log('📬 API Route: Pagination params:', params_);

    // Call server service
    const response = await getMessagesServer(conversationId, params_, accessToken);

    const messageCount = response.data?.messages?.length || 0;
    const hasMore = response.data?.pagination?.has_more || false;
    
    console.log(`✅ API Route: Fetched ${messageCount} messages (has_more: ${hasMore})`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v1/ai/conversations/[id]/messages:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch messages',
        data: null,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}