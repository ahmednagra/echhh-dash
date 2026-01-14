import { NextResponse } from 'next/server';
import { DiscoverSearchParams } from '@/lib/types';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  console.log('✅ API Route Hit: /api/discover/influencers');

  const authKey = process.env.IMAI_API_AUTH_KEY;
  if (!authKey) {
    return NextResponse.json(
      { error: "API authentication key not configured" },
      { status: 500 }
    );
  }

  try {
    const body: DiscoverSearchParams = await request.json();

    // Construct the payload from the request body
    const apiPayload = {
      audience_source: "instagram",
      sort: {
        field: body.sort?.field || "followers",
        direction: body.sort?.direction || "desc"
      },
      filter: {
        ...body.filter,
        ...(body.filter?.followers == null && {
          followers: {
            left_number: "5000",
            right_number: "1000000"
          }
        }),
        ...(body.filter?.geo == null && {
          geo: []
        })
      },
      paging: {
        skip: body.paging?.skip ?? 0,
        limit: body.paging?.limit ?? 10
      }
    };

    const apiUrl = new URL(`${process.env.IMAI_BASE_API}/search/newv1?platform=instagram&n=0`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': authKey
      },
      next: { revalidate: 36000 },
      body: JSON.stringify(apiPayload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          error: "external_api_error",
          status: response.status,
          message: errorText
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    // console.log('API Response:', data);

    // Transform response
    const influencers = data.accounts?.map((item: any) => ({
      id: item.account?.user_profile?.user_id,
      username: item.account?.user_profile?.username,
      name: item.account?.user_profile?.fullname,
      profileImage: item.account?.user_profile?.picture,
      followers: formatNumber(item.account?.user_profile?.followers),
      engagements: formatNumber(item.account?.user_profile?.engagements),
      engagementRate: item.account?.user_profile?.engagement_rate
        ? `${(item.account?.user_profile?.engagement_rate * 100).toFixed(2)}%`
        : '0%',
      isVerified: item.account?.user_profile?.is_verified || false,
      match: {
        gender: item.match?.user_profile?.gender,
        country: item.match?.user_profile?.geo?.country?.name
      }
    })) || [];

    return NextResponse.json({
      influencers,
      totalResults: data.total || 0,
    });

  } catch (error: any) {
    console.error('Route Error:', error);
    return NextResponse.json(
      { 
        error: "internal_error",
        message: error.message || "Unknown error occurred"
      },
      { status: 500 }
    );
  }
}

function formatNumber(num: number): string {
  if (!num) return "0";
  if (num >= 1000000) return `${(num/1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num/1000).toFixed(1)}K`;
  return num.toString();
}