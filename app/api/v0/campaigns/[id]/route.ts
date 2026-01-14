// src/app/api/v0/campaigns/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { 
  getCampaignByIdServer, 
  updateCampaignServer,
  deleteCampaignServer 
} from '@/services/campaign/campaign.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { 
  UpdateCampaignRequest,
  DeleteType 
} from '@/types/campaign';

/**
 * GET /api/v0/campaigns/[id]
 * Get a campaign by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      console.warn(`⚠️ API Route: Invalid UUID format for campaign ID: ${id}`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid campaign ID format' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('📞 API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const campaign = await getCampaignByIdServer(id, authToken);
    
    if (!campaign) {
      console.log(`⚠️ API Route: Campaign not found with ID ${id}`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign not found' 
        },
        { status: 404 }
      );
    }
    
    console.log('✅ API Route: Successfully fetched campaign');
    return NextResponse.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      // Handle not found errors
      if (error.message.includes('404') || error.message.includes('not found')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Campaign not found' 
          },
          { status: 404 }
        );
      }
      
      // Handle authentication errors
      if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 403 }
        );
      }
      
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
        error: 'Failed to fetch campaign' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v0/campaigns/[id]
 * Update a campaign
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log(`📍 API Route: PUT /api/v0/campaigns/${id} called`);
    
    // Parse request body
    const data: UpdateCampaignRequest = await request.json();
    console.log('📋 API Route: Update data:', data);
    
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      console.warn(`⚠️ API Route: Invalid UUID format for campaign ID: ${id}`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid campaign ID format' 
        },
        { status: 400 }
      );
    }
    
    // Basic validation - at least one field should be provided
    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'At least one field is required for update' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('📞 API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const campaign = await updateCampaignServer(id, data, authToken);
    
    console.log('✅ API Route: Successfully updated campaign');
    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      // Handle validation errors
      if (error.message.includes('validation') || error.message.includes('required')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 400 }
        );
      }
      
      // Handle not found errors
      if (error.message.includes('404') || error.message.includes('not found')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Campaign not found' 
          },
          { status: 404 }
        );
      }
      
      // Handle authentication errors
      if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 403 }
        );
      }
      
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
        error: 'Failed to update campaign' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v0/campaigns/[id]
 * Delete a campaign (supports soft, hard delete, and restore via query parameter)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Extract delete type from query parameters
    const { searchParams } = new URL(request.url);
    const deleteType = (searchParams.get('type') as DeleteType) || 'soft';
    
    console.log(`📍 API Route: DELETE /api/v0/campaigns/${id} called with type: ${deleteType}`);
    
    // Validate delete type
    if (!['soft', 'hard', 'restore'].includes(deleteType)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid delete type. Must be "soft", "hard", or "restore"' 
        },
        { status: 400 }
      );
    }
    
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(id)) {
      console.warn(`⚠️ API Route: Invalid UUID format for campaign ID: ${id}`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid campaign ID format' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('📞 API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const result = await deleteCampaignServer(id, deleteType, authToken);
    
    const actionMessages = {
      soft: 'Campaign moved to trash successfully',
      hard: 'Campaign permanently deleted successfully', 
      restore: 'Campaign restored successfully'
    };
    
    console.log(`✅ API Route: Successfully ${deleteType} deleted campaign`);
    return NextResponse.json({
      success: true,
      message: result.message || actionMessages[deleteType]
    });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      // Handle not found errors
      if (error.message.includes('404') || error.message.includes('not found')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Campaign not found' 
          },
          { status: 404 }
        );
      }
      
      // Handle authentication errors
      if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 403 }
        );
      }
      
      // Handle conflict errors (e.g., trying to restore a non-deleted campaign)
      if (error.message.includes('conflict') || error.message.includes('already')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 409 }
        );
      }
      
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
        error: 'Failed to delete campaign' 
      },
      { status: 500 }
    );
  }
}