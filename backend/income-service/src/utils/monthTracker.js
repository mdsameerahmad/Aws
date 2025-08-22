// income-service/utils/monthTracker.js
const TotalBusiness = require("../models/TotalBusiness");
const { clearBusinessCache } = require("./clearCache");
const { clearWalletCacheRemote } = require("./triggerWalletClear");

const updateMonthlyStats = async (userId, income) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`; // e.g. "2025-06"

  const doc = await TotalBusiness.findOne({ userId });
  if (!doc) return;

  const index = doc.monthlyStats.findIndex((stat) => stat.month === currentMonth);

  if (index !== -1) {
    doc.monthlyStats[index].income += income;
  } else {
    doc.monthlyStats.push({
      month: currentMonth,
      income: income,
    });
  }

  doc.totalIncome += income; // optional: keep syncing totalIncome
  await doc.save();
  
  // Clear cache after updating monthly stats
  // try {
  //   await Promise.all([
  //     clearBusinessCache(userId),
  //     clearWalletCacheRemote(userId)
  //   ]);
  //   console.log(`🧹 Cleared cache after updating monthly stats for user ${userId}`);
  // } catch (err) {
  //   console.error(`❌ Error clearing cache for user ${userId}:`, err);
  // }
};

module.exports = { updateMonthlyStats };
