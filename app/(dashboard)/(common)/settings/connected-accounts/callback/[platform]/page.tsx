'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleOAuthCallback } from '@/services/agent-social-connections';

interface PageProps {
  params: Promise<{ platform: string }>;
}

export default function OAuthCallbackPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Connecting your account...');
  const [platform, setPlatform] = useState<string>('');
  
  // Prevent duplicate calls
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent duplicate execution
    if (hasProcessed.current) {
      console.log('⚠️ Callback already processed, skipping...');
      return;
    }

    const processCallback = async () => {
      try {
        hasProcessed.current = true; // Mark as processed immediately
        
        // Unwrap params
        const { platform: platformParam } = await params;
        setPlatform(platformParam);
        
        console.log('🔍 Callback URL search params:', searchParams.toString());
        
        // Get callback parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('📦 Extracted params:', {
          hasCode: !!code,
          codeLength: code?.length,
          hasState: !!state,
          error,
          errorDescription
        });

        // Check for OAuth errors
        if (error) {
          console.error('❌ OAuth error from provider:', error, errorDescription);
          setStatus('error');
          setMessage(errorDescription || `OAuth error: ${error}`);
          
          setTimeout(() => {
            router.push(`/settings/social-connections?error=true&message=${encodeURIComponent(errorDescription || error)}`);
          }, 3000);
          return;
        }

        // Validate code is present
        if (!code) {
          console.error('❌ Missing code parameter');
          setStatus('error');
          setMessage('Missing authorization code. Please try again.');
          
          setTimeout(() => {
            router.push('/settings/social-connections?error=true&message=Missing+authorization+code');
          }, 3000);
          return;
        }

        // State is optional for Instagram, use empty string if not present
        const stateValue = state || '';
        
        console.log(`✅ Valid params received, processing OAuth callback for ${platformParam}`);
        console.log(`📤 Sending to backend: code=${code.substring(0, 20)}..., state=${stateValue ? stateValue.substring(0, 20) + '...' : 'empty'}`);
        
        setMessage(`Connecting your ${platformParam} account...`);

        // Handle the OAuth callback
        const response = await handleOAuthCallback(platformParam, code, stateValue);

        console.log('✅ OAuth callback successful:', response);
        setStatus('success');
        setMessage(response.message);

        // Redirect to the URL provided by backend
        setTimeout(() => {
          console.log('➡️ Redirecting to:', response.redirect_url);
          router.push(response.redirect_url);
        }, 1500);

      } catch (error) {
        console.error('💥 Error processing OAuth callback:', error);
        setStatus('error');
        
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect account';
        setMessage(errorMessage);
        
        // Redirect to settings page with error
        setTimeout(() => {
          router.push(`/settings/social-connections?error=true&message=${encodeURIComponent(errorMessage)}`);
        }, 3000);
      }
    };

    processCallback();
  }, [params, searchParams, router]); // Remove message from dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          {/* Loading Spinner */}
          {status === 'processing' && (
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Success Icon */}
          {status === 'success' && (
            <div className="mb-4">
              <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {/* Error Icon */}
          {status === 'error' && (
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}

          {/* Platform Name */}
          {platform && (
            <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
              {platform}
            </h2>
          )}

          {/* Status Message */}
          <p className={`text-lg ${
            status === 'error' ? 'text-red-600' : 
            status === 'success' ? 'text-green-600' : 
            'text-gray-600'
          }`}>
            {message}
          </p>

          {/* Additional Info */}
          {status === 'processing' && (
            <p className="text-sm text-gray-500 mt-4">
              Please wait while we complete the connection...
            </p>
          )}

          {status === 'success' && (
            <p className="text-sm text-gray-500 mt-4">
              Redirecting you back to settings...
            </p>
          )}

          {status === 'error' && (
            <p className="text-sm text-gray-500 mt-4">
              Redirecting you back to try again...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}