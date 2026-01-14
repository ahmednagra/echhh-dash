// src/components/modals/UserEditModal/B2cFields.tsx
// B2C company user specific fields

'use client';

import { Briefcase } from 'react-feather';
import { FieldComponentProps } from '@/types/user-edit';

export default function B2cFields({
  formData,
  onChange,
  errors = {},
  disabled = false
}: FieldComponentProps) {
  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Company User Settings</h3>

      {/* Department Field - FUTURE READY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          🏢 Department
          <span className="text-xs text-gray-400 ml-1">(Coming soon)</span>
        </label>
        <input
          type="text"
          value={formData.department || ''}
          onChange={(e) => onChange('department', e.target.value)}
          disabled={true} // Disabled until backend supports it
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
          placeholder="e.g., Marketing, Sales"
        />
      </div>

      {/* Job Title Field - FUTURE READY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Briefcase className="w-4 h-4 inline mr-1" />
          Job Title
          <span className="text-xs text-gray-400 ml-1">(Coming soon)</span>
        </label>
        <input
          type="text"
          value={formData.job_title || ''}
          onChange={(e) => onChange('job_title', e.target.value)}
          disabled={true} // Disabled until backend supports it
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
          placeholder="e.g., Marketing Manager, Brand Director"
        />
      </div>

      {/* Timezone Field - FUTURE READY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <option value="ur">Urdu</option>
        </select>
      </div>
    </div>
  );
}