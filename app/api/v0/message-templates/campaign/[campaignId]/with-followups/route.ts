// src/app/api/v0/message-templates/campaign/[campaignId]/with-followups/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getMessageTemplatesByCampaignWithFollowupsServer } from '@/services/message-templates/message-templates.server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
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

    const templates = await getMessageTemplatesByCampaignWithFollowupsServer(campaignId, authToken);
    
    return NextResponse.json(templates);
  } catch (error) {
    console.error('API Route Error fetching templates with followups:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch campaign templates with followups' },
      { status: 500 }
    );
  }
}