// src/app/api/v0/influencer-contacts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createInfluencerContactServer } from '@/services/influencer-contacts/influencer-contacts.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { CreateInfluencerContactRequest } from '@/types/influencer-contacts';

/**
 * POST /api/v0/influencer-contacts
 * Create a new influencer contact
 */
export async function POST(request: NextRequest) {
  try {
    
    // Parse request body
    const contactData: CreateInfluencerContactRequest = await request.json();
    
    // Basic validation
    if (!contactData || !contactData.social_account_id || !contactData.contact_type || !contactData.contact_value) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: social_account_id, contact_type, and contact_value are required' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    // Call FastAPI backend through server-side service with auth token
    const createdContact = await createInfluencerContactServer(contactData, authToken);
    
    return NextResponse.json({
      success: true,
      data: createdContact
    }, { status: 201 });
  } catch (error) {
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create influencer contact' 
      },
      { status: 500 }
    );
  }
}