// src/app/api/v0/billing/features/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getFeaturesServer, createFeatureServer} from '@/services/billing/feature';
import { CreateFeatureRequest, FeatureFilters } from '@/types/billing/features';

/**
 * Get paginated list of features with filters
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/v0/billing/features called');
    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const filters: FeatureFilters = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      page_size: searchParams.get('page_size') ? parseInt(searchParams.get('page_size')!) : 25,
      category: searchParams.get('category') as any,
      unit_type: searchParams.get('unit_type') as any,
      is_active: searchParams.get('is_active') === 'true' ? true : searchParams.get('is_active') === 'false' ? false : undefined,
      is_deleted: searchParams.get('is_deleted') === 'true',
      search: searchParams.get('search') || undefined,
      sort_by: (searchParams.get('sort_by') as any) || 'display_order',
      sort_order: (searchParams.get('sort_order') as any) || 'asc',
    };

    // Call server service
    const result = await getFeaturesServer(filters, authToken);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('API Route: Error in GET /api/v0/features:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch features';
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    );
  }
}

/**
 * Create a new feature
 */
export async function POST(request: NextRequest) {
  try {
    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const requestData: CreateFeatureRequest = await request.json();

    // Validate required fields
    if (!requestData.name || !requestData.name.trim()) {
      return NextResponse.json(
        { error: 'Feature name is required' },
        { status: 400 }
      );
    }

    if (!requestData.code || !requestData.code.trim()) {
      return NextResponse.json(
        { error: 'Feature code is required' },
        { status: 400 }
      );
    }

    if (!requestData.category) {
      return NextResponse.json(
        { error: 'Feature category is required' },
        { status: 400 }
      );
    }

    if (!requestData.unit_type) {
      return NextResponse.json(
        { error: 'Feature unit type is required' },
        { status: 400 }
      );
    }

    // Call server service
    const result = await createFeatureServer(requestData, authToken);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('API Route: Error in POST /api/v0/features:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create feature';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}