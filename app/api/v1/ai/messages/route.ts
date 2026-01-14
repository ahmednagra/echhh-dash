// src/app/api/v1/ai/messages/route.ts

/**
 * AI Messages API Route - V9 Industry Standard
 * 
 * UPDATED: V9 - Passes `stream` parameter to backend.
 * 
 * POST /api/v1/ai/messages - Send a message to AI
 * 
 * V9 Changes:
 * - Reads `stream` from request body (not headers)
 * - Passes `stream` param to backend
 * - Backend returns JSON or SSE based on `stream` value
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendMessageServer, sendMessageStreamServer } from '@/services/ai/messages.server';
import { SendMessageRequest } from '@/types/ai';
import { extractBearerToken } from '@/lib/auth-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body: SendMessageRequest & { stream?: boolean } = await request.json();

    // Validate required fields
    if (!body.message || body.message.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          data: null,
          error: 'Message content is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // =========================================================================
    // V9: Check `stream` parameter in request body
    // =========================================================================
    const wantsStreaming = body.stream === true;

    console.log('🚀 API Route: Sending message to AI service');
    console.log('🚀 API Route: Conversation ID:', body.conversation_id || 'NEW');
    console.log('🚀 API Route: Streaming:', wantsStreaming ? 'YES (stream=true)' : 'NO (stream=false)');
    console.log('🚀 API Route: Context:', body.context);

    // =========================================================================
    // STREAMING MODE (stream=true)
    // =========================================================================
    if (wantsStreaming) {
      console.log('🌊 API Route: Using streaming mode');
      
      try {
        // Get streaming response from Backend (which forwards to AI Service)
        const streamResponse = await sendMessageStreamServer(body, accessToken);
        
        // Check if response is SSE
        const contentType = streamResponse.headers.get('content-type');
        
        if (contentType?.includes('text/event-stream')) {
          console.log('🌊 API Route: Forwarding SSE stream to client');
          
          // Forward the streaming response directly
          return new Response(streamResponse.body, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Connection': 'keep-alive',
              'X-Accel-Buffering': 'no',
            },
          });
        } else {
          // Backend returned non-streaming response, forward as JSON
          console.log('📦 API Route: Backend returned non-streaming response');
          const jsonData = await streamResponse.json();
          return NextResponse.json(jsonData);
        }
        
      } catch (streamError) {
        console.error('❌ API Route: Streaming error:', streamError);
        
        // Fall back to non-streaming mode
        console.log('📦 API Route: Falling back to non-streaming mode');
        const response = await sendMessageServer(body, accessToken);
        return NextResponse.json(response);
      }
    }

    // =========================================================================
    // NON-STREAMING MODE (stream=false, default)
    // =========================================================================
    console.log('📦 API Route: Using non-streaming mode');
    
    const response = await sendMessageServer(body, accessToken);

    console.log('✅ API Route: Message sent successfully');
    console.log('✅ API Route: Response conversation_id:', response.data?.conversation_id);
    console.log('✅ API Route: Response message_id:', response.data?.message_id);

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('💥 API Route: Error in POST /api/v1/ai/messages:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send message',
        data: null,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}