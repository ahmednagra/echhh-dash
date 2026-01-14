// src/services/insights-iq/index.ts

// Export configuration
export { INSIGHTIQ_CONFIG } from './config';

// Export types
export * from './types';

// Export endpoints
export { INSIGHTIQ_ENDPOINTS, buildEndpointUrl } from './endpoints';

// Export base service
export { InsightIQBaseService } from './base.service';

// Export location service
export { LocationService } from './locations/location.service';

// Create and export service instances
import { LocationService } from './locations/location.service';

export const locationService = new LocationService();

// Export profile analytics service
export { ProfileAnalyticsService } from './profile-analytics/profile-analytics.service';

import { ProfileAnalyticsService } from './profile-analytics/profile-analytics.service';

export const profileAnalyticsService = new ProfileAnalyticsService();

// Export comments service - NEW
export * from './comments';

// Export services object
export const InsightIQServices = {
  location: locationService,
  profileAnalytics: profileAnalyticsService
} as const;


