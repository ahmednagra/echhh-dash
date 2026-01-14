import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shortcode = searchParams.get('shortcode');

  if (!shortcode) {
    return NextResponse.json(
      { error: 'Video shortcode is required' },
      { status: 400 }
    );
  }

  try {
    // Call your third-party API for video details
    const postsParams = new URLSearchParams({
      code: shortcode,
      token: process.env.ENSEMBLEDATA_AUTH_TOKEN || '',
    });

    // Check if ENSEMBLEDATA_BASE_API and ENSEMBLEDATA_POSTS_ENDPOINT are defined
    if (!process.env.ENSEMBLEDATA_BASE_API || !process.env.ENSEMBLEDATA_POSTS_ENDPOINT) {
      console.error('Missing ENSEMBLEDATA API configuration');
      throw new Error('Posts API configuration is missing');
    }
    
    const postDataResponse = await fetch(
      `${process.env.ENSEMBLEDATA_BASE_API}/${process.env.ENSEMBLEDATA_POST_DETAIL}?${postsParams.toString()}`,
      {
        next: { revalidate: 36000 } // Cache posts for 1 hour
      }
    );

    let postData = null;
    if (postDataResponse.ok) {
      postData = await postDataResponse.json();
      console.log('Posts API Response received successfully');
    } else {
      const errorData = await postDataResponse.json().catch(() => null);
      console.error('Post API error:', errorData?.detail);
      throw new Error(errorData?.detail);
    }

    console.log('postData: ', postData?.data?.id)
    const comments = postData.data.edge_media_to_comment.edges.map((edge: any) => ({
      id: edge.node.id,
      text: edge.node.text,
      created_at: edge.node.created_at,
      owner: {
        id: edge.node.owner.id,
        username: edge.node.owner.username
      }
    }));

    const responseData = {
      id: postData.data.id,
      shortcode: postData.data.shortcode,
      thumbnail_src: postData.data.thumbnail_src,
      dimensions: postData.data.dimensions,
      has_audio:  postData.data.has_audio,
      video_url: postData.data.video_url,
      view_count: postData.data.video_view_count,
      video_play_count: postData.data.video_play_count,
      comments_count: postData.data.edge_media_to_comment.count,
      is_published: postData.data.is_published,
      is_video: postData.data.is_video,
      video_duration: postData.data.video_duration,
      caption: postData.data.edge_media_to_caption,
      like_and_view_counts_disabled: postData.data.like_and_view_counts_disabled,
      is_ad: postData.data.is_ad,
      duration: postData.data.duration_seconds,
      comments: comments
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Video details error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch video details' },
      { status: 500 }
    );
  }
}