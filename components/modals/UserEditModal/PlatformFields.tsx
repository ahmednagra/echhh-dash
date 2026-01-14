// src/components/modals/UserEditModal/PlatformFields.tsx
// Platform user specific fields

'use client';

import { Briefcase, Users } from 'react-feather';
import { FieldComponentProps } from '@/types/user-edit';

export default function PlatformFields({
  formData,
  onChange,
  errors = {},
  disabled = false
}: FieldComponentProps) {
  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Platform User Settings</h3>

      {/* Department Field - FUTURE READY */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Users className="w-4 h-4 inline mr-1" />
          Department
          <span className="text-xs text-gray-400 ml-1">(Coming soon)</span>
        </label>
        <input
          type="text"
          value={formData.department || ''}
          onChange={(e) => onChange('department', e.target.value)}
          disabled={true} // Disabled until backend supports it
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
          placeholder="e.g., Engineering, Marketing"
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
          placeholder="e.g., Senior Developer, Product Manager"
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
    </div>
  );
}