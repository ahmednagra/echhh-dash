// src/app/api/v0/reassignment-reasons/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { 
  getReassignmentReasonsServer, 
  createReassignmentReasonServer 
} from '@/services/reassignment-reasons/reassignment-reasons.server';
import { ReassignmentReasonCreate, ReassignmentReasonFilters } from '@/types/reassignment-reasons';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    
    const filters: ReassignmentReasonFilters = {
      user_type: searchParams.get('user_type') || undefined,
      user_category: searchParams.get('user_category') || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
      is_system_triggered: searchParams.get('is_system_triggered') ? searchParams.get('is_system_triggered') === 'true' : undefined,
      is_user_triggered: searchParams.get('is_user_triggered') ? searchParams.get('is_user_triggered') === 'true' : undefined,
      is_agent_triggered: searchParams.get('is_agent_triggered') ? searchParams.get('is_agent_triggered') === 'true' : undefined,
      is_admin_triggered: searchParams.get('is_admin_triggered') ? searchParams.get('is_admin_triggered') === 'true' : undefined,
      is_support_triggered: searchParams.get('is_support_triggered') ? searchParams.get('is_support_triggered') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
    };
    
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '50');
    const sortBy = searchParams.get('sort_by') || 'display_order';
    const sortOrder = (searchParams.get('sort_order') || 'asc') as 'asc' | 'desc';
    
    const result = await getReassignmentReasonsServer(
      filters, page, size, sortBy, sortOrder, authToken
    );
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error fetching reassignment reasons:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

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
    
    const requestData: ReassignmentReasonCreate = await request.json();
    
    // Validation
    if (!requestData.code) {
      return NextResponse.json(
        { error: 'code is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }
    
    const result = await createReassignmentReasonServer(requestData, authToken);
    
    return NextResponse.json(result, { status: 201 });
    
  } catch (error) {
    console.error('API Route: Error creating reassignment reason:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}