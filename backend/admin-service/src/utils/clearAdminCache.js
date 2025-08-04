// src/utils/clearAdminCache.js
const redis = require('./redisClient.js');

// Utility to delete all matching keys
const deleteMatchingKeys = async (pattern) => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`🧹 Cleared cache for pattern: ${pattern}`);
  } else {
    console.log(`⚠️ No cache found for pattern: ${pattern}`);
  }
};

exports.clearAdminCache = async (userId) => {
  if (!userId) return;
  
  try {
    // Static routes (not user-specific)
    await deleteMatchingKeys(`cache:/api/admin/users*`);
    await deleteMatchingKeys(`cache:/api/admin/dashboard*`);
    await deleteMatchingKeys(`cache:*/admin/pending-requests*`); // Clear pending requests summary

    // Dynamic route (user-specific)
    await deleteMatchingKeys(`cache:/api/admin/user/${userId}*`);
    await deleteMatchingKeys(`cache:*/admin/user/${userId}/*`); // Clear user-specific admin routes
    
    // Clear wallet-related cache for this user
    await deleteMatchingKeys(`cache:*/user/${userId}/wallet*`);
    await deleteMatchingKeys(`cache:*/user/topup/${userId}*`);
    await deleteMatchingKeys(`cache:*/user/withdraw/${userId}*`);

    console.log(`✅ Cleared admin-related cache for userId: ${userId}`);
  } catch (err) {
    console.error("❌ Error clearing admin cache:", err.message);
  }
};
