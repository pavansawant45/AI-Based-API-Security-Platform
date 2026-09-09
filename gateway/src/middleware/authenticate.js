/**
 * ============================================================
 * Authentication Middleware
 * ============================================================
 * Validates incoming requests using one of two methods:
 *   1. JWT Bearer Token — Authorization: Bearer <token>
 *   2. Static API Key    — x-api-key: <key>
 *
 * Implements FR-1.1: Authenticate every incoming request
 *   via JWT tokens or API keys.
 *
 * On successful authentication, attaches the user's identity
 * and role to req.user for use by downstream middleware (RBAC).
 *
 * Unauthenticated requests receive a 401 Unauthorized response.
 * ============================================================
 */

const jwt = require('jsonwebtoken');
const config = require('../config/index');
const ApiKey = require('../models/ApiKey');

async function authenticate(req, res, next) {
  // ── Try JWT Bearer Token first ──
  const authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7); // Remove "Bearer " prefix

    try {
      // Verify the JWT signature and decode the payload
      const decoded = jwt.verify(token, config.jwt.secret);

      // Attach decoded user info to the request
      // Expected JWT payload: { username, role, iat, exp }
      req.user = {
        username: decoded.username || decoded.sub,
        role: decoded.role || 'user',
        authMethod: 'jwt',
      };

      return next();
    } catch (err) {
      // Token is present but invalid/expired
      return res.status(401).json({
        error: 'Unauthorized',
        message: err.name === 'TokenExpiredError'
          ? 'JWT token has expired. Please obtain a new token.'
          : 'Invalid JWT token.',
      });
    }
  }

  // ── Try API Key ──
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    try {
      // Look up the API key in MongoDB
      const keyRecord = await ApiKey.findOne({ key: apiKey, active: true });

      if (keyRecord) {
        // Attach API key identity to the request
        req.user = {
          username: keyRecord.name,
          role: keyRecord.role,
          authMethod: 'api-key',
        };

        return next();
      }

      // API key provided but not found or inactive
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or inactive API key.',
      });
    } catch (err) {
      console.error('⚠️  API key lookup error:', err.message);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication service unavailable.',
      });
    }
  }

  // ── No credentials provided ──
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Authentication required. Provide a JWT Bearer token or x-api-key header.',
  });
}

module.exports = authenticate;
