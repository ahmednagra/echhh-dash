// src/lib/apiClient.ts
import { refreshToken } from '@/services/auth/auth.service';

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

async function apiClient(url: string, options: FetchOptions = {}) {
  const { auth = true, ...fetchOptions } = options;
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';
  const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v0';  

  let baseUrl = '';

  if (appEnv === 'production') {
    baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_PRO!;
  } else if (appEnv === 'development') {
    baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV!;
  } else {
    baseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
  }

  // Optional: fallback warning
  if (!baseUrl) {
    throw new Error('Base URL not set for the current environment.');
  }
                 
  const apiUrl = `${baseUrl}/${apiVersion}${url.startsWith('/') ? url : `/${url}`}`;
  
  const headers = new Headers(fetchOptions.headers);
  
  if (auth) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(apiUrl, {
    ...fetchOptions,
    headers,
  });

  // Handle token expiration
  if (response.status === 401) {
    const refreshTokenStr = localStorage.getItem('refreshToken');
    
    // No refresh token available, redirect to login
    if (!refreshTokenStr) {
      window.location.href = '/login';
      return response;
    }
    
    try {
      // Try to refresh the token
      const authData = await refreshToken(refreshTokenStr);
      
      // Store new tokens
      localStorage.setItem('accessToken', authData.access_token);
      localStorage.setItem('refreshToken', authData.refresh_token);
      localStorage.setItem('tokenExpiry', (Date.now() + authData.expires_in * 1000).toString());
      
      // Retry the original request with new token
      headers.set('Authorization', `Bearer ${authData.access_token}`);
      
      return fetch(apiUrl, {
        ...fetchOptions,
        headers,
      });
    } catch (error) {
      // Refresh failed, redirect to login
      localStorage.clear();
      window.location.href = '/login';
      return response;
    }
  }
  
  return response;
}

export default apiClient;