<!-- markdownlint-disable MD032 MD036 MD031 MD040 MD034 MD060 MD009 -->
# PRODUCTION_DEPLOYMENT_CHECKLIST.md — JiffyLaundry Platform

## Pre-Deployment Verification

Before running any deployment commands, verify all prerequisites are met.

### Supabase Setup

- [ ] Production Supabase project created at supabase.com
- [ ] Project URL copied: `https://[project-id].supabase.co`
- [ ] Anon Key copied: `eyJ...`
- [ ] Service Role Key copied and stored securely
- [ ] Database schema fully created (all CREATE TABLE statements executed)
- [ ] All tables have RLS enabled
- [ ] All RLS policies configured and tested
- [ ] Stripe integration configured (see Supabase Secrets section)
- [ ] Backups enabled in project settings
- [ ] Real-time subscriptions enabled for required tables

### Stripe Setup

- [ ] Production Stripe account created at stripe.com
- [ ] Account verified and approved
- [ ] Stripe API keys obtained:
  - [ ] Publishable Key (pk_live_...): `[key]`
  - [ ] Secret Key (sk_live_...): `[key]`
- [ ] Webhook endpoint configured
- [ ] Webhook signing secret obtained
- [ ] Test payment successful with production keys

### Environment Variables Ready

- [ ] `.env.production` prepared for customer-app
- [ ] `.env.production` prepared for driver-app
- [ ] `.env.production` prepared for admin-dashboard
- [ ] `.env.production` prepared for laundromat-dashboard
- [ ] All keys and URLs verified as production values (not test/dev)

### Build & Deployment Tools

- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] EAS account created and logged in (`eas login`)
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Vercel account logged in (`vercel login`)
- [ ] Git repository clean (no uncommitted changes)
- [ ] Latest code committed and pushed

---

## Phase A: Supabase Database Push

**Purpose:** Migrate schema to production database

```bash
# Navigate to Supabase project directory
cd supabase

# Verify migrations are in migrations/ folder
ls migrations/

# Expected output:
# 001_create_initial_schema.sql
# 20260503193520_create_initial_schema.sql
```

**Manual Steps:**

1. Open Supabase Dashboard
2. Go to Project Settings → Database
3. Create new database (if needed) or confirm production database
4. Go to SQL Editor
5. Run each migration file in order:
   - Copy entire contents of `001_create_initial_schema.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Verify: "Success" message appears
   - Copy entire contents of `20260503193520_create_initial_schema.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Verify: "Success" message appears

**Verification:**

```sql
-- Run in Supabase SQL Editor to verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected output should include:
-- profiles
-- addresses
-- services
-- orders
-- order_items
-- wallets
-- wallet_transactions
-- support_tickets
-- refunds
```

**Checklist:**

- [ ] All migrations executed successfully
- [ ] All tables created in production database
- [ ] No SQL errors during migration
- [ ] Table counts verified

---

## Phase B: Supabase Secrets Configuration

**Purpose:** Set production Stripe keys in Supabase Edge Functions

```bash
# Verify Edge Functions exist
supabase functions list --project-id=[your-project-id]

# Expected output should show:
# create-payment-intent
```

**Manual Steps:**

1. Open Supabase Dashboard
2. Go to Settings → Secrets
3. Add two new secrets:
   - **Name:** `STRIPE_SECRET_KEY`
   - **Value:** `sk_live_...` (your production Stripe secret key)
   - Click "Add secret"
   
4. Add second secret:
   - **Name:** `STRIPE_PUBLISHABLE_KEY`
   - **Value:** `pk_live_...` (your production Stripe publishable key)
   - Click "Add secret"

5. Verify secrets in list:
   - Both secrets should appear in the Secrets list
   - No values should be visible (only keys)

**Checklist:**

- [ ] STRIPE_SECRET_KEY added to Supabase secrets
- [ ] STRIPE_PUBLISHABLE_KEY added to Supabase secrets
- [ ] Both secrets visible in Supabase console
- [ ] Secret values are production keys (sk_live_, pk_live_)

