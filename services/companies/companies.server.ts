// src/services/companies/companies.server.ts
// Server-side service for companies (runs on Next.js server, calls FastAPI)

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  Company,
  GetCompaniesResponse,
  GetCompanyResponse,
  CreateCompanyRequest,
  CreateCompanyResponse,
  UpdateCompanyRequest,
  UpdateCompanyResponse,
  DeleteCompanyResponse
} from '@/types/company';

/**
 * Get all companies from FastAPI backend
 * @param authToken - Bearer token for authentication
 * @param skip - Number of records to skip (pagination)
 * @param limit - Maximum number of records to return
 * @returns Promise<GetCompaniesResponse>
 */
export async function getCompaniesServer(
  authToken?: string,
  skip: number = 0,
  limit: number = 100
): Promise<GetCompaniesResponse> {
  try {
    const endpoint = ENDPOINTS.COMPANIES.GET_ALL;
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    });
    
    const response = await serverApiClient.get<GetCompaniesResponse>(
      `${endpoint}?${params.toString()}`,
      {},
      authToken
    );

    // Error handling
    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('Server Service: Error fetching companies:', error);
    throw error;
  }
}

/**
 * Get single company by ID from FastAPI backend
 * @param companyId - Company ID
 * @param authToken - Bearer token for authentication
 * @returns Promise<GetCompanyResponse>
 */
export async function getCompanyByIdServer(
  companyId: string,
  authToken?: string
): Promise<GetCompanyResponse> {
  try {
    const endpoint = ENDPOINTS.COMPANIES.GET_BY_ID(companyId);
    
    const response = await serverApiClient.get<GetCompanyResponse>(
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
    console.error('Server Service: Error fetching company:', error);
    throw error;
  }
}

/**
 * Create new company in FastAPI backend
 * @param companyData - Company data to create
 * @param authToken - Bearer token for authentication
 * @returns Promise<CreateCompanyResponse>
 */
export async function createCompanyServer(
  companyData: CreateCompanyRequest,
  authToken?: string
): Promise<CreateCompanyResponse> {
  try {
    const endpoint = ENDPOINTS.COMPANIES.CREATE;
    
    const response = await serverApiClient.post<CreateCompanyResponse>(
      endpoint,
      companyData,
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
    console.error('Server Service: Error creating company:', error);
    throw error;
  }
}

/**
 * Update existing company in FastAPI backend
 * @param companyId - Company ID to update
 * @param companyData - Updated company data
 * @param authToken - Bearer token for authentication
 * @returns Promise<UpdateCompanyResponse>
 */
export async function updateCompanyServer(
  companyId: string,
  companyData: UpdateCompanyRequest,
  authToken?: string
): Promise<UpdateCompanyResponse> {
  try {
    const endpoint = ENDPOINTS.COMPANIES.UPDATE(companyId);
    
    const response = await serverApiClient.put<UpdateCompanyResponse>(
      endpoint,
      companyData,
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
    console.error('Server Service: Error updating company:', error);
    throw error;
  }
}

/**
 * Delete company from FastAPI backend
 * @param companyId - Company ID to delete
 * @param authToken - Bearer token for authentication
 * @returns Promise<DeleteCompanyResponse>
 */
export async function deleteCompanyServer(
  companyId: string,
  authToken?: string
): Promise<DeleteCompanyResponse> {
  try {
    const endpoint = ENDPOINTS.COMPANIES.DELETE(companyId);
    
    const response = await serverApiClient.delete<DeleteCompanyResponse>(
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
    console.error('Server Service: Error deleting company:', error);
    throw error;
  }
}