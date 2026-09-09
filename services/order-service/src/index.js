/**
 * ============================================================
 * Order Service — Dummy Backend
 * ============================================================
 * A minimal Express app that simulates a protected Order API.
 * This endpoint is admin-only — the gateway enforces RBAC
 * before proxying requests here.
 *
 * Endpoints:
 *   GET /api/orders — Returns all fake orders (admin-only)
 *
 * This service contains NO authentication or authorization
 * logic — the gateway handles all security checks.
 * ============================================================
 */

const express = require('express');

const app = express();
const PORT = process.env.PORT || 4002;

// ── Fake Order Data ──
// Simulates a database of orders with sensitive financial data.
// Only admin-role users should be able to access this information.
const orders = [
  {
    id: 'ORD-001',
    customerId: 1,
    customerName: 'Alice Johnson',
    items: [
      { product: 'Enterprise API License', quantity: 1, price: 2999.00 },
      { product: 'Priority Support Plan', quantity: 1, price: 499.00 },
    ],
    total: 3498.00,
    status: 'completed',
    createdAt: '2025-07-15T10:30:00Z',
  },
  {
    id: 'ORD-002',
    customerId: 2,
    customerName: 'Bob Smith',
    items: [
      { product: 'Starter API Package', quantity: 1, price: 199.00 },
    ],
    total: 199.00,
    status: 'pending',
    createdAt: '2025-08-01T14:00:00Z',
  },
  {
    id: 'ORD-003',
    customerId: 3,
    customerName: 'Carol Williams',
    items: [
      { product: 'Enterprise API License', quantity: 2, price: 2999.00 },
      { product: 'Data Analytics Add-on', quantity: 1, price: 799.00 },
    ],
    total: 6797.00,
    status: 'processing',
    createdAt: '2025-08-10T09:15:00Z',
  },
  {
    id: 'ORD-004',
    customerId: 5,
    customerName: 'Eve Davis',
    items: [
      { product: 'Starter API Package', quantity: 1, price: 199.00 },
      { product: 'Priority Support Plan', quantity: 1, price: 499.00 },
    ],
    total: 698.00,
    status: 'completed',
    createdAt: '2025-08-11T16:45:00Z',
  },
];

// ── GET /api/orders — List all orders (admin-only) ──
app.get('/api/orders', (req, res) => {
  console.log(`📦 Order Service: GET /api/orders`);
  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// ── Health check for the service itself ──
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'order-service' });
});

// ── Start server ──
app.listen(PORT, () => {
  console.log(`📦 Order Service running on port ${PORT}`);
});
