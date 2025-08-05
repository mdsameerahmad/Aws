
// import axios from 'axios';
// import { useEffect, useState } from "react";
// import api from '../../utils/api';
// import { fetchProfile } from '../../utils/profileService';

// export default function WalletPage() {
//   const [userId, setUserId] = useState(null);
//   const [totalIncome, setTotalIncome] = useState(0);
//   const [monthlyIncome, setMonthlyIncome] = useState(0);
//   const [topupWallet, setTopupWallet] = useState(0);
//   const [incomeWallet, setIncomeWallet] = useState(0);
//   const [shoppingWallet, setShoppingWallet] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [topupAmount, setTopupAmount] = useState('');
//   const [withdrawAmount, setWithdrawAmount] = useState('');
//   const [topupStatus, setTopupStatus] = useState(null);
//   const [withdrawStatus, setWithdrawStatus] = useState(null);

//   useEffect(() => {
//     const savedUser = localStorage.getItem('userProfileData');
//     let foundId = null;

//     if (savedUser) {
//       const parsed = JSON.parse(savedUser);
//       if (parsed._id) foundId = parsed._id;
//       else if (parsed.basicInfo && parsed.basicInfo._id) foundId = parsed.basicInfo._id;
//     }

//     const fetchIncomeData = async (uid) => {
//       try {
//         const incomeRes = await axios.get(`http://43.205.120.48:5000/api/income/business/${uid}`);
//         const incomeData = incomeRes.data || {};

//         setTotalIncome(incomeData.totalIncome || 0);

//         const now = new Date();
//         const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

//         const currentMonthEntry = (Array.isArray(incomeData.monthlyStats) ? incomeData.monthlyStats : []).find(
//           (stat) => stat.month === currentMonthKey
//         );

//         setMonthlyIncome(currentMonthEntry?.income || 0);
//       } catch (err) {
//         console.error('❌ Error fetching income data:', err);
//         setTotalIncome(0);
//         setMonthlyIncome(0);
//       }
//     };

//     const ensureWallet = async () => {
//       try {
//         console.log('Ensuring wallet exists for user...');
//         await api.post('/api/wallet/user/ensure-wallet');
//         console.log('Wallet existence verified');
//       } catch (err) {
//         console.error('❌ Error ensuring wallet exists:', err);
//       }
//     };

//     const fetchWallet = async (uid) => {
//       try {
//         // First ensure the wallet exists
//         await ensureWallet();
        
//         const walletRes = await api.get(`/api/wallet/user/${uid}/wallet`);
//         const data = walletRes.data || {};
//         setIncomeWallet(data.incomeWallet || 0);
//         setTopupWallet(data.topupWallet || 0);
//         setShoppingWallet(data.shoppingWallet || 0);
//       } catch (err) {
//         console.error("❌ Wallet fetch error:", err);
//         setIncomeWallet(0);
//         setTopupWallet(0);
//         setShoppingWallet(0);
//         if (err.response?.status === 401) {
//           window.location.href = '/login';
//         }
//       }
//     };

//     const init = async (id) => {
//       setUserId(id);
//       await fetchIncomeData(id);
//       await fetchWallet(id);
//       setLoading(false);
//     };

//     if (foundId) {
//       init(foundId);
//     } else {
//       fetchProfile()
//         .then((profile) => {
//           const id = profile?.basicInfo?._id;
//           if (id) init(id);
//         })
//         .catch((err) => {
//           console.error('❌ Failed to fetch profile:', err);
//           setLoading(false);
//         });
//     }
//   }, []);

//   const handleTopupRequest = async () => {
//     if (!topupAmount || isNaN(topupAmount) || Number(topupAmount) <= 0) {
//       setTopupStatus("❌ Please enter a valid amount.");
//       return;
//     }

//     try {
//       // Ensure wallet exists before submitting request
//       try {
//         await api.post('/api/wallet/user/ensure-wallet');
//       } catch (err) {
//         console.error('Error ensuring wallet exists:', err);
//         // Continue anyway, as the topup-request endpoint should handle wallet creation
//       }
      
