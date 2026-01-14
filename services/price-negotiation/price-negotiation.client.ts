// src/services/price-negotiation/price-negotiation.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  GetPriceNegotiationsParams,
  GetPriceNegotiationsResponse,
  CreateCounterOfferRequest,
  AcceptNegotiationResponse,
  RejectNegotiationResponse,
  CounterOfferResponse
} from '@/types/price-negotiation';

const API_VERSION = '/api/v0';

export class PriceNegotiationClientService {
  /**
   * Get price negotiations for a campaign influencer via Next.js API route (client-side)
   */
  static async getPriceNegotiations(params: GetPriceNegotiationsParams): Promise<GetPriceNegotiationsResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('getPriceNegotiations can only be called from browser');
      }
      
      // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryString = new URLSearchParams({
        campaign_influencer_id: params.campaign_influencer_id,
        ...(params.proposed_by_type && { proposed_by_type: params.proposed_by_type }),
        ...(params.is_current_active !== undefined && { is_current_active: String(params.is_current_active) }),
        ...(params.page && { page: String(params.page) }),
        ...(params.size && { size: String(params.size) }),
      }).toString();

      const endpoint = API_VERSION + ENDPOINTS.PRICE_NEGOTIATIONS.LIST;
      const url = `${endpoint}?${queryString}`;

      const response = await nextjsApiClient.get<GetPriceNegotiationsResponse>(url);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('Failed to fetch price negotiations');
      }
      
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in getPriceNegotiations:', error);
      throw error;
    }
  }

  /**
   * Create a counter offer for a price negotiation via Next.js API route (client-side)
   */
  static async createCounterOffer(
    negotiationId: string, 
    data: CreateCounterOfferRequest
  ): Promise<CounterOfferResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('createCounterOffer can only be called from browser');
      }
      
      // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = API_VERSION + ENDPOINTS.PRICE_NEGOTIATIONS.COUNTER_OFFER(negotiationId);

      const response = await nextjsApiClient.post<CounterOfferResponse>(endpoint, data);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('Failed to create counter offer');
      }
      
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in createCounterOffer:', error);
      throw error;
    }
  }

  /**
   * Accept a price negotiation via Next.js API route (client-side)
   */
  static async acceptNegotiation(negotiationId: string): Promise<AcceptNegotiationResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('acceptNegotiation can only be called from browser');
      }
      
      // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = API_VERSION + ENDPOINTS.PRICE_NEGOTIATIONS.ACCEPT(negotiationId);

      const response = await nextjsApiClient.post<AcceptNegotiationResponse>(endpoint, {});
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('Failed to accept negotiation');
      }
      
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in acceptNegotiation:', error);
      throw error;
    }
  }

  /**
   * Reject a price negotiation via Next.js API route (client-side)
   */
  static async rejectNegotiation(negotiationId: string): Promise<RejectNegotiationResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('rejectNegotiation can only be called from browser');
      }
      
      // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = API_VERSION + ENDPOINTS.PRICE_NEGOTIATIONS.REJECT(negotiationId);

      const response = await nextjsApiClient.post<RejectNegotiationResponse>(endpoint, {});
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('Failed to reject negotiation');
      }
      
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in rejectNegotiation:', error);
      throw error;
    }
  }
}