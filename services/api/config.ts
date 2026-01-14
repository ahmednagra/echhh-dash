// src/services/api/config.ts

const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v0';

let baseEnvUrl = '';

if (appEnv === 'production') {
  baseEnvUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_PRO!;
} else if (appEnv === 'development') {
  baseEnvUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV!;
} else if (appEnv === 'local') { // Added support for 'local' environment
  baseEnvUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
} else {
  // Fallback for any other environment names to 'local'
  baseEnvUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
}

// Fallback if none set
if (!baseEnvUrl) {
  console.warn('⚠️ No base URL set for environment. Using localhost fallback.');
  baseEnvUrl = 'http://127.0.0.1:8000';
}

export const API_CONFIG = {
  baseUrl: `${baseEnvUrl}/${apiVersion}`,
  timeout: 60000, // 60 seconds (was 30000)
  retryAttempts: 1,
  tokenRefreshEndpoint: '/auth/refresh',
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';