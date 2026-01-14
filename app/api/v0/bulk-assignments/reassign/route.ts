// src/app/api/v0/bulk-assignments/reassign/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { bulkReassignInfluencerServer } from '@/services/bulk-reassignments/bulk-reassignments.server';
import { BulkReassignmentRequest } from '@/types/bulk-reassignments';

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const requestData: BulkReassignmentRequest = await request.json();
    
    // Validation
    if (!requestData.assigned_influencer_id) {
      return NextResponse.json(
        { error: 'assigned_influencer_id is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.reassignment_reason_id) {
      return NextResponse.json(
        { error: 'reassignment_reason_id is required' },
        { status: 400 }
      );
    }
    
    const result = await bulkReassignInfluencerServer(requestData, authToken);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error in bulk reassignment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
