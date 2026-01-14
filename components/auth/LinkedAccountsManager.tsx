// src/components/auth/LinkedAccountsManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  getLinkedAccounts, 
  unlinkOAuthAccount, 
  refreshOAuthToken 
} from '@/services/oauth/oauth.service';
import { LinkedOAuthAccount } from '@/types/oauth';
import { Trash2, RefreshCw, ExternalLink, AlertCircle } from 'react-feather';

interface LinkedAccountsManagerProps {
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
  className?: string;
}

const providerIcons: Record<string, string> = {
  google: '🔗',
  facebook: '📘',
  instagram: '📷',
  linkedin: '💼',
};

const providerNames: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
};

export default function LinkedAccountsManager({ 
  onError,
  onSuccess,
  className = ''
}: LinkedAccountsManagerProps) {
  const [accounts, setAccounts] = useState<LinkedOAuthAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLinkedAccounts = async () => {
    try {
      setLoading(true);
      const accountsData = await getLinkedAccounts();
      setAccounts(accountsData.linked_accounts);
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to load linked accounts');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const handleUnlinkAccount = async (accountId: string, provider: string) => {
    if (actionLoading) return;
    
    if (!confirm(`Are you sure you want to unlink your ${providerNames[provider] || provider} account?`)) {
      return;
    }
    
    setActionLoading(accountId);
    
    try {
      await unlinkOAuthAccount(accountId);
      
      // Remove the account from the local state
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      
      if (onSuccess) {
        onSuccess(`Successfully unlinked ${providerNames[provider] || provider} account`);
      }
    } catch (error) {
      console.error('Error unlinking account:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : `Failed to unlink ${providerNames[provider] || provider} account`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshToken = async (accountId: string, provider: string) => {
    if (actionLoading) return;
    
    setActionLoading(accountId);
    
    try {
      await refreshOAuthToken(accountId);
      
      if (onSuccess) {
        onSuccess(`Successfully refreshed ${providerNames[provider] || provider} token`);
      }
      
      // Optionally refresh the accounts list to get updated data
      await fetchLinkedAccounts();
    } catch (error) {
      console.error('Error refreshing token:', error);
      if (onError) {
        onError(error instanceof Error ? error.message : `Failed to refresh ${providerNames[provider] || provider} token`);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const isTokenExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) <= new Date();
  };

  const isTokenExpiringSoon = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const hoursDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24 && hoursDiff > 0; // Expires within 24 hours
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900">Linked Accounts</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Linked Accounts</h3>
      
      {accounts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ExternalLink className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p>No linked accounts</p>
          <p className="text-sm">Link your social media accounts to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {providerIcons[account.provider] || '🔗'}
                </span>
                
                <div>
                  <h4 className="font-medium text-gray-900">
                    {providerNames[account.provider] || account.provider}
                  </h4>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    {account.display_name && (
                      <p>{account.display_name}</p>
                    )}
                    {account.username && (
                      <p>@{account.username}</p>
                    )}
                    {account.email && (
                      <p>{account.email}</p>
                    )}
                    <p>Connected {new Date(account.connected_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Token status indicator */}
                {account.expires_at && (
                  <div className="text-sm">
                    {isTokenExpired(account.expires_at) ? (
                      <span className="flex items-center text-red-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Expired
                      </span>
                    ) : isTokenExpiringSoon(account.expires_at) ? (
                      <span className="flex items-center text-yellow-600">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Expires Soon
                      </span>
                    ) : (
                      <span className="text-green-600">Active</span>
                    )}
                  </div>
                )}
                
                {/* Refresh token button */}
                {account.expires_at && (
                  <button
                    onClick={() => handleRefreshToken(account.id, account.provider)}
                    disabled={actionLoading === account.id}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                    title="Refresh Token"
                  >
                    <RefreshCw 
                      className={`h-4 w-4 ${actionLoading === account.id ? 'animate-spin' : ''}`} 
                    />
                  </button>
                )}
                
                {/* Unlink button */}
                <button
                  onClick={() => handleUnlinkAccount(account.id, account.provider)}
                  disabled={actionLoading === account.id}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Unlink Account"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}