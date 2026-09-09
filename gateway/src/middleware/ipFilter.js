/**
 * ============================================================
 * IP Filter Middleware
 * ============================================================
 * Checks incoming requests against MongoDB blacklist and
 * whitelist collections. Runs AFTER logging so that even
 * blocked requests appear in the audit trail.
 *
 * Implements FR-1.4: IP whitelisting and blacklisting,
 *   dynamically updatable via MongoDB.
 *
 * Logic:
 *   1. If IP is in blacklist AND the block hasn't expired → 403
 *   2. If IP is in whitelist → mark req.isWhitelisted = true
 *      (downstream middleware like rateLimiter can skip checks)
 *   3. Otherwise → pass through
 *
 * DESIGN DECISION: We query MongoDB on every request for
 * dynamic updates. In production, this should be cached in
 * Redis with a short TTL for performance. For Phase 1, the
 * direct query is acceptable and simpler to debug.
 * ============================================================
 */

const BlacklistEntry = require('../models/BlacklistEntry');
const WhitelistEntry = require('../models/WhitelistEntry');

async function ipFilter(req, res, next) {
  const clientIp = req.clientIp;

  try {
    // ── Step 1: Check blacklist ──
    const blacklistEntry = await BlacklistEntry.findOne({ ip: clientIp });

    if (blacklistEntry) {
      // Check if the block has expired (temporary blocks)
      if (blacklistEntry.expiresAt && new Date() > blacklistEntry.expiresAt) {
        // Block has expired — remove it and allow the request
        await BlacklistEntry.deleteOne({ ip: clientIp });
        console.log(`🔓 Expired blacklist entry removed for IP: ${clientIp}`);
      } else {
        // Block is active — reject the request
        console.log(`🚫 Blocked request from blacklisted IP: ${clientIp}`);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Your IP address has been blacklisted.',
          reason: blacklistEntry.reason,
        });
      }
    }

    // ── Step 2: Check whitelist ──
    const whitelistEntry = await WhitelistEntry.findOne({ ip: clientIp });

    if (whitelistEntry) {
      // Mark as whitelisted so rate limiter can skip this IP
      req.isWhitelisted = true;
    }

    // ── Step 3: Continue to next middleware ──
    next();
  } catch (err) {
    // Database errors should not block requests — log and continue
    console.error('⚠️  IP filter error:', err.message);
    next();
  }
}

module.exports = ipFilter;
