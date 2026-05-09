# JiffyLaundry Production Operations Guide

## Quick Start - Local Development with Full Realtime Stack

### Prerequisites

```bash
Node.js 18+
Docker & Docker Compose
Redis 7+ (via Docker)
Supabase account
Stripe account
```

### Step 1: Install Dependencies

```bash
cd /home/charkes/Documents/jiffylaundry
npm install

# Install backend dependencies
cd apps/backend-api
npm install
```

### Step 2: Start Redis & Backend Infrastructure

```bash
# From project root
docker-compose up -d redis

# Check Redis is running
docker-compose ps
```

### Step 3: Set Up Backend API

```bash
# From project root/apps/backend-api
cp .env.example .env.local

# Edit .env.local with your credentials:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY (get from Supabase Settings)
# - STRIPE_SECRET_KEY (get from Stripe Dashboard)

# Start backend API server
npm run dev
# Server starts on http://localhost:4000
```

### Step 4: Verify Backend is Running

```bash
curl http://localhost:4000/health

# Expected output:
# {"status":"ok","timestamp":"2026-05-08T20:00:00.000Z","version":"1.0.0"}
```

### Step 5: Start Frontend Applications

**In separate terminals:**

```bash
# Terminal 1: Admin Dashboard (Port 3002)
cd apps/admin-dashboard
npm run dev

# Terminal 2: Laundromat Dashboard (Port 3003)
cd apps/laundromat-dashboard
PORT=3003 npm run dev

# Terminal 3: Customer App (Port 3001)
cd apps/customer-app
PORT=3001 npm run dev

# Terminal 4: Driver App (Expo)
cd apps/driver-app
npm run dev
```

### Step 6: Verify All Apps are Running

```
✅ Admin Dashboard: http://localhost:3002
✅ Laundromat Dashboard: http://localhost:3003
✅ Customer App: http://localhost:3001
✅ Driver App: http://localhost:8081 (Expo)
✅ Backend API: http://localhost:4000
```

## Realtime Features Now Available

### Order Real-Time Updates

1. **Admin Dashboard Orders Page**
   - Socket.io subscribes to all order events
   - New orders appear instantly
   - Status updates broadcast to all connected clients
   - Dispatch assignments trigger driver notifications

2. **Driver Live Location Tracking**
   - Driver app broadcasts location every 5 seconds
   - Admin dashboard shows driver position in real-time
   - Customer app shows live ETA updates
   - Redis Pub/Sub ensures scaling across multiple servers

3. **Notifications**
   - Order status changes trigger push notifications
   - Support ticket updates notify customers
   - Driver earnings notifications
   - Wallet balance changes alert users

4. **Wallet Updates**
   - Balance changes broadcast instantly
   - Transaction history updates in real-time
   - Payment confirmations push immediately

### Testing Realtime Features

**Test 1: Order Status Updates**
```bash
# Terminal with backend logs
npm run dev

# In Admin Dashboard:
# 1. Navigate to Orders page
# 2. Click on any order
# 3. Change the status
# 4. Watch the Socket.io event in backend console
# 5. All connected clients see the update instantly
```

**Test 2: Driver Location Tracking**
```bash
# Terminal with backend logs
npm run dev

# In Driver App:
# 1. Go to "Active Order" screen
# 2. Backend broadcasts location every 5s
# 3. Admin dashboard shows live marker
# 4. Customer app shows live ETA
```

**Test 3: Notifications**
```bash
# Trigger order status change to see:
# - Backend notification queue processing
# - Socket.io event broadcast
# - Notification appears in notification inbox
# - Unread count increments
```

## Production Deployment

### Option 1: Docker Compose (Staging)

```bash
# From project root
docker-compose up -d

# Verify services
docker-compose ps

# Check logs
docker-compose logs backend-api
docker-compose logs redis

# Stop services
docker-compose down
```

### Option 2: Kubernetes (Production Scale)

```bash
# Prerequisites
kubectl cluster-info
helm version

# Deploy stack
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/backend-api-deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Monitor
kubectl logs -f deployment/backend-api -n jiffylaundry
kubectl port-forward svc/backend-api 4000:4000 -n jiffylaundry
```

### Option 3: Managed Services (AWS/GCP)

**AWS Deployment:**
```bash
# 1. RDS for Postgres (use Supabase or managed RDS)
# 2. ElastiCache for Redis
# 3. ECS Fargate for backend-api
# 4. ALB for load balancing
# 5. CloudFront for CDN
# 6. Route 53 for DNS

# Deploy via Terraform
terraform apply -var-file=prod.tfvars
```

## Monitoring & Observability

### View Backend Logs

```bash
# Development
npm run dev

# See logs like:
# [12:34:56] ✅ User connected { userId: '...', userRole: 'admin' }
# [12:34:57] Request received { method: 'GET', path: '/api/orders' }
# [12:34:58] Response sent { statusCode: 200 }
```

### Monitor Redis

```bash
# Connect to Redis CLI
redis-cli

# Inside redis-cli:
> PING
> DBSIZE
> INFO
> MONITOR  # Watch all commands in real-time
> QUIT
```

### Check Socket.io Connections

```bash
# In Admin Dashboard console:
console.log('Connected:', socket.connected)
console.log('Socket ID:', socket.id)

# Test event emission:
socket.emit('test', { message: 'hello' })
socket.on('test', (data) => console.log('Received:', data))
```

