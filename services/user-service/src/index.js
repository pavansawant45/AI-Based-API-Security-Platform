/**
 * ============================================================
 * User Service — Dummy Backend
 * ============================================================
 * A minimal Express app that simulates a protected User API.
 * The gateway proxies authenticated requests here after the
 * full middleware chain (logging, IP filter, rate limit, auth,
 * AI check, RBAC) has passed.
 *
 * Endpoints:
 *   GET /api/users      — Returns all fake users
 *   GET /api/users/:id  — Returns a single user by ID (or 404)
 *
 * This service contains NO authentication logic — the gateway
 * handles all security checks before forwarding requests.
 * ============================================================
 */

const express = require('express');

const app = express();
const PORT = process.env.PORT || 4001;

// ── Fake User Data ──
// Simulates a database of users. In a real system, this would
// come from MongoDB or another data store.
const users = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    department: 'Engineering',
    joinedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    department: 'Marketing',
    joinedAt: '2024-03-22T14:30:00Z',
  },
  {
    id: 3,
    name: 'Carol Williams',
    email: 'carol@example.com',
    role: 'user',
    department: 'Sales',
    joinedAt: '2024-06-10T11:00:00Z',
  },
  {
    id: 4,
    name: 'David Brown',
    email: 'david@example.com',
    role: 'admin',
    department: 'Engineering',
    joinedAt: '2024-08-01T08:00:00Z',
  },
  {
    id: 5,
    name: 'Eve Davis',
    email: 'eve@example.com',
    role: 'user',
    department: 'Support',
    joinedAt: '2025-01-20T10:15:00Z',
  },
];

// ── GET /api/users — List all users ──
app.get('/api/users', (req, res) => {
  console.log(`📋 User Service: GET /api/users`);
  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

// ── GET /api/users/:id — Get a single user ──
app.get('/api/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === userId);

  console.log(`📋 User Service: GET /api/users/${userId}`);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `User with ID ${userId} not found.`,
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

// ── Health check for the service itself ──
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'user-service' });
});

// ── Start server ──
app.listen(PORT, () => {
  console.log(`👤 User Service running on port ${PORT}`);
});
