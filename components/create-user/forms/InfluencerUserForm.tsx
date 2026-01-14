// src/components/create-user/forms/InfluencerUserForm.tsx
'use client';

import React from 'react';
import { User, Mail, Phone, Lock, Star, MapPin, Globe, MessageSquare } from 'react-feather';
import FormInput from '../shared/FormInput';
import FormSelect from '../shared/FormSelect';
import FormTextarea from '../shared/FormTextarea';
import { InfluencerUserFormData, InfluencerRole } from '@/types/create-user';
import { getFieldError } from '@/utils/create-user-validation';

interface InfluencerUserFormProps {
  formData: Partial<InfluencerUserFormData>;
  onChange: (field: string, value: any) => void;
  errors: any[];
  isSubmitting: boolean;
}

const INFLUENCER_ROLES: { value: InfluencerRole; label: string }[] = [
  { value: 'influencer', label: 'Influencer' },
  { value: 'influencer_manager', label: 'Influencer Manager' },
];

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

export default function InfluencerUserForm({
  formData,
  onChange,
  errors,
  isSubmitting
}: InfluencerUserFormProps) {
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
            placeholder="john.doe@example.com"
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

      {/* Role Selection Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-purple-600" />
          Influencer Role
        </h3>

        <FormSelect
          label="Select Role"
          name="role"
          value={formData.role || 'influencer'}
          onChange={onChange}
          options={INFLUENCER_ROLES}
          error={getFieldError(errors, 'role')}
          placeholder="Select your role"
          required
          disabled={isSubmitting}
          icon={<Star className="w-5 h-5" />}
          helpText="Choose whether you're an influencer or managing influencers"
        />
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
            placeholder="Tell us about yourself and your content..."
            disabled={isSubmitting}
            rows={4}
            maxLength={500}
            helpText="Share your story, content niche, and what makes you unique"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Location"
              name="location"
              type="text"
              value={formData.location || ''}
              onChange={onChange}
              error={getFieldError(errors, 'location')}
              placeholder="e.g., Los Angeles, CA"
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

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              Next Steps After Registration
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              After creating your account, you'll be able to connect your social media profiles, 
              showcase your portfolio, and start collaborating with brands on exciting campaigns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}