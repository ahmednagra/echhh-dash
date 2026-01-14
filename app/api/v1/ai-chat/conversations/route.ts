// src/app/api/v1/ai-chat/conversations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { 
  getChatConversationsServer, 
  createChatConversationServer 
} from '@/services/chat/chat.server';
import { CreateConversationRequest } from '@/types/chat';

/**
 * GET /api/v0/ai-chat/conversations
 * 
 * Get user's chat conversations
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔵 API Route: GET /ai-chat/conversations');

    // Extract authentication token
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.error('❌ API Route: No authentication token');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    console.log('📋 API Route: Fetching conversations from AI service');

    // Get conversations from AI service
    const result = await getChatConversationsServer(authToken);
    
    console.log('✅ API Route: Conversations fetched successfully');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 API Route: Error fetching conversations:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch conversations';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v0/ai-chat/conversations
 * 
 * Create a new chat conversation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔵 API Route: POST /ai-chat/conversations');

    // Extract authentication token
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.error('❌ API Route: No authentication token');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const requestData: CreateConversationRequest = await request.json();
    
    console.log('📝 API Route: Creating conversation in AI service');

    // Create conversation in AI service
    const result = await createChatConversationServer(requestData, authToken);
    
    console.log('✅ API Route: Conversation created successfully');
    return NextResponse.json(result, { status: 201 });
    
  } catch (error) {
    console.error('💥 API Route: Error creating conversation:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to create conversation';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}