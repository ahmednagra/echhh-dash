// src/middleware/index.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from './authMiddleware';

export function middleware(request: NextRequest) {
  // Run auth middleware
  const authResponse = authMiddleware(request);
  
  // If auth middleware returns a response (redirect), use it
  if (authResponse !== NextResponse.next()) {
    return authResponse;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};