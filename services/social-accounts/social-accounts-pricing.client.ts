// src/services/social-accounts/social-accounts-pricing.client.ts
// Client-side service for social accounts pricing operations

import { nextjsApiClient } from '@/lib/nextjs-api';

export interface UpdateSocialAccountPricingRequest {
  collaboration_price: number | null;
  currency: string;
}

export interface UpdateSocialAccountPricingResponse {
  success: boolean;
  data?: {
    id: string;
    collaboration_price: number | null;
    currency: string;
    updated_at: string;
  };
  error?: string;
}

/**
 * Update social account pricing via Next.js API route (client-side)
 */
export async function updateSocialAccountPricing(
  accountId: string,
  pricingData: UpdateSocialAccountPricingRequest
): Promise<UpdateSocialAccountPricingResponse> {
  try {
    console.log('🚀 Client Service: Starting updateSocialAccountPricing call for', accountId);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('updateSocialAccountPricing can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/social-accounts/${accountId}/pricing`;
    
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    console.log('📦 Client Service: Request data:', pricingData);
    
    const response = await nextjsApiClient.put<UpdateSocialAccountPricingResponse>(endpoint, pricingData);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: No valid pricing data received');
      throw new Error(response.data?.error || 'Failed to update social account pricing');
    }
    
    console.log('✅ Client Service: Pricing updated successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateSocialAccountPricing:', error);
    throw error;
  }
}