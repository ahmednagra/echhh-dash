// src/types/create-user.ts

export type UserType = 'platform' | 'b2c' | 'b2b' | 'influencer';

export type PlatformRole = 
  | 'platform_super_admin'
  | 'platform_admin'
  | 'platform_manager'
  | 'platform_developer'
  | 'platform_customer_support'
  | 'platform_agent';

export type CompanyRole = 
  | 'company_owner'
  | 'company_admin'
  | 'marketing_director'
  | 'campaign_manager'
  | 'campaign_executive'
  | 'social_media_manager'
  | 'content_creator'
  | 'brand_manager'
  | 'performance_analyst'
  | 'finance_manager'
  | 'account_coordinator'
  | 'viewer';

export type InfluencerRole = 'influencer' | 'influencer_manager';

export type AccountStatus = 'active' | 'inactive' | 'suspended';

export interface BaseUserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password: string;
  confirm_password: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  profile_picture?: File;
}

export interface PlatformUserFormData extends BaseUserFormData {
  user_type: 'platform';
  role: PlatformRole;
  department?: string;
  job_title?: string;
  email_verified?: boolean;
  account_status?: AccountStatus;
}

export interface CompanyUserFormData extends BaseUserFormData {
  user_type: 'b2c' | 'b2b';
  role: CompanyRole;
  company_association: 'existing' | 'new';
  company_id?: string;
  company_name?: string;
  company_domain?: string;
  department?: string;
  job_title?: string;
}

export interface InfluencerUserFormData extends BaseUserFormData {
  user_type: 'influencer';
  role: InfluencerRole;
}

export type UserFormData = 
  | PlatformUserFormData 
  | CompanyUserFormData 
  | InfluencerUserFormData;

export interface Company {
  id: string;
  name: string;
  domain: string;
  type: 'b2c' | 'b2b';
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormStepProps {
  formData: Partial<UserFormData>;
  onChange: (field: string, value: any) => void;
  errors: ValidationError[];
  isSubmitting: boolean;
}