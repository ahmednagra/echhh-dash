// src/components/auth/OAuthButtons.tsx - COMPLETE FIXED VERSION
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FaGoogle, 
  FaFacebook, 
  FaInstagram, 
  FaLinkedin 
} from 'react-icons/fa';
import { 
  getOAuthProviders, 
  initiateOAuth, 
  redirectToOAuthProvider 
} from '@/services/oauth/oauth.service';
import { OAuthProvider } from '@/types/oauth';

interface OAuthButtonsProps {
  isLinkMode?: boolean;
  userType?: 'influencer' | 'company' | 'platform'; // FIXED: Can be undefined for login pages
  onError?: (error: string) => void;
  className?: string;
}

// React Icons configuration with proper styling
const providerConfig: Record<string, { 
  icon: React.ReactNode; 
  bgColor: string; 
  hoverColor: string;
  textColor: string;
  name: string;
}> = {
  google: {
    icon: <FaGoogle className="w-5 h-5" />,
    bgColor: 'bg-white border-2 border-gray-300',
    hoverColor: 'hover:border-red-400 hover:shadow-lg hover:shadow-red-100',
    textColor: 'text-gray-700',
    name: 'Google'
  },
  facebook: {
    icon: <FaFacebook className="w-5 h-5" />,
    bgColor: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200',
    textColor: 'text-white',
    name: 'Facebook'
  },
  instagram: {
    icon: <FaInstagram className="w-5 h-5" />,
    bgColor: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600',
    hoverColor: 'hover:shadow-lg hover:shadow-pink-200',
    textColor: 'text-white',
    name: 'Instagram'
  },
  linkedin: {
    icon: <FaLinkedin className="w-5 h-5" />,
    bgColor: 'bg-blue-700',
    hoverColor: 'hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-200',
    textColor: 'text-white',
    name: 'LinkedIn'
  },
};

export default function OAuthButtons({ 
  isLinkMode = false,
  userType, // FIXED: Can be undefined for login pages
  onError,
  className = ''
}: OAuthButtonsProps) {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [initiatingProvider, setInitiatingProvider] = useState<string | null>(null);
  
  // Prevent double API calls with useRef
  const hasFetchedProviders = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasFetchedProviders.current) {
      console.log('OAuth providers already fetched, skipping...');
      return;
    }

    const fetchProviders = async () => {
      try {
        hasFetchedProviders.current = true; // Mark as fetched
        console.log('🔄 Fetching OAuth providers...');
        
        const providersData = await getOAuthProviders();
        // Only show enabled providers that we have icons for
        const enabledProviders = providersData.providers.filter(p => 
          p.enabled && providerConfig[p.provider]
        );
        setProviders(enabledProviders);
        
        console.log(`✅ Fetched ${enabledProviders.length} enabled OAuth providers`);
      } catch (error) {
        console.error('❌ Error fetching OAuth providers:', error);
        if (onError) {
          onError(error instanceof Error ? error.message : 'Failed to load social login options');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []); // Empty dependency array

  const handleOAuthLogin = async (provider: string) => {
    if (initiatingProvider) return; // Prevent multiple clicks
    
    setInitiatingProvider(provider);
    
    try {
      console.log(`🚀 Initiating OAuth for ${provider}`, {
        linkMode: isLinkMode,
        userType: userType || 'undefined (login page)'
      });
      
      // FIXED: Pass userType properly - can be undefined for login pages
      const authResponse = await initiateOAuth(provider, isLinkMode, userType);
      
      console.log(`🔄 Redirecting to OAuth provider`);
      
      // Redirect to the OAuth provider's authorization URL
      redirectToOAuthProvider(authResponse.authorization_url);
    } catch (error) {
      console.error(`❌ Error initiating OAuth for ${provider}:`, error);
      setInitiatingProvider(null);
      
      if (onError) {
        // FIXED: Handle specific "Account not found" error for login pages
        const errorMessage = error instanceof Error ? error.message : 
          `Failed to connect with ${providerConfig[provider]?.name || provider}`;
        
        onError(errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="flex space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-6 ${className}`}>
        <p className="text-sm">No social login options available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          {isLinkMode 
            ? 'Link your accounts' 
            : userType 
              ? `Quick ${userType} sign up with` 
              : 'Continue with'
          }
        </h3>
        <p className="text-xs text-gray-500">
          {isLinkMode 
            ? 'Connect your social media accounts' 
            : userType 
              ? 'Choose your preferred platform' 
              : 'Sign in to your account'
          }
        </p>
      </div>

      {/* OAuth Buttons Grid */}
      <div className="flex justify-center items-center space-x-4">
        {providers.slice(0, 4).map((provider) => {
          const config = providerConfig[provider.provider];
          const isLoading = initiatingProvider === provider.provider;
          
          if (!config) return null;

          return (
            <button
              key={provider.provider}
              onClick={() => handleOAuthLogin(provider.provider)}
              disabled={!!initiatingProvider}
              title={`${isLinkMode ? 'Link' : (userType ? 'Sign up' : 'Sign in')} with ${config.name}`}
              className={`
                relative group flex items-center justify-center
                h-12 w-12 rounded-full transition-all duration-200 transform
                ${config.bgColor} ${config.textColor}
                ${!initiatingProvider ? config.hoverColor : ''}
                ${!initiatingProvider ? 'hover:scale-105' : ''}
                ${initiatingProvider === provider.provider ? 'scale-95 opacity-75' : ''}
                ${initiatingProvider && initiatingProvider !== provider.provider ? 'opacity-50 cursor-not-allowed' : ''}
                disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400
              `}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
              ) : (
                config.icon
              )}
              
              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {isLinkMode ? 'Link' : (userType ? 'Sign up' : 'Sign in')} with {config.name}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Loading state text */}
      {initiatingProvider && (
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">
            Redirecting to {providerConfig[initiatingProvider]?.name}...
          </p>
        </div>
      )}
    </div>
  );
}