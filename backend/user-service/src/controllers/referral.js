const { buildBinaryTree } = require("../utils/binaryTreeBuilder");
const User = require("../models/User");

exports.validateReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.params;

    const user = await User.findOne({
      $or: [
        { referralCodeLeft: referralCode },
        { referralCodeRight: referralCode },
      ],
    });

    if (!user) {
      return res.status(404).json({ valid: false, message: "Invalid referral code" });
    }

    res.json({
      valid: true,
      referredBy: user._id,
      message: "Valid referral code"
    });
  } catch (error) {
    res.status(500).json({ error: "Server error", detail: error.message });
  }
};


// controller

exports.getBinaryTree = async (req, res) => {
  try {
    const userId = req.params.userId;
    const tree = await buildBinaryTree(userId);
    res.json(tree);
  } catch (err) {
    console.error("Error building binary tree:", err);
    res.status(500).json({ error: "Server error" });
  }
};

