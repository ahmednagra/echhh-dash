// src/context/PlatformConfigContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  initializePlatformConfig,
  refreshPlatformConfig,
  isPlatformConfigInitialized,
  getDynamicPlatformIdSync,
  getDynamicWorkPlatformIdSync,
  getDynamicDataSourceEndpointIdSync,
  getCachedPlatforms,
  getCachedEndpoints,
  Platform,
} from '@/services/platform/platforms.service';
import { ExternalApiEndpoint } from '@/types/platform';
import { ContentPlatform } from '@/constants/social-platforms';

// =============================================================================
// TYPES
// =============================================================================

interface PlatformConfigContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Getters
  getPlatformId: (platform: ContentPlatform) => string | null;
  getWorkPlatformId: (platform: ContentPlatform) => string | null;
  getDataSourceEndpointId: (code: 'INSIGHTIQ' | 'MANUAL') => string | null;
  
  // Data
  platforms: Platform[];
  endpoints: ExternalApiEndpoint[];
  
  // Actions
  refresh: () => Promise<void>;
}

// =============================================================================
// CONTEXT
// =============================================================================

const PlatformConfigContext = createContext<PlatformConfigContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

interface PlatformConfigProviderProps {
  children: ReactNode;
}

export function PlatformConfigProvider({ children }: PlatformConfigProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [endpoints, setEndpoints] = useState<ExternalApiEndpoint[]>([]);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        await initializePlatformConfig();
        
        setIsInitialized(isPlatformConfigInitialized());
        setPlatforms(getCachedPlatforms());
        setEndpoints(getCachedEndpoints());
        
        console.log('✅ PlatformConfigContext: Initialized');
      } catch (err) {
        console.error('❌ PlatformConfigContext: Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // Refresh handler
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await refreshPlatformConfig();
      
      setIsInitialized(isPlatformConfigInitialized());
      setPlatforms(getCachedPlatforms());
      setEndpoints(getCachedEndpoints());
      
      console.log('✅ PlatformConfigContext: Refreshed');
    } catch (err) {
      console.error('❌ PlatformConfigContext: Refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Getter functions
  const getPlatformId = useCallback((platform: ContentPlatform): string | null => {
    return getDynamicPlatformIdSync(platform);
  }, []);

  const getWorkPlatformId = useCallback((platform: ContentPlatform): string | null => {
    return getDynamicWorkPlatformIdSync(platform);
  }, []);

  const getDataSourceEndpointId = useCallback((code: 'INSIGHTIQ' | 'MANUAL'): string | null => {
    return getDynamicDataSourceEndpointIdSync(code);
  }, []);

  const value: PlatformConfigContextType = {
    isInitialized,
    isLoading,
    error,
    getPlatformId,
    getWorkPlatformId,
    getDataSourceEndpointId,
    platforms,
    endpoints,
    refresh,
  };

  return (
    <PlatformConfigContext.Provider value={value}>
      {children}
    </PlatformConfigContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to access platform configuration
 * Must be used within PlatformConfigProvider
 */
export function usePlatformConfig(): PlatformConfigContextType {
  const context = useContext(PlatformConfigContext);
  
  if (context === undefined) {
    throw new Error('usePlatformConfig must be used within a PlatformConfigProvider');
  }
  
  return context;
}

/**
 * Hook to get a specific platform ID
 */
export function usePlatformId(platform: ContentPlatform): string | null {
  const { getPlatformId, isInitialized } = usePlatformConfig();
  
  if (!isInitialized) return null;
  return getPlatformId(platform);
}

/**
 * Hook to get a data source endpoint ID
 */
export function useDataSourceEndpointId(code: 'INSIGHTIQ' | 'MANUAL'): string | null {
  const { getDataSourceEndpointId, isInitialized } = usePlatformConfig();
  
  if (!isInitialized) return null;
  return getDataSourceEndpointId(code);
}
