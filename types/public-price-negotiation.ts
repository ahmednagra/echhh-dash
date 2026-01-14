// src/types/public-price-negotiation.ts

import { 
  PriceNegotiation, 
  GetPriceNegotiationsResponse,
  CreateCounterOfferRequest,
  AcceptNegotiationResponse,
  RejectNegotiationResponse,
  CounterOfferResponse
} from './price-negotiation';

// Extended request types for public endpoints that include token
export interface GetPublicPriceNegotiationsParams {
  campaign_influencer_id: string;
  token: string;
  proposed_by_type?: 'client' | 'influencer';
  is_current_active?: boolean;
  page?: number;
  size?: number;
}

export interface CreatePublicCounterOfferRequest extends CreateCounterOfferRequest {
  token: string;
}

export interface AcceptPublicNegotiationRequest {
  token: string;
}

export interface RejectPublicNegotiationRequest {
  token: string;
}

// Response types remain the same as they don't need token
export interface GetPublicPriceNegotiationsResponse extends GetPriceNegotiationsResponse {}
export interface PublicCounterOfferResponse extends CounterOfferResponse {}
export interface PublicAcceptNegotiationResponse extends AcceptNegotiationResponse {}
export interface PublicRejectNegotiationResponse extends RejectNegotiationResponse {}