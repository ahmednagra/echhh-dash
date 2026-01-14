// src/middleware/auth.middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected route prefixes - CHANGE '/' TO '/dashboard'
const protectedRoutes = ['/dashboard', '/discover', '/influencers', '/clients', '/profile', '/profile-analysis'];
const authRoutes = ['/login', '/register', '/reset-password'];

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies or headers
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname === route);
  
  // If it's a protected route and there's no token, redirect to login
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // If user is authenticated and tries to access login/register, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}