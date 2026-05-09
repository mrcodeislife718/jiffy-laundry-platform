# GitHub Copilot Agent Commands - JiffyLaundry

**Quick reference for all common commands when working with the JiffyLaundry codebase.**

---

## Generate a New Feature

```
@workspace Create a new [feature name] with:
- API endpoints in backend/src/api/[feature].ts
- Service in backend/src/services/[feature]Service.ts
- Types in packages/types/src/[feature].ts
- Validators in packages/validators/src/[feature].ts
- Admin UI in apps/admin-web/app/[feature]/page.tsx
- Customer mobile UI in apps/customer-mobile/app/(tabs)/[feature].tsx
- Include tests in backend/tests/[feature].test.ts
- Add to CHANGELOG.md with breaking changes (if any)
```

---

## Fix a Bug Report

```
@workspace Fix bug in [file path]:
- Issue: [describe what's broken]
- Root cause: [analyze if unsure]
- Expected: [what should happen]
- Current: [what happens now]
- Fix: [solution approach]
- Tests: [add test to prevent regression]
```

---

## Add Database Migration

```
@workspace Add Supabase migration for [table/change]:
- Table name: [name]
- Columns: [list with types and constraints]
- Relationships: [foreign keys]
- Indexes: [list columns to index]
- RLS policies: [for each role]
- Migration file: supabase/migrations/[timestamp]_[description].sql
```

---

## Add Admin Panel Section

```
@workspace Add admin panel section for [entity]:
- List view: /app/admin-web/app/[entity]/page.tsx
  - Columns: [list]
  - Filters: [search, status, date range]
  - Pagination: [50/100/250 per page]
  - Bulk actions: [select, export, delete]
- Detail view: /app/admin-web/app/[entity]/[id]/page.tsx
  - All editable fields
  - Audit log of changes
  - Related records
- Edit form: Inline or modal
  - Validation with Zod
  - Optimistic updates
  - Error recovery
- Delete with confirmation modal
```

---

## Add Mobile Screen

```
@workspace Add [screen name] to customer app:
- Route: apps/customer-mobile/app/(tabs)/[name].tsx
- Components: [list components needed]
- API calls: [list endpoints]
- State: [Zustand store if needed]
- Navigation: [add to bottom tabs]
- Offline support: [query cache strategy]
- Tests: apps/customer-mobile/tests/[name].test.ts
```

---

## Add Queue Worker

```
@workspace Add BullMQ worker for [task]:
- Queue name: [name]
- Job shape: { [fields] }
- Handler: backend/src/workers/[name]Worker.ts
- Processing: [describe logic]
- Error handling: [retry strategy]
- Logging: [what to log]
- Tests: backend/tests/workers/[name].test.ts
```

---

## Add Webhook Handler

```
@workspace Add webhook for [service]:
- Service: [Stripe/Expo/Resend/etc]
- Events: [list event types]
- Handler: backend/src/webhooks/[service].ts
- Security: [signature verification]
- Processing: [describe logic]
- Error handling: [idempotency approach]
- Testing: [test event payload]
```

---

## Generate Test Suite

```
@workspace Generate comprehensive tests for [feature]:
- Unit tests: backend/tests/services/[feature].test.ts
  - Happy path: [describe]
  - Edge cases: [list]
  - Error cases: [list]
- Integration tests: backend/tests/api/[feature].test.ts
  - Auth checks
  - Role-based access
  - Error responses
- E2E tests: [describe critical user flows]
```

---

## Optimize Query Performance

```
@workspace Optimize [query/component/endpoint]:
- Current: [describe current implementation]
- Problem: [what's slow, how do you know]
- Bottleneck: [query N+1, component re-renders, etc]
- Solution:
  - Add indexes: [list columns]
  - Query optimization: [select specific fields]
  - Caching: [redis, query cache]
  - Pagination: [implement limits]
```

---

## Deploy to Production

```
@workspace Deploy to production:
- Pre-checks:
  - Run tests: npm test
  - Build: npm run build
  - Type check: npx tsc --noEmit
- Backend: Railway/Render
- Web apps: Vercel
- Mobile: Expo EAS build
- Migrations: npm run db:migrate
- Env vars: Verify in production
- Smoke tests: Test critical flows
```

---

## Project-Specific Patterns

### "Add a new laundry service type"

Will generate:
- Add to order_items service enum
- Update pricing calculation in orderService
- Add to mobile UI order creation form
- Add to admin pricing settings

### "Add driver bonus/incentive system"

