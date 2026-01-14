// src/components/auth/InfluencerRegistrationForm.tsx - Updated with first_name and last_name
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, Phone, AlertCircle, CheckCircle } from 'react-feather';
import { validateEmail, validatePassword, validatePhoneNumber } from '@/utils/validation';
import { registerUser, RegistrationData } from '@/services/auth/register.service';

import OAuthButtons from './OAuthButtons';

interface SuccessMessageProps {
  title: string;
  message: string;
}

function SuccessMessage({ title, message }: SuccessMessageProps) {
  return (
    <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-md mb-6">
      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
      <div>
        <h3 className="text-sm font-medium text-green-800">{title}</h3>
        <p className="text-sm text-green-700 mt-1">{message}</p>
      </div>
    </div>
  );
}

interface InfluencerRegistrationFormProps {
  onSuccess?: (redirectPath: string) => void;
}

export default function InfluencerRegistrationForm({ onSuccess }: InfluencerRegistrationFormProps) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthError, setOAuthError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleOAuthError = (errorMessage: string) => {
    setOAuthError(errorMessage);
    setError(null); // Clear regular registration errors
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOAuthError(null);
    setIsSubmitting(true);
    
    // Name validation
    if (!form.first_name.trim()) {
      setError('First name is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!form.last_name.trim()) {
      setError('Last name is required');
      setIsSubmitting(false);
      return;
    }
    
    // Name validation
    if (!form.first_name.trim()) {
      setError('First name is required');
      setIsSubmitting(false);
      return;
    }
    
    if (!form.last_name.trim()) {
      setError('Last name is required');
      setIsSubmitting(false);
      return;
    }
    
    // Email validation
    const emailValidation = validateEmail(form.email);
    if (!emailValidation.valid) {
      setError(emailValidation.message);
      setIsSubmitting(false);
      return;
    }
    
    // Password validation
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setIsSubmitting(false);
      return;
    }
    
    // Phone validation (if provided)
    if (form.phone_number) {
      const phoneValidation = validatePhoneNumber(form.phone_number);
      if (!phoneValidation.valid) {
        setError(phoneValidation.message);
        setIsSubmitting(false);
        return;
      }
    }
    
    // Confirm password
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Create registration data with separate name fields and combined full_name
      const registrationData: RegistrationData = {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        full_name: `${form.first_name} ${form.last_name}`, // Combined for backward compatibility
        phone_number: form.phone_number || undefined,
        user_type: 'influencer',
        role_name: 'influencer'
      };
      
      // Call the registration service
      await registerUser(registrationData);
      
      // Show success message
      setSuccess('Your account has been created successfully. You will be redirected to the login page.');
      
      // Delay redirect to show success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess('/login');
        } else {
          router.push('/login');
        }
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred during registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {success && (
        <SuccessMessage 
          title="Registration Successful!"
          message={success}
        />
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OAuth Buttons */}
        {/* <OAuthButtons 
          mode="register" 
          userType="influencer"
          onError={handleOAuthError}
        /> */}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or register with email</span>
          </div>
        </div>

        {/* Error Display */}
        {(error || oauthError) && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error || oauthError}</span>
          </div>
        )}

        {/* First Name Field */}
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="first_name"
              name="first_name"
              type="text"
              required
              value={form.first_name}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your first name"
            />
          </div>
        </div>

        {/* Last Name Field */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="last_name"
              name="last_name"
              type="text"
              required
              value={form.last_name}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your last name"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Phone Number Field (Optional) */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={form.phone_number}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={toggleShowPassword}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={toggleShowConfirmPassword}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || success !== null}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isSubmitting || success !== null
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? 'Creating Account...' : success ? 'Account Created!' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}