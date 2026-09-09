/**
 * ============================================================
 * Health Check Route
 * ============================================================
 * GET /health — Reports the gateway's operational status
 * including connectivity to its dependencies (Redis, MongoDB).
 *
 * Response format:
 *   {
 *     status: "healthy" | "degraded",
 *     uptime: <seconds>,
 *     timestamp: <ISO string>,
 *     services: {
 *       redis: "connected" | "disconnected",
 *       mongodb: "connected" | "disconnected"
 *     }
 *   }
 *
 * "degraded" means the gateway is running but one or more
 * dependencies are unavailable. The gateway can still serve
 * some requests in degraded mode (fail-open for rate limiter).
 * ============================================================
 */

const express = require('express');
const mongoose = require('mongoose');
const redisClient = require('../config/redis');

const router = express.Router();

router.get('/health', (req, res) => {
  // ── Check MongoDB connection state ──
  // mongoose.connection.readyState values:
  //   0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const mongoStatus = mongoose.connection.readyState === 1
    ? 'connected'
    : 'disconnected';

  // ── Check Redis connection state ──
  const redisStatus = redisClient.status === 'ready'
    ? 'connected'
    : 'disconnected';

  // ── Determine overall status ──
  const isHealthy = mongoStatus === 'connected' && redisStatus === 'connected';

  const healthReport = {
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      redis: redisStatus,
      mongodb: mongoStatus,
    },
  };

  // Return 200 if healthy, 503 if degraded
  const statusCode = isHealthy ? 200 : 503;
  res.status(statusCode).json(healthReport);
});

module.exports = router;
