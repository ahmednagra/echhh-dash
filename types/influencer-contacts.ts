// src/types/influencer-contacts.ts

import { StatusBrief } from "./campaign-influencers";

// import {CampaignInfluencer} from '@/types/assignment-influencers';

export interface SocialAccount {
  id: string;
  account_handle: string;
  full_name: string;
  platform_id: string;
}

export interface Platform {
  id: string;
  name: string;
  logo_url?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface CampaignInfluencer {
  id: string;
  status_id?: string;
  status?: StatusBrief
}

export interface InfluencerContact {
  id: string;
  social_account_id: string;
  platform_specific: boolean;
  platform_id: string | null;
  role_id: string | null;
  name: string;
  contact_type: ContactType;
  contact_value: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  social_account: SocialAccount;
  platform: Platform | null;
  role: Role | null;
  campaign_influencer?: CampaignInfluencer;
}

export type ContactType = 
  | 'email'
  | 'phone'
  | 'whatsapp'
  | 'telegram'
  | 'other';

export interface CreateInfluencerContactRequest {
  social_account_id: string;
  contact_type: ContactType;
  contact_value: string;
  name: string;
  is_primary: boolean;
  platform_specific: boolean;
  platform_id?: string;
  role_id?: string;
}

export interface CreateInfluencerContactResponse {
  success: boolean;
  data?: InfluencerContact;
  error?: string;
}

export interface GetInfluencerContactsResponse {
  success: boolean;
  data?: InfluencerContact[];
  error?: string;
}