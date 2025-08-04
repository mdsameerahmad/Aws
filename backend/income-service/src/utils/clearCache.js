// utils/clearCache.js
const redis = require("./redisClient");

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

exports.clearBusinessCache = async (userId) => {
  if (!userId) return;
  
  try {
    // Use pattern matching to find all keys related to this user
    const userPatterns = [
      `cache:*/business/${userId}*`,
      `cache:*/api/income/business/${userId}*`,
      `cache:*/api/income/topup-trigger*`,
    ];
    
    let allKeys = [];
    
    // Get all keys matching our patterns
    for (const pattern of userPatterns) {
      try {
        const keys = await getKeysByPattern(pattern);
        allKeys.push(...keys);
      } catch (err) {
        console.error(`Error getting keys for pattern ${pattern}:`, err);
      }
    }
    
    // Remove duplicates
    allKeys = [...new Set(allKeys)];
    
    // Delete all keys
    if (allKeys.length > 0) {
      await Promise.all(allKeys.map((key) => redis.del(key)));
      console.log(`🧹 Business cache cleared for ${userId} (${allKeys.length} cache keys)`);
    } else {
      console.log(`⚠️ No cache keys found for user ${userId}`);
    }
  } catch (err) {
    console.error(`❌ Error clearing business cache for ${userId}:`, err);
  }
};
