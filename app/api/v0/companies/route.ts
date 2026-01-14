// src/app/api/v0/companies/route.ts
// Next.js API Route for companies (receives client requests, calls server service)

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import {
  getCompaniesServer,
  createCompanyServer
} from '@/services/companies/companies.server';
import { CreateCompanyRequest } from '@/types/company';

/**
 * GET /api/v0/companies
 * Retrieve all companies with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Extract and validate authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Get and validate query parameters
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Validate pagination parameters
    if (skip < 0) {
      return NextResponse.json(
        { error: 'Skip parameter must be non-negative' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Limit parameter must be between 1 and 1000' },
        { status: 400 }
      );
    }

    // Call server service to fetch companies from FastAPI
    const result = await getCompaniesServer(authToken, skip, limit);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Route Error:', errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v0/companies
 * Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    // Extract and validate authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const requestData: CreateCompanyRequest = await request.json();

    // Validate required fields
    if (!requestData.name || !requestData.domain) {
      return NextResponse.json(
        { error: 'Name and domain are required' },
        { status: 400 }
      );
    }

    // Validate company type
    if (requestData.type && !['b2b', 'b2c'].includes(requestData.type)) {
      return NextResponse.json(
        { error: 'Company type must be either b2b or b2c' },
        { status: 400 }
      );
    }

    // Call server service to create company in FastAPI
    const result = await createCompanyServer(requestData, authToken);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('API Route Error:', errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}