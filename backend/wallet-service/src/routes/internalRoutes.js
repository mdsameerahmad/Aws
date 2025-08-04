const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const WalletLog = require("../models/WalletLog");
const { clearWalletCache } = require("../utils/clearWalletCache");
const { cacheMiddleware } = require("../middlewares/cacheMiddleware");

// Unprotected internal call from income-service
router.post("/internal/credit-income", async (req, res) => {
  const { userId, amount, type } = req.body;

  if (!userId || !amount)
    return res.status(400).json({ message: "userId and amount required" });

  const incomeAmount = amount * 0.9;
  const shoppingAmount = amount * 0.1;

  // The upsert:true option already creates a wallet if it doesn't exist
  // Adding logging for clarity
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    console.log(`Creating wallet for user ${userId} during income credit`);
  }
  
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

  await WalletLog.create({
    userId,
    amount,
    type: type || "income",
    creditedBy: "system",
    comment: "Credited by income-service",
  });
  // await clearWalletCache(userId);

  res.status(200).json({ message: "Credited successfully" });
});
// send the all wallet data of individual user to income-service  
router.get("/internal/wallet/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) return res.status(400).json({ message: "userId required" });
  try {
    let wallet = await Wallet.findOne({ userId });
    
    // If wallet doesn't exist, create a new one with default values
    if (!wallet) {
      console.log(`Internal API: Wallet not found for user ${userId}. Creating a new wallet.`);
      wallet = await Wallet.create({
        userId,
        topupWallet: 0,
        incomeWallet: 0,
        shoppingWallet: 0,
        totalTopup: 0
      });
      console.log(`Internal API: New wallet created for user ${userId}`);
    }

    res.status(200).json(wallet);
  } catch (err) {
    console.error("Error fetching wallet:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/internal/clear-wallet-cache", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  // await clearWalletCache(userId);
  res.status(200).json({ message: "Wallet cache cleared" });
});


module.exports = router;
