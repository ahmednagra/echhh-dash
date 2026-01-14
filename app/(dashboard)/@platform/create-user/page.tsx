// src/app/(dashboard)/@platform/create-user/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Users, Briefcase, Star, Shield, Check, AlertCircle } from 'react-feather';
import StepIndicator from '@/components/create-user/shared/StepIndicator';
import PlatformUserForm from '@/components/create-user/forms/PlatformUserForm';
import CompanyUserForm from '@/components/create-user/forms/CompanyUserForm';
import InfluencerUserForm from '@/components/create-user/forms/InfluencerUserForm';
import { UserType, UserFormData, PlatformUserFormData, CompanyUserFormData, InfluencerUserFormData } from '@/types/create-user';
import { validateForm } from '@/utils/create-user-validation';
import { createUser } from '@/services/users/users.service';

export default function CreateUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Check if user type is pre-selected from URL
  const preselectedType = searchParams.get('type') as UserType | null;
  
  const [currentStep, setCurrentStep] = useState(preselectedType ? 2 : 1);
  const [userType, setUserType] = useState<UserType | null>(preselectedType);
  const [formData, setFormData] = useState<Partial<UserFormData>>({});
  const [errors, setErrors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Determine if current user is admin (mock - replace with real auth check)
  const isAdmin = true;

  // Initialize form data when user type is preselected
  useEffect(() => {
    if (preselectedType && !formData.user_type) {
      setFormData({
        user_type: preselectedType,
        role: undefined,
        company_association: preselectedType === 'b2c' || preselectedType === 'b2b' ? 'new' : undefined,
      });
    }
  }, [preselectedType]);

  const handleBack = () => {
    if (currentStep > 1) {
      if (currentStep === 2) {
        // Going back from form to user type selection
        setUserType(null);
        setFormData({});
        setErrors([]);
        // Update URL to remove type parameter
        router.push('/create-user');
      }
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setFormData({
      ...formData,
      user_type: type,
      // Reset type-specific fields
      role: undefined,
      company_association: type === 'b2c' || type === 'b2b' ? 'new' : undefined,
    });
    setCurrentStep(2);
  };

  const handleChangeType = () => {
    setUserType(null);
    setFormData({});
    setErrors([]);
    setCurrentStep(1);
    // Update URL to remove type parameter
    router.push('/create-user');
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    setErrors(prev => prev.filter(err => err.field !== field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userType) return;

    // Validate form
    const validationErrors = validateForm(formData, userType);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      
      // Scroll to first error
      const firstErrorField = document.querySelector('[name="' + validationErrors[0].field + '"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      // Call the actual API to create user
      console.log('Creating user:', formData);
      const result = await createUser(formData);
      console.log('User created successfully:', result);
      
      // Success
      setSubmitSuccess(true);
      setCurrentStep(3);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/users');
      }, 2000);
      
    } catch (error) {
      console.error('Failed to create user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user. Please try again.';
      setErrors([{ field: 'general', message: errorMessage }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserTypeIcon = (type: UserType) => {
    switch (type) {
      case 'platform':
        return Shield;
      case 'b2c':
      case 'b2b':
        return Briefcase;
      case 'influencer':
        return Star;
      default:
        return Users;
    }
  };

  const getUserTypeTitle = (type: UserType) => {
    switch (type) {
      case 'platform':
        return 'Platform User';
      case 'b2c':
        return 'B2C Company User';
      case 'b2b':
        return 'B2B Company User';
      case 'influencer':
        return 'Influencer';
      default:
        return 'User';
    }
  };

  const getUserTypeDescription = (type: UserType) => {
    switch (type) {
      case 'platform':
        return 'Internal team member with platform access';
      case 'b2c':
        return 'Business-to-Consumer company representative';
      case 'b2b':
        return 'Business-to-Business company representative';
      case 'influencer':
        return 'Content creator or influencer manager';
      default:
        return '';
    }
  };

  // Define steps - always show all 3 steps
  const getSteps = () => {
    return [
      { 
        number: 1, 
        title: 'Select Type', 
        description: userType ? 'User type selected' : 'Choose user type' 
      },
      { 
        number: 2, 
        title: 'Fill Details', 
        description: 'Complete information' 
      },
      { 
        number: 3, 
        title: 'Confirm', 
        description: 'Review and submit' 
      },
    ];
  };

  // General error message display
  const generalError = errors.find(err => err.field === 'general');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header - Always show unless on success step */}
        {currentStep !== 3 && (
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Add New User
              </h1>
              <p className="text-gray-600">
                {!userType 
                  ? 'Select the type of user you want to add to the platform'
                  : `Complete the form to add a new ${getUserTypeTitle(userType).toLowerCase()}`
                }
              </p>
            </div>
          </div>
        )}

        {/* Step Indicator - Always show unless on success step */}
        {currentStep !== 3 && (
          <div className="mb-8">
            <StepIndicator steps={getSteps()} currentStep={currentStep} />
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Step 1: User Type Selection */}
          {currentStep === 1 && (
            <div className="p-8 md:p-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Select User Type
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform User Card */}
                <button
                  onClick={() => handleUserTypeSelect('platform')}
                  disabled={isSubmitting}
                  className="group relative p-8 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:shadow-xl transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-white to-purple-50/30"
                >
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-purple-100 group-hover:bg-purple-500 transition-colors duration-300 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 pr-16">
                    Platform User
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Internal team members with platform access and administrative capabilities
                  </p>
                  
                  <div className="mt-6 flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700">
                    Select
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* B2C Company Card */}
                <button
                  onClick={() => handleUserTypeSelect('b2c')}
                  disabled={isSubmitting}
                  className="group relative p-8 border-2 border-gray-200 rounded-2xl hover:border-pink-500 hover:shadow-xl transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-white to-pink-50/30"
                >
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-pink-100 group-hover:bg-pink-500 transition-colors duration-300 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-pink-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 pr-16">
                    B2C Company
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Business-to-Consumer company representatives managing campaigns and influencer relationships
                  </p>
                  
                  <div className="mt-6 flex items-center text-sm font-medium text-pink-600 group-hover:text-pink-700">
                    Select
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* B2B Company Card */}
                <button
                  onClick={() => handleUserTypeSelect('b2b')}
                  disabled={isSubmitting}
                  className="group relative p-8 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-white to-blue-50/30"
                >
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-500 transition-colors duration-300 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 pr-16">
                    B2B Company
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Business-to-Business company representatives focusing on enterprise influencer marketing
                  </p>
                  
                  <div className="mt-6 flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    Select
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Influencer Card */}
                <button
                  onClick={() => handleUserTypeSelect('influencer')}
                  disabled={isSubmitting}
                  className="group relative p-8 border-2 border-gray-200 rounded-2xl hover:border-orange-500 hover:shadow-xl transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br from-white to-orange-50/30"
                >
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-orange-100 group-hover:bg-orange-500 transition-colors duration-300 flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2 pr-16">
                    Influencer
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Content creators and influencer managers connecting with brands for campaigns
                  </p>
                  
                  <div className="mt-6 flex items-center text-sm font-medium text-orange-600 group-hover:text-orange-700">
                    Select
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Form */}
          {currentStep === 2 && userType && (
            <form onSubmit={handleSubmit} className="p-8 md:p-12">
              {/* User Type Badge */}
              <div className="mb-8 flex items-center justify-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                  {React.createElement(getUserTypeIcon(userType), {
                    className: 'w-5 h-5 text-purple-600'
                  })}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-purple-900">
                      {getUserTypeTitle(userType)}
                    </p>
                    <p className="text-xs text-purple-600">
                      {getUserTypeDescription(userType)}
                    </p>
                  </div>
                </div>
              </div>

              {/* General Error Message */}
              {generalError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{generalError.message}</p>
                  </div>
                </div>
              )}

              {/* Render appropriate form based on user type */}
              {userType === 'platform' && (
                <PlatformUserForm
                  formData={formData as Partial<PlatformUserFormData>}
                  onChange={handleFormChange}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  isAdmin={isAdmin}
                />
              )}

              {(userType === 'b2c' || userType === 'b2b') && (
                <CompanyUserForm
                  formData={formData as Partial<CompanyUserFormData>}
                  onChange={handleFormChange}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  userType={userType}
                />
              )}

              {userType === 'influencer' && (
                <InfluencerUserForm
                  formData={formData as Partial<InfluencerUserFormData>}
                  onChange={handleFormChange}
                  errors={errors}
                  isSubmitting={isSubmitting}
                />
              )}

              {/* Form Actions */}
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleChangeType}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Change Type
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create User
                        <Check className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {submitSuccess && currentStep === 3 && (
            <div className="p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                  <Check className="w-10 h-10 text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                User Created Successfully!
              </h2>
              <p className="text-gray-600 mb-8">
                The new {getUserTypeTitle(userType!).toLowerCase()} has been added to the platform.
              </p>

              <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Redirecting...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}