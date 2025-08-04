
// import { useState, useEffect } from 'react';
// import api from '../utils/api';
// import { fetchProfile } from '../utils/profileService';
// import Image from 'next/image';

// // Define status tiers
// const STATUS_TIERS = [
//   {
//     name: "Consumer",
//     requiredTopup: 300,
//     requiredChildren: 0,
//     requiredStatus: null,
//     levelDepth: 3,
//     color: "#4CAF50"
//   },
//   {
//     name: "One Star",
//     requiredTopup: 1000,
//     requiredChildren: 2,
//     requiredStatus: "Consumer",
//     levelDepth: 5,
//     color: "#FFC107"
//   },
//   {
//     name: "Two Star",
//     requiredTopup: 5000,
//     requiredChildren: 2,
//     requiredStatus: "One Star",
//     levelDepth: 10,
//     color: "#FF9800"
//   },
//   {
//     name: "Three Star",
//     requiredTopup: 15000,
//     requiredChildren: 3,
//     requiredStatus: "Two Star",
//     levelDepth: 15,
//     color: "#2196F3"
//   },
//   {
//     name: "Four Star",
//     requiredTopup: 30000,
//     requiredChildren: 5,
//     requiredStatus: "Three Star",
//     levelDepth: 20,
//     color: "#9C27B0"
//   },
//   {
//     name: "Five Star",
//     requiredTopup: 50000,
//     requiredChildren: 7,
//     requiredStatus: "Four Star",
//     levelDepth: 30,
//     color: "#E91E63"
//   },
// ];

// // Define rank tiers
// const RANK_TIERS = [
//   {
//     title: "ASSISTANT SUPERVISOR",
//     type: "business",
//     leftBusiness: 100000,
//     rightBusiness: 100000,
//     minStatus: "Two Star",
//     reward: {
//       cashAmount: 1000,
//       trip: "NATIONAL"
//     },
//     color: "#FF6B35"
//   },
//   {
//     title: "SUPERVISOR",
//     type: "business",
//     leftBusiness: 500000,
//     rightBusiness: 500000,
//     minStatus: "Two Star",
//     reward: {
//       cashAmount: 3000,
//       trip: "NATIONAL"
//     },
//     color: "#F7931E"
//   },
//   {
//     title: "ASSISTANT MANAGER",
//     type: "business",
//     leftBusiness: 1000000,
//     rightBusiness: 1000000,
//     minStatus: "Two Star",
//     reward: {
//       cashAmount: 6000,
//       trip: "NATIONAL"
//     },
//     color: "#FFD23F"
//   },
//   {
//     title: "MANAGER",
//     type: "subtree",
//     leftUsers: 2,
//     rightUsers: 2,
//     requiredChildRank: "ASSISTANT MANAGER",
//     minStatus: "Three Star",
//     reward: {
//       cashAmount: 25000,
//       trip: "SPECIAL"
//     },
//     color: "#06FFA5"
//   },
//   {
//     title: "SENIOR MANAGER",
//     type: "subtree",
//     leftUsers: 3,
//     rightUsers: 3,
//     requiredChildRank: "MANAGER",
//     minStatus: "Four Star",
//     reward: {
//       cashAmount: 125000,
//       trip: "SPECIAL"
//     },
//     color: "#4ECDC4"
//   },
//   {
//     title: "SOARING MANAGER",
//     type: "subtree",
//     leftUsers: 3,
//     rightUsers: 3,
//     requiredChildRank: "SENIOR MANAGER",
//     minStatus: "Five Star",
//     reward: {
//       cashAmount: 1000000,
//       trip: "INTERNATIONAL"
//     },
//     color: "#45B7D1"
//   },
//   {
//     title: "SAPPHIRE MANAGER",
//     type: "subtree",
//     leftUsers: 4,
//     rightUsers: 4,
//     requiredChildRank: "SOARING MANAGER",
//     minStatus: "Five Star",
//     reward: {
//       cashAmount: 2500000,
//       trip: "INTERNATIONAL"
//     },
//     color: "#6C5CE7"
//   },
//   {
//     title: "DIAMOND SAPPHIRE MANAGER",
//     type: "subtree",
//     leftUsers: 5,
//     rightUsers: 5,
//     requiredChildRank: "SAPPHIRE MANAGER",
//     minStatus: "Five Star",
//     reward: {
//       cashAmount: 6000000,
//       trip: "INTERNATIONAL"
//     },
//     color: "#A29BFE"
//   },
//   {
//     title: "DIAMOND MANAGER",
//     type: "subtree",
//     leftUsers: 8,
//     rightUsers: 8,
//     requiredChildRank: "DIAMOND SAPPHIRE MANAGER",
//     minStatus: "Five Star",
//     reward: {
//       cashAmount: 15000000,
//       trip: "INTERNATIONAL"
//     },
//     color: "#FD79A8"
//   }
// ];

// const DashboardPage = () => {
//   const [profile, setProfile] = useState(null);
//   const [wallet, setWallet] = useState({
//     incomeWallet: 0,
//     totalTopup: 0
//   });
//   const [incomeStats, setIncomeStats] = useState({
//     totalIncome: 0,
//     monthlyIncome: 0,
//     monthlyLabel: ''
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentStatus, setCurrentStatus] = useState(null);
//   const [nextStatus, setNextStatus] = useState(null);
//   const [currentRank, setCurrentRank] = useState(null);
//   const [nextRank, setNextRank] = useState(null);
//   const [businessData, setBusinessData] = useState({
//     leftBusiness: 0,
//     rightBusiness: 0,
//     leftUsers: 0,
//     rightUsers: 0
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const profileData = await fetchProfile();
//         setProfile(profileData);

//         const userId = profileData.basicInfo?._id;
//         if (!userId) throw new Error("User ID not found");

//         const incomeRes = await api.get(`/api/income/business/${userId}`);
//         const incomeData = incomeRes.data;

//         const now = new Date();
//         const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
//         const currentMonthEntry = (incomeData.monthlyStats || []).find(
//           (stat) => stat.month === currentMonthKey
//         );

//         const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//         const monthlyLabel = lastMonth.toLocaleString("default", { month: "long", year: "numeric" });

//         setIncomeStats({
//           totalIncome: incomeData.totalIncome || 0,
//           monthlyIncome: currentMonthEntry?.income || 0,
//           monthlyLabel,
//         });

//         const walletRes = await api.get(`/api/wallet/user/${userId}/wallet`);
//         setWallet(walletRes.data);

//         // Fetch business data for rank calculation
//         try {
//           const businessRes = await api.get(`/api/income/business/${userId}`);
//           setBusinessData(businessRes.data || {
//             leftBusiness: 0,
//             rightBusiness: 0,
//             leftUsers: 0,
//             rightUsers: 0
//           });
//         } catch (businessError) {
//           console.warn("Business data not available:", businessError);
//         }

//         const userStatusName = profileData.statusInfo?.status || "Inactive";
//         const userRankName = profileData.statusInfo?.rank || null;

//         // Set current status and next status
//         const current = STATUS_TIERS.find((tier) => tier.name === userStatusName) || STATUS_TIERS[0];
//         const currentIndex = STATUS_TIERS.findIndex((tier) => tier.name === current.name);
//         const next = currentIndex < STATUS_TIERS.length - 1 ? STATUS_TIERS[currentIndex + 1] : null;

//         setCurrentStatus(current);
//         setNextStatus(next);

//         // Set current rank and next rank
//         const currentRankTier = RANK_TIERS.find((tier) => tier.title === userRankName) || null;
//         const currentRankIndex = currentRankTier ? RANK_TIERS.findIndex((tier) => tier.title === currentRankTier.title) : -1;
//         const nextRankTier = currentRankIndex < RANK_TIERS.length - 1 ? RANK_TIERS[currentRankIndex + 1] : RANK_TIERS[0];

//         setCurrentRank(currentRankTier);
//         setNextRank(nextRankTier);

//       } catch (err) {
//         console.error("Dashboard data fetch error:", err);
//         setError(err.message || "Failed to load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const formatCurrency = (amount) => {
//     if (amount >= 10000000) {
//       return `₹${(amount / 10000000).toFixed(1)} Cr`;
//     } else if (amount >= 100000) {
//       return `₹${(amount / 100000).toFixed(1)} L`;
//     } else if (amount >= 1000) {
//       return `₹${(amount / 1000).toFixed(1)} K`;
//     }
//     return `₹${amount}`;
//   };

//   const getRankProgress = (rank) => {
//     if (!rank || !businessData) return 0;

