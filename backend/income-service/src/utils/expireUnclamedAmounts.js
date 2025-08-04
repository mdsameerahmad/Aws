const RankReward = require("../models/rankRewards");

const expireUnclaimedRewards = async () => {
  const now = new Date();
  const result = await RankReward.updateMany(
    {
      status: "PENDING",
      expiresAt: { $lt: now },
    },
    { $set: { status: "EXPIRED" } }
  );

  console.log(`⏳ Expired ${result.modifiedCount} unclaimed rank rewards`);
};

module.exports = { expireUnclaimedRewards };
