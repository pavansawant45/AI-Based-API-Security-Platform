/**
 * ============================================================
 * RBAC (Role-Based Access Control) Middleware
 * ============================================================
 * Enforces role-based access control on protected routes.
 * After authentication (JWT or API key), req.user.role contains
 * the user's role ("user" or "admin").
 *
 * This middleware is a higher-order function — it returns a
 * middleware configured for specific allowed roles:
 *
 *   app.use('/api/orders', rbac(['admin']), orderProxy);
 *
 * Implements Section 6.1: Unauthorized role access detection.
 *
 * Returns 403 Forbidden when the user's role is not in the
 * list of allowed roles for the route.
 * ============================================================
 */

/**
 * Create an RBAC middleware that restricts access to users
 * with one of the specified roles.
 *
 * @param {string[]} allowedRoles - Array of roles permitted to access the route
 * @returns {function} Express middleware function
 *
 * @example
 *   // Only admins can access order routes
 *   app.use('/api/orders', rbac(['admin']), orderProxy);
 *
 *   // Both users and admins can access user routes
 *   app.use('/api/users', rbac(['user', 'admin']), userProxy);
 */
function rbac(allowedRoles = []) {
  return (req, res, next) => {
    // req.user should be set by the authenticate middleware
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required before authorization check.',
      });
    }

    const userRole = req.user.role;

    // Check if the user's role is in the allowed list
    if (!allowedRoles.includes(userRole)) {
      console.log(
        `🔒 RBAC denied: user "${req.user.username}" with role "${userRole}" ` +
        `attempted to access ${req.method} ${req.originalUrl} ` +
        `(requires: ${allowedRoles.join(' or ')})`
      );

      return res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. This resource requires one of the following roles: ${allowedRoles.join(', ')}.`,
        yourRole: userRole,
        requiredRoles: allowedRoles,
      });
    }

    // Role is allowed — proceed
    next();
  };
}

module.exports = rbac;
