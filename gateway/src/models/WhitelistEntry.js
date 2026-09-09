/**
 * ============================================================
 * WhitelistEntry Model
 * ============================================================
 * Mongoose schema for the "whitelist" collection.
 * Stores trusted IP addresses that bypass certain security
 * checks (e.g., rate limiting).
 *
 * Implements FR-1.4: IP whitelisting, dynamically updatable.
 * ============================================================
 */

const mongoose = require('mongoose');

const whitelistEntrySchema = new mongoose.Schema(
  {
    // The trusted IP address
    ip: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Human-readable reason for whitelisting
    reason: {
      type: String,
      default: 'Manually whitelisted',
    },

    // When this entry was created
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'whitelist',
  }
);

module.exports = mongoose.model('WhitelistEntry', whitelistEntrySchema);
