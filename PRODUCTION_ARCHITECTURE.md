# JiffyLaundry Production Architecture & Deployment Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS (4 Apps)                         │
├─────────────────────────────────────────────────────────────────┤
│ Customer App (Mobile) │ Driver App (Mobile) │ Admin (Web) │ Laundromat (Web) │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
         ┌──────────────────────────────────────────┐
         │   API Gateway / Load Balancer (Nginx)    │
         └──────────────────────────────────────────┘
                    │            │            │
        ┌───────────┼───────────┬┴────────────┴──────────┐
        ▼           ▼           ▼                        ▼
   ┌─────────┐ ┌─────────┐ ┌──────────┐        ┌──────────────┐
   │ REST    │ │Socket.io│ │ Webhooks │        │  Auth Tokens │
   │ API     │ │ Gateway │ │ Handler  │        │    Cache     │
   └─────────┘ └─────────┘ └──────────┘        └──────────────┘
        │           │           │                      │
        └───────────┼───────────┴──────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    ┌─────────────┐    ┌──────────────────┐
    │  Supabase   │    │  Backend API     │
    │ PostgreSQL  │    │  (Node.js/Exp)   │
    │    + RLS    │    │  + Socket.io     │
    └─────────────┘    │  + Bull Queues   │
        ▲               └──────────────────┘
        │                       │
        │               ┌───────┴────────┐
        │               ▼                ▼
        │          ┌─────────┐    ┌───────────┐
        │          │  Redis  │    │ Stripe    │
        │          │Pub/Sub  │    │ API       │
        │          │ + Cache │    │ (Payment) │
        │          └─────────┘    └───────────┘
        │               ▲
        │               │
        └───────────────┘
```

## Component Architecture

### 1. Client Applications

**Customer App** (React Native/Expo - Port 3001)
- Order creation and management
- Live order tracking
- Wallet management
- Push notifications
- Support ticketing

**Driver App** (React Native/Expo)
- Accept/reject orders
- Live location tracking
- Navigation to pickup/delivery
- Earnings tracking
- Realtime order updates

**Admin Dashboard** (Next.js - Port 3002)
- Full order management
- Dispatch control center
- Driver management
- Financial reports
- Support ticket resolution
- SLA monitoring
- Analytics & insights

**Laundromat Dashboard** (Next.js - Port 3003)
- Queue management
- Order status updates
- Staff task assignment
- Inventory management
- Performance metrics

### 2. Backend API Server (Port 4000)

**Features:**
- Express.js REST API
- Socket.io for realtime events
- RBAC middleware for authorization
- Comprehensive audit logging
- Bull job queues
- Stripe payment integration
- Realtime pub/sub with Redis
- Health checks and monitoring

**API Endpoints:**
```
Orders:
  GET   /api/orders
  GET   /api/orders/:orderId
  POST  /api/orders/:orderId/status

Dispatch:
  POST  /api/dispatch/assign

Driver Location:
  POST  /api/drivers/:driverId/location

Wallet:
  GET   /api/wallet/:userId
  POST  /api/wallet/:userId/topup

Support:
  GET   /api/support/tickets
  POST  /api/support/tickets/:ticketId/status

Health:
  GET   /health
```

### 3. Data Layer

**Supabase PostgreSQL Database:**
- User profiles with role-based access
- Order management with full history
- Real-time subscriptions via Postgres changes
- Row-level security (RLS) policies
- Audit logs for compliance
- Wallet & transaction tracking
- Support tickets & communications

**Tables:**
- `profiles` - Users with roles (customer, driver, admin, laundromat_operator)
- `orders` - Order lifecycle management
- `order_items` - Order line items
- `driver_locations` - Realtime driver tracking
- `wallets` - User account balances
- `wallet_transactions` - Financial history
- `notifications` - User notifications
- `support_tickets` - Customer support
- `subscriptions` - Recurring services
- `audit_logs` - Compliance logging
- `promotions` - Discounts & coupons
- `analytics_events` - User behavior tracking

### 4. Realtime Infrastructure

**Redis (6379):**
- Pub/Sub messaging for cross-service events
- Session caching
- Job queue storage (Bull)
- Rate limiting counters

**Socket.io:**
- Bidirectional event streaming
- Room-based event broadcasting
- Automatic reconnection
- Fallback to polling

**Bull Job Queues:**
- `orderProcessing` - Background order workflows
- `notifications` - Push/email notifications
- `auditLogs` - Async audit trail recording
- `payments` - Stripe webhook processing

### 5. External Integrations

**Stripe:**
- Payment intent creation
- Payment processing
- Webhook handling
- Refund processing

**Supabase Edge Functions:**
- Serverless payment handlers
- Background job triggers
- External API calls

## Deployment Architecture

### Local Development

```bash
# Start infrastructure
docker-compose up

# Start frontend apps (in separate terminals)
cd apps/admin-dashboard && npm run dev
cd apps/laundromat-dashboard && PORT=3003 npm run dev
cd apps/customer-app && PORT=3001 npm run dev
cd apps/driver-app && npm run dev

