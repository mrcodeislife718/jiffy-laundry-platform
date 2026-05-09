# Deployment Guide

Complete deployment procedures for JiffyLaundry production environment.

## 🔐 Pre-Deployment Security Checklist

- [ ] All secrets in `.env.local` (never commit)
- [ ] GitHub Secrets configured (RENDER_API_TOKEN, VERCEL_TOKEN, etc.)
- [ ] Database backups enabled
- [ ] SSL certificates valid
- [ ] Rate limiting configured
- [ ] CORS whitelist updated
- [ ] Logging configured and monitored

## 🚀 Deployment Environments

### Development (Local)

```bash
# Start local stack
pnpm run docker:up

# Install dependencies
pnpm install

# Setup database
pnpm run db:setup
pnpm run db:seed

# Start all apps
pnpm run dev

# Access points:
# - Admin Dashboard: http://localhost:3000
# - API: http://localhost:3001
# - pgAdmin: http://localhost:5050
# - Redis Commander: http://localhost:8081
```

### Staging

```bash
# 1. Create staging environment in Render
# 2. Set environment variables in Render dashboard
# 3. Deploy staging branch
git checkout staging
pnpm run deploy:backend
# Vercel automatically deploys staging

# Test staging at:
# - https://admin-staging.vercel.app
# - https://api-staging.onrender.com
```

### Production

```bash
# 1. Merge to main branch
git checkout main
git merge develop
git push origin main

# 2. Wait for GitHub Actions CI/CD pipeline to complete
# https://github.com/your-org/jiffylaundry/actions

# 3. Automatic deployment to production
# - Backend: Render (main branch)
# - Admin Web: Vercel (main branch)
# - Staff Web: Vercel (main branch)

# 4. Verify deployments
curl https://api.jiffylaundry.com/health
curl https://admin.jiffylaundry.com

# 5. Monitor in real-time
# - Render: https://dashboard.render.com
# - Vercel: https://vercel.com/dashboard
# - Supabase: https://app.supabase.com
```

## 📦 Backend Deployment (Render)

### Initial Setup

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Connect GitHub Repository**
   - Click "New +" → "Web Service"
   - Select repository `jiffylaundry`
   - Branch: `main`
   - Build command: `npm run build`
   - Start command: `npm start`
   - Instance type: Free (or Starter for production)

3. **Configure Environment Variables**
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   SUPABASE_URL=https://...
   SUPABASE_SERVICE_ROLE_KEY=...
   JWT_SECRET=<32-char minimum>
   STRIPE_SECRET_KEY=...
   STRIPE_WEBHOOK_SECRET=...
   RESEND_API_KEY=...
   EXPO_ACCESS_TOKEN=...
   ```

4. **Add PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Database name: `jiffylaundry`
   - Connect to web service

5. **Add Redis Cache**
   - Click "New +" → "Redis"
   - Connect to web service

### Deployment Process

```bash
# Automatic deployment on git push to main
# Manual deployment if needed:

cd backend
npx render deploy

# Check deployment status
# https://dashboard.render.com

# View logs
# Dashboard → Services → jiffylaundry-api → Logs
```

### Health Check

```bash
curl https://api.jiffylaundry.com/health

# Expected response:
{
  "status": "ok",
  "uptime": 3600,
  "environment": "production"
}
```

## 🌐 Web Apps Deployment (Vercel)

### Admin Dashboard

1. **Connect Vercel Project**
   ```bash
   cd apps/admin-web
   vercel link
   ```

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://api.jiffylaundry.com
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Staff Dashboard

Same process as Admin Dashboard:

```bash
cd apps/staff-web
vercel link
vercel --prod
```

## 📱 Mobile App Deployment (Expo EAS)

### Build for iOS & Android

```bash
# Authenticate with Expo
eas login

# Configure EAS build
eas build:configure

# Build for all platforms
eas build --platform all

# Build for specific platform
eas build --platform android
eas build --platform ios

# Submit to app stores
eas submit -p all
```

### Environment Configuration

Create `app.json` with correct API endpoints:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.jiffylaundry.com",
      "environment": "production"
    }
  }
}
```

## 🔄 Continuous Deployment (CI/CD)

GitHub Actions automatically deploys when code is merged to `main`:

1. **Test runs** (lint, type-check, tests)
2. **Build verification** (no build errors)
3. **Backend deploys** to Render
4. **Web apps deploy** to Vercel
5. **Slack notification** sent on success/failure

### View CI/CD Status

