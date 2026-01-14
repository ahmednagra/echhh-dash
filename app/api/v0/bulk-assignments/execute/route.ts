// src/app/api/v0/bulk-assignments/execute/route.ts
// Next.js App Router API route for bulk assignments

import { NextRequest, NextResponse } from 'next/server';
import { executeBulkAssignmentsServer } from '@/services/bulk-assignments/bulk-assignments.server';
import { BulkAssignmentRequest } from '@/types/bulk-assignments';

/**
 * Helper function to extract Bearer token from request headers
 */
function extractBearerToken(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('No authorization header found');
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header format. Expected: Bearer <token>');
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!token) {
    throw new Error('No token found in authorization header');
  }
  
  return token;
}

/**
 * POST /api/v0/bulk-assignments/execute
 * Execute bulk assignments for campaign list
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📍 API Route: POST /api/v0/bulk-assignments/execute called');
    
    // Parse request body
    const assignmentData: BulkAssignmentRequest = await request.json();
    console.log('📋 API Route: Assignment data:', assignmentData);
    
    // Basic validation
    if (!assignmentData || !assignmentData.campaign_list_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'campaign_list_id is required' 
        },
        { status: 400 }
      );
    }
    
    if (!assignmentData.strategy) {
      return NextResponse.json(
        { 
          success: false,
          error: 'strategy is required' 
        },
        { status: 400 }
      );
    }
    
    if (!assignmentData.max_influencers_per_agent || assignmentData.max_influencers_per_agent <= 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'max_influencers_per_agent must be greater than 0' 
        },
        { status: 400 }
      );
    }
    
    // Validate strategy
    const validStrategies = ['round_robin', 'random', 'equal_distribution'];
    if (!validStrategies.includes(assignmentData.strategy)) {
      return NextResponse.json(
        { 
          success: false,
          error: `Invalid strategy. Must be one of: ${validStrategies.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    console.log('📞 API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const result = await executeBulkAssignmentsServer(assignmentData, authToken);
    
    console.log('✅ API Route: Bulk assignments executed successfully:', {
      totalInfluencers: result.total_influencers,
      totalAgents: result.total_agents,
      assignmentsCreated: result.assignments_created
    });
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('authorization') || error.message.includes('token')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Unauthorized: ' + error.message 
          },
          { status: 401 }
        );
      }
      
      if (error.message.includes('required') || error.message.includes('validation')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 400 }
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
        error: 'Failed to execute bulk assignments' 
      },
      { status: 500 }
    );
  }
}