# Backend starts automatically in Docker
```

### Staging/Production

**Infrastructure Stack:**
- **Load Balancer**: Nginx/HAProxy
- **API Servers**: Multiple Node.js instances (backend-api)
- **Database**: Supabase (managed Postgres + auth)
- **Cache/Pub-Sub**: Redis cluster (AWS ElastiCache)
- **Queue Workers**: Separate Bull worker instances
- **CDN**: Vercel/Netlify for static assets
- **Monitoring**: Datadog/New Relic
- **Logging**: CloudWatch/ELK Stack
- **Secrets**: AWS Secrets Manager

**Deployment Options:**

**Option A: Docker Compose (Development/Small Deployment)**
```bash
docker-compose -f docker-compose.yml up
```

**Option B: Kubernetes (Production Scale)**
```bash
kubectl apply -f k8s/
# Includes deployments for:
# - backend-api (replicas: 3)
# - redis (stateful)
# - worker instances
# - ingress controller
```

**Option C: Managed Services (AWS/GCP)**
```
- ECS Fargate for containerized apps
- RDS for Postgres (or use Supabase)
- ElastiCache for Redis
- ALB for load balancing
- CloudFront for CDN
```

## Scaling Strategy

### Horizontal Scaling

1. **Backend API Servers**
   - Deploy multiple instances behind load balancer
   - Each instance connects to shared Redis
   - Session data stored in Redis (not in-memory)
   - Bull queues distributed across Redis

2. **Socket.io Scaling**
   - Use Socket.io Redis adapter
   - Messages broadcast across all server instances
   - Automatic client distribution by load balancer
   - Redis Pub/Sub handles inter-server communication

3. **Job Queue Workers**
   - Deploy separate worker instances
   - Each worker processes from shared Redis queues
   - Auto-scale based on queue depth
   - Process multiple jobs concurrently

### Database Scaling

- Supabase handles auto-scaling
- Read replicas for analytics queries
- Connection pooling with PgBouncer
- Partitioning large tables (orders, audit_logs)

### Caching Strategy

- Redis cache for:
  - User sessions
  - Frequently accessed orders
  - Driver availability status
  - Wallet balances

## Security

### Authentication & Authorization

**JWT Tokens:**
```javascript
{
  aud: "authenticated",
  user_id: "uuid",
  role: "customer|driver|admin|laundromat_operator",
  exp: timestamp
}
```

**RBAC Policies:**
- Customer: View own orders, wallet, support tickets
- Driver: View assigned orders, own location data
- Laundromat Operator: Manage queue, update order status
- Admin: Full access to all resources

### Data Security

- **RLS Policies** on all tables
- **Encryption in transit** (HTTPS/TLS)
- **Encryption at rest** (database encryption)
- **API rate limiting** (100 req/min per user)
- **CORS whitelisting** for frontend domains
- **Helmet.js** for HTTP security headers

### Audit & Compliance

- Every API request logged to `audit_logs`
- Payment transactions logged separately
- User action tracking for accountability
- Compliance with GDPR/CCPA

## Monitoring & Observability

### Metrics

```
Backend API:
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Active Socket.io connections
- Redis connection pool usage
- Job queue depth
- Payment processing time

Database:
- Query latency
- Connection pool utilization
- Slow queries
- Replication lag

Real-time:
- Socket.io connection count
- Messages per second
- Event lag (message age)
- Pub/Sub lag
```

### Logging

```
Log Levels:
- error: System errors, failed operations
- warn: Deprecated API usage, edge cases
- info: Request/response, major events
- debug: Detailed traces (dev only)

Structured Logging with Pino:
- requestId for request tracing
- userId for user tracking
- severity levels
- Correlation IDs for distributed tracing
```

### Alerting

```
Critical Alerts:
- API server down (health check fails)
- Database connection errors
- Redis unavailable
- Payment processing failures
- Error rate > 1%

Warning Alerts:
- Latency > 500ms p95
- Job queue depth > 1000
- Cache hit rate < 80%
- Memory usage > 80%
```

## Running the Production System

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Redis 7+
- Supabase account
- Stripe account

### Installation Steps

1. **Clone & Install**
```bash
git clone https://github.com/yourorg/jiffylaundry.git
cd jiffylaundry
npm install
```

2. **Configure Environment**
```bash
cp apps/backend-api/.env.example apps/backend-api/.env.local
# Edit .env.local with your credentials
```

3. **Start Infrastructure**
```bash
docker-compose up -d redis
```

4. **Run Migrations**
```bash
# Via Supabase Dashboard, run SQL in 002_production_schema.sql
```

5. **Start Backend API**
```bash
cd apps/backend-api
npm install
npm start
# Server runs on http://localhost:4000
```

6. **Start Frontend Apps**
```bash
# Terminal 1
cd apps/admin-dashboard && npm run dev

# Terminal 2
cd apps/laundromat-dashboard && PORT=3003 npm run dev

# Terminal 3
cd apps/customer-app && PORT=3001 npm run dev
```

### Health Check

```bash
# Check backend API
curl http://localhost:4000/health

# Check Socket.io connection
curl http://localhost:4000/socket.io/?transport=polling
```

## Next Steps

1. Deploy to staging environment
2. Load testing with k6/Artillery
3. Security audit
4. Performance optimization
5. Production rollout with canary deployment
6. Monitoring setup
7. Runbook creation for on-call engineers
