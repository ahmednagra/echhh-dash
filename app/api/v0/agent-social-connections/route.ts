// src/app/api/v0/agent-social-connections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  createSocialConnectionServer,
  getSocialConnectionsPaginatedServer
} from '@/services/agent-social-connections/agent-social-connections.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { AgentSocialConnectionCreate } from '@/services/agent-social-connections/agent-social-connections.client';

export async function POST(request: NextRequest) {
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
    const connectionData: AgentSocialConnectionCreate = await request.json();

    // Call server service
    const connection = await createSocialConnectionServer(connectionData, authToken);

    return NextResponse.json({ data: connection });
  } catch (error) {
    console.error('API Route Error (POST /agent-social-connections):', error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to create social connection' 
        } 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const userId = searchParams.get('user_id') || undefined;
    const platformId = searchParams.get('platform_id') || undefined;
    const activeOnly = searchParams.get('active_only') === 'true';
    const search = searchParams.get('search') || undefined;

    // Call server service
    const connections = await getSocialConnectionsPaginatedServer(
      page,
      pageSize,
      userId,
      platformId,
      activeOnly,
      search,
      authToken
    );

    return NextResponse.json({ data: connections });
  } catch (error) {
    console.error('API Route Error (GET /agent-social-connections):', error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to fetch social connections' 
        } 
      },
      { status: 500 }
    );
  }
}

// Additional routes for token management, automation, and health checks would follow the same pattern...