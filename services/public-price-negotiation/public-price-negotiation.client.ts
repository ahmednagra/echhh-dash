// src/services/public-price-negotiation/public-price-negotiation.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  GetPublicPriceNegotiationsParams,
  GetPublicPriceNegotiationsResponse,
  CreatePublicCounterOfferRequest,
  PublicAcceptNegotiationResponse,
  PublicRejectNegotiationResponse,
  PublicCounterOfferResponse,
  AcceptPublicNegotiationRequest,
  RejectPublicNegotiationRequest
} from '@/types/public-price-negotiation';

const API_VERSION = '/api/v0';

export class PublicPriceNegotiationClientService {
  /**
   * Get public price negotiations for a campaign influencer via Next.js API route (client-side)
   */
  static async getPublicPriceNegotiations(params: GetPublicPriceNegotiationsParams): Promise<GetPublicPriceNegotiationsResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('getPublicPriceNegotiations can only be called from browser');
      }
      
      console.log('🚀 Client Service: Starting getPublicPriceNegotiations');
      console.log('📋 Client Service: Request params:', params);

      const queryString = new URLSearchParams({
        campaign_influencer_id: params.campaign_influencer_id,
        token: params.token,
        ...(params.proposed_by_type && { proposed_by_type: params.proposed_by_type }),
        ...(params.is_current_active !== undefined && { is_current_active: String(params.is_current_active) }),
        ...(params.page && { page: String(params.page) }),
        ...(params.size && { size: String(params.size) }),
      }).toString();

      const endpoint = API_VERSION + ENDPOINTS.PUBLIC.PRICE_NEGOTIATIONS.LIST;
      const url = `${endpoint}?${queryString}`;

      const response = await nextjsApiClient.get<GetPublicPriceNegotiationsResponse>(
        url,
        { auth: false } // No auth header needed for public endpoint
      );
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        console.warn('⚠️ Client Service: No response data received');
        throw new Error('Failed to get public price negotiations');
      }
      
      console.log('✅ Client Service: Successfully fetched public price negotiations');
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in getPublicPriceNegotiations:', error);
      throw error;
    }
  }

  /**
   * Create a public counter offer for a price negotiation (client-side)
   */
  static async createPublicCounterOffer(
    negotiationId: string, 
    data: CreatePublicCounterOfferRequest
  ): Promise<PublicCounterOfferResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('createPublicCounterOffer can only be called from browser');
      }
      
      console.log(`🚀 Client Service: Starting createPublicCounterOffer for ${negotiationId}`);
      console.log('📋 Client Service: Request data:', data);

      const endpoint = API_VERSION + ENDPOINTS.PUBLIC.PRICE_NEGOTIATIONS.COUNTER_OFFER(negotiationId);

      const response = await nextjsApiClient.post<PublicCounterOfferResponse>(
        endpoint, 
        data,
        { auth: false } // No auth header needed for public endpoint
      );
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        console.warn('⚠️ Client Service: No response data received');
        throw new Error('Failed to create public counter offer');
      }
      
      console.log('✅ Client Service: Successfully created public counter offer');
      return response.data;
    } catch (error) {
      console.error(`💥 Client Service: Error in createPublicCounterOffer for ${negotiationId}:`, error);
      throw error;
    }
  }

  /**
   * Accept a public price negotiation (client-side)
   */
  static async acceptPublicNegotiation(
    negotiationId: string,
    data: AcceptPublicNegotiationRequest
  ): Promise<PublicAcceptNegotiationResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('acceptPublicNegotiation can only be called from browser');
      }
      
      console.log(`🚀 Client Service: Starting acceptPublicNegotiation for ${negotiationId}`);
      console.log('📋 Client Service: Request data:', data);

      const endpoint = API_VERSION + ENDPOINTS.PUBLIC.PRICE_NEGOTIATIONS.ACCEPT(negotiationId);

      const response = await nextjsApiClient.post<PublicAcceptNegotiationResponse>(
        endpoint, 
        data,
        { auth: false } // No auth header needed for public endpoint
      );
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        console.warn('⚠️ Client Service: No response data received');
        throw new Error('Failed to accept public negotiation');
      }
      
      console.log('✅ Client Service: Successfully accepted public negotiation');
      return response.data;
    } catch (error) {
      console.error(`💥 Client Service: Error in acceptPublicNegotiation for ${negotiationId}:`, error);
      throw error;
    }
  }

  /**
   * Reject a public price negotiation (client-side)
   */
  static async rejectPublicNegotiation(
    negotiationId: string,
    data: RejectPublicNegotiationRequest
  ): Promise<PublicRejectNegotiationResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('rejectPublicNegotiation can only be called from browser');
      }
      
      console.log(`🚀 Client Service: Starting rejectPublicNegotiation for ${negotiationId}`);
      console.log('📋 Client Service: Request data:', data);

      const endpoint = API_VERSION + ENDPOINTS.PUBLIC.PRICE_NEGOTIATIONS.REJECT(negotiationId);

      const response = await nextjsApiClient.post<PublicRejectNegotiationResponse>(
        endpoint, 
        data,
        { auth: false } // No auth header needed for public endpoint
      );
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        console.warn('⚠️ Client Service: No response data received');
        throw new Error('Failed to reject public negotiation');
      }
      
      console.log('✅ Client Service: Successfully rejected public negotiation');
      return response.data;
    } catch (error) {
      console.error(`💥 Client Service: Error in rejectPublicNegotiation for ${negotiationId}:`, error);
      throw error;
    }
  }
}