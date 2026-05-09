# GitHub Copilot Operations Guide

## Overview

This guide helps GitHub Copilot agents extend and maintain JiffyLaundry. Use this to understand common patterns, troubleshooting steps, and project conventions.

## 1. Quick Reference

### Project Structure
```
jiffylaundry/
├── apps/                     # Frontend applications
│   ├── admin-web/           # Admin Dashboard (Next.js)
│   ├── staff-web/           # Staff Dashboard (Next.js)
│   ├── customer-app/        # Customer App (Expo)
│   └── driver-app/          # Driver App (Expo)
├── backend/                 # Express API server
├── packages/                # Shared code
│   ├── config/
│   ├── shared/
│   └── ui/
├── infrastructure/          # Docker, Render, Vercel configs
└── supabase/               # Database schema & migrations
```

### Key Commands
```bash
pnpm install              # Install all dependencies
pnpm run dev             # Start all development servers
pnpm run build           # Build all projects
pnpm run test            # Run all tests
pnpm run docker:up       # Start Docker services (PostgreSQL, Redis)
pnpm run db:setup        # Initialize database
pnpm run deploy:all      # Deploy to production
```

## 2. Creating New Features

### Admin Dashboard Page

Create a new admin section page following this pattern:

**File**: `apps/admin-web/app/[section]/page.jsx`

```jsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import AdminCard from '@/components/AdminCard';
import AdminButton from '@/components/AdminButton';
import AdminTable from '@/components/AdminTable';

export default function [SectionPage]() {
  const { colors } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/[endpoint]');
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.text }}>
          Section Title
        </h1>
        <p style={{ color: colors.textSecondary, marginTop: '8px' }}>
          Section description
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Metric cards */}
      </div>

      <AdminCard title="Data Table">
        <AdminTable
          columns={columns}
          data={data}
          loading={loading}
        />
      </AdminCard>
    </div>
  );
}
```

### Backend API Endpoint

Create an authenticated API endpoint:

**File**: `backend/src/api/[domain].ts`

```typescript
import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/authorization';
import { supabase } from '../config/supabase';
import * as z from 'zod';

const router = express.Router();

// Validation schema
const CreateSchema = z.object({
  name: z.string().min(1),
  // ... other fields
});

// GET /api/[endpoint]
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('id, name, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/[endpoint] (Admin only)
router.post('/', authenticate, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const body = CreateSchema.parse(req.body);

    const { data, error } = await supabase
      .from('table_name')
      .insert([{ ...body, created_by: req.user.id }])
      .select();

    if (error) throw error;

    // Emit real-time event
    req.io.emit('data:created', data[0]);

    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
```

### Database Migration

Add a new table or column:

**File**: `supabase/migrations/[timestamp]_description.sql`

```sql
-- Create new table
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_new_table_created_at ON new_table(created_at DESC);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users see own data
CREATE POLICY "users_see_own_data" ON new_table
  FOR SELECT USING (auth.uid() = user_id);
```

## 3. Debugging Guide

### Backend Issues

**Port already in use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 pnpm run dev:backend
```

**Database connection error**
```bash
# Check Supabase credentials in .env.local
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# Restart Docker services
pnpm run docker:down && pnpm run docker:up
```

**Socket.io connection issues**
```bash
# Check Redis connection
redis-cli ping
# Expected: PONG

# Check Socket.io events in browser console
localStorage.debug = '*'
```

### Frontend Issues

**Next.js build error**
```bash
# Clear cache
rm -rf .next

# Rebuild
pnpm run build:admin
```

**Expo app won't start**
```bash
# Clear cache
pnpm run dev:customer -- --clear

