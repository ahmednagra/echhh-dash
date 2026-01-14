// src/services/sentiment-analysis/sentiment-analysis.client.ts
// Client-side service for Sentiment Analysis

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  GetSentimentAnalyticsResponse,
  GenerateSentimentAnalysisResponse,
} from '@/types/sentiment-analysis';

const API_VERSION = '/api/v0';

/**
 * Fetch campaign sentiment analytics via Next.js API route
 * @param campaignId - Campaign UUID
 * @returns Promise<GetSentimentAnalyticsResponse>
 */
export async function getCampaignSentimentAnalytics(
  campaignId: string
): Promise<GetSentimentAnalyticsResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getCampaignSentimentAnalytics can only be called from browser');
    }
    
    // Validate authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.SENTIMENT_ANALYSIS.GET_ANALYTICS(campaignId);
    const response = await nextjsApiClient.get<GetSentimentAnalyticsResponse>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data || {
      success: true,
      data: [],
      metadata: { total_items: 0 }
    };
    
  } catch (error) {
    console.error('Client Service: Error in getCampaignSentimentAnalytics:', error);
    throw error;
  }
}

/**
 * Trigger sentiment analysis generation for campaign
 * @param campaignId - Campaign UUID
 * @returns Promise<GenerateSentimentAnalysisResponse>
 */
export async function generateCampaignSentimentAnalysis(
  campaignId: string
): Promise<GenerateSentimentAnalysisResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('generateCampaignSentimentAnalysis can only be called from browser');
    }
    
    // Validate authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.SENTIMENT_ANALYSIS.GENERATE(campaignId);
    const response = await nextjsApiClient.post<GenerateSentimentAnalysisResponse>(
      endpoint,
      {} // Empty body as per API specification
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to initiate sentiment analysis generation');
    }
    
    return response.data;
    
  } catch (error) {
    console.error('Client Service: Error in generateCampaignSentimentAnalysis:', error);
    throw error;
  }
}