// src/components/modals/UserEditModal/index.tsx
// Main UserEditModal component - Single unified modal for all user types

'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'react-feather';
import Modal from '@/components/ui/Modal';
import CommonFields from './CommonFields';
import PlatformFields from './PlatformFields';
import B2cFields from './B2cFields';
import InfluencerFields from './InfluencerFields';
import { UserEditModalProps, UserEditFormData, ValidationErrors } from '@/types/user-edit';
import { UpdateUserRequest } from '@/types/users';

export default function UserEditModal({
  isOpen,
  onClose,
  user,
  onSave
}: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<UpdateUserRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when modal opens or user changes
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        bio: user.bio || '',
        location: user.location || '',
        timezone: user.timezone || '',
        language: user.language || '',
        department: user.department || '',
        job_title: user.job_title || '',
        profile_image_url: user.profile_image_url || ''
      });
      setErrors({});
      setSuccess(false);
      setError(null);
    }
  }, [user, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({});
      setErrors({});
      setSuccess(false);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle field changes
  const handleChange = (field: keyof UpdateUserRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Full name is required
    if (!formData.full_name || formData.full_name.trim() === '') {
      newErrors.full_name = 'Full name is required';
    }

    // Phone number validation (if provided)
    if (formData.phone_number && formData.phone_number.trim() !== '') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(formData.phone_number)) {
        newErrors.phone_number = 'Invalid phone number format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Send all supported fields to backend
      // Auto-calculate full_name from first_name and last_name
      const updateData: UpdateUserRequest = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        full_name: (formData.first_name || formData.last_name)
          ? `${formData.first_name || ''} ${formData.last_name || ''}`.trim()
          : formData.full_name || null,
        phone_number: formData.phone_number || null,
        // profile_image_url: formData.profile_image_url || null, // Uncomment when ready
      };

      console.log('🚀 Submitting user update:', updateData);

      // Call the onSave callback
      await onSave(user.id, updateData);

      console.log('✅ User updated successfully');
      setSuccess(true);
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit ${user.user_type === 'platform' ? 'Platform' : user.user_type === 'b2c' ? 'Company' : 'Influencer'} User`}
      size="lg"
      showCloseButton={true}
      closeOnOverlayClick={!isSubmitting}
      loading={isSubmitting}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          {/* User Info Header */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{user.full_name || 'No Name'}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.user_type === 'platform' ? 'bg-purple-100 text-purple-800' :
                  user.user_type === 'b2c' ? 'bg-blue-100 text-blue-800' :
                  'bg-pink-100 text-pink-800'
                }`}>
                  {user.user_type === 'platform' ? 'Platform' : 
                   user.user_type === 'b2c' ? 'Company' : 'Influencer'}
                </span>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error updating user</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Success!</p>
                <p className="text-sm text-green-700 mt-1">User updated successfully</p>
              </div>
            </div>
          )}

          {/* Common Fields - Always visible */}
          <CommonFields
            formData={formData}
            onChange={handleChange}
            errors={errors}
            disabled={isSubmitting || success}
          />

          {/* Type-Specific Fields - Conditionally rendered */}
          {user.user_type === 'platform' && (
            <PlatformFields
              formData={formData}
              onChange={handleChange}
              errors={errors}
              disabled={isSubmitting || success}
            />
          )}

          {user.user_type === 'b2c' && (
            <B2cFields
              formData={formData}
              onChange={handleChange}
              errors={errors}
              disabled={isSubmitting || success}
            />
          )}

          {user.user_type === 'influencer' && (
            <InfluencerFields
              formData={formData}
              onChange={handleChange}
              errors={errors}
              disabled={isSubmitting || success}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || success}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Updated!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update User</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}