// ✅ income-service/src/utils/calculateLevel.js
const LevelLog = require("../models/LevelLog.js");
const TotalBusiness = require("../models/TotalBusiness.js");
const { getUserById } = require("../services/userService");
const { creditToWallet } = require("../services/walletService");
const { updateMonthlyStats } = require("./monthTracker.js");
const { getLevelDepthByStatus } = require("./statusUpdater.js");

const updateLevelBusiness = async (userId, level, coins) => {
  const doc = await TotalBusiness.findOne({ userId });

  if (!doc) {
    await TotalBusiness.create({
      userId,
      levelStats: [{
        level,
        teamCount: 1,
        businessVolume: coins,
      }],
    });
    return;
  }

  const levelIndex = doc.levelStats.findIndex(lvl => lvl.level === level);

  if (levelIndex !== -1) {
    doc.levelStats[levelIndex].teamCount += 1;
    doc.levelStats[levelIndex].businessVolume += coins;
  } else {
    doc.levelStats.push({
      level,
      teamCount: 1,
      businessVolume: coins,
    });
  }

  await doc.save();
};

const LEVEL_COMMISSIONS = {
  1: 10,
  2: 4,
  3: 2,
  4: 1,
  5: 0.5,
};

for (let i = 6; i <= 10; i++) LEVEL_COMMISSIONS[i] = 0.5;
for (let i = 11; i <= 20; i++) LEVEL_COMMISSIONS[i] = 0.3;
for (let i = 21; i <= 30; i++) LEVEL_COMMISSIONS[i] = 0.2;

const calculateLevelIncome = async (userId, coins) => {
  console.log(`[Calculate Level] calculateLevelIncome called for userId: ${userId}, coins: ${coins}`);

  const user = await getUserById(userId);
  if (!user || !user.referredBy) return;

  let current = await getUserById(user.referredBy);
  let level = 1;

  while (current && level <= 30) {
    try {
      const levelDepth = getLevelDepthByStatus(current.status);

      if (level > levelDepth) {
        console.log(`🚫 Skipping level ${level} for ${current.name} due to status cap: ${current.status}`);
      } else {
        const percentage = LEVEL_COMMISSIONS[level] || 0;

        if (percentage > 0) {
          const income = (coins * percentage) / 100;

          await creditToWallet(current._id, income);

          await LevelLog.create({
            userId: current._id,
            levelFrom: level,
            sourceUserId: userId,
            topupAmount: coins,
            incomeEarned: income,
          });

          await updateMonthlyStats(current._id, income);
          await updateLevelBusiness(current._id, level, coins);

          console.log(`💸 Level ${level} | ${income} to ${current.name} (${current._id})`);
        }
      }
    } catch (err) {
      console.error(`❌ Error at level ${level} for user ${current?._id || "Unknown"}:`, err.message);
    }

    if (!current.referredBy) break;
    current = await getUserById(current.referredBy);
    level++;
  }

  console.log(`✅ Level income calculation completed for userId: ${userId}`);
};

module.exports = { calculateLevelIncome };
