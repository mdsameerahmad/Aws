const CarryForward = require("../models/CarryForward");

const resetAllCarryMatchedToday = async () => {
  const today = new Date();
  const result = await CarryForward.updateMany({}, {
    $set: {
      matchedToday: 0,
      lastReset: today
    }
  });

  console.log(`✅ Reset ${result.modifiedCount} carry forward records at ${today.toLocaleString()}`);
};

module.exports = { resetAllCarryMatchedToday };
