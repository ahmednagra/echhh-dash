// src/types/company.ts

/**
 * Company entity interface
 */
export interface Company {
  id: string;
  name: string;
  domain: string;
  type?: 'b2b' | 'b2c';
  created_at?: string;
  updated_at?: string;
}

/**
 * Request interface for creating a company
 */
export interface CreateCompanyRequest {
  name: string;
  domain: string;
  type: 'b2b' | 'b2c';
}

/**
 * Request interface for updating a company
 */
export interface UpdateCompanyRequest {
  name?: string;
  domain?: string;
  type?: 'b2b' | 'b2c';
}

/**
 * Response interface for GET /companies (list)
 */
export interface GetCompaniesResponse {
  success: boolean;
  data: Company[];
  error?: string;
}

/**
 * Response interface for GET /companies/:id (single)
 */
export interface GetCompanyResponse {
  success: boolean;
  data: Company;
  error?: string;
}

/**
 * Response interface for POST /companies (create)
 */
export interface CreateCompanyResponse {
  success: boolean;
  data: Company;
  error?: string;
}

/**
 * Response interface for PUT /companies/:id (update)
 */
export interface UpdateCompanyResponse {
  success: boolean;
  data: Company;
  error?: string;
}

/**
 * Response interface for DELETE /companies/:id
 */
export interface DeleteCompanyResponse {
  success: boolean;
  message: string;
  error?: string;
}