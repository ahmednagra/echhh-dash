// src/app/api/v0/list-assignments/[assignmentId]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { updateAssignmentStatus } from '@/services/list-assignments/list-assignment.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * PATCH /api/v0/list-assignments/[assignmentId]/status
 * Update assignment status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = params;
    const body = await request.json();
    
    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    if (!body.status_id) {
      return NextResponse.json(
        { error: 'Missing required field: status_id' },
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

    console.log(`API Route: Updating assignment ${assignmentId} status to: ${body.status_id}`);

    // Call FastAPI backend through server-side service with auth token
    const assignment = await updateAssignmentStatus(assignmentId, {
      status_id: body.status_id
    }, authToken);

    console.log('✅ Assignment status updated successfully');
    return NextResponse.json(assignment);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update assignment status' },
      { status: 500 }
    );
  }
}