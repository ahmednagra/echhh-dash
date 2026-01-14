// src/services/companies/companies.client.ts
// OPTION 2: Using type assertion to avoid TypeScript errors

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '@/types/company';

const API_VERSION = '/api/v0';

/**
 * Fetch all companies from Next.js API route
 */
export async function fetchCompanies(
  skip: number = 0,
  limit: number = 100
): Promise<Company[]> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('fetchCompanies can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    });

    const endpoint = `${API_VERSION}${ENDPOINTS.COMPANIES.GET_ALL}?${params.toString()}`;
    
    // Use any type and manual validation
    const response: any = await nextjsApiClient.get(endpoint, {});

    if (response?.error) {
      throw new Error(response.error);
    }

    if (!response?.data) {
      throw new Error('Failed to fetch companies - no data in response');
    }

    return response.data as Company[];
  } catch (error) {
    console.error('Client Service: Error in fetchCompanies:', error);
    throw error;
  }
}

/**
 * Fetch single company by ID from Next.js API route
 */
export async function fetchCompanyById(companyId: string): Promise<Company> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('fetchCompanyById can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.COMPANIES.GET_BY_ID(companyId)}`;
    
    const response: any = await nextjsApiClient.get(endpoint, {});

    if (response?.error) {
      throw new Error(response.error);
    }

    if (!response?.data) {
      throw new Error('Failed to fetch company - no data in response');
    }

    return response.data as Company;
  } catch (error) {
    console.error('Client Service: Error in fetchCompanyById:', error);
    throw error;
  }
}

/**
 * Create new company via Next.js API route
 */
export async function createCompany(
  companyData: CreateCompanyRequest
): Promise<Company> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('createCompany can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.COMPANIES.CREATE}`;
    
    const response: any = await nextjsApiClient.post(
      endpoint,
      companyData,
      {}
    );

    if (response?.error) {
      throw new Error(response.error);
    }

    if (!response?.data) {
      throw new Error('Failed to create company - no data in response');
    }

    return response.data as Company;
  } catch (error) {
    console.error('Client Service: Error in createCompany:', error);
    throw error;
  }
}

/**
 * Update existing company via Next.js API route
 */
export async function updateCompany(
  companyId: string,
  companyData: UpdateCompanyRequest
): Promise<Company> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('updateCompany can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.COMPANIES.UPDATE(companyId)}`;
    
    const response: any = await nextjsApiClient.put(
      endpoint,
      companyData,
      {}
    );

    if (response?.error) {
      throw new Error(response.error);
    }

    if (!response?.data) {
      throw new Error('Failed to update company - no data in response');
    }

    return response.data as Company;
  } catch (error) {
    console.error('Client Service: Error in updateCompany:', error);
    throw error;
  }
}

/**
 * Delete company via Next.js API route
 */
export async function deleteCompany(
  companyId: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('deleteCompany can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.COMPANIES.DELETE(companyId)}`;
    
    const response: any = await nextjsApiClient.delete(
      endpoint,
      {}
    );

    if (response?.error) {
      throw new Error(response.error);
    }

    return {
      success: response.success ?? true,
      message: response.message || 'Company deleted successfully'
    };
  } catch (error) {
    console.error('Client Service: Error in deleteCompany:', error);
    throw error;
  }
}