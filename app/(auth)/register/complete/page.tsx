// src/app/(auth)/register/complete/page.tsx - FIXED with campaigns redirect
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, Globe, AlertCircle, CheckCircle } from 'react-feather';

interface CompanyData {
  company_name: string;
  company_domain: string;
}

export default function CompleteRegistrationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, refreshUserSession } = useAuth();
  
  const [form, setForm] = useState<CompanyData>({
    company_name: '',
    company_domain: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isValidatingAccess, setIsValidatingAccess] = useState(true);

  const registrationType = searchParams.get('type');

  useEffect(() => {
    // Add delay to allow auth state to settle after OAuth
    const timer = setTimeout(() => {
      setIsValidatingAccess(false);
    }, 2000); // 2 second delay to allow auth to settle

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't redirect immediately, wait for validation to complete
    if (isValidatingAccess || isLoading) {
      return;
    }

    // Check OAuth completion state from session storage
    const oauthCompletion = sessionStorage.getItem('oauth_completion');
    let isFromOAuth = false;
    
    if (oauthCompletion) {
      try {
        const completion = JSON.parse(oauthCompletion);
        const timeDiff = Date.now() - completion.timestamp;
        // Valid for 10 minutes
        if (timeDiff < 10 * 60 * 1000) {
          isFromOAuth = true;
          console.log('Valid OAuth completion state found');
        } else {
          sessionStorage.removeItem('oauth_completion');
        }
      } catch (e) {
        sessionStorage.removeItem('oauth_completion');
      }
    }

    // Allow access if coming from OAuth or if user is authenticated
    if (!isAuthenticated && !isFromOAuth) {
      console.log('Not authenticated and not from OAuth, redirecting to login');
      router.push('/login');
      return;
    }

    // Only show this page for company registration completion
    if (registrationType !== 'company') {
      console.log('Not company registration type, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    console.log('User state:', { 
      userType: user?.user_type, 
      isFromOAuth, 
      authenticated: isAuthenticated 
    });

  }, [isAuthenticated, registrationType, user, router, isValidatingAccess, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateDomain = (domain: string): { valid: boolean; message: string } => {
    if (!domain) {
      return { valid: false, message: 'Company domain is required' };
    }
    
    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(domain)) {
      return { valid: false, message: 'Please enter a valid domain (e.g., example.com)' };
    }
    
    return { valid: true, message: '' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validate company name
      if (!form.company_name.trim()) {
        setError('Company name is required');
        setIsSubmitting(false);
        return;
      }
      
      // Validate domain
      const domainValidation = validateDomain(form.company_domain);
      if (!domainValidation.valid) {
        setError(domainValidation.message);
        setIsSubmitting(false);
        return;
      }

      console.log('🚀 Submitting company completion form:', form);

      // Use the existing API endpoint through our service
      const response = await fetch('/api/v0/auth/complete-company-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      console.log('📦 Company completion response:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete registration');
      }

      setSuccess('Company registration completed successfully!');
      
      // Clear OAuth completion state
      sessionStorage.removeItem('oauth_completion');
      
      // FIX: Update local storage with new company data if provided
      if (data.data?.company) {
        console.log('💾 Updating localStorage with company data');
        
        // Update user data
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        // Update company data
        localStorage.setItem('company', JSON.stringify([data.data.company]));
        
        // Refresh user session to sync auth context
        await refreshUserSession();
      }
      
      // FIX: Redirect to campaigns page for company users
      setTimeout(() => {
        console.log('🎯 Redirecting to campaigns page');
        router.push('/campaigns');
      }, 2000);

    } catch (error) {
      console.error('❌ Company completion error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while completing registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state during validation
  if (isValidatingAccess || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Main content */}
      <div className="w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <Image 
                src="/echooo-logo.svg" 
                alt="Echooo" 
                width={180} 
                height={50} 
                className="h-8 w-auto mx-auto mb-6 hover:opacity-80 transition-opacity" 
              />
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Complete Your Company Registration
            </h1>
            <p className="text-gray-600">
              Welcome {user?.full_name || 'there'}! Please provide your company details to complete the registration.
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="company_name"
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
                <label htmlFor="company_domain" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Domain
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="company_domain"
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

              <button
                type="submit"
                disabled={isSubmitting || success !== null}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:hover:shadow-none flex justify-center items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Completing registration...
                  </>
                ) : success !== null ? (
                  'Registration Complete!'
                ) : (
                  'Complete Company Registration'
                )}
              </button>
            </form>
          </div>

          {/* Skip option */}
          <div className="text-center text-sm text-gray-600 mt-8">
            <p>
              Want to complete this later?{' '}
              <button
                onClick={() => {
                  sessionStorage.removeItem('oauth_completion');
                  router.push('/campaigns');
                }}
                className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition"
              >
                Skip for now
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}