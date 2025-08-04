const STATUS_TIERS = require("../constants/statusTier");
const CarryForward = require("../models/CarryForward");
const { getUserById } = require("../services/userService");
const { creditToWallet } = require("../services/walletService");
const TotalBusiness = require("../models/TotalBusiness");
const { updateMonthlyStats } = require("./monthTracker");
const MatchingLog = require("../models/MatchingLog");

const getDailyMatchingCapByStatus = (status) => {
  const tier = STATUS_TIERS.find(t => t.name === status);
  return tier?.dailyMatchingCap || 0;
};

const resetMatchedTodayIfNewDay = (carryDoc) => {
  const today = new Date().toISOString().split('T')[0];
  const lastReset = carryDoc.lastReset?.toISOString().split('T')[0];

  if (today !== lastReset) {
    console.log(`🕛 New day detected! Resetting matchedToday for user ${carryDoc.userId}`);
    carryDoc.matchedToday = 0;
    carryDoc.lastReset = new Date();
  }

  return carryDoc;
};

const updateMatchingBusiness = async (userId, side, coins) => {
  const update = {};
  update[side === "leftCarry" ? "totalLeftCarry" : "totalRightCarry"] = coins;

  await TotalBusiness.findOneAndUpdate(
    { userId },
    { $inc: update },
    { upsert: true }
  );
};

const calculateMatchingIncome = async (userId, coins) => {
  console.log(`🚀 Starting Matching Income Calculation for Triggered User: ${userId} | Coins: ${coins}`);

  const user = await getUserById(userId);
  if (!user || !user.parentId) {
    console.log(`❌ No parent found or invalid user.`);
    return;
  }

  let from = userId;
  let parentId = user.parentId;

  while (parentId) {
    const parent = await getUserById(parentId);
    if (!parent) break;

    console.log(`\n🔼 Parent: ${parent.name} (${parent._id}) | Status: ${parent.status}`);

    const isLeft = String(parent.leftUser) === String(from);
    const side = isLeft ? "leftCarry" : "rightCarry";
    console.log(`📍 Side: ${side === "leftCarry" ? "Left" : "Right"}`);

    let carry = await CarryForward.findOne({ userId: parent._id }) || new CarryForward({ userId: parent._id });
    carry = resetMatchedTodayIfNewDay(carry);

    // ➕ Add BV to carry
    carry[side] += coins;
    console.log(`➕ Carry Updated | Left: ${carry.leftCarry} | Right: ${carry.rightCarry}`);

    const leftBV = carry.leftCarry;
    const rightBV = carry.rightCarry;
    const matchableBV = Math.min(leftBV, rightBV);

    const cap = getDailyMatchingCapByStatus(parent.status);
    const remainingCap = cap - carry.matchedToday;

    if (matchableBV > 0) {
      console.log(`🧮 Can Match: ${matchableBV}, Remaining Cap: ${remainingCap}`);

      const incomeBV = Math.min(matchableBV, remainingCap); // BV eligible for income
      const income = incomeBV * 0.05;

      if (incomeBV > 0) {
        console.log(`💸 Income: ₹${income} from ${incomeBV} BV`);

        await creditToWallet(parent._id, income);
        await updateMonthlyStats(parent._id, income);
      } else {
        console.log(`⛔ Cap reached. No income for today.`);
      }

      // Always log full matching event (even if income = 0)
      await MatchingLog.create({
        userId: parent._id,
        matchedAmount: matchableBV,
        incomeEarned: income,
        matchBreakdown: { left: leftBV, right: rightBV }
      });

      // 💥 Subtract full matchedBV (not just income BV)
      if (leftBV <= rightBV) {
        carry.leftCarry = 0;
        carry.rightCarry = rightBV - leftBV;
      } else {
        carry.rightCarry = 0;
        carry.leftCarry = leftBV - rightBV;
      }

      // ➕ Update cap only with incomeBV
      carry.matchedToday += incomeBV;

      // 🧾 Track full matching business
      await updateMatchingBusiness(parent._id, "leftCarry", matchableBV);
      await updateMatchingBusiness(parent._id, "rightCarry", matchableBV);
    } else {
      console.log(`⚠️ No matching BV.`);
    }

    await carry.save();
    from = parent._id;
    parentId = parent.parentId;
  }

  console.log(`✅ Matching income calculation completed for user ${userId}`);
};

module.exports = { calculateMatchingIncome };
