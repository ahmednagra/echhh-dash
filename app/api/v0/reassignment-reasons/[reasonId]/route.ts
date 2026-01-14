// src/app/api/v0/reassignment-reasons/[reasonId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { 
  getReassignmentReasonByIdServer,
  updateReassignmentReasonServer,
  deleteReassignmentReasonServer
} from '@/services/reassignment-reasons/reassignment-reasons.server';
import { ReassignmentReasonUpdate } from '@/types/reassignment-reasons';

export async function GET(
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
    
    const result = await getReassignmentReasonByIdServer(params.reasonId, authToken);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error fetching reassignment reason:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    
    const requestData: ReassignmentReasonUpdate = await request.json();
    
    const result = await updateReassignmentReasonServer(
      params.reasonId, 
      requestData, 
      authToken
    );
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error updating reassignment reason:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    const result = await deleteReassignmentReasonServer(params.reasonId, authToken);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error deleting reassignment reason:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}