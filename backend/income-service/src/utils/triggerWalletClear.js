// utils/triggerWalletClear.js

const axios = require("axios");

const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || "http://wallet-service:5003";

exports.clearWalletCacheRemote = async (userId) => {
  try {
    await axios.post(`${WALLET_SERVICE_URL}/internal/clear-wallet-cache`, { userId });
    console.log(`🧹 Triggered remote wallet cache clear for ${userId}`);
  } catch (err) {
    console.error("🚨 Failed to clear wallet cache remotely:", err.message);
  }
};
