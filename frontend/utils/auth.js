import api from './api';
import { getBrowserInfo } from './browserDetect';

// Enhanced token storage with fallback to localStorage for Safari private mode
// export const setToken = (token) => {
//   // Check if we're in a browser environment
//   if (typeof window === 'undefined') {
//     console.warn('Not in browser environment, cannot set token');
//     return false;
//   }
  
//   // Create memory store if it doesn't exist
//   window.__tempTokenStore = window.__tempTokenStore || {};
  
//   const browserInfo = getBrowserInfo();
  
//   console.log(`Setting token on ${browserInfo.type}`);
  
//   if (browserInfo.isPrivateMode) {
//     console.log('Private browsing mode detected');
//   }
  
//   // Try localStorage first
//   try {
//     // Test if storage is writable
//     const testKey = `test-${Date.now()}`;
//     localStorage.setItem(testKey, '1');
//     localStorage.removeItem(testKey);
    
//     // If we get here, storage is working
//     localStorage.setItem('token', token);
//     console.log('Token set in localStorage');
    
//     // Also store in memory for Safari fallback
//     window.__tempTokenStore.token = token;
//     return true;
//   } catch (sessionError) {
//     console.warn('localStorage failed:', sessionError);
//   }
  
//   // Try localStorage fallback
//   try {
//     const testKey = `test-${Date.now()}`;
//     localStorage.setItem(testKey, '1');
//     localStorage.removeItem(testKey);
    
//     localStorage.setItem('token', token);
//     console.log('Token set in localStorage (fallback)');
    
//     // Also store in memory for Safari fallback
//     window.__tempTokenStore.token = token;
//     return true;
//   } catch (localError) {
//     console.warn('LocalStorage failed:', localError);
//   }
  
//   // Final memory fallback for all browsers
//   try {
//     window.__tempTokenStore.token = token;
//     console.warn('Using in-memory token storage as final fallback');
//     return true;
//   } catch (memError) {
//     console.error('All storage methods failed:', memError);
//     return false;
//   }
  
//   return false;
// };

// export const getToken = () => {
//   if (typeof window === 'undefined') {
//     console.warn('Not in browser environment, cannot get token');
//     return null;
//   }
  
//   const browserInfo = getBrowserInfo();
  
//   console.log(`Getting token on ${browserInfo.type}`);
  
//   // Check memory storage first (for private mode fallback)
//   if (window.__tempTokenStore?.token) {
//     console.warn('Retrieving token from in-memory storage');
//     return window.__tempTokenStore.token;
//   }
  
//   // Try localStorage
//   try {
//     const token = localStorage.getItem('token');
//     if (token) {
//       console.log('Token retrieved from localStorage');
//       return token;
//     }
//   } catch (error) {
//     console.warn('localStorage access error:', error);
//   }
  
//   // Try localStorage
//   try {
//     const token = localStorage.getItem('token');
//     if (token) {
//       console.log('Token retrieved from localStorage');
//       return token;
//     }
//   } catch (error) {
//     console.warn('LocalStorage access error:', error);
//   }
  
//   console.warn('No token found in any storage');
//   return null;
// };





// Enhanced logout function with cross-browser compatibility

// Helper function to clear all tokens from all storage types
// export const clearAllTokens = () => {
//     // Check if we're in a browser environment
//   if (typeof window === 'undefined') {
//       console.warn('Not in browser environment, cannot clear tokens');
//       return;
//     }
  
//   const browserInfo = getBrowserInfo();
  
//   console.log(`Clearing all tokens on ${browserInfo.type}`);
  
//   if (browserInfo.isPrivateMode) {
//       console.log('Private browsing mode detected, token clearing may be affected');
//     }
  
//     // Clear from localStorage
//     try {
//         localStorage.removeItem('token');
//         localStorage.removeItem('adminToken');
//         console.log('Tokens cleared from localStorage');
//       } catch (error) {
//           console.warn('Error clearing localStorage:', error);
      
//           // Log detailed error for debugging
//           if (browserInfo.isSafari || browserInfo.isIOS) {
//               console.warn(`localStorage clear failure on ${browserInfo.isIOS ? 'iOS' : 'Safari'}: `, error);
//             }
//           }
        
//           // Clear from localStorage
//           try {
//               localStorage.removeItem('token');
//               localStorage.removeItem('adminToken');
//               console.log('Tokens cleared from localStorage');
//             } catch (error) {
//     console.warn('Error clearing localStorage:', error);

