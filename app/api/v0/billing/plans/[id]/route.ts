// src/app/api/v0/billing/plans/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchPlanByIdFromServer, 
  updatePlanOnServer, 
  deletePlanOnServer 
} from '@/services/billing/plans';

/**
 * GET /api/v0/billing/plans/[id]
 * Fetch a single plan by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log(`📋 API Route: GET /api/v0/billing/plans/${id} called`);

    // Extract auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ API Route: Missing authorization header');
      return NextResponse.json(
        { success: false, error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Call FastAPI backend through server service
    console.log('📞 API Route: Calling FastAPI backend...');
    const response = await fetchPlanByIdFromServer(token, id);

    console.log('✅ API Route: Successfully fetched plan:', response.data?.name);

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('💥 API Route: Error in GET /api/v0/billing/plans/[id]:', error);
    
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Failed to fetch plan';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * PUT /api/v0/billing/plans/[id]
 * Update an existing plan
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log(`📝 API Route: PUT /api/v0/billing/plans/${id} called`);

    // Extract auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ API Route: Missing authorization header');
      return NextResponse.json(
        { success: false, error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Parse request body
    const body = await request.json();
    console.log('📋 API Route: Request body received');

    // Call FastAPI backend through server service
    console.log('📞 API Route: Calling FastAPI backend to update plan...');
    const response = await updatePlanOnServer(token, id, body);

    console.log('✅ API Route: Successfully updated plan:', response.data?.name);

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('💥 API Route: Error in PUT /api/v0/billing/plans/[id]:', error);
    
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Failed to update plan';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/v0/billing/plans/[id]
 * Delete a plan (soft delete by default)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log(`🗑️ API Route: DELETE /api/v0/billing/plans/${id} called`);

    // Extract auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ API Route: Missing authorization header');
      return NextResponse.json(
        { success: false, error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Check for hard_delete query parameter
    const searchParams = request.nextUrl.searchParams;
    const hardDelete = searchParams.get('hard_delete') === 'true';

    console.log(`📞 API Route: Calling FastAPI backend to delete plan (hard: ${hardDelete})...`);

    // Call FastAPI backend through server service
    const response = await deletePlanOnServer(token, id, hardDelete);

    console.log('✅ API Route: Successfully deleted plan');

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('💥 API Route: Error in DELETE /api/v0/billing/plans/[id]:', error);
    
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Failed to delete plan';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}