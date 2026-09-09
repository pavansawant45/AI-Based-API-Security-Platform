/**
 * ============================================================
 * Centralized Configuration Module
 * ============================================================
 * All application configuration is sourced from environment
 * variables. This module provides a single import point for
 * config values, with sensible defaults for development.
 *
 * IMPORTANT: Never hardcode secrets or service URLs in code.
 * All values must come from the .env file.
 * ============================================================
 */

require('dotenv').config();

const config = {
  // --- Server ---
  port: parseInt(process.env.GATEWAY_PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // --- JWT ---
  jwt: {
    secret: process.env.JWT_SECRET || 'default-dev-secret',
    expiration: process.env.JWT_EXPIRATION || '1h',
  },

  // --- MongoDB ---
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/api_security_platform',
    dbName: process.env.MONGO_DB_NAME || 'api_security_platform',
  },

  // --- Redis ---
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },

  // --- Rate Limiting ---
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,       // Max requests per window
    windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) || 60, // Window size in seconds
  },

  // --- Backend Service URLs (for proxy routing) ---
  services: {
    userService: process.env.USER_SERVICE_URL || 'http://localhost:4001',
    orderService: process.env.ORDER_SERVICE_URL || 'http://localhost:4002',
  },
};

module.exports = config;
