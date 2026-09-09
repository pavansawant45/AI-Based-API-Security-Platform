# 🛡️ AI-Based API Security Platform

An intelligent API gateway that sits between clients and backend services, providing real-time security through authentication, rate limiting, IP filtering, and behavioral analysis.

> **Current Phase:** Phase 1 — Core Gateway (see [PRD](docs/PRD.md) for full project scope)

---

## Architecture

```
Client Request
      │
      ▼
┌─────────────────────────────────────────────┐
│           API Security Gateway (:3000)       │
│                                              │
│  1. Request Logger    → MongoDB              │
│  2. IP Filter         → Blacklist/Whitelist  │
│  3. Rate Limiter      → Redis (100 req/min)  │
│  4. Authenticate      → JWT / API Key        │
│  5. AI Threat Check   → [Phase 2 placeholder]│
│  6. RBAC              → Role-based routing   │
│                                              │
└──────────┬────────────────────┬──────────────┘
           │                    │
           ▼                    ▼
   ┌──────────────┐    ┌──────────────┐
   │ User Service  │    │ Order Service │
   │   (:4001)     │    │   (:4002)     │
   │               │    │  (admin-only) │
   │ GET /api/users│    │ GET /api/     │
   │ GET /api/     │    │     orders    │
   │   users/:id   │    │               │
   └──────────────┘    └──────────────┘

   ┌──────────┐    ┌──────────┐
   │  Redis   │    │ MongoDB  │
   │ (:6379)  │    │ (:27017) │
   └──────────┘    └──────────┘
```

---

## Project Structure

```
API_Security_Platform/
├── docker-compose.yml          # Orchestrates all 5 services
├── .env                        # Environment configuration (secrets, ports)
├── .env.example                # Template for .env
├── .gitignore
├── README.md
│
├── gateway/                    # Core API Security Gateway
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js            # Main Express app & middleware chain
│       ├── config/
│       │   ├── index.js        # Centralized env-based config
│       │   ├── db.js           # MongoDB connection (Mongoose)
│       │   └── redis.js        # Redis connection (ioredis)
│       ├── middleware/
│       │   ├── requestLogger.js  # Logs every request to MongoDB
│       │   ├── ipFilter.js       # Blacklist/whitelist IP checks
│       │   ├── rateLimiter.js    # Redis-backed sliding window
│       │   ├── authenticate.js   # JWT + API key validation
│       │   ├── rbac.js           # Role-based access control
│       │   └── aiThreatCheck.js  # Phase 2 placeholder (pass-through)
│       ├── models/
│       │   ├── RequestLog.js     # Request audit log schema
│       │   ├── BlacklistEntry.js # Blocked IPs schema
│       │   ├── WhitelistEntry.js # Trusted IPs schema
│       │   └── ApiKey.js         # Static API key schema
│       ├── routes/
│       │   ├── health.js         # GET /health endpoint
│       │   ├── proxy.js          # Reverse proxy configuration
│       │   └── auth.js           # Test token generation
│       ├── utils/
│       │   └── fingerprint.js    # Request fingerprinting (FR-1.5)
│       └── scripts/
│           └── seed.js           # Seed test data into MongoDB
│
├── services/
│   ├── user-service/             # Dummy User API backend
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/index.js
│   └── order-service/            # Dummy Order API backend (admin-only)
│       ├── Dockerfile
│       ├── package.json
│       └── src/index.js
│
├── ai-engine/                    # Phase 2 scaffold (empty)
│   └── README.md
│
├── dashboard/                    # Phase 3 scaffold (empty)
│   └── README.md
│
└── docs/
    └── PRD.md                    # Product Requirements Document
```

---

## Prerequisites

- **Docker** & **Docker Compose** installed
- **Git** (optional, for version control)
- No Node.js installation required (Docker handles it)

---

## Quick Start

### 1. Clone and Configure

```bash
# Clone the repository
git clone <repository-url>
cd API_Security_Platform

# Copy environment template (edit if needed)
cp .env.example .env
```

### 2. Start All Services

```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

This starts 5 services:
| Service | Port | Description |
|---------|------|-------------|
| Gateway | 3000 | API Security Gateway |
| User Service | 4001 | Dummy user data API |
| Order Service | 4002 | Dummy order data API (admin-only) |
| Redis | 6379 | Rate limit counters |
| MongoDB | 27017 | Request logs, IP lists, API keys |

### 3. Seed Test Data

```bash
# Run the seed script inside the gateway container
docker-compose exec gateway npm run seed
```

This creates:
- **API Key** `test-api-key-001` (user role)
- **API Key** `admin-api-key-001` (admin role)
- **Blacklisted IP** `192.168.100.100`
- **Whitelisted IP** `127.0.0.1`

---

## Testing with curl

### Health Check (no auth required)

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 42,
  "timestamp": "2025-08-12T12:00:00.000Z",
  "services": {
    "redis": "connected",
    "mongodb": "connected"
  }
}
```

