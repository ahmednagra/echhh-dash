// src/app/api/v0/profile-analytics/company/[companyId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getCompanyAnalyticsServer } from '@/services/company-analytics/company-analytics.server';
import { CompanyAnalyticsResponse, CompanyAnalyticsData } from '@/types/company-analytics';

interface RouteParams {
  params: {
    companyId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    console.log('🚀 ===== API ROUTE STARTED =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('📋 Company ID:', params.companyId);
    console.log('🌐 Request URL:', request.url);
    console.log('📨 Request method:', request.method);
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('🔐 Auth token extracted:', authToken ? '✅ YES' : '❌ NO');
    console.log('🔐 Auth token length:', authToken ? authToken.length : 0);
    
    if (!authToken) {
      console.error('❌ ERROR: No auth token provided');
      const response: CompanyAnalyticsResponse = {
        success: false,
        error: 'Authentication token is required',
        data: {
          influencers: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
      console.log('📤 Returning 401 response');
      return NextResponse.json(response, { status: 401 });
    }
    
    if (!params.companyId) {
      console.error('❌ ERROR: No company ID provided');
      const response: CompanyAnalyticsResponse = {
        success: false,
        error: 'Company ID is required',
        data: {
          influencers: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0
        }
      };
      console.log('📤 Returning 400 response');
      return NextResponse.json(response, { status: 400 });
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sort_by') as any;
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';
    
    console.log('📋 Parsed query params:', { 
      page, 
      limit, 
      search: search || 'none', 
      sortBy: sortBy || 'none', 
      sortOrder 
    });
    
    // Call server service
    console.log('📞 About to call getCompanyAnalyticsServer...');
    console.log('📞 Calling with params:', {
      companyId: params.companyId,
      filters: { page, limit, search, sortBy, sortOrder },
      hasAuthToken: !!authToken
    });
    
    const backendData = await getCompanyAnalyticsServer(
      params.companyId,
      {
        page,
        limit,
        search,
        sortBy,
        sortOrder
      },
      authToken
    );
    
    console.log('✅ Server service completed successfully!');
    console.log('📊 Backend data summary:', {
      influencersCount: backendData.influencers?.length || 0,
      total: backendData.total,
      page: backendData.page,
      limit: backendData.limit,
      totalPages: backendData.total_pages
    });
    
    // Log first influencer for debugging
    if (backendData.influencers && backendData.influencers.length > 0) {
      console.log('👤 First influencer sample:', {
        id: backendData.influencers[0].id,
        name: backendData.influencers[0].name,
        username: backendData.influencers[0].username,
        followers: backendData.influencers[0].followers,
        verified: backendData.influencers[0].verified
      });
    }
    
    // Transform backend response to frontend format
    const responseData: CompanyAnalyticsData = {
      influencers: backendData.influencers,
      total: backendData.total,
      page: backendData.page,
      limit: backendData.limit,
      totalPages: backendData.total_pages,
    };
    
    const response: CompanyAnalyticsResponse = {
      success: true,
      data: responseData
    };
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('🎉 SUCCESS! Preparing response...');
    console.log('📊 Final response summary:', {
      success: response.success,
      influencersCount: responseData.influencers.length,
      total: responseData.total,
      page: responseData.page,
      totalPages: responseData.totalPages,
      duration: `${duration}ms`
    });
    
    console.log('📤 Sending 200 response with data');
    console.log('🚀 ===== API ROUTE COMPLETED =====\n');
    
    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('💥 ===== API ROUTE ERROR =====');
    console.error('💥 Error occurred after:', `${duration}ms`);
    console.error('💥 Error details:', error);
    console.error('💥 Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('💥 Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // More detailed error handling
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error types
      if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
        statusCode = 401;
        console.error('💥 Authentication error detected');
      } else if (error.message.includes('Not found') || error.message.includes('404')) {
        statusCode = 404;
        console.error('💥 Not found error detected');
      } else if (error.message.includes('Bad request') || error.message.includes('400')) {
        statusCode = 400;
        console.error('💥 Bad request error detected');
      }
    }
    
    const response: CompanyAnalyticsResponse = {
      success: false,
      error: errorMessage,
      data: {
        influencers: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    };
    
    console.error('📤 Returning error response:', {
      success: false,
      error: errorMessage,
      statusCode: statusCode,
      duration: `${duration}ms`
    });
    console.error('💥 ===== API ROUTE ERROR END =====\n');
    
    return NextResponse.json(response, { status: statusCode });
  }
}