// src/app/api/instagram/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { InstagramSearchResponse } from '@/types/instagram';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');
  const proxyImage = searchParams.get('proxyImage');

  if (!keyword) {
    return NextResponse.json(
      { error: 'Keyword parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Validate API configuration
    if (!process.env.IMAI_BASE_API || !process.env.IMAI_API_AUTH_KEY) {
      return NextResponse.json(
        { error: 'Instagram API configuration is missing' },
        { status: 500 }
      );
    }

    // Real API call
    const response = await fetch(
      `${process.env.IMAI_BASE_API}/raw/ig/search/users/?keyword=${encodeURIComponent(keyword)}`,
      {
        headers: {
          'authkey': process.env.IMAI_API_AUTH_KEY
        },
        next: { revalidate: 36000 }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Instagram API error:', errorData);
      return NextResponse.json(errorData || { error: 'Instagram API request failed' }, { status: response.status });
    }

    const data: InstagramSearchResponse = await response.json();

    // If proxyImages is enabled, modify profile pictures to use our proxy
    if (proxyImage === 'true' && data.users) {
      const processedUsers = data.users.map(user => ({
        ...user,
        profile_pic_url: `/api/instagram/image-proxy?url=${encodeURIComponent(user.profile_pic_url)}`
      }));
      
      return NextResponse.json({
        ...data,
        users: processedUsers
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error searching Instagram profiles:', error);
    return NextResponse.json(
      { error: 'Failed to search Instagram profiles. Check server logs for details.' },
      { status: 500 }
    );
  }
}