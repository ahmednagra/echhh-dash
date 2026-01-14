// src/app/api/v0/instagram/post-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { contentProviderManager } from '@/services/providers/content-manager.server';
import {
  ContentPlatform,
  detectPlatformFromUrl,
  isValidPlatformUrl,
} from '@/constants/social-platforms';

// =============================================================================
// POST HANDLER - Supports Instagram, TikTok, YouTube
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route: Starting post details fetch');

    const body = await request.json();
    const { url, code, platform: requestedPlatform, preferredProvider } = body;

    // Validate input
    if (!url && !code) {
      console.log('❌ API Route: Missing required input');
      return NextResponse.json(
        { success: false, message: 'Either URL or post code must be provided' },
        { status: 400 }
      );
    }

    console.log('🔑 API Route: Processing input - URL:', !!url, 'Code:', !!code);

    const input: { url?: string; code?: string } = {};
    let platform: ContentPlatform = 'instagram';

    if (url) {
      // Validate URL format
      try {
        new URL(url);
      } catch {
        console.log('❌ API Route: Invalid URL format:', url);
        return NextResponse.json(
          { success: false, message: 'Invalid URL format' },
          { status: 400 }
        );
      }

      // Auto-detect platform from URL
      const detectedPlatform = detectPlatformFromUrl(url);

      if (!detectedPlatform) {
        console.log('❌ API Route: Unsupported platform URL:', url);
        return NextResponse.json(
          {
            success: false,
            message: 'Unsupported platform. Only Instagram, TikTok, and YouTube URLs are supported.',
          },
          { status: 400 }
        );
      }

      platform = requestedPlatform || detectedPlatform;
      input.url = url;

      console.log(`✅ API Route: Valid ${platform} URL provided (detected: ${detectedPlatform})`);
    } else if (code) {
      // Validate post code format (Instagram only for code input)
      if (!code || code.length < 5 || !/^[a-zA-Z0-9_-]+$/.test(code)) {
        console.log('❌ API Route: Invalid post code format:', code);
        return NextResponse.json(
          { success: false, message: 'Invalid post code format' },
          { status: 400 }
        );
      }

      input.code = code;
      platform = requestedPlatform || 'instagram';

      console.log('✅ API Route: Valid post code provided');
    }

    console.log(`📱 API Route: Platform: ${platform}`);

    // Use Content Provider Manager to fetch post data
    const processedData = await contentProviderManager.fetchPost(
      input,
      platform,
      preferredProvider || 'insightiq'
    );

    console.log('Post API Router - Success:', processedData.success);
    console.log('Post API Router - Provider used:', processedData.provider_used);
    console.log('Post API Router - Platform:', platform);

    if (!processedData.success) {
      console.log('❌ API Route: Failed to fetch post data:', processedData.message);
      return NextResponse.json(processedData, { status: 422 });
    }

    // Add platform to response
    processedData.platform = platform;

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('💥 API Route: Unexpected error:', error);

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes('timeout')) {
        statusCode = 408;
        errorMessage = 'Request timed out while fetching post data';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        statusCode = 503;
        errorMessage = 'Service temporarily unavailable';
      } else if (error.message.includes('token') || error.message.includes('auth')) {
        statusCode = 500;
        errorMessage = 'Service configuration error';
      } else if (error.message.includes('JSON')) {
        statusCode = 400;
        errorMessage = 'Invalid request format';
      } else if (error.message.includes('NO_PROVIDERS_AVAILABLE')) {
        statusCode = 503;
        errorMessage = 'Data providers are currently unavailable';
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        user: {
          user_ig_id: '',
          full_name: '',
          profile_pic_url: '',
          username: '',
        },
        post: {
          post_id: '',
          shortcode: '',
          created_at: new Date().toISOString(),
          comments_count: 0,
          likes_count: 0,
          shares_count: 0,
          media_type: 'image',
          is_video: false,
        },
      },
      { status: statusCode }
    );
  }
}