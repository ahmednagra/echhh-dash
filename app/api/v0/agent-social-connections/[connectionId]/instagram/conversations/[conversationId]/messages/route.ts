// src/app/api/v0/agent-social-connections/[connectionId]/instagram/conversations/[conversationId]/messages/route.ts
/**
 * Instagram Conversation Messages API Route
 * 
 * GET /api/v0/agent-social-connections/{connectionId}/instagram/conversations/{conversationId}/messages
 * Fetches messages for a specific Instagram conversation
 * 
 * This route follows the backend FastAPI endpoint structure exactly
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { fetchMessagesServer } from '@/services/agent-social-connections/messaging.server';
import { MessagingPlatform } from '@/types/messaging';

export async function GET(
  request: NextRequest,
  { params }: { params: { connectionId: string; conversationId: string } }
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

    // Extract and validate parameters
    const { connectionId, conversationId } = params;
    
    if (!connectionId || !conversationId) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Connection ID and Conversation ID are required',
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

    console.log(`[API] Fetching Instagram messages for conversation: ${conversationId}`);

    // Fetch messages from backend via server service (Instagram platform)
    const messagesResponse = await fetchMessagesServer(
      connectionId,
      MessagingPlatform.INSTAGRAM,
      conversationId,
      limit,
      authToken
    );

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: messagesResponse,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API] Error in GET /instagram/conversations/messages:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while fetching conversation messages';
    
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