// src/types/price-negotiation.ts

export interface PriceNegotiationUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
}

export interface PriceNegotiationStatus {
  id: string;
  name: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired';
  description: string;
}

export interface PriceNegotiation {
  id: string;
  campaign_influencer_id: string;
  proposed_price: number;
  currency: string;
  proposed_by_type: 'client' | 'influencer';
  proposed_by_user_id: string;
  status_id: string;
  responded_at: string | null;
  responded_by_type: 'client' | 'influencer' | null;
  responded_by_user_id: string | null;
  round_number: number;
  parent_negotiation_id: string | null;
  notes: string;
  expires_at: string;
  is_current_active: boolean;
  created_at: string;
  updated_at: string;
  status: PriceNegotiationStatus;
  proposed_by_user: PriceNegotiationUser;
  responded_by_user?: PriceNegotiationUser | null;
}

export interface GetPriceNegotiationsParams {
  campaign_influencer_id: string;
  proposed_by_type?: 'client' | 'influencer';
  is_current_active?: boolean;
  page?: number;
  size?: number;
}

export interface PriceNegotiationsPagination {
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface GetPriceNegotiationsResponse {
  negotiations: PriceNegotiation[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface CreateCounterOfferRequest {
  counter_price: number;
  currency: string;
  notes?: string;
}

export interface AcceptNegotiationResponse {
  id: string;
  campaign_influencer_id: string;
  proposed_price: number;
  currency: string;
  proposed_by_type: 'client' | 'influencer';
  proposed_by_user_id: string;
  status_id: string;
  responded_at: string;
  responded_by_type: 'client' | 'influencer';
  responded_by_user_id: string;
  round_number: number;
  parent_negotiation_id: string | null;
  notes: string;
  is_current_active: boolean;
  status: PriceNegotiationStatus;
}

export interface RejectNegotiationResponse extends AcceptNegotiationResponse {}

export interface CounterOfferResponse extends AcceptNegotiationResponse {}