// src/app/api/v0/auth/complete-company-registration/route.ts - ENHANCED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { serverApiClient } from '@/lib/server-api';

/**
 * POST /api/v0/auth/complete-company-registration
 * Complete company registration for OAuth users
 */
export async function POST(request: NextRequest) {
  try {
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    // Get request body
    const companyData = await request.json();
    console.log('📝 API Route: Company data received:', {
      hasCompanyName: !!companyData.company_name,
      hasCompanyDomain: !!companyData.company_domain,
      companyName: companyData.company_name,
      companyDomain: companyData.company_domain
    });

    // Validate required fields
    if (!companyData.company_name?.trim() || !companyData.company_domain?.trim()) {
      console.log('❌ API Route: Missing required fields');
      return NextResponse.json(
        {
          success: false,
          error: 'Company name and domain are required'
        },
        { status: 400 }
      );
    }
    
    // Call FastAPI backend through server-side service with auth token
    const response = await serverApiClient.post<any>(
      '/auth/complete-company-registration',
      companyData,
      { auth: true },
      authToken
    );

    console.log('📦 API Route: FastAPI response status:', response.status);
    console.log('📦 API Route: FastAPI response data:', response.data ? 'Data received' : 'No data');
    console.log('📦 API Route: FastAPI response error:', response.error?.message || 'No error');

    if (response.error) {
      console.error('❌ API Route: FastAPI Error:', response.error.message);
      
      // Handle specific error cases
      let statusCode = response.status || 500;
      let errorMessage = response.error.message;
      
      // Map backend errors to frontend-friendly messages
      if (errorMessage.includes('already registered as a company user')) {
        errorMessage = 'Company registration is already complete. Please contact support if you need to update your company information.';
        statusCode = 400;
      } else if (errorMessage.includes('Company name is required')) {
        errorMessage = 'Please provide a valid company name.';
        statusCode = 400;
      } else if (errorMessage.includes('Company domain is required')) {
        errorMessage = 'Please provide a valid company domain.';
        statusCode = 400;
      }
      
      return NextResponse.json(
        {
          success: false,
          error: errorMessage
        },
        { status: statusCode }
      );
    }

    if (!response.data) {
      console.warn('⚠️ API Route: No response data received from FastAPI');
      return NextResponse.json(
        {
          success: false,
          error: 'No response data received from server'
        },
        { status: 500 }
      );
    }

    console.log('✅ API Route: Successfully completed company registration');
    
    // Ensure the response includes all necessary data
    const responseData = {
      success: true,
      data: {
        message: response.data.message || 'Company registration completed successfully',
        user: response.data.user,
        company: response.data.company
      }
    };
    
    console.log('📤 API Route: Sending response:', {
      success: responseData.success,
      hasUser: !!responseData.data.user,
      hasCompany: !!responseData.data.company,
      message: responseData.data.message
    });
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
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
        error: 'An unexpected error occurred while completing registration' 
      },
      { status: 500 }
    );
  }
}