// src/app/api/v0/message-templates/[templateId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getMessageTemplateByIdServer } from '@/services/message-templates/message-templates.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/message-templates/[templateId]
 * Get a specific message template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params;
    
    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
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

    // Call FastAPI backend through server-side service with auth token
    const template = await getMessageTemplateByIdServer(templateId, authToken);
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching message template:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch message template' },
      { status: 500 }
    );
  }
}