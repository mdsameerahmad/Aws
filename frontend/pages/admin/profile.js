// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import AdminLayout from '../../components/admin/AdminLayout';
// import API from '../../services/api';

// export default function AdminProfilePage() {
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchAdminProfile = async () => {
//       try {
//         const token = localStorage.getItem('adminToken');
//         if (!token) {
//           router.push('/admin/login');
//           return;
//         }

//         const res = await API.get('/api/admin/profile', {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         setProfile(res.data);
//       } catch (err) {
//         console.error('Failed to fetch profile:', err);
//         router.push('/admin/login');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAdminProfile();
//   }, [router]);

//   return (
//     <AdminLayout title="Profile">
//       <div className="container mt-4">
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <h3>Admin Profile</h3>
//         </div>
        
//         {loading ? (
//           <div className="text-center py-5">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         ) : profile ? (
//           <div className="card shadow-sm p-4">
//             <div className="row">
//               <div className="col-md-6">
//                 <div className="mb-3">
//                   <label className="form-label text-muted">Admin ID</label>
//                   <p className="form-control-plaintext">{profile._id}</p>
//                 </div>
//                 <div className="mb-3">
//                   <label className="form-label text-muted">Email</label>
//                   <p className="form-control-plaintext">{profile.email}</p>
//                 </div>
//               </div>
              
//             </div>
//           </div>
//         ) : (
//           <div className="alert alert-danger">Profile not found.</div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../services/api';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const res = await API.get('/api/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setProfile(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [router]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('adminToken');

      await API.put(
        '/api/admin/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPasswordSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to update password:', err);
      }
      setPasswordError(
        err.response?.data?.message || 'Failed to update password'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AdminLayout title="Profile">
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h2 className="fw-bold text-primary">Admin Profile</h2>
              <p className="text-muted">Manage your account settings</p>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  style={{ width: '3rem', height: '3rem' }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : profile ? (
              <div className="row g-4">
                {/* Profile Information Card */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Profile Information</h5>
                    </div>
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-4">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-user text-primary"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div>
                          <h6 className="mb-1">Admin Account</h6>
                          <p className="text-muted small mb-0">
                            Administrator privileges
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted small mb-1">
                          EMAIL ADDRESS
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-mail"
                            >
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          </span>
                          <input
                            type="text"
                            className="form-control bg-light"
                            value={profile.email}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Password Card */}
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Change Password</h5>
                    </div>
                    <div className="card-body">
                      <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-3">
                          <label
                            htmlFor="currentPassword"
                            className="form-label"
                          >
                            Current Password
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Enter current password"
                          />
                        </div>

                        <div className="mb-3">
                          <label htmlFor="newPassword" className="form-label">
                            New Password
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Enter new password"
                          />
                        </div>

                        <div className="mb-4">
                          <label
                            htmlFor="confirmPassword"
                            className="form-label"
                          >
                            Confirm New Password
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            placeholder="Confirm new password"
                          />
                        </div>

                        {passwordError && (
                          <div className="alert alert-danger mb-3">
                            {passwordError}
                          </div>
                        )}
                        {passwordSuccess && (
                          <div className="alert alert-success mb-3">
                            {passwordSuccess}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="btn btn-primary w-100 py-2"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Updating Password...
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-save me-2"
                              >
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                              </svg>
                              Update Password
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-danger text-center">
                Profile not found.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

