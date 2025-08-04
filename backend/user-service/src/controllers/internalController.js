// user-service/src/controllers/internalController.js
const User = require("../models/User");
const STATUS_TIERS = ["Consumer", "One Star", "Two Star", "Three Star", "Four Star", "Five Star"];
// const { clearUserCache } = require("../utils/cacheUtils");

exports.updateStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    // Validate status value
    if (!STATUS_TIERS.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status value. Valid values are: ${STATUS_TIERS.join(', ')}`
      });
    }

    // Update only if status is different
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, status: { $ne: status } },
      { 
        $set: { 
          status: status,
          statusUpdatedAt: new Date() 
        } 
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.json({ 
        success: true,
        changed: false,
        message: `User already has status: ${status}`
      });
    }

    console.log(`✅ Status updated for ${updatedUser.name}: ${status}`);
    // await clearUserCache(userId); 

    return res.json({ 
      success: true,
      changed: true,
      newStatus: status
    });

  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ 
      success: false,
      error: "Status update failed",
      details: error.message
    });
  }
};