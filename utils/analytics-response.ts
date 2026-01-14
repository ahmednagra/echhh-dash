// src/utils/analytics-response.ts
// Utility functions for handling analytics API responses

import { 
  BackendAnalyticsResponse,
  SuccessfulAnalyticsResponse,
  AnalyticsNotFoundError,
  AnalyticsApiError,
  BackendAnalyticsRecord,
  isSuccessfulAnalyticsResponse,
  isAnalyticsNotFoundError,
  isAnalyticsApiError
} from '@/types/profile-analytics';
import { InsightIQProfileAnalyticsResponse } from '@/types/insightiq/profile-analytics';

/**
 * Extracts analytics data from a successful backend response
 * Returns the most recent analytics record or null if no data
 */
export function extractLatestAnalytics(
  response: BackendAnalyticsResponse
): InsightIQProfileAnalyticsResponse | null {
  if (!isSuccessfulAnalyticsResponse(response)) {
    return null;
  }
  
  if (response.analytics_data.length === 0) {
    return null;
  }
  
  // Return the most recent analytics (first item, assuming sorted by date)
  return response.analytics_data[0].analytics;
}

/**
 * Checks if the response indicates that no analytics data was found
 */
export function isNoAnalyticsFound(response: BackendAnalyticsResponse): boolean {
  if (isAnalyticsNotFoundError(response)) {
    return true;
  }
  
  if (isSuccessfulAnalyticsResponse(response)) {
    return response.analytics_data.length === 0;
  }
  
  return false;
}

/**
 * Gets a user-friendly error message from an analytics response
 */
export function getAnalyticsErrorMessage(response: BackendAnalyticsResponse): string | null {
  if (isAnalyticsNotFoundError(response)) {
    return response.detail;
  }
  
  if (isAnalyticsApiError(response)) {
    return response.error || response.detail || response.message || 'Unknown API error';
  }
  
  return null;
}

/**
 * Logs analytics response in a structured way for debugging
 */
export function logAnalyticsResponse(
  response: BackendAnalyticsResponse,
  context: string = 'Analytics Response'
): void {
  if (isSuccessfulAnalyticsResponse(response)) {
    console.log(`✅ ${context}: Success`, {
      analyticsCount: response.analytics_count,
      hasData: response.analytics_data.length > 0,
      latestDate: response.analytics_data[0]?.created_at
    });
  } else if (isAnalyticsNotFoundError(response)) {
    console.log(`ℹ️ ${context}: Not Found`, {
      detail: response.detail
    });
  } else if (isAnalyticsApiError(response)) {
    console.error(`❌ ${context}: API Error`, response);
  } else {
    console.warn(`⚠️ ${context}: Unknown Response Type`, response);
  }
}

/**
 * Type-safe way to handle analytics response with callbacks
 */
export function handleAnalyticsResponse<T>(
  response: BackendAnalyticsResponse,
  handlers: {
    onSuccess: (data: SuccessfulAnalyticsResponse) => T;
    onNotFound: (error: AnalyticsNotFoundError) => T;
    onError: (error: AnalyticsApiError) => T;
    onUnknown?: (response: unknown) => T;
  }
): T {
  if (isSuccessfulAnalyticsResponse(response)) {
    return handlers.onSuccess(response);
  } else if (isAnalyticsNotFoundError(response)) {
    return handlers.onNotFound(response);
  } else if (isAnalyticsApiError(response)) {
    return handlers.onError(response);
  } else {
    if (handlers.onUnknown) {
      return handlers.onUnknown(response);
    }
    throw new Error('Unknown response type and no onUnknown handler provided');
  }
}

/**
 * Creates a standardized error for analytics operations
 */
export function createAnalyticsError(
  response: BackendAnalyticsResponse,
  fallbackMessage: string = 'Analytics operation failed'
): Error {
  const errorMessage = getAnalyticsErrorMessage(response);
  return new Error(errorMessage || fallbackMessage);
}

/**
 * Checks if analytics data is stale (older than specified hours)
 */
export function isAnalyticsStale(
  analytics: BackendAnalyticsRecord,
  staleAfterHours: number = 24
): boolean {
  const analyticsDate = new Date(analytics.created_at);
  const now = new Date();
  const hoursDiff = (now.getTime() - analyticsDate.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff > staleAfterHours;
}

/**
 * Gets the analytics age in a human-readable format
 */
export function getAnalyticsAge(analytics: BackendAnalyticsRecord): string {
  const analyticsDate = new Date(analytics.created_at);
  const now = new Date();
  const diffMs = now.getTime() - analyticsDate.getTime();
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
}