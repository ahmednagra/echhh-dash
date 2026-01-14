// src/app/api/v1/ai/conversations/[conversationId]/route.ts

/**
 * Single AI Conversation API Route
 * 
 * GET /api/v1/ai/conversations/:conversationId - Get single conversation
 * DELETE /api/v1/ai/conversations/:conversationId - Delete conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getConversationServer,
  deleteConversationServer,
} from '@/services/ai/conversations.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteParams {
  params: Promise<{
    conversationId: string;
  }>;
}

// =============================================================================
// GET - Get Single Conversation
// =============================================================================

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

    console.log(`📖 API Route: Fetching conversation ${conversationId}`);

    // Call server service
    const response = await getConversationServer(conversationId, accessToken);

    console.log('✅ API Route: Conversation fetched successfully');

    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v1/ai/conversations/[id]:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch conversation',
        data: null,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE - Delete Conversation
// =============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { conversationId } = await params;

    // Get auth token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

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

    console.log(`🗑️ API Route: Deleting conversation ${conversationId}`);

    // Call server service
    const response = await deleteConversationServer(conversationId, accessToken);

    console.log('✅ API Route: Conversation deleted successfully');

    return NextResponse.json(response);
  } catch (error) {
    console.error('💥 API Route: Error in DELETE /api/v1/ai/conversations/[id]:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete conversation',
        data: null,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}