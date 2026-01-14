// src/components/settings/ProfileSettingsPage.tsx - Example of using LinkedAccountsManager
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import LinkedAccountsManager from '@/components/auth/LinkedAccountsManager';
import OAuthButtons from '@/components/auth/OAuthButtons';
import { User, Mail, Phone, Camera } from 'react-feather';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    // Clear success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
  };

  const clearMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and connected social accounts</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start">
              <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start">
              <svg className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Basic Profile Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={user?.full_name || ''}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={user?.phone_number || 'Not provided'}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={user?.user_type || 'Unknown'}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 capitalize"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Connected Accounts Section */}
          <div>
            <LinkedAccountsManager
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Link New Accounts Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Link New Accounts</h3>
            <p className="text-gray-600 mb-4">
              Connect additional social media accounts to expand your options
            </p>
            <OAuthButtons
              isLinkMode={true}
              onError={handleError}
              className="max-w-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}