// src/app/api/v0/instagram/image-proxy/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return new Response('Image URL is required', { status: 400 });
  }

  try {
    // Add timeout to prevent hanging connections
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const imageResponse = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!imageResponse.ok) {
      // Return a placeholder or transparent pixel instead of error
      return new Response(null, { status: 204 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': imageResponse.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    // Silently fail - don't spam logs
    return new Response(null, { status: 204 });
  }
}