### Generate JWT Tokens

```bash
# Generate a USER token
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "role": "user"}'

# Generate an ADMIN token
curl -X POST http://localhost:3000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "role": "admin"}'
```

Save the returned `token` value for subsequent requests.

### Authentication Tests

```bash
# ❌ No token → 401 Unauthorized
curl http://localhost:3000/api/users

# ✅ With JWT token → 200 OK
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer <YOUR_USER_TOKEN>"

# ✅ With API key → 200 OK
curl http://localhost:3000/api/users \
  -H "x-api-key: test-api-key-001"
```

### RBAC Tests

```bash
# ❌ User token on admin-only route → 403 Forbidden
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer <YOUR_USER_TOKEN>"

# ✅ Admin token on admin-only route → 200 OK
curl http://localhost:3000/api/orders \
  -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>"

# ✅ Admin API key → 200 OK
curl http://localhost:3000/api/orders \
  -H "x-api-key: admin-api-key-001"
```

### Rate Limiting Test

```bash
# Send 105 rapid requests (limit is 100/min by default)
# The last few should return 429 Too Many Requests
for i in $(seq 1 105); do
  echo -n "Request $i: "
  curl -s -o /dev/null -w "%{http_code}" \
    http://localhost:3000/api/users \
    -H "x-api-key: test-api-key-001"
  echo ""
done
```

### Get a Specific User

```bash
curl http://localhost:3000/api/users/1 \
  -H "x-api-key: test-api-key-001"

# Non-existent user → 404
curl http://localhost:3000/api/users/999 \
  -H "x-api-key: test-api-key-001"
```

---

## Service Details

### API Gateway (Port 3000)

The central security layer. All client requests pass through its middleware chain:

1. **Request Logger** — Logs every request (IP, endpoint, method, timestamp, headers, fingerprint) to MongoDB `request_logs` collection
2. **IP Filter** — Checks client IP against `blacklist` (→ 403) and `whitelist` (→ bypass rate limiting) MongoDB collections
3. **Rate Limiter** — Redis-backed sliding window counter. Default: 100 requests per 60 seconds per IP. Returns 429 with `Retry-After` when exceeded
4. **Authenticate** — Validates JWT Bearer tokens OR `x-api-key` header. Returns 401 for missing/invalid credentials
5. **AI Threat Check** — *Phase 2 placeholder* — currently passes all requests through
6. **RBAC** — Checks `req.user.role` against route-level requirements. Returns 403 for insufficient privileges

### User Service (Port 4001)

- `GET /api/users` — Returns all fake users
- `GET /api/users/:id` — Returns a single user by ID

### Order Service (Port 4002)

- `GET /api/orders` — Returns all fake orders (admin-only via gateway RBAC)

---

## Configuration

All configuration is via environment variables in `.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| `GATEWAY_PORT` | 3000 | Gateway listen port |
| `JWT_SECRET` | — | Secret key for JWT signing |
| `JWT_EXPIRATION` | 1h | Token expiration time |
| `MONGO_URI` | mongodb://mongodb:27017/... | MongoDB connection string |
| `REDIS_HOST` | redis | Redis hostname |
| `REDIS_PORT` | 6379 | Redis port |
| `RATE_LIMIT_MAX` | 100 | Max requests per window |
| `RATE_LIMIT_WINDOW_SECONDS` | 60 | Window duration in seconds |
| `USER_SERVICE_URL` | http://user-service:4001 | User service internal URL |
| `ORDER_SERVICE_URL` | http://order-service:4002 | Order service internal URL |

---

## Stopping the Platform

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clears MongoDB data)
docker-compose down -v
```

---

## What's Next

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 — Core Gateway | ✅ Complete | Auth, logging, rate limiting, IP filtering, RBAC |
| Phase 2 — AI Integration | ⏳ Planned | Isolation Forest model, risk scoring, auto-mitigation |
| Phase 3 — Dashboard | ⏳ Planned | React dashboard with 4 pages |
| Phase 4 — Onboarding | ⏳ Planned | Developer self-service API registration |