```bash
# In GitHub
https://github.com/your-org/jiffylaundry/actions

# Watch logs in real-time
# Click on workflow run → Logs
```

## 🔄 Database Migrations

### Running Migrations

```bash
# Local
pnpm run db:migrate

# Production (via Supabase dashboard)
# 1. Go to https://app.supabase.com
# 2. Select project
# 3. SQL Editor
# 4. Create new query or run migration file
# 5. Execute
```

### Creating New Migration

```bash
# Create migration file
touch supabase/migrations/$(date +%s)_description.sql

# Write SQL
cat > supabase/migrations/20240101000000_add_new_table.sql << 'EOF'
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_see_own" ON new_table
  FOR SELECT USING (auth.uid() = user_id);
EOF

# Test locally
pnpm run db:migrate

# Push to production via Supabase dashboard
```

## 🆘 Rollback Procedures

### Backend Rollback (Render)

1. **Via Render Dashboard**
   - Go to Render.com Dashboard
   - Select service
   - Click "Deployments"
   - Find previous successful deployment
   - Click "Redeploy"

2. **Via Git**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

### Web App Rollback (Vercel)

1. **Via Vercel Dashboard**
   - Go to Vercel.com Dashboard
   - Select project
   - Click "Deployments"
   - Find previous successful deployment
   - Click "..."  → "Promote to Production"

### Database Rollback (Supabase)

1. **Restore from backup**
   - Go to Supabase Dashboard
   - Project settings → Backups
   - Select backup date
   - Click "Restore"

2. **Rollback migration**
   ```sql
   -- In Supabase SQL Editor
   -- DROP recent changes
   -- Re-run verified migration files
   ```

## 📊 Monitoring & Alerts

### Backend Monitoring (Render)

- CPU usage
- Memory usage
- Request count
- Error rate
- Response time

```bash
# View metrics
# Render Dashboard → Services → Metrics
```

### Web App Monitoring (Vercel)

- Page performance
- Error tracking
- Analytics
- Deployment history

```bash
# View metrics
# Vercel Dashboard → Project → Analytics
```

### Database Monitoring (Supabase)

- Query performance
- Connection pool
- Database size
- Row counts

```bash
# View metrics
# Supabase Dashboard → Monitoring
```

### Error Tracking (Sentry)

1. **Setup Sentry Project**
   ```bash
   npm install @sentry/node
   ```

2. **Configure in backend**
   ```typescript
   import * as Sentry from '@sentry/node';

   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
   });
   ```

3. **View errors**
   - https://sentry.io/organizations/your-org/projects/

## 🔔 Deployment Notifications

### Slack Integration

1. **Create Slack webhook**
   - Slack workspace settings → Incoming webhooks
   - Create new webhook
   - Copy webhook URL

2. **Add to GitHub Actions**
   ```yaml
   - name: Slack notification
     uses: slackapi/slack-github-action@v1
     with:
       webhook-url: ${{ secrets.SLACK_WEBHOOK }}
   ```

3. **Add to Render**
   - Render Dashboard → Notifications
   - Add Slack integration

## 📋 Deployment Checklist

Before every production deployment:

- [ ] All tests pass locally
- [ ] Code review approved
- [ ] Database migration tested
- [ ] Environment variables verified
- [ ] Backup created
- [ ] Performance benchmarks checked
- [ ] Security audit passed
- [ ] Monitoring alerts configured
- [ ] Rollback plan documented
- [ ] Deployment window communicated to team

## 🚨 Emergency Procedures

### Production is Down

1. **Check service status**
   ```bash
   curl https://api.jiffylaundry.com/health
   curl https://admin.jiffylaundry.com
   ```

2. **Restart services**
   - Render: Click "Restart" on service page
   - Vercel: Re-deploy latest commit

3. **Check logs**
   - Render: Dashboard → Logs
   - Vercel: Dashboard → Deployments → Logs

4. **Rollback if necessary**
   - Render: Deployments → Redeploy previous
   - Vercel: Deployments → Promote previous

5. **Investigate root cause**
   - Check GitHub Actions logs
   - Review error tracking (Sentry)
   - Check database status (Supabase)
   - Check Redis status (Render)

6. **Post-incident review**
   - Document timeline
   - Identify root cause
   - Create preventative measures
   - Update documentation

## 📞 Support Contacts

- **Render Support**: https://support.render.com
- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **GitHub Support**: https://support.github.com

---

**Last Updated**: 2024
**Version**: 1.0.0
