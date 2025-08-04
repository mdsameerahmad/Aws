// income-service/models/CarryForward.js
const mongoose = require("mongoose");

const carrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true,
  },
  leftCarry: {
    type: Number,
    default: 0,
  },
  rightCarry: {
    type: Number,
    default: 0,
  },
  matchedToday: {
    type: Number,
    default: 0,
  },
  lastReset: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("CarryForward", carrySchema);
