const WithdrawRequest = require("../models/WithdrawRequest");
const TopupRequest = require("../models/TopupRequest");
const Wallet = require("../models/Wallet");
const { clearWalletCache } = require("../utils/clearWalletCache");

exports.createTopupRequest = async (req, res) => {
  const { amount, note } = req.body;
  const userId = req.user._id; // comes from auth middleware

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  // Check if wallet exists, if not create one
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    console.log(`Creating wallet for user ${userId} during topup request`);
    wallet = await Wallet.create({
      userId,
      topupWallet: 0,
      incomeWallet: 0,
      shoppingWallet: 0,
      totalTopup: 0
    });
  }

  const request = await TopupRequest.create({
    userId,
    amount,
    note,
  });
  // await clearWalletCache(userId); // Clear cache for this user

  res.status(201).json({ message: "Top-up request created", request });
};


exports.createWithdrawRequest = async (req, res) => {
  const { amount, note } = req.body;
  const userId = req.user._id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  // Check if wallet exists, if not create one
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    console.log(`Creating wallet for user ${userId} during withdraw request`);
    wallet = await Wallet.create({
      userId,
      topupWallet: 0,
      incomeWallet: 0,
      shoppingWallet: 0,
      totalTopup: 0
    });
  }
  
  // Check if there's sufficient balance
  if (wallet.incomeWallet < amount) {
    return res.status(400).json({ message: "Insufficient income wallet balance" });
  }

  const request = await WithdrawRequest.create({
    userId,
    amount,
    note,
  });
  // await clearWalletCache(userId); // Clear cache for this user

  res.status(201).json({ message: "Withdraw request submitted", request });
};

// 🧾 Get wallet details for userId
exports.getWalletByUserId = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.params.userId });

    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    res.json({
      topupWallet: wallet.topupWallet,
      incomeWallet: wallet.incomeWallet,
      shoppingWallet: wallet.shoppingWallet,
      totaltopup: wallet.totaltopup,
    });
  } catch (error) {
    console.error("Wallet fetch failed:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTopupRequests = async (req, res) => {
  try {
    const requests = await TopupRequest.find({ userId: req.user._id });
    res.json(requests);
  } catch (error) {
    console.error("Failed to fetch top-up requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getWithdrawRequests = async (req, res) => {
  try {
    const requests = await WithdrawRequest.find({ userId: req.user._id });
    res.json(requests);
  } catch (error) {
    console.error("Failed to fetch withdraw requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
