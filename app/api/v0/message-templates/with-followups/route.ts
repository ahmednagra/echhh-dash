// src/app/api/v0/message-templates/with-followups/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { createMessageTemplateWithFollowupsServer } from '@/services/message-templates/message-templates.server';
import { CreateMessageTemplateWithFollowupsRequest } from '@/types/message-templates';

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

    const requestData: CreateMessageTemplateWithFollowupsRequest = {
      subject: body.subject,
      content: body.content,
      company_id: body.company_id,
      campaign_id: body.campaign_id,
      template_type: body.template_type || 'initial',
      is_global: body.is_global ?? true,
      generate_followups: body.generate_followups ?? true,
      ai_provider: body.ai_provider || 'openai',
      custom_instructions: body.custom_instructions
    };

    const template = await createMessageTemplateWithFollowupsServer(requestData, authToken);

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template with followups:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create template with followups' },
      { status: 500 }
    );
  }
}