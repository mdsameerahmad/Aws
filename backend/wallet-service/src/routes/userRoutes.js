const express = require("express");
const { createTopupRequest, createWithdrawRequest , getTopupRequests, getWithdrawRequests} = require("../controllers/userWalletController");
const { extractUser, isAuthenticated } = require("../middlewares/auth");
const router = express.Router();
const Wallet = require("../models/Wallet");
const {cacheMiddleware} = require("../middlewares/cacheMiddleware");

// Apply extractUser middleware to all routes



router.use(extractUser);

router.get("/:id/wallet" , isAuthenticated,async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.params.id });
    
    // If wallet doesn't exist, create a new one with default values
    if (!wallet) {
      console.log(`Wallet not found for user ${req.params.id}. Creating a new wallet.`);
      wallet = await Wallet.create({
        userId: req.params.id,
        topupWallet: 0,
        incomeWallet: 0,
        shoppingWallet: 0,
        totalTopup: 0
      });
      console.log(`New wallet created for user ${req.params.id}`);
    }
    
    res.json(wallet);
  } catch (err) {
    console.error("Wallet fetch failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/withdraw-request", isAuthenticated, createWithdrawRequest);
router.post("/topup-request", isAuthenticated, createTopupRequest);
router.get("/topup/:userId",isAuthenticated, getTopupRequests);
router.get("/withdraw/:userId", isAuthenticated, getWithdrawRequests);
// Endpoint to ensure a wallet exists for a user
router.post("/ensure-wallet", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    
    let wallet = await Wallet.findOne({ userId });
    let created = false;
    
    if (!wallet) {
      console.log(`Ensuring wallet for user ${userId} - creating new wallet`);
      wallet = await Wallet.create({
        userId,
        topupWallet: 0,
        incomeWallet: 0,
        shoppingWallet: 0,
        totalTopup: 0
      });
      created = true;
    }
    
    res.json({
      success: true,
      walletExists: !created,
      walletCreated: created,
      wallet
    });
  } catch (err) {
    console.error("Ensure wallet failed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
