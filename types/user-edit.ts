// src/types/user-edit.ts
// TypeScript interfaces for UserEditModal

import { UserType } from '@/types/auth';
import { UpdateUserRequest } from '@/types/users';

/**
 * Extended user edit form data that includes all possible fields
 * across all user types
 * 
 * Note: status and email_verified are already in UpdateUserRequest,
 * so we don't redefine them here to avoid TypeScript conflicts
 */
export interface UserEditFormData extends UpdateUserRequest {
  id: string;
  email: string; // Read-only, for display
  user_type: UserType; // Read-only, for display
  // status and email_verified are inherited from UpdateUserRequest
}

/**
 * Props for the UserEditModal component
 */
export interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserEditFormData | null;
  onSave: (userId: string, userData: UpdateUserRequest) => Promise<void>;
}

/**
 * Props for field components
 */
export interface FieldComponentProps {
  formData: Partial<UpdateUserRequest>;
  onChange: (field: keyof UpdateUserRequest, value: any) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

/**
 * Validation error structure
 */
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Field configuration for conditional rendering
 */
export interface FieldConfig {
  name: keyof UpdateUserRequest;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  userTypes: UserType[]; // Which user types can edit this field
  backendSupported: boolean; // Whether backend currently supports this field
  options?: Array<{ value: string; label: string }>; // For select fields
}

/**
 * User types for filtering
 */
export const USER_TYPE_LABELS: Record<UserType, string> = {
  platform: 'Platform',
  b2c: 'B2C Company',
  influencer: 'Influencer'
};