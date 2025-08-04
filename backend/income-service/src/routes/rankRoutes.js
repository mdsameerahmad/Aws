
// module.exports = router;

const express = require("express");
const router = express.Router();
const RankReward = require("../models/rankRewards");
const { RANK_TIERS } = require("../constants/rankTiers");

// GET full summary of all rank tiers & user's reward claim data
router.get("/user-summary/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userRewards = await RankReward.find({ userId });

    const rewardMap = {};
    userRewards.forEach(r => {
      rewardMap[r.rankAchieved] = {
        id: r._id,
        status: r.status,
        claimedAt: r.claimedAt,
        eligibleAt: r.eligibleAt,
        expiresAt: r.expiresAt,
        trip: r.reward?.trip || "NONE",
        tripClaimed: r.reward?.tripClaimed || false,
        cashAmount: r.reward?.cashAmount || 0,
        creditedToWallet: r.reward?.creditedToWallet || false,
      };
    });

    const rankList = RANK_TIERS.map(tier => {
      const ur = rewardMap[tier.title] || null;
      return {
        id: ur?.id || null,
        title: tier.title,
        businessBased: tier.type === "business",
        staticReward: tier.reward,
        unlocked: !!ur,
        status: ur?.status || "NOT_ELIGIBLE",
        claimedAt: ur?.claimedAt || null,
        eligibleAt: ur?.eligibleAt || null,
        expiresAt: ur?.expiresAt || null,
        trip: ur?.trip || tier.reward.trip || "NONE",
        tripClaimed: ur?.tripClaimed || false,
        creditedToWallet: ur?.creditedToWallet || false,
        cashAmount: ur?.cashAmount || tier.reward.cashAmount || 0,
      };
    });

    const claimedTrips = rankList.filter(r => r.trip !== "NONE" && r.tripClaimed).length;
    const unclaimedTrips = rankList.filter(r => r.trip !== "NONE" && !r.tripClaimed).length;

    res.status(200).json({
      summary: {
        claimedTrips,
        unclaimedTrips,
        totalRanksUnlocked: rankList.filter(r => r.unlocked).length,
      },
      ranks: rankList,
    });
  } catch (err) {
    console.error("❌ Error in rank user summary:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH: Claim trip toggle
router.patch("/claim-trip/:rewardId", async (req, res) => {
  try {
    const reward = await RankReward.findById(req.params.rewardId);
    if (!reward) return res.status(404).json({ message: "Reward not found" });
    if (reward.reward.tripClaimed) return res.status(400).json({ message: "🚫 Trip already claimed!" });

    reward.reward.tripClaimed = true;
    await reward.save();
    res.status(200).json({ message: "🎉 Trip successfully claimed!", reward });
  } catch (err) {
    console.error("❌ Error claiming trip:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
