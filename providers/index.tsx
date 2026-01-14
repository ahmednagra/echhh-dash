import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Log all requests
  console.log(`[Middleware] ${request.method} ${request.nextUrl.pathname}`)

  // Explicitly allow API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}