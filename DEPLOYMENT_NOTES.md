<!-- markdownlint-disable MD032 MD036 MD031 MD040 MD034 -->
# DEPLOYMENT_NOTES.md — JiffyLaundry Platform

## Production Deployment Guide

This guide covers everything needed to deploy JiffyLaundry to production.

---

## Pre-Deployment Checklist

- [ ] All PHASE 35-36 builds passing
- [ ] QA test plan completed and passed
- [ ] All 4 documentation files created
- [ ] Environment variables configured
- [ ] Stripe production account set up
- [ ] Supabase database schema complete
- [ ] All RLS policies enabled
- [ ] Edge Functions deployed
- [ ] Error logging configured
- [ ] Backup strategy documented

---

## Environment Setup

### Supabase Production Instance

1. **Create Production Project**
   - Go to supabase.com
   - Create new project
   - Name: "jiffylaundry-prod"
   - Select region close to customers
   - Save credentials

2. **Copy Credentials**
   - Project Settings → API
   - Copy: Project URL
   - Copy: Anon Key (public)
   - Copy: Service Role Key (keep secret)
   - Copy: JWT Secret

3. **Database Schema**
   - Go to SQL Editor
   - Paste all CREATE TABLE statements from COPILOT_MASTER_BUILD.md
   - Run all migrations
   - Verify all tables created

4. **Enable RLS**
   - Go to Authentication → Row Level Security
   - For each table, enable RLS:
     - profiles
     - addresses
     - orders
     - order_items
     - wallets
     - wallet_transactions
     - support_tickets
     - notifications

5. **Add RLS Policies**
   - Paste all RLS policies from COPILOT_MASTER_BUILD.md
   - Test policies with test accounts

6. **Set Secrets**
   - Go to Settings → Secrets
   - Add: STRIPE_SECRET_KEY (from Stripe)
   - Add: STRIPE_PUBLISHABLE_KEY (from Stripe)

---

### Stripe Production Account

1. **Create Account**
   - Go to stripe.com
   - Sign up for production account
   - Verify email
   - Complete business information

2. **Get API Keys**
   - Dashboard → Developers → API Keys
   - Copy: Publishable Key (starts with pk_live_)
   - Copy: Secret Key (starts with sk_live_)
   - Keep Secret Key secure

3. **Configure Webhooks**
   - Dashboard → Developers → Webhooks
   - Add endpoint for payment events
   - Endpoint URL: [your-backend-url]/webhooks/stripe
   - Listen for: charge.succeeded, charge.failed
   - Copy: Webhook signing secret

4. **Test Payment**
   - Use test card to verify setup
   - 4242 4242 4242 4242
   - Verify charge appears in dashboard

---

### Environment Variables

Create `.env.production` files for each app:

**apps/customer-app/.env.production**
```
EXPO_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**apps/driver-app/.env.production**
```
EXPO_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**apps/admin-dashboard/.env.production**
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**apps/laundromat-dashboard/.env.production**
```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Deployment Steps

### 1. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI (if not already)
npm install -g supabase

# Login to Supabase
supabase login

# Deploy Edge Functions
cd supabase/functions
supabase functions deploy create-payment-intent \
  --project-id=[your-project-id]

# Verify deployment
supabase functions list --project-id=[your-project-id]
```

### 2. Deploy Customer App (iOS/Android)

**Build with EAS:**

```bash
cd apps/customer-app

# Configure EAS (first time only)
npx eas-cli@latest build:configure

# Build for production (iOS)
npx eas-cli@latest build --platform ios --auto-submit

# Build for production (Android)
npx eas-cli@latest build --platform android --auto-submit

# Monitor builds
npx eas-cli@latest build:list
```

**Manual Steps:**
1. Wait for builds to complete (30-60 minutes)
2. Builds appear in EAS dashboard
3. Download and test on physical devices
4. Submit to App Store (iOS) and Google Play (Android)

### 3. Deploy Driver App (iOS/Android)

```bash
cd apps/driver-app

# Configure EAS (first time only)
npx eas-cli@latest build:configure

# Build for production
npx eas-cli@latest build --platform ios --auto-submit
npx eas-cli@latest build --platform android --auto-submit

# Wait for builds
# Submit to stores
```

### 4. Deploy Admin Dashboard (Vercel or similar)

