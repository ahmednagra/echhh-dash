// src/types/roles.ts

/**
 * Role data structure from API
 */
export interface Role {
  value: string;
  label: string;
}

/**
 * Response from GET /api/v0/roles
 */
export interface GetRolesResponse {
  success: boolean;
  data: Role[];
  error?: string;
}

/**
 * Query parameters for roles endpoint
 */
export interface GetRolesParams {
  user_type: 'b2c' | 'b2b' | 'platform' | 'influencer';
}