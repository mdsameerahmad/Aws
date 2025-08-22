import api from './api';
import { getBrowserInfo } from './browserDetect';



        
const memoryStore = {};

// --- USER TOKEN ---
export const setToken = (token) => {
  try {
    // Tries localStorage, falls back to memory
    localStorage.setItem('token', token);
  } catch (e) {
    console.warn('localStorage is not available. Using in-memory store.');
    memoryStore.token = token;
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (e) {
    console.warn('localStorage is not available. Reading from in-memory store.');
    return memoryStore.token || null;
  }
};


// --- ADMIN TOKEN ---
export const setAdminToken = (token) => {
  try {
    localStorage.setItem('adminToken', token);
  } catch (e) {
    console.warn('localStorage is not available. Using in-memory store for admin.');
    memoryStore.adminToken = token;
  }
};

export const getAdminToken = () => {
  try {
    return localStorage.getItem('adminToken');
  } catch (e) {
    console.warn('localStorage is not available. Reading from in-memory store for admin.');
    return memoryStore.adminToken || null;
  }
};


// --- CLEAR ALL TOKENS ---
export const clearAllTokens = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
  } catch (e) {
    console.warn('Could not clear localStorage. Clearing in-memory store.');
    delete memoryStore.token;
    delete memoryStore.adminToken;
  }
};

export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
    // Clear any client-side state from both storage types
    clearAllTokens();
    
    // Force a page reload to clear any in-memory state
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Clear tokens even if API call fails
    clearAllTokens();
    
    // Force a page reload to clear any in-memory state
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }
};


export const removeToken = () => {
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.warn('Error removing token from localStorage:', error);
  }
  
  try {
    localStorage.removeItem('token');
  } catch (error) {
    console.warn('Error removing token from localStorage:', error);
  }
};

export const checkAuth = async () => {
  try {
    // Get browser info for debugging
    const browserInfo = getBrowserInfo();
    console.log(`Checking auth on ${browserInfo.type} browser`);
    
    // Add retry mechanism for Safari/iOS
    const makeRequest = async (attempt = 1) => {
      try {
        const response = await api.get('/api/auth/check-auth');
        console.log('Auth check response:', response.status, response.data.authenticated);
        return response.data.authenticated ? response.data.user : null;
      } catch (error) {
        console.error(`Auth check error (attempt ${attempt}):`, error.response?.status, error.message);
        
        // If Safari/iOS and 401 error, retry once with delay
        if ((browserInfo.isSafari || browserInfo.isIOS) && 
            error.response?.status === 401 && 
            attempt === 1) {
          console.log('Safari/iOS 401 error detected, retrying after delay');
          await new Promise(resolve => setTimeout(resolve, 500));
          return makeRequest(2);
        }
        
        return null;
      }
    };
    
    return await makeRequest();
  } catch (error) {
    console.error('Unexpected error in checkAuth:', error);
    return null;
  }
};