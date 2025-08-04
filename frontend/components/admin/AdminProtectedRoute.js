import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../services/api';
import { getAdminToken, clearAllTokens } from '../../utils/auth';
import { getBrowserInfo } from '../../utils/browserDetect';

const AdminProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  
useEffect(() => {
  const checkAuth = async () => {
    try {
      const browserInfo = getBrowserInfo();
      const isSafari = browserInfo.isSafari || browserInfo.isIOS;
      
      // First check if we have an admin token in storage (with fallback)
      let adminToken = getAdminToken();
      
      // For Safari/iOS, add a retry mechanism if token is not found initially
      if (!adminToken && isSafari) {
        console.log('Safari/iOS detected, waiting for token processing...');
        // Wait for Safari to process cookies
        await new Promise(resolve => setTimeout(resolve, 500));
        adminToken = getAdminToken();
      }
      
      if (!adminToken) {
        console.log('No admin token found in storage, redirecting to login');
        router.push('/admin/login');
        return;
      }
      
      // Then verify with the server
      try {
        await api.get('/api/admin/verify');
        console.log('Admin authentication verified with server');
        setIsAuthenticated(true);
      } catch (verifyError) {
        // For Safari, if we get a 401, try one more time after a short delay
        if (isSafari && verifyError.response?.status === 401) {
          console.log('Safari/iOS detected, retrying verification after delay...');
          await new Promise(resolve => setTimeout(resolve, 300));
          await api.get('/api/admin/verify');
          console.log('Admin authentication verified with server on retry');
          setIsAuthenticated(true);
        } else {
          throw verifyError;
        }
      }
    } catch (error) {
      console.error('Admin auth error:', error);
      // Clear any invalid tokens from all storage types
      clearAllTokens();
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, [router]);




  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="ms-3 text-muted small">Verifying admin access...</div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

AdminProtectedRoute.displayName = 'AdminProtectedRoute';

export default AdminProtectedRoute;
