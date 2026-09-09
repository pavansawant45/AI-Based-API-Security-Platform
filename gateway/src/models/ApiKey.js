/**
 * ============================================================
 * ApiKey Model
 * ============================================================
 * Mongoose schema for the "api_keys" collection.
 * Stores static API keys as an alternative authentication
 * method alongside JWT tokens.
 *
 * Implements FR-1.1: Authenticate via API keys.
 *
 * Each API key has:
 *   - A unique key string (sent in "x-api-key" header)
 *   - A human-readable name (for admin identification)
 *   - A role assignment (user/admin) for RBAC
 *   - An active flag to enable/disable without deletion
 * ============================================================
 */

const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema(
  {
    // The API key string (sent by clients in x-api-key header)
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Human-readable name identifying the key owner/purpose
    name: {
      type: String,
      required: true,
    },

    // Role assigned to this API key (for RBAC checks)
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Whether the key is currently active
    active: {
      type: Boolean,
      default: true,
    },

    // When this key was created
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'api_keys',
  }
);

module.exports = mongoose.model('ApiKey', apiKeySchema);
