

import { useRouter } from 'next/router';
import { useState, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@components/admin/AdminLayout';
import api from '@utils/api';

const TransactionList = memo(({ transactions, onApprove, onDecline, type, primaryColor, successColor, secondaryColor, primaryDarkColor }) => (
  <div className="row g-3">
    {transactions.map((request) => (
      <div key={request._id} className="col-md-6">
        <div 
          className="card border-0 shadow-sm p-3" 
          style={{ borderRadius: '10px', backgroundColor: `rgba(${type === 'topup' ? '58, 134, 255' : '255, 82, 82'}, 0.05)` }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold" style={{ color: primaryDarkColor }}>
              {type === 'purchase' 
                ? `${request.productName || 'N/A'} (Code: ${request.productCode || 'N/A'})`
                : `Amount: ₹${request.amount || '0'}`}
            </span>
            <span className="badge bg-warning text-dark">Pending</span>
          </div>
          
          {type === 'purchase' && (
            <>
              <div className="mb-2">
                <span className="fw-medium">Quantity: </span>
                <span>{request.quantity || 'N/A'}</span>
              </div>
              <div className="mb-2">
                <span className="fw-medium">Unit Price: </span>
                <span>₹{request.unitPrice || '0'}</span>
              </div>
              <div className="mb-2">
                <span className="fw-medium">Total Price: </span>
                <span className="fw-bold" style={{ color: primaryColor }}>₹{request.totalPrice || '0'}</span>
              </div>
            </>
          )}
          
          <div className="mb-2">
            <span className="fw-medium">Created: </span>
            <span>{request.createdAt ? new Date(request.createdAt).toLocaleString() : 'N/A'}</span>
          </div>
          
          {request.note && (
            <div className="mb-3">
              <span className="fw-medium">Note: </span>
              <span>{request.note}</span>
            </div>
          )}
          
          <div className="d-flex gap-2">
            <button 
              className="btn btn-sm flex-grow-1"
              onClick={() => onApprove(request, type)}
              disabled={request.isProcessing}
              style={{
                backgroundColor: successColor,
                color: 'white',
                borderRadius: '8px',
                padding: '8px 12px',
                transition: 'all 0.2s ease',
                opacity: request.isProcessing ? 0.7 : 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = request.isProcessing ? '0.7' : '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = request.isProcessing ? '0.7' : '1'}
            >
              {request.isProcessing ? 'Processing...' : 'Approve'}
            </button>
            <button 
              className="btn btn-sm flex-grow-1"
              onClick={() => onDecline(request, type)}
              style={{
                backgroundColor: secondaryColor,
                color: 'white',
                borderRadius: '8px',
                padding: '8px 12px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
));

export default function UserDetails() {
  const router = useRouter();
  const { userId } = router.query;
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('referral');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [cache] = useState({});

  // Color theme variables from AdminLayout
  const primaryColor = '#3A86FF';
  const primaryDarkColor = '#0A2463';
  const secondaryColor = '#FF5252';
  const successColor = '#28a745';
  const textColor = '#0A2463';
  const lightBackground = 'rgba(58, 134, 255, 0.1)';
  const cardGradient = 'linear-gradient(135deg, #3A86FF 0%, #0A2463 100%)';
  const sidebarGradient = 'linear-gradient(160deg, #0A2463 0%, #3A86FF 100%)';
  const hoverGradient = 'linear-gradient(135deg, rgba(58, 134, 255, 0.3) 0%, rgba(10, 36, 99, 0.3) 100%)';

  // Cache-enabled API fetch
  const fetchWithCache = async (url, fields = '') => {
    const cacheKey = fields ? `${url}?fields=${fields}` : url;
    if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < 300000) {
      return cache[cacheKey].data;
    }
    
    const response = await api.get(fields ? `${url}?fields=${fields}` : url);
    cache[cacheKey] = {
      data: response.data,
      timestamp: Date.now()
    };
    return response.data;
  };

  // Data fetching with React Query
  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchWithCache(`/api/admin/user/${userId}`, 'name,email,phone,createdAt,status,rank,isActive,parentId,bankDetails,referralCodeLeft,referralCodeRight'),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: topupRequests = [], isLoading: loadingTopup } = useQuery({
    queryKey: ['topupRequests', userId],
    queryFn: () => fetchWithCache(`/api/wallet/admin/user/${userId}/pending-topup-requests`, 'amount,createdAt,note,_id'),
    enabled: activeTab === 'transactions' && !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: withdrawRequests = [], isLoading: loadingWithdraw } = useQuery({
    queryKey: ['withdrawRequests', userId],
    queryFn: () => fetchWithCache(`/api/wallet/admin/user/${userId}/pending-withdraw-requests`, 'amount,createdAt,updatedAt,_id'),
    enabled: activeTab === 'transactions' && !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: purchaseRequests = [], isLoading: loadingPurchases } = useQuery({
    queryKey: ['purchaseRequests', userId],
    queryFn: () => fetchWithCache(`/api/purchase/products/admin/user/${userId}/pending-purchases`, 'productName,productCode,quantity,unitPrice,totalPrice,requestedAt,shippingAddress,_id'),
    enabled: activeTab === 'products' && !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: approvedPurchases = [], isLoading: loadingApprovedPurchases } = useQuery({
    queryKey: ['approvedPurchases', userId],
    queryFn: () => fetchWithCache(`/api/purchase/products/admin/user/${userId}/approved-purchases`, 'productName,productCode,quantity,unitPrice,totalPrice,requestedAt,status,_id'),
    enabled: activeTab === 'products' && !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: rankData = {}, isLoading: loadingRank } = useQuery({
    queryKey: ['rankSummary', userId],
    queryFn: () => fetchWithCache(`/api/income/user-summary/${userId}`),
    enabled: activeTab === 'rankAndReward' && !!userId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const approveMutation = useMutation({
    mutationFn: (request) => {
      let endpoint;
      let requestData = {
        approvedBy: 'admin',
        timestamp: new Date().toISOString()
      };

      switch(request.type) {
        case 'topup':
          endpoint = `/api/wallet/admin/topup-request/${request._id}/approve`;
          requestData.amount = request.amount;
          break;
        case 'withdraw':
          endpoint = `/api/wallet/admin/withdraw-request/${request._id}/approve`;
          requestData.amount = request.amount;
          break;
        case 'purchase':
          endpoint = `/api/purchase/products/admin/${request._id}/approve`;
          requestData.productId = request.productId;
          requestData.quantity = request.quantity;
          break;
        default:
          throw new Error('Invalid request type');
      }

      return api.put(endpoint, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    },
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: ['topupRequests', userId] });
      await queryClient.cancelQueries({ queryKey: ['withdrawRequests', userId] });
      await queryClient.cancelQueries({ queryKey: ['purchaseRequests', userId] });

      const previousTopup = queryClient.getQueryData(['topupRequests', userId]);
      const previousWithdraw = queryClient.getQueryData(['withdrawRequests', userId]);
      const previousPurchase = queryClient.getQueryData(['purchaseRequests', userId]);

      if (request.type === 'topup') {
        queryClient.setQueryData(['topupRequests', userId], (old = []) => 
          old.filter(req => req._id !== request._id)
        );
      } else if (request.type === 'withdraw') {
        queryClient.setQueryData(['withdrawRequests', userId], (old = []) => 
          old.filter(req => req._id !== request._id)
        );
      } else if (request.type === 'purchase') {
        queryClient.setQueryData(['purchaseRequests', userId], (old = []) => 
          old.filter(req => req._id !== request._id)
        );
      }

      setShowApproveModal(false);
      setCurrentRequest(null);

      return { previousTopup, previousWithdraw, previousPurchase };
    },
    onError: (error, request, context) => {
      if (request.type === 'topup') {
        queryClient.setQueryData(['topupRequests', userId], context.previousTopup);
      } else if (request.type === 'withdraw') {
        queryClient.setQueryData(['withdrawRequests', userId], context.previousWithdraw);
      } else if (request.type === 'purchase') {
        queryClient.setQueryData(['purchaseRequests', userId], context.previousPurchase);
      }
      
      alert(error.response?.data?.message || 'Failed to approve request');
    },
    onSuccess: async (data, request) => {
      if (request.type === 'topup') {
        await queryClient.invalidateQueries({ queryKey: ['topupRequests', userId] });
      } else if (request.type === 'withdraw') {
        await queryClient.invalidateQueries({ queryKey: ['withdrawRequests', userId] });
      } else if (request.type === 'purchase') {
        await queryClient.invalidateQueries({ queryKey: ['purchaseRequests', userId] });
        await queryClient.invalidateQueries({ queryKey: ['approvedPurchases', userId] });
      }
      alert('Request approved successfully!');
    }
  });

  const declineMutation = useMutation({
    mutationFn: (request) => {
      let endpoint;
      if (request.type === 'topup') {
        endpoint = `/api/wallet/admin/topup-request/${request._id}/decline`;
      } else if (request.type === 'withdraw') {
        endpoint = `/api/wallet/admin/withdraw-request/${request._id}/decline`;
      } else if (request.type === 'purchase') {
        endpoint = `/api/purchase/products/admin/${request._id}/reject`;
      }
      return api.put(endpoint);
    },
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: ['topupRequests', userId] });
      await queryClient.cancelQueries({ queryKey: ['withdrawRequests', userId] });
      await queryClient.cancelQueries({ queryKey: ['purchaseRequests', userId] });

      const previousTopup = queryClient.getQueryData(['topupRequests', userId]);
      const previousWithdraw = queryClient.getQueryData(['withdrawRequests', userId]);
      const previousPurchase = queryClient.getQueryData(['purchaseRequests', userId]);

      if (request.type === 'topup') {
        queryClient.setQueryData(['topupRequests', userId], (old = []) => 
          old.filter(req => req._id !== request._id)
        );
      } else if (request.type === 'withdraw') {
        queryClient.setQueryData(['withdrawRequests', userId], (old = []) => 
          old.filter(req => req._id !== request._id)
        );
      } else if (request.type === 'purchase') {
        queryClient.setQueryData(['purchaseRequests', userId], (old = []) => 
          old.filter(req => req._id !== request._id)
        );
      }

      setShowDeclineModal(false);
      setCurrentRequest(null);

      return { previousTopup, previousWithdraw, previousPurchase };
    },
    onError: (error, request, context) => {
      if (request.type === 'topup') {
        queryClient.setQueryData(['topupRequests', userId], context.previousTopup);
      } else if (request.type === 'withdraw') {
        queryClient.setQueryData(['withdrawRequests', userId], context.previousWithdraw);
      } else if (request.type === 'purchase') {
        queryClient.setQueryData(['purchaseRequests', userId], context.previousPurchase);
      }
      
      alert(error.response?.data?.message || 'Failed to decline request');
    },
    onSuccess: async (data, request) => {
      if (request.type === 'topup') {
        await queryClient.invalidateQueries({ queryKey: ['topupRequests', userId] });
      } else if (request.type === 'withdraw') {
        await queryClient.invalidateQueries({ queryKey: ['withdrawRequests', userId] });
      } else if (request.type === 'purchase') {
        await queryClient.invalidateQueries({ queryKey: ['purchaseRequests', userId] });
      }
      alert('Request declined successfully!');
    }
  });

  const claimTripMutation = useMutation({
    mutationFn: (rewardId) => api.patch(`/api/income/claim-trip/${rewardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankSummary', userId] });
      alert('🎉 Trip successfully claimed!');
    },
    onError: (err) => {
      alert(err?.response?.data?.message || 'Failed to claim trip.');
    },
  });

  const handleApproveClick = (request, type) => {
    setCurrentRequest({ ...request, type });
    setShowApproveModal(true);
  };

  const handleDeclineClick = (request, type) => {
    setCurrentRequest({ ...request, type });
    setShowDeclineModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="badge bg-warning text-dark">Pending</span>;
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'shipped':
        return <span className="badge bg-info">Shipped</span>;
      case 'delivered':
        return <span className="badge bg-primary">Delivered</span>;
      default:
        return <span className="badge bg-secondary">{status || 'Unknown'}</span>;
    }
  };

  const renderTransactions = () => {
    if (loadingTopup || loadingWithdraw) {
      return (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border" style={{ color: primaryColor }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="row g-4">
        <div className="col-12">
          <div 
            className="card border-0 shadow-sm p-4" 
            style={{ 
              borderRadius: '15px',
              backgroundColor: 'white',
              borderLeft: `4px solid ${primaryColor}`
            }}
          >
            <h5 className="mb-4 fw-bold" style={{ color: primaryDarkColor }}>
              <i className="bi bi-arrow-down-circle me-2" style={{ color: primaryColor }}></i>
              Pending Top-up Requests
            </h5>
            {topupRequests.length === 0 ? (
              <div className="alert alert-info">No pending top-up requests</div>
            ) : (
              <TransactionList 
                transactions={topupRequests} 
                onApprove={handleApproveClick}
                onDecline={handleDeclineClick}
                type="topup"
                {...{ primaryColor, successColor, secondaryColor, primaryDarkColor }}
              />
            )}
          </div>
        </div>

        <div className="col-12">
          <div 
            className="card border-0 shadow-sm p-4" 
            style={{ 
              borderRadius: '15px',
              backgroundColor: 'white',
              borderLeft: `4px solid ${secondaryColor}`
            }}
          >
            <h5 className="mb-4 fw-bold" style={{ color: primaryDarkColor }}>
              <i className="bi bi-arrow-up-circle me-2" style={{ color: secondaryColor }}></i>
              Pending Withdrawal Requests
            </h5>
            {withdrawRequests.length === 0 ? (
              <div className="alert alert-info">No pending withdrawal requests</div>
            ) : (
              <TransactionList 
                transactions={withdrawRequests} 
                onApprove={handleApproveClick}
                onDecline={handleDeclineClick}
                type="withdraw"
                {...{ primaryColor, successColor, secondaryColor, primaryDarkColor }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProductPurchases = () => {
    if (loadingPurchases || loadingApprovedPurchases) {
      return (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border" style={{ color: primaryColor }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-5">
          <h5 className="mb-4 fw-bold" style={{ color: primaryDarkColor }}>Pending Product Purchase Requests</h5>
          {purchaseRequests.length === 0 ? (
            <div className="alert alert-info">No pending product purchase requests</div>
          ) : (
            <TransactionList 
              transactions={purchaseRequests} 
              onApprove={handleApproveClick}
              onDecline={handleDeclineClick}
              type="purchase"
              {...{ primaryColor, successColor, secondaryColor, primaryDarkColor }}
            />
          )}
        </div>

        <div>
          <h5 className="mb-4 fw-bold" style={{ color: primaryDarkColor }}>Approved Product Purchases</h5>
          {approvedPurchases.length === 0 ? (
            <div className="alert alert-info">No approved product purchases</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedPurchases.map((purchase) => (
                    <tr key={purchase._id}>
                      <td>{purchase.productName || 'N/A'}</td>
                      <td>{purchase.productCode || 'N/A'}</td>
                      <td>{purchase.quantity || '0'}</td>
                      <td>₹{purchase.unitPrice || '0'}</td>
                      <td>₹{purchase.totalPrice || '0'}</td>
                      <td>{getStatusBadge(purchase.status)}</td>
                      <td>{purchase.requestedAt ? new Date(purchase.requestedAt).toLocaleString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRankAndReward = () => {
    if (loadingRank) {
      return (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border" style={{ color: primaryColor }} role="status"></div>
        </div>
      );
    }

    const ranks = rankData.ranks || [];
    return (
      <div>
        <div className="row g-3 text-center mb-4">
          <div className="col-12 col-md-4">
            <div className="bg-light shadow rounded-4 p-3 p-sm-4 h-100">
              <i className="bi bi-check-circle-fill text-success fs-2 mb-2"></i>
              <h4>{rankData.summary?.claimedTrips || 0}</h4>
              <p className="text-muted">Claimed Trips</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Rank</th>
                <th>Cash (₹)</th>
                <th>Trip</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ranks
                .filter(r => r.status !== 'NOT_ELIGIBLE')
                .map((rank, i) => (
                  <tr key={i} className="table-success">
                    <td>{rank.title}</td>
                    <td>₹{rank.cashAmount.toLocaleString('en-IN')}</td>
                    <td>
                      {rank.trip !== 'NONE' ? (
                        <>
                          {rank.trip}
                          {rank.tripClaimed ? (
                            <span className="badge bg-success ms-2">Claimed</span>
                          ) : rank.status !== 'EXPIRED' ? (
                            <button
                              className="btn btn-sm btn-outline-primary ms-2"
                              onClick={() => claimTripMutation.mutate(rank.id)}
                              disabled={claimTripMutation.isPending}
                            >
                              {claimTripMutation.isPending ? 'Claiming...' : 'Claim Trip'}
                            </button>
                          ) : null}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          rank.status === 'CLAIMED'
                            ? 'bg-success'
                            : rank.status === 'EXPIRED'
                            ? 'bg-danger'
                            : 'bg-warning'
                        }`}
                      >
                        {rank.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!loadingRank && ranks?.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-emoji-frown fs-1 text-muted"></i>
            <p className="fs-5 text-muted mt-3">No rank data available</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout title={`User: ${user?.name || 'Loading...'}`}>
      {showApproveModal && (
        <div 
          className="modal"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '500px' }}
          >
            <div 
              className="modal-content"
              style={{
                borderRadius: '15px',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              <div 
                className="modal-header"
                style={{
                  backgroundColor: primaryColor,
                  color: 'white',
                  borderBottom: 'none'
                }}
              >
                <h5 className="modal-title">Confirm Approval</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowApproveModal(false)}
                  style={{ filter: 'invert(1)' }}
                ></button>
              </div>
              <div className="modal-body py-4">
                <p className="fs-5 mb-0 text-center">
                  Are you sure you want to approve this request?
                </p>
                {currentRequest && (
                  <div className="mt-3 text-center">
                    {currentRequest.type === 'purchase' ? (
                      <>
                        <p className="mb-1">
                          <strong>Product:</strong> {currentRequest.productName || 'N/A'} (Code: {currentRequest.productCode || 'N/A'})
                        </p>
                        <p className="mb-1">
                          <strong>Quantity:</strong> {currentRequest.quantity || '0'}
                        </p>
                        <p className="mb-1">
                          <strong>Unit Price:</strong> ₹{currentRequest.unitPrice || '0'}
                        </p>
                        <p className="mb-0">
                          <strong>Total Price:</strong> ₹{currentRequest.totalPrice || '0'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mb-1">
                          <strong>Amount:</strong> ₹{currentRequest.amount || '0'}
                        </p>
                        <p className="mb-0">
                          <strong>Type:</strong> {currentRequest.type === 'topup' ? 'Top-up' : 'Withdrawal'}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div 
                className="modal-footer"
                style={{ borderTop: 'none' }}
              >
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowApproveModal(false)}
                  style={{
                    borderRadius: '8px',
                    padding: '8px 20px',
                    backgroundColor: secondaryColor,
                    border: 'none'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => approveMutation.mutate(currentRequest)}
                  disabled={approveMutation.isLoading}
                  style={{
                    borderRadius: '8px',
                    padding: '8px 20px',
                    backgroundColor: successColor,
                    color: 'white',
                    border: 'none',
                    opacity: approveMutation.isLoading ? 0.7 : 1
                  }}
                >
                  {approveMutation.isLoading ? 'Processing...' : 'Yes, Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeclineModal && (
        <div 
          className="modal"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1050
          }}
        >
          <div 
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '500px' }}
          >
            <div 
              className="modal-content"
              style={{
                borderRadius: '15px',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }}
            >
              <div 
                className="modal-header"
                style={{
                  backgroundColor: secondaryColor,
                  color: 'white',
                  borderBottom: 'none'
                }}
              >
                <h5 className="modal-title">Confirm Decline</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDeclineModal(false)}
                  style={{ filter: 'invert(1)' }}
                ></button>
              </div>
              <div className="modal-body py-4">
                <p className="fs-5 mb-0 text-center">
                  Are you sure you want to decline this request?
                </p>
                {currentRequest && (
                  <div className="mt-3 text-center">
                    {currentRequest.type === 'purchase' ? (
                      <>
                        <p className="mb-1">
                          <strong>Product:</strong> {currentRequest.productName || 'N/A'} (Code: {currentRequest.productCode || 'N/A'})
                        </p>
                        <p className="mb-1">
                          <strong>Quantity:</strong> {currentRequest.quantity || '0'}
                        </p>
                        <p className="mb-1">
                          <strong>Unit Price:</strong> ₹{currentRequest.unitPrice || '0'}
                        </p>
                        <p className="mb-0">
                          <strong>Total Price:</strong> ₹{currentRequest.totalPrice || '0'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mb-1">
                          <strong>Amount:</strong> ₹{currentRequest.amount || '0'}
                        </p>
                        <p className="mb-0">
                          <strong>Type:</strong> {currentRequest.type === 'topup' ? 'Top-up' : 'Withdrawal'}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div 
                className="modal-footer"
                style={{ borderTop: 'none' }}
              >
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDeclineModal(false)}
                  style={{
                    borderRadius: '8px',
                    padding: '8px 20px',
                    backgroundColor: primaryColor,
                    border: 'none'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => declineMutation.mutate(currentRequest)}
                  disabled={declineMutation.isLoading}
                  style={{
                    borderRadius: '8px',
                    padding: '8px 20px',
                    backgroundColor: secondaryColor,
                    color: 'white',
                    border: 'none',
                    opacity: declineMutation.isLoading ? 0.7 : 1
                  }}
                >
                  {declineMutation.isLoading ? 'Processing...' : 'Yes, Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="btn btn-sm"
          style={{
            backgroundColor: 'white',
            color: primaryDarkColor,
            border: `1px solid ${primaryColor}`,
            borderRadius: '8px',
            padding: '8px 15px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = primaryColor}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
        >
          <i className="bi bi-arrow-left me-2" style={{ color: primaryDarkColor }} />
          <span style={{ color: primaryDarkColor }}>Back to Users</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: primaryColor }} role="status"></div>
        </div>
      ) : !user ? (
        <div
          className="alert py-2 px-3 mb-0"
          style={{
            borderRadius: '10px',
            borderLeft: `4px solid ${secondaryColor}`,
            backgroundColor: 'rgba(255, 82, 82, 0.1)',
            color: secondaryColor,
            fontWeight: 'bold'
          }}
        >
          User not found.
        </div>
      ) : (
        <div className="row">
          <div className="col-md-4 mb-4">
            <div
              className="card shadow-sm"
              style={{
                border: 'none',
                borderRadius: '15px',
                overflow: 'hidden',
                background: 'white',
                boxShadow: '0 10px 25px rgba(58, 134, 255, 0.1)'
              }}
            >
              <div
                className="card-header text-white text-center py-4"
                style={{
                  background: cardGradient,
                  borderTopLeftRadius: '15px',
                  borderTopRightRadius: '15px'
                }}
              >
                <div
                  className="bg-white rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '100px', height: '100px', boxShadow: '0 0 15px rgba(0,0,0,0.2)' }}
                >
                  <i className="bi bi-person-circle fs-1" style={{ color: primaryDarkColor }}></i>
                </div>
                <h4 className="mt-3 mb-1 fw-bold">{user.name || 'N/A'}</h4>
                <p className="mb-1" style={{ opacity: 0.9 }}>{user.email || 'N/A'}</p>
                <span
                  className="badge fw-medium"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: user.isActive ? successColor : secondaryColor,
                    color: 'white',
                    marginTop: '5px'
                  }}
                >
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="card-body p-4">
                <h6 className="text-uppercase mb-3 fw-bold" style={{ color: primaryDarkColor, opacity: 0.8 }}>
                  Account Information
                </h6>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2 d-flex justify-content-between align-items-center">
                    <span className="fw-medium" style={{ color: textColor }}>Phone:</span>
                    <span style={{ color: textColor, opacity: 0.8 }}>{user.phone || 'N/A'}</span>
                  </li>
                  <li className="mb-2 d-flex justify-content-between align-items-center">
                    <span className="fw-medium" style={{ color: textColor }}>Joined:</span>
                    <span style={{ color: textColor, opacity: 0.8 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </li>
                  <li className="mb-2 d-flex justify-content-between align-items-center">
                    <span className="fw-medium" style={{ color: textColor }}>Status:</span>
                    <span style={{ color: textColor, opacity: 0.8 }}>{user.status || 'N/A'}</span>
                  </li>
                  <li className="mb-2 d-flex justify-content-between align-items-center">
                    <span className="fw-medium" style={{ color: textColor }}>Rank:</span>
                    <span className="badge" style={{ backgroundColor: primaryColor, color: 'white', borderRadius: '15px', padding: '4px 10px' }}>
                      {user.rank || 'Member'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div
              className="card shadow-sm"
              style={{
                border: 'none',
                borderRadius: '15px',
                boxShadow: '0 10px 25px rgba(58, 134, 255, 0.1)'
              }}
            >
              <div
                className="card-header"
                style={{
                  backgroundColor: 'white',
                  borderBottom: `1px solid ${lightBackground}`,
                  borderTopLeftRadius: '15px',
                  borderTopRightRadius: '15px'
                }}
              >
                <ul className="nav nav-tabs card-header-tabs" style={{ borderBottom: 'none' }}>
                  {['referral', 'transactions', 'products', 'rankAndReward'].map(tab => (
                    <li key={tab} className="nav-item">
                      <a
                        className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                        href="#"
                        onClick={(e) => { e.preventDefault(); setActiveTab(tab); }}
                        style={{
                          color: activeTab === tab ? primaryDarkColor : textColor,
                          borderColor: activeTab === tab ? `transparent transparent ${primaryColor} transparent` : 'transparent',
                          borderWidth: '2px',
                          fontWeight: activeTab === tab ? 'bold' : 'normal',
                          backgroundColor: 'transparent',
                          opacity: activeTab === tab ? 1 : 0.7
                        }}
                      >
                        {tab === 'rankAndReward' ? 'Rank and Reward' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-body p-4">
                {activeTab === 'referral' ? (
                  <>
                    <div>
                      <h5 className="mb-4 fw-bold" style={{ color: primaryDarkColor }}>Referral Information</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div
                            className="border rounded p-3"
                            style={{
                              borderColor: lightBackground,
                              backgroundColor: 'white',
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                              borderRadius: '10px'
                            }}
                          >
                            <h6 className="text-uppercase mb-2 small" style={{ color: textColor, opacity: 0.7 }}>
                              Referred By
                            </h6>
                            <p className="mb-0 fw-medium" style={{ color: primaryColor }}>
                              {user.parentId?.name || 'Root User'}
                            </p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div
                            className="border rounded p-3"
                            style={{
                              borderColor: lightBackground,
                              backgroundColor: 'white',
                              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                              borderRadius: '10px'
                            }}
                          >
                            <h6 className="text-uppercase mb-2 small" style={{ color: textColor, opacity: 0.7 }}>
                              Referral Codes
                            </h6>
                            <p className="mb-1" style={{ color: textColor }}>
                              <span className="fw-medium">Left:</span> {user.referralCodeLeft || 'N/A'}
                            </p>
                            <p className="mb-0" style={{ color: textColor }}>
                              <span className="fw-medium">Right:</span> {user.referralCodeRight || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h6 className="text-uppercase mb-3 fw-bold" style={{ color: primaryDarkColor, opacity: 0.8 }}>
                        Bank Information
                      </h6>
                      <ul className="list-unstyled mb-0">
                        <li className="mb-2 d-flex justify-content-between align-items-center">
                          <span className="fw-medium" style={{ color: textColor }}>Account Number:</span>
                          <span style={{ color: textColor, opacity: 0.8 }}>
                            {user.bankDetails?.accountNumber || 'N/A'}
                          </span>
                        </li>
                        <li className="mb-2 d-flex justify-content-between align-items-center">
                          <span className="fw-medium" style={{ color: textColor }}>Bank Name:</span>
                          <span style={{ color: textColor, opacity: 0.8 }}>
                            {user.bankDetails?.bankName || 'N/A'}
                          </span>
                        </li>
                        <li className="mb-2 d-flex justify-content-between align-items-center">
                          <span className="fw-medium" style={{ color: textColor }}>Account Number:</span>
                          <span style={{ color: textColor, opacity: '0.8' }}>
                            {user.bankDetails?.accountNumber 
                              ? `****${user.bankDetails.accountNumber.toString().slice(-4)}` 
                              : 'N/A'}
                          </span>
                        </li>
                        <li className="d-flex justify-content-between align-items-center">
                          <span className="fw-medium" style={{ color: textColor }}>IFSC Code:</span>
                          <span style={{ color: textColor, opacity: 0.8 }}>
                            {user.bankDetails?.ifscCode || 'N/A'}
                            </span>
                        </li>
                      </ul>
                    </div>
                  </>
                ) : activeTab === 'transactions' ? (
                  renderTransactions()
                ) : activeTab === 'products' ? (
                  renderProductPurchases()
                ) : activeTab === 'rankAndReward' ? (
                  renderRankAndReward()
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}