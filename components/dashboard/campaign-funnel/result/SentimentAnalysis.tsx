'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  AlertCircle, 
  RefreshCw, 
  MessageCircle, 
  TrendingUp, 
  Activity,
  BarChart3,
  CheckCircle,
  Info,
  TrendingDown,
  Gauge,
  Heart,
  Sparkles,
  Shield,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Award,
  FileText,
  X,
  Hash,
  Type,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  ExternalLink,
  User,
  Flag,
  Eye,
  MessageSquareWarning,
  Ban,
  Flame,
  Smile,
  Frown
} from 'lucide-react';

import { 
  SentimentAnalysisProps,
  SentimentAnalysisData,
  GetSentimentAnalyticsResponse,
  GenerateSentimentAnalysisResponse,
  SentimentDistribution,
  AggregatedData,
  NotificationState,
  PostAnalysis,
  FlaggedMessage,
  SentimentMessage,
  CommonWordsData
} from '@/types/sentiment-analysis';

import { 
  getCampaignSentimentAnalytics,
  generateCampaignSentimentAnalysis    // ✅ THIS IMPORT EXISTS
} from '@/services/sentiment-analysis';

import { detectPlatformFromUrl } from '@/constants/social-platforms';
import { ThumbnailPlatformIcon } from './VideoMetricsForm';

// Common Words Data Structure
// interface CommonWordsData {
//   most_common: Array<{ word: string; count: number }>;
//   most_unique: Array<{ word: string; count: number }>;
//   total_words: number;
//   unique_count: number;
// }

// Platform Info Interface
interface PlatformInfo {
  platform_username: string;
  profile_url: string;
  profile_image_url: string;
  content_url: string;
  thumbnail_url: string;
  platform_name: string;
  platform_logo_url: string;
  published_at?: string; 
}

// Flagged Message Interface
// interface FlaggedMessage {
//   original_text: string;
//   flag_reasons: string[];
//   severity: string;
//   risk_level: string;
// }

// Sentiment Message Interface
// interface SentimentMessage {
//   original_text: string;
//   sentiment_label: string;
//   confidence: number;
//   dominant_emotion: string;
//   intensity: string;
//   categories: Record<string, number>;
// }

// Post Sentiment Messages Interface
interface PostSentimentMessages {
  post_id: string;
  post_number: number;
  platform_info?: PlatformInfo;
  positive_messages: SentimentMessage[];
  negative_messages: SentimentMessage[];
  total_comments: number;
}

// Extended batch type with unique identifiers
// interface ExtendedBatch extends SentimentBatch {
//   unique_id: string;
//   display_number: number;
//   common_words?: CommonWordsData;
//   flagged_messages?: FlaggedMessage[];
//   positive_messages?: SentimentMessage[];
//   negative_messages?: SentimentMessage[];
// }

// Post-level aggregated data for table display
interface PostTableData {
  post_id: string;
  post_number: number;
  total_comments: number;
  // total_batches: number;  // REMOVE THIS LINE
  positive_percent: number;
  risk_level: string;
  flagged_count: number;
  published_at: string;
  dominant_sentiment: string;
  confidence: number;
  common_words?: CommonWordsData;
  platform_info?: PlatformInfo;
  flagged_messages?: FlaggedMessage[];
  positive_messages?: SentimentMessage[];   // ADD
  negative_messages?: SentimentMessage[];   // ADD
}

/**
 * Converts decimal distribution to percentage values
 */
const toPercentage = (dist: SentimentDistribution): SentimentDistribution => ({
  positive: Math.round(dist.positive * 100),
  neutral: Math.round(dist.neutral * 100),
  negative: Math.round(dist.negative * 100),
  mixed: Math.round(dist.mixed * 100),
});

/**
 * Normalize emoji sentiment distribution to ensure it sums to 100%
 */
const normalizeEmojiDistribution = (dist: { positive: number; neutral: number; negative: number; none: number }) => {
  const total = dist.positive + dist.neutral + dist.negative + dist.none;
  
  if (total === 0) {
    return { positive: 0, neutral: 0, negative: 0, none: 0 };
  }
  
  const normalized = {
    positive: (dist.positive / total) * 100,
    neutral: (dist.neutral / total) * 100,
    negative: (dist.negative / total) * 100,
    none: (dist.none / total) * 100
  };
  
  const rounded = {
    positive: Math.round(normalized.positive),
    neutral: Math.round(normalized.neutral),
    negative: Math.round(normalized.negative),
    none: Math.round(normalized.none)
  };
  
  const roundedTotal = rounded.positive + rounded.neutral + rounded.negative + rounded.none;
  const diff = 100 - roundedTotal;
  
  if (diff !== 0) {
    const maxKey = Object.keys(rounded).reduce((a, b) => 
      rounded[a as keyof typeof rounded] > rounded[b as keyof typeof rounded] ? a : b
    ) as keyof typeof rounded;
    rounded[maxKey] += diff;
  }
  
  return rounded;
};

// Emotion color mapping
const emotionColors: Record<string, string> = {
  'joy': '#10B981',
  'happiness': '#34D399',
  'love': '#EC4899',
  'affection': '#F472B6',
  'adoration': '#F9A8D4',
  'admiration': '#8B5CF6',
  'praise': '#A78BFA',
  'approval': '#6366F1',
  'excitement': '#F59E0B',
  'celebration': '#FBBF24',
  'gratitude': '#14B8A6',
  'sadness': '#6B7280',
  'anger': '#EF4444',
  'contempt': '#DC2626',
  'criticism': '#F87171',
  'hate': '#B91C1C',
  'fear': '#9333EA',
  'disgust': '#84CC16',
  'surprise': '#3B82F6',
  'sarcasm': '#F97316',
  'accusation': '#EA580C',
  'vengefulness': '#7C2D12',
  'default': '#94A3B8'
};

/**
 * Aggregates common words from all batches of a post - 30 words instead of 15
 */
// const aggregateCommonWordsFromBatches = (batches: ExtendedBatch[]): CommonWordsData => {
//   const wordCounts: Record<string, number> = {};
//   let totalWords = 0;
  
//   batches.forEach(batch => {
//     const commonWords = batch.common_words;
//     if (commonWords && commonWords.most_common) {
//       commonWords.most_common.forEach(item => {
//         wordCounts[item.word] = (wordCounts[item.word] || 0) + item.count;
//         totalWords += item.count;
//       });
//     }
//     if (commonWords && commonWords.most_unique) {
//       commonWords.most_unique.forEach(item => {
//         if (!wordCounts[item.word]) {
//           wordCounts[item.word] = item.count;
//         }
//       });
//     }
//   });
  
//   const sortedWords = Object.entries(wordCounts)
//     .map(([word, count]) => ({ word, count }))
//     .sort((a, b) => b.count - a.count);
  
//   const mostCommon = sortedWords.slice(0, 30);
//   const mostUnique = sortedWords.length > 30 
//     ? sortedWords.slice(-30).reverse() 
//     : sortedWords.slice().reverse();
  
//   return {
//     most_common: mostCommon,
//     most_unique: mostUnique,
//     total_words: totalWords,
//     unique_count: Object.keys(wordCounts).length
//   };
// };

/**
 * Aggregates flagged messages from all batches of a post
 */
// const aggregateFlaggedMessagesFromBatches = (batches: ExtendedBatch[]): FlaggedMessage[] => {
//   const allFlaggedMessages: FlaggedMessage[] = [];
  
//   batches.forEach(batch => {
//     if (batch.flagged_messages && Array.isArray(batch.flagged_messages)) {
//       batch.flagged_messages.forEach(msg => {
//         allFlaggedMessages.push({
//           original_text: msg.original_text || '',
//           flag_reasons: msg.flag_reasons || [],
//           severity: msg.severity || 'none',
//           risk_level: msg.risk_level || 'none'
//         });
//       });
//     }
//   });
  
//   return allFlaggedMessages;
// };

// REPLACE THE ENTIRE FUNCTION WITH:
const aggregateSentimentMessagesFromRecords = (records: SentimentAnalysisData[]): PostSentimentMessages[] => {
  return records.map((record, index) => {
    const analysis = record.analysis;
    
    return {
      post_id: record.content_post_id,
      post_number: index + 1,
      platform_info: record.platform_info as PlatformInfo | undefined,
      positive_messages: analysis?.positive_comments || [],
      negative_messages: analysis?.negative_comments || [],
      total_comments: record.statistics.total_comments
    };
  });
};

/**
 * Aggregates emoji data from all batches with sentiment analysis
 */
// REPLACE THE ENTIRE FUNCTION WITH:
const aggregateEmojiData = (records: SentimentAnalysisData[]) => {
  const aggregatedFrequency: Record<string, number> = {};
  let totalEmojiCount = 0;
  const uniqueEmojis = new Set<string>();
  
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0, none: 0 };
  
  records.forEach(record => {
    const emojiSummary = record.analysis?.emoji_summary;
    
    if (emojiSummary) {
      if (emojiSummary.frequency) {
        Object.entries(emojiSummary.frequency).forEach(([emoji, count]) => {
          aggregatedFrequency[emoji] = (aggregatedFrequency[emoji] || 0) + count;
          uniqueEmojis.add(emoji);
        });
      }
      
      totalEmojiCount += emojiSummary.total_count || 0;
      
      if (emojiSummary.emoji_sentiment) {
        const sentDist = emojiSummary.emoji_sentiment.sentiment_distribution;
        sentimentCounts.positive += sentDist.positive || 0;
        sentimentCounts.negative += sentDist.negative || 0;
        sentimentCounts.neutral += sentDist.neutral || 0;
        sentimentCounts.none += sentDist.none || 0;
      }
    }
  });
  
  const topEmojis = Object.entries(aggregatedFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30);
  
  const totalRecords = records.length;
  const sentimentPercentages = {
    positive: totalRecords > 0 ? (sentimentCounts.positive / totalRecords) * 100 : 0,
    negative: totalRecords > 0 ? (sentimentCounts.negative / totalRecords) * 100 : 0,
    neutral: totalRecords > 0 ? (sentimentCounts.neutral / totalRecords) * 100 : 0,
    none: totalRecords > 0 ? (sentimentCounts.none / totalRecords) * 100 : 0,
  };
  
  return {
    totalEmojiCount,
    uniqueEmojiCount: uniqueEmojis.size,
    topEmojis,
    sentimentDistribution: sentimentCounts,
    sentimentPercentages
  };
};
/**
 * Aggregates multiple sentiment analysis records into a single dataset
 */
// REPLACE THE ENTIRE FUNCTION WITH:
const aggregateAnalysisData = (records: SentimentAnalysisData[]): AggregatedData | null => {
  if (!records || records.length === 0) return null;

  const totalComments = records.reduce((sum, r) => sum + r.statistics.total_comments, 0);
  
  const weightedDist = records.reduce((acc, record) => {
    const weight = record.statistics.total_comments / totalComments;
    acc.positive += record.sentiment.distribution.positive * weight;
    acc.neutral += record.sentiment.distribution.neutral * weight;
    acc.negative += record.sentiment.distribution.negative * weight;
    acc.mixed += record.sentiment.distribution.mixed * weight;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0, mixed: 0 });

  const total = weightedDist.positive + weightedDist.neutral + weightedDist.negative + weightedDist.mixed;
  if (total > 0) {
    Object.keys(weightedDist).forEach(key => {
      weightedDist[key as keyof typeof weightedDist] /= total;
    });
  }

  const dominant = Object.entries(weightedDist)
    .reduce((max, current) => current[1] > max[1] ? current : max)[0];

  // Calculate average confidence from analysis objects
  const avgConfidence = records.length > 0
    ? records.reduce((sum, r) => sum + (r.analysis?.avg_confidence || r.sentiment.confidence || 0), 0) / records.length
    : 0;

  return {
    sentiment: {
      dominant,
      confidence: avgConfidence,
      distribution: weightedDist
    },
    statistics: {
      total_comments: totalComments,
      total_posts: records.length,
      processing_duration_seconds: records.reduce((sum, r) => sum + r.statistics.processing_duration_seconds, 0)
    },
    timestamps: {
      latest_completed: records[0]?.timestamps.completed_at || null,
      earliest_started: records[records.length - 1]?.timestamps.started_at || null
    }
  };
};

