// export default StatusPage;
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { fetchProfile } from "../../utils/profileService";

const STATUS_TIERS = [
  {
    name: "Consumer",
    requiredTopup: 300,
    requiredChildren: 0,
    requiredStatus: null,
    levelDepth: 3,
    color: "#4CAF50",
  },
  {
    name: "One Star",
    requiredTopup: 1000,
    requiredChildren: 2,
    requiredStatus: "Consumer",
    levelDepth: 5,
    color: "#FFC107",
  },
  {
    name: "Two Star",
    requiredTopup: 5000,
    requiredChildren: 2,
    requiredStatus: "One Star",
    levelDepth: 10,
    color: "#FF9800",
  },
  {
    name: "Three Star",
    requiredTopup: 15000,
    requiredChildren: 3,
    requiredStatus: "Two Star",
    levelDepth: 15,
    color: "#2196F3",
  },
  {
    name: "Four Star",
    requiredTopup: 30000,
    requiredChildren: 5,
    requiredStatus: "Three Star",
    levelDepth: 20,
    color: "#9C27B0",
  },
  {
    name: "Five Star",
    requiredTopup: 50000,
    requiredChildren: 7,
    requiredStatus: "Four Star",
    levelDepth: 30,
    color: "#E91E63",
  },
];

const StatusPage = () => {
const [userPoints, setUserPoints] = useState(0);
const [loading, setLoading] = useState(true);
const [userId, setUserId] = useState(null);
const [currentStatus, setCurrentStatus] = useState(null);  // ✅ added
const [nextStatus, setNextStatus] = useState(null);        // ✅ added


  useEffect(() => {
    const savedUser = localStorage.getItem("userProfileData");
    let foundId = null;
    let userStatusFromDB = null;

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed._id) foundId = parsed._id;
      else if (parsed.basicInfo && parsed.basicInfo._id)
        foundId = parsed.basicInfo._id;

      // ✅ get status from profile
      userStatusFromDB = parsed?.referralInfo?.status || null;
    }

    const fetchWallet = async (uid, status) => {
      try {
        const walletRes = await api.get(`/api/wallet/user/${uid}/wallet`);
        const data = walletRes.data || {};
        const points = (data.totalTopup || 0) / 100; // ₹100 = 1 point
        setUserPoints(points);

        // ✅ Find current tier from user's DB status
        const current =
          STATUS_TIERS.find((tier) => tier.name === status) || STATUS_TIERS[0];
        const currentIndex = STATUS_TIERS.findIndex(
          (tier) => tier.name === current.name
        );
        const next =
          currentIndex < STATUS_TIERS.length - 1
            ? STATUS_TIERS[currentIndex + 1]
            : null;

        setCurrentStatus(current);
        setNextStatus(next);
      } catch (err) {
        console.error("❌ Wallet fetch error:", err);
        setUserPoints(0);
        setCurrentStatus(STATUS_TIERS[0]);
        setNextStatus(STATUS_TIERS[1]);
        if (err.response?.status === 401) {
          window.location.href = "/login";
        }
      }
    };

    const init = async (id) => {
      setUserId(id);
      if (userStatusFromDB) {
        await fetchWallet(id, userStatusFromDB);
        setLoading(false);
      } else {
        const profile = await fetchProfile();
        const status = profile?.statusInfo?.status || "Inactive";
        await fetchWallet(id, status);
        setLoading(false);
      }
    };

    if (foundId) {
      init(foundId);
    } else {
      fetchProfile()
        .then((profile) => {
          const id = profile?.basicInfo?._id;
          const status = profile?.statusInfo?.status || "Inactive";
          if (id) init(id, status);
        })
        .catch((err) => {
          console.error("❌ Failed to fetch profile:", err);
          setLoading(false);
        });
    }
  }, []);

