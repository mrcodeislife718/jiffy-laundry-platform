# JiffyLaundry Quick Reference Guide

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Start Redis
docker-compose up -d redis

# 2. Start Backend API
cd apps/backend-api
npm run dev
# → Server on http://localhost:4000

# 3. Start Frontend Apps (separate terminals)
cd apps/admin-dashboard && npm run dev        # → Port 3002
cd apps/laundromat-dashboard && PORT=3003 npm run dev  # → Port 3003
cd apps/customer-app && PORT=3001 npm run dev  # → Port 3001
cd apps/driver-app && npm run dev             # → Port 8081 (Expo)

# 4. Verify
curl http://localhost:4000/health
```

---

## 📁 Project Structure

```
jiffylaundry/
├── apps/
│   ├── backend-api/              # Express + Socket.io + Redis
│   │   └── src/index.js          # Main server (600+ lines)
│   ├── admin-dashboard/          # Next.js admin control center
│   ├── laundromat-dashboard/     # Next.js operations dashboard
│   ├── customer-app/             # React Native customer app
│   └── driver-app/               # React Native driver app
├── packages/
│   ├── shared/                   # Shared API client & auth
│   ├── realtime/                 # Socket.io client + React hooks
│   └── ui/                       # Shared UI components
├── supabase/
│   ├── migrations/               # Database schema files
│   └── functions/                # Edge functions
├── docker-compose.yml            # Local infrastructure
├── README.md                      # Main documentation
├── BUILD_SUMMARY.md              # What was built
├── PRODUCTION_ARCHITECTURE.md    # System design
├── PRODUCTION_OPERATIONS.md      # How to run
├── MONITORING_OBSERVABILITY.md   # Monitoring setup
├── TESTING_REALTIME.md           # Test procedures
└── DEPLOYMENT_CHECKLIST.md       # Deployment guide
```

---

## 🔧 Key Technologies

| Layer | Technology | Port | Purpose |
|-------|-----------|------|---------|
| **Frontend** | React 18, React Native | 3001-3003 | UI/UX |
| **API** | Express.js | 4000 | REST endpoints |
| **Realtime** | Socket.io | 4000 | Event streaming |
| **Cache** | Redis 7 | 6379 | Pub/Sub, caching |
| **Database** | Supabase/Postgres | - | Data storage |
| **Payments** | Stripe API | - | Payment processing |
| **Queue** | Bull | - | Background jobs |
| **Logging** | Pino | - | Structured logs |

---

## 🔄 Core Workflows

### Order Creation Flow
```
Customer App
    ↓
POST /api/orders
    ↓
Backend API
    ↓
Save to Supabase
    ↓
Socket.io broadcast → Admin Dashboard
    ↓
Order appears in queue
```

### Order Dispatch Flow
```
Admin clicks "Assign"
    ↓
POST /api/dispatch/assign
    ↓
Backend API updates order
    ↓
Redis pub/sub: "order:assigned"
    ↓
Driver App gets notification
Driver sees new order
```

### Driver Location Flow
```
Driver App (every 5s)
    ↓
POST /api/drivers/:id/location
    ↓
Backend broadcasts
    ↓
Socket.io → Admin Dashboard (shows marker)
Socket.io → Customer App (shows ETA)
```

### Notification Flow
```
Status change event
    ↓
Backend creates notification
    ↓
Queue job → Send notification
    ↓
Socket.io broadcast
    ↓
User sees notification
```

---

## 📊 API Endpoints

### Health & Monitoring
```
GET  /health                      Health check
```

### Orders
```
GET  /api/orders                  Get all orders
GET  /api/orders/:orderId         Get specific order
POST /api/orders/:orderId/status  Update status (RBAC: admin, driver, laundromat_operator)
```

### Dispatch
```
POST /api/dispatch/assign         Assign order to driver (RBAC: admin, laundromat_operator)
```

### Driver Location
```
POST /api/drivers/:driverId/location  Update position (RBAC: driver, admin)
```

### Wallet
```
GET  /api/wallet/:userId          Get wallet balance
POST /api/wallet/:userId/topup    Add funds (Stripe integration)
```

### Support
```
GET  /api/support/tickets         Get all tickets
POST /api/support/tickets/:id/status  Update ticket status (RBAC: admin, support)
```

---

## 🔐 RBAC Roles

| Role | Can Access | Cannot Access |
|------|------------|---------------|
| **Customer** | Own orders, wallet, support tickets | Admin panel, driver data |
| **Driver** | Assigned orders, own location, earnings | All customers, all orders |
| **Laundromat Operator** | Queue, facility orders, inventory | Customer data, payments |
| **Admin** | Everything | Credentials, raw API keys |

---

## 🧪 Testing Quick Commands

```bash
# Health check
curl http://localhost:4000/health

# Get all orders
curl http://localhost:4000/api/orders \
  -H "x-user-id: admin-123" \
  -H "x-user-role: admin"

# Update order status
curl -X POST http://localhost:4000/api/orders/order-123/status \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin-123" \
  -H "x-user-role: admin" \
  -d '{"status": "accepted"}'

# Dispatch order to driver
curl -X POST http://localhost:4000/api/dispatch/assign \
  -H "Content-Type: application/json" \
  -H "x-user-id: admin-123" \
  -H "x-user-role: admin" \
  -d '{"orderId": "order-123", "driverId": "driver-456"}'

# Update driver location
curl -X POST http://localhost:4000/api/drivers/driver-456/location \
  -H "Content-Type: application/json" \
  -H "x-user-id: driver-456" \
  -H "x-user-role: driver" \
  -d '{"latitude": 40.7128, "longitude": -74.0060, "orderId": "order-123"}'