//     if (rank.type === "business") {
//       const leftProgress = Math.min((businessData.leftBusiness / rank.leftBusiness) * 100, 100);
//       const rightProgress = Math.min((businessData.rightBusiness / rank.rightBusiness) * 100, 100);
//       return Math.min(leftProgress, rightProgress);
//     } else if (rank.type === "subtree") {
//       const leftProgress = Math.min((businessData.leftUsers / rank.leftUsers) * 100, 100);
//       const rightProgress = Math.min((businessData.rightUsers / rank.rightUsers) * 100, 100);
//       return Math.min(leftProgress, rightProgress);
//     }
//     return 0;
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-danger mt-4" role="alert">
//         {error}
//       </div>
//     );
//   }

//   if (!profile) {
//     return <div>No profile data available</div>;
//   }

//   const userPoints = wallet.totalTopup ? wallet.totalTopup / 100 : 0;
//   const progressPercentage = nextStatus 
//     ? Math.min((userPoints / (nextStatus.requiredTopup / 100)) * 100, 100)
//     : 100;

//   const rankProgressPercentage = getRankProgress(nextRank);

//   return (
//     <div className="p-4">
//       <h2 className="mb-4 fw-bold" style={{ color: '#0A2463' }}>Dashboard Overview</h2>

//       <div className="card mb-4 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
//         <div className="card-body">
//           <div className="row align-items-center">
//             <div className="col-md-4 mb-3 mb-md-0">
//               <div className="d-flex align-items-center">
//                 <div className="me-3">
//                   {profile.basicInfo?.avatar ? (
//                     <Image 
//                       src={profile.basicInfo.avatar} 
//                       alt="User Avatar"
//                       width={80}
//                       height={80}
//                       className="rounded-circle"
//                       style={{ objectFit: 'cover' }}
//                     />
//                   ) : (
//                     <div 
//                       className="rounded-circle d-flex align-items-center justify-content-center"
//                       style={{
//                         width: '80px',
//                         height: '80px',
//                         backgroundColor: '#3A86FF',
//                         color: 'white',
//                         fontSize: '30px',
//                       }}
//                     >
//                       {profile.basicInfo?.name?.charAt(0) || 'U'}
//                     </div>
//                   )}
//                 </div>
//                 <div>
//                   <h4 className="fw-bold mb-1" style={{ color: '#0A2463' }}>
//                     {profile.basicInfo?.name || 'User Name'}
//                   </h4>
//                   <p className="mb-1" style={{ color: '#0A2463' }}>
//                     <strong>Email:</strong> {profile.basicInfo?.email || 'N/A'}
//                   </p>
//                   <p className="mb-0" style={{ color: '#0A2463' }}>
//                     <strong>Status:</strong>
//                     <span className="ms-1" style={{ color: currentStatus.color, fontWeight: '600' }}>
//                       {profile.statusInfo?.status}
//                     </span>
//                   </p>
//                   {profile.statusInfo?.rank && (
//                     <p className="mb-0" style={{ color: '#0A2463' }}>
//                       <strong>Rank:</strong>
//                       <span className="ms-1 fw-semibold" style={{ color: currentRank?.color || '#FF5722' }}>
//                         {profile.statusInfo.rank}
//                       </span>
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4 mb-3 mb-md-0">
//               <div className="border-start ps-4" style={{ borderColor: '#E0E0E0' }}>
//                 <h5 className="fw-bold" style={{ color: '#0A2463' }}>Referral Codes</h5>
//                 <div className="d-flex flex-column">
//                   <div className="mb-2">
//                     <span className="fw-medium" style={{ color: '#0A2463' }}>Left: </span>
//                     <span style={{ color: '#3A86FF' }}>{profile.referralInfo?.referralCodeLeft || 'N/A'}</span>
//                   </div>
//                   <div>
//                     <span className="fw-medium" style={{ color: '#0A2463' }}>Right: </span>
//                     <span style={{ color: '#3A86FF' }}>{profile.referralInfo?.referralCodeRight || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4">
//               <div className="border-start ps-4" style={{ borderColor: '#E0E0E0' }}>
//                 <h5 className="fw-bold" style={{ color: '#0A2463' }}>Wallet Summary</h5>
//                 <div className="d-flex flex-column">
//                   <div className="mb-2">
//                     <span className="fw-medium" style={{ color: '#0A2463' }}>Income Wallet: </span>
//                     <span className="fw-bold" style={{ color: '#00b894' }}>₹ {wallet.incomeWallet?.toFixed(2) || '0.00'}</span>
//                   </div>
//                   <div>
//                     <span className="fw-medium" style={{ color: '#0A2463' }}>Total Points: </span>
//                     <span className="fw-bold" style={{ color: '#9C27B0' }}>{userPoints.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Financial Overview */}
//       <div className="row mb-4">
//         <div className="col-md-6 mb-4 mb-md-0">
//           <div className="card h-100 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
//             <div className="card-body text-center">
//               <h5 className="fw-bold" style={{ color: '#0A2463' }}>Total Earning</h5>
//               <div className="display-5 fw-bold mt-3" style={{ color: '#3A86FF' }}>
//                 ₹ {incomeStats.totalIncome.toFixed(2)}
//               </div>
//               <p className="text-muted mt-2">Lifetime earnings</p>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-6">
//           <div className="card h-100 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
//             <div className="card-body text-center">
//               <h5 className="fw-bold" style={{ color: '#0A2463' }}>Last Month Earning</h5>
//               <div className="display-5 fw-bold mt-3" style={{ color: '#00b894' }}>
//                 ₹ {incomeStats.monthlyIncome.toFixed(2)}
//               </div>
//               <p className="text-muted mt-2">{incomeStats.monthlyLabel}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Next Status Achievement */}
//       <div className="card mb-4 shadow-sm" style={{
//         borderRadius: '12px',
//         backgroundColor: nextStatus ? '#f8f9fa' : '#e8f5e9',
//         border: nextStatus ? '1px solid #e0e0e0' : '2px solid #4caf50'
//       }}>
//         <div className="card-body">
//           <h5 className="fw-bold text-center mb-3" style={{ color: '#0A2463' }}>
//             {nextStatus ? 'Next Status Achievement' : 'Highest Status Achieved!'}
//           </h5>

//           {nextStatus ? (
//             <div className="row align-items-center">
//               <div className="col-md-4 text-center mb-3 mb-md-0">
//                 <h4 style={{ color: nextStatus.color, fontWeight: '700' }}>
//                   {nextStatus.name}
//                 </h4>
//                 <p className="mb-0" style={{ fontSize: '0.9rem' }}>
//                   {nextStatus.requiredTopup / 100} points required
//                 </p>
//               </div>

//               <div className="col-md-8">
//                 <div className="mb-3">
//                   <div className="progress-container" style={{
//                     height: '15px',
//                     backgroundColor: '#e9ecef',
//                     borderRadius: '10px',
//                     overflow: 'hidden',
//                     position: 'relative'
//                   }}>
//                     <div className="progress-fill" style={{
//                       height: '100%',
//                       width: `${progressPercentage}%`,
//                       backgroundColor: nextStatus.color,
//                       borderRadius: '10px',
//                     }}></div>
//                     <div style={{
//                       position: 'absolute',
//                       top: '0',
//                       left: '0',
//                       width: '100%',
//                       height: '100%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontWeight: '600',
//                       fontSize: '0.7rem',
//                       color: progressPercentage > 50 ? 'white' : 'black'
//                     }}>
//                       {userPoints.toFixed(2)} / {nextStatus.requiredTopup / 100}
//                     </div>
//                   </div>
//                   <div className="d-flex justify-content-between mt-1">
//                     <small>Your points</small>
//                     <small>Required</small>
//                   </div>
//                 </div>

//                 <div className="row mt-2">
//                   {nextStatus.requiredStatus && (
//                     <div className="col-md-6 mb-2">
//                       <p className="mb-1" style={{ fontWeight: '500' }}>
//                         Required Status:
//                       </p>
//                       <span className="badge" style={{
//                         backgroundColor: '#6c757d',
//                         color: 'white',
//                       }}>
//                         {nextStatus.requiredStatus}
//                       </span>
//                     </div>
//                   )}

