import AdminLayout from '../../components/admin/AdminLayout';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useRouter } from 'next/router';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/admin/users');
        const enrichedUsers = await Promise.all(
          response.data.map(async (user) => {
            try {
              const details = await api.get(`/api/admin/user/${user._id}`);
              const incomeRes = await axios.get(`${NEXT_PUBLIC_API_URL}/api/income/business/${user._id}`);
              const totalIncome = incomeRes.data?.totalIncome || 0;
              return { ...user, ...details.data, balance: totalIncome };
            } catch (err) {
              console.error(`Error enriching user ${user._id}:`, err);
              return { ...user, balance: 0 };
            }
          })
        );
        setUsers(enrichedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    String(user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(user.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewUserDetails = (userId) => {
    router.push(`/admin/users/${userId}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return '-';
    }
  };

  const canDeleteUser = (user) => {
    if (!user.isActive && user.createdAt) {
      const inactiveDays = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
      return inactiveDays > 3;
    }
    return false;
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/api/admin/delete-user/${deleteTarget._id}`);
      setUsers(users.filter(u => u._id !== deleteTarget._id));
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setConfirming(false);
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout title="User Management">
      <div
        className="p-4 min-vh-100"
        style={{
          background: '#FFFFFF',
          backgroundImage: 'radial-gradient(circle at 90% 20%, rgba(58, 134, 255, 0.1) 0%, rgba(10, 36, 99, 0.1) 90%)'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-0 fw-bold" style={{ color: '#0A2463' }}>User Management</h1>
            <p style={{ color: '#0A2463', opacity: 0.7 }}>Manage all registered users</p>
          </div>
          <div className="d-flex">
            <div className="me-2">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: '2px solid #E0E0E0',
                    borderRadius: '10px 0 0 10px',
                    color: '#0A2463',
                    backgroundColor: '#F5F5F5',
                  }}
                />
                <button
                  className="btn"
                  type="button"
                  style={{
                    background: '#3A86FF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0 10px 10px 0',
                  }}
                >
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="spinner-border" style={{ color: '#3A86FF' }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div
            className="card shadow-sm"
            style={{
              border: 'none',
              borderRadius: '15px',
              boxShadow: '0 10px 25px rgba(58, 134, 255, 0.2)',
            }}
          >
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead style={{ background: 'linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)', color: 'white' }}>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Join Date</th>
                      <th>Status</th>
                      {/* <th>Balance</th> */}
                      <th>Rank</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td style={{ color: '#0A2463' }}>{user.name}</td>
                        <td style={{ color: '#0A2463' }}>{user.email}</td>
                        <td style={{ color: '#0A2463' }}>{formatDate(user.createdAt)}</td>
                        <td>
                          {user.isActive ?
                            <span className="badge" style={{ background: '#28a745', padding: '5px 10px', borderRadius: '20px', color: 'white' }}>Active</span> :
                            <span className="badge" style={{ background: '#FF5252', padding: '5px 10px', borderRadius: '20px', color: 'white' }}>Inactive</span>
                          }
                        </td>
                        {/* <td style={{ color: '#0A2463' }}>₹{user.balance?.toFixed(2)}</td> */}
                        <td style={{ color: '#0A2463' }}>{user.rank || 'Member'}</td>
                        <td>
                          <button
                            className="btn btn-sm me-1"
                            onClick={() => viewUserDetails(user._id)}
                            style={{ border: '1px solid #3A86FF', color: '#3A86FF', borderRadius: '8px' }}
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {canDeleteUser(user) && (
                            <button
                              className="btn btn-sm"
                              onClick={() => {
                                setDeleteTarget(user);
                                setConfirming(true);
                              }}
                              style={{ border: '1px solid #FF5252', color: '#FF5252', borderRadius: '8px' }}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {confirming && deleteTarget && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button type="button" className="btn-close" onClick={() => setConfirming(false)}></button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete user <strong>{deleteTarget.name}</strong>?</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setConfirming(false)}>No</button>
                  <button className="btn btn-danger" onClick={handleDeleteUser}>Yes, Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}


