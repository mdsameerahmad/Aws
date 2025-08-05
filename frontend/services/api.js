

// import axios from 'axios';

// const API = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://51.21.223.118:5000',
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add request interceptor to include admin token
// API.interceptors.request.use(config => {
//   const adminToken = localStorage.getItem('adminToken');
//   if (adminToken) {
//     config.headers.Authorization = `Bearer ${adminToken}`;
//   }
//   return config;
// });



// export default API;
import axios from 'axios';
import { getToken, getAdminToken } from '../utils/auth';
import { getBrowserInfo } from '../utils/browserDetect';

const api = axios.create({  // Changed from API to api
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced request interceptor with cross-browser compatibility
api.interceptors.request.use(
  (config) => {
    // First try admin token with fallback
    const adminToken = getAdminToken();
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      return config;
    }
    
    // Fall back to regular token with fallback
    const token = getToken();
    console.log("Interceptor attaching token:", token ? 'Token found' : 'No token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add browser-specific headers using the browserDetect utility
    if (typeof window !== 'undefined') {
      const browserInfo = getBrowserInfo();
      
      if (browserInfo.isSafari || browserInfo.isIOS) {
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        config.headers['Pragma'] = 'no-cache';
        config.headers['Expires'] = '0';
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Enhanced response interceptor with cross-browser compatibility
api.interceptors.response.use(
  (response) => {
    // Store token if it's in the response using the enhanced storage function
    if (response.data && response.data.token) {
      try {
        // Try localStorage first
        localStorage.setItem('token', response.data.token);
      } catch (e) {
        // Fall back to localStorage if localStorage fails (e.g., Safari private mode)
        try {
          localStorage.setItem('token', response.data.token);
          console.log('Token stored in localStorage as fallback');
        } catch (e2) {
          console.error('Failed to store token in any storage:', e2);
        }
      }
    }
    
    // Store admin token if it's in the response using the enhanced storage function
    if (response.data && response.data.adminToken) {
      try {
        // Try localStorage first
        localStorage.setItem('adminToken', response.data.adminToken);
      } catch (e) {
        // Fall back to localStorage if localStorage fails (e.g., Safari private mode)
        try {
          localStorage.setItem('adminToken', response.data.adminToken);
          console.log('Admin token stored in localStorage as fallback');
        } catch (e2) {
          console.error('Failed to store admin token in any storage:', e2);
        }
      }
    }
    
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear tokens from both storage types
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
      
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
      
      // Redirect based on current path
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (path.startsWith('/admin')) {
          window.location.href = '/admin/login';
        } else {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;  // Consistent lowercase export