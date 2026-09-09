/**
 * ============================================================
 * API Security Gateway — Main Entry Point
 * ============================================================
 * This is the core Express application that sits between
 * clients and backend services. It processes every request
 * through a sequential middleware chain before proxying to
 * the appropriate backend.
 *
 * MIDDLEWARE CHAIN (in execution order):
 *   1. requestLogger  — Logs metadata to MongoDB (FR-1.2)
 *   2. ipFilter       — Checks blacklist/whitelist (FR-1.4)
 *   3. rateLimiter    — Redis-backed req/min limit (FR-1.3)
 *   4. authenticate   — JWT or API key validation (FR-1.1)
 *   5. aiThreatCheck  — AI risk scoring [Phase 2 placeholder]
 *   6. rbac + proxy   — Role check + forward to backend
 *
 * ARCHITECTURE NOTES:
 *   - The middleware chain is designed for easy insertion.
 *     Phase 2 additions (behavior analysis, AI scoring,
 *     honeypot detection) slot between steps 4 and 6.
 *   - Health endpoint bypasses the security chain (no auth
 *     required) so monitoring tools can check status.
 *   - Auth token generation endpoint also bypasses auth
 *     (it's how you GET a token in the first place).
 * ============================================================
 */

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

// ── Configuration ──
const config = require('./config/index');
const connectMongoDB = require('./config/db');

// ── Middleware ──
const { requestLogger } = require('./middleware/requestLogger');
const ipFilter = require('./middleware/ipFilter');
const rateLimiter = require('./middleware/rateLimiter');
const authenticate = require('./middleware/authenticate');
const aiThreatCheck = require('./middleware/aiThreatCheck');
const rbac = require('./middleware/rbac');

// ── Routes ──
const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const { userServiceProxy, orderServiceProxy } = require('./routes/proxy');

// ── Initialize Express ──
const app = express();

// ============================================================
// GLOBAL MIDDLEWARE (applied to ALL requests)
// ============================================================

// Security headers (X-Frame-Options, X-XSS-Protection, etc.)
app.use(helmet());

// CORS — allow all origins in development
app.use(cors());

// Parse JSON request bodies (needed for POST /auth/token)
app.use(express.json());

// HTTP request logging to console (dev format)
app.use(morgan('dev'));

// ============================================================
// PUBLIC ROUTES (no authentication required)
// ============================================================

// Health check — must be accessible by monitoring tools
app.use('/', healthRouter);

// Token generation — must be accessible to get a token
app.use('/auth', authRouter);

// ============================================================
// SECURITY MIDDLEWARE CHAIN (applied to protected routes)
// ============================================================
// These run in the order they are declared. The order matters:
//
//   1. Log first — even blocked requests appear in the audit trail
//   2. IP filter — block known bad actors immediately
//   3. Rate limit — prevent resource exhaustion before auth
//   4. Authenticate — verify identity
//   5. AI threat check — behavioral analysis [Phase 2]
//
// After this chain, route-specific RBAC is applied per proxy.
// ============================================================

app.use('/api', requestLogger);   // Step 1: Log the request
app.use('/api', ipFilter);        // Step 2: Check blacklist/whitelist
app.use('/api', rateLimiter);     // Step 3: Enforce rate limits
app.use('/api', authenticate);    // Step 4: Verify JWT or API key
app.use('/api', aiThreatCheck);   // Step 5: AI scoring (placeholder)

// ============================================================
// PROTECTED PROXY ROUTES (with role-based access control)
// ============================================================

// User Service — accessible by both "user" and "admin" roles
app.use('/api/users', rbac(['user', 'admin']), userServiceProxy);

// Order Service — accessible by "admin" role ONLY
app.use('/api/orders', rbac(['admin']), orderServiceProxy);

// ============================================================
// FALLBACK — 404 for unmatched routes
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found on this gateway.`,
  });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error('💥 Unhandled error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong.',
  });
});

// ============================================================
// START SERVER
// ============================================================

async function startServer() {
  try {
    // Connect to MongoDB (with retry logic)
    await connectMongoDB();

    // Redis connects automatically via ioredis (see config/redis.js)

    // Start listening
    app.listen(config.port, () => {
      console.log('\n============================================');
      console.log('  🛡️  API Security Gateway');
      console.log('============================================');
      console.log(`  Environment : ${config.nodeEnv}`);
      console.log(`  Port        : ${config.port}`);
      console.log(`  MongoDB     : ${config.mongo.uri}`);
      console.log(`  Redis       : ${config.redis.host}:${config.redis.port}`);
      console.log(`  User Svc    : ${config.services.userService}`);
      console.log(`  Order Svc   : ${config.services.orderService}`);
      console.log('============================================');
      console.log('  Middleware chain:');
      console.log('    1. requestLogger  → MongoDB');
      console.log('    2. ipFilter       → Blacklist/Whitelist');
      console.log('    3. rateLimiter    → Redis');
      console.log('    4. authenticate   → JWT / API Key');
      console.log('    5. aiThreatCheck  → [Phase 2 placeholder]');
      console.log('    6. rbac + proxy   → Backend services');
      console.log('============================================\n');
    });
  } catch (err) {
    console.error('💀 Failed to start gateway:', err.message);
    process.exit(1);
  }
}

startServer();
