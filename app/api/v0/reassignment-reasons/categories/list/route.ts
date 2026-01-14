// src/app/api/v0/reassignment-reasons/categories/list/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getReassignmentReasonCategoriesServer } from '@/services/reassignment-reasons/reassignment-reasons.server';

export async function GET(request: NextRequest) {
  try {
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const result = await getReassignmentReasonCategoriesServer(authToken);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error fetching reassignment reason categories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}