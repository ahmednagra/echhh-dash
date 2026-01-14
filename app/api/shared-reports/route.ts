// src/app/api/shared-reports/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Add campaign name storage to the shared reports
const sharedReports = new Map<string, {
  shareId: string;
  campaignId: string;
  campaignName: string;
  analyticsData: any;
  createdAt: string;
  expiresAt: string;
}>();

/**
 * POST /api/shared-reports
 * Create a shared analytics report with live data
 * Note: This creates a shareable link but data is fetched live from the campaign
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Shared Reports API: POST request received');
    
    const body = await request.json();
    const { shareId, campaignId, campaignName, analyticsData, createdAt, expiresAt } = body;
    
    console.log('📝 Creating shared report:', {
      shareId,
      campaignId,
      campaignName: campaignName?.substring(0, 50) + '...',
      hasAnalyticsData: !!analyticsData,
      totalPosts: analyticsData?.totalPosts || 0,
      totalInfluencers: analyticsData?.totalInfluencers || 0,
      createdAt,
      expiresAt
    });
    
    // Validate required fields
    if (!shareId || !campaignId || !campaignName) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: shareId, campaignId, or campaignName' 
        },
        { status: 400 }
      );
    }
    
    // Store the shared report data including campaign name
    sharedReports.set(campaignId, {
      shareId,
      campaignId,
      campaignName, // IMPORTANT: Store the actual campaign name
      analyticsData,
      createdAt,
      expiresAt
    });
    
    // Generate the public share URL - data will be fetched live by the page
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/campaign-analytics-report/${campaignId}`;
    
    console.log('🔗 Generated share URL (live data):', shareUrl);
    console.log('📊 Stored campaign name for public access:', campaignName);
    
    const responseData = {
      success: true,
      message: 'Shared report created successfully',
      data: {
        shareId,
        shareUrl,
        campaignId,
        campaignName,
        createdAt,
        expiresAt,
        isPublic: true,
        note: 'Report uses live data from campaign - same as View Analytics'
      }
    };
    
    console.log('✅ Shared report link created successfully (fetches live data)');
    
    return NextResponse.json(responseData, { status: 201 });
    
  } catch (error) {
    console.error('💥 Shared Reports API Error:', error);
    
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
        error: 'Failed to create shared report' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shared-reports?campaignId=xxx
 * Retrieve a shared analytics report by campaign ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaignId');
    
    if (!campaignId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign ID is required' 
        },
        { status: 400 }
      );
    }
    
    console.log('🔍 Retrieving shared report for campaign:', campaignId);
    
    // Retrieve the shared report from storage
    const sharedReport = sharedReports.get(campaignId);
    
    if (!sharedReport) {
      console.log('❌ Shared report not found for campaign:', campaignId);
      return NextResponse.json(
        { 
          success: false,
          error: 'Shared report not found or expired' 
        },
        { status: 404 }
      );
    }
    
    // Check if the report has expired
    const now = new Date();
    const expiresAt = new Date(sharedReport.expiresAt);
    
    if (now > expiresAt) {
      console.log('⏰ Shared report expired for campaign:', campaignId);
      sharedReports.delete(campaignId); // Clean up expired report
      return NextResponse.json(
        { 
          success: false,
          error: 'Shared report has expired' 
        },
        { status: 410 }
      );
    }
    
    console.log('✅ Retrieved shared report successfully:', {
      campaignId,
      campaignName: sharedReport.campaignName,
      totalPosts: sharedReport.analyticsData?.totalPosts || 0,
      totalInfluencers: sharedReport.analyticsData?.totalInfluencers || 0,
      createdAt: sharedReport.createdAt
    });
    
    return NextResponse.json({
      success: true,
      data: {
        campaignId: sharedReport.campaignId,
        campaignName: sharedReport.campaignName,
        analyticsData: sharedReport.analyticsData,
        createdAt: sharedReport.createdAt,
        expiresAt: sharedReport.expiresAt
      }
    });
    
  } catch (error) {
    console.error('💥 Shared Reports GET API Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve shared report' 
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}