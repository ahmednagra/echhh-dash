// src/types/sentiment-analysis.ts
// Type definitions for Sentiment Analysis feature

/**
 * Sentiment distribution across categories
 */
export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
  mixed: number;
}

/**
 * Emoji sentiment analysis data
 */
export interface EmojiSentimentData {
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
    none: number;
  };
  sentiment_percentages: {
    positive: number;
    negative: number;
    neutral: number;
    none: number;
  };
  intensity_distribution: {
    none: number;
    low: number;
    medium: number;
    high: number;
  };
  intensity_percentages: {
    none: number;
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Emoji summary with frequency and sentiment data
 */
export interface EmojiSummary {
  frequency: Record<string, number>;
  total_count: number;
  unique_emojis: string[];
  emoji_sentiment?: EmojiSentimentData;
}

/**
 * Common words data from comment analysis
 */
export interface CommonWordsData {
  most_common: Array<{ word: string; count: number }>;
  most_unique: Array<{ word: string; count: number }>;
  total_words: number;
  unique_count: number;
}

/**
 * Flagged message structure
 */
export interface FlaggedMessage {
  original_text: string;
  flag_reasons: string[];
  severity: string;
  risk_level: string;
}

/**
 * Sentiment message (positive/negative comment)
 */
export interface SentimentMessage {
  original_text: string;
  sentiment_label: string;
  confidence: number;
  dominant_emotion: string;
  intensity: string;
  categories: Record<string, number>;
}

/**
 * Risk level type
 */
export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

/**
 * Single post analysis object (replaces batches)
 */
export interface PostAnalysis {
  comments_count: number;
  sentiment_distribution: SentimentDistribution;
  avg_confidence: number;
  risk_level: RiskLevel;
  flagged_count: number;
  flagged_messages: FlaggedMessage[];
  positive_comments: SentimentMessage[];
  negative_comments: SentimentMessage[];
  processed_at: string;
  emoji_summary: EmojiSummary;
  common_words: CommonWordsData;
  ai_provider: string;
  model_used: string;
  tokens_used: number;
  cost: number;
}

/**
 * Main sentiment data
 */
export interface SentimentData {
  dominant: 'positive' | 'neutral' | 'negative' | 'mixed';
  confidence: number;
  distribution: SentimentDistribution;
}

/**
 * Processing statistics
 */
export interface SentimentStatistics {
  total_comments: number;
  processing_duration_seconds: number;
}

/**
 * Analysis timestamps
 */
export interface SentimentTimestamps {
  started_at: string;
  completed_at: string;
  created_at: string;
}

/**
 * Analysis metadata
 */
export interface AnalysisMetadata {
  processed: boolean;
  ai_provider?: string;
  model_used?: string;
  tokens_used?: number;
  cost?: number;
}

/**
 * Platform info for the content post
 */
export interface PlatformInfo {
  platform_username?: string | null;
  profile_url?: string | null;
  profile_image_url?: string | null;
  content_url?: string | null;
  thumbnail_url?: string | null;
  platform_name?: string | null;
  platform_logo_url?: string | null;
  published_at?: string | null;
}

/**
 * Complete sentiment analysis data for a single post
 */
export interface SentimentAnalysisData {
  campaign_id: string;
  requested_by: string;
  id: string;
  content_post_id: string;
  sentiment: SentimentData;
  statistics: SentimentStatistics;
  timestamps: SentimentTimestamps;
  analysis?: PostAnalysis;
  analysis_metadata?: AnalysisMetadata;
  platform_info?: PlatformInfo;
}

/**
 * Aggregated data from multiple analysis records
 */
export interface AggregatedData {
  sentiment: {
    dominant: string;
    confidence: number;
    distribution: SentimentDistribution;
  };
  statistics: {
    total_comments: number;
    total_posts: number;
    processing_duration_seconds: number;
  };
  timestamps: {
    latest_completed: string | null;
    earliest_started: string | null;
  };
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  total_items: number;
}

/**
 * GET endpoint response - matches FastAPI response
 */
export interface GetSentimentAnalyticsResponse {
  success: boolean;
  data: SentimentAnalysisData[];
  metadata: ResponseMetadata;
  error?: string;
}

/**
 * Job status type
 */
export type JobStatus = 'processing' | 'completed' | 'failed';

/**
 * POST endpoint response - trigger analysis
 */
export interface GenerateSentimentAnalysisResponse {
  success: boolean;
  job_id: string;
  campaign_id?: string;
  message: string;
  started_at?: string;
  status?: JobStatus;
}

/**
 * Notification state for UI alerts
 */
export interface NotificationState {
  type: 'success' | 'info' | 'error';
  message: string;
}

/**
 * Main sentiment analysis component props
 */
export interface SentimentAnalysisProps {
  campaignId: string;
  onBack: () => void;
}

/**
 * Progress callback type
 */
export type ProgressCallback = (status: string, progress: number) => void;

/**
 * Sentiment configuration for UI styling
 */
export const SENTIMENT_CONFIG = {
  positive: {
    label: 'Positive',
    color: 'green',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
    chartColor: '#10B981',
  },
  neutral: {
    label: 'Neutral',
    color: 'gray',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
    chartColor: '#6B7280',
  },
  negative: {
    label: 'Negative',
    color: 'red',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
    chartColor: '#EF4444',
  },
  mixed: {
    label: 'Mixed',
    color: 'yellow',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
    chartColor: '#F59E0B',
  },
} as const;

/**
 * Risk level configuration for UI styling
 */
export const RISK_CONFIG = {
  none: {
    label: 'None',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-800',
  },
  low: {
    label: 'Low',
    bgClass: 'bg-green-100',
    textClass: 'text-green-800',
  },
  medium: {
    label: 'Medium',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800',
  },
  high: {
    label: 'High',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-800',
  },
  critical: {
    label: 'Critical',
    bgClass: 'bg-red-100',
    textClass: 'text-red-800',
  },
} as const;