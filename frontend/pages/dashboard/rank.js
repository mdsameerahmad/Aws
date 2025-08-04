// import { fetchProfile } from '@utils/profileService';
// import axios from 'axios';
// import Head from 'next/head';
// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';

// function Countdown({ eligibleAt, daysToExpire = 2 }) {
//   const [timeLeft, setTimeLeft] = useState('');

//   useEffect(() => {
//     if (!eligibleAt) return;

//     const expiry = new Date(eligibleAt);
//     expiry.setDate(expiry.getDate() + daysToExpire);

//     const update = () => {
//       const now = new Date();
//       const diff = expiry - now;

//       if (diff <= 0) {
//         setTimeLeft('Expired');
//         return;
//       }

//       const d = Math.floor(diff / (1000 * 60 * 60 * 24));
//       const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
//       const m = Math.floor((diff / (1000 * 60)) % 60);
//       const s = Math.floor((diff / 1000) % 60);

//       setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
//     };

//     update();
//     const interval = setInterval(update, 1000);
//     return () => clearInterval(interval);
//   }, [eligibleAt, daysToExpire]);

//   return (
//     <span className="badge bg-dark text-light rounded-pill px-2">
//       {timeLeft}
//     </span>
//   );
// }

// export default function RankPage() {
//   const router = useRouter();
//   const [rankData, setRankData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [userId, setUserId] = useState(null);
//   const [claimingId, setClaimingId] = useState(null);

//   const whatsappNumber = '9155649575';

//   useEffect(() => {
//     const fetchUserId = async () => {
//       try {
//         if (typeof window !== 'undefined') {
//           const savedProfile = localStorage.getItem('userProfileData');
//           if (savedProfile) {
//             const parsed = JSON.parse(savedProfile);
//             const id = parsed._id || parsed.basicInfo?._id;
//             if (id) {
//               setUserId(id);
//               return;
//             }
//           }
//         }

//         const profileData = await fetchProfile();
//         const id = profileData?._id || profileData?.basicInfo?._id;

//         if (id) {
//           setUserId(id);
//           localStorage.setItem('userProfileData', JSON.stringify(profileData));
//         } else throw new Error('User ID not found');
//       } catch (err) {
//         setError(err.message || 'Failed to load profile');
//         if (err.response?.status === 401) {
//           localStorage.removeItem('userProfileData');
//           router.push('/login');
//         }
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUserId();
//   }, [router]);

//   useEffect(() => {
//     const fetchRanks = async () => {
//       if (!userId) return;
//       try {
//         setLoading(true);
//         const res = await axios.get(`/api/income/user-summary/${userId}`);
//         setRankData(res.data);
//       } catch (err) {
//         setError(err.message || 'Failed to load ranks');
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (userId) fetchRanks();
//   }, [userId]);

//   const handleClaim = async (rewardId, rankTitle, tripName) => {
//     try {
//       setClaimingId(rewardId);

//       const msg = `Hello Support Team,\n\nI have achieved the rank ${rankTitle} and I'm eligible for the trip reward:\n\nTrip Name: ${tripName}\nRank Achieved: ${rankTitle}\n\nI would like to claim this reward. Please guide me through the process and approve my claim.\n\nThank you!`;
//       window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`);

//       await axios.patch(`/api/rank/claim-trip/${rewardId}`, { userId });
//       const res = await axios.get(`/api/income/user-summary/${userId}`);
//       setRankData(res.data);

//       alert('Trip claim initiated! Complete on WhatsApp.');
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setClaimingId(null);
//     }
//   };

//   if (loading) return (
//     <div className="d-flex justify-content-center align-items-center vh-100">
//       <div className="spinner-border text-primary" role="status">
//         <span className="visually-hidden">Loading...</span>
//       </div>
//     </div>
//   );
  
//   if (error) return (
//     <div className="alert alert-danger mx-3 my-5 text-center">
//       {error}
//     </div>
//   );

//   return (
//     <>
//       <Head>
//         <title>Rank & Rewards</title>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//       </Head>

