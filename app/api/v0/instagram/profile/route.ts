// src/app/api/instagram/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { InstagramProfileResponse } from '@/types/instagram';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const proxyImage = searchParams.get('proxyImage');
  const includePosts = searchParams.get('includePosts');
  const postsChunkSize = searchParams.get('postsChunkSize') || '10'; // Default to 10 posts

  if (!userId) {
    return NextResponse.json(
      { error: 'userId parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Validate API configuration
    if (!process.env.IMAI_BASE_API || !process.env.IMAI_API_AUTH_KEY || !process.env.ENSEMBLEDATA_AUTH_TOKEN) {
      return NextResponse.json(
        { error: 'API configuration is missing' },
        { status: 500 }
      );
    }

    // Fetch Instagram profile data
    const profileResponse = await fetch(
      `${process.env.IMAI_BASE_API}/raw/ig/user/info/?url=${encodeURIComponent(userId)}`,
      {
        headers: {
          'authkey': process.env.IMAI_API_AUTH_KEY
        },
        next: { revalidate: 36000 }
      }
    );

    if (!profileResponse.ok) {
      const errorData = await profileResponse.json().catch(() => null);
      console.error('Instagram API error:', errorData);
      throw new Error(`Instagram API responded with status: ${profileResponse.status}`);
    }

    const profileData = await profileResponse.json();

    // Initialize posts data
    let postsData = null;

    // Fetch posts if includePosts=true
    if (includePosts === 'true') {
      try {
        const postsParams = new URLSearchParams({
          user_id: userId,
          depth: '3',
          chunk_size: postsChunkSize || '10',
          start_cursor: '',
          alternative_method: 'false',
          token: process.env.ENSEMBLEDATA_AUTH_TOKEN || ''
        });

        // Check if ENSEMBLEDATA_BASE_API and ENSEMBLEDATA_POSTS_ENDPOINT are defined
        if (!process.env.ENSEMBLEDATA_BASE_API || !process.env.ENSEMBLEDATA_POSTS_ENDPOINT) {
          console.error('Missing ENSEMBLEDATA API configuration');
          throw new Error('Posts API configuration is missing');
        }

        const postsResponse = await fetch(
          `${process.env.ENSEMBLEDATA_BASE_API}/${process.env.ENSEMBLEDATA_POSTS_ENDPOINT}?${postsParams.toString()}`,
          {
            next: { revalidate: 3600 } // Cache posts for 1 hour
          }
        );

        if (postsResponse.ok) {
          postsData = await postsResponse.json();
          console.log('Posts API Response received successfully');
        } else {
          const errorData = await postsResponse.json().catch(() => null);
          console.error('Posts API error:', errorData);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        // throw new Error(error?.detail);
      }
    }

    // Extract profile data properly from the response
    // This is the most likely source of the problem - ensuring we extract profile data correctly
    // const profileInfo = profileData.user;
    
    // Prepare response data
    const responseData: any = {
      success: true,
      profile: profileData?.user
    };

    // if (postsData && postsData.data) {
    //   responseData.posts = postsData.data;
    // }
    // console.log('postsData: ', postsData)
    if (postsData && postsData.data) {
      // Extract specific fields from each post and add directly to array
      responseData.posts = {
        total_posts: postsData.data.count,
        posts: postsData.data.posts.map((post: any) => ({
          id: post.node?.id,
          shortcode: post.node?.shortcode,
          display_url: post.node?.display_url,
          is_video: post.node?.is_video,
          video_url: post.node?.video_url,
          caption: post.node?.edge_media_to_caption?.edges[0]?.node?.text || '',
          taken_at_timestamp: post.node?.taken_at_timestamp,
          like_count: post.node?.edge_media_preview_like?.count || 0,
          video_view_count: post.node?.video_view_count || 0,
          comments_disabled: post.node?.comments_disabled,
          comment_count: post.node?.edge_media_to_comment?.count || 0,
          thumbnail_src: post.node?.thumbnail_src,
          dimensions: post.node?.dimensions,
          has_audio: post.node?.has_audio,
          is_paid_partnership: post.node?.is_paid_partnership,
          like_and_view_counts_disabled: post.node?.like_and_view_counts_disabled,
          location: post.node?.location,
          product_type: post.node?.product_type,
          sensitivity_friction_info: post.node?.sensitivity_friction_info,
          viewer_can_reshare: post.node?.viewer_can_reshare,
        })),
        has_more: postsData.has_more || false
      };
    }

    // If proxyImage=true, modify the response to use a local proxy for images
    if (proxyImage === 'true') {
      // Proxy profile images
      if (responseData.profile?.profile_pic_url_hd) {
        responseData.profile = {
          ...responseData.profile,
          profile_pic_url_hd: `/api/instagram/image-proxy?url=${encodeURIComponent(responseData.profile.profile_pic_url_hd)}`,
          profile_pic_url: `/api/instagram/image-proxy?url=${encodeURIComponent(responseData.profile.profile_pic_url)}`
        };
      }

      // Proxy post images if they exist
      if (responseData.posts?.posts) {
        responseData.posts.posts = responseData.posts.posts.map((post: any) => {
          const proxiedPost = { ...post };
          
          if (post.display_url) {
            proxiedPost.display_url = `/api/instagram/image-proxy?url=${encodeURIComponent(post.display_url)}`;
          }
          
          if (post.thumbnail_src) {
            proxiedPost.thumbnail_src = `/api/instagram/image-proxy?url=${encodeURIComponent(post.thumbnail_src)}`;
          }
          
          if (post.thumbnail_resources) {
            proxiedPost.thumbnail_resources = post.thumbnail_resources.map((resource: any) => ({
              ...resource,
              src: `/api/instagram/image-proxy?url=${encodeURIComponent(resource.src)}`
            }));
          }
          
          return proxiedPost;
        });
      }
    }

    // Log what we're returning to help debug
    console.log('Response Data Keys:', Object.keys(responseData));
    console.log('Profile Data Present:', !!responseData.profile);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching Instagram profile:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch Instagram data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}