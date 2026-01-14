// // src/services/insights-iq/userhandles/index.ts

// // Import the service class first
// import { UserhandlesService } from './userhandles.service';

// // Export service
// export { UserhandlesService } from './userhandles.service';

// // Export types
// export type {
//   UserhandlesRequest,
//   UserhandlesResponse,
//   UserhandleResult
// } from './userhandles.types';

// // Export constants
// export {
//   USERHANDLES_DEFAULTS,
//   USERHANDLES_CACHE_KEY,
//   USERHANDLES_CACHE_DURATION
// } from './userhandles.types';

// // Create singleton instance (now UserhandlesService is available)
// export const userhandlesService = new UserhandlesService();


// src/services/insights-iq/userhandles/index.ts

export * from './userhandles.client';
export * from './userhandles.service';
export * from './userhandles.types';