//       const res = await api.post('/api/wallet/user/topup-request', {
//         amount: Number(topupAmount),
//         note: "User top-up request",
//       });

//       setTopupStatus("✅ Top-up request sent successfully!");
//       setTopupAmount('');

//       if (userId) {
//         const walletRes = await api.get(`/api/wallet/user/${userId}/wallet`);
//         const data = walletRes.data || {};
//         setTopupWallet(data.topupWallet || 0);
//         setIncomeWallet(data.incomeWallet || 0);
//         setShoppingWallet(data.shoppingWallet || 0);
//       }

//     } catch (err) {
//       console.error("Top-up request error:", err);
//       const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
//       setTopupStatus(`❌ Failed to send request: ${errorMessage}`);
//     }
//   };

//   const handleWithdrawRequest = async () => {
//     if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
//       setWithdrawStatus("❌ Please enter a valid amount.");
//       return;
//     }

//     try {
//       // Ensure wallet exists before submitting request
//       try {
//         await api.post('/api/wallet/user/ensure-wallet');
//       } catch (err) {
//         console.error('Error ensuring wallet exists:', err);
//         // Continue anyway, as the withdraw-request endpoint should handle wallet creation
//       }
      
//       const res = await api.post('/api/wallet/user/withdraw-request', {
//         amount: Number(withdrawAmount),
//         note: "User withdraw request",
//       });

//       setWithdrawStatus("✅ Withdraw request sent successfully!");
//       setWithdrawAmount('');

//       if (userId) {
//         const walletRes = await api.get(`/api/wallet/user/${userId}/wallet`);
//         const data = walletRes.data || {};
//         setTopupWallet(data.topupWallet || 0);
//         setIncomeWallet(data.incomeWallet || 0);
//         setShoppingWallet(data.shoppingWallet || 0);
//       }

//     } catch (err) {
//       console.error("Withdraw request error:", err);
//       const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
//       setWithdrawStatus(`❌ Failed to send request: ${errorMessage}`);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   const cardStyle = (gradient) => ({
//     flex: "1",
//     padding: "1.5rem",
//     borderRadius: "16px",
//     background: gradient || "#fff",
//     boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
//     color: "#fff",
//     textAlign: "center",
//     minWidth: "280px",
//     marginBottom: "1rem",
//     transition: "transform 0.3s ease",
//   });

//   const formContainerStyle = {
//     marginTop: "1rem",
//     paddingTop: "1rem",
//     borderTop: "1px solid rgba(255,255,255,0.3)"
//   };

//   const inputStyle = {
//     width: "100%",
//     padding: "0.6rem",
//     borderRadius: "8px",
//     border: "1px solid #ccc",
//     marginBottom: "0.8rem",
//     fontSize: "1rem"
//   };

//   const buttonStyle = {
//     width: "100%",
//     background: "#ffffff",
//     color: "#0A2463",
//     padding: "0.6rem",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontWeight: "bold",
//     transition: "0.3s ease",
//   };

//   return (
//     <div style={{ padding: "2rem", fontFamily: "'Segoe UI', sans-serif" }}>
//       <h2 style={{ marginBottom: "1.5rem", color: "#0A2463", fontWeight: "700", fontSize: "2rem" }}>
//         💼 Wallet Overview
//       </h2>

//       {/* Income Section */}
//       <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
//         <div style={cardStyle("linear-gradient(135deg, #3A86FF, #0077ff)")}>
//           <h4>Total Income</h4>
//           <p style={{ fontSize: "2.2rem", fontWeight: "bold", marginTop: "0.5rem" }}>
//             ₹ {totalIncome.toFixed(2)}
//           </p>
//         </div>

//         <div style={cardStyle("linear-gradient(135deg, #00b894, #00d084)")}>
//           <h4>Monthly Income</h4>
//           <p style={{ fontSize: "2.2rem", fontWeight: "bold", marginTop: "0.5rem" }}>
//             ₹ {monthlyIncome.toFixed(2)}
//           </p>
//         </div>
//       </div>