---

## Phase C: Customer App Production Build

**Purpose:** Create iOS and Android production builds with EAS

```bash
cd apps/customer-app
```

**Step 1: Configure EAS (First Time Only)**

```bash
npx eas-cli@latest build:configure
```

**What this does:**
- Creates `eas.json` configuration file
- Registers app with EAS Build service
- Takes 2-3 minutes

**Expected output:**
```
✅ Successfully configured app for EAS Build
✅ eas.json created
```

**Checklist:**

- [ ] `eas.json` created in apps/customer-app/
- [ ] No errors during configuration
- [ ] EAS account verified

**Step 2: Build Android Production**

```bash
npx eas-cli@latest build --platform android
```

**What this does:**
- Compiles React Native code for Android
- Generates APK and AAB files
- Uploads to Google Play Store (optional)
- Takes 20-30 minutes

**Expected output:**
```
✅ Android build successful
✅ Build ID: [build-id]
Build details: https://expo.dev/accounts/[account]/builds/[build-id]
```

**During build:**
- Monitor progress at: https://expo.dev/builds
- Do NOT close terminal
- If interrupted, can resume with build ID

**Checklist:**

- [ ] Build started and ID recorded: `[build-id]`
- [ ] Build completed successfully (20-30 min wait)
- [ ] No build errors in EAS console
- [ ] APK/AAB files generated
- [ ] Ready to submit to Google Play Store

**Step 3: Build iOS Production**

```bash
npx eas-cli@latest build --platform ios
```

**What this does:**
- Compiles React Native code for iOS
- Generates IPA file
- Uploads to Apple App Store (optional)
- Takes 20-30 minutes

**Expected output:**
```
✅ iOS build successful
✅ Build ID: [build-id]
Build details: https://expo.dev/accounts/[account]/builds/[build-id]
```

**During build:**
- Monitor progress at: https://expo.dev/builds
- Requires Apple Developer account
- Do NOT close terminal

**Checklist:**

- [ ] iOS build started and ID recorded: `[build-id]`
- [ ] iOS build completed successfully (20-30 min wait)
- [ ] No build errors in EAS console
- [ ] IPA file generated
- [ ] Ready to submit to Apple App Store

---

## Phase D: Driver App Production Build

**Purpose:** Create iOS and Android production builds for driver app

```bash
cd apps/driver-app
```

**Step 1: Configure EAS (First Time Only)**

```bash
npx eas-cli@latest build:configure
```

**Expected output:**
```
✅ Successfully configured app for EAS Build
✅ eas.json created
```

**Checklist:**

- [ ] `eas.json` created in apps/driver-app/
- [ ] No errors during configuration

**Step 2: Build Android Production**

```bash
npx eas-cli@latest build --platform android
```

**Expected output:**
```
✅ Android build successful
✅ Build ID: [build-id]
```

**Checklist:**

- [ ] Build started and ID recorded: `[build-id]`
- [ ] Build completed successfully (20-30 min wait)
- [ ] No build errors

**Step 3: Build iOS Production**

```bash
npx eas-cli@latest build --platform ios
```

**Expected output:**
```
✅ iOS build successful
✅ Build ID: [build-id]
```

**Checklist:**

- [ ] iOS build started and ID recorded: `[build-id]`
- [ ] iOS build completed successfully (20-30 min wait)
- [ ] No build errors

---

## Phase E: Admin Dashboard Deployment

**Purpose:** Build and deploy Next.js admin dashboard to production

```bash
cd apps/admin-dashboard
```

**Step 1: Build Production**

```bash
npm run build
```

**Expected output:**
```
> admin-dashboard@1.0.0 build
> next build

✅ compiled client and server successfully
✅ Route (pages) sizes
✅ Analyzed bundle size
export const metadata = {
  title: "JiffyLaundry Admin"
}

✓ Built successfully
```

**Build time:** 2-5 minutes

