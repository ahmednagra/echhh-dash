// src/hooks/useOAuth.ts
import { useState, useCallback } from 'react';
import { 
  getOAuthProviders,
  initiateOAuth,
  getLinkedAccounts,
  unlinkOAuthAccount,
  refreshOAuthToken,
  redirectToOAuthProvider
} from '@/services/oauth/oauth.service';
import { 
  OAuthProvider, 
  LinkedOAuthAccount,
  OAuthAuthorizationResponse 
} from '@/types/oauth';

interface UseOAuthReturn {
  // State
  providers: OAuthProvider[];
  linkedAccounts: LinkedOAuthAccount[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProviders: () => Promise<void>;
  fetchLinkedAccounts: () => Promise<void>;
  startOAuthFlow: (provider: string, isLinkMode?: boolean) => Promise<void>;
  unlinkAccount: (accountId: string) => Promise<void>;
  refreshToken: (accountId: string) => Promise<void>;
  clearError: () => void;
}

export function useOAuth(): UseOAuthReturn {
  const [providers, setProviders] = useState<OAuthProvider[]>([]);
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedOAuthAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const providersData = await getOAuthProviders();
      setProviders(providersData.providers.filter(p => p.enabled));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch OAuth providers';
      setError(errorMessage);
      console.error('Error fetching OAuth providers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLinkedAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accountsData = await getLinkedAccounts();
      setLinkedAccounts(accountsData.linked_accounts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch linked accounts';
      setError(errorMessage);
      console.error('Error fetching linked accounts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startOAuthFlow = useCallback(async (provider: string, isLinkMode = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Starting OAuth flow for ${provider}, link mode: ${isLinkMode}`);
      
      const authResponse = await initiateOAuth(provider, isLinkMode);
      
      // Redirect to OAuth provider
      redirectToOAuthProvider(authResponse.authorization_url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to start OAuth flow for ${provider}`;
      setError(errorMessage);
      console.error(`Error starting OAuth flow for ${provider}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const unlinkAccount = useCallback(async (accountId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await unlinkOAuthAccount(accountId);
      
      // Remove the account from local state
      setLinkedAccounts(prev => prev.filter(acc => acc.id !== accountId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unlink account';
      setError(errorMessage);
      console.error('Error unlinking account:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async (accountId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await refreshOAuthToken(accountId);
      
      // Refresh the linked accounts to get updated token info
      await fetchLinkedAccounts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh token';
      setError(errorMessage);
      console.error('Error refreshing token:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchLinkedAccounts]);

  return {
    // State
    providers,
    linkedAccounts,
    loading,
    error,
    
    // Actions
    fetchProviders,
    fetchLinkedAccounts,
    startOAuthFlow,
    unlinkAccount,
    refreshToken,
    clearError,
  };
}