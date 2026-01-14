// src/lib/auth-utils.ts
// Authentication utilities for API routes

import { NextRequest } from 'next/server';

/**
 * Extract Bearer token from request headers
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }
  
  // Check if it starts with 'Bearer '
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // Extract the token part
  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  
  if (!token || token.trim() === '') {
    return null;
  }
  
  return token.trim();
}

/**
 * Validate authentication token (basic validation)
 */
export function validateAuthToken(token: string | null): boolean {
  if (!token) {
    return false;
  }
  
  // Add your token validation logic here
  // For now, just check if it's not empty
  return token.trim().length > 0;
}