# Reset Metro bundler
watchman watch-del-all
```

## 4. Code Patterns

### Authentication Hook (Mobile)
```jsx
const useAuth = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
      }
    );
    
    return () => subscription?.unsubscribe();
  }, []);
  
  return user;
};
```

### Real-time Data Sync (Web)
```jsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const useRealtimeData = (table) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
        setData(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [table]);

  return data;
};
```

### Admin Action with Audit Log
```typescript
async function issueRefund(orderId: string, amount: number, reason: string) {
  const refundId = crypto.randomUUID();

  // Create refund
  const { error: refundError } = await supabase
    .from('wallet_transactions')
    .insert([{
      id: refundId,
      user_id: order.customer_id,
      amount,
      type: 'refund',
      reference_id: orderId,
      metadata: { reason }
    }]);

  if (refundError) throw refundError;

  // Log admin action
  await logAuditAction({
    action: 'ORDER_REFUND',
    description: `Issued $${amount} refund for order ${orderId}`,
    metadata: { orderId, amount, refundId, reason },
    user_id: req.user.id
  });
}
```

## 5. Testing

### Backend Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { orderService } from '@/services/orderService';

describe('orderService', () => {
  it('should create an order', async () => {
    const order = await orderService.createOrder({
      customer_id: 'test-customer',
      items: [{ service_id: 'wash', quantity: 1 }]
    });

    expect(order).toHaveProperty('id');
    expect(order.status).toBe('pending');
  });
});
```

### Frontend Component Test
```typescript
import { render, screen } from '@testing-library/react';
import AdminCard from '@/components/AdminCard';

describe('AdminCard', () => {
  it('renders title and children', () => {
    render(
      <AdminCard title="Test Card">
        <p>Test content</p>
      </AdminCard>
    );

    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
});
```

## 6. Deployment Checklist

Before deploying to production:

- [ ] All tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm run type-check`
- [ ] No linting errors: `pnpm run lint`
- [ ] Environment variables set in production
- [ ] Database migrations reviewed
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Performance targets met (API <100ms, Page load <2s)

### Deploy Commands
```bash
# Deploy backend to Render
cd backend && railway up

# Deploy admin dashboard to Vercel
cd apps/admin-web && vercel --prod

# Deploy all apps
pnpm run deploy:all
```

## 7. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `CORS error in console` | Check `FRONTEND_URL` in backend .env |
| `WebSocket connection failed` | Ensure Socket.io port (3001) is accessible |
| `Database query returns null` | Check RLS policies in Supabase console |
| `Stripe webhook not received` | Verify webhook URL in Stripe dashboard |
| `Push notifications not sending` | Check EXPO_ACCESS_TOKEN in environment |
| `Mobile app crashes on startup` | Check app.json configuration and providers |
| `Vercel build fails` | Check `vercel.json` buildCommand and env vars |
| `Docker compose won't start` | Run `docker system prune` and retry |

## 8. Performance Optimization

### Database Query Optimization
```typescript
// ❌ Bad: N+1 queries
const orders = await supabase.from('orders').select('*');
for (const order of orders.data) {
  const customer = await supabase.from('profiles').select('name').eq('id', order.customer_id);
}

// ✅ Good: Join query
const orders = await supabase
  .from('orders')
  .select('*, customer:customer_id(name)');
```

### Frontend Performance
```jsx
// Use React.memo for expensive components
const OrderCard = React.memo(({ order }) => {
  return <div>{order.id}</div>;
});

// Use useCallback to prevent unnecessary re-renders
const handleClick = useCallback(() => {
  doSomething();
}, [dependency]);
```

## 9. Security Best Practices

- ✅ Always validate input with Zod schemas
- ✅ Always check user permissions before mutations
- ✅ Never expose service role keys to client
- ✅ Always log sensitive admin actions
- ✅ Use HTTPS in production
- ✅ Rate limit public endpoints
- ✅ Sanitize user input

## 10. Resources

- [Express.js Documentation](https://expressjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Zod Documentation](https://zod.dev/)

---

**Need help?** Check `.github/copilot-instructions.md` for detailed coding standards and patterns.
