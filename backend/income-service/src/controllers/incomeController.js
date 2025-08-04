const { calculateMatchingIncome } = require("../utils/calculateMatching");
const { calculateLevelIncome } = require("../utils/calculateLevel");
const { checkAndUpgradeStatus } = require("../utils/statusUpdater");
const { getUserById } = require("../services/userService");
const { clearBusinessCache } = require("../utils/clearCache");
const {clearWalletCacheRemote} = require("../utils/triggerWalletClear");
const {updateTotalBusiness} = require("../utils/updateTotalBuisness");
const {evaluateRankUpgrade} = require("../utils/rankUtils");

const recursivelyUpgradeParents = async (childUserId) => {
  try {
    const child = await getUserById(childUserId);
    if (!child || !child.referredBy) {
      console.log(`⏹️ End of parent chain for ${childUserId}`);
      return;
    }

    const parentId = child.referredBy;
    console.log(`🔼 Processing parent ${parentId}`);

    // Get parent's current status
    const parentBefore = await getUserById(parentId);
    if (!parentBefore) {
      console.log(`❌ Parent ${parentId} not found`);
      return;
    }

    // Attempt upgrade
    const newStatus = await checkAndUpgradeStatus(parentId);

    // await clearBusinessCache(parentId); // if parent earns income
    
    // Continue with parent's parent if exists, regardless of status change
    if (parentBefore.referredBy) {
      await recursivelyUpgradeParents(parentId);
    } else {
      console.log(`🏁 Reached top sponsor: ${parentId}`);
    }
  } catch (error) {
    console.error(`💥 Parent chain error:`, error);
    throw error;
  }
};

exports.handleTopupTrigger = async (req, res) => {
  console.log("💰 Topup Trigger Request Received:", req.body);
  console.log("💰 Request Headers:", req.headers);
  
  const { userId, coins } = req.body;
  console.log("💰 Topup Trigger Processing:", { userId, coins });

  try {
    // 1. Get initial status
    const userBefore = await getUserById(userId);
    if (!userBefore) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Upgrade user
    const newStatus = await checkAndUpgradeStatus(userId);
    
    // 3. Always attempt to upgrade parents after user's status is checked
    console.log(`Initiating recursive parent upgrade for ${userId}`);
    await recursivelyUpgradeParents(userId);

    // 4. Calculate incomes
    await Promise.all([
      calculateMatchingIncome(userId, coins),
      calculateLevelIncome(userId, coins)
    ]);


    const visited = new Set();
    await updateTotalBusiness(userId, visited);

    // 5. Clear cache for this user (wallet + business report)
// await Promise.all([

//   clearBusinessCache(userId),
//   clearWalletCacheRemote(userId) // This will trigger the wallet service to clear its cache
// ]);


    res.status(200).json({
      success: true,
      message: "Topup processed",
      statusChanged: newStatus !== userBefore.status,
      newStatus
    });

  } catch (error) {
    console.error("💥 Topup processing failed:", error);
    res.status(500).json({
      success: false,
      error: "Processing failed",
      details: error.message
    });
  }
};
