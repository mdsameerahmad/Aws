// src/utils/placement.js
const User = require('../models/User');

const findBinaryPlacement = async (rootId, direction = 'left') => {
  let currentId = rootId;

  while (true) {
    const currentUser = await User.findById(currentId);
    if (!currentUser) throw new Error("User not found");

    if (direction === 'left') {
      if (!currentUser.leftUser) {
        return { parentId: currentId, position: 'left' };
      }
      currentId = currentUser.leftUser;
    } else {
      if (!currentUser.rightUser) {
        return { parentId: currentId, position: 'right' };
      }
      currentId = currentUser.rightUser;
    }
  }
};


const updateLevelTree = async (sponsorId, newUserId) => {
  let current = await User.findById(sponsorId);
  let level = 1; // start from 1

  while (current && level <= 30) {
    const existingLevel = current.levelTree.find(lvl => lvl.level === level);
    if (existingLevel) {
      await User.updateOne(
        { _id: current._id, 'levelTree.level': level },
        { $push: { 'levelTree.$.users': newUserId } }
      );
    } else {
      await User.findByIdAndUpdate(current._id, {
        $push: {
          levelTree: {
            level: level,
            users: [newUserId]
          }
        }
      });
    }

    current = await User.findById(current.referredBy);
    level++;
  }

  return level - 1;
};

module.exports = { findBinaryPlacement, updateLevelTree };
