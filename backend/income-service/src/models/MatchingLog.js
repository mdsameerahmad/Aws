// src/models/MatchingLog.js
const mongoose = require("mongoose");

const matchingLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  matchedAmount: Number,
  incomeEarned: Number,
  date: { type: Date, default: Date.now },
  matchBreakdown: Object, // optional for tracking left/right users
});

module.exports = mongoose.model("MatchingLog", matchingLogSchema);
