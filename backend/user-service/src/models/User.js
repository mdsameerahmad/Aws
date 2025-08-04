const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Binary parent
    leftUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rightUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    leftSubtreeUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rightSubtreeUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    referralCodeLeft: String,
    referralCodeRight: String,

    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    levelDepth: { type: Number, default: 0 }, // start from 0
    levelTree: [
      {
        level: { type: Number },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    binaryPosition: {
      type: String,
      enum: ["left", "right", null],
      default: null,
    },

    // Personal Details
    phone: {
      type: Number,
      default: null,
    },
    country: {
      type: String,
      default: "India",
    },
    panNumber: {
      type: String,
      default: null,
    },
    aadharNumber: {
      type: Number,
      default: null,
    },
    avatar: {
      type: String, // Could be URL or base64
      default: null,
    },

    bankDetails: {
      accountNumber: { type: Number, default: null },
      ifscCode: { type: String, default: null },
      bankName: { type: String, default: null },
      accountHolderName: { type: String, default: null },
    },

    rank: {
      type: String,
      default: "Member", // Default rank is Member
    },

    isRootSponsor: { type: Boolean, default: false },

    isAdmin: { type: Boolean, default: false },

    isActive: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: [
        "Inactive",
        "Consumer",
        "One Star",
        "Two Star",
        "Three Star",
        "Four Star",
        "Five Star",
      ],
      default: "Inactive",
    },
    statusUpdatedAt: {
      type: Date,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
