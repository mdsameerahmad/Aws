const mongoose = require("mongoose");

const topupRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  note: String, // optional
}, { timestamps: true });

module.exports = mongoose.model("TopupRequest", topupRequestSchema);
