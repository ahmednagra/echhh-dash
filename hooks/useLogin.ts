// src/hooks/useLogin.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCompanyCampaigns } from '@/services/campaign/campaign.service';
import { getStoredCompany, getStoredUser } from '@/services/auth/auth.utils';
import { LoginCredentials } from '@/types/auth';
import { isAuthError } from '@/services/auth/auth.errors';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const loginWithRedirect = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Perform login
      await login(credentials);
      
      // Get user and company info
      const user = getStoredUser();
      
      // Handle routing based on user type
      if (user?.user_type === 'company') {
        try {
          const company = getStoredCompany();
          if (company && company.id) {
            const campaigns = await getCompanyCampaigns(company.id);
            
            if (campaigns && campaigns.length > 0) {
              // Get most recent campaign
              const mostRecentCampaign = campaigns.sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              )[0];
              
              router.push(`/campaigns/${mostRecentCampaign.id}`);
            } else {
              router.push('/campaigns/new');
            }
            return; // Exit early
          }
        } catch (error) {
          console.error('Error during post-login campaign check:', error);
          // Fall through to default routing
        }
      }
      
      // Default route for non-company users or on error
      router.push('/dashboard');
      
    } catch (error) {
      // Handle login errors
      if (isAuthError(error)) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
      throw error; // Re-throw for component to handle if needed
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loginWithRedirect,
    isLoading,
    error
  };
}