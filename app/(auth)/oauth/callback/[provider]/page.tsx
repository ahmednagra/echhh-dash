// src/app/(auth)/oauth/callback/[provider]/page.tsx - UPDATED WITH PROFESSIONAL ERROR HANDLING
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleOAuthCallback } from '@/services/oauth/oauth.service';
import { useAuth } from '@/context/AuthContext';
import { storeAuthData } from '@/services/auth/auth.utils';
import { CheckCircle, XCircle, Loader, AlertCircle, UserPlus } from 'react-feather';
import Link from 'next/link';
import Image from 'next/image';

interface OAuthCallbackPageProps {
  params: {
    provider: string;
  };
}

// Error types for better UX
type CallbackErrorType = 
  | 'account_not_found'
  | 'oauth_expired' 
  | 'oauth_denied'
  | 'oauth_error'
  | 'network_error'
  | 'unknown_error';

interface CallbackError {
  type: CallbackErrorType;
  title: string;
  message: string;
  suggestion: string;
  primaryAction: {
    label: string;
    href: string;
    variant: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    action: 'reload' | 'href';
    href?: string;
  };
}

export default function OAuthCallbackPage({ params }: OAuthCallbackPageProps) {
  const { provider } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUserSession, loadAuthFromStorage } = useAuth(); // FIXED: Use both methods
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing OAuth callback...');
  const [isLinkMode, setIsLinkMode] = useState(false);
  const [callbackError, setCallbackError] = useState<CallbackError | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  
  const hasProcessed = useRef(false);
  const processingRef = useRef(false);

  // Error classification function
  const classifyError = (error: Error): CallbackError => {
    const errorMessage = error.message.toLowerCase();
    const providerName = getProviderName(provider);

    if (errorMessage.includes('account not found') || errorMessage.includes('register first')) {
      return {
        type: 'account_not_found',
        title: 'Account Not Found',
        message: `No account is associated with this ${providerName} account.`,
        suggestion: 'Please create an account first using the registration page.',
        primaryAction: {
          label: 'Create Account',
          href: '/register',
          variant: 'primary'
        },
        secondaryAction: {
          label: 'Back to Login',
          action: 'href',
          href: '/login'
        }
      };
    }

    if (errorMessage.includes('invalid_grant') || errorMessage.includes('bad request') || errorMessage.includes('expired')) {
      return {
        type: 'oauth_expired',
        title: 'Session Timed Out',
        message: `Your sign-in session has expired for security reasons.`,
        suggestion: 'Please try signing in again - this usually happens if you wait too long or refresh the page.',
        primaryAction: {
          label: 'Sign In Again',
          href: '/login',
          variant: 'primary'
        }
      };
    }

    if (errorMessage.includes('access_denied') || errorMessage.includes('user_denied')) {
      return {
        type: 'oauth_denied',
        title: 'Authorization Cancelled',
        message: `You cancelled the ${providerName} authorization process.`,
        suggestion: 'No account was linked or created. You can try again if this was by mistake.',
        primaryAction: {
          label: 'Try Again',
          href: '/login',
          variant: 'primary'
        }
      };
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      return {
        type: 'network_error',
        title: 'Connection Problem',
        message: 'Unable to connect to our servers.',
        suggestion: 'Please check your internet connection and try again.',
        primaryAction: {
          label: 'Back to Login',
          href: '/login',
          variant: 'primary'
        },
        secondaryAction: {
          label: 'Retry',
          action: 'reload'
        }
      };
    }

    if (errorMessage.includes('oauth') || errorMessage.includes('authorization')) {
      return {
        type: 'oauth_error',
        title: `${providerName} Error`,
        message: `There was an issue with ${providerName} authorization.`,
        suggestion: 'This might be a temporary issue. Please try again or use a different sign-in method.',
        primaryAction: {
          label: 'Back to Login',
          href: '/login',
          variant: 'primary'
        },
        secondaryAction: {
          label: 'Try Again',
          action: 'reload'
        }
      };
    }

    // Default unknown error
    return {
      type: 'unknown_error',
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred while processing your request.',
      suggestion: 'Please try again or contact support if the problem persists.',
      primaryAction: {
        label: 'Back to Login',
        href: '/login',
        variant: 'primary'
      },
      secondaryAction: {
        label: 'Try Again',
        action: 'reload'
      }
    };
  };

  // Start countdown and redirect
  const startRedirectCountdown = (path: string, seconds: number = 3) => {
    setRedirectCountdown(seconds);
    const timer = setInterval(() => {
      setRedirectCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          router.push(path);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };
  
  useEffect(() => {
    if (hasProcessed.current || processingRef.current) {
      return;
    }

    const handleCallback = async () => {
      try {
        hasProcessed.current = true;
        processingRef.current = true;
        
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const link = searchParams.get('link');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        console.log('🔍 OAuth callback processing:', { 
          provider,
          code: code ? 'present' : 'missing', 
          state: state ? 'present' : 'missing', 
          link,
          error
        });

        // Check for OAuth provider errors first
        if (error) {
          const errorMsg = errorDescription || `OAuth provider error: ${error}`;
          throw new Error(errorMsg);
        }

        if (!code || !state) {
          throw new Error('Missing required OAuth callback parameters');
        }

        setIsLinkMode(link === 'true');
        setMessage(isLinkMode ? `Linking your ${getProviderName(provider)} account...` : `Signing you in with ${getProviderName(provider)}...`);

        const callbackResponse = await handleOAuthCallback(provider, code, state, link || undefined);

        console.log('✅ OAuth callback successful:', {
          hasAccessToken: !!callbackResponse.access_token,
          hasUser: !!callbackResponse.user,
          loginMethod: callbackResponse.login_method,
          needsCompletion: callbackResponse.needs_completion
        });

        const isLinkOnlyResponse = !callbackResponse.access_token || !callbackResponse.user;

        if (isLinkOnlyResponse) {
          setStatus('success');
          setMessage(callbackResponse.message || `Successfully linked ${getProviderName(provider)} account`);
          
          // For link mode, just refresh the user session
          await refreshUserSession();
          
          startRedirectCountdown(callbackResponse.redirect_path || '/dashboard');
        } else {
          if (!callbackResponse.access_token || !callbackResponse.user || !callbackResponse.roles) {
            throw new Error('Missing required authentication data');
          }

          const { 
            access_token, 
            refresh_token, 
            expires_in, 
            user, 
            roles, 
            company 
          } = callbackResponse;

          console.log('🔄 Storing auth data...');
          
          // STEP 1: Store auth data in localStorage
          storeAuthData(
            access_token, 
            refresh_token || '', 
            expires_in || 3600, 
            user, 
            roles || [], 
            company
          );
          
          console.log('✅ Auth data stored successfully');
          
          // STEP 2: Immediately update auth context from localStorage (no API call)
          console.log('🔄 Loading auth state from storage...');
          loadAuthFromStorage();
          
          // STEP 3: Wait a bit for React state to update
          await new Promise(resolve => setTimeout(resolve, 300));
          
          console.log('✅ Auth context updated');
          
          setStatus('success');
          
          if (callbackResponse.needs_completion) {
            setMessage('Registration successful! Please complete your company information.');
            
            sessionStorage.setItem('oauth_completion', JSON.stringify({
              provider,
              timestamp: Date.now(),
              needs_completion: true,
              completion_type: callbackResponse.completion_type
            }));
            
            startRedirectCountdown(callbackResponse.redirect_path || '/register/complete?type=company', 1);
          } else {
            if (callbackResponse.login_method === 'oauth_signup') {
              setMessage(`Account created successfully! Welcome to Echooo.`);
            } else if (callbackResponse.login_method === 'oauth_link_login') {
              setMessage(`Account linked and logged in successfully!`);
            } else {
              setMessage(`Successfully logged in with ${getProviderName(provider)}`);
            }
            
            startRedirectCountdown(callbackResponse.redirect_path || '/dashboard', 1);
          }
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error);
        
        const errorInfo = classifyError(error as Error);
        setCallbackError(errorInfo);
        setStatus('error');
        setMessage(errorInfo.message);
      } finally {
        processingRef.current = false;
      }
    };

    handleCallback();
  }, [provider, searchParams, router, loadAuthFromStorage]);

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      google: 'Google',
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
    };
    return names[provider] || provider;
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      google: '🔍',
      facebook: '📘',
      instagram: '📷',
      linkedin: '💼',
    };
    return icons[provider] || '🔗';
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        if (callbackError?.type === 'account_not_found') {
          return <UserPlus className="h-16 w-16 text-blue-500" />;
        } else if (callbackError?.type === 'oauth_denied') {
          return <AlertCircle className="h-16 w-16 text-yellow-500" />;
        }
        return <XCircle className="h-16 w-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        if (callbackError?.type === 'account_not_found') {
          return 'text-blue-600';
        } else if (callbackError?.type === 'oauth_denied') {
          return 'text-yellow-600';
        }
        return 'text-red-600';
    }
  };

  const handleSecondaryAction = () => {
    if (callbackError?.secondaryAction?.action === 'reload') {
      window.location.reload();
    } else if (callbackError?.secondaryAction?.href) {
      router.push(callbackError.secondaryAction.href);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-6 py-12">
        <div className="w-full max-w-md">
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
          </div>

          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                {getStatusIcon()}
              </div>

              <div className="mb-6">
                <div className="text-4xl mb-2">
                  {getProviderIcon(provider)}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {isLinkMode ? 'Linking' : 'Authenticating'} with {getProviderName(provider)}
                </h1>
              </div>

              <div className={`text-lg ${getStatusColor()} mb-6`}>
                {callbackError?.title || message}
              </div>

              {status === 'processing' && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Please wait while we complete the authentication process...
                  </p>
                </div>
              )}

              {status === 'success' && (
                <div className="space-y-4">
                  {redirectCountdown !== null && (
                    <div className="text-sm text-gray-500">
                      Redirecting in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                    </div>
                  )}
                  <div className="flex justify-center">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {status === 'error' && callbackError && (
                <div className="space-y-6">
                  {/* Error explanation */}
                  <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg text-left">
                    <p className="font-medium mb-2">What happened?</p>
                    <p className="mb-3">{callbackError.message}</p>
                    <p className="text-xs text-gray-500">{callbackError.suggestion}</p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex flex-col gap-3">
                    <Link
                      href={callbackError.primaryAction.href}
                      className={`py-3 px-4 rounded-lg font-medium transition-colors text-center ${
                        callbackError.primaryAction.variant === 'primary'
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                      }`}
                    >
                      {callbackError.primaryAction.label}
                    </Link>
                    
                    {callbackError.secondaryAction && (
                      <button
                        onClick={handleSecondaryAction}
                        className="py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {callbackError.secondaryAction.label}
                      </button>
                    )}
                  </div>

                  {/* Special message for account not found */}
                  {callbackError.type === 'account_not_found' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <UserPlus className="w-5 h-5 text-blue-600 mr-2" />
                        <p className="text-sm text-blue-800">
                          <strong>New to Echooo?</strong> Create your account to get started!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Special message for expired sessions */}
                  {callbackError.type === 'oauth_expired' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                        <p className="text-sm text-blue-800">
                          <strong>No worries!</strong> This happens for security - just try signing in again.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 mt-8">
            <p>
              Having trouble? {' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-800 font-medium hover:underline transition">
                Back to login
              </Link>
            </p>
          </div>

          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && status === 'error' && (
            <div className="mt-6 text-xs text-gray-500">
              <details className="bg-gray-100 rounded p-3">
                <summary className="cursor-pointer hover:text-gray-700">
                  Debug Info
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify({
                    provider,
                    errorType: callbackError?.type,
                    searchParams: Object.fromEntries(searchParams.entries())
                  }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}