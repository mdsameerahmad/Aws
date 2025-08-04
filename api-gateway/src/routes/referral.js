const express = require("express");
const router = express.Router();
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

// Proxy GET /referral/validate/:referralCode
router.get("/validate/:referralCode", async (req, res) => {
  try {
    const { referralCode } = req.params;
    const response = await axios.get(`${USER_SERVICE_URL}/api/referral/validate/${referralCode}`);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Service error" });
  }
});

// In routes/referral.js or main router
router.get('/binary-tree/:userId', async (req, res) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/referral/binary-tree/${req.params.userId}`, {
      headers: req.headers // forward auth headers if needed
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error("API Gateway Error (Binary Tree):", err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { error: "Something went wrong" });
  }
});



module.exports = router;
