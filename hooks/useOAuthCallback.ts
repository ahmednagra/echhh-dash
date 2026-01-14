// src/hooks/useOAuthCallback.ts - FIXED to handle standardized LoginResponse format
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleOAuthCallback } from '@/services/oauth/oauth.service';
import { useAuth } from '@/context/AuthContext';
import { storeAuthData } from '@/services/auth/auth.utils';

interface UseOAuthCallbackReturn {
  status: 'processing' | 'success' | 'error';
  message: string;
  isLinkMode: boolean;
}

export function useOAuthCallback(provider: string): UseOAuthCallbackReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserSession } = useAuth();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing OAuth callback...');
  const [isLinkMode, setIsLinkMode] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get callback parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const link = searchParams.get('link');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors first
        if (error) {
          setStatus('error');
          setMessage(errorDescription || `OAuth error: ${error}`);
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setStatus('error');
          setMessage('Missing required OAuth callback parameters');
          return;
        }

        console.log(`Processing OAuth callback for ${provider}`);
        setIsLinkMode(link === 'true');

        // Handle the OAuth callback - NOW RETURNS COMPLETE LoginResponse FORMAT
        const callbackResponse = await handleOAuthCallback(provider, code, state, link || undefined);

        console.log('OAuth callback response received:', callbackResponse);

        if (link === 'true') {
          // Link mode - account was linked to existing user
          setStatus('success');
          setMessage(callbackResponse.message || `Successfully linked ${provider} account`);
          
          // Refresh user session to get updated linked accounts
          await refreshUserSession();
          
          // Redirect to dashboard
          setTimeout(() => {
            router.push(callbackResponse.redirect_path || '/dashboard');
          }, 2000);
        } else {
          // Login/Register mode - STANDARDIZED LoginResponse handling
          if (callbackResponse.access_token && callbackResponse.user) {
            console.log('✅ Received standard OAuth LoginResponse with tokens');
            
            // Store auth data in localStorage (IDENTICAL to regular login)
            const { access_token, refresh_token, expires_in, user, roles, company } = callbackResponse;
            storeAuthData(access_token, refresh_token, expires_in, user, roles, company);
            
            setStatus('success');
            
            // Refresh auth context
            await refreshUserSession();
            
            // Handle redirect based on standardized response
            if (callbackResponse.needs_completion) {
              console.log('🎯 Completion required:', callbackResponse.completion_type);
              setMessage('Registration successful! Please complete your company information.');
              
              setTimeout(() => {
                router.push(callbackResponse.redirect_path || '/register/complete?type=company');
              }, 2000);
            } else {
              console.log('🎯 Normal flow, redirecting to:', callbackResponse.redirect_path);
              
              // Set appropriate message based on login method
              if (callbackResponse.login_method === 'oauth_signup') {
                setMessage(`Account created successfully! Welcome to Echooo.`);
              } else {
                setMessage(`Successfully logged in with ${provider}`);
              }
              
              setTimeout(() => {
                router.push(callbackResponse.redirect_path || '/dashboard');
              }, 2000);
            }
          } else {
            // Successful response but no auth data (shouldn't happen with standardized response)
            console.warn('⚠️ OAuth response missing auth data');
            setStatus('success');
            setMessage(callbackResponse.message || 'OAuth process completed successfully');
            
            // Redirect to login page
            setTimeout(() => {
              router.push('/login');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to process OAuth callback');
      }
    };

    handleCallback();
  }, [provider, searchParams, router, refreshUserSession]);

  return {
    status,
    message,
    isLinkMode,
  };
}