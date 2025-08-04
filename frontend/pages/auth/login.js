
// import Head from 'next/head';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { useState } from 'react';
// import api from "../../utils/api";
// import { setToken, getToken } from '../../utils/auth';

// export default function Login() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       console.log('Attempting user login...');
//       const response = await api.post("/api/auth/login", { email, password });
      
//       // Detect Safari/iOS
//       const userAgent = window.navigator.userAgent.toLowerCase();
//       const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
//       const isIOS = /iphone|ipad|ipod/.test(userAgent);
      
//       console.log(`Login from browser: ${isSafari ? 'Safari' : isIOS ? 'iOS' : 'Other'}`);
      
//       // Verify token was stored successfully
//       const token = response.data?.token;
//       if (token) {
//         const storageSuccess = setToken(token);
//         if (!storageSuccess) {
//           throw new Error('Failed to store authentication token');
//         }
        
//         // Verify token was actually stored
//         const storedToken = getToken();
//         if (!storedToken) {
//           console.warn('Token storage verification failed');
//           throw new Error('Token storage verification failed');
//         }
//       }
      
//       console.log("Login success:", response.data);
      
//       // For Safari/iOS, add a small delay before redirecting to ensure cookie is properly set
//       if (isSafari || isIOS) {
//         console.log('Safari/iOS detected, adding delay before redirect');
//         setError('Finalizing login... Please wait.');
        
//         // First delay to ensure cookie is set
//         await new Promise(resolve => setTimeout(resolve, 300));
        
//         // Verify token is accessible
//         const verifyToken = getToken();
//         if (!verifyToken) {
//           console.warn('Token verification failed after delay, retrying...');
//           await new Promise(resolve => setTimeout(resolve, 500));
          
//           // Final check
//           const finalToken = getToken();
//           if (!finalToken) {
//             throw new Error('Unable to verify authentication token on Safari/iOS');
//           }
//         }
        
//         setError('');
//       }
      
//       router.push("/dashboard");
//     } catch (error) {
//       console.error("Login error:", error);
//       setError(error.response?.data?.message || error.message || "Login failed");
//     }
//   };

//   const handleAdminLogin = () => {
//     router.push('/admin/login');
//   };

//   return (
//     <>
//       <Head>
//         <title>User Login</title>
//       </Head>
      
//       <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{ 
//         backgroundColor: '#FFFFFF',
//         backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(58, 134, 255, 0.1) 0%, rgba(10, 36, 99, 0.1) 90%)'
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
//             Welcome to <span style={{ color: '#3A86FF' }}>GROWTHAFFINITY</span>
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
//                 background: 'linear-gradient(135deg, #0A2463 0%, #3A86FF 100%)',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '10px',
//                 fontWeight: '600',
//                 letterSpacing: '1px',
//                 boxShadow: '0 4px 15px rgba(10, 36, 99, 0.4)'
//               }}
//               type="button" 
//               id="loginTypeDropdown"
//               data-bs-toggle="dropdown"
//               aria-expanded="false"
//             >
//               User Login
//             </button>
//             <ul className="dropdown-menu w-100" aria-labelledby="loginTypeDropdown">
//               <li>
//                 <button 
//                   className="dropdown-item py-2" 
//                   style={{ color: '#0A2463', fontWeight: '500' }}
//                 >
//                   User Login
//                 </button>
//               </li>
//               <li>
//                 <button 
//                   className="dropdown-item py-2" 
//                   onClick={handleAdminLogin}
//                   style={{ color: '#0A2463', fontWeight: '500' }}
//                 >
//                   Admin Login
//                 </button>
//               </li>
//             </ul>
//           </div>
          
//           <form onSubmit={handleLogin}>
//             {error && (
//               <div className="alert alert-danger" role="alert">
//                 {error}
//               </div>
//             )}
//             <div className="mb-4">
//               <input 
//                 type="text" 
//                 className="form-control py-3" 
//                 placeholder="Email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="mb-4">
//               <input 
//                 type="password" 
//                 className="form-control py-3" 
//                 placeholder="Password"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <button 
//               type="submit" 
//               className="btn w-100 py-3"
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
//               LOGIN
//             </button>
//           </form>
          
//           <div className="text-center mt-4">
//             <Link 
//               href="/auth/forgot-password" 
//               className="text-decoration-none small fw-medium"
//               style={{ color: '#0A2463' }}
//             >
//               Forget password? →
//             </Link>
//           </div>
          
//           <div className="text-center mt-4 pt-3" style={{ borderTop: '1px dashed rgba(10, 36, 99, 0.2)' }}>
//             <Link 
//               href="/auth/signup" 
//               className="text-decoration-none fw-bold"
//               style={{ color: '#0A2463' }}
//             >
//               Create Your Account
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
import api from "../../utils/api";
import { setToken, getToken } from '../../utils/auth';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

const handleLogin = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError("");

  try {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. Simple validation
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password");
      setIsLoading(false); // Stop loading since we are returning early
      return;
    }

    // 2. Make the API call
    const response = await api.post("/api/auth/login", {
      email: trimmedEmail,
      password: trimmedPassword,
    });

    // 3. Get and save the token
    const { token } = response.data;
    setToken(token); // Assuming setToken is a synchronous function

    // 4. Redirect immediately. Let the dashboard fetch its own data.
    router.push("/dashboard");

  } catch (err) {
    console.error("Login error:", err);
    // Handle specific API errors
    if (err.response?.status === 401 || err.response?.status === 404) {
      setError("Invalid email or password");
    } else {
      // Handle all other errors (like network issues)
      setError("Login failed. Please try again.");
    }
    setIsLoading(false); // IMPORTANT: Stop loading on any error
  }
};

  const handleAdminLogin = () => {
    router.push('/admin/login');
  };

  return (
    <>
      <Head>
        <title>User Login</title>
      </Head>
      
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{ 
        backgroundColor: '#FFFFFF',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(58, 134, 255, 0.1) 0%, rgba(10, 36, 99, 0.1) 90%)'
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
            Welcome to <span style={{ color: '#3A86FF' }}>GROWTHAFFINITY</span>
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
                background: 'linear-gradient(135deg, #0A2463 0%, #3A86FF 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                letterSpacing: '1px',
                boxShadow: '0 4px 15px rgba(10, 36, 99, 0.4)'
              }}
              type="button" 
              id="loginTypeDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              User Login
            </button>
            <ul className="dropdown-menu w-100" aria-labelledby="loginTypeDropdown">
              <li>
                <button 
                  className="dropdown-item py-2" 
                  style={{ color: '#0A2463', fontWeight: '500' }}
                >
                  User Login
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item py-2" 
                  onClick={handleAdminLogin}
                  style={{ color: '#0A2463', fontWeight: '500' }}
                >
                  Admin Login
                </button>
              </li>
            </ul>
          </div>
          
          <form onSubmit={handleLogin}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <div className="mb-4">
              <input 
                type="text" 
                className="form-control py-3" 
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <input 
                type="password" 
                className="form-control py-3" 
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn w-100 py-3"
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
                  LOGGING IN...
                </>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>
          
          <div className="text-center mt-4">
            <Link 
              href="/auth/forgot-password" 
              className="text-decoration-none small fw-medium"
              style={{ color: '#0A2463' }}
            >
              Forget password? →
            </Link>
          </div>
          
          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px dashed rgba(10, 36, 99, 0.2)' }}>
            <Link 
              href="/auth/signup" 
              className="text-decoration-none fw-bold"
              style={{ color: '#0A2463' }}
            >
              Create Your Account
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}