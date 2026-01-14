// src/types/users.ts - Updated to import User from auth.ts

import { User, Role } from '@/types/auth';

export interface CompanyBrief {
  id: string;
  name: string;
  domain: string | null;
  created_at: string;
}

export interface UserDetail extends User {
  roles: Role[];
  company: CompanyBrief | null;
}

export interface UpdateUserRequest {
  // Basic fields
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  phone_number?: string | null;
  profile_image_url?: string | null;
  
  // Profile fields
  bio?: string | null;
  location?: string | null;
  timezone?: string | null;
  language?: string | null;
  
  // Job fields
  department?: string | null;
  job_title?: string | null;
  
  // Status fields
  status?: 'active' | 'pending' | 'inactive' | 'suspended' | null;
  email_verified?: boolean;
  
  // 🔥 ADMIN-ONLY FIELDS
  email?: string;                    // For admin email updates
  password?: string;                 // For admin password reset
  company_name?: string;             // For admin company name updates
  company_domain?: string;           // For admin company domain updates
  role_name?: string;                // For admin role updates 🔥 CRITICAL!
}

export interface UpdateUserResponse {
  success: boolean;
  data?: User;
  error?: string;
}

export interface GetUserResponse {
  success: boolean;
  data?: UserDetail;
  error?: string;
}

export interface UserListResponse {
  users: UserDetail[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserStatsResponse {
  total_users: number;
  users_by_type: Record<string, number>;
  users_by_status: Record<string, number>;
  recent_registrations: number;
}

export interface UserStatusUpdate {
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

export interface UserRoleUpdate {
  role_ids: string[];
}

export interface AdminPasswordReset {
  new_password: string;
}

// Updated ProfileFormData interface for components - uses first_name and last_name
export interface ProfileFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bio: string;
  location: string;
  timezone: string;
  language: string;
  profile_image_url: string;
  department?: string;
  job_title?: string;
}

// Password change request interface
export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordChangeResponse {
  success: boolean;
  message: string;
  error?: string;
}

// API response types
export interface UserApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Search and filter parameters
export interface UserSearchParams {
  skip?: number;
  limit?: number;
  user_type?: string;
  status?: string;
  search?: string;
}

// Query parameters for getting users (added from duplicate file)
export interface GetUsersQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  user_type?: 'platform' | 'b2c' | 'influencer';
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
}

// Request/Response interfaces for User API - Updated with flexible fields
export interface GetUsersResponse {
  success?: boolean;
  data?: User[];
  users?: User[];  // Alternative field name for user array
  total?: number;
  count?: number;  // Alternative field name for total count
  page?: number;
  page_size?: number;
  skip?: number;   // Alternative pagination field
  limit?: number;  // Alternative pagination field
  error?: string;
  [key: string]: any;  // Allow additional properties from backend
}