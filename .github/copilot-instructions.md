# GitHub Copilot Agent Instructions - JiffyLaundry

## Project Overview

JiffyLaundry is a production-grade laundry logistics platform with 4 applications:
- Customer Mobile App (Expo React Native)
- Driver Mobile App (Expo React Native with background location)
- Admin Web App (Next.js 14)
- Staff Web App (Next.js tablet-optimized)

Backend: Node.js + Express + Supabase + Redis + BullMQ

**Core Promise:** 24 HRS OR IT'S FREE - Enforced by SLA engine with automatic refunds

---

## Tech Stack Rules

### Frontend (Mobile)
- Use Expo SDK 50+
- Use NativeWind for Tailwind CSS
- Use Expo Router for navigation
- Use Zustand for state management
- Use TanStack Query for data fetching
- Always support light AND dark themes
- Use Lucide icons
- Use Expo Notifications for push

### Frontend (Web)
- Use Next.js 14 App Router
- Use Tailwind CSS + ShadCN UI components
- Use Server Components where possible
- Use Client Components for interactive elements
- Use Recharts for analytics
- Dark mode via next-themes

### Backend
- Use Express with TypeScript
- Use Supabase for database and auth
- Use Redis with BullMQ for queues
- Use Zod for validation
- Use Socket.io for real-time
- All API routes must have proper validation
- All admin routes require role checks
- All mutations logged to audit_logs

### Database (Supabase)
- Use PostgreSQL with Row Level Security
- All tables must have RLS policies
- Use UUID for primary keys
- Use timestamptz for dates
- Index foreign keys and frequently queried columns

---

## Code Generation Rules

### When generating new components:
1. Always include proper TypeScript types
2. Always handle loading and error states
3. Always support dark/light theme via useTheme hook
4. Always use the existing color palette (orange #FF5A00, navy #061B3A)
5. Never use inline styles - use Tailwind classes
6. Always add proper accessibility (ARIA labels, keyboard nav)

### When generating API endpoints:
1. Always validate input with Zod
2. Always use the authenticate middleware
3. Always use requireRole for admin endpoints
4. Always log admin actions to audit_logs
5. Always wrap in try-catch with proper error responses
6. Always return consistent response format: `{ success, data, error }`

### When generating database queries:
1. Always use Supabase client with RLS
2. Always add .select() with specific fields (avoid *)
3. Always handle null/undefined cases
4. Use .single() when expecting one row
5. Use .maybeSingle() when row may not exist

---

## File Organization

```
backend/src/
├── api/                 # API routes by domain
│   ├── admin/
│   ├── auth.ts
│   ├── orders.ts
│   ├── drivers.ts
│   ├── customers.ts
│   ├── wallet.ts
│   ├── support.ts
│   └── analytics.ts
├── config/              # Configuration
│   ├── supabase.ts
│   ├── redis.ts
│   ├── stripe.ts
│   └── env.ts
├── db/                  # Database
│   ├── migrations/
│   └── schema.ts
├── middleware/          # Express middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── rateLimit.ts
├── services/            # Business logic (core)
│   ├── orderService.ts
│   ├── SLAEngine.ts
│   ├── refundService.ts
│   ├── notificationService.ts
│   ├── zoneService.ts
│   ├── promoService.ts
│   └── dispatchService.ts
├── workers/             # BullMQ workers
│   ├── dispatchWorker.ts
│   ├── slaWorker.ts
│   ├── notificationWorker.ts
│   └── index.ts
├── webhooks/            # External webhooks
│   ├── stripe.ts
│   ├── expo.ts
│   └── resend.ts
├── realtime/            # Socket.io
│   ├── socket.ts
│   ├── events.ts
│   └── middleware.ts
├── scripts/             # One-off scripts
│   ├── setupDatabase.ts
│   ├── seed.ts
│   └── migrate.ts
└── index.ts             # Server entry point
```

---

## Environment Variables Required

```env
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=

# Redis
REDIS_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PUBLISHABLE_KEY=

# Email (Resend)
RESEND_API_KEY=

# Push Notifications
EXPO_ACCESS_TOKEN=

# JWT
JWT_SECRET=your-super-secret-min-32-chars

# Node
NODE_ENV=
PORT=3001
```

---

## Common Patterns

### Theme Hook (Mobile)
```tsx
const { colors, isDark } = useTheme();
// colors: { primary, secondary, background, text, border }
```

### Theme Hook (Web)
```tsx
const { theme, setTheme } = useTheme();
// theme: 'light' | 'dark'
```

### Authenticated API Call
```tsx
const { data: { session } } = await supabase.auth.getSession();
fetch('/api/endpoint', {
  headers: { 
    Authorization: `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json'
  }
});
```

### Admin Action with Audit Log
```typescript
// In backend API endpoint
await logAuditAction({
  user_id: userId,
  action: 'ORDER_REFUND',
  description: `Issued $${amount} refund for order ${orderId}`,
  metadata: { orderId, amount, reason }
});
```

### Queue Job
```typescript
// Queue a job
await dispatchQueue.add('assign-order', {
  orderId: 'order-123',
  driverId: 'driver-456'
});

