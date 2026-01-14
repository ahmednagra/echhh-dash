// src/services/insights-iq/languages/index.ts
import { InsightIQBaseService } from '../base.service';
import { INSIGHTIQ_ENDPOINTS } from '../endpoints';
import { ApiResponse } from '../types';

export interface Language {
  name: string;
  code: string; // ISO 639-1 (2-letter code)
}

export interface LanguagesResponse {
  languages: Language[];
}

export class LanguagesService extends InsightIQBaseService {
  private static readonly CACHE_KEY = 'insightiq_languages_cache';
  private static readonly CACHE_DURATION = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
  private static instance: LanguagesService | null = null;

  /**
   * Get singleton instance
   */
  private static getInstance(): LanguagesService {
    if (!this.instance) {
      this.instance = new LanguagesService();
    }
    return this.instance;
  }

  /**
   * Get cached languages data
   */
  private static getCachedData(): LanguagesResponse | null {
    if (typeof window === 'undefined') return null; // Server-side check
    
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid (15 days)
      if (now - timestamp < this.CACHE_DURATION) {
        return data;
      }

      // Cache expired, remove it
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error reading languages cache:', error);
      return null;
    }
  }

  /**
   * Cache languages data
   */
  private static setCachedData(data: LanguagesResponse): void {
    if (typeof window === 'undefined') return; // Server-side check
    
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Error caching languages data:', error);
    }
  }

  /**
   * Fetch languages from API using base service
   */
  private async fetchFromAPI(): Promise<LanguagesResponse> {
    const response: ApiResponse<LanguagesResponse> = await this.makeRequest<LanguagesResponse>(
      INSIGHTIQ_ENDPOINTS.LANGUAGES,
      {
        method: 'GET'
      }
    );

    if (!response.success) {
      throw new Error(
        `Languages API error: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data!;
  }

  /**
   * Get all languages with caching
   */
  static async getLanguages(): Promise<LanguagesResponse> {
    // Try to get from cache first
    const cachedData = this.getCachedData();
    if (cachedData) {
      return cachedData;
    }

    // Fetch from API using singleton instance
    const service = this.getInstance();
    const data = await service.fetchFromAPI();
    
    // Cache the result
    this.setCachedData(data);
    
    return data;
  }

  /**
   * Search languages by name (client-side filtering since API doesn't support search)
   */
  static async searchLanguages(searchQuery: string): Promise<Language[]> {
    const { languages } = await this.getLanguages();
    
    if (!searchQuery.trim()) {
      return languages;
    }

    const query = searchQuery.toLowerCase().trim();
    return languages.filter(language => 
      language.name.toLowerCase().includes(query) ||
      language.code.toLowerCase().includes(query)
    );
  }

  /**
   * Get language by code
   */
  static async getLanguageByCode(code: string): Promise<Language | null> {
    const { languages } = await this.getLanguages();
    return languages.find(lang => lang.code === code) || null;
  }

  /**
   * Get multiple languages by codes
   */
  static async getLanguagesByCodes(codes: string[]): Promise<Language[]> {
    const { languages } = await this.getLanguages();
    return languages.filter(lang => codes.includes(lang.code));
  }
}