/**
 * Converts analysis records to post-level table data with common words and flagged messages
 */
// REPLACE THE ENTIRE FUNCTION WITH:
const convertToPostTableData = (records: SentimentAnalysisData[]): PostTableData[] => {
  return records.map((record, index) => {
    const analysis = record.analysis;
    
    return {
      post_id: record.content_post_id,
      post_number: index + 1,
      total_comments: record.statistics.total_comments,
      positive_percent: record.sentiment.distribution.positive,
      risk_level: analysis?.risk_level || 'none',
      flagged_count: analysis?.flagged_count || 0,
      published_at: record.platform_info?.published_at || record.timestamps.completed_at,
      dominant_sentiment: record.sentiment.dominant,
      confidence: record.sentiment.confidence,
      common_words: analysis?.common_words,
      platform_info: record.platform_info as PlatformInfo | undefined,
      flagged_messages: analysis?.flagged_messages || [],
      positive_messages: analysis?.positive_comments || [],
      negative_messages: analysis?.negative_comments || []
    };
  });
};

/**
 * Calculates sentiment trend
 */
// REPLACE THE ENTIRE FUNCTION WITH:
const calculateSentimentTrend = (records: SentimentAnalysisData[]): 'improving' | 'stable' | 'declining' => {
  if (records.length < 2) return 'stable';
  
  // Sort by timestamp
  const sorted = [...records].sort((a, b) => 
    new Date(a.timestamps.created_at).getTime() - new Date(b.timestamps.created_at).getTime()
  );
  
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
  
  const firstPositive = firstHalf.reduce((sum, r) => sum + r.sentiment.distribution.positive, 0) / firstHalf.length;
  const secondPositive = secondHalf.reduce((sum, r) => sum + r.sentiment.distribution.positive, 0) / secondHalf.length;
  
  const diff = secondPositive - firstPositive;
  
  if (diff > 0.05) return 'improving';
  if (diff < -0.05) return 'declining';
  return 'stable';
};

/**
 * Calculate sentiment score (0-10)
 */
const calculateSentimentScore = (distribution: SentimentDistribution): number => {
  const score = (distribution.positive * 10) + (distribution.neutral * 5) + (distribution.mixed * 4) + (distribution.negative * 0);
  return Math.round(score * 10) / 10;
};

/**
 * Generate AI insights based on data
 */
// REPLACE THE ENTIRE FUNCTION WITH:
const generateInsights = (
  aggregatedData: AggregatedData, 
  sentimentTrend: string, 
  emojiData: ReturnType<typeof aggregateEmojiData> | null,
  records: SentimentAnalysisData[]
) => {
  const insights = [];
  const dist = toPercentage(aggregatedData.sentiment.distribution);
  
  if (sentimentTrend === 'improving') {
    insights.push({
      type: 'positive',
      icon: TrendingUp,
      title: 'Positive Trend Detected',
      description: `Sentiment has improved across recent posts, with ${dist.positive}% positive feedback overall.`,
      time: 'Just now'
    });
  } else if (sentimentTrend === 'declining') {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Attention Needed',
      description: `Sentiment is declining. Consider addressing concerns in recent comments.`,
      time: 'Just now'
    });
  }
  
  if (aggregatedData.sentiment.confidence > 0.9) {
    insights.push({
      type: 'success',
      icon: Award,
      title: 'High Analysis Accuracy',
      description: `AI confidence is ${Math.round(aggregatedData.sentiment.confidence * 100)}%, indicating reliable sentiment detection.`,
      time: '2 hours ago'
    });
  }
  
  if (emojiData && emojiData.totalEmojiCount > 50) {
    insights.push({
      type: 'info',
      icon: Lightbulb,
      title: 'High Emoji Engagement',
      description: `${emojiData.totalEmojiCount} emojis detected across ${emojiData.uniqueEmojiCount} unique types. Consider emoji-driven content.`,
      time: '5 hours ago'
    });
  }
  
  // Check for high-risk posts using records directly
  const highRiskPosts = records.filter(r => 
    r.analysis?.risk_level === 'high' || r.analysis?.risk_level === 'critical'
  );
  if (highRiskPosts.length > 0) {
    insights.push({
      type: 'warning',
      icon: Shield,
      title: 'Risk Alert',
      description: `${highRiskPosts.length} post(s) flagged with high/critical risk. Review flagged comments.`,
      time: '1 day ago'
    });
  }
  
  if (dist.positive > 70) {
    insights.push({
      type: 'success',
      icon: Star,
      title: 'Excellent Performance',
      description: `${dist.positive}% positive sentiment exceeds typical benchmarks. Great campaign reception!`,
      time: '2 days ago'
    });
  }
  
  return insights.slice(0, 4);
};

