// src/app/api/v0/influencer-contacts/social-account/[socialAccountId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getInfluencerContactsServer } from '@/services/influencer-contacts/influencer-contacts.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/influencer-contacts/social-account/[socialAccountId]
 * Get influencer contacts by social account ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { socialAccountId: string } }
) {
  try {
    const { socialAccountId } = params;
    
    console.log(`API Route: GET /api/v0/influencer-contacts/social-account/${socialAccountId} called`);
    
    if (!socialAccountId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Social account ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const contacts = await getInfluencerContactsServer(socialAccountId, authToken);
    
    console.log(`API Route: Successfully fetched ${contacts.length} influencer contacts`);
    return NextResponse.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch influencer contacts' 
      },
      { status: 500 }
    );
  }
}