//                   {nextStatus.requiredChildren > 0 && (
//                     <div className="col-md-6">
//                       <p className="mb-1" style={{ fontWeight: '500' }}>
//                         Required Referrals:
//                       </p>
//                       <span className="badge" style={{
//                         backgroundColor: nextStatus.color,
//                         color: 'white',
//                       }}>
//                         {nextStatus.requiredChildren} {nextStatus.requiredStatus}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-3">
//               <i className="fas fa-trophy display-4 mb-3" style={{ color: '#FFD700' }}></i>
//               <h5 style={{ color: '#4caf50' }}>
//                 Congratulations! You've achieved the highest status
//               </h5>
//               <p className="mt-2 mb-0">
//                 <strong>Current Status:</strong> {currentStatus?.name}
//               </p>
//             </div>
//           )}

//           {nextStatus && userPoints < (nextStatus.requiredTopup / 100) && (
//             <div className="text-center mt-3">
//               <span className="text-danger">
//                 Need {(nextStatus.requiredTopup / 100 - userPoints).toFixed(2)} more points
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Next Rank Achievement */}
//       <div className="card shadow-sm" style={{
//         borderRadius: '12px',
//         backgroundColor: nextRank && currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? '#e8f5e9' : '#f8f9fa',
//         border: nextRank && currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? '2px solid #4caf50' : '1px solid #e0e0e0'
//       }}>
//         <div className="card-body">
//           <h5 className="fw-bold text-center mb-3" style={{ color: '#0A2463' }}>
//             {nextRank && currentRank?.title !== RANK_TIERS[RANK_TIERS.length - 1].title ? 'Next Rank Achievement' : 
//              currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? 'Highest Rank Achieved!' : 
//              'Next Rank Achievement'}
//           </h5>

//           {nextRank && currentRank?.title !== RANK_TIERS[RANK_TIERS.length - 1].title ? (
//             <div className="row align-items-center">
//               <div className="col-md-4 text-center mb-3 mb-md-0">
//                 <h4 style={{ color: nextRank.color, fontWeight: '700' }}>
//                   {nextRank.title}
//                 </h4>
//                 <div className="mt-2">
//                   <div className="badge" style={{
//                     backgroundColor: nextRank.color,
//                     color: 'white',
//                     fontSize: '0.8rem'
//                   }}>
//                     {nextRank.reward.trip}
//                   </div>
//                   <p className="mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
//                     Reward: {formatCurrency(nextRank.reward.cashAmount)}
//                   </p>
//                 </div>
//               </div>

//               <div className="col-md-8">
//                 <div className="mb-3">
//                   <div className="progress-container" style={{
//                     height: '15px',
//                     backgroundColor: '#e9ecef',
//                     borderRadius: '10px',
//                     overflow: 'hidden',
//                     position: 'relative'
//                   }}>
//                     <div className="progress-fill" style={{
//                       height: '100%',
//                       width: `${rankProgressPercentage}%`,
//                       backgroundColor: nextRank.color,
//                       borderRadius: '10px',
//                     }}></div>
//                     <div style={{
//                       position: 'absolute',
//                       top: '0',
//                       left: '0',
//                       width: '100%',
//                       height: '100%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontWeight: '600',
//                       fontSize: '0.7rem',
//                       color: rankProgressPercentage > 50 ? 'white' : 'black'
//                     }}>
//                       {rankProgressPercentage.toFixed(1)}%
//                     </div>
//                   </div>
//                   <div className="d-flex justify-content-between mt-1">
//                     <small>Progress</small>
//                     <small>Required</small>
//                   </div>
//                 </div>

//                 <div className="row mt-2">
//                   <div className="col-md-6 mb-2">
//                     <p className="mb-1" style={{ fontWeight: '500' }}>
//                       Required Status:
//                     </p>
//                     <span className="badge" style={{
//                       backgroundColor: '#6c757d',
//                       color: 'white',
//                     }}>
//                       {nextRank.minStatus}
//                     </span>
//                   </div>

//                   {nextRank.type === "business" ? (
//                     <div className="col-md-6">
//                       <p className="mb-1" style={{ fontWeight: '500' }}>
//                         Business Required:
//                       </p>
//                       <div className="d-flex flex-column">
//                         <span className="badge mb-1" style={{
//                           backgroundColor: nextRank.color,
//                           color: 'white',
//                           fontSize: '0.7rem'
//                         }}>
//                           Left: {formatCurrency(nextRank.leftBusiness)}
//                         </span>
//                         <span className="badge" style={{
//                           backgroundColor: nextRank.color,
//                           color: 'white',
//                           fontSize: '0.7rem'
//                         }}>
//                           Right: {formatCurrency(nextRank.rightBusiness)}
//                         </span>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="col-md-6">
//                       <p className="mb-1" style={{ fontWeight: '500' }}>
//                         Users Required:
//                       </p>
//                       <div className="d-flex flex-column">
//                         <span className="badge mb-1" style={{
//                           backgroundColor: nextRank.color,
//                           color: 'white',
//                           fontSize: '0.7rem'
//                         }}>
//                           Left: {nextRank.leftUsers} {nextRank.requiredChildRank}
//                         </span>
//                         <span className="badge" style={{
//                           backgroundColor: nextRank.color,
//                           color: 'white',
//                           fontSize: '0.7rem'
//                         }}>
//                           Right: {nextRank.rightUsers} {nextRank.requiredChildRank}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

               
//               </div>
//             </div>
//           ) : currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? (
//             <div className="text-center py-3">
//               <i className="fas fa-crown display-4 mb-3" style={{ color: '#FFD700' }}></i>
//               <h5 style={{ color: '#4caf50' }}>
//                 Congratulations! You've achieved the highest rank
//               </h5>
//               <p className="mt-2 mb-0">
//                 <strong>Current Rank:</strong> {currentRank?.title}
//               </p>
//               <p className="mt-1 mb-0">
//                 <strong>Reward:</strong> {formatCurrency(currentRank?.reward.cashAmount)} + {currentRank?.reward.trip} Trip
//               </p>
//             </div>
//           ) : (
//             <div className="text-center py-3">
//               <i className="fas fa-medal display-4 mb-3" style={{ color: '#FFA500' }}></i>
//               <h5 style={{ color: '#0A2463' }}>
//                 {currentRank ? `Work towards your next rank: ${nextRank?.title}` : `Start your rank journey: ${nextRank?.title}`}
//               </h5>
//               <p className="mt-2 mb-0">
//                 <strong>Target Rank:</strong> {nextRank?.title}
//               </p>
//               <p className="mt-1 mb-0">
//                 <strong>Potential Reward:</strong> {formatCurrency(nextRank?.reward.cashAmount)} + {nextRank?.reward.trip} Trip
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;



// import { useState, useEffect } from 'react';
// import api from '../utils/api';
// import { fetchProfile } from '../utils/profileService';
// import Image from 'next/image';

// // Define status tiers
// const STATUS_TIERS = [
//   {
//     name: "Consumer",
//     requiredTopup: 300,
//     requiredChildren: 0,
//     requiredStatus: null,
//     levelDepth: 3,
//     color: "#4CAF50"
//   },
//   {
//     name: "One Star",
//     requiredTopup: 1000,
//     requiredChildren: 2,
//     requiredStatus: "Consumer",
//     levelDepth: 5,
//     color: "#FFC107"
//   },
//   {
//     name: "Two Star",
//     requiredTopup: 5000,
//     requiredChildren: 2,
//     requiredStatus: "One Star",
//     levelDepth: 10,
//     color: "#FF9800"
//   },
//   {
//     name: "Three Star",
//     requiredTopup: 15000,
//     requiredChildren: 3,
//     requiredStatus: "Two Star",
//     levelDepth: 15,
//     color: "#2196F3"
//   },
//   {
//     name: "Four Star",
//     requiredTopup: 30000,
//     requiredChildren: 5,
//     requiredStatus: "Three Star",
//     levelDepth: 20,
//     color: "#9C27B0"
//   },
//   {
//     name: "Five Star",
//     requiredTopup: 50000,
//     requiredChildren: 7,
//     requiredStatus: "Four Star",
//     levelDepth: 30,
//     color: "#E91E63"
//   },
// ];

