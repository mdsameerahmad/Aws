const mongoose = require("mongoose");

const rankRewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  rankAchieved: {
    type: String,
    enum: [
      "ASSISTANT SUPERVISOR",
      "SUPERVISOR",
      "ASSISTANT MANAGER",
      "MANAGER",
      "SENIOR MANAGER",
      "SOARING MANAGER"
    ],
    required: true
  },

  eligibleAt: { type: Date },
  expiresAt: { type: Date },
  claimedAt: { type: Date },

  status: {
    type: String,
    enum: ["PENDING", "CLAIMED", "EXPIRED", "NOT_ELIGIBLE"],
    default: "NOT_ELIGIBLE"
  },

  reward: {
    cashAmount: { type: Number, default: 0 },
    creditedToWallet: { type: Boolean, default: false },
    trip: {
      type: String,
      enum: ["NONE", "NATIONAL", "INTERNATIONAL", "SPECIAL"],
      default: "NONE"
    },
    tripClaimed: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model("RankReward", rankRewardSchema);
