import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import api from '../../utils/api'

export default function Signup () {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    referralCodeLeft: "",
    referralCodeRight: "",
  });
  const [referralError, setReferralError] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

const validateReferral = async (code) => {
  try {
    const res = await api.get(`/api/referral/validate/${code}`);
    
    if (res.status !== 200) {
      throw new Error("Invalid referral code");
    }
    
    return res.data;
  } catch (err) {
    console.error("Referral validation failed:", err.message);
    return null;
  }
};

const handleRegister = async (e) => {
  e.preventDefault();
  const { name, email, password, referralCodeLeft, referralCodeRight } = formData;

  if (referralCodeLeft && referralCodeRight) {
    setError("Please provide either Left or Right referral code, not both.");
    return;
  }

  if (!referralCodeLeft && !referralCodeRight) {
    setError("Please provide a referral code.");
    return;
  }

  const activeReferralCode = referralCodeLeft || referralCodeRight;

  const referralValidation = await validateReferral(activeReferralCode);
  if (!referralValidation) {
    setError("Invalid referral code.");
    return;
  }

  try {
    const response = await api.post("/api/auth/register", {
      name,
      email,
      password,
      referralCode: activeReferralCode,
    });

    router.push("/auth/login");
  } catch (error) {
    setError(error.response?.data?.error || "Registration failed");
  }
};


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        backgroundImage: 'radial-gradient(circle at 90% 20%, rgba(58, 134, 255, 0.1) 0%, rgba(10, 36, 99, 0.1) 90%)'
      }}>
        <div className="text-center mb-4">
          <h1 className="fw-bold display-4" style={{ 
            color: '#0A2463',
            textShadow: '2px 2px 4px rgba(58, 134, 255, 0.3)',
            letterSpacing: '2px'
          }}>
            GROWTHAFFINITY <span style={{ color: '#3A86FF' }}></span>
          </h1>
          <p className="lead" style={{ 
            color: '#0A2463',
            fontWeight: '500',
            textShadow: '1px 1px 2px rgba(0, 245, 255, 0.2)'
          }}>
            Join <span style={{ color: '#3A86FF' }}>GROWTHAFFINITY </span> MARKETING PVT LTD
          </p>
        </div>

        <div className="card p-4 shadow-lg" style={{ 
          width: '100%', 
          maxWidth: '450px',
          backgroundColor: 'white',
          border: 'none',
          borderRadius: '15px',
          boxShadow: '0 10px 25px rgba(58, 134, 255, 0.2)',
          transition: 'transform 0.3s, box-shadow 0.3s'
        }}>
          <h2 className="text-center mb-4 fw-bold" style={{ 
            color: '#0A2463',
            position: 'relative',
            display: 'inline-block',
            margin: '0 auto',
            paddingBottom: '10px'
          }}>
            Sign Up
            <span style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '50px',
              height: '4px',
              background: 'linear-gradient(90deg, #3A86FF 0%, #00F5FF 100%)',
              borderRadius: '2px'
            }}></span>
          </h2>
          
          <form onSubmit={handleRegister}>
            {error && (
              <div className="alert alert-danger" role="alert" style={{
                borderRadius: '10px',
                borderLeft: '4px solid #3A86FF',
                backgroundColor: 'rgba(255, 82, 82, 0.1)'
              }}>
                {error}
              </div>
            )}
            <div className="mb-3">
              <input 
                type="text" 
                name="name"
                className="form-control py-3" 
                placeholder="Name"
                style={{ 
                  border: '2px solid #E0E0E0',
                  borderRadius: '10px',
                  color: '#0A2463',
                  backgroundColor: '#F5F5F5',
                  transition: 'all 0.3s'
                }}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input 
                type="email" 
                name="email"
                className="form-control py-3" 
                placeholder="Email"
                style={{ 
                  border: '2px solid #E0E0E0',
                  borderRadius: '10px',
                  color: '#0A2463',
                  backgroundColor: '#F5F5F5',
                  transition: 'all 0.3s'
                }}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <input 
                type="password"
                name="password" 
                className="form-control py-3" 
                placeholder="Password"
                style={{ 
                  border: '2px solid #E0E0E0',
                  borderRadius: '10px',
                  color: '#0A2463',
                  backgroundColor: '#F5F5F5',
                  transition: 'all 0.3s'
                }}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <input 
                type="text"
                name="referralCodeRight"
                className="form-control py-3" 
                placeholder="Referral Code*"
                style={{ 
                  border: '2px solid #E0E0E0',
                  borderRadius: '10px',
                  color: '#0A2463',
                  backgroundColor: '#F5F5F5',
                  transition: 'all 0.3s'
                }}
                value={formData.referralCodeRight}
                onChange={handleChange}
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
                boxShadow: '0 4px 15px rgba(58, 134, 255, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <span style={{ position: 'relative', zIndex: '2' }}>REGISTER NOW</span>
            </button>
          </form>
          
          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px dashed rgba(10, 36, 99, 0.2)' }}>
            <Link 
              href="/auth/login" 
              className="text-decoration-none fw-medium"
              style={{ 
                color: '#0A2463',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-left me-2" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
              </svg>
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}