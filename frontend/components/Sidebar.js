import { useRouter } from 'next/router';
import { useState, useEffect, useMemo } from 'react';
import { fetchProfile } from '@utils/profileService';
import { logout } from '../utils/auth';
import Image from 'next/image';

const Sidebar = ({ isSidebarOpen, toggleSidebar, setActiveSection, activeSection }) => {
  const router = useRouter();
  const [user, setUser] = useState({
    name: '',
    email: '',
    avatar: null
  });
  const [loading, setLoading] = useState(true);

  const navItems = useMemo(() => [
    { label: 'Dashboard', path: '/dashboard', icon: 'bi-speedometer2' },
    { label: 'Products', path: '/dashboard/products', icon: 'bi-box-seam' },
    { label: 'Business', path: '/dashboard/business', icon: 'bi-briefcase' },
    { label: 'Wallet', path: '/dashboard/wallet', icon: 'bi-wallet2' },
    { label: 'Status', path: '/dashboard/status', icon: 'bi-graph-up' },
    { label: 'Rank & Rewards', path: '/dashboard/rank', icon: 'bi-trophy' },
  ], []);

  const handleNavItemClick = (item) => {
    if (router.pathname !== '/dashboard' && item.path.startsWith('/dashboard')) {
      router.push(item.path);
    } else if (setActiveSection) {
      setActiveSection(item.label);
    }
    if (window.innerWidth <= 992) {
      toggleSidebar();
    }
  };

  const handleProfileClick = () => {
    if (router.pathname !== '/dashboard') {
      router.push('/dashboard');
    }
    if (setActiveSection) {
      setActiveSection('Profile');
    }
    if (window.innerWidth <= 992) {
      toggleSidebar();
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile();
        if (profileData) {
          setUser({
            name: profileData.basicInfo?.name || '',
            email: profileData.basicInfo?.email || '',
            avatar: profileData.basicInfo?.avatar || null
          });
          console.log('Profile loaded successfully:', profileData); // Added for clearer debugging
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        setUser({ name: 'Guest', email: 'guest@example.com', avatar: null });
      } finally {
        setLoading(false);
      }
    };

    // This part might be causing multiple calls if 'profile-updated' is fired frequently
    const handleProfileUpdated = () => loadProfile();
    window.addEventListener('profile-updated', handleProfileUpdated);

    const currentItem = navItems.find((item) => item.path === router.pathname);
    if (currentItem && setActiveSection) {
      setActiveSection(currentItem.label);
    }

    // This is the initial call to loadProfile when the component mounts or dependencies change
    loadProfile();

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdated);
    };
  }, [router.pathname, setActiveSection, navItems]); // Dependencies here are the key

  return (
    <>
      {isSidebarOpen && (
        <div
          className="d-lg-none"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040,
          }}
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`d-flex flex-column flex-shrink-0 p-3 sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}
        style={{
          width: '280px',
          backgroundColor: '#0A2463',
          color: 'white',
          height: '100vh',
          position: 'fixed',
          zIndex: 1050,
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-4 fw-bold" style={{ color: '#00F5FF' }}>
            GROWTHAFFINITY
          </span>
        </div>
        <hr style={{ borderColor: 'rgba(58, 134, 255, 0.3)' }} />

        {!loading && (
          <div
            className="p-3 mb-4 rounded d-flex align-items-center"
            style={{
              backgroundColor: 'rgba(58, 134, 255, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s',
              border: '1px solid rgba(58, 134, 255, 0.3)',
            }}
            onClick={handleProfileClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(58, 134, 255, 0.3)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(58, 134, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(58, 134, 255, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden me-3"
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#3A86FF',
                color: 'white',
                fontSize: '20px',
                flexShrink: 0,
              }}
            >
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt="User Avatar"
                  width={48}
                  height={48}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                user.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '1.1rem' }}>
                {user.name || 'User'}
              </strong>
              <small style={{ color: '#E0E0E0', fontSize: '0.85rem' }}>
                {user.email || 'user@example.com'}
              </small>
            </div>
          </div>
        )}

        {loading && (
          <div className="p-3 mb-4 rounded d-flex align-items-center">
            <div className="spinner-border text-light" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="ms-3">
              <div className="placeholder-glow">
                <span className="placeholder col-6 bg-light"></span>
                <span className="placeholder col-8 bg-secondary mt-1"></span>
              </div>
            </div>
          </div>
        )}

        <ul className="nav nav-pills flex-column mb-auto">
          {navItems.map((item) => (
            <li key={item.label} className="nav-item mb-2">
              <button
                className={`nav-link text-white ${activeSection === item.label ? 'active' : ''}`}
                style={{
                  backgroundColor: activeSection === item.label ? '#3A86FF' : 'transparent',
                  borderRadius: '5px',
                  transition: 'all 0.3s',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                }}
                onClick={() => handleNavItemClick(item)}
                onMouseEnter={(e) => {
                  if (activeSection !== item.label) {
                    e.currentTarget.style.backgroundColor = 'rgba(58, 134, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== item.label) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <hr style={{ borderColor: 'rgba(58, 134, 255, 0.3)' }} />

        <div className="mt-auto">
          <button
            className="btn btn-danger w-100"
            onClick={async () => {
              await logout();
              router.replace('/auth/login');
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </button>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 992px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
