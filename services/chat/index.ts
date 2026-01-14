// src/services/chat/index.ts

/**
 * Chat Service Index
 * 
 * Barrel export for all chat services
 */

// Client services (browser only)
export * from './chat.client';

// Server services (Next.js API routes only)
export * from './chat.server';

// Configuration
export * from './config';