// src/services/providers/profile-manager.server.ts
// Universal provider manager for profile fetching with fallback support

import { StandardizedProfile } from '@/types/campaign-influencers';
import { 
  fetchNanoInfluencerProfileServer, 
  isNanoInfluencerAvailable, 
  NanoInfluencerProviderError 
} from '@/services/nanoinfluencer/profile/profile.server';
import { 
  fetchEnsembleDataProfileServer, 
  isEnsembleDataAvailable, 
  EnsembleDataProviderError 
} from '@/services/ensembledata/profile/profile.server';

export interface ProfileProviderConfig {
  name: 'nanoinfluencer' | 'ensembledata';
  priority: number;
  isAvailable: () => boolean;
  fetchProfile: (username: string, platform: 'instagram' | 'tiktok' | 'youtube') => Promise<StandardizedProfile>;
  supportedPlatforms: readonly ('instagram' | 'tiktok' | 'youtube')[];
}

/**
 * Profile Manager Error class - separate from types interface to avoid conflicts
 */
export class ProfileManagerError extends Error {
  constructor(
    public code: string,
    message: string,
    public provider: string,
    public should_retry: boolean
  ) {
    super(message);
    this.name = 'ProfileManagerError';
  }
}

/**
 * Profile Provider Manager - Coordinates multiple profile providers with fallback
 */
export class ProfileProviderManager {
  private providers: ProfileProviderConfig[];

  constructor() {
    // Initialize providers in priority order (primary → fallback)
    this.providers = [
      {
        name: 'nanoinfluencer' as const,
        priority: 1,
        isAvailable: isNanoInfluencerAvailable,
        fetchProfile: fetchNanoInfluencerProfileServer,
        supportedPlatforms: ['instagram', 'tiktok', 'youtube'] as const
      },
      {
        name: 'ensembledata' as const,
        priority: 2,
        isAvailable: isEnsembleDataAvailable,
        fetchProfile: fetchEnsembleDataProfileServer,
        supportedPlatforms: ['instagram'] as const
      }
    ].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Fetch profile using provider priority with automatic fallback
   */
  async fetchProfile(
    username: string,
    platform: 'instagram' | 'tiktok' | 'youtube',
    preferredProvider?: 'nanoinfluencer' | 'ensembledata'
  ): Promise<StandardizedProfile> {
    console.log(`Profile Manager: Fetching ${username} on ${platform}`);
    
    // Get available providers for this platform
    const availableProviders = this.getAvailableProviders(platform);
    
    if (availableProviders.length === 0) {
      throw new ProfileManagerError(
        'NO_PROVIDERS_AVAILABLE',
        `No providers available for platform ${platform}`,
        'profile-manager',
        false
      );
    }

    // Reorder providers if preferred provider is specified
    const orderedProviders = this.orderProviders(availableProviders, preferredProvider);
    console.log(`Profile Manager: Trying ${orderedProviders.length} providers in order: ${orderedProviders.map(p => p.name).join(' → ')}`);

    let lastError: Error | null = null;
    
    // Try each provider in order
    for (const provider of orderedProviders) {
      try {
        console.log(`Profile Manager: Attempting with ${provider.name}`);
        
        const profile = await provider.fetchProfile(username, platform);
        
        console.log(`Profile Manager: Successfully fetched profile using ${provider.name}`);
        return profile;
        
      } catch (error) {
        console.error(`Profile Manager: ${provider.name} failed:`, error);
        
        // Store the last error
        lastError = error as Error;
        
        // Handle specific provider errors
        if (error instanceof NanoInfluencerProviderError || error instanceof EnsembleDataProviderError) {
          // If it's a user error (not found, private, etc.), don't try other providers
          if (this.isUserError(error.code)) {
            console.log(`Profile Manager: User error detected (${error.code}), not trying other providers`);
            break;
          }
          
          // If provider error should not retry, try next provider
          if (!error.should_retry) {
            console.log(`Profile Manager: ${provider.name} non-retryable error, trying next provider`);
            continue;
          }
        }
        
        // For other errors, continue to next provider
        console.log(`Profile Manager: ${provider.name} error, trying next provider`);
      }
    }

    // All providers failed
    if (lastError) {
      throw new ProfileManagerError(
        'ALL_PROVIDERS_FAILED',
        `All providers failed. Last error: ${lastError.message}`,
        'profile-manager',
        false
      );
    }

    throw new ProfileManagerError(
      'UNKNOWN_ERROR',
      'Failed to fetch profile from any provider',
      'profile-manager',
      false
    );
  }

  /**
   * Get providers that are available and support the given platform
   */
  private getAvailableProviders(platform: 'instagram' | 'tiktok' | 'youtube'): ProfileProviderConfig[] {
    return this.providers.filter(provider => 
      provider.isAvailable() && 
      provider.supportedPlatforms.includes(platform)
    );
  }

  /**
   * Reorder providers based on preference
   */
  private orderProviders(
    providers: ProfileProviderConfig[], 
    preferredProvider?: 'nanoinfluencer' | 'ensembledata'
  ): ProfileProviderConfig[] {
    if (!preferredProvider) {
      return providers;
    }

    const preferred = providers.find(p => p.name === preferredProvider);
    if (!preferred) {
      console.log(`Profile Manager: Preferred provider ${preferredProvider} not available, using default order`);
      return providers;
    }

    // Put preferred provider first, then others in priority order
    return [preferred, ...providers.filter(p => p.name !== preferredProvider)];
  }

  /**
   * Determine if error code represents a user error (shouldn't try other providers)
   */
  private isUserError(errorCode: string): boolean {
    return [
      'USER_NOT_FOUND',
      'PRIVATE_PROFILE',
      'INVALID_INPUT'
    ].includes(errorCode);
  }

  /**
   * Get status of all providers
   */
  getProvidersStatus(): Array<{
    name: string;
    available: boolean;
    supportedPlatforms: string[];
    priority: number;
  }> {
    return this.providers.map(provider => ({
      name: provider.name,
      available: provider.isAvailable(),
      supportedPlatforms: [...provider.supportedPlatforms],
      priority: provider.priority
    }));
  }

  /**
   * Test connectivity to all providers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    for (const provider of this.providers) {
      try {
        results[provider.name] = provider.isAvailable();
      } catch (error) {
        console.error(`Health check failed for ${provider.name}:`, error);
        results[provider.name] = false;
      }
    }
    
    return results;
  }
}

// Singleton instance
export const profileProviderManager = new ProfileProviderManager();