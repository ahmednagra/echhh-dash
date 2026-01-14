// src/app/api/v0/reassignment-reasons/search/by-code/[code]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getReassignmentReasonByCodeServer } from '@/services/reassignment-reasons/reassignment-reasons.server';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const result = await getReassignmentReasonByCodeServer(params.code, authToken);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error fetching reassignment reason by code:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}