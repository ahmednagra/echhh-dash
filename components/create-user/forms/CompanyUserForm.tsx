// src/components/create-user/forms/CompanyUserForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Briefcase, Home, Globe, MapPin, MessageSquare } from 'react-feather';
import FormInput from '../shared/FormInput';
import FormSelect from '../shared/FormSelect';
import FormTextarea from '../shared/FormTextarea';
import { CompanyUserFormData, CompanyRole, Company } from '@/types/create-user';
import { getFieldError } from '@/utils/create-user-validation';
import { fetchRoles } from '@/services/roles/roles.client';
import { fetchCompanies } from '@/services/companies';

interface CompanyUserFormProps {
  formData: Partial<CompanyUserFormData>;
  onChange: (field: string, value: any) => void;
  errors: any[];
  isSubmitting: boolean;
  userType: 'b2c' | 'b2b';
}

interface RoleOption {
  value: string;
  label: string;
}

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Karachi', label: 'Pakistan (PKT)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ur', label: 'Urdu' },
  { value: 'hi', label: 'Hindi' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
];

export default function CompanyUserForm({
  formData,
  onChange,
  errors,
  isSubmitting,
  userType
}: CompanyUserFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  // Fetch roles from API
  const loadRoles = async () => {
    setLoadingRoles(true);
    setRolesError(null);
    try {
      const rolesData = await fetchRoles(userType);
      
      // Transform API response to RoleOption format
      const formattedRoles: RoleOption[] = rolesData.map(role => ({
        value: role.value,
        label: role.label
      }));
      
      setRoles(formattedRoles);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setRolesError('Failed to load roles. Please try again.');
      
      // Fallback to default roles if API fails
      const fallbackRoles: RoleOption[] = [
        { value: 'company_owner', label: 'Company Owner' },
        { value: 'company_admin', label: 'Company Admin' },
        { value: 'marketing_director', label: 'Marketing Director' },
        { value: 'campaign_manager', label: 'Campaign Manager' },
        { value: 'campaign_executive', label: 'Campaign Executive' },
        { value: 'social_media_manager', label: 'Social Media Manager' },
        { value: 'content_creator', label: 'Content Creator' },
        { value: 'brand_manager', label: 'Brand Manager' },
        { value: 'performance_analyst', label: 'Performance Analyst' },
        { value: 'finance_manager', label: 'Finance Manager' },
        { value: 'account_coordinator', label: 'Account Coordinator' },
        { value: 'viewer', label: 'Viewer' },
      ];
      setRoles(fallbackRoles);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Load companies from API
  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const companiesData = await fetchCompanies(0, 100);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      // You can add a toast notification here if you have a toast system
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Load roles when component mounts or userType changes
  useEffect(() => {
    loadRoles();
  }, [userType]);

  useEffect(() => {
    if (formData.company_association === 'existing') {
      loadCompanies();
    }
  }, [formData.company_association]);

  const isNewCompany = formData.company_association === 'new';
  const isExistingCompany = formData.company_association === 'existing';

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="First Name"
            name="first_name"
            type="text"
            value={formData.first_name || ''}
            onChange={onChange}
            error={getFieldError(errors, 'first_name')}
            placeholder="John"
            required
            disabled={isSubmitting}
            icon={<User className="w-5 h-5" />}
          />

          <FormInput
            label="Last Name"
            name="last_name"
            type="text"
            value={formData.last_name || ''}
            onChange={onChange}
            error={getFieldError(errors, 'last_name')}
            placeholder="Doe"
            required
            disabled={isSubmitting}
            icon={<User className="w-5 h-5" />}
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={onChange}
            error={getFieldError(errors, 'email')}
            placeholder="john.doe@company.com"
            required
            disabled={isSubmitting}
            icon={<Mail className="w-5 h-5" />}
          />

          <FormInput
            label="Phone Number"
            name="phone_number"
            type="tel"
            value={formData.phone_number || ''}
            onChange={onChange}
            error={getFieldError(errors, 'phone_number')}
            placeholder="+1 (555) 000-0000"
            disabled={isSubmitting}
            icon={<Phone className="w-5 h-5" />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password || ''}
            onChange={onChange}
            error={getFieldError(errors, 'password')}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
            icon={<Lock className="w-5 h-5" />}
            helpText="Min. 8 characters with uppercase, lowercase, and number"
          />

          <FormInput
            label="Confirm Password"
            name="confirm_password"
            type="password"
            value={formData.confirm_password || ''}
            onChange={onChange}
            error={getFieldError(errors, 'confirm_password')}
            placeholder="••••••••"
            required
            disabled={isSubmitting}
            icon={<Lock className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Company Association Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-purple-600" />
          Company Association
        </h3>

        {/* Association Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you like to associate with a company?
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onChange('company_association', 'existing')}
              disabled={isSubmitting}
              className={`
                relative p-4 border-2 rounded-xl text-left transition-all duration-200
                ${isExistingCompany
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
                  ${isExistingCompany ? 'border-purple-500' : 'border-gray-300'}
                `}>
                  {isExistingCompany && (
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Link to Existing Company</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Join an already registered company on the platform
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChange('company_association', 'new')}
              disabled={isSubmitting}
              className={`
                relative p-4 border-2 rounded-xl text-left transition-all duration-200
                ${isNewCompany
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5
                  ${isNewCompany ? 'border-purple-500' : 'border-gray-300'}
                `}>
                  {isNewCompany && (
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Create New Company</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Register a new company and become its first user
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Existing Company Selection */}
        {isExistingCompany && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <FormSelect
              label="Select Company"
              name="company_id"
              value={formData.company_id || ''}
              onChange={onChange}
              options={companies.map(c => ({ value: c.id, label: `${c.name} (${c.domain})` }))}
              error={getFieldError(errors, 'company_id')}
              placeholder={loadingCompanies ? 'Loading companies...' : 'Select a company'}
              required
              disabled={isSubmitting || loadingCompanies}
              icon={<Home className="w-5 h-5" />}
            />
          </div>
        )}

        {/* New Company Details */}
        {isNewCompany && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <FormInput
              label="Company Name"
              name="company_name"
              type="text"
              value={formData.company_name || ''}
              onChange={onChange}
              error={getFieldError(errors, 'company_name')}
              placeholder="Acme Corporation"
              required
              disabled={isSubmitting}
              icon={<Briefcase className="w-5 h-5" />}
            />

            <FormInput
              label="Company Domain"
              name="company_domain"
              type="text"
              value={formData.company_domain || ''}
              onChange={onChange}
              error={getFieldError(errors, 'company_domain')}
              placeholder="acme.com"
              disabled={isSubmitting}
              icon={<Globe className="w-5 h-5" />}
              helpText="Enter domain without www (e.g., example.com)"
            />
          </div>
        )}

        {/* Role Selection */}
        <div className="mt-4">
          <FormSelect
            label="Role within Company"
            name="role"
            value={formData.role || ''}
            onChange={onChange}
            options={roles}
            error={getFieldError(errors, 'role') || rolesError || undefined}
            placeholder={loadingRoles ? 'Loading roles...' : 'Select your role'}
            required
            disabled={isSubmitting || loadingRoles}
            icon={<Briefcase className="w-5 h-5" />}
          />
          {loadingRoles && (
            <p className="text-xs text-gray-500 mt-1">Fetching available roles...</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormInput
            label="Department"
            name="department"
            type="text"
            value={formData.department || ''}
            onChange={onChange}
            error={getFieldError(errors, 'department')}
            placeholder="e.g., Marketing"
            disabled={isSubmitting}
            icon={<Briefcase className="w-5 h-5" />}
          />

          <FormInput
            label="Job Title"
            name="job_title"
            type="text"
            value={formData.job_title || ''}
            onChange={onChange}
            error={getFieldError(errors, 'job_title')}
            placeholder="e.g., Marketing Manager"
            disabled={isSubmitting}
            icon={<Briefcase className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Optional Profile Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Optional Profile Details
        </h3>

        <div className="space-y-4">
          <FormTextarea
            label="Bio"
            name="bio"
            value={formData.bio || ''}
            onChange={onChange}
            error={getFieldError(errors, 'bio')}
            placeholder="Tell us about yourself..."
            disabled={isSubmitting}
            rows={3}
            maxLength={500}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Location"
              name="location"
              type="text"
              value={formData.location || ''}
              onChange={onChange}
              error={getFieldError(errors, 'location')}
              placeholder="e.g., New York, NY"
              disabled={isSubmitting}
              icon={<MapPin className="w-5 h-5" />}
            />

            <FormSelect
              label="Timezone"
              name="timezone"
              value={formData.timezone || ''}
              onChange={onChange}
              options={TIMEZONES}
              placeholder="Select timezone"
              disabled={isSubmitting}
              icon={<Globe className="w-5 h-5" />}
            />

            <FormSelect
              label="Language"
              name="language"
              value={formData.language || ''}
              onChange={onChange}
              options={LANGUAGES}
              placeholder="Select language"
              disabled={isSubmitting}
              icon={<MessageSquare className="w-5 h-5" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}