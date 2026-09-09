/**
 * ============================================================
 * MongoDB Connection Module
 * ============================================================
 * Establishes and manages the Mongoose connection to MongoDB.
 * Includes retry logic for containerized environments where
 * MongoDB may not be immediately available on startup.
 *
 * Collections used:
 *   - request_logs   : Every request's metadata (FR-1.2)
 *   - blacklist      : Blocked IP addresses (FR-1.4)
 *   - whitelist      : Trusted IP addresses (FR-1.4)
 *   - api_keys       : Static API key records (FR-1.1)
 * ============================================================
 */

const mongoose = require('mongoose');
const config = require('./index');

/**
 * Connect to MongoDB with automatic retry.
 * In Docker Compose, MongoDB may take a few seconds to become
 * ready even after its healthcheck passes — retries handle this.
 *
 * @param {number} retries - Number of connection attempts remaining
 * @param {number} delay   - Milliseconds to wait between retries
 */
const connectMongoDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(config.mongo.uri, {
        dbName: config.mongo.dbName,
      });
      console.log(`✅ MongoDB connected successfully (attempt ${attempt})`);
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, err.message);
      if (attempt === retries) {
        console.error('💀 Could not connect to MongoDB after all retries. Exiting.');
        process.exit(1);
      }
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectMongoDB;