interface NotificationProps {
  type: 'success' | 'info' | 'error';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { 
      icon: CheckCircle, 
      bgClass: 'bg-gradient-to-r from-green-500 to-emerald-500', 
      textClass: 'text-white'
    },
    info: { 
      icon: Info, 
      bgClass: 'bg-gradient-to-r from-blue-500 to-indigo-500', 
      textClass: 'text-white'
    },
    error: { 
      icon: AlertCircle, 
      bgClass: 'bg-gradient-to-r from-red-500 to-rose-500', 
      textClass: 'text-white'
    }
  };

  const { icon: Icon, bgClass, textClass } = config[type];

  return (
    <div className={`fixed top-6 right-6 z-50 ${bgClass} rounded-xl p-4 shadow-2xl max-w-md animate-slide-in-right`}>
      <div className="flex items-start">
        <Icon className={`w-5 h-5 ${textClass} mr-3 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textClass}`}>{message}</p>
        </div>
        <button 
          onClick={onClose}
          className={`ml-3 ${textClass} hover:opacity-75 text-xl font-bold`}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ============================================================
// EMOTION RADAR CHART COMPONENT
// ============================================================
interface EmotionRadarChartProps {
  sentimentMessages: PostSentimentMessages[];
}

const EmotionRadarChart: React.FC<EmotionRadarChartProps> = ({ sentimentMessages }) => {
  // Aggregate emotions from all messages
  const { topEmotions, maxCount } = useMemo(() => {
    const emotionCounts: Record<string, number> = {};
    
    sentimentMessages.forEach((post) => {
      const allMessages = [...post.positive_messages, ...post.negative_messages];
      
      allMessages.forEach(msg => {
        if (msg.dominant_emotion) {
          const emotionParts = msg.dominant_emotion.split(':');
          const emotion = emotionParts[0].trim().toLowerCase();
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }
        
        if (msg.categories) {
          Object.entries(msg.categories).forEach(([category, value]) => {
            const normalizedCategory = category.toLowerCase().replace(/[_\s]/g, '');
            if (value > 0.5) {
              emotionCounts[normalizedCategory] = (emotionCounts[normalizedCategory] || 0) + 1;
            }
          });
        }
      });
    });
    
    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);
    
    const maxVal = Math.max(...sortedEmotions.map(([, count]) => count), 1);
    
    const topEmotionsList = sortedEmotions.map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count,
      percentage: (count / maxVal) * 100,
      color: emotionColors[emotion] || emotionColors.default
    }));
    
    return { topEmotions: topEmotionsList, maxCount: maxVal };
  }, [sentimentMessages]);

  // SVG dimensions
  const width = 500;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 80;
  const levels = 5;

  const getPoint = (index: number, value: number, total: number) => {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  const gridLevels = useMemo(() => {
    const grids = [];
    for (let level = 1; level <= levels; level++) {
      const points = topEmotions.map((_, index) => {
        const point = getPoint(index, (level / levels) * 100, topEmotions.length);
        return `${point.x},${point.y}`;
      }).join(' ');
      grids.push({ level, points, value: Math.round((level / levels) * maxCount) });
    }
    return grids;
  }, [topEmotions, maxCount]);

  const axisLines = useMemo(() => {
    return topEmotions.map((emotion, index) => {
      const endPoint = getPoint(index, 100, topEmotions.length);
      return {
        x1: centerX,
        y1: centerY,
        x2: endPoint.x,
        y2: endPoint.y,
        emotion: emotion.emotion,
        color: emotion.color
      };
    });
  }, [topEmotions]);

  const labelPositions = useMemo(() => {
    return topEmotions.map((emotion, index) => {
      const point = getPoint(index, 115, topEmotions.length);
      const angle = (Math.PI * 2 * index) / topEmotions.length - Math.PI / 2;
      
      let textAnchor = 'middle';
      if (Math.cos(angle) > 0.3) textAnchor = 'start';
      else if (Math.cos(angle) < -0.3) textAnchor = 'end';
      
      return {
        x: point.x,
        y: point.y,
        emotion: emotion.emotion,
        count: emotion.count,
        color: emotion.color,
        textAnchor
      };
    });
  }, [topEmotions]);

  const aggregatedPolygon = useMemo(() => {
    if (topEmotions.length === 0) return '';
    
    return topEmotions.map((emotion, index) => {
      const point = getPoint(index, emotion.percentage, topEmotions.length);
      return `${point.x},${point.y}`;
    }).join(' ');
  }, [topEmotions]);

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      'joy': '😊', 'happiness': '😄', 'love': '❤️', 'affection': '🥰',
      'adoration': '😍', 'admiration': '👏', 'praise': '🙌', 'approval': '👍',
      'excitement': '🎉', 'celebration': '🥳', 'gratitude': '🙏', 'sadness': '😢',
      'anger': '😠', 'contempt': '😤', 'criticism': '👎', 'hate': '😡',
      'fear': '😨', 'disgust': '🤢', 'surprise': '😮', 'sarcasm': '😏',
      'accusation': '🫵', 'vengefulness': '😈'
    };
    return emojiMap[emotion.toLowerCase()] || '💬';
  };

  if (topEmotions.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No emotion data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl p-2">
            <Activity className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Emotion Radar Analysis</h2>
            <p className="text-sm text-gray-500">
              Top {topEmotions.length} emotions detected across all comments
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 flex justify-center">
          <svg 
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`}
            className="max-w-full h-auto"
          >
            <defs>
              <linearGradient id="emotionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
              </linearGradient>
              
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
              </filter>
            </defs>
            
            <circle 
              cx={centerX} 
              cy={centerY} 
              r={radius + 20} 
              fill="url(#emotionGradient)" 
              opacity="0.05"
            />
            
            {gridLevels.map((grid, idx) => (
              <g key={`grid-${idx}`}>
                <polygon
                  points={grid.points}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="1"
                  strokeDasharray={idx === levels - 1 ? "0" : "4,4"}
                />
                <text
                  x={centerX + 8}
                  y={centerY - (grid.level / levels) * radius + 4}
                  fontSize="10"
                  fill="#9CA3AF"
                  textAnchor="start"
                >
                  {grid.value}
                </text>
              </g>
            ))}
            
            {axisLines.map((axis, idx) => (
              <line
                key={`axis-${idx}`}
                x1={axis.x1}
                y1={axis.y1}
                x2={axis.x2}
                y2={axis.y2}
                stroke="#D1D5DB"
                strokeWidth="1.5"
              />
            ))}
            
            <polygon
              points={aggregatedPolygon}
              fill="url(#emotionGradient)"
              stroke="#EC4899"
              strokeWidth="3"
              filter="url(#dropShadow)"
              className="transition-all duration-500"
            />
            
            {topEmotions.map((emotion, idx) => {
              const point = getPoint(idx, emotion.percentage, topEmotions.length);
              return (
                <g key={`point-${idx}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill="white"
                    stroke={emotion.color}
                    strokeWidth="3"
                    filter="url(#glow)"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={emotion.color}
                  />
                </g>
              );
            })}
            
            {labelPositions.map((label, idx) => (
              <g key={`label-${idx}`}>
                <text
                  x={label.x}
                  y={label.y - 12}
                  fontSize="20"
                  textAnchor={label.textAnchor}
                  dominantBaseline="middle"
                >
                  {getEmotionEmoji(label.emotion)}
                </text>
                <text
                  x={label.x}
                  y={label.y + 8}
                  fontSize="12"
                  fontWeight="600"
                  fill={label.color}
                  textAnchor={label.textAnchor}
                  dominantBaseline="middle"
                >
                  {label.emotion}
                </text>
                <text
                  x={label.x}
                  y={label.y + 22}
                  fontSize="10"
                  fill="#6B7280"
                  textAnchor={label.textAnchor}
                  dominantBaseline="middle"
                >
                  ({label.count})
                </text>
              </g>
            ))}
            
            <circle cx={centerX} cy={centerY} r="4" fill="#6366F1" />
          </svg>
        </div>
        
        <div className="lg:w-64 space-y-3">
          <h3 className="font-semibold text-gray-700 mb-4">Emotion Breakdown</h3>
          {topEmotions.map((emotion, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: emotion.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <span>{getEmotionEmoji(emotion.emotion)}</span>
                    {emotion.emotion}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{emotion.count}</span>
                </div>
                <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${emotion.percentage}%`,
                      backgroundColor: emotion.color 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// FLAGGED MESSAGES MODAL COMPONENT
// ============================================================
interface FlaggedMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  postData: PostTableData;
}

const FlaggedMessagesModal: React.FC<FlaggedMessagesModalProps> = ({ isOpen, onClose, postData }) => {
  if (!isOpen) return null;
  
  const flaggedMessages = postData.flagged_messages || [];
  
  const getFlagReasonConfig = (reason: string) => {
    const configs: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
      'HARMFUL': { icon: Flame, color: 'text-red-600', bgColor: 'bg-red-100', label: 'Harmful' },
      'HATEFUL': { icon: Ban, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'Hateful' },
      'ABUSIVE': { icon: MessageSquareWarning, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Abusive' },
      'SPAM': { icon: Flag, color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Spam' },
      'INAPPROPRIATE': { icon: AlertTriangle, color: 'text-pink-600', bgColor: 'bg-pink-100', label: 'Inappropriate' }
    };
    return configs[reason] || { icon: AlertCircle, color: 'text-gray-600', bgColor: 'bg-gray-100', label: reason };
  };
  
  const getSeverityConfig = (severity: string) => {
    const configs: Record<string, { color: string; bgColor: string; borderColor: string }> = {
      'critical': { color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
      'high': { color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-300' },
      'medium': { color: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' },
      'low': { color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
      'none': { color: 'text-gray-700', bgColor: 'bg-gray-50', borderColor: 'border-gray-300' }
    };
    return configs[severity] || configs['none'];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl transform transition-all">
          <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-t-3xl px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur rounded-xl p-2.5">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Flags</h2>
                  <p className="text-red-100 text-sm">
                    Post #{postData.post_number} • @{postData.platform_info?.platform_username || 'Unknown'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">
                    <span className="text-red-600 font-bold">{flaggedMessages.length}</span> flagged comment{flaggedMessages.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    from {postData.total_comments} total comments
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  postData.risk_level === 'critical' ? 'bg-red-100 text-red-700' :
                  postData.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                  postData.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  postData.risk_level === 'low' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {postData.risk_level.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
            {flaggedMessages.length > 0 ? (
              <div className="space-y-4">
                {flaggedMessages.map((message, index) => {
                  const severityConfig = getSeverityConfig(message.severity);
                  
                  return (
                    <div 
                      key={index}
                      className={`rounded-2xl border-2 ${severityConfig.borderColor} ${severityConfig.bgColor} overflow-hidden transition-all hover:shadow-lg`}
                    >
                      <div className="px-5 py-3 bg-white/50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-700">#{index + 1}</span>
                          <div className="flex items-center gap-2">
                            {message.flag_reasons.map((reason, idx) => {
                              const config = getFlagReasonConfig(reason);
                              const ReasonIcon = config.icon;
                              return (
                                <span 
                                  key={idx}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                                >
                                  <ReasonIcon className="w-3 h-3" />
                                  {config.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Severity:</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${severityConfig.color}`}>
                            {message.severity}
                          </span>
                        </div>
                      </div>
                      
                      <div className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.severity === 'critical' ? 'bg-red-200' :
                              message.severity === 'high' ? 'bg-orange-200' :
                              message.severity === 'medium' ? 'bg-yellow-200' :
                              'bg-gray-200'
                            }`}>
                              <MessageSquareWarning className={`w-4 h-4 ${
                                message.severity === 'critical' ? 'text-red-600' :
                                message.severity === 'high' ? 'text-orange-600' :
                                message.severity === 'medium' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 text-sm leading-relaxed break-words">
                              &quot;{message.original_text || 'No text available'}&quot;
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Flagged Messages</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  {postData.flagged_count > 0 
                    ? "This post has flagged comments, but the detailed text is not available. Re-run the analysis to capture the full flagged content."
                    : "Great news! No harmful, hateful, or inappropriate content was detected in this post's comments."
                  }
                </p>
                {postData.flagged_count > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 inline-block">
                    <p className="text-amber-700 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      <span>Re-run sentiment analysis to capture flagged message details</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-b-3xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Eye className="w-4 h-4" />
              <span>Review these comments for potential moderation action</span>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all font-medium text-sm shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SENTIMENT MESSAGES SECTION COMPONENT
// ============================================================
interface SentimentMessagesSectionProps {
  sentimentMessages: PostSentimentMessages[];
}

const SentimentMessagesSection: React.FC<SentimentMessagesSectionProps> = ({ sentimentMessages }) => {
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  
  // Calculate totals
  const totalPositive = sentimentMessages.reduce((sum, p) => sum + p.positive_messages.length, 0);
  const totalNegative = sentimentMessages.reduce((sum, p) => sum + p.negative_messages.length, 0);
  
  // Get intensity badge color
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  // Get emotion emoji
  const getEmotionEmoji = (emotion: string) => {
    const lowerEmotion = emotion.toLowerCase();
    if (lowerEmotion.includes('love') || lowerEmotion.includes('adoration')) return '❤️';
    if (lowerEmotion.includes('joy') || lowerEmotion.includes('happiness')) return '😊';
    if (lowerEmotion.includes('excitement')) return '🎉';
    if (lowerEmotion.includes('admiration') || lowerEmotion.includes('praise')) return '👏';
    if (lowerEmotion.includes('gratitude')) return '🙏';
    if (lowerEmotion.includes('sadness')) return '😢';
    if (lowerEmotion.includes('anger') || lowerEmotion.includes('contempt')) return '😠';
    if (lowerEmotion.includes('fear')) return '😨';
    if (lowerEmotion.includes('disgust')) return '🤢';
    if (lowerEmotion.includes('surprise')) return '😮';
    if (lowerEmotion.includes('criticism') || lowerEmotion.includes('insult')) return '👎';
    if (lowerEmotion.includes('arrogance')) return '😤';
    return '💬';
  };

  const togglePost = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  if (totalPositive === 0 && totalNegative === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-2">
              <MessageCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Comment Sentiment Breakdown</h2>
              <p className="text-sm text-gray-500">
                {totalPositive} positive • {totalNegative} negative comments identified
              </p>
            </div>
          </div>
          
          {/* Tab Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab('positive')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeTab === 'positive'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              Positive ({totalPositive})
            </button>
            
            <button
              onClick={() => setActiveTab('negative')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                activeTab === 'negative'
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              Negative ({totalNegative})
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        <div className="space-y-4">
          {sentimentMessages.map((post) => {
            const messages = activeTab === 'positive' ? post.positive_messages : post.negative_messages;
            const isExpanded = expandedPost === post.post_id;
            const hasMessages = messages.length > 0;
            
            if (!hasMessages) return null;
            
            return (
              <div 
                key={post.post_id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  activeTab === 'positive' 
                    ? 'border-green-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50' 
                    : 'border-red-200 bg-gradient-to-r from-red-50/50 to-rose-50/50'
                }`}
              >
                              {/* Post Header - Clickable */}
              <button
                onClick={() => togglePost(post.post_id)}
                className="w-full px-3 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Post Thumbnail Image */}
                  {post.platform_info?.thumbnail_url ? (
                    <img 
                      src={post.platform_info.thumbnail_url}
                      alt="Post thumbnail"
                      className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Username & Info */}
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900 text-sm truncate max-w-[100px]">
                        {post.platform_info?.platform_username 
                          ? `@${post.platform_info.platform_username}` 
                          : `Post #${post.post_number}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === 'positive' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {messages.length}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {post.total_comments} comments
                    </span>
                  </div>
                </div>
                  
                  <div className="flex items-center gap-3">
                    {post.platform_info?.content_url && (
                      <a
                        href={post.platform_info.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-500 hover:text-indigo-700 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {/* Expanded Messages */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3">
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`rounded-xl p-4 border ${
                          activeTab === 'positive'
                            ? 'bg-white border-green-100'
                            : 'bg-white border-red-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Emotion Emoji */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                            activeTab === 'positive' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {getEmotionEmoji(msg.dominant_emotion)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Message Text */}
                            <p className="text-gray-800 text-sm leading-relaxed mb-2">
                              &quot;{msg.original_text}&quot;
                            </p>
                            
                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Dominant Emotion */}
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                activeTab === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {msg.dominant_emotion.split(':')[0].trim()}
                              </span>
                              
                              {/* Intensity */}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getIntensityColor(msg.intensity)}`}>
                                {msg.intensity} intensity
                              </span>
                              
                              {/* Confidence */}
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {Math.round(msg.confidence * 100)}% confidence
                              </span>
                              
                              {/* Categories */}
                              {Object.entries(msg.categories).slice(0, 2).map(([cat]) => (
                                <span 
                                  key={cat}
                                  className="px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-600"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Empty State */}
          {sentimentMessages.filter(p => 
            (activeTab === 'positive' ? p.positive_messages : p.negative_messages).length > 0
          ).length === 0 && (
            <div className="text-center py-12">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                activeTab === 'positive' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {activeTab === 'positive' ? (
                  <Smile className="w-8 h-8 text-green-500" />
                ) : (
                  <Frown className="w-8 h-8 text-red-500" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No {activeTab === 'positive' ? 'Positive' : 'Negative'} Comments Found
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {activeTab === 'positive' 
                  ? "No comments were classified as positive in this analysis."
                  : "Great news! No negative comments were detected in this campaign."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ELLIPTICAL WORD CLOUD - BIGGER & MORE UNIFORM SIZES
// ============================================================
interface EllipticalWordCloudProps {
  words: Array<{ word: string; count: number }>;
  mode: 'common' | 'unique';
}

const EllipticalWordCloud: React.FC<EllipticalWordCloudProps> = ({ words, mode }) => {
  const width = 700;
  const height = 420; // INCREASED from 380
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = width * 0.47;
  const radiusY = height * 0.46;

  const colors = mode === 'common' 
    ? ['#1e3a8a', '#1e40af', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#1e3a8a', '#1d4ed8']
    : ['#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#5b21b6', '#7c3aed'];

  const wordPositions = useMemo(() => {
    if (words.length === 0) return [];

    const maxCount = Math.max(...words.map(w => w.count));
    const minCount = Math.min(...words.map(w => w.count));
    const totalWords = words.length;

    // MORE UNIFORM SIZES - smaller difference between min and max
    const getFontSize = (count: number): number => {
      if (maxCount === minCount) return 32;
      const ratio = (count - minCount) / (maxCount - minCount);
      
      let minSize, maxSize;

      if (totalWords <= 30) {
        minSize = 24;
        maxSize = 75;
      } else if (totalWords <= 60) {
        minSize = 20;
        maxSize = 68;
      } else if (totalWords <= 100) {
        minSize = 17;
        maxSize = 60;
      } else {
        minSize = 14;
        maxSize = 52;
      }
      
      // Use power of 0.35 for more uniform distribution
      return Math.round(minSize + (maxSize - minSize) * Math.pow(ratio, 0.35));
    };

    const getTextWidth = (text: string, fontSize: number): number => {
      return text.length * fontSize * 0.55;
    };

    const isInsideEllipse = (x: number, y: number, padding: number = 0): boolean => {
      const dx = (x - centerX) / (radiusX - padding);
      const dy = (y - centerY) / (radiusY - padding);
      return (dx * dx + dy * dy) <= 1;
    };

    const placedBoxes: Array<{ x: number; y: number; width: number; height: number }> = [];

    const checkCollision = (x: number, y: number, w: number, h: number): boolean => {
      for (const box of placedBoxes) {
        const overlapX = Math.abs(x - box.x) < (w + box.width) / 2 + 4;
        const overlapY = Math.abs(y - box.y) < (h + box.height) / 2 + 2;
        if (overlapX && overlapY) return true;
      }
      return false;
    };

    const sortedWords = [...words].sort((a, b) => b.count - a.count);
    const positions: Array<{
      word: string;
      count: number;
      x: number;
      y: number;
      fontSize: number;
      color: string;
    }> = [];

    sortedWords.forEach((wordObj, index) => {
      const fontSize = getFontSize(wordObj.count);
      const textWidth = getTextWidth(wordObj.word, fontSize);
      const textHeight = fontSize * 1.2;
      const color = colors[index % colors.length];

      let placed = false;
      let spiralAngle = (index * 2.39996322) % (Math.PI * 2);
      let spiralRadius = index === 0 ? 0 : 18;
      
      for (let attempt = 0; attempt < 1500 && !placed; attempt++) {
        const x = centerX + spiralRadius * Math.cos(spiralAngle) * (radiusX / radiusY) * 0.94;
        const y = centerY + spiralRadius * Math.sin(spiralAngle) * 0.94;

        const halfW = textWidth / 2;
        const halfH = textHeight / 2;
        const corners = [
          { x: x - halfW, y: y - halfH },
          { x: x + halfW, y: y - halfH },
          { x: x - halfW, y: y + halfH },
          { x: x + halfW, y: y + halfH }
        ];

        const allInside = corners.every(c => isInsideEllipse(c.x, c.y, 15));

        if (allInside && !checkCollision(x, y, textWidth, textHeight)) {
          placedBoxes.push({ x, y, width: textWidth, height: textHeight });
          positions.push({
            word: wordObj.word,
            count: wordObj.count,
            x,
            y,
            fontSize,
            color
          });
          placed = true;
        }

        spiralAngle += 0.2 + (0.06 / (attempt + 1));
        spiralRadius += 2.8;
      }
    });

    return positions;
  }, [words, mode, colors, centerX, centerY, radiusX, radiusY]);

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-400">
        <div className="text-center">
          <Hash className="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No words to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={radiusX}
          ry={radiusY}
          fill={mode === 'common' ? 'rgba(59, 130, 246, 0.03)' : 'rgba(139, 92, 246, 0.03)'}
          stroke="none"
        />
        
        {wordPositions.map((pos, index) => (
          <text
            key={`${pos.word}-${index}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={pos.color}
            fontSize={pos.fontSize}
            fontWeight={pos.fontSize > 40 ? 700 : pos.fontSize > 25 ? 600 : 500}
            fontFamily="'Inter', 'Segoe UI', system-ui, sans-serif"
            style={{ 
              cursor: 'default',
              userSelect: 'none'
            }}
          >
            <title>{pos.word}: {pos.count} times</title>
            {pos.word}
          </text>
        ))}
      </svg>
    </div>
  );
};
// ============================================================
// ============================================================
// WORD CLOUD SECTION COMPONENT - WITH EMOJI CLOUD
// ============================================================
// ============================================================
// WORD CLOUD SECTION COMPONENT - FIXED VERSION
// ============================================================
interface WordCloudSectionProps {
  postTableData: PostTableData[];
  emojiData: ReturnType<typeof aggregateEmojiData> | null;
}

const WordCloudSection: React.FC<WordCloudSectionProps> = ({ postTableData, emojiData }) => {
  const [viewMode, setViewMode] = useState<'common' | 'unique'>('common');
  
  const aggregatedWords = useMemo(() => {
    const wordCounts: Record<string, number> = {};
    let totalWords = 0;
    
    postTableData.forEach(post => {
      if (post.common_words) {
        post.common_words.most_common.forEach(item => {
          wordCounts[item.word] = (wordCounts[item.word] || 0) + item.count;
          totalWords += item.count;
        });
        post.common_words.most_unique.forEach(item => {
          if (!wordCounts[item.word]) {
            wordCounts[item.word] = item.count;
          }
        });
      }
    });
    
    const sortedWords = Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      most_common: sortedWords.slice(0, 100),
      most_unique: sortedWords.length > 50 
        ? sortedWords.slice(-100).reverse() 
        : sortedWords.slice().reverse(),
      total_words: totalWords,
      unique_count: Object.keys(wordCounts).length
    };
  }, [postTableData]);
  
  const currentWords = viewMode === 'common' 
    ? aggregatedWords.most_common 
    : aggregatedWords.most_unique;
  
  if (aggregatedWords.total_words === 0 && (!emojiData || emojiData.totalEmojiCount === 0)) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-shadow duration-300">
      {/* Header - Buttons on LEFT, Title on RIGHT */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Buttons - LEFT side */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
          <button
            onClick={() => setViewMode('common')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
              viewMode === 'common'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Most Common
          </button>
          
          <button
            onClick={() => setViewMode('unique')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
              viewMode === 'unique'
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Most Unique
          </button>
        </div>

        {/* Title - RIGHT side */}
      
        
      </div>
      
      {/* Side by Side: Word Cloud + Emoji Cloud - 50/50 split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Word Cloud */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Type className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-700">Word Cloud</h3>
          </div>
          <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50/50 to-white" style={{ minHeight: '420px' }}>
            <EllipticalWordCloud words={currentWords} mode={viewMode} />
          </div>
        </div>
        
        {/* Emoji Cloud */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <h3 className="text-sm font-semibold text-gray-700">Emoji Cloud</h3>
          
          </div>
          <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50/50 to-white" style={{ minHeight: '420px' }}>
            {emojiData && emojiData.topEmojis.length > 0 ? (
              <EllipticalEmojiCloud emojis={emojiData.topEmojis} />
            ) : (
              <div className="flex items-center justify-center h-[380px] text-gray-400">
                <div className="text-center">
                  <span className="text-5xl mb-2 block">😶</span>
                  <p className="text-sm">No emojis found</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ELLIPTICAL EMOJI CLOUD - BIGGER & MORE UNIFORM SIZES
// ============================================================
interface EllipticalEmojiCloudProps {
  emojis: Array<[string, number]>; // [emoji, count]
}

const EllipticalEmojiCloud: React.FC<EllipticalEmojiCloudProps> = ({ emojis }) => {
  const width = 700;
  const height = 420; // INCREASED from 400
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusX = width * 0.47;
  const radiusY = height * 0.46;

  const emojiPositions = useMemo(() => {
    if (emojis.length === 0) return [];

    const maxCount = Math.max(...emojis.map(([, count]) => count));
    const minCount = Math.min(...emojis.map(([, count]) => count));
    const totalEmojis = emojis.length;

    // MORE UNIFORM SIZES - smaller difference between min and max
        const getFontSize = (count: number): number => {
      if (maxCount === minCount) return 52;
      const ratio = (count - minCount) / (maxCount - minCount);
      
      let minSize, maxSize;
      if (totalEmojis <= 15) {
        minSize = 55;
        maxSize = 100;
      } else if (totalEmojis <= 30) {
        minSize = 45;
        maxSize = 85;
      } else if (totalEmojis <= 50) {
        minSize = 38;
        maxSize = 70;
      } else {
        minSize = 30;
        maxSize = 58;
      }
      
      return Math.round(minSize + (maxSize - minSize) * Math.pow(ratio, 0.3));
    };

    const getEmojiSize = (fontSize: number) => ({
      width: fontSize * 1.15,
      height: fontSize * 1.15
    });

    const isInsideEllipse = (x: number, y: number, padding: number = 0): boolean => {
      const dx = (x - centerX) / (radiusX - padding);
      const dy = (y - centerY) / (radiusY - padding);
      return (dx * dx + dy * dy) <= 1;
    };

    const placedBoxes: Array<{ x: number; y: number; width: number; height: number }> = [];

    const checkCollision = (x: number, y: number, w: number, h: number): boolean => {
      const padding = 6;
      for (const box of placedBoxes) {
        const overlapX = Math.abs(x - box.x) < (w + box.width) / 2 + padding;
        const overlapY = Math.abs(y - box.y) < (h + box.height) / 2 + padding;
        if (overlapX && overlapY) return true;
      }
      return false;
    };

    const sortedEmojis = [...emojis].sort((a, b) => b[1] - a[1]);

    const result: Array<{
      emoji: string;
      count: number;
      x: number;
      y: number;
      fontSize: number;
    }> = [];

    sortedEmojis.forEach((emojiData, index) => {
      const [emoji, count] = emojiData;
      const fontSize = getFontSize(count);
      const size = getEmojiSize(fontSize);

      let placed = false;
      let finalX = centerX;
      let finalY = centerY;

      const goldenAngle = 2.39996322;
      let spiralAngle = index * goldenAngle;
      let spiralRadius = index === 0 ? 0 : 30;

      for (let attempt = 0; attempt < 2500 && !placed; attempt++) {
        const x = centerX + spiralRadius * Math.cos(spiralAngle) * (radiusX / Math.max(radiusX, radiusY));
        const y = centerY + spiralRadius * Math.sin(spiralAngle) * (radiusY / Math.max(radiusX, radiusY));

        const halfW = size.width / 2;
        const halfH = size.height / 2;
        const allInside = isInsideEllipse(x - halfW, y - halfH, 20) &&
                          isInsideEllipse(x + halfW, y - halfH, 20) &&
                          isInsideEllipse(x - halfW, y + halfH, 20) &&
                          isInsideEllipse(x + halfW, y + halfH, 20);

        if (allInside && !checkCollision(x, y, size.width, size.height)) {
          finalX = x;
          finalY = y;
          placed = true;
        }

        spiralAngle += 0.25 + (0.08 / (attempt + 1));
        spiralRadius += 2.2;
      }

      if (!placed) {
        for (let r = 0; r <= 1; r += 0.08) {
          for (let angle = 0; angle < Math.PI * 2; angle += 0.15) {
            const x = centerX + radiusX * r * Math.cos(angle) * 0.88;
            const y = centerY + radiusY * r * Math.sin(angle) * 0.88;
            
            if (isInsideEllipse(x, y, 25) && !checkCollision(x, y, size.width, size.height)) {
              finalX = x;
              finalY = y;
              placed = true;
              break;
            }
          }
          if (placed) break;
        }
      }

      placedBoxes.push({ x: finalX, y: finalY, width: size.width, height: size.height });
      result.push({
        emoji,
        count,
        x: finalX,
        y: finalY,
        fontSize
      });
    });

    return result;
  }, [emojis, centerX, centerY, radiusX, radiusY]);

  if (emojis.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-400">
        <div className="text-center">
          <span className="text-6xl mb-3 block">😶</span>
          <p className="text-lg">No emojis to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
      <svg 
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={radiusX}
          ry={radiusY}
          fill="rgba(236, 72, 153, 0.02)"
          stroke="none"
        />
        
        {emojiPositions.map((pos, index) => (
          <text
            key={`emoji-${index}-${pos.emoji}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={pos.fontSize}
            fontFamily="'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"
            style={{ 
              cursor: 'default',
              userSelect: 'none'
            }}
          >
            <title>{pos.emoji}: {pos.count} times</title>
            {pos.emoji}
          </text>
        ))}
      </svg>
      
      <div className="absolute bottom-2 right-3 text-xs text-gray-400">
        {emojiPositions.length}/{emojis.length} emojis
      </div>
    </div>
  );
};

// Sentiment Gauge Component
const SentimentGauge: React.FC<{ 
  score: number; 
  distribution?: SentimentDistribution;
}> = ({ score, distribution }) => {
  const needleAngle = ((score / 10) * 180) - 90;
  
  return (
    <div className="relative flex flex-col items-center">
      <svg 
        viewBox="0 0 200 130" 
        className="w-full max-w-[280px]"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="gaugeGradientArc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="25%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="75%" stopColor="#84CC16" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          
          <filter id="arcShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/>
          </filter>
          
          <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <path 
          d="M 20 100 A 80 80 0 0 1 180 100" 
          fill="none" 
          stroke="#E5E7EB" 
          strokeWidth="20" 
          strokeLinecap="round"
        />
        
        <path 
          d="M 20 100 A 80 80 0 0 1 180 100" 
          fill="none" 
          stroke="url(#gaugeGradientArc)" 
          strokeWidth="20" 
          strokeLinecap="round"
          filter="url(#arcShadow)"
        />
        
        <circle cx="100" cy="100" r="12" fill="#6366F1" filter="url(#needleGlow)"/>
        <circle cx="100" cy="100" r="8" fill="#818CF8"/>
        <circle cx="100" cy="100" r="4" fill="white"/>
        
        <g transform={`rotate(${needleAngle} 100 100)`}>
          <line 
            x1="100" y1="100" x2="100" y2="35" 
            stroke="rgba(0,0,0,0.2)" strokeWidth="6" strokeLinecap="round"
            transform="translate(2, 2)"
          />
          <line 
            x1="100" y1="100" x2="100" y2="35" 
            stroke="#4F46E5" strokeWidth="6" strokeLinecap="round"
            filter="url(#needleGlow)"
          />
          <line 
            x1="100" y1="98" x2="100" y2="40" 
            stroke="#6366F1" strokeWidth="3" strokeLinecap="round"
          />
          <polygon points="100,25 94,45 106,45" fill="#4F46E5" filter="url(#needleGlow)"/>
        </g>
      </svg>
      
      <div className="mt-2 text-center">
        <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {score.toFixed(1)}
        </div>
        <div className="text-sm text-gray-500 font-medium">Sentiment Score</div>
      </div>
      
      {/* Formula Display - Small & Compact
      {distribution && (
        <div className="mt-4 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 w-full max-w-[280px]">
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">How we calculate</span>
          </div>
          <div className="text-[11px] text-gray-600 font-mono leading-relaxed">
            <span className="text-green-600">{Math.round(distribution.positive * 100)}%</span>
            <span className="text-gray-400">×10</span>
            <span className="mx-1">+</span>
            <span className="text-gray-500">{Math.round(distribution.neutral * 100)}%</span>
            <span className="text-gray-400">×5</span>
            <span className="mx-1">+</span>
            <span className="text-yellow-600">{Math.round(distribution.mixed * 100)}%</span>
            <span className="text-gray-400">×4</span>
            <span className="mx-1">+</span>
            <span className="text-red-600">{Math.round(distribution.negative * 100)}%</span>
            <span className="text-gray-400">×0</span>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-indigo-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-500">= Score</span>
            <span className="text-sm font-bold text-indigo-600">{score.toFixed(1)}/10</span>
          </div>
        </div>
      )} */}
    </div>
  );
};

// Stats Card Component
const StatsCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';
  compact?: boolean;
}> = ({ title, value, subtitle, icon: Icon, trend, color, compact = false }) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-violet-600',
    orange: 'from-orange-500 to-amber-600',
    red: 'from-red-500 to-rose-600',
    gray: 'from-gray-500 to-slate-600'
  };
  
  const bgClasses = {
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    red: 'bg-red-50',
    gray: 'bg-gray-50'
  };
  
  const iconBgClasses = {
    green: 'bg-gradient-to-br from-green-400 to-emerald-500',
    blue: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    purple: 'bg-gradient-to-br from-purple-400 to-violet-500',
    orange: 'bg-gradient-to-br from-orange-400 to-amber-500',
    red: 'bg-gradient-to-br from-red-400 to-rose-500',
    gray: 'bg-gradient-to-br from-gray-400 to-slate-500'
  };

  if (compact) {
    return (
      <div className={`${bgClasses[color]} rounded-xl p-4 border border-${color}-100 hover:shadow-md transition-all duration-300 group`}>
        <div className="flex items-center gap-3">
          <div className={`${iconBgClasses[color]} rounded-lg p-2 shadow-md group-hover:scale-105 transition-transform duration-300`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-600 text-xs font-medium truncate">{title}</h3>
              {trend && (
                <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            <p className={`text-xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
              {value}
            </p>
            {subtitle && <p className="text-gray-500 text-[10px] truncate">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClasses[color]} rounded-2xl p-6 border border-${color}-100 hover:shadow-lg transition-all duration-300 group`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`${iconBgClasses[color]} rounded-xl p-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
        {value}
      </p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
};

// Emoji Card Component
const EmojiCard: React.FC<{
  emoji: string;
  count: number;
  rank: number;
  percentage: number;
}> = ({ emoji, count, rank, percentage }) => {
  const getBadgeColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-500';
    if (rank === 2) return 'from-gray-300 to-slate-400';
    if (rank === 3) return 'from-orange-400 to-amber-600';
    return 'from-blue-400 to-indigo-500';
  };

  return (
    <div className="relative bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100 overflow-hidden">
      {rank <= 3 && (
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br ${getBadgeColor(rank)} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
          {rank}
        </div>
      )}
      <div 
        className="mb-3 group-hover:scale-110 transition-transform duration-300 text-center leading-none"
        style={{ fontSize: '4rem' }}
      >
        {emoji}
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-gray-800">{count.toLocaleString()}</div>
        <div className="text-sm text-gray-500">{percentage.toFixed(1)}%</div>
      </div>
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(percentage * 2, 100)}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================
// RIGHT COLUMN SENTIMENT MESSAGES COMPONENT (Replaces AI Insights)
// ============================================================
interface RightColumnSentimentMessagesProps {
  sentimentMessages: PostSentimentMessages[];
}

const RightColumnSentimentMessages: React.FC<RightColumnSentimentMessagesProps> = ({ sentimentMessages }) => {
  const [activeTab, setActiveTab] = useState<'positive' | 'negative'>('positive');
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  
  // Calculate totals
  const totalPositive = sentimentMessages.reduce((sum, p) => sum + p.positive_messages.length, 0);
  const totalNegative = sentimentMessages.reduce((sum, p) => sum + p.negative_messages.length, 0);
  
  // Get emotion emoji
  const getEmotionEmoji = (emotion: string) => {
    const lowerEmotion = emotion.toLowerCase();
    if (lowerEmotion.includes('love') || lowerEmotion.includes('adoration')) return '❤️';
    if (lowerEmotion.includes('joy') || lowerEmotion.includes('happiness')) return '😊';
    if (lowerEmotion.includes('excitement')) return '🎉';
    if (lowerEmotion.includes('admiration') || lowerEmotion.includes('praise')) return '👏';
    if (lowerEmotion.includes('gratitude')) return '🙏';
    if (lowerEmotion.includes('sadness')) return '😢';
    if (lowerEmotion.includes('anger') || lowerEmotion.includes('contempt')) return '😠';
    if (lowerEmotion.includes('fear')) return '😨';
    if (lowerEmotion.includes('disgust')) return '🤢';
    if (lowerEmotion.includes('surprise')) return '😮';
    if (lowerEmotion.includes('criticism') || lowerEmotion.includes('insult')) return '👎';
    if (lowerEmotion.includes('arrogance')) return '😤';
    return '💬';
  };

  const togglePost = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  if (totalPositive === 0 && totalNegative === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No sentiment messages available</p>
        </div>
      </div>
    );
  }

  return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col w-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg p-2">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Comment Sentiment</h3>
            {/* <p className="text-xs text-gray-500">
              {totalPositive} positive • {totalNegative} negative
            </p> */}
          </div>
        </div>
        
        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('positive')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs transition-all duration-300 ${
              activeTab === 'positive'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Positive ({totalPositive})
          </button>
          
          <button
            onClick={() => setActiveTab('negative')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-medium text-xs transition-all duration-300 ${
              activeTab === 'negative'
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            Negative ({totalNegative})
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-3">
          {sentimentMessages.map((post) => {
            const messages = activeTab === 'positive' ? post.positive_messages : post.negative_messages;
            const isExpanded = expandedPost === post.post_id;
            const hasMessages = messages.length > 0;
            
            if (!hasMessages) return null;
            
            return (
              <div 
                key={post.post_id}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  activeTab === 'positive' 
                    ? 'border-green-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50' 
                    : 'border-red-200 bg-gradient-to-r from-red-50/50 to-rose-50/50'
                }`}
              >
                {/* Post Header - Clickable */}
            <button
              onClick={() => togglePost(post.post_id)}
              className="w-full px-3 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Post Thumbnail Image */}
                {post.platform_info?.thumbnail_url ? (
                  <img 
                    src={post.platform_info.thumbnail_url}
                    alt="Post thumbnail"
                    className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-md flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                
                {/* Username & Info */}
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 text-sm truncate max-w-[100px]">
                      {post.platform_info?.platform_username 
                        ? `@${post.platform_info.platform_username}` 
                        : `Post #${post.post_number}`}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === 'positive' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {messages.length}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {post.total_comments} comments
                  </span>
                </div>
              </div>
                  
                  <div className="flex items-center gap-2">
                    {post.platform_info?.content_url && (
                      <a
                        href={post.platform_info.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>
                
                {/* Expanded Messages */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {messages.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`rounded-lg p-3 border ${
                          activeTab === 'positive'
                            ? 'bg-white border-green-100'
                            : 'bg-white border-red-100'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {/* Emotion Emoji */}
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                            activeTab === 'positive' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {getEmotionEmoji(msg.dominant_emotion)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {/* Message Text */}
                            <p className="text-gray-800 text-xs leading-relaxed line-clamp-2">
                              &quot;{msg.original_text}&quot;
                            </p>
                            
                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-1 mt-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                activeTab === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {msg.dominant_emotion.split(':')[0].trim()}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                {Math.round(msg.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Empty State */}
          {sentimentMessages.filter(p => 
            (activeTab === 'positive' ? p.positive_messages : p.negative_messages).length > 0
          ).length === 0 && (
            <div className="text-center py-8">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                activeTab === 'positive' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {activeTab === 'positive' ? (
                  <Smile className="w-6 h-6 text-green-500" />
                ) : (
                  <Frown className="w-6 h-6 text-red-500" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                No {activeTab === 'positive' ? 'Positive' : 'Negative'} Comments
              </h4>
              <p className="text-gray-500 text-xs">
                {activeTab === 'positive' 
                  ? "No positive comments found."
                  : "Great! No negative comments."
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Emoji Sentiment Visualization Component
const EmojiSentimentVisualization: React.FC<{
  data: { positive: number; neutral: number; negative: number; none: number };
}> = ({ data }) => {
  const normalized = normalizeEmojiDistribution(data);
  
  const sentimentItems = [
    {
      key: 'positive',
      label: 'Happy & Positive',
      description: 'Joy, love, celebration',
      examples: '😊 ❤️ 🎉 👏 🙌',
      value: normalized.positive,
      gradient: 'from-green-400 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500',
      textColor: 'text-green-700'
    },
    {
      key: 'neutral',
      label: 'Neutral & Casual',
      description: 'No strong emotion',
      examples: '😐 🤔 👀 💭 📌',
      value: normalized.neutral,
      gradient: 'from-blue-400 via-indigo-500 to-violet-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      textColor: 'text-blue-700'
    },
    {
      key: 'negative',
      label: 'Sad & Negative',
      description: 'Disappointment, anger',
      examples: '😞 😢 😡 💔 👎',
      value: normalized.negative,
      gradient: 'from-red-400 via-rose-500 to-pink-500',
      bgGradient: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-gradient-to-br from-red-400 to-rose-500',
      textColor: 'text-red-700'
    },
    {
      key: 'none',
      label: 'No Emotion',
      description: 'Symbols, objects',
      examples: '📱 🔗 ⭐ 🏠 📸',
      value: normalized.none,
      gradient: 'from-gray-400 via-slate-500 to-zinc-500',
      bgGradient: 'from-gray-50 to-slate-50',
      borderColor: 'border-gray-200',
      iconBg: 'bg-gradient-to-br from-gray-400 to-slate-500',
      textColor: 'text-gray-700'
    }
  ];

  return (
    <div className="h-full flex flex-col justify-between gap-3">
      {sentimentItems.map((item) => (
        <div
          key={item.key}
          className={`relative overflow-hidden rounded-xl border ${item.borderColor} bg-gradient-to-r ${item.bgGradient} p-4 transition-all duration-300 hover:shadow-md group flex-1 flex items-center`}
        >
          <div className="flex items-center gap-3 w-full">
            <div className={`${item.iconBg} rounded-lg p-2 shadow-md group-hover:scale-105 transition-transform duration-300`}>
              <span className="text-xl">{item.examples.split(' ')[0]}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className={`font-bold text-sm ${item.textColor}`}>{item.label}</h4>
                <span className={`text-xl font-bold ${item.textColor}`}>{item.value}%</span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{item.description}</p>
              
              <div className="relative h-2 bg-white/60 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="absolute -right-2 -bottom-2 opacity-10 text-5xl transform rotate-12 group-hover:scale-110 transition-transform duration-300">
            {item.examples.split(' ')[0]}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// SENTIMENT BY INFLUENCER CHART COMPONENT - VERTICAL CANDLESTICK
// ============================================================
interface SentimentByInfluencerChartProps {
  data: PostTableData[];
  sentimentMessages: PostSentimentMessages[];
}

const SentimentByInfluencerChart: React.FC<SentimentByInfluencerChartProps> = ({ data, sentimentMessages }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const paginatedData = data.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  // Get sentiment counts and percentages for a post
  const getSentimentData = (postId: string, totalComments: number) => {
    const postMessages = sentimentMessages.find(p => p.post_id === postId);
    
    if (!postMessages || totalComments === 0) {
      return {
        positive: { count: 0, percent: 0 },
        negative: { count: 0, percent: 0 },
        neutral: { count: 0, percent: 0 },
        mixed: { count: 0, percent: 0 },
        total: 0
      };
    }
    
    const positiveCount = postMessages.positive_messages.length;
    const negativeCount = postMessages.negative_messages.length;
    // Neutral + Mixed = remaining comments
    const remainingCount = Math.max(0, totalComments - positiveCount - negativeCount);
    // Split remaining into neutral (70%) and mixed (30%) for visualization
    const neutralCount = Math.round(remainingCount * 0.7);
    const mixedCount = remainingCount - neutralCount;
    
    return {
      positive: { 
        count: positiveCount, 
        percent: (positiveCount / totalComments) * 100 
      },
      negative: { 
        count: negativeCount, 
        percent: (negativeCount / totalComments) * 100 
      },
      neutral: { 
        count: neutralCount, 
        percent: (neutralCount / totalComments) * 100 
      },
      mixed: { 
        count: mixedCount, 
        percent: (mixedCount / totalComments) * 100 
      },
      total: totalComments
    };
  };
  
  // Dynamic bar width based on number of items
  const getBarWidth = (isHovered: boolean) => {
    const count = paginatedData.length;
    if (count <= 2) {
      return isHovered ? '80px' : '60px';
    } else if (count <= 4) {
      return isHovered ? '70px' : '50px';
    } else if (count <= 6) {
      return isHovered ? '55px' : '40px';
    } else {
      return isHovered ? '50px' : '35px';
    }
  };

  // Dynamic thumbnail size based on number of items
  const getThumbnailSize = (isHovered: boolean) => {
    const count = paginatedData.length;
    if (count <= 2) {
      return isHovered ? 'w-16 h-16' : 'w-12 h-12';
    } else if (count <= 4) {
      return isHovered ? 'w-14 h-14' : 'w-10 h-10';
    } else {
      return isHovered ? 'w-12 h-12' : 'w-8 h-8';
    }
  };
  
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl p-2">
            <BarChart3 className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sentiment by Influencer</h2>
            <p className="text-sm text-gray-500">
              {data.length} influencer{data.length !== 1 ? 's' : ''} analyzed
            </p>
          </div>
        </div>
        
        {/* Legend */}
<div className="hidden md:flex items-center gap-4 mr-4">
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-green-400 to-emerald-500"></div>
    <span className="text-xs text-gray-600">Positive</span>
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-400 to-rose-500"></div>
    <span className="text-xs text-gray-600">Negative</span>
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-yellow-400 to-amber-500"></div>
    <span className="text-xs text-gray-600">Mixed</span>
  </div>
  <div className="flex items-center gap-1.5">
    <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-gray-300 to-gray-400"></div>
    <span className="text-xs text-gray-600">Neutral</span>
  </div>
</div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 font-medium px-3">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Vertical Stacked Bar Chart Container */}
      <div className="relative h-[420px] bg-gradient-to-b from-gray-50/50 to-white rounded-2xl border border-gray-100 overflow-visible pb-8">
        
        {/* Y-axis labels */}
        <div className="absolute left-2 top-8 bottom-16 w-10 flex flex-col justify-between text-[11px] text-gray-400 font-medium">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        
        {/* Grid lines */}
        <div className="absolute left-14 right-6 top-8 bottom-16 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-t border-dashed border-gray-200 w-full"></div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="absolute left-14 right-6 top-8 bottom-16 flex items-end justify-center gap-8">
          {paginatedData.map((post, index) => {
            const sentiment = getSentimentData(post.post_id, post.total_comments);
            const isHovered = hoveredBar === index;
            const username = post.platform_info?.platform_username;
            
            // Calculate the total height as 100% always (stacked bar fills entire height)
            const barHeight = 100; // Full height, segments will divide it
            
            return (
              <div 
                key={post.post_id}
                className="relative flex flex-col items-center h-full"
                style={{ 
                  width: getBarWidth(isHovered),
                  transition: 'width 0.3s ease'
                }}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Post Thumbnail - Above the bar */}
                {post.platform_info?.thumbnail_url && (
                  <div 
                    className={`absolute z-20 transition-all duration-300 ease-out ${getThumbnailSize(isHovered)}`}
                    style={{ 
                      top: '-8px',
                      transform: 'translateY(-100%)'
                    }}
                  >
                    <a 
                      href={post.platform_info.content_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-full"
                      title="View Post"
                    >
                      <img 
                        src={post.platform_info.thumbnail_url} 
                        alt="Post"
                        className={`w-full h-full rounded-lg object-cover border-2 shadow-lg transition-all duration-300 ${
                          isHovered ? 'border-indigo-400 shadow-xl' : 'border-white shadow-md'
                        }`}
                      />
                      {isHovered && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                          <ExternalLink className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </a>
                  </div>
                )}

                {/* The Stacked Vertical Bar */}
              <div 
  className="absolute bottom-0 rounded-t-lg transition-all duration-300 ease-out cursor-pointer overflow-hidden flex flex-col-reverse"
  style={{ 
    height: `${barHeight}%`,
    width: getBarWidth(isHovered),
    boxShadow: isHovered 
      ? '0 -4px 20px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.2)' 
      : '0 2px 8px rgba(0,0,0,0.1)',
  }}
>
                {/* 1. Positive Segment (Bottom - Green) */}
                <div 
                  className="w-full bg-gradient-to-t from-green-500 to-emerald-400 transition-all duration-500 relative"
                  style={{ height: `${sentiment.positive.percent}%` }}
                  title={`Positive: ${sentiment.positive.percent.toFixed(1)}%`}
                >
                  {sentiment.positive.percent > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold drop-shadow-md">
                        {Math.round(sentiment.positive.percent)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 2. Negative Segment (Red) - MOVED UP */}
                <div 
                  className="w-full bg-gradient-to-t from-red-500 to-rose-400 transition-all duration-500 relative"
                  style={{ height: `${sentiment.negative.percent}%` }}
                  title={`Negative: ${sentiment.negative.percent.toFixed(1)}%`}
                >
                  {sentiment.negative.percent > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold drop-shadow-md">
                        {Math.round(sentiment.negative.percent)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 3. Mixed Segment (Yellow/Amber) */}
                <div 
                  className="w-full bg-gradient-to-t from-yellow-500 to-amber-400 transition-all duration-500 relative"
                  style={{ height: `${sentiment.mixed.percent}%` }}
                  title={`Mixed: ${sentiment.mixed.percent.toFixed(1)}%`}
                >
                  {sentiment.mixed.percent > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold drop-shadow-md">
                        {Math.round(sentiment.mixed.percent)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 4. Neutral Segment (Top - Gray) - MOVED TO TOP */}
                <div 
                  className="w-full bg-gradient-to-t from-gray-400 to-gray-300 transition-all duration-500 relative rounded-t-lg"
                  style={{ height: `${sentiment.neutral.percent}%` }}
                  title={`Neutral: ${sentiment.neutral.percent.toFixed(1)}%`}
                >
                  {sentiment.neutral.percent > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-bold drop-shadow-md">
                        {Math.round(sentiment.neutral.percent)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 rounded-t-lg overflow-hidden pointer-events-none">
                  <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-white/20 to-transparent"></div>
                </div>
              </div>

                {/* Username label below bar */}
                {/* Username label below bar - TILTED, starts from @ directly under bar center */}
               {/* Posted date label below bar - TILTED */}
                      {/* Posted date label below bar - TILTED with "Posted at" label */}
            {/* Hover Tooltip */}
            {isHovered && (
              <div 
                className="absolute z-30 bg-gray-900 text-white px-4 py-3 rounded-xl text-xs shadow-xl whitespace-nowrap animate-fade-in"
                style={{
                  top: '30%',
                  left: index < paginatedData.length / 2 ? '100%' : 'auto',
                  right: index >= paginatedData.length / 2 ? '100%' : 'auto',
                  marginLeft: index < paginatedData.length / 2 ? '12px' : '0',
                  marginRight: index >= paginatedData.length / 2 ? '12px' : '0',
                }}
              >
                <div className="font-semibold mb-2 text-sm border-b border-gray-700 pb-1.5">
                  {username ? `@${username}` : `Post ${post.post_number}`}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-green-400 to-emerald-500"></div>
                    <span className="text-green-400">Positive:</span>
                    <span className="font-bold">{sentiment.positive.count}</span>
                    <span className="text-gray-400">({Math.round(sentiment.positive.percent)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-gray-300 to-gray-400"></div>
                    <span className="text-gray-400">Neutral:</span>
                    <span className="font-bold">{sentiment.neutral.count}</span>
                    <span className="text-gray-400">({Math.round(sentiment.neutral.percent)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-yellow-400 to-amber-500"></div>
                    <span className="text-yellow-400">Mixed:</span>
                    <span className="font-bold">{sentiment.mixed.count}</span>
                    <span className="text-gray-400">({Math.round(sentiment.mixed.percent)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-red-400 to-rose-500"></div>
                    <span className="text-red-400">Negative:</span>
                    <span className="font-bold">{sentiment.negative.count}</span>
                    <span className="text-gray-400">({Math.round(sentiment.negative.percent)}%)</span>
                  </div>
                  <div className="flex items-center gap-2 border-t border-gray-700 pt-1.5 mt-1.5">
                    <span className="text-blue-400">💬 Total:</span>
                    <span className="font-bold">{sentiment.total}</span>
                  </div>
                  
                  {/* Posted At - NEW */}
                  {post.platform_info?.published_at && (
                    <div className="flex items-center gap-2 border-t border-gray-700 pt-1.5 mt-1.5">
                      <span className="text-purple-400">📅 Posted:</span>
                      <span className="font-bold">
                        {new Date(post.platform_info.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

                {/* Hover Tooltip */}
                {isHovered && (
                  <div 
                    className="absolute z-30 bg-gray-900 text-white px-4 py-3 rounded-xl text-xs shadow-xl whitespace-nowrap animate-fade-in"
                    style={{
                      top: '30%',
                      left: index < paginatedData.length / 2 ? '100%' : 'auto',
                      right: index >= paginatedData.length / 2 ? '100%' : 'auto',
                      marginLeft: index < paginatedData.length / 2 ? '12px' : '0',
                      marginRight: index >= paginatedData.length / 2 ? '12px' : '0',
                    }}
                  >
                    <div className="font-semibold mb-2 text-sm border-b border-gray-700 pb-1.5">
                      {username ? `@${username}` : `Post ${post.post_number}`}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-green-400 to-emerald-500"></div>
                        <span className="text-green-400">Positive:</span>
                        <span className="font-bold">{sentiment.positive.count}</span>
                        <span className="text-gray-400">({Math.round(sentiment.positive.percent)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-gray-300 to-gray-400"></div>
                        <span className="text-gray-400">Neutral:</span>
                        <span className="font-bold">{sentiment.neutral.count}</span>
                        <span className="text-gray-400">({Math.round(sentiment.neutral.percent)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-yellow-400 to-amber-500"></div>
                        <span className="text-yellow-400">Mixed:</span>
                        <span className="font-bold">{sentiment.mixed.count}</span>
                        <span className="text-gray-400">({Math.round(sentiment.mixed.percent)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-red-400 to-rose-500"></div>
                        <span className="text-red-400">Negative:</span>
                        <span className="font-bold">{sentiment.negative.count}</span>
                        <span className="text-gray-400">({Math.round(sentiment.negative.percent)}%)</span>
                      </div>
                      <div className="flex items-center gap-2 border-t border-gray-700 pt-1.5 mt-1.5">
                        <span className="text-blue-400">💬 Total:</span>
                        <span className="font-bold">{sentiment.total}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mobile Legend */}
      <div className="md:hidden flex items-center justify-center gap-4 mt-12 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <span className="text-xs text-gray-600">Positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-gray-300 to-gray-400"></div>
          <span className="text-xs text-gray-600">Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-yellow-400 to-amber-500"></div>
          <span className="text-xs text-gray-600">Mixed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-400 to-rose-500"></div>
          <span className="text-xs text-gray-600">Negative</span>
        </div>
      </div>
      
      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No sentiment data available</p>
        </div>
      )}
    </div>
  );
};


const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ 
  campaignId, 
  onBack 
}) => {  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [analysisRecords, setAnalysisRecords] = useState<SentimentAnalysisData[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // Flagged messages modal state
  const [flaggedModalPost, setFlaggedModalPost] = useState<PostTableData | null>(null);
  
  // Table pagination state
  const [tablePage, setTablePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [showFormulaPopover, setShowFormulaPopover] = useState(false);
  const [tableFilter, setTableFilter] = useState<'all' | 'most_positive' | 'most_negative'>('all');

  const aggregatedData = useMemo<AggregatedData | null>(() => 
    aggregateAnalysisData(analysisRecords), 
    [analysisRecords]
  );

  const postTableData = useMemo<PostTableData[]>(() => 
    convertToPostTableData(analysisRecords),
    [analysisRecords]
  );

  // Paginated table data
// Paginated table data
// Filtered and sorted table data
// Sentiment Messages Data - MUST BE FIRST
const sentimentMessages = useMemo<PostSentimentMessages[]>(() => 
  aggregateSentimentMessagesFromRecords(analysisRecords),
  [analysisRecords]
);

// Filtered and sorted table data - NOW sentimentMessages is available
const filteredTableData = useMemo(() => {
  if (tableFilter === 'all') {
    return postTableData;
  }
  
  const dataWithPercentages = postTableData.map(post => {
    const counts = sentimentMessages.find(p => p.post_id === post.post_id);
    const positiveCount = counts?.positive_messages.length || 0;
    const negativeCount = counts?.negative_messages.length || 0;
    const positivePercent = post.total_comments > 0 ? (positiveCount / post.total_comments) * 100 : 0;
    const negativePercent = post.total_comments > 0 ? (negativeCount / post.total_comments) * 100 : 0;
    
    return {
      ...post,
      _positivePercent: positivePercent,
      _negativePercent: negativePercent
    };
  });
  
  if (tableFilter === 'most_positive') {
    return dataWithPercentages.sort((a, b) => b._positivePercent - a._positivePercent);
  } else if (tableFilter === 'most_negative') {
    return dataWithPercentages.sort((a, b) => b._negativePercent - a._negativePercent);
  }
  
  return dataWithPercentages;
}, [postTableData, sentimentMessages, tableFilter]);

// Paginated table data
const paginatedTableData = useMemo(() => {
  const startIndex = tablePage * rowsPerPage;
  return filteredTableData.slice(startIndex, startIndex + rowsPerPage);
}, [filteredTableData, tablePage, rowsPerPage]);

const totalTablePages = Math.ceil(filteredTableData.length / rowsPerPage);


  const sentimentTrend = useMemo(() => 
  calculateSentimentTrend(analysisRecords),  // Pass records, not aggregatedData.batches
  [analysisRecords]
);

  const emojiData = useMemo(() => {
  if (!analysisRecords || analysisRecords.length === 0) return null;
  return aggregateEmojiData(analysisRecords);  // Pass records, not batches
}, [analysisRecords]);

  const sentimentScore = useMemo(() => {
    if (!aggregatedData) return 0;
    return calculateSentimentScore(aggregatedData.sentiment.distribution);
  }, [aggregatedData]);

  const fetchSentimentData = async () => {
    if (!campaignId) return;

    try {
      setIsLoading(true);
      const response: GetSentimentAnalyticsResponse = await getCampaignSentimentAnalytics(campaignId);

      if (response.success && response.data && response.data.length > 0) {
        setAnalysisRecords(response.data);
      } else {
        setAnalysisRecords([]);
      }
    } catch (err) {
      console.error('Error fetching sentiment data:', err);
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to fetch sentiment analysis'
      });
      setAnalysisRecords([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateSentimentAnalysis = async () => {
    if (!campaignId) {
      setNotification({
        type: 'error',
        message: 'Campaign ID is required to generate analysis'
      });
      return;
    }

    try {
      setIsGenerating(true);
      const response: GenerateSentimentAnalysisResponse = await generateCampaignSentimentAnalysis(campaignId);

      if (response.success) {
        setNotification({
          type: 'success',
          message: response.message || 'Analyzing your comments now...'
        });

        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 5000);
      } else {
        throw new Error('Failed to start sentiment analysis');
      }
    } catch (err) {
      console.error('Error generating sentiment analysis:', err);
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to start analysis'
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Handle flagged count click - open modal
  const handleFlaggedClick = (e: React.MouseEvent, post: PostTableData) => {
    e.stopPropagation();
    setFlaggedModalPost(post);
  };

  useEffect(() => {
    if (campaignId) {
      fetchSentimentData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, refreshTrigger]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Flagged Messages Modal */}
      {flaggedModalPost && (
        <FlaggedMessagesModal
          isOpen={true}
          onClose={() => setFlaggedModalPost(null)}
          postData={flaggedModalPost}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-end">
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              
              <div className="h-8 w-px bg-gray-200"></div>
              
              <div className="flex items-center gap-3"> */}
                {/* <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2.5 shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Sentiment Analysis</h1>
                  <p className="text-sm text-gray-500">AI-powered comment insights</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3"> */}
              {/* {aggregatedData && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )} */}
              
              <button
                onClick={generateSentimentAnalysis}
                disabled={isGenerating || isLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[95%] xl:max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-3xl shadow-xl p-16 border border-gray-100">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="animate-spin h-20 w-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <p className="text-gray-800 font-semibold text-lg mt-8">Analyzing Your Comments...</p>
              <p className="text-gray-500 text-sm mt-2">AI is processing sentiment patterns</p>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && aggregatedData && (
          <div className="space-y-8">
            {/* Quick Stats Row */}
            {/* Main Layout - Stats + Sentiment Meter + Comment Sentiment */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
              {/* Left Section (3 columns) - Stats + Sentiment Meter */}
              <div className="lg:col-span-3 flex flex-col gap-6">
                {/* Quick Stats Row - Compact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatsCard
                    title="Positive Sentiment"
                    value={`${Math.round(aggregatedData.sentiment.distribution.positive * 100)}%`}
                    subtitle={sentimentTrend === 'improving' ? 'Trending up' : sentimentTrend === 'declining' ? 'Needs attention' : 'Stable'}
                    icon={ThumbsUp}
                    color="green"
                    compact
                  />
                  <StatsCard
                    title="Total Comments"
                    value={aggregatedData.statistics.total_comments.toLocaleString()}
                    subtitle={`From ${aggregatedData.statistics.total_posts} posts`}
                    icon={MessageCircle}
                    color="blue"
                    compact
                  />
                  <StatsCard
                    title="Posts Analyzed"
                    value={aggregatedData.statistics.total_posts}
                    subtitle="Content posts processed"
                    icon={FileText}
                    color="orange"
                    compact
                  />
                </div>
                
                {/* Sentiment Overview Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl p-2">
                      <Gauge className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Sentiment Meter</h2>
                        <p className="text-sm text-gray-500">sentiment score</p>
                      </div>
                      {/* Info Icon with Popover */}
                      <div className="relative">
                        <button
                          onClick={() => setShowFormulaPopover(!showFormulaPopover)}
                          className="p-1.5 rounded-full hover:bg-indigo-100 transition-colors group"
                          title="How we calculate"
                        >
                          <Info className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600" />
                        </button>
                        
                        {/* Formula Popover */}
                        {showFormulaPopover && (
                          <>
                            {/* Backdrop to close on click outside */}
                            <div 
                              className="fixed inset-0 z-40" 
                              onClick={() => setShowFormulaPopover(false)}
                            />
                            
                            {/* Popover Content */}
                            <div className="absolute left-0 top-full mt-2 z-50 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
                              {/* Header */}
                              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Info className="w-4 h-4 text-white" />
                                  <span className="text-sm font-semibold text-white">How We Calculate</span>
                                </div>
                                <button
                                  onClick={() => setShowFormulaPopover(false)}
                                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4 text-white" />
                                </button>
                              </div>
                              
                              {/* Formula Content */}
                              <div className="p-4">
                                <p className="text-xs text-gray-500 mb-3">
                                  The sentiment score is calculated using weighted values:
                                </p>
                                
                                <div className="space-y-2 mb-4">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                      <span className="text-lg">😊</span>
                                      <span className="text-gray-700">Positive</span>
                                    </span>
                                    <span className="font-mono text-green-600 font-semibold">× 10</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                      <span className="text-lg">😐</span>
                                      <span className="text-gray-700">Neutral</span>
                                    </span>
                                    <span className="font-mono text-gray-500 font-semibold">× 5</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                      <span className="text-lg">😕</span>
                                      <span className="text-gray-700">Mixed</span>
                                    </span>
                                    <span className="font-mono text-yellow-600 font-semibold">× 4</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                      <span className="text-lg">😞</span>
                                      <span className="text-gray-700">Negative</span>
                                    </span>
                                    <span className="font-mono text-red-600 font-semibold">× 0</span>
                                  </div>
                                </div>
                                
                                {/* Current Calculation */}
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
                                  <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wide mb-2">Current Calculation</p>
                                  <div className="text-xs text-gray-600 font-mono leading-relaxed">
                                    <span className="text-green-600">{Math.round(aggregatedData!.sentiment.distribution.positive * 100)}%</span>
                                    <span className="text-gray-400">×10</span>
                                    <span className="mx-1">+</span>
                                    <span className="text-gray-500">{Math.round(aggregatedData!.sentiment.distribution.neutral * 100)}%</span>
                                    <span className="text-gray-400">×5</span>
                                    <span className="mx-1">+</span>
                                    <span className="text-yellow-600">{Math.round(aggregatedData!.sentiment.distribution.mixed * 100)}%</span>
                                    <span className="text-gray-400">×4</span>
                                    <span className="mx-1">+</span>
                                    <span className="text-red-600">{Math.round(aggregatedData!.sentiment.distribution.negative * 100)}%</span>
                                    <span className="text-gray-400">×0</span>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-indigo-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">= Score</span>
                                    <span className="text-lg font-bold text-indigo-600">{sentimentScore.toFixed(1)}/10</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SentimentGauge score={sentimentScore} distribution={aggregatedData.sentiment.distribution} />
                    
                    <div className="space-y-4">
                      {[
                        { label: 'Positive', value: aggregatedData.sentiment.distribution.positive, color: 'bg-green-500', emoji: '😊' },
                        { label: 'Neutral', value: aggregatedData.sentiment.distribution.neutral, color: 'bg-gray-400', emoji: '😐' },
                        { label: 'Negative', value: aggregatedData.sentiment.distribution.negative, color: 'bg-red-500', emoji: '😞' },
                        { label: 'Mixed', value: aggregatedData.sentiment.distribution.mixed, color: 'bg-yellow-500', emoji: '😕' }
                      ].map((item) => (
                        <div key={item.label} className="group">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <span className="text-lg">{item.emoji}</span>
                              {item.label}
                            </span>
                            <span className="text-sm font-bold text-gray-900">{Math.round(item.value * 100)}%</span>
                          </div>
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color} rounded-full transition-all duration-700 ease-out group-hover:opacity-80`}
                              style={{ width: `${item.value * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Comment Sentiment - FIXED HEIGHT to match left section */}
              <div className="lg:col-span-1 flex">
                  <RightColumnSentimentMessages sentimentMessages={sentimentMessages} />
              </div>
            </div>


            {/* Sentiment by Influencer Chart - FULL WIDTH */}
            <SentimentByInfluencerChart data={postTableData} sentimentMessages={sentimentMessages} />

            {/* Word Cloud Section */}
            {/* Sentiment by Influencer Chart - FULL WIDTH */}
            <EmotionRadarChart sentimentMessages={sentimentMessages} /> 

            <WordCloudSection postTableData={postTableData} emojiData={emojiData} />


            {/* Emoji Analysis Section */}
            {emojiData && emojiData.totalEmojiCount > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-2">
                      <Heart className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Emoji Analysis</h2>
                      <p className="text-sm text-gray-500">
                        {emojiData.totalEmojiCount.toLocaleString()} emojis • {emojiData.uniqueEmojiCount} unique
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* Top Emojis */}
                  <div className="flex flex-col h-full">
                    <h3 className="font-semibold text-gray-700 mb-4">Top Emojis Used</h3>
                    <div className="grid grid-cols-5 gap-3 flex-1">
                      {emojiData.topEmojis.slice(0, 10).map(([emoji, count], idx) => (
                        <EmojiCard
                          key={emoji}
                          emoji={emoji}
                          count={count}
                          rank={idx + 1}
                          percentage={(count / emojiData.totalEmojiCount) * 100}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Emoji Sentiment */}
                  <div className="flex flex-col h-full">
                    <h3 className="font-semibold text-gray-700 mb-4">Emoji Sentiment Breakdown</h3>
                    <div className="flex-1">
                      <EmojiSentimentVisualization data={emojiData.sentimentPercentages} />
                    </div>
                  </div>
                </div>
              </div>
            )}

{/* ============================================================
   COMPACT POST ANALYSIS TABLE - Replace your existing table section
   Column Order: Positive → Negative → Mixed → Neutral
   ============================================================ */}

{/* ============================================================
   FIXED COMPACT POST ANALYSIS TABLE
   - Removed broken profile image (only thumbnail + username now)
   - Emotion label now visible (Joy, Love, etc.)
   ============================================================ */}

{/* Posts Table Section - COMPACT VERSION */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full">
  {/* Header - More compact */}
  <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
  <div className="flex flex-col gap-4 items-end">
        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">Show:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setTablePage(0);
            }}
            className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        
        {/* Pagination Controls */}
        {totalTablePages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTablePage(prev => Math.max(0, prev - 1))}
              disabled={tablePage === 0}
              className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="text-xs text-gray-600 font-medium px-2">
              {tablePage + 1}/{totalTablePages}
            </span>
            <button
              onClick={() => setTablePage(prev => Math.min(totalTablePages - 1, prev + 1))}
              disabled={tablePage === totalTablePages - 1}
              className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </div>
  

    {/* Filter Buttons Row */}
    <div className="flex items-center gap-2 justify-end">
      <span className="text-xs text-gray-500 font-medium">Filter:</span>
      <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => {
            setTableFilter('all');
            setTablePage(0);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            tableFilter === 'all'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          All Posts
        </button>
        
        <button
          onClick={() => {
            setTableFilter('most_positive');
            setTablePage(0);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            tableFilter === 'most_positive'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          Most Positive
        </button>
        
        <button
          onClick={() => {
            setTableFilter('most_negative');
            setTablePage(0);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
            tableFilter === 'most_negative'
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          Most Negative
        </button>
      </div>
    </div>

<div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-200">
          <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Post</th>
          <th className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total</th>
          <th className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Positive</span>
            </div>
          </th>
          <th className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Negative</span>
            </div>
          </th>
          <th className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Mixed</span>
            </div>
          </th>
          <th className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span>Neutral</span>
            </div>
          </th>
          <th className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Score</th>
          <th className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Top Emotions</th>
          <th className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Flags</th>
          <th className="px-2 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Posted</th>
          <th className="px-2 py-2.5 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider w-12"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {paginatedTableData.map((post, idx) => {
          const counts = sentimentMessages.find(p => p.post_id === post.post_id);
          const positiveCount = counts?.positive_messages.length || 0;
          const negativeCount = counts?.negative_messages.length || 0;
          const remainingCount = Math.max(0, post.total_comments - positiveCount - negativeCount);
          const neutralCount = Math.round(remainingCount * 0.7);
          const mixedCount = remainingCount - neutralCount;
          
          // Calculate sentiment score (0-10)
          const rowSentimentScore = post.total_comments > 0 
            ? Math.round(((positiveCount * 10) + (neutralCount * 5) + (mixedCount * 4)) / post.total_comments * 10) / 10
            : 0;
          
          // Get score color
          const getScoreColor = (score: number) => {
            if (score >= 8) return 'text-green-600';
            if (score >= 6) return 'text-lime-600';
            if (score >= 4) return 'text-yellow-600';
            if (score >= 2) return 'text-orange-600';
            return 'text-red-600';
          };
          
          // Get top emotion from messages
          const getTopEmotion = () => {
            const allMessages = [
              ...(counts?.positive_messages || []),
              ...(counts?.negative_messages || [])
            ];
            
            if (allMessages.length === 0) return { emotion: '-', emoji: '📊' };
            
            const emotionCounts: Record<string, number> = {};
            allMessages.forEach(msg => {
              const emotion = msg.dominant_emotion?.split(':')[0]?.trim()?.toLowerCase() || 'unknown';
              emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
            });
            
            const topEmotion = Object.entries(emotionCounts)
              .sort(([,a], [,b]) => b - a)[0];
            
            if (!topEmotion) return { emotion: '-', emoji: '😐' };
            
            const emotionConfig: Record<string, { emoji: string }> = {
              'love': { emoji: '❤️' },
              'adoration': { emoji: '🥰' },
              'joy': { emoji: '😊' },
              'happiness': { emoji: '😄' },
              'excitement': { emoji: '🎉' },
              'admiration': { emoji: '👏' },
              'praise': { emoji: '🙌' },
              'gratitude': { emoji: '🙏' },
              'support': { emoji: '💪' },
              'sadness': { emoji: '😢' },
              'anger': { emoji: '😠' },
              'contempt': { emoji: '😤' },
              'criticism': { emoji: '👎' },
              'insult': { emoji: '🤬' },
              'fear': { emoji: '😨' },
              'disgust': { emoji: '🤢' },
              'surprise': { emoji: '😮' },
              'curiosity': { emoji: '🤔' },
              'neutral': { emoji: '😐' },
            };
            
            const config = emotionConfig[topEmotion[0]] || { emoji: '💬' };
            const emotionName = topEmotion[0].charAt(0).toUpperCase() + topEmotion[0].slice(1);
            
            return { emotion: emotionName, emoji: config.emoji };
          };
          
          const topEmotion = getTopEmotion();
          
          return (
            <tr 
              key={post.post_id}
              className={`hover:bg-blue-50/30 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
            >
              {/* Post - FIXED: No broken profile image, just thumbnail + username */}
              <td className="px-3 py-2">
                <div className="flex items-center gap-3">
                  {/* Thumbnail Only */}
                  <div className="relative flex-shrink-0">
                    {post.platform_info?.thumbnail_url ? (
                      <a
                        href={post.platform_info.content_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={post.platform_info.thumbnail_url} 
                          alt="Post"
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 hover:border-indigo-300 transition-all"
                        />
                        {/* Play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/40 rounded-full p-0.5">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                        {/* Platform icon */}
                          <ThumbnailPlatformIcon
                            platform={detectPlatformFromUrl(post.platform_info?.content_url || '')}
                            size="sm"
                            className="absolute -bottom-0.5 -left-0.5 border border-white"
                          />
                      </a>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Username Only - NO profile image */}
                  <span className="text-xs font-medium text-gray-800 truncate max-w-[120px]">
                    @{post.platform_info?.platform_username || 'unknown'}
                  </span>
                </div>
              </td>
              
              {/* Total */}
              <td className="px-2 py-2 text-center">
                <span className="text-sm font-bold text-gray-900">{post.total_comments}</span>
              </td>
              
              {/* Positive */}
              <td className="px-2 py-2 text-center">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-sm font-bold text-green-600">{positiveCount}</span>
                  <span className="text-[10px] text-gray-400">
                    {post.total_comments > 0 ? Math.round((positiveCount / post.total_comments) * 100) : 0}%
                  </span>
                </div>
              </td>
              
              {/* Negative */}
              <td className="px-2 py-2 text-center">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-sm font-bold text-red-600">{negativeCount}</span>
                  <span className="text-[10px] text-gray-400">
                    {post.total_comments > 0 ? Math.round((negativeCount / post.total_comments) * 100) : 0}%
                  </span>
                </div>
              </td>
              
              {/* Mixed */}
              <td className="px-2 py-2 text-center">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-sm font-bold text-yellow-600">{mixedCount}</span>
                  <span className="text-[10px] text-gray-400">
                    {post.total_comments > 0 ? Math.round((mixedCount / post.total_comments) * 100) : 0}%
                  </span>
                </div>
              </td>
              
              {/* Neutral */}
              <td className="px-2 py-2 text-center">
                <div className="flex flex-col items-center leading-tight">
                  <span className="text-sm font-bold text-gray-500">{neutralCount}</span>
                  <span className="text-[10px] text-gray-400">
                    {post.total_comments > 0 ? Math.round((neutralCount / post.total_comments) * 100) : 0}%
                  </span>
                </div>
              </td>
              
              {/* Score */}
              <td className="px-2 py-2 text-center">
                <span className={`text-sm font-bold ${getScoreColor(rowSentimentScore)}`}>
                  {rowSentimentScore.toFixed(1)}
                </span>
              </td>
              
              {/* Emotion - FIXED: Now shows label like "Joy", "Love" */}
              <td className="px-2 py-2 text-center">
                <div className="flex items-center justify-center gap-1" title={topEmotion.emotion}>
                  <span className="text-base">{topEmotion.emoji}</span>
                  <span className="text-[10px] text-gray-600">{topEmotion.emotion}</span>
                </div>
              </td>
              
              {/* Flags */}
              <td className="px-2 py-2 text-center">
                {post.flagged_count > 0 ? (
                  <button
                    onClick={(e) => handleFlaggedClick(e, post)}
                    className="inline-flex items-center gap-0.5 text-red-600 hover:text-red-700 transition-colors"
                  >
                    <span className="text-sm">🚩</span>
                    <span className="text-xs font-bold">{post.flagged_count}</span>
                  </button>
                ) : (
                  <span className="text-sm text-green-500">✓</span>
                )}
              </td>
              
              {/* Posted - Compact */}
              <td className="px-2 py-2">
                <div className="text-[10px] text-gray-500 leading-tight">
                  <div className="font-medium text-gray-700">
                    {new Date(post.published_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: '2-digit'
                    })}
                  </div>
                  <div>
                    {new Date(post.published_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </td>
              
              {/* Actions - Compact */}
              <td className="px-2 py-2 text-center">
                {post.platform_info?.content_url && (
                  <a
                    href={post.platform_info.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-indigo-500 text-white hover:bg-indigo-600 transition-all"
                    title="View Post"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
  
  {/* Footer - Compact */}
  <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-4 text-gray-500">
        <span>
          <span className="font-semibold text-gray-700">{tablePage * rowsPerPage + 1}-{Math.min((tablePage + 1) * rowsPerPage, postTableData.length)}</span> of {postTableData.length} posts
        </span>
        <span>
          <span className="font-semibold text-gray-700">{postTableData.reduce((sum, p) => sum + p.total_comments, 0).toLocaleString()}</span> comments
        </span>
        <span>
          <span className="font-semibold text-red-600">{postTableData.reduce((sum, p) => sum + p.flagged_count, 0)}</span> flags
        </span>
      </div>
      

    </div>
  </div>
</div>
          </div>  
        )}

        {/* No Data State */}
        {!isLoading && !aggregatedData && (
          <div className="bg-white rounded-3xl shadow-xl p-16 border border-gray-100 text-center">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Activity className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Analysis Data Yet</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Click the &quot;Refresh Analysis&quot; button to start analyzing comments from your campaign posts.
            </p>
            <button
              onClick={generateSentimentAnalysis}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              Start Analysis
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SentimentAnalysis;
