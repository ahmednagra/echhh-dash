// src/context/AuthContext.tsx - MINIMAL ENHANCEMENT preserving existing functionality
// Based on your working version, only adding minimal agent support
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AuthState, 
  LoginCredentials, 
  User, 
  Role,
  DetailedRole,
  UserType,
  RoleCheckResult,
  OutreachAgent,
  AgentType
} from '@/types/auth';
import { 
  login as loginService,
  logout as logoutService,
  refreshToken as refreshTokenService,
} from '@/services/auth/auth.service';
import { 
  getStoredUser,
  getStoredRoles,
  getStoredOutreachAgent, // NEW: Added for agent support
  getStoredAgentType, // NEW: Added for agent support
  isTokenExpired,
  isTokenExpiringSoon,
  clearAuthData 
} from '@/services/auth/auth.utils';
import { 
  isAuthError, 
  AccountInactiveError, 
  InvalidCredentialsError 
} from '@/services/auth/auth.errors';
import { 
  checkRoleAccess, 
  getPrimaryRole, 
  getUserTypeFromRole,
  hasDetailedRole,
  hasAnyDetailedRole,
  canAccessComponent,
  PermissionCheck
} from '@/utils/role-utils';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserSession: () => Promise<boolean>;
  loadAuthFromStorage: () => void;
  
  // Enhanced role checking methods
  getPrimaryRole: () => DetailedRole | null;
  getUserType: () => UserType | null;
  hasRole: (role: DetailedRole) => boolean;
  hasAnyRole: (roles: DetailedRole[]) => boolean;
  checkRoleAccess: () => RoleCheckResult;
  canAccess: (componentName: string, requiredRoles?: DetailedRole[], requiredPermissions?: PermissionCheck[]) => boolean;
  
  // NEW: Minimal agent support methods
  getOutreachAgent: () => OutreachAgent | null;
  getAgentType: () => AgentType | null;
  isAgent: () => boolean;
  
  // Legacy support for existing code
  isUserType: (type: UserType) => boolean;
}

