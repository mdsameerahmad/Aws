const Wallet = require("../models/Wallet");

const getWalletByUserId = async (userId) => {
  return await Wallet.findOne({ userId });
};

const deductFromWallet = async (userId, walletField, amount) => {
  return await Wallet.findOneAndUpdate(
    { userId },
    { $inc: { [walletField]: -amount } },
    { new: true }
  );
};

module.exports = {
  getWalletByUserId,
  deductFromWallet,
};
