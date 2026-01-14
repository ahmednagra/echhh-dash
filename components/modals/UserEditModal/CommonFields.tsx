// src/components/modals/UserEditModal/CommonFields.tsx
// Common fields that all user types can edit

'use client';

import { Mail, Phone, User } from 'react-feather';
import { FieldComponentProps } from '@/types/user-edit';

export default function CommonFields({
  formData,
  onChange,
  errors = {},
  disabled = false
}: FieldComponentProps) {
  return (
    <div className="space-y-4">
      {/* First Name Field - BACKEND SUPPORTED ✅ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          👤 First Name *
        </label>
        <input
          type="text"
          value={formData.first_name || ''}
          onChange={(e) => onChange('first_name', e.target.value)}
          disabled={disabled}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            errors.first_name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter first name"
        />
        {errors.first_name && (
          <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>
        )}
      </div>

      {/* Last Name Field - BACKEND SUPPORTED ✅ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          👤 Last Name *
        </label>
        <input
          type="text"
          value={formData.last_name || ''}
          onChange={(e) => onChange('last_name', e.target.value)}
          disabled={disabled}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            errors.last_name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter last name"
        />
        {errors.last_name && (
          <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>
        )}
      </div>

      {/* Full Name Field - AUTO-CALCULATED ✅ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <User className="w-4 h-4 inline mr-1" />
          Full Name (Auto-calculated)
        </label>
        <input
          type="text"
          value={
            (formData.first_name || formData.last_name)
              ? `${formData.first_name || ''} ${formData.last_name || ''}`.trim()
              : formData.full_name || ''
          }
          disabled={true}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 cursor-not-allowed text-gray-600"
          placeholder="Auto-generated from First + Last name"
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 This field is automatically generated from First Name + Last Name
        </p>
      </div>

      {/* Phone Number Field - BACKEND SUPPORTED ✅ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Phone className="w-4 h-4 inline mr-1" />
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.phone_number || ''}
          onChange={(e) => onChange('phone_number', e.target.value)}
          disabled={disabled}
          className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            errors.phone_number ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter phone number"
        />
        {errors.phone_number && (
          <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>
        )}
      </div>

      {/* Bio Field - FUTURE READY (not yet backend supported) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
          <span className="text-xs text-gray-400 ml-1">(Coming soon)</span>
        </label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => onChange('bio', e.target.value)}
          disabled={true} // Disabled until backend supports it
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
          placeholder="User bio (not yet supported)"
        />
      </div>

      {/* Location Field - FUTURE READY (not yet backend supported) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
          <span className="text-xs text-gray-400 ml-1">(Coming soon)</span>
        </label>
        <input
          type="text"
          value={formData.location || ''}
          onChange={(e) => onChange('location', e.target.value)}
          disabled={true} // Disabled until backend supports it
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
          placeholder="Location (not yet supported)"
        />
      </div>

      {/* Note about Backend Support */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-xs text-blue-700">
          <strong>✨ Smart Fields:</strong> <strong>Full Name</strong> is automatically calculated from First Name + Last Name. Currently supported: <strong>First Name</strong>, <strong>Last Name</strong>, <strong>Full Name</strong> (auto), and <strong>Phone Number</strong>. Other fields are being prepared for future updates.
        </p>
      </div>
    </div>
  );
}