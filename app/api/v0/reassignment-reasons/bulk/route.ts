// src/app/api/v0/reassignment-reasons/bulk/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { bulkDeleteReassignmentReasonsServer } from '@/services/reassignment-reasons/reassignment-reasons.server';
import { ReassignmentReasonBulkDelete } from '@/types/reassignment-reasons';

export async function DELETE(request: NextRequest) {
  try {
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const requestData: ReassignmentReasonBulkDelete = await request.json();
    
    // Validation
    if (!requestData.reason_ids || requestData.reason_ids.length === 0) {
      return NextResponse.json(
        { error: 'reason_ids is required and must not be empty' },
        { status: 400 }
      );
    }
    
    const result = await bulkDeleteReassignmentReasonsServer(requestData, authToken);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error bulk deleting reassignment reasons:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}