//       <div className="container my-4 px-2 px-sm-3">
//         <h2 className="fw-bold text-primary text-center mb-2">Your Rank & Rewards</h2>
//         <p className="text-center text-muted mb-4">Track your progress and claim your earned rewards</p>

//         {/* 🌟 Summary Cards */}
//         <div className="row g-3 text-center mb-4">
//           <div className="col-12 col-md-4">
//             <div className="bg-light shadow rounded-4 p-3 p-sm-4 h-100">
//               <i className="bi bi-trophy-fill text-warning fs-2 mb-2"></i>
//               <h4 className="mb-0">{rankData?.summary?.totalRanksUnlocked || 0}</h4>
//               <p className="text-muted mb-0">Total Ranks</p>
//             </div>
//           </div>
//           <div className="col-12 col-md-4">
//             <div className="bg-light shadow rounded-4 p-3 p-sm-4 h-100">
//               <i className="bi bi-check-circle-fill text-success fs-2 mb-2"></i>
//               <h4 className="mb-0">{rankData?.summary?.claimedTrips || 0}</h4>
//               <p className="text-muted mb-0">Claimed Trips</p>
//             </div>
//           </div>
//           <div className="col-12 col-md-4">
//             <div className="bg-light shadow rounded-4 p-3 p-sm-4 h-100">
//               <i className="bi bi-gift-fill text-danger fs-2 mb-2"></i>
//               <h4 className="mb-0">{rankData?.summary?.unclaimedTrips || 0}</h4>
//               <p className="text-muted mb-0">Unclaimed Trips</p>
//             </div>
//           </div>
//         </div>

//         {/* 📋 Ranks Table - Mobile Responsive */}
//         <div className="table-responsive">
//           <table className="table table-hover mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th>Rank</th>
//                 <th>Status</th>
//                 <th>Reward</th>
//                 <th>Trip</th>
//                 <th>Eligible</th>
//                 <th>Expires</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rankData?.ranks?.map((rank, i) => (
//                 <tr
//                   key={i}
//                   className={rank.status !== 'NOT_ELIGIBLE' ? 'table-success' : ''}
//                 >
//                   <td data-label="Rank">{rank.title}</td>
//                   <td data-label="Status">
//                     <span className={`badge rounded-pill ${
//                       rank.status === 'CLAIMED'
//                         ? 'bg-success'
//                         : rank.status === 'EXPIRED'
//                           ? 'bg-danger'
//                           : rank.status === 'NOT_ELIGIBLE'
//                             ? 'bg-secondary'
//                             : 'bg-warning'
//                     }`}>
//                       {rank.status.replace(/_/g, ' ')}
//                     </span>
//                   </td>
//                   <td data-label="Reward">₹{rank.cashAmount?.toLocaleString('en-IN') || 0}</td>
//                   <td data-label="Trip">{rank.trip !== 'NONE' ? rank.trip : '-'}</td>
//                   <td data-label="Eligible">{rank.eligibleAt ? new Date(rank.eligibleAt).toLocaleDateString() : '-'}</td>
//                   <td data-label="Expires">{rank.eligibleAt ? <Countdown eligibleAt={rank.eligibleAt} /> : '-'}</td>
//                   <td data-label="Action">
//                     {rank.trip !== 'NONE' && !rank.tripClaimed && rank.status !== 'NOT_ELIGIBLE' && (
//                       <button
//                         className="btn btn-sm btn-primary w-100"
//                         onClick={() => handleClaim(rank._id, rank.title, rank.trip)}
//                         disabled={claimingId === rank._id}
//                       >
//                         {claimingId === rank._id ? (
//                           <>
//                             <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                             Processing
//                           </>
//                         ) : (
//                           'Claim Now'
//                         )}
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Empty state */}
//         {!loading && rankData?.ranks?.length === 0 && (
//           <div className="text-center py-5">
//             <i className="bi bi-emoji-frown fs-1 text-muted"></i>
//             <p className="fs-5 text-muted mt-3">No rank data available</p>
//           </div>
//         )}
//       </div>

