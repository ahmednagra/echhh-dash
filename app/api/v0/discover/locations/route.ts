// src/app/api/v0/discover/locations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { locationService } from '@/services/insights-iq';
import { LocationSearchParams } from '@/services/insights-iq/types';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search_string = searchParams.get('search_string') || searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Validate required parameters
    if (!search_string || search_string.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            code: 'invalid_search_string',
            message: 'Search string is required and must be at least 2 characters long',
            status_code: 400
          }
        },
        { status: 400 }
      );
    }

    // Prepare search parameters
    const searchParameters: LocationSearchParams = {
      search_string: search_string.trim(),
      limit: Math.min(Math.max(limit, 1), 100), // Ensure limit is between 1-100
      offset: Math.max(offset, 0) // Ensure offset is not negative
    };

    // Call the location service
    const result = await locationService.searchLocations(searchParameters);

    if (!result.success) {
      // Handle service errors
      const statusCode = result.error?.status_code || 500;
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: statusCode }
      );
    }

    // Transform the response to match what the frontend expects
    const locations = result.data?.data || [];
    const metadata = result.data?.metadata || { offset: 0, limit: 0 };

    // Return successful response with transformed data
    return NextResponse.json({
      success: true,
      data: locations, // Return locations array directly
      meta: {
        search_string,
        limit: metadata.limit,
        offset: metadata.offset,
        count: locations.length,
        total: metadata.total
      }
    });

  } catch (error) {
    console.error('Error in locations API route:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'INTERNAL_ERROR',
          code: 'api_route_error',
          message: 'Internal server error occurred while searching locations',
          status_code: 500
        }
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: {
        type: 'METHOD_NOT_ALLOWED',
        code: 'method_not_allowed',
        message: 'POST method is not allowed for this endpoint',
        status_code: 405
      }
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        type: 'METHOD_NOT_ALLOWED',
        code: 'method_not_allowed',
        message: 'PUT method is not allowed for this endpoint',
        status_code: 405
      }
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: {
        type: 'METHOD_NOT_ALLOWED',
        code: 'method_not_allowed',
        message: 'DELETE method is not allowed for this endpoint',
        status_code: 405
      }
    },
    { status: 405 }
  );
}