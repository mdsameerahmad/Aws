const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const TopupRequest = require("../models/TopupRequest");
const WithdrawRequest = require("../models/WithdrawRequest");
const Wallet = require("../models/Wallet");
const mongoose = require("mongoose");
const { clearWalletCache } = require("../utils/clearWalletCache");
const INCOME_SERVICE_URL = process.env.INCOME_SERVICE_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

exports.approveTopupRequest = async (req, res) => {
  const { id } = req.params;

  const request = await TopupRequest.findById(id);
  if (!request || request.status !== "pending") {
    return res.status(400).json({ message: "Invalid request" });
  }

  // ✅ mark request as approved
  request.status = "approved";
  await request.save();

  // ✅ update topupWallet
  let wallet = await Wallet.findOne({ userId: request.userId });
  if (!wallet) wallet = await Wallet.create({ userId: request.userId });

  wallet.topupWallet += request.amount;
  wallet.totalTopup += request.amount; // Update totalTopup
  await wallet.save();
  // await clearWalletCache(request.userId);

  // ✅ trigger income-service!
  try {
    console.log(`🔄 Activating user at: ${USER_SERVICE_URL}/activate-user/${request.userId}`);
    await axios.put(
      `${USER_SERVICE_URL}/activate-user/${request.userId}`
    );
    
    // ✅ Mark user as active after top-up
    // Try different URL formats to ensure we hit the correct endpoint
    const baseUrl = INCOME_SERVICE_URL.startsWith('http') ? INCOME_SERVICE_URL : `http://${INCOME_SERVICE_URL}`;
    
    // Try both with and without the /api prefix
    const incomeServiceUrl1 = `${baseUrl}/api/income/topup-trigger`;
    const incomeServiceUrl2 = `${baseUrl}/income/topup-trigger`;
    
    console.log(`🔄 INCOME_SERVICE_URL env value: ${INCOME_SERVICE_URL}`);
    console.log(`🔄 Constructed base URL: ${baseUrl}`);
    
    const payload = {
      userId: request.userId,
      coins: request.amount // coins = topup
    };
    
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // Try the first URL format
    try {
      console.log(`🔄 Trying first URL format: ${incomeServiceUrl1}`);
      console.log(`🔄 Payload:`, payload);
      
      const response = await axios.post(incomeServiceUrl1, payload, axiosConfig);
      console.log(`✅ Income service response (first URL):`, response.data);
    } catch (firstUrlError) {
      console.error(`❌ First URL format failed:`, firstUrlError.message);
      console.error(`❌ Error details:`, firstUrlError.response?.data || "No response data");
      
      // Try the second URL format if the first one fails
       try {
         console.log(`🔄 Trying second URL format: ${incomeServiceUrl2}`);
         console.log(`🔄 Payload:`, payload);
         
         const response = await axios.post(incomeServiceUrl2, payload, axiosConfig);
         console.log(`✅ Income service response (second URL):`, response.data);
       } catch (secondUrlError) {
         console.error(`❌ Second URL format also failed:`, secondUrlError.message);
         console.error(`❌ Error details:`, secondUrlError.response?.data || "No response data");
         
         // Try the test route as a last resort
          try {
            const testUrl = `${baseUrl}/test/test-topup-trigger`;
            console.log(`🔄 Trying test route as last resort: ${testUrl}`);
            console.log(`🔄 Payload:`, payload);
            
            const response = await axios.post(testUrl, payload, axiosConfig);
            console.log(`✅ Income service test route response:`, response.data);
          } catch (testRouteError) {
            console.error(`❌ Test route also failed:`, testRouteError.message);
            console.error(`❌ Error details:`, testRouteError.response?.data || "No response data");
            
            // Try the direct route as a final attempt
            try {
              const directUrl = `${baseUrl}/direct-topup-trigger`;
              console.log(`🔄 Trying direct route as final attempt: ${directUrl}`);
              console.log(`🔄 Payload:`, payload);
              
              const response = await axios.post(directUrl, payload, axiosConfig);
              console.log(`✅ Income service direct route response:`, response.data);
            } catch (directRouteError) {
              console.error(`❌ Direct route also failed:`, directRouteError.message);
              console.error(`❌ Error details:`, directRouteError.response?.data || "No response data");
              throw new Error(`All URL formats failed to reach income service`);
            }
          }
       }
    }
  } catch (err) {
    console.error("❌ Failed to trigger income-service:", err.message);
    console.error("❌ Error details:", err.response?.data || "No response data");
    console.error("❌ Request URL:", err.config?.url || "Unknown URL");
    console.error("❌ Request method:", err.config?.method || "Unknown method");
  }

  res.json({ message: "Top-up request approved", wallet });
};

