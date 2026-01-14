// src/app/api/v0/external-api-endpoints/[[...path]]/route.ts

/**
 * External API Endpoints - Catch-All Route Handler
 *
 * Single file handles all 11 backend routes:
 *   POST   /                                    - Create endpoint
 *   GET    /                                    - Get paginated list
 *   GET    /{endpoint_id}                       - Get by ID
 *   PUT    /{endpoint_id}                       - Update
 *   DELETE /{endpoint_id}                       - Delete
 *   GET    /active/list                         - Get active endpoints
 *   GET    /code/{endpoint_code}                - Get by code
 *   GET    /provider/{provider_id}/endpoints    - Get by provider
 *   GET    /data-type/{data_type}/endpoints     - Get by data type
 *   PATCH  /{endpoint_id}/toggle-status         - Toggle status
 *   GET    /stats/overview                      - Get stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import {
  createExternalApiEndpointServer,
  getExternalApiEndpointServer,
  getExternalApiEndpointsServer,
  updateExternalApiEndpointServer,
  deleteExternalApiEndpointServer,
  getActiveExternalApiEndpointsServer,
  getExternalApiEndpointByCodeServer,
  getExternalApiEndpointsByProviderServer,
  getExternalApiEndpointsByDataTypeServer,
  toggleExternalApiEndpointStatusServer,
  getExternalApiEndpointStatsServer,
} from '@/services/external-api-endpoints/external-api-endpoints.server';
import type {
  ExternalApiEndpointCreate,
  ExternalApiEndpointUpdate,
  ExternalApiEndpointListParams,
} from '@/types/external-api-endpoints';

// =============================================================================
// TYPES
// =============================================================================

interface RouteContext {
  params: Promise<{ path?: string[] }>;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

function createResponse(data: unknown, status: number): NextResponse {
  return NextResponse.json(data, { status });
}

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

function handleError(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  const isNotFound = message.includes('404') || message.toLowerCase().includes('not found');
  return createErrorResponse(
    isNotFound ? 'External API endpoint not found' : message,
    isNotFound ? 404 : 500
  );
}

function parseListParams(searchParams: URLSearchParams): ExternalApiEndpointListParams {
  const page = searchParams.get('page');
  const size = searchParams.get('size');
  const isActive = searchParams.get('is_active');
  const includeDeleted = searchParams.get('include_deleted');
  const sortOrder = searchParams.get('sort_order');

  return {
    page: page ? parseInt(page, 10) : undefined,
    size: size ? parseInt(size, 10) : undefined,
    provider_id: searchParams.get('provider_id') ?? undefined,
    data_type: searchParams.get('data_type') ?? undefined,
    is_active: isActive ? isActive === 'true' : undefined,
    include_deleted: includeDeleted ? includeDeleted === 'true' : undefined,
    search: searchParams.get('search') ?? undefined,
    sort_by: searchParams.get('sort_by') ?? undefined,
    sort_order: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
  };
}

// =============================================================================
// GET HANDLER
// =============================================================================

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return createErrorResponse('Authentication token is required', 401);
    }

    const { path } = await context.params;
    const segments = path ?? [];

    // GET / - List endpoints
    if (segments.length === 0) {
      const { searchParams } = new URL(request.url);
      const params = parseListParams(searchParams);
      const result = await getExternalApiEndpointsServer(params, authToken);
      return createResponse(result, 200);
    }

    // GET /active/list - Active endpoints
    if (segments.length === 2 && segments[0] === 'active' && segments[1] === 'list') {
      const result = await getActiveExternalApiEndpointsServer(authToken);
      return createResponse(result, 200);
    }

    // GET /stats/overview - Statistics
    if (segments.length === 2 && segments[0] === 'stats' && segments[1] === 'overview') {
      const result = await getExternalApiEndpointStatsServer(authToken);
      return createResponse(result, 200);
    }

    // GET /code/{endpoint_code} - Get by code
    if (segments.length === 2 && segments[0] === 'code') {
      const endpointCode = segments[1];
      if (!endpointCode) {
        return createErrorResponse('Endpoint code is required', 400);
      }
      const result = await getExternalApiEndpointByCodeServer(endpointCode, authToken);
      return createResponse(result, 200);
    }

    // GET /provider/{provider_id}/endpoints - Get by provider
    if (segments.length === 3 && segments[0] === 'provider' && segments[2] === 'endpoints') {
      const providerId = segments[1];
      if (!providerId || !isUUID(providerId)) {
        return createErrorResponse('Valid provider ID is required', 400);
      }
      const result = await getExternalApiEndpointsByProviderServer(providerId, authToken);
      return createResponse(result, 200);
    }

    // GET /data-type/{data_type}/endpoints - Get by data type
    if (segments.length === 3 && segments[0] === 'data-type' && segments[2] === 'endpoints') {
      const dataType = segments[1];
      if (!dataType) {
        return createErrorResponse('Data type is required', 400);
      }
      const result = await getExternalApiEndpointsByDataTypeServer(dataType, authToken);
      return createResponse(result, 200);
    }

    // GET /{endpoint_id} - Get by ID
    if (segments.length === 1 && isUUID(segments[0])) {
      const endpointId = segments[0];
      const result = await getExternalApiEndpointServer(endpointId, authToken);
      return createResponse(result, 200);
    }

    return createErrorResponse('Route not found', 404);
  } catch (error) {
    console.error('API Route GET Error:', error);
    return handleError(error);
  }
}

// =============================================================================
// POST HANDLER
// =============================================================================

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return createErrorResponse('Authentication token is required', 401);
    }

    const { path } = await context.params;
    const segments = path ?? [];

    // POST / - Create endpoint
    if (segments.length === 0) {
      const data: ExternalApiEndpointCreate = await request.json();

      if (!data.provider_id) {
        return createErrorResponse('provider_id is required', 400);
      }
      if (!data.name) {
        return createErrorResponse('name is required', 400);
      }
      if (!data.code) {
        return createErrorResponse('code is required', 400);
      }
      if (!data.data_type) {
        return createErrorResponse('data_type is required', 400);
      }
      if (!data.endpoint_path) {
        return createErrorResponse('endpoint_path is required', 400);
      }
      if (!data.http_method) {
        return createErrorResponse('http_method is required', 400);
      }

      const result = await createExternalApiEndpointServer(data, authToken);
      return createResponse(result, 201);
    }

    return createErrorResponse('Route not found', 404);
  } catch (error) {
    console.error('API Route POST Error:', error);
    return handleError(error);
  }
}

// =============================================================================
// PUT HANDLER
// =============================================================================

export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return createErrorResponse('Authentication token is required', 401);
    }

    const { path } = await context.params;
    const segments = path ?? [];

    // PUT /{endpoint_id} - Update endpoint
    if (segments.length === 1 && isUUID(segments[0])) {
      const endpointId = segments[0];
      const data: ExternalApiEndpointUpdate = await request.json();

      if (Object.keys(data).length === 0) {
        return createErrorResponse('At least one field is required for update', 400);
      }

      const result = await updateExternalApiEndpointServer(endpointId, data, authToken);
      return createResponse(result, 200);
    }

    return createErrorResponse('Route not found', 404);
  } catch (error) {
    console.error('API Route PUT Error:', error);
    return handleError(error);
  }
}

// =============================================================================
// PATCH HANDLER
// =============================================================================

export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return createErrorResponse('Authentication token is required', 401);
    }

    const { path } = await context.params;
    const segments = path ?? [];

    // PATCH /{endpoint_id}/toggle-status - Toggle status
    if (segments.length === 2 && isUUID(segments[0]) && segments[1] === 'toggle-status') {
      const endpointId = segments[0];
      const result = await toggleExternalApiEndpointStatusServer(endpointId, authToken);
      return createResponse(result, 200);
    }

    return createErrorResponse('Route not found', 404);
  } catch (error) {
    console.error('API Route PATCH Error:', error);
    return handleError(error);
  }
}

// =============================================================================
// DELETE HANDLER
// =============================================================================

export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return createErrorResponse('Authentication token is required', 401);
    }

    const { path } = await context.params;
    const segments = path ?? [];

    // DELETE /{endpoint_id} - Delete endpoint
    if (segments.length === 1 && isUUID(segments[0])) {
      const endpointId = segments[0];
      const result = await deleteExternalApiEndpointServer(endpointId, authToken);
      return createResponse(result, 200);
    }

    return createErrorResponse('Route not found', 404);
  } catch (error) {
    console.error('API Route DELETE Error:', error);
    return handleError(error);
  }
}