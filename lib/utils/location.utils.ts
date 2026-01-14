// src/lib/utils/location.utils.ts

import { CreatorLocationSelection, Location } from '@/lib/types';
import { locationService } from '@/services/insights-iq';

/**
 * Cache for location data to avoid repeated API calls
 */
class LocationCache {
  private cache = new Map<string, Location>();
  private pendingRequests = new Map<string, Promise<Location | null>>();

  /**
   * Get location by ID with caching
   */
  async getLocation(id: string): Promise<Location | null> {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(id)) {
      return this.pendingRequests.get(id)!;
    }

    // Make the request
    const request = this.fetchLocation(id);
    this.pendingRequests.set(id, request);

    try {
      const location = await request;
      if (location) {
        this.cache.set(id, location);
      }
      return location;
    } finally {
      this.pendingRequests.delete(id);
    }
  }

  /**
   * Get multiple locations by IDs
   */
  async getLocations(ids: string[]): Promise<(Location | null)[]> {
    const promises = ids.map(id => this.getLocation(id));
    return Promise.all(promises);
  }

  /**
   * Fetch location from API
   */
  private async fetchLocation(id: string): Promise<Location | null> {
    try {
      const result = await locationService.getLocationById(id);
      return result.success ? result.data || null : null;
    } catch (error) {
      console.error(`Error fetching location ${id}:`, error);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Add locations to cache (useful when we get them from search results)
   */
  addToCache(locations: Location[]) {
    locations.forEach(location => {
      this.cache.set(location.id, location);
    });
  }
}

// Export singleton instance
export const locationCache = new LocationCache();

/**
 * Convert location IDs to CreatorLocationSelection objects
 */
export async function convertIdsToLocations(ids: string[]): Promise<CreatorLocationSelection[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  const locations = await locationCache.getLocations(ids);
  
  return locations
    .filter((location): location is Location => location !== null)
    .map(location => ({
      id: location.id,
      name: location.name,
      type: location.type
    }));
}

/**
 * Extract location IDs from CreatorLocationSelection array
 */
export function extractLocationIds(selections: CreatorLocationSelection[]): string[] {
  return selections.map(selection => selection.id);
}

/**
 * Validate location IDs format (basic UUID validation)
 */
export function validateLocationIds(ids: string[]): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return ids.every(id => uuidRegex.test(id));
}

/**
 * Format location display name with type
 */
export function formatLocationDisplay(location: CreatorLocationSelection): string {
  if (location.type) {
    return `${location.name} (${location.type})`;
  }
  return location.name;
}