const TierCard = ({ tier }) => {
  const requiredPoints = tier.requiredTopup / 100;
  const hasEnoughPoints = userPoints >= requiredPoints;
  const progressPercentage = hasEnoughPoints
    ? 100
    : Math.min((userPoints / requiredPoints) * 100, 100);

  const isUserTier = currentStatus?.name === tier.name;

  const getBenefits = () => {
    switch (tier.name) {
      case "Consumer":
        return [`Direct bonus upto ${tier.levelDepth} level`];
      case "One Star":
        return [
          `Direct bonus upto ${tier.levelDepth} level`,
          "Matching income upto 50:50",
        ];
      case "Two Star":
        return [
          `Direct bonus upto ${tier.levelDepth} level`,
          "Matching income upto 100:100",
          "Reward upto assistant manager",
        ];
      case "Three Star":
        return [
          `Direct bonus upto ${tier.levelDepth} level`,
          "Matching income upto 200:200",
          "Reward upto manager",
        ];
      case "Four Star":
        return [
          `Direct bonus upto ${tier.levelDepth} level`,
          "Matching income upto 1000:1000",
          "Reward upto manager",
        ];
      case "Five Star":
        return [
          `Direct bonus upto ${tier.levelDepth} level`,
          "Matching income upto 3000:3000",
          "Reward upto manager",
        ];
      default:
        return [];
    }
  };

  return (
    <div className="col-md-6 mb-4">
      <div
        className="card h-100 p-3"
        style={{
          backgroundColor: isUserTier ? "#e8f5e9" : "white",
          border: isUserTier
            ? `2px solid ${tier.color}`
            : "1px solid #e0e0e0",
          transition: "all 0.3s ease",
        }}
      >
        <div className="card-body">
          <h5
            className="card-title mb-3"
            style={{
              fontWeight: "bold",
              fontSize: "1.25rem",
              color: tier.color,
            }}
          >
            {tier.name} : {requiredPoints} points
          </h5>

          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span>Points required:</span>
              <span style={{ fontWeight: "600" }}>{requiredPoints}</span>
            </div>

            {/* Progress Bar */}
            <div
              className="progress-container"
              style={{
                height: "20px",
                backgroundColor: "#e9ecef",
                borderRadius: "10px",
                overflow: "hidden",
                position: "relative",
                marginBottom: "10px",
              }}
            >
              <div
                className="progress-fill"
                style={{
                  height: "100%",
                  width: `${progressPercentage}%`,
                  backgroundColor: tier.color,
                  borderRadius: "10px",
                  transition: "width 0.5s ease",
                }}
              ></div>
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                  fontSize: "0.8rem",
                  color: progressPercentage > 50 ? "white" : "black",
                }}
              >
                {userPoints.toFixed(2)} / {requiredPoints}
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <span>Your progress:</span>
              <span style={{ fontWeight: "600" }}>
                {!hasEnoughPoints ? (
                  <span className="text-danger">
                    Need {(requiredPoints - userPoints).toFixed(2)} more
                  </span>
                ) : (
                  <span className="text-success">Achieved!</span>
                )}
              </span>
            </div>
          </div>

          {/* Referral Requirements */}
          {tier.requiredStatus && tier.requiredChildren > 0 && (
            <div
              className="mb-3 p-3"
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                borderLeft: `3px solid ${tier.color}`,
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Required Status:</span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: tier.color,
                    color: "white",
                    fontWeight: "600",
                  }}
                >
                  {tier.requiredStatus}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Required Referrals:</span>
                <span
                  className="badge bg-secondary"
                  style={{ fontWeight: "600" }}
                >
                  {tier.requiredChildren}
                </span>
              </div>
            </div>
          )}

          {/* Benefits List */}
          <div className="mt-4">
            {getBenefits().map((benefit, index) => (
              <p
                key={index}
                className="mb-2 p-2"
                style={{
                  fontSize: "0.9rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "5px",
                  borderLeft: `3px solid ${tier.color}`,
                }}
              >
                • {benefit}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "300px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="mb-4" style={{ color: "#0A2463", fontWeight: "600" }}>
        Status Overview
      </h2>

      <div className="alert alert-info mb-4">
        <strong>₹100 = 1 point</strong> - Your current points:{" "}
        {userPoints.toFixed(2)}
      </div>

      <div className="row">
        {STATUS_TIERS.map((tier) => (
          <TierCard key={tier.name} tier={tier} />
        ))}
      </div>
    </div>
  );
};

export default StatusPage;
// import { useEffect, useState } from "react";
// import api from "../../utils/api";
// import { fetchProfile } from "../../utils/profileService";

// const STATUS_TIERS = [
//   {
//     name: "Consumer",
//     requiredTopup: 300,
//     requiredChildren: 0,
//     requiredStatus: null,
//     levelDepth: 3,
//     color: "#4CAF50",
//   },
//   {
//     name: "One Star",
//     requiredTopup: 1000,
//     requiredChildren: 2,
//     requiredStatus: "Consumer",
//     levelDepth: 5,
//     color: "#FFC107",
//   },
//   {
//     name: "Two Star",
//     requiredTopup: 5000,
//     requiredChildren: 2,
//     requiredStatus: "One Star",
//     levelDepth: 10,
//     color: "#FF9800",
//   },
//   {
//     name: "Three Star",
//     requiredTopup: 15000,
//     requiredChildren: 3,
//     requiredStatus: "Two Star",
//     levelDepth: 15,
//     color: "#2196F3",
//   },
//   {
//     name: "Four Star",
//     requiredTopup: 30000,
//     requiredChildren: 5,
//     requiredStatus: "Three Star",
//     levelDepth: 20,
//     color: "#9C27B0",
//   },
//   {
//     name: "Five Star",
//     requiredTopup: 50000,
//     requiredChildren: 7,
//     requiredStatus: "Four Star",
//     levelDepth: 30,
//     color: "#E91E63",
//   },
// ];

// const StatusPage = () => {
//   const [userPoints, setUserPoints] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [userId, setUserId] = useState(null);
//   const [currentStatus, setCurrentStatus] = useState(null);
//   const [nextStatus, setNextStatus] = useState(null);

//   useEffect(() => {
//     const savedUser = localStorage.getItem("userProfileData");
//     let foundId = null;
//     let userStatusFromDB = null;

//     if (savedUser) {
//       const parsed = JSON.parse(savedUser);
//       if (parsed._id) foundId = parsed._id;
//       else if (parsed.basicInfo && parsed.basicInfo._id)
//         foundId = parsed.basicInfo._id;

//       userStatusFromDB = parsed?.referralInfo?.status || null;
//     }

//     const fetchWallet = async (uid, status) => {
//       try {
//         const walletRes = await api.get(`/api/wallet/user/${uid}/wallet`);
//         const data = walletRes.data;
//         const points = (data.totalTopup || 0) / 100;
//         setUserPoints(points);

//         const current =
//           STATUS_TIERS.find((tier) => tier.name === status) || STATUS_TIERS[0];
//         const currentIndex = STATUS_TIERS.findIndex(
//           (tier) => tier.name === current.name
//         );
//         const next =
//           currentIndex < STATUS_TIERS.length - 1
//             ? STATUS_TIERS[currentIndex + 1]
//             : null;

//         setCurrentStatus(current);
//         setNextStatus(next);
//       } catch (err) {
//         console.error("❌ Wallet fetch error:", err);
//         if (err.response?.status === 401) {
//           window.location.href = "/login";
//         }
//       }
//     };

//     const init = async (id) => {
//       setUserId(id);
//       if (userStatusFromDB) {
//         await fetchWallet(id, userStatusFromDB);
//         setLoading(false);
//       } else {
//         const profile = await fetchProfile();
//         const status = profile?.statusInfo?.status || "Inactive";
//         await fetchWallet(id, status);
//         setLoading(false);
//       }
//     };

//     if (foundId) {
//       init(foundId);
//     } else {
//       fetchProfile()
//         .then((profile) => {
//           const id = profile?.basicInfo?._id;
//           const status = profile?.statusInfo?.status || "Inactive";
//           if (id) init(id, status);
//         })
//         .catch((err) => {
//           console.error("❌ Failed to fetch profile:", err);
//           setLoading(false);
//         });
//     }
//   }, []);

//   const TierCard = ({ tier }) => {
//     const requiredPoints = tier.requiredTopup / 100;
//     const hasEnoughPoints = userPoints >= requiredPoints;
//     const progressPercentage = hasEnoughPoints
//       ? 100
//       : Math.min((userPoints / requiredPoints) * 100, 100);

//     const isUserTier = currentStatus?.name === tier.name;

//     // Fixed border logic - use hasEnoughPoints directly
//     const shouldShowBorder = hasEnoughPoints;

//     const getBenefits = () => {
//       switch (tier.name) {
//         case "Consumer":
//           return [`Direct bonus upto ${tier.levelDepth} level`];
//         case "One Star":
//           return [
//             `Direct bonus upto ${tier.levelDepth} level`,
//             "Matching income upto 50:50",
//           ];
//         case "Two Star":
//           return [
//             `Direct bonus upto ${tier.levelDepth} level`,
//             "Matching income upto 100:100",
//             "Reward upto assistant manager",
//           ];
//         case "Three Star":
//           return [
//             `Direct bonus upto ${tier.levelDepth} level`,
//             "Matching income upto 200:200",
//             "Reward upto manager",
//           ];
//         case "Four Star":
//           return [
//             `Direct bonus upto ${tier.levelDepth} level`,
//             "Matching income upto 1000:1000",
//             "Reward upto manager",
//           ];
//         case "Five Star":
//           return [
//             `Direct bonus upto ${tier.levelDepth} level`,
//             "Matching income upto 3000:3000",
//             "Reward upto manager",
//           ];
//         default:
//           return [];
//       }
//     };

//     return (
//       <div className="col-md-6 mb-4">
//         <div
//           className="card h-100 p-3"
//           style={{
//             backgroundColor: isUserTier ? "#e8f5e9" : "white",
//             border: shouldShowBorder 
//               ? `2px solid ${tier.color}` 
//               : "1px solid #e0e0e0",
//             transition: "all 0.3s ease",
//           }}
//         >
//           <div className="card-body">
//             <h5
//               className="card-title mb-3"
//               style={{
//                 fontWeight: "bold",
//                 fontSize: "1.25rem",
//                 color: tier.color,
//               }}
//             >
//               {tier.name} : {requiredPoints} points
//             </h5>

//             <div className="mb-3">
//               <div className="d-flex justify-content-between mb-1">
//                 <span>Points required:</span>
//                 <span style={{ fontWeight: "600" }}>{requiredPoints}</span>
//               </div>

//               {/* Progress Bar */}
//               <div
//                 className="progress-container"
//                 style={{
//                   height: "20px",
//                   backgroundColor: "#e9ecef",
//                   borderRadius: "10px",
//                   overflow: "hidden",
//                   position: "relative",
//                   marginBottom: "10px",
//                 }}
//               >
//                 <div
//                   className="progress-fill"
//                   style={{
//                     height: "100%",
//                     width: `${progressPercentage}%`,
//                     backgroundColor: tier.color,
//                     borderRadius: "10px",
//                     transition: "width 0.5s ease",
//                   }}
//                 ></div>
//                 <div
//                   style={{
//                     position: "absolute",
//                     top: "0",
//                     left: "0",
//                     width: "100%",
//                     height: "100%",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontWeight: "600",
//                     fontSize: "0.8rem",
//                     color: progressPercentage > 50 ? "white" : "black",
//                   }}
//                 >
//                   {userPoints.toFixed(2)} / {requiredPoints}
//                 </div>
//               </div>

//               <div className="d-flex justify-content-between">
//                 <span>Your progress:</span>
//                 <span style={{ fontWeight: "600" }}>
//                   {!hasEnoughPoints ? (
//                     <span className="text-danger">
//                       Need {(requiredPoints - userPoints).toFixed(2)} more
//                     </span>
//                   ) : (
//                     <span className="text-success">Achieved!</span>
//                   )}
//                 </span>
//               </div>
//             </div>

//             {/* Referral Requirements */}
//             {tier.requiredStatus && tier.requiredChildren > 0 && (
//               <div
//                 className="mb-3 p-3"
//                 style={{
//                   backgroundColor: "#f8f9fa",
//                   borderRadius: "8px",
//                   borderLeft: `3px solid ${tier.color}`,
//                 }}
//               >
//                 <div className="d-flex justify-content-between align-items-center mb-2">
//                   <span>Required Status:</span>
//                   <span
//                     className="badge"
//                     style={{
//                       backgroundColor: tier.color,
//                       color: "white",
//                       fontWeight: "600",
//                     }}
//                   >
//                     {tier.requiredStatus}
//                   </span>
//                 </div>
//                 <div className="d-flex justify-content-between align-items-center">
//                   <span>Required Referrals:</span>
//                   <span
//                     className="badge bg-secondary"
//                     style={{ fontWeight: "600" }}
//                   >
//                     {tier.requiredChildren}
//                   </span>
//                 </div>
//               </div>
//             )}

//             {/* Benefits List */}
//             <div className="mt-4">
//               {getBenefits().map((benefit, index) => (
//                 <p
//                   key={index}
//                   className="mb-2 p-2"
//                   style={{
//                     fontSize: "0.9rem",
//                     backgroundColor: "#f8f9fa",
//                     borderRadius: "5px",
//                     borderLeft: `3px solid ${tier.color}`,
//                   }}
//                 >
//                   • {benefit}
//                 </p>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   if (loading) {
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ height: "300px" }}
//       >
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4">
//       <h2 className="mb-4" style={{ color: "#0A2463", fontWeight: "600" }}>
//         Status Overview
//       </h2>

//       <div className="alert alert-info mb-4">
//         <strong>₹100 = 1 point</strong> - Your current points:{" "}
//         {userPoints.toFixed(2)}
//       </div>

//       <div className="row">
//         {STATUS_TIERS.map((tier) => (
//           <TierCard key={tier.name} tier={tier} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default StatusPage;