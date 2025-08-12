const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
dotenv = require("dotenv").config();
const { generateReferralCode } = require("../utils/referralUtils");
const { findBinaryPlacement, updateLevelTree } = require("../utils/placment");
const { buildBinaryTree } = require("../utils/buildBinaryTree");
// const { clearUserCache } = require("../utils/cacheUtils");
const axios = require("axios");

const INCOME_SERVICE_URL = process.env.INCOME_SERVICE_URL


// for reset and forget password
const sendEmail = require("../utils/sendEmail");
const { clear } = require("console");

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

// USER REGISTRATION -------------------------------------------------------------------------------------------
/**
 * Registers a new user in the system.
 *
 * This function handles the registration process by validating the input fields,
 * checking for existing users, validating t
 *
 * he referral code, hashing the password,
 * and saving the new user to the database.
 *
 * @param {Object} req - The request object containing user registration data.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves when the registration process is complete.
 *
 * @throws {Error} - Throws an error if there is a server issue during the registration process.
 */

// referral
exports.validateReferral = async (req, res) => {
  try {
    const { code } = req.params;
    const user = await User.findOne({
      $or: [{ referralCodeLeft: code }, { referralCodeRight: code }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ valid: false, message: "Invalid referral code" });
    }

    res.json({ valid: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ valid: false, message: "Server error" });
  }
};

// This function registers a new user with referral code validation
exports.register = async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;
    if (!name || !email || !password || !referralCode) {
      return res
        .status(400)
        .json({ error: "All fields including referralCode are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const sponsor = await User.findOne({
      $or: [
        { referralCodeLeft: referralCode },
        { referralCodeRight: referralCode },
      ],
    });

    if (!sponsor) {
      return res.status(400).json({ error: "Invalid referral code" });
    }

    if (!sponsor.isActive) {
      return res
        .status(403)
        .json({ message: "Referrer has not activated their account yet" });
    }

    const direction =
      sponsor.referralCodeLeft === referralCode ? "left" : "right";

    // 🌳 BINARY PLACEMENT
    const { parentId, position } = await findBinaryPlacement(
      sponsor._id,
      direction
    );

    // 🧬 Create new user
    const newUser = new User({
      name,
      email,
      password,
      referralCodeLeft: generateReferralCode(),
      referralCodeRight: generateReferralCode(),
      parentId,
      binaryPosition: position,
      referredBy: sponsor._id,
    });

    await newUser.save();

    // Update parent’s left/right + subtree
    await User.findByIdAndUpdate(parentId, {
      [position === "left" ? "leftUser" : "rightUser"]: newUser._id,
      $push: {
        [position === "left" ? "leftSubtreeUsers" : "rightSubtreeUsers"]:
          newUser._id,
      },
    });

    // 🌿 LEVEL TREE PLACEMENT
    const levelDepth = await updateLevelTree(sponsor._id, newUser._id);
    newUser.levelDepth = levelDepth;
    await newUser.save();
    // clearUserCache(newUser._id);

    res
      .status(201)
      .json({ message: "User created successfully", userId: newUser._id });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Server error", detail: error.message });
  }
};

// USER LOGIN -------------------------------------------------------------------------------------------
/**
 * Logs in an existing user.
 *
 * This function handles the login process by validating the input fields,
 * checking for the user in the database, and verifying the password.
 *
 * @param {Object} req - The request object containing user login data.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves when the login process is complete.
 *
 * @throws {Error} - Throws an error if there is a server issue during the login process.
 */

exports.login = async (req, res) => {
  const { email, password } = req.body;

     console.log('🔥 Login request received');
    console.log('Login Payload:', req.body); 

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  // await clearUserCache(user._id);

  // Just return the token; API Gateway will set the cookie
  res.json({ token, expiresIn: "1d" });
};

// USER FORGOT PASSWORD -------------------------------------------------------------------------------------------


/**
 * Handles the forgot password process.
 *
 * This function generates a reset token, saves it to the user's record,
 * and sends an email with the reset link to the user.
 *
 * @param {Object} req - The request object containing user email.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves when the forgot password process is complete.
 *
 * @throws {Error} - Throws an error if there is a server issue during the forgot password process.
 */

