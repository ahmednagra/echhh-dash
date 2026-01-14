// src/lib/react-query/index.ts
// Central exports for React Query configuration

export { 
  createQueryClient, 
  getQueryClient,
  STALE_TIMES,
  GC_TIMES,
} from './query-client';

export { 
  queryKeys,
  createQueryKeys,
  type QueryKeys,
} from './query-keys';