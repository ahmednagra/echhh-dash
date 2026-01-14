// src/app/api/v1/ai-chat/message/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { sendChatMessageServer } from '@/services/chat/chat.server';
import { SendMessageRequest } from '@/types/chat';

/**
 * POST /api/v0/ai-chat/message
 * 
 * Send a message to AI chat service
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔵 API Route: POST /ai-chat/message');

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
    const requestData: SendMessageRequest = await request.json();
    
    // Validate required fields
    if (!requestData.message || requestData.message.trim().length === 0) {
      console.error('❌ API Route: Message is required');
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    console.log('📤 API Route: Forwarding to AI service');

    // Call AI service via server service
    const result = await sendChatMessageServer(requestData, authToken);
    
    console.log('✅ API Route: Message sent successfully');
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 API Route: Error processing message:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to process message';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}