
// import Head from 'next/head';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { useState } from 'react';
// import api from '../../utils/api';
// import { setAdminToken, getAdminToken } from '../../utils/auth';

// export default function AdminLogin() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       console.log('Attempting admin login...');
//       const response = await api.post('/api/admin/login', { email, password });
      
//       // Ensure we have a token in the response
//       if (response.data && response.data.token) {
//         console.log('Admin token received, storing in browser storage');
        
//         // Get browser info for Safari-specific handling
//         const browserInfo = window.navigator.userAgent;
//         const isSafari = /safari/.test(browserInfo.toLowerCase()) && !/chrome/.test(browserInfo.toLowerCase());
//         const isIOS = /iphone|ipad|ipod/.test(browserInfo.toLowerCase());
        
//         // Use the enhanced storage function with fallback
//         const tokenStored = setAdminToken(response.data.token);
        
//         if (!tokenStored) {
//           throw new Error('Failed to store admin token in browser storage');
//         }
        
//         // Double-check token was stored correctly
//         const storedToken = getAdminToken();
//         if (storedToken) {
//           console.log('Admin token successfully stored, redirecting to dashboard');
          
//           // For Safari/iOS, add a small delay before redirecting to ensure cookie processing
//           if (isSafari || isIOS) {
//             console.log('Safari/iOS detected, adding delay before redirect');
//             await new Promise(resolve => setTimeout(resolve, 300));
//           }
          
//           router.push('/admin/dashboard');
//         } else {
//           throw new Error('Failed to verify admin token storage');
//         }
//       } else {
//         throw new Error('No token received from server');
//       }
//     } catch (error) {
//       console.error('Admin login error:', error);
//       setError(error.response?.data?.message || error.message || 'Login failed. Please try again.');
//     }
//   };

//   const handleUserLogin = () => {
//     router.push('/auth/login');
//   };

//   return (
//     <>
//       <Head>
//         <title>Admin Login</title>
//       </Head>
      
//       <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{ 
//         backgroundColor: '#FFFFFF',
//         backgroundImage: 'radial-gradient(circle at 90% 20%, rgba(58, 134, 255, 0.1) 0%, rgba(10, 36, 99, 0.1) 90%)'
//       }}>
//         <div className="text-center mb-4">
//           <h1 className="fw-bold display-4" style={{ 
//             color: '#0A2463',
//             textShadow: '2px 2px 4px rgba(58, 134, 255, 0.3)',
//             letterSpacing: '2px'
//           }}>
//             GROWTHAFFINITY
//           </h1>
//           <p className="lead" style={{ 
//             color: '#0A2463',
//             fontWeight: '500',
//             textShadow: '1px 1px 2px rgba(0, 245, 255, 0.2)'
//           }}>
//             Admin Portal - Restricted Access
//           </p>
//         </div>

//         <div className="card p-4 shadow-lg" style={{ 
//           width: '100%', 
//           maxWidth: '400px',
//           backgroundColor: 'white',
//           border: 'none',
//           borderRadius: '15px',
//           boxShadow: '0 10px 25px rgba(58, 134, 255, 0.2)'
//         }}>
//           <div className="dropdown mb-3">
//             <button 
//               className="btn dropdown-toggle w-100 py-3" 
//               style={{ 
//                 background: 'linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '10px',
//                 fontWeight: '600',
//                 letterSpacing: '1px',
//                 boxShadow: '0 4px 15px rgba(58, 134, 255, 0.4)'
//               }}
//               type="button" 
//               id="adminLoginDropdown"
//               data-bs-toggle="dropdown"
//               aria-expanded="false"
//             >
//               Admin Login
//             </button>
//             <ul className="dropdown-menu w-100" aria-labelledby="adminLoginDropdown">
//               <li>
//                 <button 
//                   className="dropdown-item py-2" 
//                   onClick={handleUserLogin}
//                   style={{ color: '#0A2463', fontWeight: '500' }}
//                 >
//                   User Login
//                 </button>
//               </li>
//               <li>
//                 <button 
//                   className="dropdown-item py-2" 
//                   style={{ color: '#0A2463', fontWeight: '500' }}
//                 >
//                   Admin Login
//                 </button>
//               </li>
//             </ul>
//           </div>
          
