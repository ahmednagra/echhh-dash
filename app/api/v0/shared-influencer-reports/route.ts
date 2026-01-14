// src/app/api/v0/shared-influencer-reports/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Type definition for shared report data
interface SharedReportData {
  shareId: string;
  campaignId: string;
  campaignName: string;
  influencersData: any[];
  searchTerm: string;
  createdAt: string;
  expiresAt: string;
  updatedAt?: string;
}

// IMPORTANT: Use the exact same storage mechanism across all routes
const getSharedReports = (): Map<string, SharedReportData> => {
  const globalAny = global as any;
  
  if (typeof globalAny.sharedReports === 'undefined') {
    console.log('🔧 Initializing shared reports storage');
    globalAny.sharedReports = new Map<string, SharedReportData>();
  }
  
  return globalAny.sharedReports;
};

/**
 * PUT /api/v0/shared-influencer-reports
 * Update an existing shared influencer report with fresh data
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 [PUT] Shared Influencer Reports API: PUT request received for update');
    
    const body = await request.json();
    const { campaignId, influencersData, searchTerm } = body;
    
    if (!campaignId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign ID is required for update' 
        },
        { status: 400 }
      );
    }
    
    // Get existing report
    const sharedReports = getSharedReports();
    console.log('📊 [PUT] Current shared reports count:', sharedReports.size);
    console.log('📊 [PUT] Available campaign IDs:', Array.from(sharedReports.keys()));
    
    const existingReport = sharedReports.get(campaignId);
    
    if (existingReport) {
      // Update with fresh data
      sharedReports.set(campaignId, {
        ...existingReport,
        influencersData: influencersData || existingReport.influencersData,
        searchTerm: searchTerm !== undefined ? searchTerm : existingReport.searchTerm,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ [PUT] Updated existing shared report:', campaignId);
      
      return NextResponse.json({
        success: true,
        message: 'Shared report updated successfully'
      });
    } else {
      console.log('❌ [PUT] Report not found for update:', campaignId);
      return NextResponse.json(
        { 
          success: false,
          error: 'Shared report not found',
          debug: {
            requestedCampaignId: campaignId,
            availableCampaigns: Array.from(sharedReports.keys())
          }
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('❌ [PUT] Shared Influencer Reports API: Error updating report:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update shared report' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v0/shared-influencer-reports
 * Create a shared influencer report for public access
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔗 [POST] Shared Influencer Reports API: POST request received');
    
    const body = await request.json();
    const { shareId, campaignId, campaignName, influencersData, searchTerm, createdAt, expiresAt } = body;
    
    console.log('📝 [POST] Creating shared influencer report:', {
      shareId,
      campaignId,
      campaignName: campaignName?.substring(0, 50) + '...',
      influencersCount: influencersData?.length || 0,
      searchTerm,
      createdAt,
      expiresAt
    });
    
    // Validate required fields
    if (!shareId || !campaignId || !campaignName || !influencersData) {
      console.error('❌ [POST] Missing required fields');
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: shareId, campaignId, campaignName, or influencersData' 
        },
        { status: 400 }
      );
    }
    
    // Store the shared report data
    const sharedReports = getSharedReports();
    console.log('📊 [POST] Current shared reports count before storing:', sharedReports.size);
    
    const reportData: SharedReportData = {
      shareId,
      campaignId,
      campaignName,
      influencersData,
      searchTerm: searchTerm || '',
      createdAt,
      expiresAt
    };
    
    sharedReports.set(campaignId, reportData);
    
    console.log('📊 [POST] Stored report for campaign:', campaignId);
    console.log('📊 [POST] Total shared reports after storing:', sharedReports.size);
    console.log('📊 [POST] Available campaign IDs:', Array.from(sharedReports.keys()));
    console.log('📊 [POST] Stored influencer count:', influencersData.length);
    
    // Verify the data was stored correctly
    const storedReport = sharedReports.get(campaignId);
    if (storedReport) {
      console.log('✅ [POST] Verification: Report successfully stored');
      console.log('✅ [POST] Stored report has influencers:', storedReport.influencersData?.length || 0);
    } else {
      console.error('❌ [POST] Verification failed: Report not found after storage');
    }
    
    // Generate the public share URL
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/ready-to-onboard/${campaignId}`;
    
    console.log('🔗 [POST] Generated share URL:', shareUrl);
    
    const responseData = {
      success: true,
      message: 'Shared influencer report created successfully',
      data: {
        shareId,
        shareUrl,
        campaignId,
        campaignName,
        influencersCount: influencersData.length,
        createdAt,
        expiresAt,
        isPublic: true
      }
    };
    
    console.log('✅ [POST] Shared influencer report created successfully');
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ [POST] Shared Influencer Reports API: Error creating report:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create shared report',
        debug: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v0/shared-influencer-reports
 * Get all shared reports (for debugging)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [GET] Shared Influencer Reports API: GET request received');
    
    const url = new URL(request.url);
    const campaignId = url.searchParams.get('campaignId');
    
    const sharedReports = getSharedReports();
    console.log('📊 [GET] Total shared reports:', sharedReports.size);
    console.log('📊 [GET] Available campaign IDs:', Array.from(sharedReports.keys()));
    
    if (campaignId) {
      console.log('🔍 [GET] Looking for specific campaign:', campaignId);
      
      const reportData = sharedReports.get(campaignId);
      
      if (!reportData) {
        console.log('❌ [GET] Report not found for campaign:', campaignId);
        return NextResponse.json(
          { 
            success: false,
            error: 'Shared report not found',
            debug: {
              requestedCampaignId: campaignId,
              availableCampaigns: Array.from(sharedReports.keys()),
              totalReports: sharedReports.size
            }
          },
          { status: 404 }
        );
      }
      
      // Check if expired
      const now = new Date();
      const expiresAt = new Date(reportData.expiresAt);
      
      if (now > expiresAt) {
        console.log('❌ [GET] Report expired for campaign:', campaignId);
        sharedReports.delete(campaignId);
        return NextResponse.json(
          { 
            success: false,
            error: 'Shared report has expired' 
          },
          { status: 410 }
        );
      }
      
      console.log('✅ [GET] Found report for campaign:', campaignId);
      return NextResponse.json({
        success: true,
        data: reportData
      });
    }
    
    // Return all active reports (for debugging)
    const allReports = Array.from(sharedReports.entries()).map(([id, report]) => ({
      campaignId: id,
      campaignName: report.campaignName,
      influencersCount: report.influencersData?.length || 0,
      createdAt: report.createdAt,
      expiresAt: report.expiresAt,
      updatedAt: report.updatedAt
    }));
    
    console.log('📊 [GET] Returning all reports:', allReports.length);
    
    return NextResponse.json({
      success: true,
      data: allReports,
      total: allReports.length,
      debug: {
        availableCampaigns: Array.from(sharedReports.keys())
      }
    });
  } catch (error) {
    console.error('❌ [GET] Shared Influencer Reports API: Error in GET:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch shared reports' 
      },
      { status: 500 }
    );
  }
}