**Checklist:**

- [ ] Build completed successfully
- [ ] No build errors or warnings
- [ ] `.next/` directory created
- [ ] All pages compiled

**Step 2: Deploy to Vercel**

```bash
vercel deploy --prod
```

**What this does:**
- Uploads build to Vercel production environment
- Assigns production domain
- Sets environment variables
- Takes 2-3 minutes

**During deployment:**
- Follow prompts to link to Vercel project
- Confirm project name
- Confirm environment variables

**Expected output:**
```
✅ Deployed to production
✅ https://admin-dashboard.jiffylaundry.com (or your custom domain)
✅ Deployment complete
```

**Checklist:**

- [ ] Vercel CLI authenticated
- [ ] Build uploaded successfully
- [ ] Production environment assigned
- [ ] Domain configured and accessible
- [ ] Environment variables set in Vercel dashboard

---

## Phase F: Laundromat Dashboard Deployment

**Purpose:** Build and deploy Next.js laundromat dashboard to production

```bash
cd apps/laundromat-dashboard
```

**Step 1: Build Production**

```bash
npm run build
```

**Expected output:**
```
✅ compiled client and server successfully
✓ Built successfully
```

**Checklist:**

- [ ] Build completed successfully
- [ ] No build errors
- [ ] `.next/` directory created

**Step 2: Deploy to Vercel**

```bash
vercel deploy --prod
```

**Expected output:**
```
✅ Deployed to production
✅ https://laundromat-dashboard.jiffylaundry.com (or your custom domain)
```

**Checklist:**

- [ ] Build uploaded successfully
- [ ] Production environment assigned
- [ ] Domain accessible

---

## Required Environment Variables

### Customer App (.env.production)

```
EXPO_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Driver App (.env.production)

```
EXPO_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Admin Dashboard (.env.production)

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Laundromat Dashboard (.env.production)

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Verification:**

