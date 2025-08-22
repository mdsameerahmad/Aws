

import axios from 'axios';
import { getToken, getAdminToken, clearAllTokens } from './auth';

// 1. FIX: Added a fallback for your API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.growthaffinitymarketing.com';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// --- Request Interceptor ---
api.interceptors.request.use((config) => {
  // 2. FIX: Correctly checks if the URL is for an admin route
  const token = config.url?.includes('/admin/') 
    ? getAdminToken() 
    : getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// --- Response Interceptor ---
api.interceptors.response.use(
  (response) => response, // Successful responses pass through
  (error) => {
    // 3. FIX: Simplified logic to handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.warn('Unauthorized. Clearing tokens and redirecting...');
      
      // Use the single, reliable function to clear tokens
      clearAllTokens();

      if (typeof window !== 'undefined') {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminRoute ? '/admin/login' : '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;