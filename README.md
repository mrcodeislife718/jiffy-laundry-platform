# JiffyLaundry Platform - Production-Grade Realtime Logistics System

![JiffyLaundry](public/logo.png)

A **production-ready, realtime laundry logistics platform** with 4 synchronized mobile & web applications, powered by modern infrastructure and designed for scale.

## 🚀 System Overview

**JiffyLaundry** is a unified operational ecosystem where:
- **Customers** order pickup & delivery of laundry through mobile app
- **Drivers** receive & complete orders with realtime location tracking
- **Admins** orchestrate operations from web control center
- **Laundromat Staff** manage queue & update order status

All systems sync **in realtime** via Socket.io and Redis for instant updates across all apps.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CUSTOMER MOBILE APP                         │
│          (React Native/Expo) • Order • Tracking • Wallet        │
└─────────────────────────────────────────────────────────────────┘
                              │
┌──────────────────────┬──────┴──────┬──────────────────────┐
│                      │             │                      │
▼                      ▼             ▼                      ▼
DRIVER APP        ADMIN DASHBOARD  LAUNDROMAT DASH      BACKEND API
(React Native)    (Next.js Web)    (Next.js Web)        (Node.js)
5+ Screens        8 Pages          5 Pages              Realtime Hub
Location Track    Full Control     Queue Mgmt           Socket.io
Accept Orders     Dispatch         Status Updates       Redis Pub/Sub
Earnings          SLA Monitor      Staff Tasks          Job Queues
                  Analytics        Inventory            Audit Logs
                  Support          Reports              Auth/RBAC
                                                        Stripe
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                 Redis    Supabase  Stripe
                Pub/Sub   Database   API
```

## 📦 What's Included

### Applications (4 Apps)

| App | Type | Port | Purpose |
|-----|------|------|---------|
| **Customer App** | React Native/Expo | 3001 | Customer ordering & tracking |
| **Driver App** | React Native/Expo | N/A | Driver delivery operations |
| **Admin Dashboard** | Next.js 14 | 3002 | Master control center |
| **Laundromat Dashboard** | Next.js 14 | 3003 | Facility operations |

### Backend Infrastructure

- **Express.js REST API** (Port 4000)
- **Socket.io** for realtime events
- **Redis** for pub/sub & caching
- **Bull Queues** for background jobs
- **Supabase PostgreSQL** for data
- **Stripe** for payments

### Features

✅ **Realtime Updates**
- Order status changes broadcast instantly
- Driver location updates live
- Wallet balance changes propagate
- Notifications push immediately
- Support tickets update in realtime

✅ **Order Management**
- Full order lifecycle tracking
- SLA deadline monitoring
- Status workflow enforcement
- Item-level tracking
- Service pricing

✅ **Dispatch & Logistics**
- Driver assignment
- Route optimization
- Live location tracking
- ETA calculations
- Multi-stop support

✅ **Financial**
- Wallet system with topup
- Payment processing via Stripe
- Transaction history
- Refund handling
- Revenue analytics

✅ **Support**
- Customer support ticketing
- Ticket assignment
- Status tracking
- Ticket history

✅ **Operations**
- Laundromat queue management
- Order status flow
- Staff task assignment
- Inventory tracking
- Performance metrics

✅ **Admin Control**
- Full order management
- Driver management
- Customer management
- SLA enforcement
- Analytics & reports
- Support escalation

✅ **Security**
- Role-Based Access Control (RBAC)
- Row-Level Security (RLS) on all tables
- Audit logging for compliance
- JWT authentication
- API rate limiting
- CORS security

✅ **Observability**
- Structured logging with Pino
- Realtime metrics collection
- Health checks
- Performance monitoring
- Error tracking

## 🛠️ Tech Stack

### Frontend

- **React** 18 (UI library)
- **React Native** 0.73 (iOS/Android)
- **Expo** 50 (React Native tooling)
- **Next.js** 14 (Web dashboards)
- **Tailwind CSS** 3.4 (Styling)
- **React Query** 5 (Data fetching)
- **Zustand** 4.4 (State management)
- **Socket.io Client** 4.7 (Realtime)

### Backend

- **Node.js** 18 (Runtime)
- **Express** 4.18 (HTTP server)
- **Socket.io** 4.7 (Realtime events)
- **Bull** 5.4 (Job queue)
- **Redis** 7 (Cache & pub/sub)
- **Supabase** (Database & auth)
- **Stripe** (Payments)
- **Pino** (Logging)

### Infrastructure

- **Docker** (Containerization)
- **Docker Compose** (Local orchestration)
- **PostgreSQL** (Database - via Supabase)
- **Redis** (Caching & pub/sub)

## 🚀 Quick Start

### 1. Prerequisites

```bash
Node.js 18+
Docker & Docker Compose
Supabase account
Stripe account
```

### 2. Clone & Install

```bash
git clone https://github.com/yourorg/jiffylaundry.git
cd jiffylaundry
npm install
```

### 3. Configure Environment

```bash
# Copy example files
cp apps/backend-api/.env.example apps/backend-api/.env.local

