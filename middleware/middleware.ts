// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Handle CORS for public API routes
  if (path.startsWith('/api/v0/profile-analytics/public/') || 
      path.startsWith('/api/v0/public/') || 
      path.startsWith('/api/shared-reports')) {
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Add CORS headers to actual requests
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
  
  // Define public paths (including campaign analytics reports)
  const isPublicPath = 
    path === '/' || 
    path === '/login' || 
    path === '/register' || 
    path === '/reset-password' ||
    path.startsWith('/profile-analytics-report/') || // Existing public report path
    path.startsWith('/campaign-analytics-report/') || // NEW: Campaign analytics report path
    path.startsWith('/api/auth/') ||
    path.startsWith('/api/v0/profile-analytics/public/') || // Existing public API path
    path.startsWith('/api/v0/public/') || // NEW: Public campaign API path
    path.startsWith('/api/shared-reports') || // NEW: Shared reports API
    path.startsWith('/_next/') ||
    path.includes('.');
  
  // Get the token from cookies
  const token = request.cookies.get('accessToken')?.value;
  
  // CRITICAL: Log public access for debugging
  if (path.startsWith('/campaign-analytics-report/')) {
    console.log('🔓 PUBLIC ACCESS: Campaign analytics report accessed:', path);
    console.log('🔓 Token present:', !!token);
    console.log('🔓 Is public path:', isPublicPath);
  }
  
  // If path requires authentication and no token exists, redirect to login
  if (!isPublicPath && !token) {
    console.log('🔒 REDIRECT: Protected route requires auth:', path);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth pages
  if (token && (path === '/login' || path === '/register' || path === '/reset-password')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth routes
     * 2. /_next (Next.js internals)
     * 3. Static files
     * 4. Public campaign analytics reports (handled above)
     */
    '/((?!api/auth|_next/static|_next/image|public|favicon.ico|.*\\.).*)',
  ],
};