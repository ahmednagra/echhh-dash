// src/app/api/v0/agent-social-connections/[connectionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  getSocialConnectionServer,
  updateSocialConnectionServer,
  deleteSocialConnectionServer
} from '@/services/agent-social-connections/agent-social-connections.server';
import { AgentSocialConnectionUpdate } from '@/services/agent-social-connections/agent-social-connections.client';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteParams {
  params: {
    connectionId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get auth token
    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Call server service
    const connection = await getSocialConnectionServer(params.connectionId, authToken);

    return NextResponse.json({ data: connection });
  } catch (error) {
    console.error(`API Route Error (GET /agent-social-connections/${params.connectionId}):`, error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to fetch social connection' 
        } 
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Get auth token
    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse request body
    const updateData: AgentSocialConnectionUpdate = await request.json();

    // Call server service
    const connection = await updateSocialConnectionServer(params.connectionId, updateData, authToken);

    return NextResponse.json({ data: connection });
  } catch (error) {
    console.error(`API Route Error (PUT /agent-social-connections/${params.connectionId}):`, error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to update social connection' 
        } 
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Get auth token
    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Call server service
    const result = await deleteSocialConnectionServer(params.connectionId, authToken);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error(`API Route Error (DELETE /agent-social-connections/${params.connectionId}):`, error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to delete social connection' 
        } 
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    );
  }
}