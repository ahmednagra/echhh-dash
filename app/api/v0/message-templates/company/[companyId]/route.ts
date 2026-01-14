// src/app/api/v0/message-templates/company/[companyId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getMessageTemplatesByCompanyServer } from '@/services/message-templates/message-templates.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/message-templates/company/[companyId]
 * Get all message templates for a specific company
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const { companyId } = params;
    
    console.log(`API Route: Fetching templates for company ${companyId}`);
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const templates = await getMessageTemplatesByCompanyServer(companyId, authToken);
    
    console.log(`API Route: Successfully fetched ${templates.length} templates`);
    return NextResponse.json(templates);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch message templates' },
      { status: 500 }
    );
  }
}