//       <style jsx global>{`
//         /* Mobile-specific table styles */
//         @media (max-width: 767.98px) {
//           table {
//             border: 0;
//             width: 100%;
//           }
          
//           table thead {
//             display: none;
//           }
          
//           table tr {
//             display: block;
//             margin-bottom: 1rem;
//             border: 1px solid #dee2e6;
//             border-radius: 0.25rem;
//           }
          
//           table td {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             padding: 0.5rem 1rem;
//             border-bottom: 1px solid #dee2e6;
//             text-align: right;
//           }
          
//           table td:before {
//             content: attr(data-label);
//             font-weight: bold;
//             margin-right: auto;
//             padding-right: 1rem;
//             text-align: left;
//           }
          
//           table td:last-child {
//             border-bottom: 0;
//           }
//         }
//       `}</style>
//     </>
//   );
// }
import { fetchProfile } from '@utils/profileService';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function Countdown({ eligibleAt, daysToExpire = 2 }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!eligibleAt) return;

    const expiry = new Date(eligibleAt);
    expiry.setDate(expiry.getDate() + daysToExpire);

    const update = () => {
      const now = new Date();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [eligibleAt, daysToExpire]);

  return (
    <span className="badge bg-dark text-light rounded-pill px-2">
      {timeLeft}
    </span>
  );
}

