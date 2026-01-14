// src/services/platform/platform.service.ts
'use client';

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ExternalApiEndpoint, ActiveEndpointsResponse, ENDPOINT_CODES } from '@/types/platform';
import { ContentPlatform } from '@/constants/social-platforms';

export interface Platform {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  category: string;
  status: string;
  url?: string;
  work_platform_id?: string;
  products?: {
    income?: { is_supported: boolean };
    switch?: { is_supported: boolean };
    activity?: { is_supported: boolean };
    identity?: { 
      audience?: { is_supported: boolean };
      is_supported: boolean;
    };
    engagement?: {
      audience?: { is_supported: boolean };
      is_supported: boolean;
    };
    publish_content?: { is_supported: boolean };
  };
  created_at: string;
  updated_at: string;
}

export interface PlatformsResponse {
  success: boolean;
  data: Platform[];
  total: number;
}

/**
 * Get all platforms
 */
export async function getPlatforms(status?: string): Promise<Platform[]> {
  try {
    console.log('🚀 Client Service: Getting platforms');
    
    const params = status ? `?status=${status}` : '';
    const endpoint = `/api/v0/platforms${params}`;
    
    const response = await nextjsApiClient.get<PlatformsResponse>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: No response data received or request failed');
      return [];
    }
    
    const platforms = response.data.data || [];
    console.log('✅ Client Service: Successfully retrieved platforms:', platforms.length);
    return platforms;
  } catch (error) {
    console.error('💥 Client Service: Error in getPlatforms:', error);
    throw error;
  }
}

/**
 * Get platform by ID
 */
export async function getPlatformById(platformId: string): Promise<Platform | null> {
  try {
    console.log(`🚀 Client Service: Getting platform ${platformId}`);
    
    const endpoint = `/api/v0/platforms/${platformId}`;
    const response = await nextjsApiClient.get<{ success: boolean; data: Platform }>(endpoint);
    
    if (response.error) {
      if (response.status === 404) {
        console.warn(`⚠️ Platform not found: ${platformId}`);
        return null;
      }
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: No response data received or request failed');
      return null;
    }
    
    console.log('✅ Client Service: Successfully retrieved platform');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getPlatformById:', error);
    throw error;
  }
}

/**
 * Get platform by name
 */
export async function getPlatformByName(name: string): Promise<Platform | null> {
  try {
    console.log(`🚀 Client Service: Getting platform by name: ${name}`);
    
    const platforms = await getPlatforms('ACTIVE'); // Only get active platforms
    const platform = platforms.find(p => p.name.toLowerCase() === name.toLowerCase());
    
    if (!platform) {
      console.warn(`⚠️ Platform not found with name: ${name}`);
      return null;
    }
    
    console.log(`✅ Client Service: Found platform: ${platform.name} (${platform.id})`);
    return platform;
  } catch (error) {
    console.error(`💥 Client Service: Error getting platform by name ${name}:`, error);
    throw error;
  }
}

/**
 * Get active platforms only
 */
export async function getActivePlatforms(): Promise<Platform[]> {
  return getPlatforms('ACTIVE');
}

/**
 * Check if a platform supports a specific feature
 */
export function platformSupportsFeature(platform: Platform, feature: string): boolean {
  if (!platform.products) return false;
  
  switch (feature) {
    case 'identity':
      return platform.products.identity?.is_supported || false;
    case 'engagement':
      return platform.products.engagement?.is_supported || false;
    case 'publish_content':
      return platform.products.publish_content?.is_supported || false;
    case 'income':
      return platform.products.income?.is_supported || false;
    case 'activity':
      return platform.products.activity?.is_supported || false;
    case 'switch':
      return platform.products.switch?.is_supported || false;
    default:
      return false;
  }
}

// =============================================================================
// EXTERNAL API ENDPOINTS - Client Functions
// =============================================================================

/**
 * Get all active external API endpoints (client-side)
 * Calls: GET /api/v0/external-api-endpoints/active
 */
export async function getActiveExternalApiEndpoints(): Promise<ExternalApiEndpoint[]> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getActiveExternalApiEndpoints can only be called from browser');
    }

    console.log('🚀 Client Service: Fetching active external API endpoints');

    const endpoint = '/api/v0/external-api-endpoints/active';
    const response = await nextjsApiClient.get<ActiveEndpointsResponse>(endpoint);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }

    const endpoints = response.data?.data || [];
    console.log('✅ Client Service: Active endpoints fetched:', endpoints.length);
    
    return endpoints;
  } catch (error) {
    console.error('💥 Client Service: Error fetching active endpoints:', error);
    throw error;
  }
}

/**
 * Get external API endpoint by code (client-side)
 */
export async function getExternalApiEndpointByCode(
  endpointCode: string
): Promise<ExternalApiEndpoint | null> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getExternalApiEndpointByCode can only be called from browser');
    }

    console.log(`🚀 Client Service: Fetching endpoint by code: ${endpointCode}`);

    const endpoint = `/api/v0/external-api-endpoints/code/${endpointCode}`;
    const response = await nextjsApiClient.get<{ success: boolean; data: ExternalApiEndpoint }>(endpoint);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      return null;
    }

    console.log('✅ Client Service: Endpoint fetched:', response.data?.data?.endpoint_name);
    return response.data?.data || null;
  } catch (error) {
    console.error('💥 Client Service: Error fetching endpoint by code:', error);
    return null;
  }
}

// =============================================================================
// PLATFORM CONFIG CACHE - Centralized Dynamic ID Management
// =============================================================================

const CACHE_KEY = 'echooo_platform_config';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface PlatformConfigCache {
  platforms: Platform[];
  endpoints: ExternalApiEndpoint[];
  lastFetchedAt: number;
}