//       {/* Wallet Section */}
//       <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
//         <div style={cardStyle("linear-gradient(135deg, #6a11cb, #2575fc)")}>
//           <h5>Income Wallet</h5>
//           <p style={{ fontSize: "1.8rem", fontWeight: "bold" }}>₹ {incomeWallet.toFixed(2)}</p>

//           <div style={formContainerStyle}>
//             <h6 style={{ marginBottom: "0.5rem" }}>Withdraw Funds</h6>
//             <input
//               type="number"
//               placeholder="Enter amount"
//               value={withdrawAmount}
//               onChange={(e) => setWithdrawAmount(e.target.value)}
//               style={inputStyle}
//             />
//             <button
//               onClick={handleWithdrawRequest}
//               style={buttonStyle}
//               disabled={!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0}
//             >
//               Request Amount
//             </button>
//             {withdrawStatus && (
//               <p style={{
//                 marginTop: "0.5rem",
//                 color: withdrawStatus.includes("❌") ? "#ffcdd2" : "#c8e6c9",
//                 fontSize: "0.9rem"
//               }}>
//                 {withdrawStatus}
//               </p>
//             )}
//           </div>
//         </div>

//         <div style={cardStyle("linear-gradient(135deg, #00c6ff, #0072ff)")}>
//           <h5>Top-up Wallet</h5>
//           <p style={{ fontSize: "1.8rem", fontWeight: "bold" }}>₹ {topupWallet.toFixed(2)}</p>

//           <div style={formContainerStyle}>
//             <h6 style={{ marginBottom: "0.5rem" }}>Request Top-up</h6>
//             <input
//               type="number"
//               placeholder="Enter amount"
//               value={topupAmount}
//               onChange={(e) => setTopupAmount(e.target.value)}
//               style={inputStyle}
//             />
//             <button
//               onClick={handleTopupRequest}
//               style={buttonStyle}
//               disabled={!topupAmount || isNaN(topupAmount) || Number(topupAmount) <= 0}
//             >
//               Request Amount
//             </button>
//             {topupStatus && (
//               <p style={{
//                 marginTop: "0.5rem",
//                 color: topupStatus.includes("❌") ? "#ffcdd2" : "#c8e6c9",
//                 fontSize: "0.9rem"
//               }}>
//                 {topupStatus}
//               </p>
//             )}
//           </div>
//         </div>

