// income-service/src/utils/treeCount.js
const { getUserById } = require("../services/userService");

/**
 * Counts the number of users in a subtree (including all descendants)
 * Uses a more efficient approach with memoization to avoid redundant API calls
 * @param {string} userId - The ID of the root user of the subtree
 * @param {Object} cache - Optional cache object to store already counted users
 * @returns {Promise<number>} - The total count of users in the subtree
 */
const countSubtreeUsers = async (userId, cache = {}) => {
  // Return from cache if already counted this subtree
  if (cache[userId]) return cache[userId];
  
  // Get user data
  const user = await getUserById(userId);
  if (!user) return 0;

  // Count this user
  let count = 1;
  
  // Recursively count left subtree
  if (user.leftUser) {
    count += await countSubtreeUsers(user.leftUser, cache);
  }
  
  // Recursively count right subtree
  if (user.rightUser) {
    count += await countSubtreeUsers(user.rightUser, cache);
  }

  // Cache the result
  cache[userId] = count;
  return count;
};

module.exports = { countSubtreeUsers };

