/**
 * ============================================================
 * Auth Utility Routes (Development/Testing Only)
 * ============================================================
 * Provides endpoints to generate test JWT tokens for
 * development and testing purposes.
 *
 * POST /auth/token
 *   Body: { "username": "testuser", "role": "user" | "admin" }
 *   Returns: { "token": "<JWT>", "expiresIn": "1h" }
 *
 * ⚠️  WARNING: In production, tokens should be issued by a
 * dedicated Identity Provider (IdP). This endpoint exists
 * solely for testing the gateway middleware chain.
 * ============================================================
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/index');

const router = express.Router();

/**
 * POST /auth/token — Generate a signed JWT for testing.
 *
 * The generated token includes:
 *   - username: Identifies the user
 *   - role: "user" or "admin" (used by RBAC middleware)
 *   - iat: Issued-at timestamp (auto-set by jwt.sign)
 *   - exp: Expiration timestamp (configured via JWT_EXPIRATION)
 */
router.post('/token', (req, res) => {
  const { username, role } = req.body;

  // Validate required fields
  if (!username) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Username is required in the request body.',
    });
  }

  // Validate role
  const validRoles = ['user', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'user';

  // Build JWT payload
  const payload = {
    username: username,
    role: userRole,
  };

  // Sign the token
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiration,
  });

  console.log(`🔑 Token generated for user "${username}" with role "${userRole}"`);

  res.status(200).json({
    token: token,
    username: username,
    role: userRole,
    expiresIn: config.jwt.expiration,
  });
});

module.exports = router;