let configCache: PlatformConfigCache | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Load config from localStorage
 */
function loadCacheFromStorage(): PlatformConfigCache | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: PlatformConfigCache = JSON.parse(cached);
    const age = Date.now() - data.lastFetchedAt;
    
    if (age > CACHE_TTL_MS) {
      console.log('⏰ PlatformConfig: Cache expired');
      return null;
    }
    
    console.log('📦 PlatformConfig: Loaded from cache');
    return data;
  } catch {
    return null;
  }
}

/**
 * Save config to localStorage
 */
function saveCacheToStorage(cache: PlatformConfigCache): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log('💾 PlatformConfig: Saved to cache');
  } catch (error) {
    console.warn('⚠️ PlatformConfig: Failed to save cache:', error);
  }
}

/**
 * Initialize platform configuration
 * Fetches platforms and endpoints, builds lookup cache
 */
export async function initializePlatformConfig(forceRefresh = false): Promise<void> {
  // Return existing promise if init in progress
  if (initPromise && !forceRefresh) {
    return initPromise;
  }
  
  // Check localStorage cache first
  if (!forceRefresh) {
    const cached = loadCacheFromStorage();
    if (cached) {
      configCache = cached;
      return Promise.resolve();
    }
  }
  
  initPromise = (async () => {
    try {
      console.log('🚀 PlatformConfig: Initializing...');
      
      const [platforms, endpoints] = await Promise.all([
        getActivePlatforms(),
        getActiveExternalApiEndpoints(),
      ]);
      
      configCache = {
        platforms,
        endpoints,
        lastFetchedAt: Date.now(),
      };
      
      saveCacheToStorage(configCache);
      
      console.log('✅ PlatformConfig: Initialized', {
        platforms: platforms.length,
        endpoints: endpoints.length,
      });
    } catch (error) {
      console.error('❌ PlatformConfig: Initialization failed:', error);
      throw error;
    } finally {
      initPromise = null;
    }
  })();
  
  return initPromise;
}

/**
 * Ensure config is initialized
 */
async function ensureConfigInitialized(): Promise<void> {
  if (!configCache) {
    await initializePlatformConfig();
  }
}

/**
 * Check if config is initialized
 */
export function isPlatformConfigInitialized(): boolean {
  return configCache !== null;
}

/**
 * Refresh platform config (clear cache and re-fetch)
 */
export async function refreshPlatformConfig(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CACHE_KEY);
  }
  configCache = null;
  await initializePlatformConfig(true);
}

// =============================================================================
// DYNAMIC ID GETTERS
// =============================================================================

/**
 * Get platform ID dynamically (async)
 */
export async function getDynamicPlatformId(platform: ContentPlatform): Promise<string> {
  await ensureConfigInitialized();
  
  const found = configCache?.platforms.find(
    p => p.name.toLowerCase() === platform.toLowerCase()
  );
  
  if (!found) {
    throw new Error(`Platform not found: ${platform}`);
  }
  
  return found.id;
}

/**
 * Get platform ID synchronously (returns null if not initialized)
 */
export function getDynamicPlatformIdSync(platform: ContentPlatform): string | null {
  if (!configCache) return null;
  
  const found = configCache.platforms.find(
    p => p.name.toLowerCase() === platform.toLowerCase()
  );
  
  return found?.id || null;
}

/**
 * Get work platform ID dynamically (async)
 */
export async function getDynamicWorkPlatformId(platform: ContentPlatform): Promise<string> {
  await ensureConfigInitialized();
  
  const found = configCache?.platforms.find(
    p => p.name.toLowerCase() === platform.toLowerCase()
  );
  
  if (!found || !found.work_platform_id) {
    throw new Error(`Work platform ID not found for: ${platform}`);
  }
  
  return found.work_platform_id;
}

/**
 * Get work platform ID synchronously
 */
export function getDynamicWorkPlatformIdSync(platform: ContentPlatform): string | null {
  if (!configCache) return null;
  
  const found = configCache.platforms.find(
    p => p.name.toLowerCase() === platform.toLowerCase()
  );
  
  return found?.work_platform_id || null;
}

/**
 * Mapping from simple code to endpoint code
 */
const DATA_SOURCE_CODE_MAP: Record<string, string> = {
  INSIGHTIQ: ENDPOINT_CODES.INSIGHTIQ_CONTENT_FETCH,
  MANUAL: ENDPOINT_CODES.INTERNAL_MANUAL_ENTRY,
};

/**
 * Get data source endpoint ID dynamically (async)
 */
export async function getDynamicDataSourceEndpointId(
  code: 'INSIGHTIQ' | 'MANUAL'
): Promise<string> {
  await ensureConfigInitialized();
  
  const endpointCode = DATA_SOURCE_CODE_MAP[code];
  const found = configCache?.endpoints.find(e => e.endpoint_code === endpointCode);
  
  if (!found) {
    throw new Error(`Data source endpoint not found: ${code} (${endpointCode})`);
  }
  
  return found.id;
}

/**
 * Get data source endpoint ID synchronously
 */
export function getDynamicDataSourceEndpointIdSync(
  code: 'INSIGHTIQ' | 'MANUAL'
): string | null {
  if (!configCache) return null;
  
  const endpointCode = DATA_SOURCE_CODE_MAP[code];
  const found = configCache.endpoints.find(e => e.endpoint_code === endpointCode);
  
  return found?.id || null;
}

/**
 * Get all cached platforms
 */
export function getCachedPlatforms(): Platform[] {
  return configCache?.platforms || [];
}

/**
 * Get all cached endpoints
 */
export function getCachedEndpoints(): ExternalApiEndpoint[] {
  return configCache?.endpoints || [];
}
