// middlewares/cache.js
const redis = require("../utils/redisClient");

exports.cacheMiddleware = async (req, res, next) => {
  try {
    // Extract userId from params or user object
    const userId = req.params.id || req.user?._id;
    if (!userId) return next(); // Don't cache for unauthenticated users

    // Skip caching for write operations
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}:${userId}`; // Add userId to make cache key more specific
    
    // Debug log to see the exact cache key format
    console.log(`🔑 Cache key format: ${key}`);

    const cached = await redis.get(key);
    if (cached) {
      console.log(`✅ Cache hit for ${key}`);
      return res.json(JSON.parse(cached));
    }

    // Override res.json to cache response
    res.sendResponse = res.json;
    res.json = async (body) => {
      // Store in Redis with 1-hour expiration to ensure eventual refresh
      await redis.set(key, JSON.stringify(body), 'EX', 3600);
    
      res.sendResponse(body);
    };

    next();
  } catch (err) {
    console.error(`❌ Cache error: ${err.message}`);
    next(); // Continue without caching on error
  }
};