// // Define rank tiers
// const RANK_TIERS = [
//   {
//     title: "ASSISTANT SUPERVISOR",
//     type: "business",
//     leftBusiness: 100000,
//     rightBusiness: 100000,
//     minStatus: "Two Star",
//     reward: {
//       cashAmount: 1000,
//       trip: "NATIONAL"
//     },
//     color: "#FF6B35"
//   },
//   {
//     title: "SUPERVISOR",
//     type: "business",
//     leftBusiness: 500000,
//     rightBusiness: 500000,
//     minStatus: "Two Star",
//     reward: {
//       cashAmount: 3000,
//       trip: "NATIONAL"
//     },
//     color: "#F7931E"
//   },
//   {
//     title: "ASSISTANT MANAGER",
//     type: "business",
//     leftBusiness: 1000000,
//     rightBusiness: 1000000,
//     minStatus: "Two Star",
//     reward: {
//       cashAmount: 6000,
//       trip: "NATIONAL"
//     },
//     color: "#FFD23F"
//   },
//   {
//     title: "MANAGER",
//     type: "subtree",
//     leftUsers: 2,
//     rightUsers: 2,
//     requiredChildRank: "ASSISTANT MANAGER",
//     minStatus: "Three Star",
//     reward: {
//       cashAmount: 25000,
//       trip: "SPECIAL"
//     },
//     color: "#06FFA5"
//   },
//   {
//     title: "SENIOR MANAGER",
//     type: "subtree",
//     leftUsers: 3,
//     rightUsers: 3,
//     requiredChildRank: "MANAGER",
//     minStatus: "Four Star",
//     reward: {
//       cashAmount: 125000,
//       trip: "SPECIAL"
//     },
//     color: "#4ECDC4"
//   },
//   {
//     title: "SOARING MANAGER",
//     type: "subtree",
//     leftUsers: 3,
//     rightUsers: 3,
//     requiredChildRank: "SENIOR MANAGER",
//     minStatus: "Five Star",
//     reward: {
//       cashAmount: 1000000,
//       trip: "INTERNATIONAL"
//     },
//     color: "#45B7D1"
//   },
//   {
//     title: "SAPPHIRE MANAGER",
//     type: "subtree",
//     leftUsers: 4,
//     rightUsers: 4,
//     requiredChildRank: "SOARING MANAGER",
//     minStatus: "Five Star",
//     reward: {
//       cashAmount: 2500000,
//       trip: "INTERNATIONAL"
//     },
//     color: "#6C5CE7"
//   },
//   {
//     title: "DIAMOND SAPPHIRE MANAGER",
//     type: "subtree",
//     leftUsers: 5,
//     rightUsers: 5,
//     requiredChildRank: "SAPPHIRE MANAGER",
//     minStatus: "Five Star",
//     reward: {
//       cashAmount: 6000000,
//       trip: "INTERNATIONAL"
//     },
//     color: "#A29BFE"
//   },
//   {
//     title: "DIAMOND MANAGER",
//     type: "subtree",
//     leftUsers: 8,
//     rightUsers: 8,
//     requiredChildRank: "DIAMOND SAPPHIRE MANAGER",
//     minStatus: "Five Star",
//     reward: {
//       cashAmount: 15000000,
//       trip: "INTERNATIONAL"
//     },
//     color: "#FD79A8"
//   }
// ];

// const DashboardPage = () => {
//   const [profile, setProfile] = useState(null);
//   const [wallet, setWallet] = useState({
//     incomeWallet: 0,
//     totalTopup: 0
//   });
//   const [incomeStats, setIncomeStats] = useState({
//     totalIncome: 0,
//     monthlyIncome: 0,
//     monthlyLabel: ''
//   });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentStatus, setCurrentStatus] = useState(null);
//   const [nextStatus, setNextStatus] = useState(null);
//   const [currentRank, setCurrentRank] = useState(null);
//   const [nextRank, setNextRank] = useState(null);
//   const [businessData, setBusinessData] = useState({
//     leftBusiness: 0,
//     rightBusiness: 0,
//     leftUsers: 0,
//     rightUsers: 0
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const profileData = await fetchProfile();
//         setProfile(profileData);

//         const userId = profileData.basicInfo?._id;
//         if (!userId) {
//           throw new Error("User ID not found");
//         }

//         // Fetch income and business data
//         try {
//           const incomeRes = await api.get(`/api/income/business/${userId}`);
//           const incomeData = incomeRes.data;

//           const now = new Date();
//           const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
//           const currentMonthEntry = (incomeData.monthlyStats || []).find(
//             (stat) => stat.month === currentMonthKey
//           );

//           const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//           const monthlyLabel = lastMonth.toLocaleString("default", { month: "long", year: "numeric" });

//           setIncomeStats({
//             totalIncome: incomeData.totalIncome || 0,
//             monthlyIncome: currentMonthEntry?.income || 0,
//             monthlyLabel,
//           });

//           setBusinessData(incomeData.businessData || {
//             leftBusiness: 0,
//             rightBusiness: 0,
//             leftUsers: 0,
//             rightUsers: 0
//           });

//         } catch (incomeError) {
//           if (incomeError.response && incomeError.response.status === 404) {
//             console.warn("Income and business data not found for new user. Setting defaults.");
//             setIncomeStats({
//               totalIncome: 0,
//               monthlyIncome: 0,
//               monthlyLabel: ''
//             });
//             setBusinessData({
//               leftBusiness: 0,
//               rightBusiness: 0,
//               leftUsers: 0,
//               rightUsers: 0
//             });
//           } else {
//             throw incomeError;
//           }
//         }

//         // Fetch wallet data
//         try {
//           const walletRes = await api.get(`/api/wallet/user/${userId}/wallet`);
//           setWallet(walletRes.data);
//         } catch (walletError) {
//           if (walletError.response && walletError.response.status === 404) {
//             console.warn("Wallet data not found for new user. Setting defaults.");
//             setWallet({
//               incomeWallet: 0,
//               totalTopup: 0
//             });
//           } else {
//             throw walletError;
//           }
//         }
        
//         const userStatusName = profileData.statusInfo?.status || "Inactive";
//         const userRankName = profileData.statusInfo?.rank || null;

//         // Set current status and next status
//         const current = STATUS_TIERS.find((tier) => tier.name === userStatusName) || STATUS_TIERS[0];
//         const currentIndex = STATUS_TIERS.findIndex((tier) => tier.name === current.name);
//         const next = currentIndex < STATUS_TIERS.length - 1 ? STATUS_TIERS[currentIndex + 1] : null;

//         setCurrentStatus(current);
//         setNextStatus(next);

//         // Set current rank and next rank
//         const currentRankTier = RANK_TIERS.find((tier) => tier.title === userRankName) || null;
//         const currentRankIndex = currentRankTier ? RANK_TIERS.findIndex((tier) => tier.title === currentRankTier.title) : -1;
//         const nextRankTier = currentRankIndex < RANK_TIERS.length - 1 ? RANK_TIERS[currentRankIndex + 1] : RANK_TIERS[0];

//         setCurrentRank(currentRankTier);
//         setNextRank(nextRankTier);

//       } catch (err) {
//         console.error("Dashboard data fetch error:", err);
//         setError(err.message || "Failed to load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const formatCurrency = (amount) => {
//     if (amount >= 10000000) {
//       return `₹${(amount / 10000000).toFixed(1)} Cr`;
//     } else if (amount >= 100000) {
//       return `₹${(amount / 100000).toFixed(1)} L`;
//     } else if (amount >= 1000) {
//       return `₹${(amount / 1000).toFixed(1)} K`;
//     }
//     return `₹${amount}`;
//   };

//   const getRankProgress = (rank) => {
//     if (!rank || !businessData) return 0;

//     if (rank.type === "business") {
//       const leftProgress = Math.min((businessData.leftBusiness / rank.leftBusiness) * 100, 100);
//       const rightProgress = Math.min((businessData.rightBusiness / rank.rightBusiness) * 100, 100);
//       return Math.min(leftProgress, rightProgress);
//     } else if (rank.type === "subtree") {
//       const leftProgress = Math.min((businessData.leftUsers / rank.leftUsers) * 100, 100);
//       const rightProgress = Math.min((businessData.rightUsers / rank.rightUsers) * 100, 100);
//       return Math.min(leftProgress, rightProgress);
//     }
//     return 0;
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-danger mt-4" role="alert">
//         {error}
//       </div>
//     );
//   }

//   if (!profile) {
//     return <div>No profile data available</div>;
//   }

//   const userPoints = wallet.totalTopup ? wallet.totalTopup / 100 : 0;
//   const progressPercentage = nextStatus 
//     ? Math.min((userPoints / (nextStatus.requiredTopup / 100)) * 100, 100)
//     : 100;

//   const rankProgressPercentage = getRankProgress(nextRank);

//   return (
//     <div className="p-4">
//       <h2 className="mb-4 fw-bold" style={{ color: '#0A2463' }}>Dashboard Overview</h2>

