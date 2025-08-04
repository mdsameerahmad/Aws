const User = require("../models/User");
// const { clearUserCache } = require("../utils/cacheUtils");

// 🔁 GET /api/admin/users - List all users (name, email, phone only)
exports.getAllUsers = async (req, res) => {
  const users = await User.find({}, "name email phone");
  res.json(users);
};

// 👤 GET /api/admin/user/:id - Full user details
exports.getSingleUser = async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password -resetPasswordToken -resetPasswordExpires"
  ).populate("parentId", "name email")
   .populate("leftUser rightUser", "name email");

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

exports.adminDeleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.isActive) return res.status(400).json({ message: "Cannot delete active user" });

  const parent = user.parentId ? await User.findById(user.parentId) : null;
let replacement = null;
if (user.leftUser) {
  replacement = await User.findById(user.leftUser);
} else if (user.rightUser) {
  replacement = await User.findById(user.rightUser);
}
 // 👈 Only allow left user to rise (if exists)

  // 🛠 Rewire binary tree
  if (parent) {
    if (replacement) {
      // 🧠 Set replacement user's parentId to current user's parent
      await User.findByIdAndUpdate(replacement, { parentId: parent._id });

      // ✅ Reconnect to parent
      if (String(parent.leftUser) === String(user._id)) {
        parent.leftUser = replacement;
      } else if (String(parent.rightUser) === String(user._id)) {
        parent.rightUser = replacement;
      }
    } else {
      // ❌ No replacement — clear pointer
      if (String(parent.leftUser) === String(user._id)) {
        parent.leftUser = null;
      } else if (String(parent.rightUser) === String(user._id)) {
        parent.rightUser = null;
      }
    }
    await parent.save();
  }

  // 🧹 Clean up from all upline level trees
  let sponsor = await User.findById(user.referredBy);
  let level = 1;

  while (sponsor && level <= 30) {
    await User.updateOne(
      { _id: sponsor._id },
      {
        $pull: {
          "levelTree.$[lvl].users": user._id,
        },
      },
      {
        arrayFilters: [{ "lvl.level": level }],
      }
    );
    sponsor = sponsor.referredBy ? await User.findById(sponsor.referredBy) : null;
    level++;
  }

  // ✅ Delete user
  await User.findByIdAndDelete(user._id);
  // await clearUserCache(user._id); // clear profile cache after delete

  res.json({ message: "User deleted successfully and tree updated" });
};
