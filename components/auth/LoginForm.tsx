// src/components/auth/LoginForm.tsx - Updated to include OAuth
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LoginCredentials } from '@/types/auth';
import { AtSign, Lock, AlertCircle, Eye, EyeOff } from 'react-feather';
import { useLogin } from '@/hooks/useLogin';
import { AccountInactiveError, isAuthError } from '@/services/auth/auth.errors';
// import OAuthButtons from './OAuthButtons'; // TEMPORARILY COMMENTED OUT

interface LoginFormProps {
  onSuccess?: (redirectPath?: string) => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [form, setForm] = useState<LoginCredentials>({
    username: '',
    password: '',
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithRedirect, isLoading, error: hookError } = useLogin();
  const [error, setError] = useState<string | null>(null);
  // const [oauthError, setOAuthError] = useState<string | null>(null); // TEMPORARILY COMMENTED OUT

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // setOAuthError(null); // TEMPORARILY COMMENTED OUT
    
    try {
      // The hook will handle login and appropriate routing
      await loginWithRedirect({
        username: form.username,
        password: form.password,
        remember: form.remember,
      });
      
      // If we reach here, login was successful
      // onSuccess won't be called since routing is handled in the hook
    } catch (error) {
      // Handle specific error types if needed
      if (isAuthError(error)) {
        setError(error.message);
        
        if (error instanceof AccountInactiveError) {
          // Special handling for inactive accounts if needed
          setError(`${error.message} Please contact your administrator to activate your account.`);
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    }
  };

  // TEMPORARILY COMMENTED OUT - OAuth error handler
  // const handleOAuthError = (errorMessage: string) => {
  //   setOAuthError(errorMessage);
  //   setError(null); // Clear regular login errors
  // };

  return (
    <div>
      {/* Updated error display - removed oauthError */}
      {(error || hookError) && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error || hookError}</span>
        </div>
      )}

      {/* TEMPORARILY COMMENTED OUT - OAuth Login Options */}
      {/* 
      <div className="mb-8">
        <OAuthButtons 
          onError={handleOAuthError}
          className="mb-6"
        />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
      </div>
      */}

      {/* Regular Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address / Username
          </label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="username"
              type="text"
              name="username"
              placeholder="name@company.com"
              value={form.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              disabled={isLoading}
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
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              disabled={isLoading}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-600">Remember me</span>
          </label>
          <Link href="/reset-password" className="text-sm text-purple-600 hover:text-purple-800 font-medium hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:hover:shadow-none flex justify-center items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </div>
  );
}