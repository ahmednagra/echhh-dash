// src/components/create-user/forms/PlatformUserForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Shield, Briefcase, MapPin, Globe, MessageSquare } from 'react-feather';
import FormInput from '../shared/FormInput';
import FormSelect from '../shared/FormSelect';
import FormTextarea from '../shared/FormTextarea';
import FormFileUpload from '../shared/FormFileUpload';
import { PlatformUserFormData, PlatformRole } from '@/types/create-user';
import { getFieldError } from '@/utils/create-user-validation';
import { fetchRoles } from '@/services/roles/roles.client';
import { Role } from '@/types/roles';

interface PlatformUserFormProps {
  formData: Partial<PlatformUserFormData>;
  onChange: (field: string, value: any) => void;
  errors: any[];
  isSubmitting: boolean;
  isAdmin?: boolean;
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

const ACCOUNT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

export default function PlatformUserForm({
  formData,
  onChange,
  errors,
  isSubmitting,
  isAdmin = false
}: PlatformUserFormProps) {
  const [platformRoles, setPlatformRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  // Fetch platform roles on component mount
  useEffect(() => {
    const loadPlatformRoles = async () => {
      try {
        setLoadingRoles(true);
        setRolesError(null);
        const roles = await fetchRoles('platform');
        setPlatformRoles(roles);
      } catch (error) {
        console.error('Error loading platform roles:', error);
        setRolesError('Failed to load platform roles');
        setPlatformRoles([]);
      } finally {
        setLoadingRoles(false);
      }
    };

    loadPlatformRoles();
  }, []);

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
            placeholder="john.doe@platform.com"
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

      {/* Role & Access Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Role & Access
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Platform Role"
            name="role"
            value={formData.role || ''}
            onChange={onChange}
            options={platformRoles}
            error={getFieldError(errors, 'role') || rolesError || undefined}
            placeholder={loadingRoles ? "Loading roles..." : "Select platform role"}
            required
            disabled={isSubmitting || loadingRoles}
            icon={<Shield className="w-5 h-5" />}
          />

          <FormInput
            label="Job Title"
            name="job_title"
            type="text"
            value={formData.job_title || ''}
            onChange={onChange}
            error={getFieldError(errors, 'job_title')}
            placeholder="e.g., Senior Developer"
            disabled={isSubmitting}
            icon={<Briefcase className="w-5 h-5" />}
          />

          <FormInput
            label="Department"
            name="department"
            type="text"
            value={formData.department || ''}
            onChange={onChange}
            error={getFieldError(errors, 'department')}
            placeholder="e.g., Engineering"
            disabled={isSubmitting}
            icon={<Briefcase className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Admin Options (Only visible to admins) */}
      {isAdmin && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Admin Options
          </h3>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.email_verified || false}
                  onChange={(e) => onChange('email_verified', e.target.checked)}
                  disabled={isSubmitting}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Mark as verified immediately</span>
                  <p className="text-xs text-gray-500">Skip email verification process</p>
                </div>
              </label>
            </div>

            <FormSelect
              label="Account Status"
              name="account_status"
              value={formData.account_status || 'active'}
              onChange={onChange}
              options={ACCOUNT_STATUSES}
              disabled={isSubmitting}
              icon={<Shield className="w-5 h-5" />}
            />

            <FormFileUpload
              label="Profile Picture"
              name="profile_picture"
              onChange={onChange}
              error={getFieldError(errors, 'profile_picture')}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

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
              placeholder="e.g., San Francisco, CA"
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