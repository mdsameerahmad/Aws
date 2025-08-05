// // utils/api.js - This will be your single, comprehensive Axios instance for all API calls.

// import axios from 'axios';
// import { getToken, getAdminToken, setToken, setAdminToken, clearAllTokens } from './auth';

// // Determine the API base URL.
// // It tries to use NEXT_PUBLIC_API_URL from environment variables first.
// // If not set (e.g., in development without a .env file), it defaults to http://65.1.110.115:5000.
// // This is critical for Docker Compose networking:
// // - From your browser: http://65.1.110.115:5000 (because Docker maps container port 5000 to host port 5000)
// // - From frontend container to API Gateway container: http://api-gateway:5000 (using Docker's internal DNS resolution)
// const API_URL = process.env.NEXT_PUBLIC_API_URL ;

// // Import browser detection utilities
// import { getBrowserInfo, getRequestHeaders } from './browserDetect';

// // We now use the comprehensive browser detection utility instead of the old function

// // Create an Axios instance with enhanced cross-browser compatibility
// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     ...getRequestHeaders(), // Use our browser-specific headers
//   },
//   withCredentials: true, // Necessary for sending cookies/session tokens
//   xsrfCookieName: 'XSRF-TOKEN', // Default CSRF cookie name
//   xsrfHeaderName: 'X-XSRF-TOKEN', // Default CSRF header name
// });

// // --- Request Interceptor: Add Authorization header with enhanced browser compatibility ---
// // This interceptor will run before every API request.
// api.interceptors.request.use(
//   (config) => {
//     // Get browser info first for better decision making
//     const browserInfo = getBrowserInfo();
    
//     // Log browser/device info for debugging
//     console.log(`Making request from ${browserInfo.type} browser to ${config.url}`);
    
//     // Get tokens using the enhanced getter functions with fallbacks
//     const finalUserToken = getToken();
//     const finalAdminToken = getAdminToken();

//     // Logic to decide which token to send:
//     // If the request URL includes '/admin/' AND an adminToken exists, use the adminToken.
//     // Otherwise, if a general userToken exists, use that.
//     if (finalAdminToken && config.url && config.url.includes('/admin/')) {
//       config.headers.Authorization = `Bearer ${finalAdminToken}`;
//       console.log('Using admin token for request');
//     } else if (finalUserToken) {
//       // For all other authenticated endpoints, use the user token.
//       config.headers.Authorization = `Bearer ${finalUserToken}`;
//       console.log('Using user token for request');
//     }
    
//     // For Safari/iOS, ensure we're sending the token in both header and cookie
//     if ((browserInfo.isSafari || browserInfo.isIOS) && (finalUserToken || finalAdminToken)) {
//       console.log('Safari/iOS detected, ensuring token is sent in both header and cookie');
      
//       // Add special headers for Safari/iOS
//       config.headers['X-Token-Fallback'] = finalUserToken || finalAdminToken;
      
//       // Ensure withCredentials is true for Safari/iOS
//       config.withCredentials = true;
//     }
    
//     // Apply browser-specific headers using our utility function
//     const browserHeaders = getRequestHeaders();
//     Object.keys(browserHeaders).forEach(key => {
//       config.headers[key] = browserHeaders[key];
//     });
    
//     console.log('Added browser-specific compatibility headers');
    
//     // Check for private browsing mode
//     if (browserInfo.isPrivateMode) {
//       console.log('Request being made in private browsing mode - storage may be limited');
//     }

//     return config;
//   },
//   (error) => {
//     console.error('Request Interceptor Error:', error);
//     return Promise.reject(error);
//   }
// );

// // --- Response Interceptor: Handle Responses and Errors with enhanced token handling ---
// api.interceptors.response.use(
//   (response) => {
//     // Check if we received a token in the response and store it
//     if (response.data && response.data.token) {
//       // For admin login responses
//       if (response.config.url && response.config.url.includes('/admin/login')) {
//         // Use the enhanced setter function with fallback
//         setAdminToken(response.data.token);
//         console.log('Admin token stored with fallback mechanism');
//       } else {
//         // Use the enhanced setter function with fallback for regular user token
//         setToken(response.data.token);
//         console.log('User token stored with fallback mechanism');
//       }
//     }
//     return response;
//   },
//   (error) => {
//     console.error('API Error:', error.response?.data || error.message);

//     // If the error response exists and its status is 401 (Unauthorized)
//     if (error.response && error.response.status === 401) {
//       console.warn('Unauthorized request detected. Clearing tokens and redirecting to login...');
      
//       // Use the enhanced function to clear all tokens from all storage types
//       clearAllTokens();
      
//       // Determine the appropriate redirect based on the URL
//       if (typeof window !== 'undefined') { // Ensure this runs only in the browser
//         const isAdminRoute = window.location.pathname.startsWith('/admin');
//         window.location.href = isAdminRoute ? '/admin/login' : '/auth/login';
//       }
//     }
//     return Promise.reject(error); // Always reject the promise so calling code can catch it
//   }
// );

// export default api;


// utils/api.js

import axios from 'axios';
import { getToken, getAdminToken, clearAllTokens } from './auth';

// 1. FIX: Added a fallback for your API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://65.1.110.115:5000';

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