// src/services/influencer-contacts/influencer-contacts.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  InfluencerContact,
  CreateInfluencerContactRequest,
  CreateInfluencerContactResponse,
  GetInfluencerContactsResponse 
} from '@/types/influencer-contacts';

/**
 * Create influencer contact via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function createInfluencerContact(
  contactData: CreateInfluencerContactRequest
): Promise<CreateInfluencerContactResponse> {
  try {
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new Error('createInfluencerContact can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = '/api/v0/influencer-contacts';
    
    const response = await nextjsApiClient.post<CreateInfluencerContactResponse>(endpoint, contactData);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      throw new Error(response.data?.error || 'Failed to create influencer contact');
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Update influencer contact via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function updateInfluencerContact(
  contactId: string,
  updateData: {
    contact_value?: string;
    name?: string;
    is_primary?: boolean;
    platform_specific?: boolean;
  }
): Promise<void> {
  try {
    console.log(`🚀 Client Service: Starting updateInfluencerContact call for ${contactId}`);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('updateInfluencerContact can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/influencer-contacts/${contactId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    console.log('📦 Client Service: Update data:', updateData);
    
    const response = await nextjsApiClient.put<{ success: boolean; data?: any; error?: string }>(endpoint, updateData);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Client Service: API error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.error('❌ Client Service: Update failed:', response.data?.error);
      throw new Error(response.data?.error || 'Failed to update influencer contact');
    }
    
    console.log('✅ Client Service: Contact updated successfully');
    
  } catch (error) {
    console.error('💥 Client Service: Error updating influencer contact:', error);
    throw error;
  }
}

/**
 * Delete influencer contact via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function deleteInfluencerContact(contactId: string): Promise<void> {
  try {
    console.log(`🚀 Client Service: Starting deleteInfluencerContact call for ${contactId}`);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('deleteInfluencerContact can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/influencer-contacts/${contactId}`;
    console.log(`📞 Client Service: Making DELETE API call to ${endpoint}`);
    
    const response = await nextjsApiClient.delete<{ success: boolean; data?: any; error?: string }>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Client Service: API error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.error('❌ Client Service: Delete failed:', response.data?.error);
      throw new Error(response.data?.error || 'Failed to delete influencer contact');
    }
    
    console.log('✅ Client Service: Contact deleted successfully');
    
  } catch (error) {
    console.error('💥 Client Service: Error deleting influencer contact:', error);
    throw error;
  }
}

/**
 * Get influencer contacts by social account ID via Next.js API route (client-side)
 */
export async function getInfluencerContacts(socialAccountId: string): Promise<InfluencerContact[]> {
  try {
    console.log(`🚀 Client Service: Starting getInfluencerContacts call for ${socialAccountId}`);
    
    // Debug: Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getInfluencerContacts can only be called from browser');
    }
    
    // Debug: Check for auth token
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/influencer-contacts/social-account/${socialAccountId}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<GetInfluencerContactsResponse>(endpoint);
    
    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      dataLength: response.data?.data?.length || 0
    });
    
    if (response.error) {
      console.error('❌ Client Service: API error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
      console.error('❌ Client Service: Invalid response format:', response.data);
      throw new Error(response.data?.error || 'Failed to fetch influencer contacts');
    }
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.data.length} contacts`);
    return response.data.data;
    
  } catch (error) {
    console.error('💥 Client Service: Error fetching influencer contacts:', error);
    throw error;
  }
}