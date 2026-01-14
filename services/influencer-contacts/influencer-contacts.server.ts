// src/services/influencer-contacts/influencer-contacts.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  InfluencerContact,
  CreateInfluencerContactRequest 
} from '@/types/influencer-contacts';

/**
 * Create influencer contact from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function createInfluencerContactServer(
  contactData: CreateInfluencerContactRequest,
  authToken?: string
): Promise<InfluencerContact> {
  try {
    console.log('Server: Creating influencer contact');
    console.log('Server: Contact data:', contactData);
    
    const endpoint = ENDPOINTS.INFLUENCER_CONTACTS.CREATE;
    
    const response = await serverApiClient.post<InfluencerContact>(
      endpoint,
      contactData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error creating influencer contact:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No influencer contact data received from FastAPI');
      throw new Error('No influencer contact data received');
    }
    
    console.log('Server: Influencer contact created successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Server: Error creating influencer contact:', error);
    throw error;
  }
}

/**
 * Get influencer contacts by social account ID from FastAPI backend (server-side)
 */
export async function getInfluencerContactsServer(
  socialAccountId: string,
  authToken?: string
): Promise<InfluencerContact[]> {
  try {
    console.log(`Server: Fetching influencer contacts for social account ${socialAccountId}`);
    
    const endpoint = ENDPOINTS.INFLUENCER_CONTACTS.BY_SOCIAL_ACCOUNT(socialAccountId);
    
    const response = await serverApiClient.get<InfluencerContact[]>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching influencer contacts:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No influencer contacts data received from FastAPI');
      return [];
    }
    
    console.log('Server: Influencer contacts fetched successfully:', response.data.length);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching influencer contacts for ${socialAccountId}:`, error);
    throw error;
  }
}