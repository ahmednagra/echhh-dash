// src/app/api/v0/list-assignments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createListAssignment } from '@/services/list-assignments/list-assignment.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * POST /api/v0/list-assignments
 * Create a new list assignment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.list_id) {
      return NextResponse.json(
        { error: 'Missing required field: list_id' },
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

    console.log(`API Route: Creating list assignment for list: ${body.list_id}`);

    // Call FastAPI backend through server-side service with auth token
    const assignment = await createListAssignment({
      list_id: body.list_id
    }, authToken);

    console.log('✅ List assignment created successfully');
    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create list assignment' },
      { status: 500 }
    );
  }
}