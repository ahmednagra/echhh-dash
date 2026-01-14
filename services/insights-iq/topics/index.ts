// src/services/insights-iq/topics/index.ts

// Import the service class first
import { TopicsService } from './topics.service';

// Export service
export { TopicsService } from './topics.service';

// Export types
export type {
  Topic,
  TopicsResponse,
  ProcessedTopic,
  TopicsRequestOptions,
  TopicsServiceResponse,
  TopicRelevanceFilter
} from './types';

// Export constants
export {
  TOPICS_CACHE_KEY,
  TOPICS_CACHE_DURATION,
  TOPICS_DEFAULTS
} from './types';

// Create singleton instance
export const topicsService = new TopicsService();