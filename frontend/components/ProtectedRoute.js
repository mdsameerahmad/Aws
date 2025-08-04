import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { checkAuth, getToken, clearAllTokens } from '../utils/auth';

const ProtectedRoute = (WrappedComponent) => {
  const ComponentWithAuth = (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Detect Safari/iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        
        console.log(`Protected route check from browser: ${isSafari ? 'Safari' : isIOS ? 'iOS' : 'Other'}`);
        
        // For Safari/iOS, add initial delay before checking token
        if (isSafari || isIOS) {
          console.log('Safari/iOS detected, adding initial delay before token check');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // First check if we have a token in storage (with fallback)
        const token = getToken();
        
        if (!token) {
          // Safari may need extra time to process cookies
          console.log('No token found, adding delay before retry');
          await new Promise(resolve => setTimeout(resolve, 300));
          const retryToken = getToken();
          
          if (!retryToken) {
            console.log('No token found in any storage after retry, redirecting to login');
            router.replace('/auth/login');
            return;
          }
        }
        
        // Then verify with the server
        try {
          const user = await checkAuth();
          if (!user) {
            console.log('Token invalid or expired, redirecting to login');
            // Clear any invalid tokens from all storage types
            clearAllTokens();
            router.replace('/auth/login');
          } else {
            setLoading(false);
          }
        } catch (error) {
          // If we get a 401 error and we're on Safari/iOS, retry once with a delay
          if ((isSafari || isIOS) && error.response?.status === 401) {
            console.log('Got 401 on Safari/iOS, retrying after delay');
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Retry the auth check
            const retryUser = await checkAuth();
            if (retryUser) {
              console.log('Retry successful');
              setLoading(false);
              return;
            }
          }
          
          console.error('Authentication error:', error);
          // Clear any invalid tokens from all storage types
          clearAllTokens();
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear any invalid tokens from all storage types
        clearAllTokens();
        router.replace('/auth/login');
      }
    };
    verifyAuth();
  }, [router]);

    if (loading) {
      // Show a loading message for better user experience
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Verifying your authentication...</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithAuth.displayName = `ProtectedRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return ComponentWithAuth;
};

export default ProtectedRoute;