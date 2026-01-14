// src/services/price-negotiation/price-negotiation.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  GetPriceNegotiationsParams,
  GetPriceNegotiationsResponse,
  CreateCounterOfferRequest,
  AcceptNegotiationResponse,
  RejectNegotiationResponse,
  CounterOfferResponse
} from '@/types/price-negotiation';

export class PriceNegotiationServerService {
  /**
   * Get price negotiations for a campaign influencer (server-side)
   */
  static async getPriceNegotiations(
    params: GetPriceNegotiationsParams,
    authToken?: string
  ): Promise<GetPriceNegotiationsResponse> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `${ENDPOINTS.PRICE_NEGOTIATIONS.LIST}?${queryString}`
        : ENDPOINTS.PRICE_NEGOTIATIONS.LIST;
      
      const response = await serverApiClient.get<GetPriceNegotiationsResponse>(
        endpoint,
        {},
        authToken
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      return response.data;
    } catch (error) {
      console.error(`💥 Server Service: Error fetching price negotiations for campaign influencer ${params.campaign_influencer_id}:`, error);
      throw error;
    }
  }

  /**
   * Create a counter offer for a price negotiation (server-side)
   */
  static async createCounterOffer(
    negotiationId: string,
    data: CreateCounterOfferRequest,
    authToken?: string
  ): Promise<CounterOfferResponse> {
    try {
      const endpoint = ENDPOINTS.PRICE_NEGOTIATIONS.COUNTER_OFFER(negotiationId);
      
      const response = await serverApiClient.post<CounterOfferResponse>(
        endpoint,
        data,
        {},
        authToken
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      return response.data;
    } catch (error) {
      console.error(`💥 Server Service: Error creating counter offer for negotiation ${negotiationId}:`, error);
      throw error;
    }
  }

  /**
   * Accept a price negotiation (server-side)
   */
  static async acceptNegotiation(
    negotiationId: string,
    authToken?: string
  ): Promise<AcceptNegotiationResponse> {
    try {
      const endpoint = ENDPOINTS.PRICE_NEGOTIATIONS.ACCEPT(negotiationId);
      
      const response = await serverApiClient.post<AcceptNegotiationResponse>(
        endpoint,
        {},
        {},
        authToken
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      return response.data;
    } catch (error) {
      console.error(`💥 Server Service: Error accepting negotiation ${negotiationId}:`, error);
      throw error;
    }
  }

  /**
   * Reject a price negotiation (server-side)
   */
  static async rejectNegotiation(
    negotiationId: string,
    authToken?: string
  ): Promise<RejectNegotiationResponse> {
    try {
      const endpoint = ENDPOINTS.PRICE_NEGOTIATIONS.REJECT(negotiationId);
      
      const response = await serverApiClient.post<RejectNegotiationResponse>(
        endpoint,
        {},
        {},
        authToken
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      return response.data;
    } catch (error) {
      console.error(`💥 Server Service: Error rejecting negotiation ${negotiationId}:`, error);
      throw error;
    }
  }
}