const initialState: AuthState = {
  user: null,
  roles: [],
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const router = useRouter();
  
  // PRESERVED: loadAuthFromStorage method
  const loadAuthFromStorage = () => {
    try {
      console.log('🔄 AuthContext: Loading auth data from localStorage...');
      
      const user = getStoredUser();
      const roles = getStoredRoles();
      const token = localStorage.getItem('accessToken');
      // NEW: Also log agent data but don't break existing functionality
      const outreachAgent = getStoredOutreachAgent();
      const agentType = getStoredAgentType();
      
      console.log('📊 AuthContext: Auth data check:', {
        hasUser: !!user,
        hasRoles: !!(roles && roles.length > 0),
        hasToken: !!token,
        tokenExpired: isTokenExpired(),
        // NEW: Log agent data
        hasOutreachAgent: !!outreachAgent,
        agentType
      });
      
      if (user && roles && roles.length > 0 && token && !isTokenExpired()) {
        console.log('✅ AuthContext: Valid auth data found, updating state');
        
        setAuthState({
          user,
          roles,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        console.log('❌ AuthContext: Invalid or missing auth data');
        clearAuthData();
        setAuthState({
          user: null,
          roles: [],
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('💥 AuthContext: Error loading auth from storage:', error);
      clearAuthData();
      setAuthState({
        user: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };
  
  // PRESERVED: Initialize auth state from localStorage on mount - UNCHANGED
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedToken) {
          // Check if token is expired
          if (isTokenExpired()) {
            console.log('Found expired token on initialization');
            // Token is expired, try to refresh
            const success = await refreshUserSession();
            if (!success) {
              // Unable to refresh, ensure auth data is cleared
              console.log('Token refresh failed during initialization');
              clearAuthData();
              setAuthState({
                user: null,
                roles: [],
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          } else {
            // Valid token exists
            const user = getStoredUser();
            const roles = getStoredRoles();
            
            if (user) {
              setAuthState({
                user,
                roles,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            } else {
              // User data missing, clear everything
              console.log('User data missing despite having token');
              clearAuthData();
              setAuthState({
                user: null,
                roles: [],
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          }
        } else {
          // No stored credentials
          console.log('No stored credentials found');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear any invalid auth data
        clearAuthData();
        setAuthState({
          user: null,
          roles: [],
          isAuthenticated: false,
          isLoading: false,
          error: 'Error initializing authentication',
        });
      }
    };
  
    initializeAuth();
  }, []);

  // PRESERVED: Set up token refresh interval - UNCHANGED
  useEffect(() => {
    if (!authState.isAuthenticated) return;
    
    // Check token every minute
    const intervalId = setInterval(async () => {
      // Refresh if token will expire in less than 5 minutes
      if (isTokenExpiringSoon(5)) {
        await refreshUserSession();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [authState.isAuthenticated]);

  // PRESERVED: handleLogout - UNCHANGED
  const handleLogout = async (callApi = true) => {
    try {
      if (callApi) {
        await logoutService();
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setAuthState({ 
        user: null, 
        roles: [], 
        isAuthenticated: false, 
        isLoading: false, 
        error: null 
      });
      
      router.push('/login');
    }
  };

  // PRESERVED: login method - UNCHANGED
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Call the login service
      const authData = await loginService(credentials);
      
      // Update auth state only if login was successful
      setAuthState({
        user: authData.user,
        roles: authData.roles,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
    } catch (error) {
      // Clear any existing auth data to prevent invalid redirects
      clearAuthData();
      
      // Handle different types of auth errors
      let errorMessage: string;
      
      if (isAuthError(error)) {
        // Use the error message directly from our custom errors
        errorMessage = error.message;
        
        // Special handling for different error types if needed
        if (error instanceof AccountInactiveError) {
          // Maybe add additional context for inactive accounts
          errorMessage = `${error.message}. Please contact your administrator.`;
        } else if (error instanceof InvalidCredentialsError) {
          // Keep the standard message for invalid credentials
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        // Generic Error object
        errorMessage = error.message;
      } else {
        // Unknown error type
        errorMessage = 'Login failed. Please check your credentials.';
      }
      
      // Set error state
      setAuthState(prev => ({ 
        ...prev, 
        user: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false, 
        error: errorMessage
      }));
      
      // Re-throw the error so the login form can handle it
      throw error;
    }
  };

  // PRESERVED: refreshUserSession - UNCHANGED
  const refreshUserSession = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (!storedRefreshToken) {
        console.log('No refresh token available');
        return false;
      }
      
      // Call the refresh token service
      const authData = await refreshTokenService(storedRefreshToken);
      
      // Update auth state
      setAuthState({
        user: authData.user,
        roles: authData.roles,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      return true;
    } catch (error) {
      // console.error('Token refresh failed:', error);
      // Clear auth data on failure
      clearAuthData();
      
      // Update auth state
      setAuthState({
        user: null,
        roles: [],
        isAuthenticated: false,
        isLoading: false,
        error: 'Your session has expired. Please log in again.',
      });
      
      return false;
    }
  };

  // PRESERVED: Enhanced role checking methods - UNCHANGED
  const getPrimaryRoleMethod = (): DetailedRole | null => {
    return getPrimaryRole(authState.roles);
  };

  const getUserTypeMethod = (): UserType | null => {
    const primaryRole = getPrimaryRole(authState.roles);
    return primaryRole ? getUserTypeFromRole(primaryRole) : null;
  };

  const hasRoleMethod = (role: DetailedRole): boolean => {
    return hasDetailedRole(authState.roles, role);
  };

  const hasAnyRoleMethod = (roles: DetailedRole[]): boolean => {
    return hasAnyDetailedRole(authState.roles, roles);
  };

  const checkRoleAccessMethod = (): RoleCheckResult => {
    return checkRoleAccess(authState.user, authState.roles);
  };

  const canAccessMethod = (
    componentName: string, 
    requiredRoles?: DetailedRole[], 
    requiredPermissions?: PermissionCheck[]
  ): boolean => {
    return canAccessComponent(authState.roles, componentName, requiredRoles, requiredPermissions);
  };

  // PRESERVED: Legacy support method - UNCHANGED
  const isUserTypeMethod = (type: UserType): boolean => {
    const userType = getUserTypeMethod();
    return userType === type;
  };

  // NEW: Minimal agent support methods
  const getOutreachAgent = (): OutreachAgent | null => {
    return getStoredOutreachAgent();
  };

  const getAgentType = (): AgentType | null => {
    return getStoredAgentType();
  };

  const isAgent = (): boolean => {
    return getPrimaryRoleMethod() === 'platform_agent' && !!getAgentType();
  };

  const value = {
    ...authState,
    login,
    logout: () => handleLogout(true),
    refreshUserSession,
    loadAuthFromStorage,
    
    // Enhanced role methods
    getPrimaryRole: getPrimaryRoleMethod,
    getUserType: getUserTypeMethod,
    hasRole: hasRoleMethod,
    hasAnyRole: hasAnyRoleMethod,
    checkRoleAccess: checkRoleAccessMethod,
    canAccess: canAccessMethod,
    
    // NEW: Agent support methods
    getOutreachAgent,
    getAgentType,
    isAgent,
    
    // Legacy support
    isUserType: isUserTypeMethod,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}