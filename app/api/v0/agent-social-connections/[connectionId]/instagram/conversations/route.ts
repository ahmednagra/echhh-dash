// src/app/api/v0/agent-social-connections/[connectionId]/instagram/conversations/route.ts
/**
 * Instagram Conversation Threads API Route
 * 
 * GET /api/v0/agent-social-connections/{connectionId}/instagram/conversations
 * Fetches conversation threads for a connected Instagram account
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { fetchConversationThreadsServer } from '@/services/agent-social-connections/messaging.server';
import { MessagingPlatform } from '@/types/messaging';

export async function GET(
  request: NextRequest,
  { params }: { params: { connectionId: string } }
) {
  try {
    // Extract and validate authentication token
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication token is required',
            retryable: false,
            timestamp: new Date().toISOString(),
          }
        },
        { status: 401 }
      );
    }

    // Extract connection ID from URL params
    const { connectionId } = params;
    
    if (!connectionId) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_CONNECTION_ID',
            message: 'Connection ID is required',
            retryable: false,
            timestamp: new Date().toISOString(),
          }
        },
        { status: 400 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '25', 10);

    // Validate limit parameter
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_LIMIT',
            message: 'Limit must be between 1 and 100',
            retryable: false,
            timestamp: new Date().toISOString(),
          }
        },
        { status: 400 }
      );
    }

    console.log(`[API] Fetching Instagram conversation threads for connection: ${connectionId}`);

    // Fetch conversation threads from backend (Instagram platform)
    const conversationThreadsResponse = await fetchConversationThreadsServer(
      connectionId,
      MessagingPlatform.INSTAGRAM,
      limit,
      authToken
    );

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: conversationThreadsResponse,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API] Error in GET /instagram/conversations:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while fetching conversation threads';
    
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: errorMessage,
          retryable: true,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 500 }
    );
  }
}