```

---

## 📝 Socket.io Events

### Order Events
```javascript
// Server → Client
order:updated              // Order status changed
order:assigned             // Order assigned to driver
order:location             // Driver location update

// Client → Server
subscribe:order            // Subscribe to order updates
unsubscribe:order          // Unsubscribe
```

### Driver Events
```javascript
// Server → Client
driver:location            // Driver position update
driver:new_order           // New order for driver

// Client → Server
subscribe:driver           // Track driver location
driver:location            // Send location
```

### Notification Events
```javascript
// Server → Client
notification               // New notification
notification:read          // Notification marked as read

// Client → Server
subscribe:notifications    // Listen for notifications
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to Redis" | `docker-compose up -d redis` |
| "Backend API won't start" | Check port 4000 not in use: `lsof -i :4000` |
| "Socket.io connection fails" | Verify API running: `curl http://localhost:4000/health` |
| "Orders not updating" | Check backend logs: `npm run dev \| grep "order:updated"` |
| "Location not broadcasting" | Verify driver app has permission, check: `redis-cli` → `SUBSCRIBE driver:location` |
| "CORS error in browser" | Check CORS config in backend, verify frontend URL whitelisted |

---

## 📊 Performance Targets

```
API Latency:
✅ GET /api/orders < 100ms
✅ POST /api/orders/:id/status < 150ms
✅ GET /api/wallet < 50ms

Realtime:
✅ Socket.io message < 100ms
✅ Driver location update < 5ms
✅ Order broadcast < 10ms

Database:
✅ Query time < 50ms
✅ Connection pool < 80%

User Experience:
✅ Order update visible < 1 second
✅ 99.9% message delivery
✅ < 0.1% failed connections
```

---

## 🚀 Deployment Quick Reference

### Local Development
```bash
docker-compose up -d redis
cd apps/backend-api && npm run dev
# Then start frontend apps
```

### Staging
```bash
docker-compose -f docker-compose.yml up -d
# All services + monitoring
```

### Production
```bash
# Option 1: Docker
docker-compose -f docker-compose.yml up -d

# Option 2: Kubernetes
kubectl apply -f k8s/

# Option 3: AWS
terraform apply
```

---

## 📞 Getting Help

### Documentation
- **Architecture**: [PRODUCTION_ARCHITECTURE.md](PRODUCTION_ARCHITECTURE.md)
- **Operations**: [PRODUCTION_OPERATIONS.md](PRODUCTION_OPERATIONS.md)
- **Testing**: [TESTING_REALTIME.md](TESTING_REALTIME.md)
- **Monitoring**: [MONITORING_OBSERVABILITY.md](MONITORING_OBSERVABILITY.md)
- **Deployment**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

### Common Questions

**Q: How do I add a new order status?**
A: Update the check in backend `src/index.js` and database schema.

**Q: How do I customize notifications?**
A: Modify notification template in `notificationQueue.process()`.

**Q: How do I scale the system?**
A: See [PRODUCTION_ARCHITECTURE.md#scaling-strategy](PRODUCTION_ARCHITECTURE.md#scaling-strategy).

**Q: How do I monitor production?**
A: See [MONITORING_OBSERVABILITY.md](MONITORING_OBSERVABILITY.md).

**Q: What if something breaks?**
A: See [PRODUCTION_OPERATIONS.md#troubleshooting](PRODUCTION_OPERATIONS.md#troubleshooting).

---

## ✨ Key Files by Purpose

### If you need to...

**Add a new API endpoint**
→ `apps/backend-api/src/index.js` (add route)
→ `packages/shared/api-client.js` (add method)

**Add realtime feature**
→ `packages/realtime/index.js` (add event handler)
→ `packages/realtime/hooks.js` (add React hook)

**Modify database**
→ `supabase/migrations/002_production_schema.sql`
→ Run in Supabase SQL Editor

**Update frontend app**
→ `apps/admin-dashboard/` or similar
→ Import from `@jiffylaundry/realtime` for Socket.io

**Add background job**
→ `apps/backend-api/src/index.js` (create queue and processor)

**Add monitoring**
→ `MONITORING_OBSERVABILITY.md` (setup guide)
→ Configure alerts in your monitoring service

---

## 🎯 Next Steps

1. ✅ **Run locally** - Start with Quick Start guide above
2. ✅ **Understand architecture** - Read [PRODUCTION_ARCHITECTURE.md](PRODUCTION_ARCHITECTURE.md)
3. ✅ **Test realtime** - Follow [TESTING_REALTIME.md](TESTING_REALTIME.md)
4. ✅ **Customize** - Update for your business
5. ✅ **Deploy staging** - Use [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
6. ✅ **Go live** - Production deployment

---

## 📈 System Status Dashboard

```
Backend API:        ✅ Running (http://localhost:4000)
Redis:             ✅ Connected (6379)
Socket.io:         ✅ Active
Admin Dashboard:   ✅ Ready (http://localhost:3002)
Laundromat Dashboard: ✅ Ready (http://localhost:3003)
Customer App:      ✅ Ready (http://localhost:3001)
Driver App:        ✅ Ready (Expo)
Database:          ✅ Supabase
Payments:          ✅ Stripe ready
Monitoring:        ⏳ Configure per MONITORING_OBSERVABILITY.md
```

---

**JiffyLaundry Platform - Ready to Use! 🚀**

*Start with `docker-compose up -d redis` then follow Quick Start above.*
