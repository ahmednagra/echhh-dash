// src/lib/apiHelper.ts
import axios from 'axios';

// Determine baseURL based on NODE_ENV
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';
const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v0';               

let baseURL = '';

if (appEnv === 'production') {
  baseURL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_PRO!;
} else if (appEnv === 'development') {
  baseURL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV!;
} else {
  baseURL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
}

// Fallback if not set
if (!baseURL) {
  console.warn('⚠️ No base URL set for environment. Using localhost fallback.');
  baseURL = 'http://localhost:8000';
}

  baseURL = `${baseURL}/${apiVersion}`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // Use the same key as in your auth context
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Import your auth context functions or create a utility for token refresh
import { refreshToken } from '@/services/auth/auth.service';

// Session expiration handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshTokenValue = localStorage.getItem('refreshToken');
        
        if (!refreshTokenValue) {
          // No refresh token available, redirect to login
          window.location.href = '/login?expired=true';
          return Promise.reject(error);
        }
        
        // Call your refresh token API
        const response = await refreshToken(refreshTokenValue);
        
        // Update tokens in localStorage
        localStorage.setItem('accessToken', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token);
        localStorage.setItem('tokenExpiry', (Date.now() + response.expires_in * 1000).toString());
        
        // Update the Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${response.access_token}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login?expired=true';
        return Promise.reject(error);
      }
    }
    
    // For all other errors, log and reject as usual
    console.error('API Error:', error?.response?.data || error?.message);
    return Promise.reject(error);
  }
);

// Export the configured API instance
export default api;