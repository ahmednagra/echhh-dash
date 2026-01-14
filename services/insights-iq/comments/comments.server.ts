// src/services/insights-iq/comments/comments.server.ts

import {
  InstagramCommentRequest,
  InstagramCommentsResponse,
  InstagramComment,
} from '@/types/instagram-comments';

/**
 * Create Basic Auth header for InsightIQ API
 */
function createBasicAuthHeader(clientId: string, clientSecret: string): string {
  const credentials = `${clientId}:${clientSecret}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * Server-side service to fetch Instagram comments from InsightIQ API
 */
export async function fetchInstagramCommentsServer(
  params: InstagramCommentRequest,
  authToken?: string
): Promise<InstagramCommentsResponse> {
  try {
    console.log('🔍 InsightIQ Comments Server: Starting fetch...');

    // Get InsightIQ credentials from environment
    const clientId = process.env.INSIGHTIQ_CLIENT_ID;
    const clientSecret = process.env.INSIGHTIQ_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('❌ Missing InsightIQ credentials');
      throw new Error('InsightIQ API credentials not configured');
    }

    console.log('✅ InsightIQ credentials found');

    // Validate and set defaults
    const limit = Math.min(params.limit || 15, 15);
    const offset = params.offset || 0;

    // InsightIQ API endpoint
    const INSIGHTIQ_BASE_URL = 'https://api.insightiq.ai';
    const fullUrl = `${INSIGHTIQ_BASE_URL}/v1/social/creators/contents/comments?limit=${limit}`;

    console.log('📡 Calling URL:', fullUrl);

    // Prepare request body
    const requestBody = {
      content_url: params.content_url,
      work_platform_id: params.work_platform_id,
      offset: offset,
    };

    console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));

    // Create Basic Auth header
    const basicAuth = createBasicAuthHeader(clientId, clientSecret);

    // Make POST request
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': basicAuth,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Parse response
    const responseData = await response.json();
    console.log('📦 Response structure:', Object.keys(responseData));

    // CRITICAL FIX: Extract data from response
    // Response format: { "data": [...], "metadata": {...} }
    const comments: InstagramComment[] = Array.isArray(responseData.data) 
      ? responseData.data 
      : [];
    
    const metadata = responseData.metadata || {};

    console.log('✅ SUCCESS! Comments extracted from data array');
    console.log('📊 Comments fetched:', comments.length);
    console.log('📊 Total available:', metadata.total_count || 'unknown');

    if (comments.length > 0) {
      console.log('📊 Summary:', {
        fetched: comments.length,
        total_available: metadata.total_count,
        verified: comments.filter(c => c.is_verified_profile).length,
        total_likes: comments.reduce((sum, c) => sum + c.like_count, 0),
      });
      
      console.log('💬 Sample comments:');
      comments.slice(0, 3).forEach((c, idx) => {
        console.log(`   ${idx + 1}. @${c.commenter_username}: "${c.text.substring(0, 40)}..." (👍 ${c.like_count})`);
      });
    } else {
      console.log('ℹ️ No comments found for this content');
    }

    // Build pagination using metadata from API
    const pagination = {
      offset: metadata.offset || offset,
      limit: metadata.limit || limit,
      total: metadata.total_count || comments.length,
      has_more: (metadata.offset || offset) + comments.length < (metadata.total_count || 0),
    };

    console.log('📄 Pagination:', pagination);

    return {
      success: true,
      comments: comments,
      pagination: pagination,
      content_url: params.content_url,
      message: `Successfully fetched ${comments.length} comments (${metadata.total_count || 0} total available)`,
    };

  } catch (error) {
    console.error('💥 Error fetching comments:', error);
    
    return {
      success: false,
      comments: [],
      pagination: {
        offset: params.offset || 0,
        limit: params.limit || 15,
        total: 0,
        has_more: false,
      },
      content_url: params.content_url,
      error: error instanceof Error ? error.message : 'Failed to fetch Instagram comments',
    };
  }
}

export function getCommentsSentimentMetrics(comments: InstagramComment[]) {
  return {
    total_comments: comments.length,
    total_text_length: comments.reduce((sum, c) => sum + c.text.length, 0),
    avg_text_length: comments.length > 0
      ? (comments.reduce((sum, c) => sum + c.text.length, 0) / comments.length).toFixed(2)
      : 0,
    comments_with_text: comments.filter(c => c.text && c.text.trim().length > 0).length,
    unique_commenters: new Set(comments.map(c => c.commenter_username)).size,
    verified_commenters: comments.filter(c => c.is_verified_profile).length,
    ready_for_sentiment: comments.every(c => c.text && c.text.trim().length > 0),
  };
}