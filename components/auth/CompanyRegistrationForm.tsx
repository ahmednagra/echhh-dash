// src/components/auth/CompanyRegistrationForm.tsx - Updated with first_name and last_name
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, Briefcase, Globe, Eye, EyeOff, AlertCircle } from 'react-feather';
import { registerUser, RegistrationData } from '@/services/auth/register.service';
import SuccessMessage from '@/components/ui/SuccessMessage';
import { validateEmail, validatePassword, validatePhoneNumber } from '@/utils/validation';
// import OAuthButtons from './OAuthButtons'; // TEMPORARILY COMMENTED OUT - OAUTH HIDDEN

interface CompanyRegistrationFormProps {
  onSuccess?: (redirectPath: string) => void;
}

export default function CompanyRegistrationForm({ onSuccess }: CompanyRegistrationFormProps) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    company_name: '',    
    company_domain: '',  
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [oauthError, setOAuthError] = useState<string | null>(null); // TEMPORARILY COMMENTED OUT
  const [success, setSuccess] = useState<string | null>(null);
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

  // TEMPORARILY COMMENTED OUT - OAuth error handler
  // const handleOAuthError = (errorMessage: string) => {
  //   setOAuthError(errorMessage);
  //   setError(null); // Clear regular registration errors
  // };
  
  // Simple domain validation
  const validateDomain = (domain: string): { valid: boolean; message: string } => {
    if (!domain) {
      return { valid: false, message: 'Company domain is required' };
    }
    
    // Basic domain validation (allows subdomains)
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      return { valid: false, message: 'Please enter a valid domain (e.g., example.com)' };
    }
    
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // setOAuthError(null); // TEMPORARILY COMMENTED OUT
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
    
    // Company name validation
    if (!form.company_name.trim()) {
      setError('Company name is required');
      setIsSubmitting(false);
      return;
    }
    
    // Domain validation
    const domainValidation = validateDomain(form.company_domain);
    if (!domainValidation.valid) {
      setError(domainValidation.message);
      setIsSubmitting(false);
      return;
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
        user_type: 'b2c',
        role_name: 'b2c_company_owner',
        company_name: form.company_name,
        company_domain: form.company_domain
      };
      
      // Call the registration service
      await registerUser(registrationData);
      
      // Show success message
      setSuccess('Your company account has been created successfully. You will be redirected to the login page.');
      
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
    <div>
      {success && (
        <SuccessMessage 
          title="Company Registration Successful!" 
          message={success} 
        />
      )}

      {/* Updated error display - removed oauthError */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* TEMPORARILY COMMENTED OUT - OAuth Registration Options */}
      {/* 
      <div className="mb-8">
        <OAuthButtons 
          userType="company"
          onError={handleOAuthError}
          className="mb-6"
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or register with email</span>
          </div>
        </div>
      </div>
      */}

      {/* Regular Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Admin details section */}
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            Admin Details
          </h3>
          <div className="pl-2 border-l-2 border-gray-200 space-y-4">
            <div>
              <label htmlFor="company-admin-first-name" className="block text-sm font-medium text-gray-700 mb-1">
                Admin First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="company-admin-first-name"
                  type="text"
                  name="first_name"
                  placeholder="John"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company-admin-last-name" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="company-admin-last-name"
                  type="text"
                  name="last_name"
                  placeholder="Doe"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company-email" className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="company-email"
                  type="email"
                  name="email"
                  placeholder="admin@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="company-phone"
                  type="tel"
                  name="phone_number"
                  placeholder="+1234567890"
                  value={form.phone_number}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Optional</p>
            </div>
          </div>
        </div>

        {/* Company details section */}
        <div className="my-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
            Company Details
          </h3>
          <div className="pl-2 border-l-2 border-gray-200 space-y-4">
            <div>
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="company-name"
                  type="text"
                  name="company_name"
                  placeholder="Acme Corporation"
                  value={form.company_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company-domain" className="block text-sm font-medium text-gray-700 mb-1">
                Company Domain
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="company-domain"
                  type="text"
                  name="company_domain"
                  placeholder="acmecorp.com"
                  value={form.company_domain}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter without http:// or www</p>
            </div>
          </div>
        </div>

        {/* Password section */}
        <div className="my-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Lock className="h-4 w-4 mr-2 text-gray-500" />
            Security
          </h3>
          <div className="pl-2 border-l-2 border-gray-200 space-y-4">
            <div>
              <label htmlFor="company-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="company-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters with 1 uppercase, 1 number</p>
            </div>

            <div>
              <label htmlFor="company-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="company-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={toggleShowConfirmPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:hover:shadow-none flex justify-center items-center mt-8"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </>
          ) : (
            'Create Company Account'
          )}
        </button>
      </form>
    </div>
  );
}