// Forgot Password - Fixed to use body instead of query
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();
    // Send email
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
    const message = `
      <p>You requested a password reset for your account.</p>
      <p>Click this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

//Reset Password

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    // 1. Find user by valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 2. Update password and clear token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // 3. Save changes
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Handles the password reset process.
 *
 * This function verifies the reset token, updates the user's password,
 * and clears the reset token and expiration time.
 *
 * @param {Object} req - The request object containing reset token and new password.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves when the password reset process is complete.
 *
 * @throws {Error} - Throws an error if there is a server issue during the password reset process.
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    user.password = password; // will be hashed in pre-save hook
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// USER PROFILE -------------------------------------------------------------------------------------------
/**
 * Retrieves the profile of the logged-in user.
 *
 * This function fetches the user's profile information from the database
 * and returns it in the response.
 *
 * @param {Object} req - The request object containing user ID from JWT.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves when the profile retrieval process is complete.
 *
 * @throws {Error} - Throws an error if there is a server issue during the profile retrieval process.
 */
// User Service
exports.getProfile = async (req, res) => {
  try {
    // Handle both userId and id formats
    const userId = req.user.userId || req.user.id;
    
    const user = await User.findById(userId)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .populate("parentId", "name email")
      .populate("leftUser rightUser", "name email")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Structure the response
    const responseData = {
      basicInfo: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      },
      kycDetails: {
        panNumber: user.panNumber,
        aadharNumber: user.aadharNumber,
        country: user.country,
      },
      bankDetails: user.bankDetails,
      referralInfo: {
        parentId: user.parentId,
        referralCodeLeft: user.referralCodeLeft,
        referralCodeRight: user.referralCodeRight,
        leftUser: user.leftUser,
        rightUser: user.rightUser,
        isRootSponsor: user.isRootSponsor,
      },
      statusInfo:{
        isActive: user.isActive,
        status: user.status,
        rank: user.rank,
      },
      systemInfo: {
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
      uiSettings: {
        profileViewState: user.uiSettings?.profileViewState || "view",
      },
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// USER UPDATE PROFILE -------------------------------------------------------------------------------------------
/**
 * Updates the profile of the logged-in user.
 *
 * This function validates the input fields, updates the user's profile information
 * in the database, and returns the updated profile in the response.
 *
 * @param {Object} req - The request object containing user ID from JWT and updated profile data.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves when the profile update process is complete.
 *
 * @throws {Error} - Throws an error if there is a server issue during the profile update process.
 */
exports.updateProfile = async (req, res) => {
  try {
    const forbiddenFields = [
      "_id",
      "referralCode",
      "referralCodeLeft",
      "referralCodeRight",
      "parentId",
      "isAdmin",
      "isRootSponsor",
      "leftUser",
      "rightUser",
    ];
    const updates = { ...req.body };

    // Prevent overwriting restricted fields
    forbiddenFields.forEach((field) => delete updates[field]);

    // Handle both userId and id formats
    const userId = req.user.userId || req.user.id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if ("password" in req.body) {
      return res
        .status(400)
        .json({ message: "Use change password route to update password." });
    }

    // Special handling for nested bankDetails
    if (updates.bankDetails) {
      user.bankDetails = {
        ...user.bankDetails.toObject(), // ensure plain object
        ...updates.bankDetails,
      };
      delete updates.bankDetails;
    }

    // Assign other fields
    Object.assign(user, updates);

    await user.save();
    // await clearUserCache(req.user.userId);
    res.json({ message: "Profile updated", user: user.toObject() });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// CHANGE PASSWORD -------------------------------------------------------------------------------------------
/**
 * Changes the password of the logged-in user.
 *
 * This function validates the input fields, checks the current password,
 * updates the user's password in the database, and returns a success message.
 *
 * @param {Object} req - The request object containing user ID from JWT and new password data.
 * @param {Object} res - The response object used to send back the desired HTTP response.
 *
 * @returns {Promise<void>} - A promise that resolves when the password change process is complete.
 *
 * @throws {Error} - Throws an error if there is a server issue during the password change process.
 */

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Check if new password matches confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Handle both userId and id formats
    const userId = req.user.userId || req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return res
        .status(400)
        .json({ message: "New password cannot be same as current password" });
    }

    user.password = newPassword; // will be hashed via mongoose pre-save
    await user.save();
    // await clearUserCache(req.user.userId);


    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//admin get all users --sameer
exports.getAllUsersForAdmin = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email phone createdAt isActive balance rank")
      .sort({ createdAt: -1 })
      .lean();

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      isActive: user.isActive || false,
      balance: user.balance || 0,
      rank: user.rank || "Member",
    }));

    res.json(data);
  } catch (error) {
    console.error("Error in getAllUsersForAdmin:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};


// new work after deployment
// const User = require("../models/User");

exports.getLevelTreeUsers = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    // Fetch only levelTree
    const user = await User.findById(userId)
      .select("levelTree")
      .lean();

    if (!user || !user.levelTree || user.levelTree.length === 0) {
      return res.status(404).json({ message: "No level tree data found" });
    }

    // Gather all user IDs from all levels
    const allUserIds = user.levelTree.flatMap(l => l.users);

    // Fetch all users in one go
    const allUsersData = await User.find(
      { _id: { $in: allUserIds } },
      { name: 1, email: 1 }
    ).lean();

    // Create a map for quick lookup
    const userMap = {};
    allUsersData.forEach(u => {
      userMap[u._id.toString()] = u;
    });

    // Replace user IDs with full objects { _id, name, email }
    const populatedLevels = user.levelTree.map(level => ({
      level: level.level,
      users: level.users.map(uid => userMap[uid.toString()] || { _id: uid })
    }));

    res.json({
      levels: populatedLevels
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