# Edit with your credentials
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY
```

### 4. Start Infrastructure

```bash
# Start Redis
docker-compose up -d redis

# Verify
docker-compose ps
```

### 5. Start Backend API

```bash
cd apps/backend-api
npm run dev

# Server runs on http://localhost:4000
curl http://localhost:4000/health
```

### 6. Start Frontend Apps

```bash
# Terminal 1: Admin Dashboard
cd apps/admin-dashboard && npm run dev

# Terminal 2: Laundromat Dashboard  
cd apps/laundromat-dashboard && PORT=3003 npm run dev

# Terminal 3: Customer App
cd apps/customer-app && PORT=3001 npm run dev

# Terminal 4: Driver App
cd apps/driver-app && npm run dev
```

### 7. Access Applications

```
✅ Admin Dashboard: http://localhost:3002
✅ Laundromat Dashboard: http://localhost:3003
✅ Customer App: http://localhost:3001
✅ Driver App: http://localhost:8081 (Expo)
✅ Backend API: http://localhost:4000
```

## 📚 Documentation

- **[PRODUCTION_ARCHITECTURE.md](PRODUCTION_ARCHITECTURE.md)** - System design & scaling
- **[PRODUCTION_OPERATIONS.md](PRODUCTION_OPERATIONS.md)** - How to run production
- **[MONITORING_OBSERVABILITY.md](MONITORING_OBSERVABILITY.md)** - Monitoring & alerts
- **[TESTING_REALTIME.md](TESTING_REALTIME.md)** - Test suite & validation
- **[COPILOT_MASTER_BUILD.md](COPILOT_MASTER_BUILD.md)** - Build phases
- **[COPILOT_MASTER_BUILD.md](COPILOT_MASTER_BUILD.md)** - Phase-by-phase guide

## 🔄 Realtime Features

### Order Real-Time Updates

Orders update instantly across all apps:
- Customer sees status change immediately
- Driver sees new assignment
- Admin sees status progression
- Laundromat staff sees updated queue

### Live Driver Tracking

Driver location broadcasts every 5 seconds:
- Customer sees live ETA
- Admin sees driver position
- Driver app shows route

### Instant Notifications

Push notifications for:
- Order status changes
- Driver assignments
- Support ticket updates
- Wallet balance changes
- Payment confirmations

### Socket.io Event System

```javascript
// Order Events
order:updated          // Order status changed
order:assigned         // Order assigned to driver
order:location         // Driver location updated

// Driver Events
driver:location        // Driver position update
driver:online          // Driver came online
driver:new_order       // New order for driver

// Wallet Events
wallet:updated         // Balance changed
payment:processed      // Payment completed

// Notification Events
notification:sent      // New notification
notification:read      // User read notification

