/**
 * ============================================================
 * RequestLog Model
 * ============================================================
 * Mongoose schema for the "request_logs" collection.
 * Every incoming request is logged here for audit trail,
 * behavior analysis (Phase 2), and dashboard display (Phase 3).
 *
 * Implements FR-1.2: Log every request's metadata
 *   (IP, endpoint, method, timestamp, headers)
 * Implements FR-1.5: Request fingerprint for identity tracking
 * ============================================================
 */

const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema(
  {
    // Client IP address (supports both IPv4 and IPv6)
    ip: {
      type: String,
      required: true,
      index: true,   // Indexed for fast per-IP queries
    },

    // The API endpoint that was accessed (e.g., "/api/users")
    endpoint: {
      type: String,
      required: true,
    },

    // HTTP method (GET, POST, PUT, DELETE, etc.)
    method: {
      type: String,
      required: true,
    },

    // HTTP status code returned to the client
    statusCode: {
      type: Number,
    },

    // When the request was received
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,   // Indexed for time-range queries (NFR-4)
    },

    // Full request headers (stored as a flexible object)
    headers: {
      type: mongoose.Schema.Types.Mixed,
    },

    // SHA-256 fingerprint: IP + header hash (FR-1.5)
    // Used to detect identity rotation attempts
    fingerprint: {
      type: String,
      index: true,
    },

    // Authenticated user info (if available after auth middleware)
    userId: {
      type: String,
    },

    // User's role from JWT (user/admin)
    userRole: {
      type: String,
    },
  },
  {
    // Store in the "request_logs" collection
    collection: 'request_logs',

    // Auto-add createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model('RequestLog', requestLogSchema);
