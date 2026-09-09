/**
 * ============================================================
 * Redis Connection Module
 * ============================================================
 * Creates and exports a shared Redis client using ioredis.
 * Used by:
 *   - rateLimiter middleware  (sliding window counters)
 *   - Health endpoint         (connection status reporting)
 *
 * ioredis automatically handles reconnection, so if Redis
 * restarts, the client will recover without manual intervention.
 * ============================================================
 */

const Redis = require('ioredis');
const config = require('./index');

const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  // Retry strategy: exponential backoff capped at 3 seconds
  retryStrategy(times) {
    const delay = Math.min(times * 200, 3000);
    console.log(`🔄 Redis reconnection attempt ${times}, retrying in ${delay}ms...`);
    return delay;
  },
  // Don't buffer commands while disconnected — fail fast
  enableOfflineQueue: false,
});

// Log connection events for observability
redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

module.exports = redisClient;