### Performance Metrics

```
Track these metrics in production:

API Performance:
- Average response time < 100ms
- p95 latency < 500ms
- Error rate < 0.1%

Realtime:
- Socket.io connections healthy
- Messages/sec sustainable
- Queue depth < 100 jobs

Database:
- Query time < 50ms average
- Connection pool utilization < 80%
- No slow queries > 1s
```

## Troubleshooting

### Backend API Won't Start

```bash
# Check Redis is running
docker ps | grep redis

# If not:
docker-compose up -d redis

# Check port 4000 is available
lsof -i :4000

# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Socket.io Connection Fails

```bash
# In browser console:
socket.io/socket.io.js:1 GET http://localhost:4000/socket.io/ 404

# Fix: Check backend API is running on port 4000
curl http://localhost:4000/health

# Check CORS configuration in backend/src/index.js
# Ensure frontend URLs are whitelisted
```

### Orders Not Updating in Real-Time

```bash
# Check backend is receiving updates:
npm run dev | grep "order:updated"

# Check Socket.io is subscribed:
socket.emit('subscribe:order', 'order-id-here')

# Monitor Redis pub/sub:
redis-cli
> SUBSCRIBE order:updated

# Verify Supabase RLS policies allow updates
# Go to Supabase > SQL Editor > Run RLS diagnostic
```

### High Latency / Slow Updates

```bash
# 1. Check Redis memory usage
redis-cli INFO memory

# 2. Check API server CPU/Memory
top -p <pid>

# 3. Check database query performance
EXPLAIN ANALYZE SELECT * FROM orders;

# 4. Scale solution:
# - Add more backend instances
# - Use Redis cluster
# - Add database read replicas
```

### Redis Connection Refused

```bash
# Restart Redis
docker-compose down redis
docker-compose up -d redis

# Verify connectivity
redis-cli ping
# Should output: PONG

# Check Redis logs
docker-compose logs redis
```

## Database Maintenance

### Run Migrations

```bash
# Via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Copy content from supabase/migrations/002_production_schema.sql
# 3. Run in editor

# Or via CLI:
supabase db push
```

### Backup Database

```bash
# Supabase automatically backs up
# Manual backup via Supabase Dashboard:
# 1. Settings > Database > Backups
# 2. Click "Create Backup"

# Or via CLI:
supabase db pull > backup-$(date +%s).sql
```

### Monitor Audit Logs

```bash
# View in Supabase:
SELECT * FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 100;

# Export for compliance:
COPY audit_logs TO '/backup/audit_logs.csv' WITH CSV;
```

## Security Checklist

Before production deployment:

- [ ] All environment variables set in .env.local
- [ ] Stripe webhook secret configured
- [ ] Supabase RLS policies enabled on all tables
- [ ] JWT tokens verified in requests
- [ ] CORS whitelist configured properly
- [ ] Rate limiting enabled (100 req/min per user)
- [ ] Helmet.js security headers enabled
- [ ] Database passwords rotated
- [ ] Audit logging enabled
- [ ] Monitoring alerts set up
- [ ] SSL/TLS certificates valid
- [ ] Secrets not committed to git

## Deployment Checklist

### Pre-Deployment (Staging)

- [ ] All tests passing
- [ ] No console errors
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] Monitoring configured
- [ ] Backup/restore tested
- [ ] Runbooks created

### Deployment

- [ ] Pre-deployment health checks passing
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Redis/cache warmed up
- [ ] Backend API started and healthy
- [ ] Frontend apps deployed
- [ ] Smoke tests running

### Post-Deployment

- [ ] All health checks passing
- [ ] Real transactions being processed
- [ ] Realtime updates working
- [ ] No error spikes in logs
- [ ] Performance metrics nominal
- [ ] User-facing features working
- [ ] Monitoring active
- [ ] Team notified of deployment

## Emergency Procedures

### Database is Down

1. Check Supabase status: https://status.supabase.com
2. If unavailable, use backup: `supabase db pull`
3. Notify all users
4. Post status update

### Backend API is Down

1. Check logs: `npm run dev` or Docker logs
2. Restart service: `docker-compose restart backend-api`
3. If persistent, rollback to previous version
4. Run diagnostics
5. Escalate to engineering team

### Redis is Down

1. Restart: `docker-compose restart redis`
2. Check disk space: `df -h`
3. If corrupted, restore from backup
4. Monitor queue depth during recovery

### Payment Processing Failure

1. Check Stripe status: https://status.stripe.com
2. Review failed payments dashboard
3. Notify affected customers
4. Retry failed payments after 5 minutes
5. Investigate root cause

## Getting Help

**Backend API Issues:**
- Check logs: `npm run dev 2>&1 | grep error`
- Review GitHub: https://github.com/expressjs/express/issues
- Supabase docs: https://supabase.com/docs

**Socket.io Issues:**
- Socket.io docs: https://socket.io/docs/
- Examples: https://github.com/socketio/socket.io/tree/main/examples

**Redis Issues:**
- Redis commands: https://redis.io/commands
- Redis Pub/Sub: https://redis.io/topics/pubsub

**Stripe Issues:**
- Stripe API docs: https://stripe.com/docs/api
- Webhook testing: https://stripe.com/docs/testing

**JiffyLaundry Support:**
- Engineering team: @team-slack
- On-call engineer: [phone number]
- Emergency: [hotline]
