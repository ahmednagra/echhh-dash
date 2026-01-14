// src/app/api/v0/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getCurrentUserServer, updateCurrentUserServer } from '@/services/users/users.server';
import { UpdateUserRequest } from '@/types/users';

/**
 * GET /api/v0/auth/me
 * Get current user profile
 */
export async function GET(request: NextRequest) {
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
    
    // Call FastAPI backend through server-side service with auth token
    const user = await getCurrentUserServer(authToken);
    
    console.log('✅ API Route: Successfully fetched current user');
    return NextResponse.json({
      success: true,
      data: user
    });
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
        error: 'Failed to fetch current user' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v0/auth/me
 * Update current user profile
 */
export async function PUT(request: NextRequest) {
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

    // Always process as FormData for consistency
    console.log('📁 API Route: Processing FormData request');
    
    const formData = await request.formData();
    
    // Extract form fields - INCLUDE ALL NAME FIELDS
    const updateData: UpdateUserRequest = {
      first_name: formData.get('first_name') as string || undefined,
      last_name: formData.get('last_name') as string || undefined,
      full_name: formData.get('full_name') as string || undefined,
      phone_number: formData.get('phone_number') as string || undefined,
      language: formData.get('language') as string || undefined,
    };

    // Handle profile image file if present
    const profileImageFile = formData.get('profile_image') as File;
    if (profileImageFile && profileImageFile.size > 0) {
      console.log('🖼️ API Route: Profile image file detected:', {
        name: profileImageFile.name,
        size: profileImageFile.size,
        type: profileImageFile.type
      });
      
      // Convert file to base64 to pass through your existing flow
      const bytes = await profileImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      updateData.profile_image_url = `data:${profileImageFile.type};base64,${base64}`;
    }

    console.log('📝 API Route: Update data processed:', {
      hasFirstName: !!updateData.first_name,
      hasLastName: !!updateData.last_name,
      hasFullName: !!updateData.full_name,
      hasPhoneNumber: !!updateData.phone_number,
      hasProfileImage: !!updateData.profile_image_url,
      fields: Object.keys(updateData)
    });

    // Basic validation
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Update data is required' 
        },
        { status: 400 }
      );
    }
    
    // Call FastAPI backend through server-side service with auth token
    // USING YOUR UPDATED CONSISTENT FLOW
    const updatedUser = await updateCurrentUserServer(updateData, authToken);
    
    console.log('✅ API Route: Successfully updated current user profile');
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    });
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
        error: 'Failed to update profile' 
      },
      { status: 500 }
    );
  }
}