// Support Events
ticket:updated         // Ticket status changed
ticket:created         // New ticket created
```

## 🔐 Security Features

### Authentication & Authorization

- **JWT Tokens** for stateless auth
- **Supabase Auth** integration
- **Role-Based Access Control**:
  - `customer` - View own orders, wallet
  - `driver` - Accept orders, track location
  - `laundromat_operator` - Manage queue, update status
  - `admin` - Full platform access

### Data Protection

- **Row-Level Security (RLS)** on all tables
- **Audit Logging** of all operations
- **Encryption in transit** (HTTPS/TLS)
- **Encryption at rest** (database)
- **CORS** security
- **Rate limiting** (100 req/min per user)
- **XSS/CSRF protection**

### Compliance

- Audit trail for every API call
- GDPR-compliant data handling
- PCI compliance for payment processing
- CCPA support for data deletion

## 📊 Database Schema

### Core Tables

- **profiles** - Users with role-based access
- **orders** - Full order lifecycle
- **order_items** - What's in each order
- **driver_locations** - Real-time GPS tracking
- **wallets** - User account balances
- **wallet_transactions** - Payment history
- **notifications** - User notifications
- **support_tickets** - Customer support
- **subscriptions** - Recurring services
- **audit_logs** - Compliance logging
- **promotions** - Discounts & coupons

See [PRODUCTION_ARCHITECTURE.md](PRODUCTION_ARCHITECTURE.md) for full schema.

## 🎯 API Endpoints

### Orders

```
GET    /api/orders              # List all orders
GET    /api/orders/:orderId     # Get specific order
POST   /api/orders/:orderId/status  # Update status
```

### Dispatch

```
POST   /api/dispatch/assign     # Assign order to driver
```

### Driver Location

```
POST   /api/drivers/:driverId/location  # Update position
```

### Wallet

```
GET    /api/wallet/:userId      # Get balance
POST   /api/wallet/:userId/topup    # Add funds
```

### Support

```
GET    /api/support/tickets     # List tickets
POST   /api/support/tickets/:ticketId/status  # Update status
```

## 🧪 Testing

Full test suite included:

```bash
# Run all tests
npm run test:all

# Realtime system tests
npm run test:realtime

# API tests
npm run test:api

# Load tests
npm run test:load
```

See [TESTING_REALTIME.md](TESTING_REALTIME.md) for detailed test procedures.

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Latency (p95) | < 500ms | ✅ |
| Socket.io Message Latency | < 100ms | ✅ |
| Order Update Broadcast | < 1s | ✅ |
| Database Query | < 50ms | ✅ |
| Connection Pool Usage | < 80% | ✅ |

## 🚢 Deployment

### Development

```bash
docker-compose up -d redis
npm run dev --workspaces
```

### Staging/Production

- **Option 1**: Docker Compose
- **Option 2**: Kubernetes
- **Option 3**: AWS/GCP Managed Services

See [PRODUCTION_ARCHITECTURE.md](PRODUCTION_ARCHITECTURE.md#deployment-architecture) for details.

### CI/CD Pipeline

```yaml
# Automated:
1. Test - Run full test suite
2. Build - Build Docker images
3. Push - Push to registry
4. Deploy - Automatic deployment
5. Verify - Health checks
```

## 📞 Support & Troubleshooting

### Common Issues

**Backend API won't start?**
```bash
docker-compose up -d redis
npm run dev
```

**Socket.io connection fails?**
```bash
curl http://localhost:4000/health
# Verify CORS configuration
```

**Orders not updating?**
```bash
npm run dev | grep "order:updated"
redis-cli
> SUBSCRIBE order:updated
```

See [PRODUCTION_OPERATIONS.md#troubleshooting](PRODUCTION_OPERATIONS.md#troubleshooting) for more.

## 🛣️ Roadmap

### Phase 1: ✅ Complete
- Basic order management
- User authentication
- Realtime infrastructure
- Payment processing

### Phase 2: In Progress
- Advanced dispatch optimization
- Route planning
- Performance optimization
- Monitoring & observability

### Phase 3: Planned
- Machine learning order prediction
- Dynamic pricing
- Subscription management
- Partner integrations

## 📄 License

Proprietary - JiffyLaundry

## 👥 Team

- **Engineering**: Build realtime logistics platform
- **Product**: Define features & requirements
- **Operations**: Monitor and maintain
- **Support**: Handle customer issues

## 🤝 Contributing

1. Create feature branch
2. Write tests
3. Submit PR
4. Code review
5. Merge to main

## 📧 Contact

- **Engineering Lead**: [email]
- **Operations**: [email]
- **Support**: [email]
- **Emergency**: [hotline]

---

**JiffyLaundry Platform v1.0.0** | Built for scale, optimized for realtime
