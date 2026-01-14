// src/services/sentiment-analysis/sentiment-analysis.server.ts
// Server-side service for Sentiment Analysis

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  GetSentimentAnalyticsResponse,
  GenerateSentimentAnalysisResponse,
} from '@/types/sentiment-analysis';

// const API_VERSION = '/api/v0';

/**
 * Fetch campaign sentiment analytics from FastAPI backend
 */
export async function getCampaignSentimentAnalyticsServer(
  campaignId: string,
  authToken?: string
): Promise<GetSentimentAnalyticsResponse> {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('getCampaignSentimentAnalyticsServer should only be called on the server');
    }

    const token = authToken ?? process.env.SERVER_API_TOKEN;
    if (!token) throw new Error('No authentication token provided');

    // const endpoint = API_VERSION + ENDPOINTS.SENTIMENT_ANALYSIS.GET_ANALYTICS(campaignId);
    const endpoint = ENDPOINTS.SENTIMENT_ANALYSIS.GET_ANALYTICS(campaignId);
    const response = await serverApiClient.get<GetSentimentAnalyticsResponse>(endpoint, {}, token);

    if (response.error) throw new Error(response.error.message);
    if (!response.data) throw new Error('Failed to fetch sentiment analytics');

    return response.data;
  } catch (error) {
    console.error('Server Service: Error in getCampaignSentimentAnalyticsServer:', error);
    throw error;
  }
}

/**
 * Trigger sentiment analysis generation for campaign comments
 */
export async function generateCampaignSentimentAnalysisServer(
  campaignId: string,
  authToken?: string
): Promise<GenerateSentimentAnalysisResponse> {
  try {
    if (typeof window !== 'undefined') {
      throw new Error('generateCampaignSentimentAnalysisServer should only be called on the server');
    }

    const token = authToken ?? process.env.SERVER_API_TOKEN;
    if (!token) throw new Error('No authentication token provided');

    // const endpoint = API_VERSION + ENDPOINTS.SENTIMENT_ANALYSIS.GENERATE(campaignId);
    const endpoint = ENDPOINTS.SENTIMENT_ANALYSIS.GENERATE(campaignId);
    const response = await serverApiClient.post<GenerateSentimentAnalysisResponse>(
      endpoint,
      {}, // Empty body as per FastAPI spec.
      {},
      token
    );

    if (response.error) throw new Error(response.error.message);
    if (!response.data) throw new Error('Failed to initiate sentiment analysis generation');

    return response.data;
  } catch (error) {
    console.error('Server Service: Error in generateCampaignSentimentAnalysisServer:', error);
    throw error;
  }
}
