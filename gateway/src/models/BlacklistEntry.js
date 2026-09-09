/**
 * ============================================================
 * BlacklistEntry Model
 * ============================================================
 * Mongoose schema for the "blacklist" collection.
 * Stores IP addresses that are blocked from accessing the API.
 *
 * Implements FR-1.4: IP blacklisting, dynamically updatable.
 *
 * Supports both:
 *   - Permanent blocks (expiresAt = null)
 *   - Temporary blocks (expiresAt = future timestamp)
 *
 * Phase 2 will auto-populate this collection when the AI
 * engine detects sustained malicious behavior (FR-4.2).
 * ============================================================
 */

const mongoose = require('mongoose');

const blacklistEntrySchema = new mongoose.Schema(
  {
    // The blocked IP address
    ip: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Human-readable reason for the block
    reason: {
      type: String,
      default: 'Manually blacklisted',
    },

    // When this entry was created
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // When the block expires (null = permanent)
    // TTL-based temporary blocks for auto-mitigation (FR-4.2)
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    collection: 'blacklist',
  }
);

module.exports = mongoose.model('BlacklistEntry', blacklistEntrySchema);
