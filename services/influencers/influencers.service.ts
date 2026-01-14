// src/services/influencers/influencers.service.ts
import { get, post, put, del } from '../api';
import { ENDPOINTS } from '../api/endpoints';
import { 
  Influencer, 
  InfluencerAnalytics, 
  InfluencerSearchParams,
  InfluencerListResponse
} from './influencers.types';

/**
 * Get a list of influencers
 */
export const getInfluencers = async (params?: InfluencerSearchParams): Promise<InfluencerListResponse> => {
  // Convert params object to URLSearchParams
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${ENDPOINTS.INFLUENCERS.LIST}?${queryString}`
    : ENDPOINTS.INFLUENCERS.LIST;
  
  const response = await get<InfluencerListResponse>(endpoint);
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new Error('No data received from server');
  }
  
  return response.data;
};

/**
 * Get an influencer by ID
 */
export const getInfluencer = async (id: string): Promise<Influencer> => {
  const response = await get<Influencer>(ENDPOINTS.INFLUENCERS.DETAIL(id));
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new Error('No data received from server');
  }
  
  return response.data;
};

/**
 * Get analytics for an influencer
 */
export const getInfluencerAnalytics = async (id: string): Promise<InfluencerAnalytics> => {
  const response = await get<InfluencerAnalytics>(ENDPOINTS.INFLUENCERS.ANALYTICS(id));
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new Error('No data received from server');
  }
  
  return response.data;
};

/**
 * Search for influencers
 */
export const searchInfluencers = async (params: InfluencerSearchParams): Promise<InfluencerListResponse> => {
  const response = await post<InfluencerListResponse>(ENDPOINTS.INFLUENCERS.SEARCH, params);
  
  if (response.error) {
    throw response.error;
  }
  
  if (!response.data) {
    throw new Error('No data received from server');
  }
  
  return response.data;
};