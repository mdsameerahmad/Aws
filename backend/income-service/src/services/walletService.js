const axios = require("axios");
const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL;

exports.creditToWallet = async (userId, amount, type = "matching") => {
  try {
  await axios.post(`${WALLET_SERVICE_URL}/internal/credit-income`, {
    userId,
    amount,
    type,
  });} catch (err) {console.error("❌ Wallet credit failed:", err.response?.data || err.message);
  throw err;}
};

exports.getWalletData = async (userId) => {
  try {
    const { data } = await axios.get(`${WALLET_SERVICE_URL}/internal/wallet/${userId}`);
    return data;
  } catch (err) {
    console.error("❌ getWalletData error:", err.response?.data || err.message);
    throw err;
  }
};