// Process job
dispatchQueue.process('assign-order', async (job) => {
  // Process job
});
```

### Socket Event
```typescript
// Emit from client
socket.emit('location:update', { lat, lng, orderId });

// Listen on server
socket.on('location:update', (data) => {
  // Broadcast to relevant clients
  io.to(`order:${data.orderId}`).emit('driver:location', data);
});
```

---

## Database Schema Quick Reference

### Core Tables
- `profiles` - Users with roles (customer, driver, laundromat_operator, admin)
- `orders` - Full order lifecycle with status enum
- `order_items` - Line items in orders
- `driver_locations` - Real-time GPS tracking
- `wallets` - User account balances
- `wallet_transactions` - Payment history
- `support_tickets` - Customer support
- `notifications` - User notifications
- `subscriptions` - Recurring services
- `promo_codes` - Discounts and promotions
- `audit_logs` - All admin actions

### RLS Policies
- Customers see only their orders
- Drivers see assigned orders
- Staff see facility orders
- Admins see all data

---

## Testing Requirements

- Unit tests for all services
- Integration tests for API endpoints
- E2E tests for critical flows:
  - Order creation → delivery
  - Driver accepts → completes job
  - Refund → wallet credit
  - Promo code → discount applied

### Test Command
```bash
npm test                    # Run all
npm test -- orders.test.ts  # Single file
npm test -- --coverage      # With coverage
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Redis connection verified

### Deployment Commands
```bash
# Backend (Railway/Render)
npm run build && npm start

# Web apps (Vercel)
vercel --prod

# Mobile (Expo)
eas build --platform all
```

### Post-Deployment
- [ ] Health check endpoint responds
- [ ] Database queries work
- [ ] WebSocket connection established
- [ ] Push notifications sending
- [ ] Stripe webhooks receiving

---

## Security Rules

- Never expose service role keys to client
- Always validate user permissions on backend
- Always sanitize user input (Zod validation)
- Always use parameterized queries (Supabase handles)
- Rate limit public endpoints (100 req/min)
- HTTPS only in production
- CORS restricted to known domains

---

## Performance Targets

| Metric | Target |
|--------|--------|
| API Response | <100ms |
| Order Status Update | <500ms (realtime) |
| Page Load | <2s |
| Mobile App Startup | <3s |
| Driver Location Update | <2s |
| Refund Processing | <1min |

---

## When in Doubt

1. Follow existing patterns in the codebase
2. Use TypeScript strict mode
3. Add JSDoc comments for complex functions
4. Keep functions small and focused
5. Prefer composition over inheritance
6. Write tests before implementation
7. Check existing issue/PR for similar feature
