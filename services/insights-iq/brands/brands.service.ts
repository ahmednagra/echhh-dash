// src/services/insights-iq/brands/brands.service.ts

import { InsightIQBaseService } from '../base.service';
import { INSIGHTIQ_ENDPOINTS } from '../endpoints';
import { 
  BrandsResponse, 
  ProcessedBrand, 
  BrandsServiceResponse,
  BRANDS_CACHE_KEY,
  BRANDS_CACHE_DURATION 
} from './types';
import { ApiResponse } from '../types';

/**
 * Service for handling brands-related API calls to InsightIQ
 */
export class BrandsService extends InsightIQBaseService {
  
  /**
   * Get all available brands from InsightIQ API
   */
  async getBrands(): Promise<BrandsServiceResponse> {
    try {
      console.log('🏢 Fetching brands from InsightIQ API...');

      const response: ApiResponse<BrandsResponse> = await this.makeRequest<BrandsResponse>(
        INSIGHTIQ_ENDPOINTS.BRANDS,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json, application/xml'
          }
        }
      );

      if (!response.success || !response.data) {
        console.error('❌ Failed to fetch brands:', response.error);
        return {
          success: false,
          error: response.error?.message || 'Failed to fetch brands'
        };
      }

      console.log(`✅ Successfully fetched ${response.data.brands.length} brands`);

      // Process the brands data
      const processedBrands = this.processBrands(response.data.brands);

      return {
        success: true,
        data: processedBrands
      };

    } catch (error) {
      console.error('❌ Error in getBrands:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Process raw brands data into frontend-friendly format
   */
  private processBrands(brands: Array<{ name: string }>): ProcessedBrand[] {
    return brands
      .filter(brand => brand.name && brand.name.trim()) // Filter out empty names
      .map((brand, index) => ({
        id: this.generateBrandId(brand.name),
        name: brand.name.trim(),
        searchable: brand.name.toLowerCase().trim()
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  }

  /**
   * Generate a consistent ID for a brand
   */
  private generateBrandId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  /**
   * Search brands by query
   */
  searchBrands(brands: ProcessedBrand[], query: string): ProcessedBrand[] {
    if (!query || !query.trim()) {
      return brands;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return brands.filter(brand => 
      brand.searchable.includes(searchTerm) ||
      brand.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get brands with caching
   */
  async getBrandsWithCache(): Promise<BrandsServiceResponse> {
    try {
      // Try to get from cache first
      const cached = await this.getCachedBrands();
      if (cached) {
        console.log('📋 Returning cached brands');
        return {
          success: true,
          data: cached
        };
      }

      // Fetch fresh data
      const response = await this.getBrands();
      
      // Cache the successful response
      if (response.success && response.data) {
        await this.setCachedBrands(response.data);
      }

      return response;
    } catch (error) {
      console.error('❌ Error in getBrandsWithCache:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get cached brands (implement based on your caching strategy)
   */
  private async getCachedBrands(): Promise<ProcessedBrand[] | null> {
    try {
      // This is a placeholder - implement based on your caching solution
      // Could be Redis, memory cache, database, etc.
      
      if (typeof window !== 'undefined') {
        // Client-side cache (not recommended for production)
        const cached = localStorage.getItem(BRANDS_CACHE_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          const isExpired = Date.now() - data.timestamp > (BRANDS_CACHE_DURATION * 1000);
          if (!isExpired) {
            return data.brands;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting cached brands:', error);
      return null;
    }
  }

  /**
   * Set cached brands (implement based on your caching strategy)
   */
  private async setCachedBrands(brands: ProcessedBrand[]): Promise<void> {
    try {
      // This is a placeholder - implement based on your caching solution
      
      if (typeof window !== 'undefined') {
        // Client-side cache (not recommended for production)
        const cacheData = {
          brands,
          timestamp: Date.now()
        };
        localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(cacheData));
      }

      console.log(`💾 Cached ${brands.length} brands`);
    } catch (error) {
      console.error('Error caching brands:', error);
    }
  }
}

// Export singleton instance
export const brandsService = new BrandsService();