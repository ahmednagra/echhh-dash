// src/app/api/v0/billing/features/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getFeatureByIdServer,  updateFeatureServer,  deleteFeatureServer } from '@/services/billing/feature';
import { UpdateFeatureRequest } from '@/types/billing/features';

/**
 * Get a single feature by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const featureId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(featureId)) {
      return NextResponse.json(
        { error: 'Invalid feature ID format' },
        { status: 400 }
      );
    }

    // Call server service
    const result = await getFeatureByIdServer(featureId, authToken);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`API Route: Error in GET /api/v0/features/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch feature';
    
    // Handle 404 errors
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Update an existing feature
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const featureId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(featureId)) {
      return NextResponse.json(
        { error: 'Invalid feature ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const requestData: UpdateFeatureRequest = await request.json();

    // Validate at least one field is provided
    const hasUpdate = Object.keys(requestData).length > 0;
    if (!hasUpdate) {
      return NextResponse.json(
        { error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    // Validate individual fields if provided
    if (requestData.name !== undefined && !requestData.name.trim()) {
      return NextResponse.json(
        { error: 'Feature name cannot be empty' },
        { status: 400 }
      );
    }

    if (requestData.code !== undefined && !requestData.code.trim()) {
      return NextResponse.json(
        { error: 'Feature code cannot be empty' },
        { status: 400 }
      );
    }

    // Call server service
    const result = await updateFeatureServer(featureId, requestData, authToken);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`API Route: Error in PUT /api/v0/features/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update feature';
    
    // Handle specific error types
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }
    
    if (errorMessage.includes('already exists') || errorMessage.includes('409')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Delete a feature (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const featureId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(featureId)) {
      return NextResponse.json(
        { error: 'Invalid feature ID format' },
        { status: 400 }
      );
    }

    // Call server service
    const result = await deleteFeatureServer(featureId, authToken);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(`API Route: Error in DELETE /api/v0/features/${params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete feature';
    
    // Handle 404 errors
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}