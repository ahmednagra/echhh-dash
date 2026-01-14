// src/app/api/v0/users/influencers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getUsersByTypeServer } from '@/services/users/users.server';

/**
 * GET /api/v0/users/influencers - Get all influencer users
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    
    // Get auth token from request
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No auth token found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🔑 API Route: Auth token found, proceeding with request');

    // Call server service to get influencer users from FastAPI
    // const users = await getUsersByTypeServer('influencer', authToken);

    // console.log(`✅ API Route: Successfully retrieved ${users.length} influencer users`);
    const users = { success: true, users: [] }; // Placeholder until service is implemented
    return NextResponse.json(users);

  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/users/influencers:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to get influencer users';
    const statusCode = errorMessage.includes('Forbidden') || errorMessage.includes('permission') ? 403 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}