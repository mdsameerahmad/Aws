// src/models/LevelLog.js
const mongoose = require("mongoose");

const levelLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  levelFrom: Number,
  sourceUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  topupAmount: Number,
  incomeEarned: Number,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LevelLog", levelLogSchema);
