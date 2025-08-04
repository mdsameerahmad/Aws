// income-service/src/models/TotalBusiness.js
const mongoose = require("mongoose");

const totalBusinessSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

  // Tree-related
  totalLeftUsers: { type: Number, default: 0 },
  totalRightUsers: { type: Number, default: 0 },
  totalLeftCarry: { type: Number, default: 0 },
  totalRightCarry: { type: Number, default: 0 },
  totalTopup: { type: Number, default: 0 },

  // Level income info
  levelStats: [
    {
      level: Number,
      teamCount: { type: Number, default: 0 },
      businessVolume: { type: Number, default: 0 },
      commissionEarned:  { type: Number, default: 0 }, // optional, if you want to store commission per level
    },
  ],

  // Income totals
  totalMatchingIncome: { type: Number, default: 0 },
  totalLevelIncome: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },

  // Monthly tracking
  monthlyStats: [
    {
      month: String, // e.g. "2025-06"
      income: { type: Number, default: 0 },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("TotalBusiness", totalBusinessSchema);
