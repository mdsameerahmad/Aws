import { useState } from "react";
import axios from "../../utils/api";
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Initialize Bootstrap when component mounts
  if (typeof window !== 'undefined') {
    require('bootstrap/dist/js/bootstrap.bundle.min');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/forgot-password", { email });
      setMsg(res.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email");
    }
  };

  return (
    <>
      <Head>
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
          rel="stylesheet"
        />
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
            GROWTHAFFINITY <span style={{ color: '#3A86FF' }}>MARKETING PVT LTD</span>
          </h1>
          <p className="lead" style={{ 
            color: '#0A2463',
            fontWeight: '500',
            textShadow: '1px 1px 2px rgba(0, 245, 255, 0.2)'
          }}>
            Reset Your Password
          </p>
        </div>

        <div className="card p-4 shadow-lg" style={{ 
          width: '100%', 
          maxWidth: '400px',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(58, 134, 255, 0.2)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          ':hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 15px 30px rgba(58, 134, 255, 0.3)'
          }
        }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" role="alert" style={{
                borderRadius: '10px',
                borderLeft: '4px solid #3A86FF',
                backgroundColor: 'rgba(255, 82, 82, 0.1)'
              }}>
                {error}
              </div>
            )}
            
            {msg && (
              <div className="alert alert-success" role="alert" style={{
                borderRadius: '10px',
                borderLeft: '4px solid #3A86FF',
                backgroundColor: 'rgba(0, 200, 83, 0.1)'
              }}>
                {msg}
              </div>
            )}
            
            <div className="mb-4">
              <input 
                type="email" 
                className="form-control py-3" 
                placeholder="Enter your email"
                style={{ 
                  border: '2px solid #E0E0E0',
                  borderRadius: '10px',
                  color: '#0A2463',
                  backgroundColor: '#F5F5F5',
                  transition: 'all 0.3s'
                }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3A86FF';
                  e.target.style.boxShadow = '0 0 0 0.25rem rgba(58, 134, 255, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E0E0E0';
                  e.target.style.boxShadow = 'none';
                }}
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
                boxShadow: '0 4px 15px rgba(58, 134, 255, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 6px 20px rgba(58, 134, 255, 0.6)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 4px 15px rgba(58, 134, 255, 0.4)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ position: 'relative', zIndex: '2' }}>SEND RESET LINK</span>
              <span style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.3) 0%, transparent 100%)',
                transform: 'rotate(45deg)',
                transition: 'all 0.5s ease',
                opacity: '0'
              }} 
              className="btn-shine"
              />
            </button>
          </form>
          
          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px dashed rgba(10, 36, 99, 0.2)' }}>
            <Link 
              href="/auth/login" 
              className="text-decoration-none fw-bold"
              style={{ 
                color: '#0A2463',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#3A86FF';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#0A2463';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left me-2" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p className="small" style={{ color: '#0A2463' }}>
            Need help? <Link 
              href="/contact" 
              className="text-decoration-none fw-medium"
              style={{ 
                color: '#3A86FF',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = 'none';
              }}
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}