**Using Vercel:**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd apps/admin-dashboard
vercel --prod

# Verify
vercel env:ls --prod
```

**Using self-hosted:**

```bash
cd apps/admin-dashboard

# Build
npm run build

# Copy build to server
scp -r .next/* user@server:/var/www/admin-dashboard/

# Restart service
ssh user@server "systemctl restart admin-dashboard"
```

### 5. Deploy Laundromat Dashboard

```bash
cd apps/laundromat-dashboard

# Deploy to Vercel or self-hosted
vercel --prod
# or
npm run build && scp -r .next/* user@server:/var/www/laundromat-dashboard/
```

---

## Post-Deployment Verification

### 1. Check All Services Running

- [ ] Supabase database online
- [ ] Supabase Edge Functions deployed
- [ ] Customer app on app stores (or testing link)
- [ ] Driver app on app stores (or testing link)
- [ ] Admin dashboard accessible
- [ ] Laundromat dashboard accessible

### 2. Test Core Flows

1. **Customer Signup & Order**
   - Sign up new customer
   - Add address
   - Create order
   - Verify in database

2. **Payment Processing**
   - Complete payment flow
   - Verify Stripe charge created
   - Verify order status updated

3. **Admin Dispatch**
   - Login to admin dashboard
   - Dispatch order to driver
   - Verify order updated

4. **Driver Assignment**
   - Login to driver app
   - Verify assigned order visible
   - Update status

5. **Tracking**
   - Customer app shows tracking
   - Status updates in real-time

### 3. Check Monitoring

- [ ] Error logging configured (e.g., Sentry)
- [ ] Performance monitoring active
- [ ] Database backups running
- [ ] Alerts configured for failures

### 4. Database Verification

```sql
-- Check table counts
SELECT count(*) FROM profiles;
SELECT count(*) FROM orders;
SELECT count(*) FROM services;

-- Verify RLS enabled
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
SELECT * FROM pg_policies;

-- Check services exist
SELECT * FROM services WHERE active = true;
```

---

## Production Best Practices

### Security

1. **Rotate Secrets Regularly**
   - Stripe keys
   - Supabase service role key
   - Database passwords

2. **Enable HTTPS**
   - All dashboards must use HTTPS
   - Enable HSTS headers

3. **Monitor Auth**
   - Log all admin logins
   - Alert on suspicious activity
   - Restrict admin access by IP (if possible)

4. **Secure Backups**
   - Enable Supabase automated backups
   - Test restore process monthly
   - Keep backups encrypted and secure

### Performance

1. **Enable Caching**
   - Cache service list on client
   - Cache user profile on login
   - Clear cache on logout

2. **Monitor Database**
   - Check query performance
   - Add indexes for slow queries
   - Monitor connection count

3. **CDN for Static Assets**
   - Use Supabase storage for images
   - Configure CDN if available

### Reliability

1. **Error Handling**
   - All network calls must handle errors
   - Retry failed requests with backoff
   - User-friendly error messages

2. **Graceful Degradation**
   - If tracking fails, show last known status
   - If payment processing slow, show spinner
   - Never lose customer data

3. **Status Page**
   - Create status page for monitoring
   - Notify users of planned maintenance
   - Post incident reports

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Payment Success Rate**
   - Target: > 99%
   - Alert if < 95%

2. **Order Completion Time**
   - Average should be 4-6 hours
   - Alert if average > 8 hours

3. **App Errors**
   - Track crash rate per app
   - Alert if > 1% of sessions crash

4. **Database Health**
   - Connection count
   - Query times
   - Row counts in key tables

5. **Stripe Issues**
   - Failed charges
   - Declined cards
   - API errors

### Setup Alerts

**Supabase Dashboard:**
- Enable alerts for high error rate
- Monitor connection pool
- Check backup status daily

**Stripe Dashboard:**
- Enable email alerts for failures
- Monitor dispute rate

**Application:**
- Sentry or similar for error tracking
- Log all orders, payments, dispatches
- Daily report of system health

---

## Rollback Plan

If production breaks after deployment:

### Immediate Steps

1. **Assess Impact**
   - How many users affected?
   - What functionality broken?
   - How long until resolution?

2. **Decide: Fix or Rollback**
   - If quick fix (< 30 min): Fix
   - If uncertain: Rollback

### Rollback Process

**Apps (iOS/Android):**
- Can't instantly rollback on mobile
- Previous version available in app store
- Direct users to older version temporarily

**Dashboards (Web):**
- Rollback to previous build in Vercel
- Takes 5-10 minutes
- No user action needed (reload page)

**Database:**
- If schema broken: Restore from backup
- If data corrupted: Restore from backup
- Backup restores to point-in-time (might lose recent data)

**Recommendation:**
- Keep previous 2 weeks of builds available
- Test all changes in staging first
- Have quick-fix commits ready

---

## Maintenance

### Weekly

- [ ] Check error logs for issues
- [ ] Monitor database performance
- [ ] Review payment failures

### Monthly

- [ ] Update dependencies (security patches)
- [ ] Test backup restore
- [ ] Review and rotate secrets
- [ ] Check app store reviews for issues

### Quarterly

- [ ] Performance review
- [ ] Security audit
- [ ] Capacity planning
- [ ] Update documentation

---

## Support & Runbooks

### On-Call Procedures

**If Customer Reports Issue:**
1. Check if system-wide or individual user
2. Check error logs
3. Check database status
4. Check Stripe status
5. Document issue
6. Implement fix or workaround
7. Follow up with customer

**If Payment Processing Down:**
1. Check Stripe status page
2. Check Supabase function logs
3. Check network connectivity
4. Restart Edge Function if needed
5. Notify customers
6. Offer alternatives (COD, etc.)

**If Database Down:**
1. Check Supabase status
2. Restart if available
3. Restore from backup if needed
4. Notify all users
5. Document root cause
6. Implement prevention

### Escalation Path

- **Level 1:** On-call engineer
- **Level 2:** Senior developer
- **Level 3:** Tech lead / CTO
- **Level 4:** External vendor support (Supabase, Stripe, etc.)

---

## Disaster Recovery

### In Case of Major Outage

1. **Assess Scope**
   - What service is down?
   - How long has it been down?
   - How many users affected?

2. **Communicate**
   - Post status update
   - Email customers if critical
   - Social media notification

3. **Implement Emergency Fix**
   - Route to backup service if available
   - Temporarily disable affected feature
   - Redirect traffic if possible

4. **Restore Service**
   - Identify root cause
   - Fix problem
   - Restore from backup if needed
   - Verify integrity

5. **Post-Mortem**
   - Document what happened
   - Identify prevention steps
   - Implement fixes
   - Update runbooks

### Backup & Recovery

**Database Backups:**
- Supabase: Automated daily
- Off-site: Store in separate region
- Test restore: Monthly
- Retention: 30 days minimum

**Application Code:**
- Git repository: Multiple backups
- Releases: Keep 2-4 previous builds
- Configuration: Version control

---

## Go-Live Checklist

- [ ] All environment variables set
- [ ] Database schema complete and tested
- [ ] RLS policies enabled and tested
- [ ] Edge Functions deployed
- [ ] Stripe production account configured
- [ ] Error logging configured
- [ ] Monitoring alerts set up
- [ ] Backups automated and tested
- [ ] QA testing complete
- [ ] All 4 apps deployed
- [ ] Staff trained on admin dashboard
- [ ] Customer support team briefed
- [ ] Status page created
- [ ] Rollback plan documented
- [ ] On-call schedule defined

---

## Contact Information

**Development Team:**
- Email: [dev-email]
- Slack: #jiffylaundry-ops
- On-Call: [phone number]

**Vendor Support:**
- Supabase: support@supabase.io
- Stripe: support@stripe.com
- Vercel: support@vercel.com

**Production Access:**
- Supabase Dashboard: [link]
- Stripe Dashboard: [link]
- Vercel Dashboard: [link]
- Server SSH: [details]

---

## Appendix: Key Files

- **Migrations:** `supabase/migrations/`
- **Edge Functions:** `supabase/functions/create-payment-intent/`
- **Env Template:** See above
- **RLS Policies:** COPILOT_MASTER_BUILD.md PHASE 0
- **Build Commands:** See Deployment Steps section

---

## Questions?

Refer to:
- TROUBLESHOOTING.md — for common issues
- CLIENT_HANDOFF.md — for user documentation
- ADMIN_OPERATIONS_GUIDE.md — for operational procedures
- COPILOT_MASTER_BUILD.md — for technical specifications
