// File: backend/wallet-service/src/models/Wallet.js
const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  topupWallet: {
    type: Number,
    default: 0,
  },
  incomeWallet: {
    type: Number,
    default: 0,
  },
  shoppingWallet: {
    type: Number,
    default: 0,
  },
  totalTopup: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model("Wallet", walletSchema);
