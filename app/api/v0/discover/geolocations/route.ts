// src/app/api/geolocations/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const authKey = process.env.IMAI_API_AUTH_KEY;

  if (!authKey) {
    return NextResponse.json(
      { error: "API authentication key not configured" },
      { status: 500 }
    );
  }

  try {
    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const apiUrl = new URL('https://imai.co/api/geos/');
    apiUrl.searchParams.append('q', query);

    const response = await fetch(apiUrl.toString(), {
      headers: {
        'authkey': authKey
      }
    });

    if (!response.ok) {
      throw new Error(`Geolocation API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Transform API response to consistent format
    const locations = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      title: item.title,
      type: item.type.includes('country') ? 'country' : 'city',
      country: {
        id: item.country.id,
        code: item.country.code,
        name: item.type.includes('country') ? item.name : item.country.name
      }
    }));

    return NextResponse.json(locations);
    
  } catch (error) {
    console.error('Geolocation API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}