const express = require("express");
const router = express.Router();
const axios = require("axios");
const walletAuth = require("../middlewares/walletAuth");
const { createProxyMiddleware } = require("http-proxy-middleware");
 // same as used in /me route

const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL;

// Logger
router.use((req, res, next) => {
  next();
});

//
// 🧾 USER ROUTES
//

// Ensure wallet exists for user
router.post("/user/ensure-wallet", walletAuth, async (req, res) => {
  try {
    const response = await axios.post(`${WALLET_SERVICE_URL}/user/ensure-wallet`, req.body, {
      headers: {
        Authorization: req.headers.authorization,
        Cookie: req.headers.cookie,
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Ensure wallet error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// Top-up Request
router.post("/user/topup-request", walletAuth, async (req, res) => {
  try {
    const response = await axios.post(`${WALLET_SERVICE_URL}/user/topup-request`, req.body, {
      headers: {
        Authorization: req.headers.authorization,
        Cookie: req.headers.cookie,
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Top-up error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// Withdraw Request
router.post("/user/withdraw-request", walletAuth, async (req, res) => {
  try {
    const response = await axios.post(`${WALLET_SERVICE_URL}/user/withdraw-request`, req.body, {
      headers: {
        Authorization: req.headers.authorization,
        Cookie: req.headers.cookie,
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Withdraw error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});


//
// 👑 ADMIN ROUTES
//

// Get all top-up requests for admin
router.get("/admin/topup-requests", walletAuth, async (req, res) => {
  try {
    const response = await axios.get(`${WALLET_SERVICE_URL}/admin/topup-requests`, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Get top-up requests error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// Approve Top-up
router.put("/admin/topup-request/:id/approve", walletAuth, async (req, res) => {
  try {
    const response = await axios.put(
      `${WALLET_SERVICE_URL}/admin/topup-request/${req.params.id}/approve`,
      {},
      {
        headers: {
          Authorization: req.headers.authorization,
          Cookie: req.headers.cookie,
        },
      }
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Top-up approval error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// Approve Withdraw
router.put("/admin/withdraw-request/:id/approve", walletAuth, async (req, res) => {
  try {
    const response = await axios.put(
      `${WALLET_SERVICE_URL}/admin/withdraw-request/${req.params.id}/approve`,
      {},
      {
        headers: {
          Authorization: req.headers.authorization,
          Cookie: req.headers.cookie,
        },
      }
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Withdraw approval error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});
// decline Top-up
// ❌ Decline Top-up
router.put("/admin/topup-request/:id/decline", walletAuth, async (req, res) => {
  try {
    const response = await axios.put(
      `${WALLET_SERVICE_URL}/admin/topup-request/${req.params.id}/decline`,
      {},
      {
        headers: {
          Authorization: req.headers.authorization,
          Cookie: req.headers.cookie,
        },
      }
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Top-up decline error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// decline Withdraw
router.put("/admin/withdraw-request/:id/decline", walletAuth, async (req, res) => {
  try {
    const response = await axios.put(
      `${WALLET_SERVICE_URL}/admin/withdraw-request/${req.params.id}/decline`,
      {},
      {
        headers: {
          Authorization: req.headers.authorization,
          Cookie: req.headers.cookie,
        },
      }
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Withdraw decline error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// Get Wallet by 
// Get wallet for user (used in binary tree)
// Wallet Info by User ID
router.use(
  createProxyMiddleware({
    target: WALLET_SERVICE_URL, // or use Docker name like 'http://wallet-service:5003' if using Docker Compose
    changeOrigin: true,
    pathRewrite: {
      "^/wallet": "", // remove /wallet prefix before forwarding
    },
  })
);



module.exports = router;
