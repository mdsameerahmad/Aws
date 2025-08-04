// middlewares/cache.js
const redis = require("../utils/redisClient");

exports.cacheMiddleware = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user?._id;
    if (!userId) return next(); // Skip caching if no userId is available

    // Skip caching for write operations
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}:${userId}`; // Add userId to make cache key more specific
    
    // Debug log to see the exact cache key format
    console.log(`🔑 Cache key format: ${key}`);

    const cached = await redis.get(key);
    if (cached) {
    
      return res.json(JSON.parse(cached));
    }

    res.sendResponse = res.json;
    res.json = async (body) => {
      // Store in Redis with expiration - ensures data will eventually be refreshed
      await redis.set(key, JSON.stringify(body), 'EX', 3600); // 1 hour expiration
    
      res.sendResponse(body);
    };

    next();
  } catch (err) {
    console.error("❌ Redis cache middleware error:", err.message);
    next(); // Don't break the route if cache fails
  }
};
