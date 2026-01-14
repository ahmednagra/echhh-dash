// src/app/api/v0/reassignment-reasons/[reasonId]/toggle-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { toggleReassignmentReasonStatusServer } from '@/services/reassignment-reasons/reassignment-reasons.server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { reasonId: string } }
) {
  try {
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const result = await toggleReassignmentReasonStatusServer(params.reasonId, authToken);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error toggling reassignment reason status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}