//     // Log detailed error for debugging
//     if (browserInfo.isSafari || browserInfo.isIOS) {
//         console.warn(`LocalStorage clear failure on ${browserInfo.isIOS ? 'iOS' : 'Safari'}: `, error);
//       }
//     }
  
//     // Verify tokens are cleared
//     let sessionTokenRemains = false;
//     let localTokenRemains = false;
  
//     try {
//         sessionTokenRemains = localStorage.getItem('token') || localStorage.getItem('adminToken');
//       } catch (e) {}
    
//       try {
//     localTokenRemains = localStorage.getItem('token') || localStorage.getItem('adminToken');
//   } catch (e) {}
  
//   if (sessionTokenRemains || localTokenRemains) {
//       console.warn('Failed to clear all tokens from storage');
//     if (browserInfo.isSafari || browserInfo.isIOS) {
//         console.warn(`Token clearing verification failed on ${browserInfo.isIOS ? 'iOS' : 'Safari'} device`);
//       }
//     } else {
//         console.log('All tokens successfully cleared from all storage types');
//       }
//     };
    
    // Helper function to get admin token with fallback
  //   export const getAdminToken = () => {
  //       if (typeof window === 'undefined') {
  //   console.warn('Not in browser environment, cannot get admin token');
  //   return null;
  // }

  // const browserInfo = getBrowserInfo();

  // console.log(`Getting admin token on ${browserInfo.type}`);

  // // Check memory storage first (for private mode fallback)
  // if (window.__tempTokenStore?.adminToken) {
  //     console.warn('Retrieving admin token from in-memory storage');
  //     return window.__tempTokenStore.adminToken;
  //   }
  
  //   // Try localStorage
  //   try {
  //       const token = localStorage.getItem('adminToken');
  //       if (token) {
  //           console.log('Admin token retrieved from localStorage');
  //           return token;
  //         }
  //       } catch (error) {
  //           console.warn('localStorage access error for admin token:', error);
  //         }
        
  //         // Try localStorage
  //         try {
  //             const token = localStorage.getItem('adminToken');
  //             if (token) {
  //                 console.log('Admin token retrieved from localStorage');
  //                 return token;
  //               }
  //             } catch (error) {
  //                 console.warn('LocalStorage access error for admin token:', error);
  //               }
  
  //               console.warn('No admin token found in any storage');
  //               return null;
  //             };
              
              // Helper function to set admin token with fallback
// export const setAdminToken = (token) => {
//     // Check if we're in a browser environment
//     if (typeof window === 'undefined') {
//         console.warn('Not in browser environment, cannot set admin token');
//         return false;
//       }
    
//       // Create memory store if it doesn't exist
//       window.__tempTokenStore = window.__tempTokenStore || {};
    
//       const browserInfo = getBrowserInfo();
    
//       console.log(`Setting admin token on ${browserInfo.type}`);
    
//       if (browserInfo.isPrivateMode) {
//           console.log('Private browsing mode detected');
//         }
      
//         // Try localStorage first
//         try {
//             // Test if storage is writable
//             const testKey = `test-${Date.now()}`;
//             localStorage.setItem(testKey, '1');
//             localStorage.removeItem(testKey);
    
//             // If we get here, storage is working
//             localStorage.setItem('adminToken', token);
//             console.log('Admin token set in localStorage');
        
//             // Also store in memory for Safari fallback
//             window.__tempTokenStore.adminToken = token;
//     return true;
//   } catch (sessionError) {
//       console.warn('localStorage failed for admin token:', sessionError);
//     }
  
//   // Try localStorage fallback
//   try {
//       const testKey = `test-${Date.now()}`;
//       localStorage.setItem(testKey, '1');
//       localStorage.removeItem(testKey);
  
//       localStorage.setItem('adminToken', token);
//       console.log('Admin token set in localStorage (fallback)');
  
//       // Also store in memory for Safari fallback
//       window.__tempTokenStore.adminToken = token;
//       return true;
//     } catch (localError) {
//         console.warn('LocalStorage failed for admin token:', localError);
//       }
    
//       // Final memory fallback for all browsers
//       try {
//           window.__tempTokenStore.adminToken = token;
//           console.warn('Using in-memory token storage as final fallback for admin token');
//           return true;
//         } catch (memError) {
//             console.error('All storage methods failed for admin token:', memError);
//             return false;
//           }
//         };
        
        
        // utils/auth.js
        
        // A simple in-memory store for fallback

        
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