// src/components/modals/UserEditModal/InfluencerFields.tsx
// Influencer user specific fields

'use client';

import { MapPin, Globe } from 'react-feather';
import { FieldComponentProps } from '@/types/user-edit';

export default function InfluencerFields({
  formData,
  onChange,
  errors = {},
  disabled = false
}: FieldComponentProps) {
  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Influencer Profile Settings</h3>

      {/* Location Field - FUTURE READY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="w-4 h-4 inline mr-1" />
          Location
          <span className="text-xs text-gray-400 ml-1">(Coming soon)</span>
        </label>
        <input
          type="text"
          value={formData.location || ''}
          onChange={(e) => onChange('location', e.target.value)}
          disabled={true} // Disabled until backend supports it
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
          placeholder="e.g., Los Angeles, CA"
        />
      </div>

      {/* Timezone Field - FUTURE READY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Globe className="w-4 h-4 inline mr-1" />
          Timezone
          <span className="text-xs text-gray-400 ml-1">(Coming soon)</span>
        </label>
        <select
          value={formData.timezone || ''}
          onChange={(e) => onChange('timezone', e.target.value)}
          disabled={true} // Disabled until backend supports it
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
        >
          <option value="">Select timezone</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
          <option value="America/Chicago">America/Chicago</option>
          <option value="America/Los_Angeles">America/Los_Angeles</option>
          <option value="Europe/London">Europe/London</option>
          <option value="Asia/Karachi">Asia/Karachi</option>
        </select>
      </div>

      {/* Language Preference - FUTURE READY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Language
          <span className="text-xs text-gray-400 ml-1">(Coming soon)</span>
        </label>
        <select
          value={formData.language || ''}
          onChange={(e) => onChange('language', e.target.value)}
          disabled={true} // Disabled until backend supports it
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
        >
          <option value="">Select language</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
        </select>
      </div>

      {/* Bio Field - FUTURE READY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
          <span className="text-xs text-gray-400 ml-1">(Coming soon)</span>
        </label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => onChange('bio', e.target.value)}
          disabled={true} // Disabled until backend supports it
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
          placeholder="Tell us about yourself... (not yet supported)"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will appear on your public profile
        </p>
      </div>
    </div>
  );
}