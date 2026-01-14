// src/app/api/v1/ai-chat/conversations/[conversationId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { 
  getChatConversationServer,
  deleteChatConversationServer 
} from '@/services/chat/chat.server';

/**
 * GET /api/v0/ai-chat/conversations/[conversationId]
 * 
 * Get a specific conversation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    console.log('🔵 API Route: GET /ai-chat/conversations/:conversationId');

    // Extract authentication token
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.error('❌ API Route: No authentication token');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const { conversationId } = params;

    if (!conversationId) {
      console.error('❌ API Route: Conversation ID is required');
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    console.log(`📖 API Route: Fetching conversation ${conversationId} from AI service`);

    // Get conversation from AI service
    const result = await getChatConversationServer(conversationId, authToken);
    
    console.log('✅ API Route: Conversation fetched successfully');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 API Route: Error fetching conversation:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch conversation';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v0/ai-chat/conversations/[conversationId]
 * 
 * Delete a chat conversation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    console.log('🔵 API Route: DELETE /ai-chat/conversations/:conversationId');

    // Extract authentication token
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.error('❌ API Route: No authentication token');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const { conversationId } = params;

    if (!conversationId) {
      console.error('❌ API Route: Conversation ID is required');
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ API Route: Deleting conversation ${conversationId} from AI service`);

    // Delete conversation from AI service
    const result = await deleteChatConversationServer(conversationId, authToken);
    
    console.log('✅ API Route: Conversation deleted successfully');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 API Route: Error deleting conversation:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to delete conversation';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}