exports.getAllTopupRequests = async (req, res) => {
  try {
    const requests = await TopupRequest.find().populate('userId', 'name email'); // Populate user info
    res.json(requests);
  } catch (error) {
    console.error("Failed to fetch top-up requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveWithdrawRequest = async (req, res) => {
  const { id } = req.params;

  const request = await WithdrawRequest.findById(id);
  if (!request || request.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Invalid or already processed request" });
  }

  const wallet = await Wallet.findOne({ userId: request.userId });
  if (!wallet || wallet.incomeWallet < request.amount) {
    return res.status(400).json({ message: "User has insufficient funds" });
  }

  wallet.incomeWallet -= request.amount;
  await wallet.save();
  
  request.status = "approved";
  await request.save();
  // await clearWalletCache(request.userId);

  res.json({ message: "Withdraw request approved", wallet });
};

exports.creditIncome = async (req, res) => {
  const { userId, amount, type } = req.body;

  if (!userId || !amount)
    return res.status(400).json({ message: "userId and amount are required" });

  const incomeAmount = amount * 0.9;
  const shoppingAmount = amount * 0.1;

  // ⚙️ Update wallets (example schema names)
  await Wallet.findOneAndUpdate(
    { userId },
    {
      $inc: {
        incomeWallet: incomeAmount,
        shoppingWallet: shoppingAmount,
      },
    },
    { new: true, upsert: true }
  );

  // Optional: Save log if needed
  await WalletLog.create({
    userId,
    amount,
    type: type || "income",
    creditedBy: "system", // or adminId if manual
    comment: "System credited income",
  });
  // await clearWalletCache(userId);

  res.status(200).json({ message: "Income credited successfully" });
};

//pending request all topup+withdraw sum count
exports.getPendingRequestsSummary = async (req, res) => {
  try {
    const [topupRequests, withdrawRequests] = await Promise.all([
      TopupRequest.find({ status: "pending" }).lean(),
      WithdrawRequest.find({ status: "pending" }).lean(),
    ]);

    // Filter only if amount is number and not NaN
    const validTopups = topupRequests.filter(req =>
      typeof req.amount === "number" && !isNaN(req.amount)
    );

    const validWithdraws = withdrawRequests.filter(req =>
      typeof req.amount === "number" && !isNaN(req.amount)
    );

    const totalPendingTopup = validTopups.reduce((sum, req) => sum + req.amount, 0);
    const totalPendingWithdraw = validWithdraws.reduce((sum, req) => sum + req.amount, 0);

    res.json({
      topup: {
        count: validTopups.length,
        totalAmount: totalPendingTopup,
      },
      withdraw: {
        count: validWithdraws.length,
        totalAmount: totalPendingWithdraw,
      },
    });
  } catch (error) {
    console.error("Failed to fetch pending requests summary:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// geet all pending requests for topup for individual user
exports.getPendingTopupRequestsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await TopupRequest.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: "pending",
      amount: { $type: "number" }, // optional: only valid numeric topups
    }).lean();

    res.json(requests);
  } catch (error) {
    console.error("Failed to fetch pending top-up requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// get all pending requests for withdraw for individual user
exports.getPendingWithdrawRequestsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await WithdrawRequest.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: "pending",
      amount: { $type: "number" }, // optional: only valid numeric withdraws
    }).lean();

    res.json(requests);
  } catch (error) {
    console.error("Failed to fetch pending withdraw requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// decline topup request
exports.declineTopupRequest = async (req, res) => {
  const { id } = req.params;

  console.log("🔥 declineTopupRequest hit with id:", id); // add this

  try {
    const request = await TopupRequest.findById(id);

    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid or already processed request" });
    }

    request.status = "rejected";
    await request.save();
    // await clearWalletCache(request.userId); // Clear cache for this user

    res.json({ message: "Top-up request rejected", request });

  } catch (error) {
    console.error("Decline request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// decline withdraw request
exports.declineWithdrawRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await WithdrawRequest.findById(id);

    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid or already processed request" });
    }

    request.status = "rejected";
    await request.save();
    // await clearWalletCache(request.userId); // Clear cache for this user

    res.json({ message: "Withdraw request rejected", request });

  } catch (error) {
    console.error("Decline request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