//       <div className="card mb-4 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
//         <div className="card-body">
//           <div className="row align-items-center">
//             <div className="col-md-4 mb-3 mb-md-0">
//               <div className="d-flex align-items-center">
//                 <div className="me-3">
//                   {profile.basicInfo?.avatar ? (
//                     <Image 
//                       src={profile.basicInfo.avatar} 
//                       alt="User Avatar"
//                       width={80}
//                       height={80}
//                       className="rounded-circle"
//                       style={{ objectFit: 'cover' }}
//                     />
//                   ) : (
//                     <div 
//                       className="rounded-circle d-flex align-items-center justify-content-center"
//                       style={{
//                         width: '80px',
//                         height: '80px',
//                         backgroundColor: '#3A86FF',
//                         color: 'white',
//                         fontSize: '30px',
//                       }}
//                     >
//                       {profile.basicInfo?.name?.charAt(0) || 'U'}
//                     </div>
//                   )}
//                 </div>
//                 <div>
//                   <h4 className="fw-bold mb-1" style={{ color: '#0A2463' }}>
//                     {profile.basicInfo?.name || 'User Name'}
//                   </h4>
//                   <p className="mb-1" style={{ color: '#0A2463' }}>
//                     <strong>Email:</strong> {profile.basicInfo?.email || 'N/A'}
//                   </p>
//                   <p className="mb-0" style={{ color: '#0A2463' }}>
//                     <strong>Status:</strong>
//                     <span className="ms-1" style={{ color: currentStatus.color, fontWeight: '600' }}>
//                       {profile.statusInfo?.status}
//                     </span>
//                   </p>
//                   {profile.statusInfo?.rank && (
//                     <p className="mb-0" style={{ color: '#0A2463' }}>
//                       <strong>Rank:</strong>
//                       <span className="ms-1 fw-semibold" style={{ color: currentRank?.color || '#FF5722' }}>
//                         {profile.statusInfo.rank}
//                       </span>
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4 mb-3 mb-md-0">
//               <div className="border-start ps-4" style={{ borderColor: '#E0E0E0' }}>
//                 <h5 className="fw-bold" style={{ color: '#0A2463' }}>Referral Codes</h5>
//                 <div className="d-flex flex-column">
//                   <div className="mb-2">
//                     <span className="fw-medium" style={{ color: '#0A2463' }}>Left: </span>
//                     <span style={{ color: '#3A86FF' }}>{profile.referralInfo?.referralCodeLeft || 'N/A'}</span>
//                   </div>
//                   <div>
//                     <span className="fw-medium" style={{ color: '#0A2463' }}>Right: </span>
//                     <span style={{ color: '#3A86FF' }}>{profile.referralInfo?.referralCodeRight || 'N/A'}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4">
//               <div className="border-start ps-4" style={{ borderColor: '#E0E0E0' }}>
//                 <h5 className="fw-bold" style={{ color: '#0A2463' }}>Wallet Summary</h5>
//                 <div className="d-flex flex-column">
//                   <div className="mb-2">
//                     <span className="fw-medium" style={{ color: '#0A2463' }}>Income Wallet: </span>
//                     <span className="fw-bold" style={{ color: '#00b894' }}>₹ {wallet.incomeWallet?.toFixed(2) || '0.00'}</span>
//                   </div>
//                   <div>
//                     <span className="fw-medium" style={{ color: '#0A2463' }}>Total Points: </span>
//                     <span className="fw-bold" style={{ color: '#9C27B0' }}>{userPoints.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Financial Overview */}
//       <div className="row mb-4">
//         <div className="col-md-6 mb-4 mb-md-0">
//           <div className="card h-100 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
//             <div className="card-body text-center">
//               <h5 className="fw-bold" style={{ color: '#0A2463' }}>Total Earning</h5>
//               <div className="display-5 fw-bold mt-3" style={{ color: '#3A86FF' }}>
//                 ₹ {incomeStats.totalIncome.toFixed(2)}
//               </div>
//               <p className="text-muted mt-2">Lifetime earnings</p>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-6">
//           <div className="card h-100 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
//             <div className="card-body text-center">
//               <h5 className="fw-bold" style={{ color: '#0A2463' }}>Last Month Earning</h5>
//               <div className="display-5 fw-bold mt-3" style={{ color: '#00b894' }}>
//                 ₹ {incomeStats.monthlyIncome.toFixed(2)}
//               </div>
//               <p className="text-muted mt-2">{incomeStats.monthlyLabel || 'N/A'}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Next Status Achievement */}
//       <div className="card mb-4 shadow-sm" style={{
//         borderRadius: '12px',
//         backgroundColor: nextStatus ? '#f8f9fa' : '#e8f5e9',
//         border: nextStatus ? '1px solid #e0e0e0' : '2px solid #4caf50'
//       }}>
//         <div className="card-body">
//           <h5 className="fw-bold text-center mb-3" style={{ color: '#0A2463' }}>
//             {nextStatus ? 'Next Status Achievement' : 'Highest Status Achieved!'}
//           </h5>

//           {nextStatus ? (
//             <div className="row align-items-center">
//               <div className="col-md-4 text-center mb-3 mb-md-0">
//                 <h4 style={{ color: nextStatus.color, fontWeight: '700' }}>
//                   {nextStatus.name}
//                 </h4>
//                 <p className="mb-0" style={{ fontSize: '0.9rem' }}>
//                   {nextStatus.requiredTopup / 100} points required
//                 </p>
//               </div>

//               <div className="col-md-8">
//                 <div className="mb-3">
//                   <div className="progress-container" style={{
//                     height: '15px',
//                     backgroundColor: '#e9ecef',
//                     borderRadius: '10px',
//                     overflow: 'hidden',
//                     position: 'relative'
//                   }}>
//                     <div className="progress-fill" style={{
//                       height: '100%',
//                       width: `${progressPercentage}%`,
//                       backgroundColor: nextStatus.color,
//                       borderRadius: '10px',
//                     }}></div>
//                     <div style={{
//                       position: 'absolute',
//                       top: '0',
//                       left: '0',
//                       width: '100%',
//                       height: '100%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontWeight: '600',
//                       fontSize: '0.7rem',
//                       color: progressPercentage > 50 ? 'white' : 'black'
//                     }}>
//                       {userPoints.toFixed(2)} / {nextStatus.requiredTopup / 100}
//                     </div>
//                   </div>
//                   <div className="d-flex justify-content-between mt-1">
//                     <small>Your points</small>
//                     <small>Required</small>
//                   </div>
//                 </div>

//                 <div className="row mt-2">
//                   {nextStatus.requiredStatus && (
//                     <div className="col-md-6 mb-2">
//                       <p className="mb-1" style={{ fontWeight: '500' }}>
//                         Required Status:
//                       </p>
//                       <span className="badge" style={{
//                         backgroundColor: '#6c757d',
//                         color: 'white',
//                       }}>
//                         {nextStatus.requiredStatus}
//                       </span>
//                     </div>
//                   )}

//                   {nextStatus.requiredChildren > 0 && (
//                     <div className="col-md-6">
//                       <p className="mb-1" style={{ fontWeight: '500' }}>
//                         Required Referrals:
//                       </p>
//                       <span className="badge" style={{
//                         backgroundColor: nextStatus.color,
//                         color: 'white',
//                       }}>
//                         {nextStatus.requiredChildren} {nextStatus.requiredStatus}
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-3">
//               <i className="fas fa-trophy display-4 mb-3" style={{ color: '#FFD700' }}></i>
//               <h5 style={{ color: '#4caf50' }}>
//                 Congratulations! You've achieved the highest status
//               </h5>
//               <p className="mt-2 mb-0">
//                 <strong>Current Status:</strong> {currentStatus?.name}
//               </p>
//             </div>
//           )}

//           {nextStatus && userPoints < (nextStatus.requiredTopup / 100) && (
//             <div className="text-center mt-3">
//               <span className="text-danger">
//                 Need {(nextStatus.requiredTopup / 100 - userPoints).toFixed(2)} more points
//               </span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Next Rank Achievement */}
//       <div className="card shadow-sm" style={{
//         borderRadius: '12px',
//         backgroundColor: nextRank && currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? '#e8f5e9' : '#f8f9fa',
//         border: nextRank && currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? '2px solid #4caf50' : '1px solid #e0e0e0'
//       }}>
//         <div className="card-body">
//           <h5 className="fw-bold text-center mb-3" style={{ color: '#0A2463' }}>
//             {nextRank && currentRank?.title !== RANK_TIERS[RANK_TIERS.length - 1].title ? 'Next Rank Achievement' : 
//               currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? 'Highest Rank Achieved!' : 
//               'Next Rank Achievement'}
//           </h5>

