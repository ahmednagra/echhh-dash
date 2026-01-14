// src/services/social-accounts/social-accounts-pricing.server.ts
// FIXED: Server-side service with better error handling and method debugging

import { 
  UpdateSocialAccountPricingRequest,
  UpdateSocialAccountPricingResponse
} from './social-accounts-pricing.client';

/**
 * Update social account pricing from FastAPI backend (server-side)
 * FIXED: Now tries different HTTP methods and provides better debugging
 */
export async function updateSocialAccountPricingServer(
  accountId: string,
  pricingData: UpdateSocialAccountPricingRequest,
  authToken?: string
): Promise<UpdateSocialAccountPricingResponse['data']> {
  try {
    console.log('🚀 [DEBUG] Server Service: Starting updateSocialAccountPricingServer call for', accountId);
    console.log('📦 [DEBUG] Server Service: Pricing data:', pricingData);
    console.log('🔑 [DEBUG] Auth token provided:', authToken ? 'YES' : 'NO');
    console.log('🌍 [DEBUG] Environment:', process.env.NEXT_PUBLIC_APP_ENV || 'local');
    
    // Get the correct backend URL based on environment
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'local';
    let baseUrl = '';
    
    if (appEnv === 'production') {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_PRO!;
    } else if (appEnv === 'development') {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV!;
    } else if (appEnv === 'local') {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
    } else {
      baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
    }
    
    if (!baseUrl) {
      baseUrl = 'http://192.168.18.74:8001'; // Your Postman URL
    }
    
    // Use exact endpoint format from your working Postman request
    const endpoint = `${baseUrl}/api/v0/social-accounts/${accountId}/pricing`;
    
    console.log('[DEBUG] Server Service: Calling FastAPI endpoint:', endpoint);
    console.log('[DEBUG] Server Service: This should match your working Postman URL exactly');
    
    // Format request body to match your working Postman format exactly
    const requestBody = {
      price: pricingData.collaboration_price,
      currency: pricingData.currency
    };
    
    console.log('[DEBUG] Server Service: Request body (should match Postman):', JSON.stringify(requestBody));
    
    // Create headers object properly
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
      console.log('[DEBUG] Auth header added with token length:', authToken.length);
    } else {
      console.log('[WARNING] No auth token provided - this might cause authentication issues');
    }
    
    console.log('[DEBUG] Server Service: Request headers:', Object.keys(headers));
    console.log('[DEBUG] About to make fetch request with exact Postman settings...');
    
    // Try PUT method first (as per your Postman request)
    console.log('Server Service: Attempting PUT request...');
    let response = await fetch(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    console.log('Server Service: Response status:', response.status);
    console.log('Server Service: Response status text:', response.statusText);
    
    // If PUT returns 405, the endpoint might expect a different method
    if (response.status === 405) {
      console.log('Server Service: PUT returned 405, trying PATCH method...');
      response = await fetch(endpoint, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(requestBody)
      });
      console.log('Server Service: PATCH Response status:', response.status);
    }
    
    // If still 405, try POST
    if (response.status === 405) {
      console.log('Server Service: PATCH returned 405, trying POST method...');
      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
      console.log('Server Service: POST Response status:', response.status);
    }
    
    // Check if request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server Service: FastAPI Error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        endpoint: endpoint,
        method: 'PUT/PATCH/POST attempted',
        headers: Object.keys(headers)
      });
      
      // Provide specific error messages based on status
      if (response.status === 404) {
        throw new Error(`Social account with ID ${accountId} not found`);
      } else if (response.status === 405) {
        throw new Error(`Method not allowed. Backend at ${endpoint} doesn't accept PUT, PATCH, or POST requests`);
      } else if (response.status === 401) {
        throw new Error('Authentication failed - invalid or missing token');
      } else if (response.status === 400) {
        throw new Error(`Bad request - ${errorText}`);
      } else {
        throw new Error(`Backend API Error: ${response.status} - ${errorText}`);
      }
    }
    
    const responseData = await response.json();
    console.log('Server Service: Success! FastAPI response data:', responseData);
    
    if (!responseData) {
      console.warn('Server Service: No pricing data received from FastAPI');
      throw new Error('No pricing data received from FastAPI backend');
    }
    
    // Map backend response to frontend format
    const mappedResponse = {
      id: responseData.id || accountId,
      collaboration_price: responseData.collaboration_price || responseData.price,
      currency: responseData.currency || 'USD',
      updated_at: responseData.updated_at || new Date().toISOString(),
      // Include other fields from original account if available
      platform_id: responseData.platform_id || "1",
      account_handle: responseData.account_handle || "updated_account",
      full_name: responseData.full_name || "Updated Account",
      followers_count: responseData.followers_count || 1000,
      is_verified: responseData.is_verified || false,
      is_private: responseData.is_private || false,
      is_business: responseData.is_business || false
    };
    
    console.log('Server Service: Social account pricing updated successfully:', {
      accountId: mappedResponse.id,
      collaboration_price: mappedResponse.collaboration_price,
      currency: mappedResponse.currency,
      updated_at: mappedResponse.updated_at
    });
    
    return mappedResponse;
  } catch (error) {
    console.error('Server Service: Error updating social account pricing:', error);
    
    // Provide more specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error(`Social account with ID ${accountId} not found`);
      } else if (error.message.includes('405')) {
        throw new Error('Method not allowed - backend API endpoint configuration issue');
      } else if (error.message.includes('400')) {
        throw new Error('Invalid pricing data provided');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Authentication required or insufficient permissions');
      } else if (error.message.includes('500')) {
        throw new Error('Internal server error while updating pricing');
      }
    }
    
    throw error;
  }
}