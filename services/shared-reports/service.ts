// src/services/shared-reports.service.ts

import { AnalyticsData } from '@/types/analytics'; // Adjust import path as needed

export interface CreateSharedReportRequest {
  campaignId: string;
  campaignName: string;
  analyticsData: AnalyticsData;
  expiresInDays?: number; // Optional, defaults to 30 days
}

export interface SharedReportResponse {
  shareId: string;
  shareUrl: string;
  expiresAt: string;
}

export interface SharedReportData {
  shareId: string;
  campaignId: string;
  campaignName: string;
  analyticsData: AnalyticsData;
  createdAt: string;
  expiresAt: string;
}

export interface SharedReportListItem {
  shareId: string;
  campaignName: string;
  createdAt: string;
  expiresAt: string;
  shareUrl: string;
}

class SharedReportService {
  private readonly baseUrl = '/api/shared-reports';

  /**
   * Create a new shared report
   */
  async createSharedReport(request: CreateSharedReportRequest): Promise<SharedReportResponse> {
    try {
      const shareId = this.generateShareId(request.campaignId);
      const expiresInDays = request.expiresInDays || 30;
      const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareId,
          campaignId: request.campaignId,
          campaignName: request.campaignName,
          analyticsData: request.analyticsData,
          createdAt: new Date().toISOString(),
          expiresAt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create shared report');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error creating shared report:', error);
      throw error;
    }
  }

  /**
   * Get a specific shared report by shareId
   */
  async getSharedReport(shareId: string): Promise<SharedReportData> {
    try {
      const response = await fetch(`${this.baseUrl}/${shareId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch shared report');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching shared report:', error);
      throw error;
    }
  }

  /**
   * Get all shared reports for a campaign
   */
  async getSharedReportsForCampaign(campaignId: string): Promise<SharedReportListItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}?campaignId=${encodeURIComponent(campaignId)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch shared reports');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching shared reports:', error);
      throw error;
    }
  }

  /**
   * Deactivate a shared report
   */
  async deactivateSharedReport(shareId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${shareId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deactivate shared report');
      }
    } catch (error) {
      console.error('Error deactivating shared report:', error);
      throw error;
    }
  }

  /**
   * Generate a unique share ID
   */
  private generateShareId(campaignId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    return `${campaignId}-${timestamp}-${randomString}`;
  }

  /**
   * Check if a shared report is expired
   */
  isExpired(expiresAt: string): boolean {
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    return now > expirationDate;
  }

  /**
   * Get time remaining until expiration
   */
  getTimeUntilExpiration(expiresAt: string): {
    expired: boolean;
    days: number;
    hours: number;
    minutes: number;
  } {
    const now = new Date();
    const expirationDate = new Date(expiresAt);
    const timeDiff = expirationDate.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return { expired: false, days, hours, minutes };
  }

  /**
   * Generate the full share URL
   */
  generateShareUrl(shareId: string, baseUrl?: string): string {
    const base = baseUrl || window.location.origin;
    return `${base}/shared-report/${shareId}`;
  }

  /**
   * Copy share URL to clipboard
   */
  async copyShareUrlToClipboard(shareId: string, baseUrl?: string): Promise<void> {
    const shareUrl = this.generateShareUrl(shareId, baseUrl);
    
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}

// Export singleton instance
export const sharedReportService = new SharedReportService();