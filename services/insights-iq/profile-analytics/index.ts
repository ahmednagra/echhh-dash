// src/services/insights-iq/profile-analytics/index.ts

export { ProfileAnalyticsService } from './profile-analytics.service';
export { ProfileAnalyticsServerService } from './profile-analytics.server';

import { ProfileAnalyticsService } from './profile-analytics.service';
import { ProfileAnalyticsServerService } from './profile-analytics.server';

// Create and export service instances
export const profileAnalyticsService = new ProfileAnalyticsService();
export const profileAnalyticsServerService = new ProfileAnalyticsServerService();