//         <div style={cardStyle("linear-gradient(135deg, #ff9966, #ff5e62)")}>
//           <h5>Shopping Wallet</h5>
//           <p style={{ fontSize: "1.8rem", fontWeight: "bold" }}>₹ {shoppingWallet.toFixed(2)}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
import axios from 'axios';
import dotenv from 'dotenv';
import { useEffect, useState } from "react";
import api from '../../utils/api';
import { fetchProfile } from '../../utils/profileService';
dotenv.config();

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function WalletPage() {
  const [userId, setUserId] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [topupWallet, setTopupWallet] = useState(0);
  const [incomeWallet, setIncomeWallet] = useState(0);
  const [shoppingWallet, setShoppingWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [topupStatus, setTopupStatus] = useState(null);
  const [withdrawStatus, setWithdrawStatus] = useState(null);

  // WhatsApp notification helper function
  const openWhatsAppNotification = (amount, type) => {
    const phone = "7859086070"; // Admin's WhatsApp number
    const action = type === 'topup' ? 'requested' : 'requested a withdrawal of';
    const walletType = type === 'topup' ? 'top-up' : 'income wallet';
    
    const message = `Hey Admin! I just ${action} ₹${amount} (${walletType}) on the website. Please approve it so I can do business 😊`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('userProfileData');
    let foundId = null;

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed._id) foundId = parsed._id;
      else if (parsed.basicInfo && parsed.basicInfo._id) foundId = parsed.basicInfo._id;
    }

    const fetchIncomeData = async (uid) => {
      try {
        const incomeRes = await axios.get(`${NEXT_PUBLIC_API_URL}/api/income/business/${uid}`);
        const incomeData = incomeRes.data || {};

        setTotalIncome(incomeData.totalIncome || 0);

        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const currentMonthEntry = (Array.isArray(incomeData.monthlyStats) ? incomeData.monthlyStats : []).find(
          (stat) => stat.month === currentMonthKey
        );

        setMonthlyIncome(currentMonthEntry?.income || 0);
      } catch (err) {
        console.error('❌ Error fetching income data:', err);
        setTotalIncome(0);
        setMonthlyIncome(0);
      }
    };

    const ensureWallet = async () => {
      try {
        console.log('Ensuring wallet exists for user...');
        await api.post('/api/wallet/user/ensure-wallet');
        console.log('Wallet existence verified');
      } catch (err) {
        console.error('❌ Error ensuring wallet exists:', err);
      }
    };

    const fetchWallet = async (uid) => {
      try {
        // First ensure the wallet exists
        await ensureWallet();
        
        const walletRes = await api.get(`/api/wallet/user/${uid}/wallet`);
        const data = walletRes.data || {};
        setIncomeWallet(data.incomeWallet || 0);
        setTopupWallet(data.topupWallet || 0);
        setShoppingWallet(data.shoppingWallet || 0);
      } catch (err) {
        console.error("❌ Wallet fetch error:", err);
        setIncomeWallet(0);
        setTopupWallet(0);
        setShoppingWallet(0);
        if (err.response?.status === 401) {
          window.location.href = '/login';
        }
      }
    };

    const init = async (id) => {
      setUserId(id);
      await fetchIncomeData(id);
      await fetchWallet(id);
      setLoading(false);
    };

    if (foundId) {
      init(foundId);
    } else {
      fetchProfile()
        .then((profile) => {
          const id = profile?.basicInfo?._id;
          if (id) init(id);
        })
        .catch((err) => {
          console.error('❌ Failed to fetch profile:', err);
          setLoading(false);
        });
    }
  }, []);

  const handleTopupRequest = async () => {
    if (!topupAmount || isNaN(topupAmount) || Number(topupAmount) <= 0) {
      setTopupStatus("❌ Please enter a valid amount.");
      return;
    }

    try {
      // Ensure wallet exists before submitting request
      try {
        await api.post('/api/wallet/user/ensure-wallet');
      } catch (err) {
        console.error('Error ensuring wallet exists:', err);
      }
      
      const res = await api.post('/api/wallet/user/topup-request', {
        amount: Number(topupAmount),
        note: "User top-up request",
      });

      setTopupStatus("✅ Top-up request sent successfully!");
      setTopupAmount('');

      // Open WhatsApp notification for admin
      openWhatsAppNotification(topupAmount, 'topup');

      if (userId) {
        const walletRes = await api.get(`/api/wallet/user/${userId}/wallet`);
        const data = walletRes.data || {};
        setTopupWallet(data.topupWallet || 0);
        setIncomeWallet(data.incomeWallet || 0);
        setShoppingWallet(data.shoppingWallet || 0);
      }

    } catch (err) {
      console.error("Top-up request error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      setTopupStatus(`❌ Failed to send request: ${errorMessage}`);
    }
  };

  const handleWithdrawRequest = async () => {
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
      setWithdrawStatus("❌ Please enter a valid amount.");
      return;
    }

    try {
      // Ensure wallet exists before submitting request
      try {
        await api.post('/api/wallet/user/ensure-wallet');
      } catch (err) {
        console.error('Error ensuring wallet exists:', err);
      }
      
      const res = await api.post('/api/wallet/user/withdraw-request', {
        amount: Number(withdrawAmount),
        note: "User withdraw request",
      });

      setWithdrawStatus("✅ Withdraw request sent successfully!");
      setWithdrawAmount('');

      // Open WhatsApp notification for admin
      openWhatsAppNotification(withdrawAmount, 'withdraw');

      if (userId) {
        const walletRes = await api.get(`/api/wallet/user/${userId}/wallet`);
        const data = walletRes.data || {};
        setTopupWallet(data.topupWallet || 0);
        setIncomeWallet(data.incomeWallet || 0);
        setShoppingWallet(data.shoppingWallet || 0);
      }

    } catch (err) {
      console.error("Withdraw request error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      setWithdrawStatus(`❌ Failed to send request: ${errorMessage}`);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const cardStyle = (gradient) => ({
    flex: "1",
    padding: "1.5rem",
    borderRadius: "16px",
    background: gradient || "#fff",
    boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
    color: "#fff",
    textAlign: "center",
    minWidth: "280px",
    marginBottom: "1rem",
    transition: "transform 0.3s ease",
  });

  const formContainerStyle = {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(255,255,255,0.3)"
  };

  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginBottom: "0.8rem",
    fontSize: "1rem"
  };

  const buttonStyle = {
    width: "100%",
    background: "#ffffff",
    color: "#0A2463",
    padding: "0.6rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s ease",
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ marginBottom: "1.5rem", color: "#0A2463", fontWeight: "700", fontSize: "2rem" }}>
        💼 Wallet Overview
      </h2>

      {/* Income Section */}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
        <div style={cardStyle("linear-gradient(135deg, #3A86FF, #0077ff)")}>
          <h4>Total Income</h4>
          <p style={{ fontSize: "2.2rem", fontWeight: "bold", marginTop: "0.5rem" }}>
            ₹ {totalIncome.toFixed(2)}
          </p>
        </div>

        <div style={cardStyle("linear-gradient(135deg, #00b894, #00d084)")}>
          <h4>Monthly Income</h4>
          <p style={{ fontSize: "2.2rem", fontWeight: "bold", marginTop: "0.5rem" }}>
            ₹ {monthlyIncome.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Wallet Section */}
      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        <div style={cardStyle("linear-gradient(135deg, #6a11cb, #2575fc)")}>
          <h5>Income Wallet</h5>
          <p style={{ fontSize: "1.8rem", fontWeight: "bold" }}>₹ {incomeWallet.toFixed(2)}</p>

          <div style={formContainerStyle}>
            <h6 style={{ marginBottom: "0.5rem" }}>Withdraw Funds</h6>
            <input
              type="number"
              placeholder="Enter amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={handleWithdrawRequest}
              style={buttonStyle}
              disabled={!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0}
            >
              Request Amount
            </button>
            {withdrawStatus && (
              <p style={{
                marginTop: "0.5rem",
                color: withdrawStatus.includes("❌") ? "#ffcdd2" : "#c8e6c9",
                fontSize: "0.9rem"
              }}>
                {withdrawStatus}
              </p>
            )}
          </div>
        </div>

        <div style={cardStyle("linear-gradient(135deg, #00c6ff, #0072ff)")}>
          <h5>Top-up Wallet</h5>
          <p style={{ fontSize: "1.8rem", fontWeight: "bold" }}>₹ {topupWallet.toFixed(2)}</p>

          <div style={formContainerStyle}>
            <h6 style={{ marginBottom: "0.5rem" }}>Request Top-up</h6>
            <input
              type="number"
              placeholder="Enter amount"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={handleTopupRequest}
              style={buttonStyle}
              disabled={!topupAmount || isNaN(topupAmount) || Number(topupAmount) <= 0}
            >
              Request Amount
            </button>
            {topupStatus && (
              <p style={{
                marginTop: "0.5rem",
                color: topupStatus.includes("❌") ? "#ffcdd2" : "#c8e6c9",
                fontSize: "0.9rem"
              }}>
                {topupStatus}
              </p>
            )}
          </div>
        </div>

        <div style={cardStyle("linear-gradient(135deg, #ff9966, #ff5e62)")}>
          <h5>Shopping Wallet</h5>
          <p style={{ fontSize: "1.8rem", fontWeight: "bold" }}>₹ {shoppingWallet.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}