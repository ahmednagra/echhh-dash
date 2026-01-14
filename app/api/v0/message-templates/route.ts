// src/app/api/v0/message-templates/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { createMessageTemplateServer } from '@/services/message-templates/message-templates.server';
import { CreateMessageTemplateRequest } from '@/types/message-templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.subject || !body.content || !body.company_id || !body.campaign_id) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, content, company_id, and campaign_id are required' },
        { status: 400 }
      );
    }

    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    const requestData: CreateMessageTemplateRequest = {
      subject: body.subject,
      content: body.content,
      company_id: body.company_id,
      campaign_id: body.campaign_id,
      template_type: body.template_type || 'initial',
      is_global: body.is_global ?? true
    };

    const template = await createMessageTemplateServer(requestData, authToken);

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating message template:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create message template' },
      { status: 500 }
    );
  }
}