//           {nextRank && currentRank?.title !== RANK_TIERS[RANK_TIERS.length - 1].title ? (
//             <div className="row align-items-center">
//               <div className="col-md-4 text-center mb-3 mb-md-0">
//                 <h4 style={{ color: nextRank.color, fontWeight: '700' }}>
//                   {nextRank.title}
//                 </h4>
//                 <div className="mt-2">
//                   <div className="badge" style={{
//                     backgroundColor: nextRank.color,
//                     color: 'white',
//                     fontSize: '0.8rem'
//                   }}>
//                     {nextRank.reward.trip}
//                   </div>
//                   <p className="mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
//                     Reward: {formatCurrency(nextRank.reward.cashAmount)}
//                   </p>
//                 </div>
//               </div>

//               <div className="col-md-8">
//                 <div className="mb-3">
//                   <div className="progress-container" style={{
//                     height: '15px',
//                     backgroundColor: '#e9ecef',
//                     borderRadius: '10px',
//                     overflow: 'hidden',
//                     position: 'relative'
//                   }}>
//                     <div className="progress-fill" style={{
//                       height: '100%',
//                       width: `${rankProgressPercentage}%`,
//                       backgroundColor: nextRank.color,
//                       borderRadius: '10px',
//                     }}></div>
//                     <div style={{
//                       position: 'absolute',
//                       top: '0',
//                       left: '0',
//                       width: '100%',
//                       height: '100%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       fontWeight: '600',
//                       fontSize: '0.7rem',
//                       color: rankProgressPercentage > 50 ? 'white' : 'black'
//                     }}>
//                       {rankProgressPercentage.toFixed(1)}%
//                     </div>
//                   </div>
//                   <div className="d-flex justify-content-between mt-1">
//                     <small>Progress</small>
//                     <small>Required</small>
//                   </div>
//                 </div>

//                 <div className="row mt-2">
//                   <div className="col-md-6 mb-2">
//                     <p className="mb-1" style={{ fontWeight: '500' }}>
//                       Required Status:
//                     </p>
//                     <span className="badge" style={{
//                       backgroundColor: '#6c757d',
//                       color: 'white',
//                     }}>
//                       {nextRank.minStatus}
//                     </span>
//                   </div>

