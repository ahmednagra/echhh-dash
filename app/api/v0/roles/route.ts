// src/app/api/v0/roles/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v0/roles?user_type=b2c|b2b|influencer
 * Get available roles for a specific user type
 * 
 * Note: Roles are currently defined in the frontend.
 * In the future, this could call a FastAPI backend endpoint.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔑 API Route: GET /api/v0/roles called');

    // Get user_type query parameter
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('user_type');

    // Validate user_type parameter
    if (!userType) {
      console.error('❌ API Route: Missing user_type parameter');
      return NextResponse.json(
        {
          success: false,
          error: 'user_type query parameter is required',
          data: []
        },
        { status: 400 }
      );
    }

    // Validate user_type value
    if (!['b2c', 'b2b', 'influencer', 'platform'].includes(userType)) {
      console.error('❌ API Route: Invalid user_type:', userType);
      return NextResponse.json(
        {
          success: false,
          error: 'user_type must be one of: b2c, b2b, influencer, platform',
          data: []
        },
        { status: 400 }
      );
    }

    console.log('📋 API Route: Fetching roles for user_type:', userType);

    // Define roles based on user type
    // TODO: In the future, fetch these from FastAPI backend
    const rolesMap: Record<string, Array<{ value: string; label: string }>> = {
      b2c: [
        { value: 'b2c_company_owner', label: 'Company Owner' },
        { value: 'b2c_company_admin', label: 'Company Admin' },
        { value: 'b2c_marketing_director', label: 'Marketing Director' },
        { value: 'b2c_campaign_manager', label: 'Campaign Manager' },
        { value: 'b2c_campaign_executive', label: 'Campaign Executive' },
        { value: 'b2c_social_media_manager', label: 'Social Media Manager' },
        { value: 'b2c_content_creator', label: 'Content Creator' },
        { value: 'b2c_brand_manager', label: 'Brand Manager' },
        { value: 'b2c_performance_analyst', label: 'Performance Analyst' },
        { value: 'b2c_finance_manager', label: 'Finance Manager' },
        { value: 'b2c_account_coordinator', label: 'Account Coordinator' },
        { value: 'b2c_viewer', label: 'Viewer' },
      ],
      b2b: [
        // B2B roles (if different from B2C)
        { value: 'b2b_company_owner', label: 'Company Owner' },
        { value: 'b2b_company_admin', label: 'Company Admin' },
        { value: 'b2b_account_manager', label: 'Account Manager' },
        { value: 'b2b_sales_director', label: 'Sales Director' },
        { value: 'b2b_business_analyst', label: 'Business Analyst' },
        { value: 'b2b_viewer', label: 'Viewer' },
      ],
      influencer: [
        { value: 'influencer', label: 'Influencer' },
        { value: 'influencer_manager', label: 'Influencer Manager' },
      ],
      platform: [
        { value: 'platform_super_admin', label: 'Super Admin' },
        { value: 'platform_admin', label: 'Admin' },
        { value: 'platform_manager', label: 'Manager' },
        { value: 'platform_developer', label: 'Developer' },
        { value: 'platform_customer_support', label: 'Customer Support' },
        { value: 'platform_account_manager', label: 'Account Manager' },
        { value: 'platform_financial_manager', label: 'Financial Manager' },
        { value: 'platform_content_moderator', label: 'Content Moderator' },
        { value: 'platform_data_analyst', label: 'Data Analyst' },
        { value: 'platform_operations_manager', label: 'Operations Manager' },
        { value: 'platform_agent', label: 'Agent' },
      ],
    };

    const roles = rolesMap[userType] || [];

    console.log(`✅ API Route: Successfully retrieved ${roles.length} roles for ${userType}`);

    return NextResponse.json(
      {
        success: true,
        data: roles,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/roles:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch roles';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        data: []
      },
      { status: 500 }
    );
  }
}