const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { clearAdminCache } = require("../utils/clearAdminCache");
const dotenv = require("dotenv");
dotenv.config();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

exports.verifyAdmin = async (req, res) => {
  const admin = await Admin.findById(req.admin.adminId).select("-password");
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  res.json({
    _id: admin._id,
    email: admin.email,
    createdAt: admin.createdAt,
  });
};


// Login Admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: "Incorrect password" });

    const token = jwt.sign(
      { adminId: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Clear cache for admin
    // await clearAdminCache(); // only clears general cache like `/me`, `/dashboard`

    res.json({ token });
  } catch (err) {
    console.error('[Admin Service] Login error:', err.message);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
};


// Change Password
// src/controllers/adminController.js

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  const admin = await Admin.findById(req.admin.adminId);
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) return res.status(401).json({ message: "Incorrect current password" });

  const isSame = await bcrypt.compare(newPassword, admin.password);
  if (isSame) return res.status(400).json({ message: "New password cannot be same as current" });

  admin.password = newPassword; // will be hashed in pre-save
  await admin.save();

  res.json({ message: "Password updated successfully" });
};


// src/controllers/adminController.js

exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.adminId).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      _id: admin._id,
      email: admin.email,
      createdAt: admin.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// Get All Users (List View)
exports.getAllUsers = async (req, res) => {
  try {
    
    const { data } = await axios.get(`${USER_SERVICE_URL}/api/admin/users`, {
      headers: { Authorization: req.headers.authorization }
    });

    // Ensure dates are properly formatted
    const formattedUsers = data.map(user => ({
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null
    }));

    res.json(formattedUsers);

  } catch (err) {
    console.error('Admin Service - Error:', err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// Get Single User Full Info
const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL;

exports.getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Get user info
    const { data: user } = await axios.get(`${USER_SERVICE_URL}/api/admin/user/${id}`);

    // Get only PENDING requests
    const [topupRes, withdrawRes] = await Promise.all([
      axios.get(`${WALLET_SERVICE_URL}/admin/user/${id}/topup-requests?status=pending`),
      axios.get(`${WALLET_SERVICE_URL}/admin/user/${id}/withdraw-requests?status=pending`)
    ]);

    res.json({
      user,
      topupRequests: topupRes.data.requests || [],
      withdrawRequests: withdrawRes.data.requests || []
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch full user info", detail: err.message });
  }
};


// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Fetch all users from user-service
    const { data: users } = await axios.get(`${USER_SERVICE_URL}/api/admin/users`, {
      headers: { Authorization: req.headers.authorization }
    });

    // Calculate stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    // For demo, you can set transactions and revenue to 0 or fetch from another service if available
    const transactions = 0;
    const revenue = 0;

    res.json({
      totalUsers,
      activeUsers,
      transactions,
      revenue
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats", detail: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.delete(`${USER_SERVICE_URL}/admin/delete-user/${id}`, {
      headers: { Authorization: req.headers.authorization }
    });

    // ✅ Bust Redis cache for user list & single user
    // await clearAdminCache(id);

    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('Admin Service - Delete User Error:', err);
    res.status(err.response?.status || 500).json(
      err.response?.data || { message: "Failed to delete user", detail: err.message }
    );
  }
}

