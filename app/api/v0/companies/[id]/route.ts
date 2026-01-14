// src/app/api/v0/companies/[id]/route.ts
// Next.js Dynamic API Route for single company operations

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import {
  getCompanyByIdServer,
  updateCompanyServer,
  deleteCompanyServer
} from '@/services/companies/companies.server';
import { UpdateCompanyRequest } from '@/types/company';

/**
 * GET /api/v0/companies/[id]
 * Retrieve a single company by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate company ID
    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Extract and validate authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Call server service to fetch company from FastAPI
    const result = await getCompanyByIdServer(id, authToken);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Route Error:', errorMessage);
    
    // Handle not found errors
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Company not found' },
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
 * PUT /api/v0/companies/[id]
 * Update an existing company
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate company ID
    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Extract and validate authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const requestData: UpdateCompanyRequest = await request.json();

    // Validate at least one field is provided
    if (!requestData.name && !requestData.domain && !requestData.type) {
      return NextResponse.json(
        { error: 'At least one field (name, domain, or type) must be provided' },
        { status: 400 }
      );
    }

    // Validate company type if provided
    if (requestData.type && !['b2b', 'b2c'].includes(requestData.type)) {
      return NextResponse.json(
        { error: 'Company type must be either b2b or b2c' },
        { status: 400 }
      );
    }

    // Call server service to update company in FastAPI
    const result = await updateCompanyServer(id, requestData, authToken);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Route Error:', errorMessage);
    
    // Handle not found errors
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Company not found' },
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
 * DELETE /api/v0/companies/[id]
 * Delete a company
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate company ID
    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Extract and validate authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Call server service to delete company from FastAPI
    const result = await deleteCompanyServer(id, authToken);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Route Error:', errorMessage);
    
    // Handle not found errors
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}