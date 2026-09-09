/**
 * ============================================================
 * Proxy Routing Configuration
 * ============================================================
 * Configures reverse proxy routing from the gateway to the
 * backend microservices using http-proxy-middleware.
 *
 * Routes:
 *   /api/users/*   → User Service   (port 4001)
 *   /api/orders/*  → Order Service  (port 4002)
 *
 * By the time a request reaches the proxy, it has already
 * passed through the full middleware chain:
 *   logging → IP filter → rate limit → auth → AI check → RBAC
 *
 * DESIGN: Each proxy route is exported as a configured
 * middleware function, applied with role-specific RBAC in
 * the main app setup (index.js).
 * ============================================================
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config/index');

/**
 * Proxy to User Service.
 * Accessible by both "user" and "admin" roles.
 */
const userServiceProxy = createProxyMiddleware({
  target: config.services.userService,
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  // Log proxy events for debugging
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(`➡️  Proxying ${req.method} ${req.originalUrl} → User Service`);
    },
    error: (err, req, res) => {
      console.error('❌ User Service proxy error:', err.message);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'User Service is unavailable.',
      });
    },
  },
});

/**
 * Proxy to Order Service.
 * Accessible only by "admin" role (enforced by RBAC in index.js).
 */
const orderServiceProxy = createProxyMiddleware({
  target: config.services.orderService,
  changeOrigin: true,
  pathRewrite: (path, req) => req.originalUrl,
  on: {
    proxyReq: (proxyReq, req) => {
      console.log(`➡️  Proxying ${req.method} ${req.originalUrl} → Order Service`);
    },
    error: (err, req, res) => {
      console.error('❌ Order Service proxy error:', err.message);
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'Order Service is unavailable.',
      });
    },
  },
});

module.exports = { userServiceProxy, orderServiceProxy };
