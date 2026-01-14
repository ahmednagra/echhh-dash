// src/services/company-analytics/company-analytics.client.ts

import { 
  GetCompanyAnalyticsRequest,
  CompanyAnalyticsData,
  CompanyAnalyticsResponse
} from '@/types/company-analytics';

/**
 * Get company analytics via Next.js API route (client-side)
 */
export async function getCompanyAnalytics(
  request: GetCompanyAnalyticsRequest
): Promise<CompanyAnalyticsData> {
  const startTime = Date.now();
  
  try {
    console.log('🎯 ===== CLIENT FUNCTION STARTED =====');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🎯 Function: getCompanyAnalytics');
    console.log('📋 Request parameters:', request);
    
    if (typeof window === 'undefined') {
      throw new Error('getCompanyAnalytics can only be called from browser');
    }
    
    // Check token exists
    console.log('🔍 Checking for authentication token...');
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('❌ No authentication token found in localStorage');
      throw new Error('No authentication token found');
    }
    
    console.log('✅ Authentication token found');
    console.log('🔐 Token length:', token.length);
    console.log('🔐 Token preview:', token.substring(0, 20) + '...');
    
    // Build endpoint URL
    const endpoint = `/api/v0/profile-analytics/company/${request.companyId}`;
    console.log('🌐 Base endpoint:', endpoint);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (request.page) queryParams.append('page', request.page.toString());
    if (request.limit) queryParams.append('limit', request.limit.toString());
    if (request.search) queryParams.append('search', request.search);
    if (request.sortBy) queryParams.append('sort_by', request.sortBy);
    if (request.sortOrder) queryParams.append('sort_order', request.sortOrder);
    
    const queryString = queryParams.toString();
    const finalEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    console.log('🔗 Query parameters:', queryString || 'none');
    console.log('🌐 Final endpoint URL:', finalEndpoint);
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log('📨 Request headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': 'Bearer ' + token.substring(0, 20) + '...'
    });
    
    console.log('📞 Making fetch request...');
    const fetchStartTime = Date.now();
    
    // Make the request
    const response = await fetch(finalEndpoint, {
      method: 'GET',
      headers: headers
    });
    
    const fetchEndTime = Date.now();
    const fetchDuration = fetchEndTime - fetchStartTime;
    
    console.log('📦 Fetch completed in:', `${fetchDuration}ms`);
    console.log('📦 Response status:', response.status);
    console.log('📦 Response statusText:', response.statusText);
    console.log('📦 Response ok:', response.ok);
    console.log('📦 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      console.error('❌ Response not ok, attempting to parse error...');
      
      let errorData;
      try {
        errorData = await response.json();
        console.error('❌ Error response data:', errorData);
      } catch (parseError) {
        console.error('❌ Could not parse error response as JSON:', parseError);
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ Throwing error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log('✅ Response ok, parsing JSON...');
    
    let responseData: CompanyAnalyticsResponse;
    try {
      responseData = await response.json();
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ Could not parse response JSON:', parseError);
      throw new Error('Failed to parse response JSON');
    }
    
    console.log('📊 Raw response data:', responseData);
    console.log('📊 Response structure check:', {
      hasSuccess: 'success' in responseData,
      hasData: 'data' in responseData,
      hasError: 'error' in responseData,
      successValue: responseData.success
    });
    
    if (!responseData.success) {
      const errorMsg = responseData.error || 'Failed to get company analytics';
      console.error('❌ API returned success: false, error:', errorMsg);
      throw new Error(errorMsg);
    }
    
    if (!responseData.data) {
      console.error('❌ No data in response');
      throw new Error('No analytics data received');
    }
    
    console.log('✅ Response data structure:', {
      hasInfluencers: 'influencers' in responseData.data,
      influencersCount: responseData.data.influencers?.length || 0,
      total: responseData.data.total,
      page: responseData.data.page,
      totalPages: responseData.data.totalPages
    });
    
    // Log sample influencer if exists
    if (responseData.data.influencers && responseData.data.influencers.length > 0) {
      console.log('👤 First influencer sample:', {
        id: responseData.data.influencers[0].id,
        name: responseData.data.influencers[0].name,
        username: responseData.data.influencers[0].username,
        followers: responseData.data.influencers[0].followers,
        verified: responseData.data.influencers[0].verified
      });
    }
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    console.log('🎉 SUCCESS! Client function completed');
    console.log('⏱️ Total duration:', `${totalDuration}ms`);
    console.log('⏱️ Fetch duration:', `${fetchDuration}ms`);
    console.log('📊 Final data summary:', {
      influencersCount: responseData.data.influencers.length,
      total: responseData.data.total,
      page: responseData.data.page,
      totalPages: responseData.data.totalPages
    });
    console.log('🎯 ===== CLIENT FUNCTION COMPLETED =====\n');
    
    return responseData.data;
    
  } catch (error) {
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    console.error('💥 ===== CLIENT FUNCTION ERROR =====');
    console.error('💥 Error occurred after:', `${totalDuration}ms`);
    console.error('💥 Error in getCompanyAnalytics:', error);
    
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('💥 Error type:', error.constructor.name);
      console.error('💥 Error name:', error.name);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
    } else {
      console.error('💥 Non-Error object thrown:', typeof error, error);
    }
    
    console.error('💥 Request details that failed:', {
      companyId: request.companyId,
      page: request.page,
      limit: request.limit,
      search: request.search || 'none',
      sortBy: request.sortBy || 'none',
      sortOrder: request.sortOrder || 'desc'
    });
    
    console.error('💥 ===== CLIENT FUNCTION ERROR END =====\n');
    
    throw error;
  }
}