Will generate:
- Driver earnings service with calculation
- Admin bonus configuration UI
- Driver earnings dashboard
- Payout processing

### "Add customer loyalty program"

Will generate:
- Points calculation service
- Loyalty tier system
- Customer dashboard showing points
- Admin loyalty configuration

### "Add commercial/bulk orders"

Will generate:
- Bulk order import (CSV)
- Batch processing queue
- Commercial pricing tier
- Recurring subscriptions support

### "Add detailed analytics dashboard"

Will generate:
- Analytics queries with aggregations
- Charts: orders, revenue, completion %, SLA
- Export to CSV/PDF
- Date range filtering
- Facility comparisons

### "Add in-app messaging"

Will generate:
- Chat schema (threads, messages)
- Real-time messaging via Socket.io
- Message notifications
- File upload support

### "Add route optimization"

Will generate:
- TSP solver integration
- Driver assignment algorithm
- Zone validation
- ETA calculation

---

## Code Review Checklist

Always verify before merge:

- [ ] TypeScript types complete and correct
- [ ] Error handling present (try-catch)
- [ ] Loading states handled in UI
- [ ] Dark mode works (mobile & web)
- [ ] Mobile responsive (< 768px tested)
- [ ] Rate limiting applied (admin endpoints)
- [ ] Input validation with Zod
- [ ] Admin actions logged to audit_logs
- [ ] Tests passing (unit + integration)
- [ ] Database migrations included
- [ ] No secrets in code
- [ ] Documentation updated

---

## Emergency Fixes

### "Order status stuck"
- Add admin override in `/api/admin/orders/:id/force-status`
- Body: `{ status: string, reason: string }`
- Logs action to audit trail
- Trigger SLA recalculation

### "Push notifications not sending"
- Check Expo token validity
- Verify notification queue worker running
- Check Redis connection
- Review Expo notification logs

### "SLA calculation wrong"
- Check timezone handling in SLA engine
- Verify deadline calculation logic
- Check status transition timestamps
- Run recalculation job for affected orders

### "Payment webhook failing"
- Verify Stripe signature
- Check order lookup logic
- Ensure idempotency (webhook may retry)
- Log all webhook events

### "Driver location not updating"
- Check Socket.io connection status
- Verify location permissions granted
- Check Redis Pub/Sub functioning
- Verify driver is in correct room

### "Database connection pool exhausted"
- Restart database connection
- Check for connection leaks
- Increase pool size
- Monitor with Sentry

---

## Performance Debugging

### Slow API endpoint
1. Check database query with `EXPLAIN ANALYZE`
2. Add missing indexes
3. Use `.select()` to limit fields
4. Implement pagination
5. Add Redis caching

### Slow mobile app
1. Profile with React DevTools
2. Check re-render frequency
3. Memoize expensive components
4. Use query pagination
5. Lazy load screens

### Slow dashboard
1. Check Network tab for slow requests
2. Profile with Chrome DevTools
3. Reduce chart data points
4. Paginate large tables
5. Use Server Components

---

## Database Debugging

### Check table size
```sql
SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name)) 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY pg_total_relation_size(table_name) DESC;
```

### Check slow queries
Enable `log_min_duration_statement` in Supabase and check logs

### Check indexes
```sql
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Check RLS policies
```sql
SELECT schemaname, tablename, policyname, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## When Stuck

1. Check existing code for similar pattern
2. Review `.github/copilot-instructions.md`
3. Check test files for usage examples
4. Run `npm run dev` and test locally
5. Check error logs in terminal
6. Ask: "What would the simplest version be?"
7. Start with happy path, add edge cases

---

## Useful Commands

```bash
# Development
pnpm dev                  # All apps
pnpm dev:backend          # Backend only
pnpm dev:admin            # Admin web only
pnpm dev:customer         # Customer mobile

# Testing
pnpm test                 # All tests
npm test -- --coverage    # With coverage

# Database
pnpm db:setup             # Initial setup
pnpm db:migrate           # Run migrations
pnpm db:seed              # Seed test data

# Docker
pnpm docker:up            # Start Redis/Postgres
pnpm docker:down          # Stop services
pnpm docker:logs          # View logs

# Building
pnpm build                # Build all
npm run build:backend     # Backend only

# Deployment
pnpm deploy:all           # Deploy everything
npm run deploy:backend    # Backend to Railway
vercel --prod             # Web apps to Vercel
eas build                 # Mobile to Expo
```

---

**Last Updated:** May 2026  
**Maintained By:** GitHub Copilot Agent  
**Questions?** Review `.github/copilot-instructions.md` first
