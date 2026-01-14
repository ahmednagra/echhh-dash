// src/app/api/v0/influencers/by-username/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteParams {
  params: Promise<{
    username: string;
  }>;
}

// GET /api/v0/influencers/by-username/[username] - Get influencer by username
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;
    console.log(`📋 GET /api/v0/influencers/by-username/${username}`);

    // Get auth token using the utility function
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Clean username (decode URL encoding if needed)
    const cleanUsername = decodeURIComponent(username).replace(/^@/, '');

    // For now, return a mock influencer since we don't have backend connection
    // In real implementation, this would call your backend API
    const mockInfluencer = {
      id: `inf_existing_${cleanUsername}`,
      username: cleanUsername,
      name: cleanUsername,
      email: null,
      phone: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Retrieved influencer by username successfully:', cleanUsername);
    return NextResponse.json(mockInfluencer);

  } catch (error) {
    console.error(`💥 Error in GET /api/v0/influencers/by-username:`, error);
    return NextResponse.json(
      { error: 'Influencer not found' },
      { status: 404 }
    );
  }
}