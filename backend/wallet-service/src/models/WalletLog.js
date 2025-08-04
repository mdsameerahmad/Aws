const mongoose = require("mongoose");

const walletLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["topup", "withdraw", "income", "matching", "level","rank_reward"],
      default: "income",
    },
    creditedBy: {
      type: String, // "system", "admin", or adminId (optional)
      default: "system",
    },
    comment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WalletLog", walletLogSchema);
