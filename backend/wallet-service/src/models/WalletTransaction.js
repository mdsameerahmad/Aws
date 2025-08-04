const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["topup", "income", "shopping", "withdraw"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  action: {
    type: String,
    enum: ["credit", "debit"],
    required: true,
  },
  source: {
    type: String,
    default: "manual", // or incomeService, levelIncome, etc.
  },
  remark: String,
}, { timestamps: true });

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