- [ ] All URLs are production URLs (https://...)
- [ ] All keys are production keys (not test/dev)
- [ ] No variables hardcoded in code
- [ ] `.env.production` files added to `.gitignore`

---

## Post-Deployment Smoke Test

**Purpose:** Verify all services working after deployment

### Test 1: Supabase Connectivity

```bash
# Test from any app directory
curl https://[project-id].supabase.co/rest/v1/profiles?select=count \
  -H "Authorization: Bearer eyJ..." \
  -H "apikey: eyJ..."
```

**Expected response:**
```
[{"count": 0}]
```

**Checklist:**

- [ ] Supabase responds with data
- [ ] No 401 Unauthorized errors
- [ ] No 403 Forbidden errors

### Test 2: Customer App

**On your phone:**

1. Install customer app from build link
2. Open app
3. Try to sign up with test email
4. Add address
5. Create order
6. View tracking page

**Expected results:**

- [ ] App loads without errors
- [ ] Sign up works
- [ ] Can add address
- [ ] Services load from Supabase
- [ ] Order creation succeeds
- [ ] Tracking page displays

### Test 3: Driver App

**On your phone:**

1. Install driver app from build link
2. Open app
3. Try to log in with driver account
4. View active orders page

**Expected results:**

- [ ] App loads
- [ ] Login works
- [ ] Can see dashboard
- [ ] Active orders display (if any exist)

### Test 4: Admin Dashboard

**In browser:**

1. Navigate to admin dashboard URL
2. Log in with admin account
3. Go to Orders page
4. Go to Finance page
5. Go to Dispatch page

**Expected results:**

- [ ] Dashboard loads
- [ ] Login works
- [ ] All pages accessible
- [ ] No 404 errors
- [ ] Data displays

### Test 5: Stripe Integration

**In browser (admin dashboard):**

1. Create test order in customer app
2. Complete payment with test card: `4242 4242 4242 4242`
3. Go to Stripe dashboard
4. Verify payment appears

**Expected results:**

- [ ] Payment processes without errors
- [ ] Charge appears in Stripe dashboard
- [ ] Order status updates to 'paid'

### Test 6: Laundromat Dashboard

**In browser:**

1. Navigate to laundromat dashboard URL
2. Log in with laundromat account
3. View orders page

**Expected results:**

- [ ] Dashboard loads
- [ ] Login works
- [ ] Orders display

---

## Rollback Plan

If production breaks after deployment:

### Immediate Assessment

1. **What's broken?**
   - Mobile app (iOS/Android)
   - Web dashboard (admin or laundromat)
   - Backend (Supabase)

2. **How many users affected?**
   - Just you testing
   - Small subset
   - Everyone

3. **Severity?**
   - Can users still place orders?
   - Can admins still dispatch?
   - Is data lost or corrupted?

### Rollback by Component

**Mobile Apps (iOS/Android):**

- **Cannot instantly rollback** on app stores
- Users must download previous version manually
- Best approach: Fix forward quickly
- Communicate via in-app message

**Vercel Deployments (Web Dashboards):**

```bash
# Go to Vercel dashboard
# Select project
# Go to Deployments
# Find previous working build
# Click "Promote to Production"
# Takes 1-2 minutes
```

**Supabase Database:**

```bash
# If schema is broken, restore from backup:
# Supabase Dashboard > Database > Backups
# Select backup point
# Click "Restore"
# Confirm destructive action
# Takes 5-10 minutes
# You will lose data after backup point
```

### Recovery Steps

1. **Stop the bleeding** (communicate to users)
2. **Identify root cause** (check logs)
3. **Implement fix** (code changes or config)
4. **Rollback or redeploy** (based on assessment)
5. **Verify fix** (smoke test)
6. **Post-mortem** (document what happened)

---

## Deployment Monitoring

After deployment goes live:

### First Hour

- [ ] Check Supabase logs for errors
- [ ] Check Vercel dashboard for 500 errors
- [ ] Test sign up flow manually
- [ ] Test order creation manually
- [ ] Monitor Stripe for failed charges

### Daily

- [ ] Monitor error rates
- [ ] Check database backups running
- [ ] Verify no alerts triggered
- [ ] Check payment processing

### Weekly

- [ ] Review error logs
- [ ] Check database performance
- [ ] Update dependencies (security patches)
- [ ] Test backup restore

---

## Sign-Off

Before proceeding to production:

**Questions to answer:**

1. Are all team members trained on the dashboards?
2. Is customer support briefed on the system?
3. Are monitoring and alerts configured?
4. Is the rollback plan understood by ops team?
5. Do you have 24/7 on-call coverage?

**Checklist for Go-Live:**

- [ ] All deployment phases A-F completed
- [ ] All smoke tests passed
- [ ] Monitoring configured
- [ ] Alerts enabled
- [ ] Rollback plan documented
- [ ] Team trained
- [ ] Customer support ready
- [ ] Go/no-go decision made

---

## Deployment Execution Record

| Phase | Started | Completed | Status | Notes |
|-------|---------|-----------|--------|-------|
| A: Supabase DB | | | | |
| B: Supabase Secrets | | | | |
| C: Customer App | | | | |
| D: Driver App | | | | |
| E: Admin Dashboard | | | | |
| F: Laundromat Dashboard | | | | |
| Smoke Tests | | | | |
| Go-Live Decision | | | | |

---

## Support Contacts

**During Deployment:**
- Supabase: support@supabase.io
- Vercel: support@vercel.com
- Stripe: support@stripe.com
- EAS: eas@expo.dev

**Internal:**
- On-call engineer: [phone]
- Tech lead: [email]
- Team Slack: #jiffylaundry-ops

---

## Final Notes

**Do not attempt deployment unless:**

1. All prerequisites checked off
2. All environment variables ready
3. Team notified and standing by
4. Rollback plan reviewed with ops
5. Explicit approval to proceed given

**This checklist is a living document.** After deployment, update with:
- Actual timing for each phase
- Any issues encountered
- Lessons learned
- Improvements for next deployment
