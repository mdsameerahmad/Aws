
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import API from '../../services/api';

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        const res = await API.get('/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdminProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch admin profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await API.post('/api/admin/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('adminToken');
      router.push('/admin/login');
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => isMobile && setSidebarOpen(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const navItems = [
    { path: '/admin/dashboard', icon: 'speedometer2', label: 'Dashboard' },
    { path: '/admin/users', icon: 'people', label: 'User Management' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Head>
        <title>{title ? `${title} | Admin Dashboard` : 'Admin Dashboard'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {isMobile && sidebarOpen && (
        <div
          className="position-fixed w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040, top: 0, left: 0 }}
          onClick={closeSidebar}
        />
      )}

      <div
        className={`text-white d-flex flex-column ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
        style={{
          background: 'linear-gradient(180deg, #0A2463 0%, #3A86FF 100%)',
          boxShadow: '2px 0 10px rgba(10, 36, 99, 0.5)',
          zIndex: 1050,
          position: isMobile ? 'fixed' : 'static',
          top: 0,
          bottom: 0,
          left: isMobile ? (sidebarOpen ? '0' : '-100%') : '0',
          width: isMobile ? '80%' : sidebarOpen ? '250px' : '80px',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="p-3 d-flex justify-content-between align-items-center">
          {sidebarOpen && <h5 className="mb-0 fw-bold">Admin Panel</h5>}
          <button
            className="btn btn-sm"
            onClick={toggleSidebar}
            style={{ color: 'white' }}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <i className={`bi bi-${sidebarOpen ? 'arrow-left-circle' : 'arrow-right-circle'} fs-5`}></i>
          </button>
        </div>
        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }} className="my-0" />

        <ul className="nav nav-pills flex-column mb-auto p-2">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                href={item.path}
                className={`nav-link ${router.pathname === item.path ? 'active' : 'text-white'}`}
                style={{
                  borderRadius: '8px',
                  marginBottom: '5px',
                  backgroundColor: router.pathname === item.path ? '#3A86FF' : 'transparent',
                  fontWeight: router.pathname === item.path ? 'bold' : 'normal',
                }}
                onClick={closeSidebar}
              >
                <i className={`bi bi-${item.icon} me-2`}></i>
                {sidebarOpen && item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto p-3 border-top">
          <button
            onClick={handleLogout}
            className="btn w-100 d-flex align-items-center justify-content-center"
            style={{
              background: 'linear-gradient(90deg, #FF5252 0%, #CC0000 100%)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 'bold',
              border: 'none',
              padding: '0.5rem',
            }}
          >
            <i className="bi bi-box-arrow-left me-2"></i>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      <div
        className="flex-grow-1"
        style={{
          background: '#FFFFFF',
          backgroundImage: 'radial-gradient(circle at 90% 20%, rgba(58, 134, 255, 0.1) 0%, rgba(10, 36, 99, 0.1) 90%)',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: isMobile ? '100%' : sidebarOpen ? 'calc(100% - 250px)' : 'calc(100% - 80px)',
          transition: 'all 0.3s ease'
        }}
      >
        <nav className="navbar navbar-expand-lg navbar-light shadow-sm"
          style={{
            background: 'linear-gradient(90deg, #FFFFFF 0%, #E0E0E0 100%)',
            borderBottom: '1px solid #E0E0E0'
          }}
        >
          <div className="container-fluid">
            <div className="d-flex align-items-center w-100">
              <div className="d-flex align-items-center me-auto">
                <button
                  className="btn btn-sm d-lg-none me-3"
                  onClick={toggleSidebar}
                  style={{ color: '#0A2463' }}
                  aria-label="Toggle sidebar"
                >
                  <i className="bi bi-list fs-4"></i>
                </button>
                <div className="d-flex align-items-center me-3">
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    background: 'rgba(58, 134, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <i className="bi bi-envelope-fill" style={{
                      color: '#3A86FF',
                      fontSize: '1rem'
                    }}></i>
                    <span style={{
                      color: '#0A2463',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px'
                    }}>
                      {loadingProfile ? (
                        <span className="placeholder" style={{ width: '120px' }}></span>
                      ) : adminProfile ? (
                        adminProfile.email
                      ) : (
                        'admin@example.com'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="dropdown">
                <button
                  className="btn dropdown-toggle d-flex align-items-center"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={toggleDropdown}
                  style={{
                    color: '#0A2463',
                    border: 'none',
                    background: 'transparent',
                    position: 'relative',
                    padding: '0.5rem 1rem',
                    borderRadius: '50px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}>
                    {adminProfile?.name ? adminProfile.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  {!isMobile && (
                    <span style={{
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      {adminProfile?.name || 'Admin'}
                    </span>
                  )}
                  <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'} ms-1`}></i>
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end shadow-lg ${dropdownOpen ? 'show' : ''}`}
                  aria-labelledby="profileDropdown"
                  style={{
                    borderRadius: '10px',
                    minWidth: '200px',
                    border: 'none',
                    marginTop: '8px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <li>
                    <Link
                      href="/admin/profile"
                      className="dropdown-item d-flex align-items-center py-2"
                      style={{ color: '#0A2463' }}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="bi bi-person me-2" style={{ width: '20px' }}></i>
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      className="dropdown-item d-flex align-items-center py-2"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      style={{ color: '#FF5252' }}
                    >
                      <i className="bi bi-box-arrow-left me-2" style={{ width: '20px' }}></i>
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>

        <main className="p-3 p-md-4" style={{ animation: 'fadeIn 0.3s ease' }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in {
          animation: fadeIn 0.3s ease;
        }
        .dropdown-toggle::after {
          display: none;
        }
        .dropdown-item:active {
          background-color: rgba(58, 134, 255, 0.1);
        }
        .dropdown-item:hover {
          background-color: rgba(58, 134, 255, 0.05);
        }
        .dropdown-toggle:hover {
          background-color: rgba(58, 134, 255, 0.1) !important;
        }
        @media (max-width: 768px) {
          .navbar .email-display {
            max-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}
