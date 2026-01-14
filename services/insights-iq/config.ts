// src/services/insights-iq/config.ts

export const INSIGHTIQ_CONFIG = {
  baseUrl: process.env.INSIGHTIQ_BASE_URL || 'https://api.insightiq.example.com',
  auth: {
    clientId: process.env.INSIGHTIQ_CLIENT_ID || '',
    clientSecret: process.env.INSIGHTIQ_CLIENT_SECRET || ''
  },
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000 // 1 second
} as const;