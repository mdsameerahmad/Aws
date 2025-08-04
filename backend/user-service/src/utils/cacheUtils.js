const redis = require('./redisClient.js');

// Helper function to get all keys matching a pattern
async function getKeysByPattern(pattern) {
  return new Promise((resolve, reject) => {
    const keys = [];
    const stream = redis.scanStream({
      match: pattern,
      count: 100
    });
    
    stream.on('data', (resultKeys) => {
      keys.push(...resultKeys);
    });
    
    stream.on('end', () => {
      resolve(keys);
    });
    
    stream.on('error', (err) => {
      console.error("Redis scanStream error:", err);
      reject(err);
    });
  });
}

exports.clearUserCache = async (userId) => {
  if (!userId) return;
  
  try {
    // Use patterns to find all keys related to this user
    const patterns = [
      `cache:*${userId}*`, // Any cache key containing the userId
      `cache:*/api/user/${userId}*`, // User profile
      `cache:*/internal/user/${userId}*`, // Internal user data
      `cache:*/api/auth/me*`, // Current user data
      `cache:*/api/admin/users*` // Admin user list
    ];
    
    let totalDeleted = 0;
    
    for (const pattern of patterns) {
      const keys = await getKeysByPattern(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        totalDeleted += keys.length;
        console.log(`🧹 Cleared ${keys.length} keys matching pattern: ${pattern}`);
      }
    }
    
    console.log(`✅ User cache cleared for ${userId}: ${totalDeleted} total keys deleted`);
  } catch (err) {
    console.error(`❌ Error clearing user cache for ${userId}:`, err);
  }
};
