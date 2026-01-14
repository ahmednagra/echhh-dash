// src/app/api/v0/shared-influencer-reports/[campaignId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This should match the storage from the main route
// In production, use Redis or database
const sharedReports = new Map<string, {
  shareId: string;
  campaignId: string;
  campaignName: string;
  influencersData: any[];
  searchTerm: string;
  createdAt: string;
  expiresAt: string;
}>();

/**
 * GET /api/v0/shared-influencer-reports/[campaignId]
 * Get shared influencer report data for public access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    
    console.log('🔍 Shared Influencer Reports API: GET request for campaign:', campaignId);
    
    if (!campaignId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Get the shared report data
    const reportData = sharedReports.get(campaignId);
    
    if (!reportData) {
      console.log('❌ Shared report not found for campaign:', campaignId);
      return NextResponse.json(
        { 
          success: false,
          error: 'Shared report not found or has expired' 
        },
        { status: 404 }
      );
    }
    
    // Check if the report has expired
    const now = new Date();
    const expiresAt = new Date(reportData.expiresAt);
    
    if (now > expiresAt) {
      console.log('❌ Shared report expired for campaign:', campaignId);
      // Clean up expired report
      sharedReports.delete(campaignId);
      return NextResponse.json(
        { 
          success: false,
          error: 'Shared report has expired' 
        },
        { status: 410 }
      );
    }
    
    console.log('✅ Shared report found and valid:', {
      campaignId,
      campaignName: reportData.campaignName,
      influencersCount: reportData.influencersData.length,
      searchTerm: reportData.searchTerm
    });
    
    return NextResponse.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('❌ Shared Influencer Reports API: Error fetching report:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch shared report' 
      },
      { status: 500 }
    );
  }
}