export default function RankPage() {
  const router = useRouter();
  const [rankData, setRankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [claimingId, setClaimingId] = useState(null);

  const whatsappNumber = '7859086070';

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        if (typeof window !== 'undefined') {
          const savedProfile = localStorage.getItem('userProfileData');
          if (savedProfile) {
            const parsed = JSON.parse(savedProfile);
            const id = parsed._id || parsed.basicInfo?._id;
            if (id) {
              setUserId(id);
              return;
            }
          }
        }

        const profileData = await fetchProfile();
        const id = profileData?._id || profileData?.basicInfo?._id;

        if (id) {
          setUserId(id);
          localStorage.setItem('userProfileData', JSON.stringify(profileData));
        } else throw new Error('User ID not found');
      } catch (err) {
        setError(err.message || 'Failed to load profile');
        if (err.response?.status === 401) {
          localStorage.removeItem('userProfileData');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserId();
  }, [router]);

  useEffect(() => {
    const fetchRanks = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await axios.get(`/api/income/user-summary/${userId}`);
        setRankData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load ranks');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchRanks();
  }, [userId]);

  const handleClaim = async (rewardId, rankTitle, tripName) => {
    try {
      setClaimingId(rewardId);

      const msg = `Hello Support Team,\n\nI have achieved the rank ${rankTitle} and I'm eligible for the trip reward:\n\nTrip Name: ${tripName}\nRank Achieved: ${rankTitle}\n\nI would like to claim this reward. Please guide me through the process and approve my claim.\n\nThank you!`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`);

      await axios.patch(`/api/rank/claim-trip/${rewardId}`, { userId });
      const res = await axios.get(`/api/income/user-summary/${userId}`);
      setRankData(res.data);

      alert('Trip claim initiated! Complete on WhatsApp.');
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger mx-3 my-5 text-center">
      {error}
    </div>
  );

  return (
    <>
      <Head>
        <title>Rank & Rewards</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container my-4 px-2 px-sm-3">
        <h2 className="fw-bold text-primary text-center mb-2">Your Rank & Rewards</h2>
        <p className="text-center text-muted mb-4">Track your progress and claim your earned rewards</p>

        {/* 🌟 Summary Cards */}
        <div className="row g-3 text-center mb-4">
          <div className="col-12 col-md-4">
            <div className="bg-light shadow rounded-4 p-3 p-sm-4 h-100">
              <i className="bi bi-trophy-fill text-warning fs-2 mb-2"></i>
              <h4 className="mb-0">{rankData?.summary?.totalRanksUnlocked || 0}</h4>
              <p className="text-muted mb-0">Total Ranks</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="bg-light shadow rounded-4 p-3 p-sm-4 h-100">
              <i className="bi bi-check-circle-fill text-success fs-2 mb-2"></i>
              <h4 className="mb-0">{rankData?.summary?.claimedTrips || 0}</h4>
              <p className="text-muted mb-0">Claimed Trips</p>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="bg-light shadow rounded-4 p-3 p-sm-4 h-100">
              <i className="bi bi-gift-fill text-danger fs-2 mb-2"></i>
              <h4 className="mb-0">{rankData?.summary?.unclaimedTrips || 0}</h4>
              <p className="text-muted mb-0">Unclaimed Trips</p>
            </div>
          </div>
        </div>

        {/* 📋 Ranks Table - Mobile Responsive */}
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Rank</th>
                <th>Status</th>
                <th>Reward</th>
                <th>Trip</th>
                <th>Eligible</th>
                <th>Expires</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rankData?.ranks?.map((rank, i) => {
                // Calculate expiry date for CLAIMED or EXPIRED statuses
                const expiryDate = rank.eligibleAt 
                  ? new Date(new Date(rank.eligibleAt).setDate(new Date(rank.eligibleAt).getDate() + 2)).toLocaleDateString()
                  : '-';

                return (
                  <tr
                    key={i}
                    className={rank.status !== 'NOT_ELIGIBLE' ? 'table-success' : ''}
                  >
                    <td data-label="Rank">{rank.title}</td>
                    <td data-label="Status">
                      <span className={`badge rounded-pill ${
                        rank.status === 'CLAIMED'
                          ? 'bg-success'
                          : rank.status === 'EXPIRED'
                            ? 'bg-danger'
                            : rank.status === 'NOT_ELIGIBLE'
                              ? 'bg-secondary'
                              : rank.status === 'PENDING'
                                ? 'bg-warning'
                                : 'bg-warning'
                      }`}>
                        {rank.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td data-label="Reward">₹{rank.cashAmount?.toLocaleString('en-IN') || 0}</td>
                    <td data-label="Trip">{rank.trip !== 'NONE' ? rank.trip : '-'}</td>
                    <td data-label="Eligible">{rank.eligibleAt ? new Date(rank.eligibleAt).toLocaleDateString() : '-'}</td>
                    <td data-label="Expires">
                      {rank.eligibleAt ? (
                        rank.status === 'PENDING' ? (
                          <Countdown eligibleAt={rank.eligibleAt} />
                        ) : (
                          expiryDate
                        )
                      ) : (
                        '-'
                      )}
                    </td>
                    <td data-label="Action">
                      {rank.trip !== 'NONE' && 
                       rank.status !== 'NOT_ELIGIBLE' && 
                       rank.status !== 'PENDING' && 
                       rank.status !== 'EXPIRED' ? (
                        rank.tripClaimed ? (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Trip Claimed
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm btn-primary w-100"
                            onClick={() => handleClaim(rank._id, rank.title, rank.trip)}
                            disabled={claimingId === rank._id}
                          >
                            {claimingId === rank._id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Processing
                              </>
                            ) : (
                              'Claim Now'
                            )}
                          </button>
                        )
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {!loading && rankData?.ranks?.length === 0 && (
          <div className="text-center py-5">
            <i className="bi bi-emoji-frown fs-1 text-muted"></i>
            <p className="fs-5 text-muted mt-3">No rank data available</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Mobile-specific table styles */
        @media (max-width: 767.98px) {
          table {
            border: 0;
            width: 100%;
          }
          
          table thead {
            display: none;
          }
          
          table tr {
            display: block;
            margin-bottom: 1rem;
            border: 1px solid #dee2e6;
            border-radius: 0.25rem;
          }
          
          table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 1rem;
            border-bottom: 1px solid #dee2e6;
            text-align: right;
          }
          
          table td:before {
            content: attr(data-label);
            font-weight: bold;
            margin-right: auto;
            padding-right: 1rem;
            text-align: left;
          }
          
          table td:last-child {
            border-bottom: 0;
          }
        }
      `}</style>
    </>
  );
}