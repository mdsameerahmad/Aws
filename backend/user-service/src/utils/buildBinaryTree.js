const User = require("../models/User");

const buildBinaryTree = async (userId) => {
  const user = await User.findById(userId).select("name email leftUser rightUser");

  if (!user) return null;

  const left = user.leftUser ? await buildBinaryTree(user.leftUser) : null;
  const right = user.rightUser ? await buildBinaryTree(user.rightUser) : null;

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    children: [left, right].filter(Boolean)
  };
};

module.exports = { buildBinaryTree };
