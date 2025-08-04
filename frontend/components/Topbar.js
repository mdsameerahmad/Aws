import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { logout } from '../utils/auth';
import api from '../utils/api';
import { fetchProfile } from '../utils/profileService';

const Topbar = ({ toggleSidebar, searchQuery, setSearchQuery }) => {
  const router = useRouter();
  const coinRef = useRef(null);
  const [topupWallet, setTopupWallet] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const baseLineColor = '#3A86FF';
  const hoverLineColor = '#0A2463';

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Fetch topup wallet balance
  useEffect(() => {
    const fetchTopupWallet = async () => {
      try {
        const profileData = await fetchProfile();
        const userId = profileData.basicInfo?._id;
        if (!userId) return;
        const walletRes = await api.get(`/api/wallet/user/${userId}/wallet`);
        setTopupWallet(walletRes.data.topupWallet || 0);
      } catch (err) {
        console.error("Error fetching topup wallet:", err);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchTopupWallet();
  }, []);

  // Effect to trigger coin update animation
  useEffect(() => {
    const currentRef = coinRef.current;
    if (currentRef) {
      currentRef.classList.add('coin-update-animation');
      const handler = () => {
        currentRef.classList.remove('coin-update-animation');
      };
      currentRef.addEventListener('animationend', handler);
      return () => {
        currentRef.removeEventListener('animationend', handler);
      };
    }
  }, [topupWallet]);

  return (
    <nav
      className="navbar navbar-light shadow-sm position-fixed"
      style={{
        left: '280px',
        right: 0,
        top: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        height: '60px',
        transition: 'left 0.3s ease-in-out',
      }}
    >
      <div className="container-fluid px-3">
        <div className="d-flex align-items-center w-100">
          {/* Hamburger menu button for mobile */}
          <button
            className="btn navbar-toggler-icon-custom d-lg-none me-2"
            onClick={toggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              outline: 'none',
              gap: '4px',
            }}
            onMouseEnter={(e) => {
              const lines = e.currentTarget.querySelectorAll('.hamburger-line');
              lines.forEach((line) => (line.style.backgroundColor = hoverLineColor));
            }}
            onMouseLeave={(e) => {
              const lines = e.currentTarget.querySelectorAll('.hamburger-line');
              lines.forEach((line) => (line.style.backgroundColor = baseLineColor));
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="hamburger-line"
                style={{
                  width: '18px',
                  height: '2px',
                  backgroundColor: baseLineColor,
                  borderRadius: '1px',
                  transition: 'background-color 0.2s ease-in-out',
                }}
              />
            ))}
          </button>

          {/* Search bar */}
          <div
            className="input-group flex-grow-1 position-relative"
            style={{
              maxWidth: isMobile ? '150px' : '300px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F5F5F5 0%, #E8EEFF 100%)',
              boxShadow: '0 2px 8px rgba(58, 134, 255, 0.2)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(58, 134, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(58, 134, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span className="input-group-text bg-transparent border-0 d-flex align-items-center justify-content-center" style={{ padding: '0 10px' }}>
              <i className="bi-search" style={{ color: '#3A86FF', fontSize: '1rem', transition: 'color 0.3s ease, transform 0.3s ease' }}></i>
            </span>
            <input
              className="form-control"
              type="search"
              placeholder={isMobile ? 'Search...' : 'Search products...'}
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                boxShadow: 'none',
                border: 'none',
                borderRadius: '12px',
                color: '#0A2463',
                backgroundColor: 'transparent',
                fontSize: isMobile ? '0.85rem' : '0.95rem',
                padding: isMobile ? '6px 8px' : '10px 12px',
                paddingRight: searchQuery ? (isMobile ? '24px' : '30px') : (isMobile ? '8px' : '12px'),
                transition: 'all 0.3s ease',
              }}
            />
            {searchQuery && (
              <button
                className="position-absolute"
                onClick={handleClearSearch}
                style={{
                  right: isMobile ? '6px' : '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#0A2463',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  zIndex: 2,
                }}
              >
                <i className="bi-x-lg"></i>
              </button>
            )}
          </div>

          {/* Top-up Wallet Display - Now more compact on mobile */}
          <div
            ref={coinRef}
            className="d-flex align-items-center me-2 ms-2"
            style={{
              background: 'linear-gradient(135deg, #FFF3B0 0%, #FFD700 100%)',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
              borderRadius: '50px',
              padding: isMobile ? '6px 10px' : '8px 15px',
              minWidth: isMobile ? '80px' : 'auto',
            }}
          >
            {!isMobile && (
              <i className="bi-wallet2 me-2" style={{ color: '#0A2463', fontSize: '1.2rem' }}></i>
            )}
            <span className="fw-bold" style={{ color: '#0A2463', fontSize: isMobile ? '0.85rem' : '1rem' }}>
              {loadingWallet ? (
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                isMobile ? `₹${topupWallet.toFixed(0)}` : `₹ ${topupWallet.toFixed(2)}`
              )}
            </span>
          </div>

          {/* Logout button - Now icon-only on mobile */}
          <div className="ms-auto">
            <button
              onClick={handleLogout}
              className="btn py-1 px-2"
              style={{
                background: 'linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                border: 'none',
                boxShadow: '0 2px 8px rgba(58, 134, 255, 0.3)',
                fontSize: isMobile ? '0.85rem' : '0.9rem',
                padding: isMobile ? '6px 8px' : '8px 12px',
                transition: 'all 0.3s',
              }}
            >
              {isMobile ? (
                <i className="bi-box-arrow-right"></i>
              ) : (
                <>
                  <i className="bi-box-arrow-right me-1"></i>
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .navbar-toggler-icon-custom {
          padding: 0 !important;
        }

        .input-group input::placeholder {
          color: #6B7280;
          opacity: 0.8;
          font-style: italic;
        }

        @keyframes coinUpdate {
          0% { transform: scale(1); box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3); }
          25% { transform: scale(1.1); box-shadow: 0 0 15px #FFD700; }
          100% { transform: scale(1); box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3); }
        }

        .coin-update-animation {
          animation: coinUpdate 0.8s ease-out;
        }

        @media (max-width: 992px) {
          .navbar {
            left: 0 !important;
            height: 56px;
          }
          .container-fluid {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }

        @media (max-width: 576px) {
          .navbar {
            height: 50px;
          }
          .input-group {
            max-width: 120px !important;
          }
          .form-control {
            font-size: 0.8rem !important;
            padding: 6px 8px !important;
          }
          .input-group-text {
            padding: 0 6px !important;
          }
          .bi-search {
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Topbar;