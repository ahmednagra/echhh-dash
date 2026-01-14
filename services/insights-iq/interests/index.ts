// src/services/insights-iq/interests/index.ts

export { InterestsService, interestsService } from './interests.service';
export type { 
  Interest,
  InterestsResponse,
  ProcessedInterest,
  InterestsRequestOptions,
  InterestsServiceResponse 
} from './types';
export { 
  INTERESTS_CACHE_KEY,
  INTERESTS_CACHE_DURATION 
} from './types';