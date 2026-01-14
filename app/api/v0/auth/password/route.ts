// src/app/api/v0/auth/password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { changePasswordServer } from '@/services/users/users.server';
import { PasswordChangeRequest } from '@/types/users';

/**
 * PUT /api/v0/auth/password
 * Change current user password
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

    // Parse request body
    const passwordData: PasswordChangeRequest = await request.json();
    console.log('📝 API Route: Password change data received:', {
      hasCurrentPassword: !!passwordData.current_password,
      hasNewPassword: !!passwordData.new_password,
      hasConfirmPassword: !!passwordData.confirm_password,
    });

    // Basic validation
    if (!passwordData || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Current password, new password, and confirm password are required' 
        },
        { status: 400 }
      );
    }

    // Validate passwords match
    if (passwordData.new_password !== passwordData.confirm_password) {
      return NextResponse.json(
        { 
          success: false,
          error: 'New password and confirm password do not match' 
        },
        { status: 400 }
      );
    }

    // Validate new password strength (basic client-side validation)
    if (passwordData.new_password.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          error: 'New password must be at least 8 characters long' 
        },
        { status: 400 }
      );
    }
    
    // Call FastAPI backend through server-side service with auth token
    const response = await changePasswordServer(passwordData, authToken);
    
    console.log('✅ API Route: Successfully changed password');
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      // Handle specific error cases
      let statusCode = 500;
      let errorMessage = error.message;
      
      if (errorMessage.includes('Current password is incorrect')) {
        statusCode = 400;
        errorMessage = 'Current password is incorrect. Please try again.';
      } else if (errorMessage.includes('Password must')) {
        statusCode = 400;
        // Keep the validation error message as is
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('Invalid credentials')) {
        statusCode = 401;
        errorMessage = 'Authentication failed. Please log in again.';
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: errorMessage 
        },
        { status: statusCode }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to change password. Please try again.' 
      },
      { status: 500 }
    );
  }
}