//                   {nextRank.type === "business" ? (
//                     <div className="col-md-6">
//                       <p className="mb-1" style={{ fontWeight: '500' }}>
//                         Business Required:
//                       </p>
//                       <div className="d-flex flex-column">
//                         <span className="badge mb-1" style={{
//                           backgroundColor: nextRank.color,
//                           color: 'white',
//                           fontSize: '0.7rem'
//                         }}>
//                           Left: {formatCurrency(nextRank.leftBusiness)}
//                         </span>
//                         <span className="badge" style={{
//                           backgroundColor: nextRank.color,
//                           color: 'white',
//                           fontSize: '0.7rem'
//                         }}>
//                           Right: {formatCurrency(nextRank.rightBusiness)}
//                         </span>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="col-md-6">
//                       <p className="mb-1" style={{ fontWeight: '500' }}>
//                         Users Required:
//                       </p>
//                       <div className="d-flex flex-column">
//                         <span className="badge mb-1" style={{
//                           backgroundColor: nextRank.color,
//                           color: 'white',
//                           fontSize: '0.7rem'
//                         }}>
//                           Left: {nextRank.leftUsers} {nextRank.requiredChildRank}
//                         </span>
//                         <span className="badge" style={{
//                           backgroundColor: nextRank.color,
//                           color: 'white',
//                           fontSize: '0.7rem'
//                         }}>
//                           Right: {nextRank.rightUsers} {nextRank.requiredChildRank}
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ) : currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? (
//             <div className="text-center py-3">
//               <i className="fas fa-crown display-4 mb-3" style={{ color: '#FFD700' }}></i>
//               <h5 style={{ color: '#4caf50' }}>
//                 Congratulations! You've achieved the highest rank
//               </h5>
//               <p className="mt-2 mb-0">
//                 <strong>Current Rank:</strong> {currentRank?.title}
//               </p>
//               <p className="mt-1 mb-0">
//                 <strong>Reward:</strong> {formatCurrency(currentRank?.reward.cashAmount)} + {currentRank?.reward.trip} Trip
//               </p>
//             </div>
//           ) : (
//             <div className="text-center py-3">
//               <i className="fas fa-medal display-4 mb-3" style={{ color: '#FFA500' }}></i>
//               <h5 style={{ color: '#0A2463' }}>
//                 {currentRank ? `Work towards your next rank: ${nextRank?.title}` : `Start your rank journey: ${nextRank?.title}`}
//               </h5>
//               <p className="mt-2 mb-0">
//                 <strong>Target Rank:</strong> {nextRank?.title}
//               </p>
//               <p className="mt-1 mb-0">
//                 <strong>Potential Reward:</strong> {formatCurrency(nextRank?.reward.cashAmount)} + {nextRank?.reward.trip} Trip
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardPage;



import Image from 'next/image';
import { useEffect, useState } from 'react';
import api from '../utils/api';
import { fetchProfile } from '../utils/profileService';

// Define status tiers
const STATUS_TIERS = [
  {
    name: "Consumer",
    requiredTopup: 300,
    requiredChildren: 0,
    requiredStatus: null,
    levelDepth: 3,
    color: "#4CAF50"
  },
  {
    name: "One Star",
    requiredTopup: 1000,
    requiredChildren: 2,
    requiredStatus: "Consumer",
    levelDepth: 5,
    color: "#FFC107"
  },
  {
    name: "Two Star",
    requiredTopup: 5000,
    requiredChildren: 2,
    requiredStatus: "One Star",
    levelDepth: 10,
    color: "#FF9800"
  },
  {
    name: "Three Star",
    requiredTopup: 15000,
    requiredChildren: 3,
    requiredStatus: "Two Star",
    levelDepth: 15,
    color: "#2196F3"
  },
  {
    name: "Four Star",
    requiredTopup: 30000,
    requiredChildren: 5,
    requiredStatus: "Three Star",
    levelDepth: 20,
    color: "#9C27B0"
  },
  {
    name: "Five Star",
    requiredTopup: 50000,
    requiredChildren: 7,
    requiredStatus: "Four Star",
    levelDepth: 30,
    color: "#E91E63"
  },
];

// Define rank tiers
const RANK_TIERS = [
  {
    title: "ASSISTANT SUPERVISOR",
    type: "business",
    leftBusiness: 100000,
    rightBusiness: 100000,
    minStatus: "Two Star",
    reward: {
      cashAmount: 1000,
      trip: "NATIONAL"
    },
    color: "#FF6B35"
  },
  {
    title: "SUPERVISOR",
    type: "business",
    leftBusiness: 500000,
    rightBusiness: 500000,
    minStatus: "Two Star",
    reward: {
      cashAmount: 3000,
      trip: "NATIONAL"
    },
    color: "#F7931E"
  },
  {
    title: "ASSISTANT MANAGER",
    type: "business",
    leftBusiness: 1000000,
    rightBusiness: 1000000,
    minStatus: "Two Star",
    reward: {
      cashAmount: 6000,
      trip: "NATIONAL"
    },
    color: "#FFD23F"
  },
  {
    title: "MANAGER",
    type: "subtree",
    leftUsers: 2,
    rightUsers: 2,
    requiredChildRank: "ASSISTANT MANAGER",
    minStatus: "Three Star",
    reward: {
      cashAmount: 25000,
      trip: "SPECIAL"
    },
    color: "#06FFA5"
  },
  {
    title: "SENIOR MANAGER",
    type: "subtree",
    leftUsers: 3,
    rightUsers: 3,
    requiredChildRank: "MANAGER",
    minStatus: "Four Star",
    reward: {
      cashAmount: 125000,
      trip: "SPECIAL"
    },
    color: "#4ECDC4"
  },
  {
    title: "SOARING MANAGER",
    type: "subtree",
    leftUsers: 3,
    rightUsers: 3,
    requiredChildRank: "SENIOR MANAGER",
    minStatus: "Five Star",
    reward: {
      cashAmount: 1000000,
      trip: "INTERNATIONAL"
    },
    color: "#45B7D1"
  },
  {
    title: "SAPPHIRE MANAGER",
    type: "subtree",
    leftUsers: 4,
    rightUsers: 4,
    requiredChildRank: "SOARING MANAGER",
    minStatus: "Five Star",
    reward: {
      cashAmount: 2500000,
      trip: "INTERNATIONAL"
    },
    color: "#6C5CE7"
  },
  {
    title: "DIAMOND SAPPHIRE MANAGER",
    type: "subtree",
    leftUsers: 5,
    rightUsers: 5,
    requiredChildRank: "SAPPHIRE MANAGER",
    minStatus: "Five Star",
    reward: {
      cashAmount: 6000000,
      trip: "INTERNATIONAL"
    },
    color: "#A29BFE"
  },
  {
    title: "DIAMOND MANAGER",
    type: "subtree",
    leftUsers: 8,
    rightUsers: 8,
    requiredChildRank: "DIAMOND SAPPHIRE MANAGER",
    minStatus: "Five Star",
    reward: {
      cashAmount: 15000000,
      trip: "INTERNATIONAL"
    },
    color: "#FD79A8"
  }
];

const DashboardPage = () => {
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState({
    incomeWallet: 0,
    totalTopup: 0
  });
  const [incomeStats, setIncomeStats] = useState({
    totalIncome: 0,
    monthlyIncome: 0,
    monthlyLabel: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [nextStatus, setNextStatus] = useState(null);
  const [currentRank, setCurrentRank] = useState(null);
  const [nextRank, setNextRank] = useState(null);
  const [businessData, setBusinessData] = useState({
    leftBusiness: 0,
    rightBusiness: 0,
    leftUsers: 0,
    rightUsers: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await fetchProfile();
        setProfile(profileData);

        const userId = profileData.basicInfo?._id;
        if (!userId) {
          throw new Error("User ID not found");
        }

        // Fetch income and business data
        try {
          const incomeRes = await api.get(`/api/income/business/${userId}`);
          const incomeData = incomeRes.data;

          // --- MODIFICATION HERE ---
          // Calculate the previous month's data to display
          const now = new Date();
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, "0")}`;
          const monthlyLabel = lastMonth.toLocaleString("default", { month: "long", year: "numeric" });
          
          const lastMonthEntry = (incomeData.monthlyStats || []).find(
            (stat) => stat.month === lastMonthKey
          );

          setIncomeStats({
            totalIncome: incomeData.totalIncome || 0,
            monthlyIncome: lastMonthEntry?.income || 0,
            monthlyLabel,
          });

          setBusinessData(incomeData.businessData || {
            leftBusiness: 0,
            rightBusiness: 0,
            leftUsers: 0,
            rightUsers: 0
          });

        } catch (incomeError) {
          if (incomeError.response && incomeError.response.status === 404) {
            console.warn("Income and business data not found for new user. Setting defaults.");
            setIncomeStats({
              totalIncome: 0,
              monthlyIncome: 0,
              monthlyLabel: ''
            });
            setBusinessData({
              leftBusiness: 0,
              rightBusiness: 0,
              leftUsers: 0,
              rightUsers: 0
            });
          } else {
            throw incomeError;
          }
        }

        // Fetch wallet data
        try {
          const walletRes = await api.get(`/api/wallet/user/${userId}/wallet`);
          setWallet(walletRes.data);
        } catch (walletError) {
          if (walletError.response && walletError.response.status === 404) {
            console.warn("Wallet data not found for new user. Setting defaults.");
            setWallet({
              incomeWallet: 0,
              totalTopup: 0
            });
          } else {
            throw walletError;
          }
        }
        
        const userStatusName = profileData.statusInfo?.status || "Inactive";
        const userRankName = profileData.statusInfo?.rank || null;

        // Set current status and next status
        const current = STATUS_TIERS.find((tier) => tier.name === userStatusName) || STATUS_TIERS[0];
        const currentIndex = STATUS_TIERS.findIndex((tier) => tier.name === current.name);
        const next = currentIndex < STATUS_TIERS.length - 1 ? STATUS_TIERS[currentIndex + 1] : null;

        setCurrentStatus(current);
        setNextStatus(next);

        // Set current rank and next rank
        const currentRankTier = RANK_TIERS.find((tier) => tier.title === userRankName) || null;
        const currentRankIndex = currentRankTier ? RANK_TIERS.findIndex((tier) => tier.title === currentRankTier.title) : -1;
        const nextRankTier = currentRankIndex < RANK_TIERS.length - 1 ? RANK_TIERS[currentRankIndex + 1] : RANK_TIERS[0];

        setCurrentRank(currentRankTier);
        setNextRank(nextRankTier);

      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)} L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)} K`;
    }
    return `₹${amount}`;
  };

  const getRankProgress = (rank) => {
    if (!rank || !businessData) return 0;

    if (rank.type === "business") {
      const leftProgress = Math.min((businessData.leftBusiness / rank.leftBusiness) * 100, 100);
      const rightProgress = Math.min((businessData.rightBusiness / rank.rightBusiness) * 100, 100);
      return Math.min(leftProgress, rightProgress);
    } else if (rank.type === "subtree") {
      const leftProgress = Math.min((businessData.leftUsers / rank.leftUsers) * 100, 100);
      const rightProgress = Math.min((businessData.rightUsers / rank.rightUsers) * 100, 100);
      return Math.min(leftProgress, rightProgress);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger mt-4" role="alert">
        {error}
      </div>
    );
  }

  if (!profile) {
    return <div>No profile data available</div>;
  }

  const userPoints = wallet.totalTopup ? wallet.totalTopup / 100 : 0;
  const progressPercentage = nextStatus 
    ? Math.min((userPoints / (nextStatus.requiredTopup / 100)) * 100, 100)
    : 100;

  const rankProgressPercentage = getRankProgress(nextRank);

  return (
    <div className="p-4">
      <h2 className="mb-4 fw-bold" style={{ color: '#0A2463' }}>Dashboard Overview</h2>

      <div className="card mb-4 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4 mb-3 mb-md-0">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {profile.basicInfo?.avatar ? (
                    <Image 
                      src={profile.basicInfo.avatar} 
                      alt="User Avatar"
                      width={80}
                      height={80}
                      className="rounded-circle"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#3A86FF',
                        color: 'white',
                        fontSize: '30px',
                      }}
                    >
                      {profile.basicInfo?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="fw-bold mb-1" style={{ color: '#0A2463' }}>
                    {profile.basicInfo?.name || 'User Name'}
                  </h4>
                  <p className="mb-1" style={{ color: '#0A2463' }}>
                    <strong>Email:</strong> {profile.basicInfo?.email || 'N/A'}
                  </p>
                  <p className="mb-0" style={{ color: '#0A2463' }}>
                    <strong>Status:</strong>
                    <span className="ms-1" style={{ color: currentStatus.color, fontWeight: '600' }}>
                      {profile.statusInfo?.status}
                    </span>
                  </p>
                  {profile.statusInfo?.rank && (
                    <p className="mb-0" style={{ color: '#0A2463' }}>
                      <strong>Rank:</strong>
                      <span className="ms-1 fw-semibold" style={{ color: currentRank?.color || '#FF5722' }}>
                        {profile.statusInfo.rank}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3 mb-md-0">
              <div className="border-start ps-4" style={{ borderColor: '#E0E0E0' }}>
                <h5 className="fw-bold" style={{ color: '#0A2463' }}>Referral Codes</h5>
                <div className="d-flex flex-column">
                  <div className="mb-2">
                    <span className="fw-medium" style={{ color: '#0A2463' }}>Left: </span>
                    <span style={{ color: '#3A86FF' }}>{profile.referralInfo?.referralCodeLeft || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="fw-medium" style={{ color: '#0A2463' }}>Right: </span>
                    <span style={{ color: '#3A86FF' }}>{profile.referralInfo?.referralCodeRight || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="border-start ps-4" style={{ borderColor: '#E0E0E0' }}>
                <h5 className="fw-bold" style={{ color: '#0A2463' }}>Wallet Summary</h5>
                <div className="d-flex flex-column">
                  <div className="mb-2">
                    <span className="fw-medium" style={{ color: '#0A2463' }}>Income Wallet: </span>
                    <span className="fw-bold" style={{ color: '#00b894' }}>₹ {wallet.incomeWallet?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div>
                    <span className="fw-medium" style={{ color: '#0A2463' }}>Total Points: </span>
                    <span className="fw-bold" style={{ color: '#9C27B0' }}>{userPoints.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="row mb-4">
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="card h-100 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
            <div className="card-body text-center">
              <h5 className="fw-bold" style={{ color: '#0A2463' }}>Total Earning</h5>
              <div className="display-5 fw-bold mt-3" style={{ color: '#3A86FF' }}>
                ₹ {incomeStats.totalIncome.toFixed(2)}
              </div>
              <p className="text-muted mt-2">Lifetime earnings</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100 shadow-sm" style={{ borderRadius: '12px', backgroundColor: 'white' }}>
            <div className="card-body text-center">
              <h5 className="fw-bold" style={{ color: '#0A2463' }}>Last Month Earning</h5>
              <div className="display-5 fw-bold mt-3" style={{ color: '#00b894' }}>
                ₹ {incomeStats.monthlyIncome.toFixed(2)}
              </div>
              <p className="text-muted mt-2">{incomeStats.monthlyLabel || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Status Achievement */}
      <div className="card mb-4 shadow-sm" style={{
        borderRadius: '12px',
        backgroundColor: nextStatus ? '#f8f9fa' : '#e8f5e9',
        border: nextStatus ? '1px solid #e0e0e0' : '2px solid #4caf50'
      }}>
        <div className="card-body">
          <h5 className="fw-bold text-center mb-3" style={{ color: '#0A2463' }}>
            {nextStatus ? 'Next Status Achievement' : 'Highest Status Achieved!'}
          </h5>

          {nextStatus ? (
            <div className="row align-items-center">
              <div className="col-md-4 text-center mb-3 mb-md-0">
                <h4 style={{ color: nextStatus.color, fontWeight: '700' }}>
                  {nextStatus.name}
                </h4>
                <p className="mb-0" style={{ fontSize: '0.9rem' }}>
                  {nextStatus.requiredTopup / 100} points required
                </p>
              </div>

              <div className="col-md-8">
                <div className="mb-3">
                  <div className="progress-container" style={{
                    height: '15px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div className="progress-fill" style={{
                      height: '100%',
                      width: `${progressPercentage}%`,
                      backgroundColor: nextStatus.color,
                      borderRadius: '10px',
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '0.7rem',
                      color: progressPercentage > 50 ? 'white' : 'black'
                    }}>
                      {userPoints.toFixed(2)} / {nextStatus.requiredTopup / 100}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <small>Your points</small>
                    <small>Required</small>
                  </div>
                </div>

                <div className="row mt-2">
                  {nextStatus.requiredStatus && (
                    <div className="col-md-6 mb-2">
                      <p className="mb-1" style={{ fontWeight: '500' }}>
                        Required Status:
                      </p>
                      <span className="badge" style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                      }}>
                        {nextStatus.requiredStatus}
                      </span>
                    </div>
                  )}

                  {nextStatus.requiredChildren > 0 && (
                    <div className="col-md-6">
                      <p className="mb-1" style={{ fontWeight: '500' }}>
                        Required Referrals:
                      </p>
                      <span className="badge" style={{
                        backgroundColor: nextStatus.color,
                        color: 'white',
                      }}>
                        {nextStatus.requiredChildren} {nextStatus.requiredStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <i className="fas fa-trophy display-4 mb-3" style={{ color: '#FFD700' }}></i>
              <h5 style={{ color: '#4caf50' }}>
                Congratulations! You've achieved the highest status
              </h5>
              <p className="mt-2 mb-0">
                <strong>Current Status:</strong> {currentStatus?.name}
              </p>
            </div>
          )}

          {nextStatus && userPoints < (nextStatus.requiredTopup / 100) && (
            <div className="text-center mt-3">
              <span className="text-danger">
                Need {(nextStatus.requiredTopup / 100 - userPoints).toFixed(2)} more points
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Next Rank Achievement */}
      <div className="card shadow-sm" style={{
        borderRadius: '12px',
        backgroundColor: nextRank && currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? '#e8f5e9' : '#f8f9fa',
        border: nextRank && currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? '2px solid #4caf50' : '1px solid #e0e0e0'
      }}>
        <div className="card-body">
          <h5 className="fw-bold text-center mb-3" style={{ color: '#0A2463' }}>
            {nextRank && currentRank?.title !== RANK_TIERS[RANK_TIERS.length - 1].title ? 'Next Rank Achievement' : 
              currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? 'Highest Rank Achieved!' : 
              'Next Rank Achievement'}
          </h5>

          {nextRank && currentRank?.title !== RANK_TIERS[RANK_TIERS.length - 1].title ? (
            <div className="row align-items-center">
              <div className="col-md-4 text-center mb-3 mb-md-0">
                <h4 style={{ color: nextRank.color, fontWeight: '700' }}>
                  {nextRank.title}
                </h4>
                <div className="mt-2">
                  <div className="badge" style={{
                    backgroundColor: nextRank.color,
                    color: 'white',
                    fontSize: '0.8rem'
                  }}>
                    {nextRank.reward.trip}
                  </div>
                  <p className="mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                    Reward: {formatCurrency(nextRank.reward.cashAmount)}
                  </p>
                </div>
              </div>

              <div className="col-md-8">
                <div className="mb-3">
                  <div className="progress-container" style={{
                    height: '15px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <div className="progress-fill" style={{
                      height: '100%',
                      width: `${rankProgressPercentage}%`,
                      backgroundColor: nextRank.color,
                      borderRadius: '10px',
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '0.7rem',
                      color: rankProgressPercentage > 50 ? 'white' : 'black'
                    }}>
                      {rankProgressPercentage.toFixed(1)}%
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <small>Progress</small>
                    <small>Required</small>
                  </div>
                </div>

                <div className="row mt-2">
                  <div className="col-md-6 mb-2">
                    <p className="mb-1" style={{ fontWeight: '500' }}>
                      Required Status:
                    </p>
                    <span className="badge" style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                    }}>
                      {nextRank.minStatus}
                    </span>
                  </div>

                  {nextRank.type === "business" ? (
                    <div className="col-md-6">
                      <p className="mb-1" style={{ fontWeight: '500' }}>
                        Business Required:
                      </p>
                      <div className="d-flex flex-column">
                        <span className="badge mb-1" style={{
                          backgroundColor: nextRank.color,
                          color: 'white',
                          fontSize: '0.7rem'
                        }}>
                          Left: {formatCurrency(nextRank.leftBusiness)}
                        </span>
                        <span className="badge" style={{
                          backgroundColor: nextRank.color,
                          color: 'white',
                          fontSize: '0.7rem'
                        }}>
                          Right: {formatCurrency(nextRank.rightBusiness)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="col-md-6">
                      <p className="mb-1" style={{ fontWeight: '500' }}>
                        Users Required:
                      </p>
                      <div className="d-flex flex-column">
                        <span className="badge mb-1" style={{
                          backgroundColor: nextRank.color,
                          color: 'white',
                          fontSize: '0.7rem'
                        }}>
                          Left: {nextRank.leftUsers} {nextRank.requiredChildRank}
                        </span>
                        <span className="badge" style={{
                          backgroundColor: nextRank.color,
                          color: 'white',
                          fontSize: '0.7rem'
                        }}>
                          Right: {nextRank.rightUsers} {nextRank.requiredChildRank}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : currentRank?.title === RANK_TIERS[RANK_TIERS.length - 1].title ? (
            <div className="text-center py-3">
              <i className="fas fa-crown display-4 mb-3" style={{ color: '#FFD700' }}></i>
              <h5 style={{ color: '#4caf50' }}>
                Congratulations! You've achieved the highest rank
              </h5>
              <p className="mt-2 mb-0">
                <strong>Current Rank:</strong> {currentRank?.title}
              </p>
              <p className="mt-1 mb-0">
                <strong>Reward:</strong> {formatCurrency(currentRank?.reward.cashAmount)} + {currentRank?.reward.trip} Trip
              </p>
            </div>
          ) : (
            <div className="text-center py-3">
              <i className="fas fa-medal display-4 mb-3" style={{ color: '#FFA500' }}></i>
              <h5 style={{ color: '#0A2463' }}>
                {currentRank ? `Work towards your next rank: ${nextRank?.title}` : `Start your rank journey: ${nextRank?.title}`}
              </h5>
              <p className="mt-2 mb-0">
                <strong>Target Rank:</strong> {nextRank?.title}
              </p>
              <p className="mt-1 mb-0">
                <strong>Potential Reward:</strong> {formatCurrency(nextRank?.reward.cashAmount)} + {nextRank?.reward.trip} Trip
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;