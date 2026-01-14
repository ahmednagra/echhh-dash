// src/services/public-price-negotiation/public-price-negotiation.server.ts

import { serverApiClient } from '@/lib/server-api';
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

export class PublicPriceNegotiationServerService {
  /**
   * Get public price negotiations for a campaign influencer (server-side)
   */
  static async getPublicPriceNegotiations(
    params: GetPublicPriceNegotiationsParams
  ): Promise<GetPublicPriceNegotiationsResponse> {
    try {
      console.log('🚀 Server: Starting getPublicPriceNegotiations call');
      console.log('📋 Server: Request params:', params);

      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `${ENDPOINTS.PUBLIC.PRICE_NEGOTIATIONS.LIST}?${queryString}`
        : ENDPOINTS.PUBLIC.PRICE_NEGOTIATIONS.LIST;
      
      console.log(`📞 Server: Making API call to ${endpoint}`);
      
      const response = await serverApiClient.get<GetPublicPriceNegotiationsResponse>(
        endpoint,
        {} // No additional headers needed for public endpoint
        // No auth token needed - public endpoint uses token from request params
      );
      
      if (response.error) {
        console.error('❌ Server: FastAPI Error fetching public price negotiations:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        console.warn('⚠️ Server: No response data received from FastAPI');
        throw new Error('No response data received');
      }
      
      console.log('✅ Server: Successfully fetched public price negotiations');
      return response.data;
    } catch (error) {
      console.error(`💥 Server: Error fetching public price negotiations for campaign influencer ${params.campaign_influencer_id}:`, error);
      throw error;
    }
  }

  /**
   * Create a public counter offer for a price negotiation (server-side)
   */
  static async createPublicCounterOffer(
    negotiationId: string,
    data: CreatePublicCounterOfferRequest
  ): Promise<PublicCounterOfferResponse> {
    try {
      console.log(`🚀 Server: Starting createPublicCounterOffer call for ${negotiationId}`);
      console.log('📋 Server: Request data:', data);
      
      const endpoint = ENDPOINTS.PUBLIC.PRICE_NEGOTIATIONS.COUNTER_OFFER(negotiationId);
      console.log(`📞 Server: Making API call to ${endpoint}`);
      
      const response = await serverApiClient.post<PublicCounterOfferResponse>(
        endpoint,
        data,
        {} // No additional headers needed for public endpoint
        // No auth token needed - public endpoint uses token from request body
      );
      
      if (response.error) {
        console.error('❌ Server: FastAPI Error creating public counter offer:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        console.warn('⚠️ Server: No response data received from FastAPI');
        throw new Error('No response data received');
      }
      
      console.log('✅ Server: Successfully created public counter offer');
      return response.data;
    } catch (error) {
      console.error(`💥 Server: Error creating public counter offer for negotiation ${negotiationId}:`, error);
      throw error;
    }
  }

  /**
   * Accept a public price negotiation (server-side)
   */
  static async acceptPublicNegotiation(
    negotiationId: string,
    data: AcceptPublicNegotiationRequest
  ): Promise<PublicAcceptNegotiationResponse> {
    try {
      console.log(`🚀 Server: Starting acceptPublicNegotiation call for ${negotiationId}`);
      console.log('📋 Server: Request data:', data);
      
      const endpoint = ENDPOINTS.PUBLIC.PRICE_NEGOTIATIONS.ACCEPT(negotiationId);
      console.log(`📞 Server: Making API call to ${endpoint}`);
      
      const response = await serverApiClient.post<PublicAcceptNegotiationResponse>(
        endpoint,
        data,
        {} // No additional headers needed for public endpoint
        // No auth token needed - public endpoint uses token from request body
      );
      
      if (response.error) {
        console.error('❌ Server: FastAPI Error accepting public negotiation:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        console.warn('⚠️ Server: No response data received from FastAPI');
        throw new Error('No response data received');
      }
      
      console.log('✅ Server: Successfully accepted public negotiation');
      return response.data;
    } catch (error) {
      console.error(`💥 Server: Error accepting public negotiation ${negotiationId}:`, error);
      throw error;
    }
  }

  /**
   * Reject a public price negotiation (server-side)
   */
  static async rejectPublicNegotiation(
    negotiationId: string,
    data: RejectPublicNegotiationRequest
  ): Promise<PublicRejectNegotiationResponse> {
    try {
      console.log(`🚀 Server: Starting rejectPublicNegotiation call for ${negotiationId}`);
      console.log('📋 Server: Request data:', data);
      
      const endpoint = ENDPOINTS.PUBLIC.PRICE_NEGOTIATIONS.REJECT(negotiationId);
      console.log(`📞 Server: Making API call to ${endpoint}`);
      
      const response = await serverApiClient.post<PublicRejectNegotiationResponse>(
        endpoint,
        data,
        {} // No additional headers needed for public endpoint
        // No auth token needed - public endpoint uses token from request body
      );
      
      if (response.error) {
        console.error('❌ Server: FastAPI Error rejecting public negotiation:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        console.warn('⚠️ Server: No response data received from FastAPI');
        throw new Error('No response data received');
      }
      
      console.log('✅ Server: Successfully rejected public negotiation');
      return response.data;
    } catch (error) {
      console.error(`💥 Server: Error rejecting public negotiation ${negotiationId}:`, error);
      throw error;
    }
  }
}