// src/services/ensembledata/endpoints.ts
// Endpoints configuration for EnsembleData 3rd party API

export const ENSEMBLEDATA_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 1,
  token: process.env.ENSEMBLEDATA_AUTH_TOKEN || '',
};

export const ENSEMBLEDATA_ENDPOINTS = {
  INSTAGRAM: {
    USER_DETAILED_INFO: '/instagram/user/detailed-info',
    USER_SEARCH: '/instagram/user/search',
    POST_DETAILS: '/instagram/post/details',
  },
  YOUTUBE: {
    CHANNEL_INFO: '/youtube/channel/info',
    VIDEO_DETAILS: '/youtube/video/details',
  },
  TIKTOK: {
    USER_INFO: '/tiktok/user/info',
    VIDEO_INFO: '/tiktok/video/info',
  },
  // Add more social platforms as needed
} as const;

export type EnsembleDataEndpoint = typeof ENSEMBLEDATA_ENDPOINTS;