# JiffyLaundry Backend API

Production-grade backend orchestration layer for the JiffyLaundry platform.

## Features

- **Express.js** HTTP API
- **Socket.io** realtime event streaming
- **Redis Pub/Sub** for horizontal scaling
- **Bull Queue** for background job processing
- **Audit Logging** for compliance
- **RBAC Middleware** for authorization
- **Stripe Integration** for payments
- **Pino Logger** for observability

## Running

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Environment Variables

```env
PORT=4000
REDIS_URL=redis://localhost:6379
NODE_ENV=production
LOG_LEVEL=info
STRIPE_SECRET_KEY=sk_live_...
SUPABASE_URL=https://...supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_URL=https://yourdomain.com
```

## Architecture

### Event System

- **Order Events**: `order:updated`, `order:assigned`, `order:location`
- **Driver Events**: `driver:location`, `driver:online`
- **Payment Events**: `payment:processed`, `payment:failed`
- **Notification Events**: `notification:sent`, `notification:read`

### Queue Jobs

- **Audit Logs**: Every request logged for compliance
- **Notifications**: Push/email notifications
- **Payments**: Stripe webhook handling
- **Order Processing**: Background order operations

### API Endpoints

- `GET /health` - Health check
- `GET /api/orders` - List all orders
- `GET /api/orders/:orderId` - Get order
- `POST /api/orders/:orderId/status` - Update order status
- `POST /api/dispatch/assign` - Assign order to driver
- `POST /api/drivers/:driverId/location` - Update driver location
- `GET /api/wallet/:userId` - Get wallet
- `POST /api/wallet/:userId/topup` - Add wallet funds
- `GET /api/support/tickets` - List support tickets
- `POST /api/support/tickets/:ticketId/status` - Update ticket

### Socket.io Events

**Server → Client**
- `order:${orderId}:updated` - Order status changed
- `order:${orderId}:assigned` - Order assigned to driver
- `driver:${driverId}:location` - Driver location update
- `driver:${driverId}:new_order` - New order for driver
- `wallet:${userId}:updated` - Wallet balance changed
- `ticket:${ticketId}:updated` - Support ticket updated
- `notification` - New notification

**Client → Server**
- `subscribe:order` - Subscribe to order updates
- `unsubscribe:order` - Unsubscribe from order
- `subscribe:driver` - Subscribe to driver location
- `driver:location` - Send driver location
- `subscribe:notifications` - Subscribe to notifications

## Monitoring

Access logs in production via:

```bash
# View real-time logs
npm run dev | grep -i "error"

# View request trace
LOG_LEVEL=debug npm run dev
```

## Scaling

For horizontal scaling:

1. Deploy multiple instances behind load balancer
2. Share Redis instance across all servers
3. Socket.io will handle client distribution
4. Bull queues use shared Redis
5. Audit logs distributed across instances
