// File: backend/wallet-service/src/models/Purchase.js

const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productCode: {
    type: Number,
    required: true,
  },
  productName: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number, // from DP value at time of request
  },
  totalPrice: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
