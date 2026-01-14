// src/services/providers/content-manager.server.ts
import { 
  getInstagramPostDetails,
  mapToBackendFormat as mapEnsembleDataToBackendFormat
} from '@/services/ensembledata/user-detailed-info/instagram.service';
import { 
  getInsightIQPostDetails,
  mapInsightIQToBackendFormat,
  isInsightIQPostAvailable
} from '@/services/insights-iq/posts/posts.server';
import { ContentPlatform } from '@/constants/social-platforms';

// =============================================================================
// INTERFACES
// =============================================================================

export interface ContentProviderConfig {
  name: 'ensembledata' | 'insightiq';
  priority: number;
  isAvailable: () => boolean;
  fetchPost: (input: { url?: string; code?: string; platform?: ContentPlatform }) => Promise<any>;
  mapToBackend: (data: any, campaignId: string) => any;
  supportedPlatforms: readonly ContentPlatform[];
}

/**
 * Content Manager Error class
 */
export class ContentManagerError extends Error {
  constructor(
    public code: string,
    message: string,
    public provider: string,
    public should_retry: boolean
  ) {
    super(message);
    this.name = 'ContentManagerError';
  }
}

/**
 * Content Provider Manager - Coordinates multiple content providers with fallback
 */
export class ContentProviderManager {
  private providers: ContentProviderConfig[];

  constructor() {
    console.log('🔍 Content Manager: Starting initialization...');

    this.providers = [
      {
        name: 'insightiq' as const,
        priority: 1,
        isAvailable: isInsightIQPostAvailable, // FIXED: Use proper availability check
        fetchPost: getInsightIQPostDetails,
        mapToBackend: mapInsightIQToBackendFormat,
        supportedPlatforms: ['instagram', 'tiktok', 'youtube'] as const
      },
      {
        name: 'ensembledata' as const,
        priority: 2,
        isAvailable: () => {
          const hasToken = Boolean(process.env.ENSEMBLEDATA_AUTH_TOKEN);
          console.log('🔍 EnsembleData availability check:', hasToken);
          return hasToken;
        },
        fetchPost: getInstagramPostDetails,
        mapToBackend: mapEnsembleDataToBackendFormat,
        supportedPlatforms: ['instagram'] as const,
      },
    ].sort((a, b) => a.priority - b.priority);

    console.log('✅ Content Manager: Providers initialized');

    const availableForInstagram = this.getAvailableProviders('instagram');
    console.log('🔍 Available providers for Instagram:', availableForInstagram.map(p => p.name));
    console.log('🔍 Total available providers:', availableForInstagram.length);
  }

  /**
   * Fetch post using provider priority with automatic fallback
   */
  async fetchPost(
    input: { url?: string; code?: string },
    platform: ContentPlatform = 'instagram',
    preferredProvider?: 'insightiq' | 'ensembledata'
  ): Promise<any> {
    console.log(`Content Manager: Fetching post for ${platform}`);
    console.log(`Content Manager: Input:`, input);
    
    // Get available providers for this platform
    const availableProviders = this.getAvailableProviders(platform);
    
    console.log(`Content Manager: Found ${availableProviders.length} available providers for ${platform}`);
    
    if (availableProviders.length === 0) {
      throw new ContentManagerError(
        'NO_PROVIDERS_AVAILABLE',
        `No providers available for platform ${platform}`,
        'content-manager',
        false
      );
    }

    const orderedProviders = this.orderProviders(availableProviders, preferredProvider);
    
    console.log(`Content Manager: Trying ${orderedProviders.length} providers in order: ${orderedProviders.map(p => p.name).join(' → ')}`);

    let lastError: Error | null = null;
    
    // Try each provider in order
    for (const provider of orderedProviders) {
      try {
        console.log(`Content Manager: Attempting with ${provider.name}`);

        // Pass platform to provider's fetchPost function
        const postData = await provider.fetchPost({ ...input, platform });

        if (postData.success) {
          console.log(`Content Manager: Successfully fetched post using ${provider.name}`);
          postData.provider_used = provider.name;
          return postData;
        } else {
          throw new Error(postData.message || `${provider.name} failed to fetch post`);
        }
      } catch (error) {
        console.error(`Content Manager: ${provider.name} failed:`, error);
        
        // Store the last error
        lastError = error as Error;
        
        // For user errors (not found, private, etc.), don't try other providers
        if (this.isUserError(error)) {
          console.log(`Content Manager: User error detected, not trying other providers`);
          break;
        }
        
        // Continue to next provider
        console.log(`Content Manager: ${provider.name} error, trying next provider`);
      }
    }

    const errorMessage = lastError ? lastError.message : 'All providers failed';
    console.error(`Content Manager: All providers failed. Last error: ${errorMessage}`);
    
    return {
      user: {
        user_ig_id: '',
        full_name: '',
        profile_pic_url: '',
        username: '',
      },
      post: {
        post_id: '',
        shortcode: '',
        created_at: new Date().toISOString(),
        comments_count: 0,
        likes_count: 0,
        shares_count: 0,
        media_type: 'image',
        is_video: false,
      },
      success: false,
      message: errorMessage,
    };
  }

  /**
   * Map post data to backend format using the appropriate provider
   */
  mapToBackendFormat(postData: any, campaignId: string): any {
    const providerName = postData.provider_used || 'ensembledata'; // Default to ensembledata for backward compatibility
    const provider = this.providers.find(p => p.name === providerName);
    
    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }
    
    return provider.mapToBackend(postData, campaignId);
  }

  /**
   * Get providers that are available and support the given platform
   */
  private getAvailableProviders(platform: ContentPlatform): ContentProviderConfig[] {
    const filtered = this.providers.filter((provider) => {
      const isAvailable = provider.isAvailable();
      const supportsPlatform = provider.supportedPlatforms.includes(platform);

      console.log(
        `Content Manager: Provider ${provider.name} - Available: ${isAvailable}, Supports ${platform}: ${supportsPlatform}`
      );

      return isAvailable && supportsPlatform;
    });

    console.log(`Content Manager: getAvailableProviders result: ${filtered.length} providers`);
    return filtered;
  }

  /**
   * Reorder providers based on preference
   */
  private orderProviders(
    providers: ContentProviderConfig[],
    preferredProvider?: 'insightiq' | 'ensembledata'
  ): ContentProviderConfig[] {
    if (!preferredProvider) {
      return providers;
    }

    const preferred = providers.find(p => p.name === preferredProvider);
    if (!preferred) {
      console.log(`Content Manager: Preferred provider ${preferredProvider} not available, using default order`);
      return providers;
    }

    // Put preferred provider first, then others in priority order
    return [preferred, ...providers.filter(p => p.name !== preferredProvider)];
  }

  /**
   * Determine if error represents a user error (shouldn't try other providers)
   */
  private isUserError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    return (
      errorMessage.includes('not found') ||
      errorMessage.includes('private') ||
      errorMessage.includes('invalid')
    );
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
    return this.providers.map((provider) => ({
      name: provider.name,
      available: provider.isAvailable(),
      supportedPlatforms: [...provider.supportedPlatforms],
      priority: provider.priority
    }));
  }
}

// Singleton instance
export const contentProviderManager = new ContentProviderManager();