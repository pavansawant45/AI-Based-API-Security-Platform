/**
 * ============================================================
 * Rate Limiter Middleware
 * ============================================================
 * Redis-backed sliding window rate limiter that enforces a
 * configurable maximum number of requests per IP within a
 * time window.
 *
 * Implements FR-1.3: Configurable rate limits per client/IP.
 *
 * Algorithm: Sliding window counter using Redis INCR + EXPIRE.
 *   - Key format: "ratelimit:<ip>:<window_id>"
 *   - Window ID = Math.floor(currentTimestamp / windowSeconds)
 *   - On each request, INCR the counter. If counter > max → 429.
 *   - Keys auto-expire after the window duration.
 *
 * Configuration (from .env):
 *   - RATE_LIMIT_MAX           : Max requests per window (default 100)
 *   - RATE_LIMIT_WINDOW_SECONDS: Window duration in seconds (default 60)
 *
 * Whitelisted IPs (marked by ipFilter) bypass rate limiting.
 * ============================================================
 */

const redisClient = require('../config/redis');
const config = require('../config/index');

async function rateLimiter(req, res, next) {
  // Whitelisted IPs skip rate limiting
  if (req.isWhitelisted) {
    return next();
  }

  const clientIp = req.clientIp;
  const { max, windowSeconds } = config.rateLimit;

  // Calculate the current time window identifier
  const currentWindow = Math.floor(Date.now() / 1000 / windowSeconds);
  const redisKey = `ratelimit:${clientIp}:${currentWindow}`;

  try {
    // Atomically increment the counter for this IP+window
    const requestCount = await redisClient.incr(redisKey);

    // Set expiry on first request in this window
    if (requestCount === 1) {
      await redisClient.expire(redisKey, windowSeconds);
    }

    // Calculate remaining requests for response headers
    const remaining = Math.max(0, max - requestCount);
    const resetTime = (currentWindow + 1) * windowSeconds;

    // Set standard rate limit headers (RFC 6585 convention)
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': resetTime,
    });

    // Check if limit exceeded
    if (requestCount > max) {
      console.log(`⏱️  Rate limit exceeded for IP: ${clientIp} (${requestCount}/${max})`);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${max} requests per ${windowSeconds} seconds.`,
        retryAfter: windowSeconds,
      });
    }

    next();
  } catch (err) {
    // If Redis is down, allow the request through (fail-open)
    // This prevents Redis outages from blocking all traffic.
    // In Phase 2, the circuit breaker pattern will handle this more elegantly.
    console.error('⚠️  Rate limiter error (failing open):', err.message);
    next();
  }
}

module.exports = rateLimiter;
