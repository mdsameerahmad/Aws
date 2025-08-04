// File: income-service/src/controllers/businessController.js

const TotalBusiness = require("../models/TotalBusiness");

exports.getBusinessReport = async (req, res) => {
  try {
    const userId = req.params.userId;
    const businessDoc = await TotalBusiness.findOne({ userId });

    if (!businessDoc) {
      return res.status(404).json({ message: "Business data not found" });
    }

    res.json({
      userId,
      totalLeftUsers: businessDoc.totalLeftUsers,
      totalRightUsers: businessDoc.totalRightUsers,
      totalLeftCarry: businessDoc.totalLeftCarry,
      totalRightCarry: businessDoc.totalRightCarry,
      totalTopup: businessDoc.totalTopup,
      levelStats: businessDoc.levelStats || [],
      totalMatchingIncome: businessDoc.totalMatchingIncome || 0,
      totalLevelIncome: businessDoc.totalLevelIncome || 0,
      totalIncome: businessDoc.totalIncome || 0,
      monthlyStats: businessDoc.monthlyStats || [],
    });
  } catch (err) {
    console.error("❌ Business Report Error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
