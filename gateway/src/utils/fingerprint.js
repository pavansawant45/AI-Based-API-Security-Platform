/**
 * ============================================================
 * Request Fingerprint Utility
 * ============================================================
 * Generates a unique fingerprint for each request by hashing
 * the client IP together with sorted request headers.
 *
 * Purpose (FR-1.5):
 *   Detect identity rotation attempts — if an attacker changes
 *   their IP but uses the same browser/client configuration,
 *   the header hash will remain identical, linking the requests.
 *
 * Algorithm:
 *   fingerprint = SHA-256( clientIP + "|" + sortedHeadersJSON )
 * ============================================================
 */

const crypto = require('crypto');

/**
 * Generate a request fingerprint from IP and headers.
 *
 * @param {string} ip      - Client IP address
 * @param {object} headers - HTTP request headers object
 * @returns {string}       - Hex-encoded SHA-256 fingerprint
 */
function generateFingerprint(ip, headers) {
  // Select a stable subset of headers for fingerprinting.
  // These headers are typically consistent per client but
  // vary across different clients/browsers.
  const fingerprintHeaders = {
    'user-agent': headers['user-agent'] || '',
    'accept': headers['accept'] || '',
    'accept-language': headers['accept-language'] || '',
    'accept-encoding': headers['accept-encoding'] || '',
  };

  // Sort keys for deterministic hashing
  const sortedHeaderString = JSON.stringify(fingerprintHeaders, Object.keys(fingerprintHeaders).sort());

  // Combine IP and headers, then hash
  const rawString = `${ip}|${sortedHeaderString}`;
  return crypto.createHash('sha256').update(rawString).digest('hex');
}

module.exports = { generateFingerprint };
