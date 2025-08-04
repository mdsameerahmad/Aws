// pages/_error.js
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ErrorPage({ statusCode }) {
  const router = useRouter();
  const [userType, setUserType] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Check auth status and user type when component mounts
    const checkAuth = () => {
      try {
        const userData = typeof window !== 'undefined' && 
          (localStorage.getItem('userProfileData') || 
           localStorage.getItem('userProfileData'));
        
        if (userData) {
          const parsedData = JSON.parse(userData);
          // Check if user is admin (adjust this based on your actual user data structure)
          const isAdmin = parsedData?.role === 'admin' || 
                         parsedData?.isAdmin || 
                         window.location.pathname.startsWith('/admin');
          setUserType(isAdmin ? 'admin' : 'user');
        } else {
          // Default to user dashboard if no auth data found
          setUserType('user');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Default to user dashboard on error
        setUserType('user');
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      // Redirect based on user type - always to dashboard if userType is set
      if (userType === 'admin') {
        router.push('/admin/dashboard');
      } else {
        // Default redirect to user dashboard
        router.push('/dashboard');
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, userType]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Head>
        <title>Error {statusCode} | GROWTHAFFINITY</title>
      </Head>

      <div className="text-center p-4" style={{ maxWidth: '600px' }}>
        <h1 className="display-1 fw-bold mb-4" style={{ color: '#0A2463' }}>
          {statusCode || 'Error'}
        </h1>
        
        <h2 className="mb-4">
          {statusCode === 404 
            ? 'Page Not Found' 
            : 'Something went wrong'}
        </h2>

        <p className="lead mb-4">
          {statusCode === 404
            ? "The page you're looking for doesn't exist."
            : "We're working to fix the issue. Please try again later."}
        </p>

        <div className="mb-4">
          <p>Redirecting in <span className="fw-bold">{countdown}</span> seconds...</p>
          <div className="progress" style={{ height: '6px' }}>
            <div 
              className="progress-bar bg-primary" 
              role="progressbar" 
              style={{ width: `${countdown * 20}%` }}
              aria-valuenow={countdown * 20} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        <div className="d-flex gap-3 justify-content-center">
          <Link href="/" className="btn btn-outline-primary">
            Go to Home
          </Link>
          {userType === 'admin' ? (
            <Link href="/admin/dashboard" className="btn btn-primary">
              Go to Admin Dashboard
            </Link>
          ) : (
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};