//           <form onSubmit={handleSubmit}>
//             {error && (
//               <div className="alert alert-danger" role="alert">
//                 {error}
//               </div>
//             )}
//             <div className="mb-4">
//               <input 
//                 type="text" 
//                 className="form-control py-3" 
//                 placeholder="Admin Email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="mb-4">
//               <input 
//                 type="password" 
//                 className="form-control py-3" 
//                 placeholder="Admin Password"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <button 
//               type="submit" 
//               className="btn w-100 py-3 mb-3"
//               style={{ 
//                 background: 'linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '10px',
//                 fontWeight: '600',
//                 letterSpacing: '1px',
//                 boxShadow: '0 4px 15px rgba(58, 134, 255, 0.4)'
//               }}
//             >
//               ADMIN LOGIN
//             </button>
//           </form>
          
//           <div className="text-center mt-3">
//             <Link 
//               href="/admin/forgot-credentials" 
//               className="text-decoration-none small fw-medium"
//               style={{ color: '#0A2463' }}
//             >
//               Forget admin credentials? →
//             </Link>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import api from '../../utils/api';
import { setAdminToken, getAdminToken } from '../../utils/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. Simple validation
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password.");
      setIsLoading(false); // Stop loading since we are returning early
      return;
    }

    // 2. Make the API call
    const response = await api.post("/api/admin/login", {
      email: trimmedEmail,
      password: trimmedPassword,
    });

    // 3. Get and save the token
    const { token } = response.data;
    setAdminToken(token); // Use the specific function for admin

    // 4. Redirect immediately
    router.push("/admin/dashboard");

  } catch (err) {
    console.error("Admin login error:", err);
    // Handle specific API errors
    if (err.response?.status === 401 || err.response?.status === 404) {
      setError("Invalid admin credentials.");
    } else {
      // Handle all other errors
      setError("Login failed. Please try again.");
    }
    setIsLoading(false); // IMPORTANT: Stop loading on any error
  }
};
  const handleUserLogin = () => {
    router.push('/auth/login');
  };

  return (
    <>
      <Head>
        <title>Admin Login - GROWTHAFFINITY</title>
      </Head>

      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{
        backgroundColor: '#FFFFFF',
        backgroundImage: 'radial-gradient(circle at 90% 20%, rgba(58, 134, 255, 0.1) 0%, rgba(10, 36, 99, 0.1) 90%)'
      }}>
        <div className="text-center mb-4">
          <h1 className="fw-bold display-4" style={{
            color: '#0A2463',
            textShadow: '2px 2px 4px rgba(58, 134, 255, 0.3)',
            letterSpacing: '2px'
          }}>
            GROWTHAFFINITY
          </h1>
          <p className="lead" style={{
            color: '#0A2463',
            fontWeight: '500',
            textShadow: '1px 1px 2px rgba(0, 245, 255, 0.2)'
          }}>
            Admin Portal - Restricted Access
          </p>
        </div>

        <div className="card p-4 shadow-lg" style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(58, 134, 255, 0.2)'
        }}>
          <div className="dropdown mb-3">
            <button
              className="btn dropdown-toggle w-100 py-3"
              style={{
                background: 'linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(58, 134, 255, 0.4)'
              }}
              type="button"
              id="adminLoginDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              disabled={isLoading}
            >
              Admin Login
            </button>
            <ul className="dropdown-menu w-100" aria-labelledby="adminLoginDropdown">
              <li>
                <button
                  className="dropdown-item py-2"
                  onClick={handleUserLogin}
                  style={{ color: '#0A2463', fontWeight: '500' }}
                  disabled={isLoading}
                >
                  User Login
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item py-2"
                  style={{ color: '#0A2463', fontWeight: '500' }}
                  disabled
                >
                  Admin Login
                </button>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <div className="mb-4">
              <input
                type="text"
                className="form-control py-3"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                className="form-control py-3"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="btn w-100 py-3 mb-3"
              style={{
                background: 'linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(58, 134, 255, 0.4)'
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  PROCESSING...
                </>
              ) : (
                'ADMIN LOGIN'
              )}
            </button>
          </form>

          
        </div>
      </div>
    </>
  );
}
