// src/app/api/v0/assigned-influencers/[id]/record-contact/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { recordContactAttemptServer } from '@/services/assignments/assignments.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteParams {
  params: {
    id: string;
  };
}
 
/**
 * POST /api/v0/assigned-influencers/[id]/record-contact
 * Record a contact attempt for a campaign influencer
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // Validate influencer ID
    if (!id) {
      return NextResponse.json(
        { error: 'Assigned Influencer ID is required' },
        { status: 400 }
      );
    }

    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    // Call FastAPI backend through server-side service with auth token
    const result = await recordContactAttemptServer(id, authToken);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error recording contact attempt:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to record contact attempt' },
      { status: 500 }
    );
  }
}