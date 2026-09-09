/**
 * ============================================================
 * Request Logger Middleware
 * ============================================================
 * Logs every incoming request's metadata to MongoDB for:
 *   - Audit trail and compliance (NFR-4)
 *   - Behavior analysis input (Phase 2)
 *   - Dashboard live traffic feed (Phase 3)
 *
 * Implements FR-1.2: Log IP, endpoint, method, timestamp, headers
 * Implements FR-1.5: Generate request fingerprint per request
 *
 * DESIGN DECISION: Logging is non-blocking (fire-and-forget).
 * A failed log write should never block or reject a client
 * request — we log the error and continue.
 * ============================================================
 */

const RequestLog = require('../models/RequestLog');
const { generateFingerprint } = require('../utils/fingerprint');

/**
 * Extract the real client IP address.
 * Handles proxied requests by checking X-Forwarded-For header,
 * falling back to the direct connection address.
 *
 * @param {object} req - Express request object
 * @returns {string}   - Client IP address
 */
function getClientIp(req) {
  // X-Forwarded-For may contain a comma-separated list; take the first
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection.remoteAddress || 'unknown';
}

/**
 * Request logging middleware.
 * Runs FIRST in the middleware chain — before any security
 * checks — so that even blocked requests are logged.
 */
function requestLogger(req, res, next) {
  const clientIp = getClientIp(req);

  // Attach IP to request for use by downstream middleware
  req.clientIp = clientIp;

  // Generate fingerprint for identity rotation detection (FR-1.5)
  const fingerprint = generateFingerprint(clientIp, req.headers);
  req.fingerprint = fingerprint;

  // Build the log entry
  const logEntry = {
    ip: clientIp,
    endpoint: req.originalUrl,
    method: req.method,
    timestamp: new Date(),
    headers: req.headers,
    fingerprint: fingerprint,
  };

  // Capture the response status code after the response is sent
  res.on('finish', () => {
    logEntry.statusCode = res.statusCode;

    // Include authenticated user info if available
    if (req.user) {
      logEntry.userId = req.user.username || req.user.sub || 'unknown';
      logEntry.userRole = req.user.role || 'unknown';
    }

    // Fire-and-forget: save to MongoDB without awaiting
    RequestLog.create(logEntry).catch((err) => {
      console.error('⚠️  Failed to save request log:', err.message);
    });
  });

  // Continue to next middleware immediately
  next();
}

// Export both for reuse by other modules
module.exports = { requestLogger, getClientIp };
