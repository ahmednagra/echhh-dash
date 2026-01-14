// src/app/api/v0/reassignment-reasons/bulk/update/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { bulkUpdateReassignmentReasonsServer } from '@/services/reassignment-reasons/reassignment-reasons.server';
import { ReassignmentReasonBulkUpdate } from '@/types/reassignment-reasons';

export async function PATCH(request: NextRequest) {
  try {
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const requestData: ReassignmentReasonBulkUpdate = await request.json();
    
    // Validation
    if (!requestData.reason_ids || requestData.reason_ids.length === 0) {
      return NextResponse.json(
        { error: 'reason_ids is required and must not be empty' },
        { status: 400 }
      );
    }
    
    if (!requestData.update_data) {
      return NextResponse.json(
        { error: 'update_data is required' },
        { status: 400 }
      );
    }
    
    const result = await bulkUpdateReassignmentReasonsServer(requestData, authToken);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error bulk updating reassignment reasons:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}