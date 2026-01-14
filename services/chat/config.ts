// src/services/chat/config.ts

/**
 * AI Chat Service Configuration
 * 
 * Connects to the AI Service backend (separate from main FastAPI backend)
 */

const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';

let aiServiceBaseUrl = '';

// AI Service has its own base URL (different from main backend)
if (appEnv === 'production') {
  aiServiceBaseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL_PRO!;
} else if (appEnv === 'development') {
  aiServiceBaseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL_DEV!;
} else if (appEnv === 'local') {
  aiServiceBaseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL_LOC!;
} else {
  aiServiceBaseUrl = process.env.NEXT_PUBLIC_AI_SERVICE_URL_LOC!;
}

// Fallback if not set (AI service typically on different port)
if (!aiServiceBaseUrl) {
  console.warn('⚠️ No AI Service URL set. Using localhost fallback.');
  aiServiceBaseUrl = 'http://127.0.0.1:8002'; // Different port from main backend
}

export const AI_CHAT_CONFIG = {
  baseUrl: aiServiceBaseUrl,
  apiVersion: 'v1',
  timeout: 30000, // 30 seconds
  retryAttempts: 1,
};

/**
 * AI Chat API Endpoints
 */
export const AI_CHAT_ENDPOINTS = {
  // Message handling
  SEND_MESSAGE: '/ai-chat/message',
  
  // Session/Conversation management (backend uses "sessions" terminology)
  GET_SESSIONS: '/ai-chat/sessions',
  CREATE_SESSION: '/ai-chat/sessions',
  DELETE_SESSION: (sessionId: string) => `/ai-chat/sessions/${sessionId}`,
  
  // Specialized endpoints
  DISCOVER: '/ai-chat/discover',
  CAMPAIGN_ASSIST: '/ai-chat/campaign-assist',
  
  // Health check
  HEALTH: '/ai-chat/health',
  AGENTS_STATUS: '/ai-chat/agents/status',
} as const;

export type AIChatEndpoint = typeof AI_CHAT_ENDPOINTS;