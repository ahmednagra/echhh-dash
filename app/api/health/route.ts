// src/app/api/health/route.ts
// Health check endpoint for Cloud Run

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    service: 'echooo-frontend',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'unknown',
    uptime: process.uptime(),
  };

  return NextResponse.json(healthCheck, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}