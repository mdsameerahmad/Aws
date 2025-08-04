// ✅ user-service/src/routes/internalRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { updateStatus } = require("../controllers/internalController");
// const { clearUserCache } = require("../utils/cacheUtils");

// GET user by ID (already used by income-service)
router.get("/internal/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔁 PUT: update carry forward data from income-service
router.put("/update-carry/:id", async (req, res) => {
  try {
    const { leftCarry, rightCarry } = req.body;
    const update = {};
    if (leftCarry !== undefined) update.leftCarry = leftCarry;
    if (rightCarry !== undefined) update.rightCarry = rightCarry;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Carry updated", user });
    // await clearUserCache(req.params.id);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/activate-user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: true,
        status: "Consumer", // 🆕 default status
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // await clearUserCache(req.params.id); 

    return res.json({
      message: "User activated and status set to Consumer",
      user,
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


router.patch("/internal/update-rank/:userId", async (req, res) => {
  try {
    const { rank } = req.body;
    if (!rank) return res.status(400).json({ message: "Rank is required" });

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { rank },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Rank updated", user });
  } catch (err) {
    console.error("❌ Error updating rank:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});



router.put("/internal/update-status", updateStatus);



module.exports = router;
