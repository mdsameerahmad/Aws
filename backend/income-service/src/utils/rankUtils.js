const { RANK_TIERS } = require("../constants/rankTiers");
const RankReward = require("../models/rankRewards");
const User = require("../services/userService");
const Wallet = require("../services/walletService");
const TotalBusiness = require("../models/TotalBusiness");
const { creditToWallet } = require("../services/walletService");
const { updateUserRank} = require("../services/userService")

const checkSubtreeRank = async (userId, tier) => {
  const user = await User.getUserById(userId);
  if (!user) return false;

  console.log(`🔍 Checking subtree rank for ${user.name} (${userId})`);

  const leftRanked = await countRankUsers(
    user.leftUser,
    tier.requiredChildRank
  );
  const rightRanked = await countRankUsers(
    user.rightUser,
    tier.requiredChildRank
  );

  console.log(`👈 Left side ${tier.requiredChildRank}: ${leftRanked}`);
  console.log(`👉 Right side ${tier.requiredChildRank}: ${rightRanked}`);

  return leftRanked >= tier.leftUsers && rightRanked >= tier.rightUsers;
};

const countRankUsers = async (userId, requiredRank) => {
  if (!userId) return 0;

  const user = await User.getUserById(userId);
  if (!user) return 0;

  let count = 0;
  if (user.rank === requiredRank) {
    console.log(`✅ Found ${requiredRank} - ${user.name} (${userId})`);
    count++;
  }

  count += await countRankUsers(user.leftUser, requiredRank);
  count += await countRankUsers(user.rightUser, requiredRank);

  return count;
};

const STATUS_ORDER = [
  "Inactive",
  "Consumer",
  "One Star",
  "Two Star",
  "Three Star",
  "Four Star",
  "Five Star",
];

const compareStatus = (userStatus, requiredStatus) => {
  return (
    STATUS_ORDER.indexOf(userStatus) >= STATUS_ORDER.indexOf(requiredStatus)
  );
};

const distributeReward = async (userId, reward) => {
  try {
    if (!reward?.cashAmount) return;

    console.log(`🎁 Crediting ₹${reward.cashAmount} to user ${userId}...`);
    await creditToWallet(userId, reward.cashAmount, "rank_reward");
    console.log(
      `💸 Rank reward ₹${reward.cashAmount} credited to user ${userId}`
    );
  } catch (err) {
    console.error("❌ Failed to distribute rank reward:", err.message);
    throw err;
  }
};

exports.evaluateRankUpgrade = async (userId) => {
  const user = await User.getUserById(userId);
  const business = await TotalBusiness.findOne({ userId });

  if (!user || !business) {
    console.log(`❌ User or business not found for ${userId}`);
    return;
  }

  console.log(`🧠 Evaluating rank upgrades for ${user.name} (${userId})`);
  console.log(
    `📊 Total Left Carry: ${business.totalLeftCarry}, Total Right Carry: ${business.totalRightCarry}`
  );
  console.log(`⭐ Current Status: ${user.status} | Rank: ${user.rank}`);

  for (const tier of RANK_TIERS) {
   const rankExists = await RankReward.findOne({
  userId,
  rankAchieved: tier.title,
});

if (rankExists) {
  if (
    rankExists.status === "PENDING" &&
    compareStatus(user.status, tier.minStatus) &&
    rankExists.expiresAt > new Date()
  ) {
    console.log(`🔁 Upgrading previously pending reward to CLAIMED for ${tier.title}`);

    rankExists.status = "CLAIMED";
    rankExists.claimedAt = new Date();
    rankExists.reward.creditedToWallet = true;
    rankExists.reward.tripClaimed = true;
    await rankExists.save();

    await distributeReward(userId, tier.reward);
    console.log(`✅ Reward credited for previously pending rank: ${tier.title}`);
  } else {
    console.log(`⏩ Already has ${tier.title}, skipping...`);
  }
  continue;
}


    console.log(`🔎 Checking eligibility for rank: ${tier.title}`);

    const eligible =
      tier.type === "business"
        ? business.totalLeftCarry >= tier.leftBusiness &&
          business.totalRightCarry >= tier.rightBusiness
        : await checkSubtreeRank(userId, tier);

    if (!eligible) {
      console.log(`❌ Not eligible for ${tier.title}`);
      continue;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
    const rewardEligible = compareStatus(user.status, tier.minStatus);

    console.log(`✅ ${tier.title} unlocked by user ${user.name}`);
    console.log(`🎖️ Status requirement met? ${rewardEligible ? "Yes" : "No"}`);

    // Create new reward entry
    const newRankEntry = await RankReward.create({
      userId,
      rankAchieved: tier.title,
      eligibleAt: now,
      expiresAt,
      status: rewardEligible ? "CLAIMED" : "PENDING",
      reward: {
        ...tier.reward,
        creditedToWallet: rewardEligible,
        tripClaimed: false,
      },
      claimedAt: rewardEligible ? now : null,
    });

    // Update user rank
    
    await updateUserRank(userId, tier.title);

    console.log(`📌 User ${user.name}'s rank updated to ${tier.title}`);

    // Send reward if eligible
    if (rewardEligible) {
      await distributeReward(userId, tier.reward);
    } else {
      console.log(
        `⏳ 2-day reward window started — user must upgrade to ${tier.minStatus} to unlock reward`
      );
    }
  }
};
