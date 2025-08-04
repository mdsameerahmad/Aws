const express = require("express");
const router = express.Router();
const { updateTotalBusiness } = require("../utils/updateTotalBuisness");

router.post("/internal/post-login-update/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await updateTotalBusiness(userId);

    res.status(200).json({ message: "Post-login update completed." });
  } catch (err) {
    console.error("🚨 Post-login update failed:", err.message);
    res.status(500).json({ message: "Post-login update failed." });
  }
});

module.exports = router;
