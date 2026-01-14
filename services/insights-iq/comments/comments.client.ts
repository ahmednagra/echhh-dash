// src/services/insights-iq/comments/comments.client.ts

import {
  InstagramCommentRequest,
  InstagramCommentsResponse,
} from '@/types/instagram-comments';

const API_VERSION = '/api/v0';

/**
 * Client-side service to fetch Instagram comments through Next.js API
 * This follows the pattern established in your project's API flow structure
 */
export async function fetchInstagramCommentsClient(
  params: InstagramCommentRequest
): Promise<InstagramCommentsResponse> {
  try {
    // Browser-only check
    if (typeof window === 'undefined') {
      throw new Error('fetchInstagramCommentsClient can only be called from browser');
    }

    console.log('🔍 InsightIQ Client Service: Fetching Instagram comments...', {
      content_url: params.content_url,
      work_platform_id: params.work_platform_id,
      offset: params.offset || 0,
      limit: params.limit || 15,
      sort_by: params.sort_by || 'likes',
    });

    // Check for auth token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in first.');
    }

    // Build endpoint
    const endpoint = `${API_VERSION}/instagram/comments`;

    console.log('📡 InsightIQ Client Service: POST', endpoint);

    // Make request to Next.js API route
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    console.log('📥 InsightIQ Client Service: Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP ${response.status}: Request failed`;
      console.error('❌ InsightIQ Client Service: Request failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const result: InstagramCommentsResponse = await response.json();

    console.log('✅ InsightIQ Client Service: Comments fetched successfully');
    console.log('📊 InsightIQ Client Service: Results:', {
      success: result.success,
      total_comments: result.comments?.length || 0,
      has_more: result.pagination?.has_more || false,
    });

    // Log comment details for console debugging
    if (result.comments && result.comments.length > 0) {
      console.log('💬 InsightIQ Client Service: Comment Details:', {
        first_comment: {
          username: result.comments[0].commenter_username,
          text: result.comments[0].text,
          likes: result.comments[0].like_count,
          verified: result.comments[0].is_verified_profile,
        },
        top_liked: result.comments.reduce((max, comment) => 
          comment.like_count > max.like_count ? comment : max
        , result.comments[0]),
      });

      // Log sample texts for sentiment analysis preview
      console.log('📝 InsightIQ Client Service: Sample texts for sentiment analysis:');
      result.comments.slice(0, 5).forEach((comment, idx) => {
        console.log(`   ${idx + 1}. @${comment.commenter_username}: "${comment.text}" (👍 ${comment.like_count})`);
      });

      // Log sentiment readiness metrics
      console.log('🎯 InsightIQ Client Service: Sentiment Analysis Readiness:', {
        comments_ready: result.comments.length,
        avg_text_length: (result.comments.reduce((sum, c) => sum + c.text.length, 0) / result.comments.length).toFixed(2),
        verified_commenters: result.comments.filter(c => c.is_verified_profile).length,
        comments_with_replies: result.comments.filter(c => c.reply_count > 0).length,
        total_engagement: result.comments.reduce((sum, c) => sum + c.like_count, 0),
      });
    } else {
      console.log('ℹ️ InsightIQ Client Service: No comments found for this content');
    }

    return result;

  } catch (error) {
    console.error('💥 InsightIQ Client Service: Error in fetchInstagramCommentsClient:', error);
    
    // Return error response in expected format
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

/**
 * Convenience function to fetch all comments (paginated)
 * Useful for getting complete dataset for sentiment analysis
 */
export async function fetchAllInstagramComments(
  content_url: string,
  work_platform_id: string,
  maxComments: number = 150 // Fetch up to 150 comments (10 pages)
): Promise<InstagramCommentsResponse> {
  const allComments: any[] = [];
  let offset = 0;
  const limit = 15;
  let hasMore = true;

  console.log('🔄 InsightIQ Client Service: Fetching all comments...');

  while (hasMore && allComments.length < maxComments) {
    const response = await fetchInstagramCommentsClient({
      content_url,
      work_platform_id,
      offset,
      limit,
      sort_by: 'likes',
    });

    if (!response.success || !response.comments || response.comments.length === 0) {
      break;
    }

    allComments.push(...response.comments);
    hasMore = response.pagination.has_more;
    offset += limit;

    console.log(`📄 Fetched page ${Math.ceil(allComments.length / limit)}: ${allComments.length} total comments`);
  }

  console.log('✅ InsightIQ Client Service: All comments fetched:', allComments.length);

  return {
    success: true,
    comments: allComments,
    pagination: {
      offset: 0,
      limit: allComments.length,
      total: allComments.length,
      has_more: false,
    },
    content_url,
    message: `Successfully fetched all ${allComments.length} comments`,
  };
}