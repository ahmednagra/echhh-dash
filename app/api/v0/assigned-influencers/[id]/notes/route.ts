// src/app/api/v0/assigned-influencers/[id]/notes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { updateAssignedInfluencerNotesServer } from '@/services/assigned-influencers/assigned-influencers.server';
import { UpdateAssignedInfluencerNotesRequest } from '@/types/assigned-influencers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Assigned influencer ID is required' },
        { status: 400 }
      );
    }
    
    // Extract token from standard Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const requestData: UpdateAssignedInfluencerNotesRequest = await request.json();
    
    if (typeof requestData.notes !== 'string') {
      return NextResponse.json(
        { error: 'Notes must be a string' },
        { status: 400 }
      );
    }
    
    const result = await updateAssignedInfluencerNotesServer(
      id,
      requestData,
      authToken
    );
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}