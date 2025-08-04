


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


exports.clearWalletCache = async (userId) => {
  if (!userId) return;
  
  try {
    // First, try to clear all cache keys for this user using pattern matching
    const userPatterns = [
      `cache:*${userId}*`, // Match any cache key containing the userId
      `cache:*user/${userId}*`, // Match user-specific routes
      `cache:*products*${userId}*`, // Match product routes with userId
      `cache:*purchases*${userId}*`, // Match purchase routes with userId
      `cache:*/admin/pending-requests*`, // Match admin pending requests summary
      `cache:*/admin/user/*/pending-topup-requests*`, // Match admin pending topup requests
      `cache:*/admin/user/*/pending-withdraw-requests*`, // Match admin pending withdraw requests
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
    
    // Fallback to specific keys if pattern matching doesn't work or finds no keys
    if (allKeys.length === 0) {
      // Match the cache key format used in cacheMiddleware.js (cache:originalUrl:userId)
      const specificKeys = [
        // Wallet service internal routes
        `cache:/user/${userId}/wallet:${userId}`,
        `cache:/api/user/${userId}/wallet:${userId}`,
        `cache:/internal/wallet/${userId}:${userId}`,
        `cache:/user/topup/${userId}:${userId}`,
        `cache:/api/user/topup/${userId}:${userId}`,
        `cache:/user/withdraw/${userId}:${userId}`,
        `cache:/api/user/withdraw/${userId}:${userId}`,
        `cache:/admin/user/${userId}/pending-topup-requests:${userId}`,
        `cache:/admin/user/${userId}/pending-withdraw-requests:${userId}`,
        `cache:/admin/pending-requests:${userId}`,
        `cache:/products/admin/user/${userId}/pending-purchases:${userId}`,
        `cache:/products/admin/user/${userId}/approved-purchases:${userId}`,
        `cache:/products/my-purchases:${userId}`,
        
        // API Gateway routes
        `cache:/api/wallet/admin/user/${userId}/pending-topup-requests:${userId}`,
        `cache:/api/wallet/admin/user/${userId}/pending-withdraw-requests:${userId}`,
        `cache:/api/wallet/admin/pending-requests:${userId}`,
        `cache:/api/purchase/products/admin/user/${userId}/pending-purchases:${userId}`,
        `cache:/api/purchase/products/admin/user/${userId}/approved-purchases:${userId}`,
        `cache:/api/purchase/products/my-purchases:${userId}`,
        
        // Legacy keys without the userId suffix
        `cache:/user/${userId}/wallet`,
        `cache:/api/user/${userId}/wallet`,
        `cache:/internal/wallet/${userId}`,
        `cache:/user/topup/${userId}`,
        `cache:/api/user/topup/${userId}`,
        `cache:/user/withdraw/${userId}`,
        `cache:/api/user/withdraw/${userId}`,
        `cache:/admin/user/${userId}/pending-topup-requests`,
        `cache:/admin/user/${userId}/pending-withdraw-requests`,
        `cache:/admin/pending-requests`,
        `cache:/products/admin/user/${userId}/pending-purchases`,
        `cache:/products/admin/user/${userId}/approved-purchases`,
        `cache:/products/my-purchases`,
        `cache:/api/purchase/products/admin/user/${userId}/pending-purchases`,
        `cache:/api/purchase/products/admin/user/${userId}/approved-purchases`,
        `cache:/api/purchase/products/my-purchases`,
        
        // Exact format from cacheMiddleware (with leading slash)
        `cache:/products/request:${userId}`,
        `cache:/products/my-purchases:${userId}`,
        `cache:/products/admin/user/${userId}/pending-purchases:${userId}`,
        `cache:/products/admin/user/${userId}/approved-purchases:${userId}`,
        `cache:/products/admin/${userId}/pending-purchases:${userId}`,
        `cache:/products/admin/${userId}/approved-purchases:${userId}`,
        
        `cache:/api/purchase/products/request:${userId}`,
        `cache:/api/purchase/products/my-purchases:${userId}`,
        `cache:/api/purchase/products/admin/user/${userId}/pending-purchases:${userId}`,
        `cache:/api/purchase/products/admin/user/${userId}/approved-purchases:${userId}`,
        
        // Exact format from cacheMiddleware (without leading slash)
        `cache:products/request:${userId}`,
        `cache:products/my-purchases:${userId}`,
        `cache:products/admin/user/${userId}/pending-purchases:${userId}`,
        `cache:products/admin/user/${userId}/approved-purchases:${userId}`,
        `cache:products/admin/${userId}/pending-purchases:${userId}`,
        `cache:products/admin/${userId}/approved-purchases:${userId}`,
        
        `cache:api/purchase/products/request:${userId}`,
        `cache:api/purchase/products/my-purchases:${userId}`,
        `cache:api/purchase/products/admin/user/${userId}/pending-purchases:${userId}`,
        `cache:api/purchase/products/admin/user/${userId}/approved-purchases:${userId}`,
      ];
      
      allKeys = specificKeys;
    }
    
    // Remove duplicates
    allKeys = [...new Set(allKeys)];
    
    // Delete all keys
    if (allKeys.length > 0) {
      await Promise.all(allKeys.map((key) => redis.del(key)));
      console.log(`🧹 Wallet cache cleared for ${userId} (${allKeys.length} cache keys)`);
    } else {
      console.log(`⚠️ No cache keys found for user ${userId}`);
    }
  } catch (err) {
    console.error(`❌ Error clearing wallet cache for ${userId}:`, err);
  }
}
