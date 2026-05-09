# JiffyLaundry - Quick Start Guide

**Last Updated:** May 8, 2026  
**Status:** Production Ready ✅

---

## Overview

JiffyLaundry is a complete laundry logistics platform with 4 applications:
- **Admin Dashboard** - Web app for operations management
- **Customer App** - React Native mobile app for ordering
- **Driver App** - React Native mobile app for deliveries
- **Laundromat Portal** - Staff dashboard

Plus a complete backend API and Supabase database.

---

## Prerequisites

### Required
- **Node.js:** v20+ ([Download](https://nodejs.org))
- **npm:** 10+ (included with Node)
- **Git:** For version control
- **Supabase Account:** ([Sign up free](https://supabase.com))

### Optional (Recommended)
- **Expo Account:** For mobile app testing ([Sign up](https://expo.dev))
- **Redis:** For local development
- **PostgreSQL:** For local development database

---

## Installation

### 1. Clone & Navigate
```bash
cd /home/charkes/Documents/jiffylaundry
```

### 2. Install Dependencies
```bash
# Install all monorepo packages
npm install

# Fix vulnerabilities (optional)
npm audit fix
```

### 3. Setup Environment Variables

Create `.env.local` in the root directory:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Backend
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=your_database_url

# Redis (optional for local)
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your_secret_key_min_32_chars_long

# Third-party Services
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=your_resend_key
EXPO_ACCESS_TOKEN=your_expo_token
```

---

## Running Applications

### Option A: Run All Services (Development)

```bash
# Start all dev servers in parallel
npm run dev
```

This will start:
- Admin Dashboard: http://localhost:3000
- Backend API: http://localhost:3001
- Customer App: Via Expo (follow terminal instructions)
- Driver App: Via Expo (follow terminal instructions)

### Option B: Run Individual Services

#### Admin Dashboard
```bash
cd apps/admin-dashboard
npm run dev
# Opens: http://localhost:3000
```

#### Customer Mobile App
```bash
cd apps/customer-app
npm start
# Scan QR code with Expo Go app on your phone
```

#### Driver Mobile App
```bash
cd apps/driver-app
npm start
# Scan QR code with Expo Go app on your phone
```

#### Backend API
```bash
cd backend
npm run dev
# Runs on: http://localhost:3001
```

---

## Project Structure

```
jiffylaundry/
├── apps/
│   ├── admin-dashboard/       # Next.js web app (port 3000)
│   ├── customer-app/          # Expo mobile app
│   ├── driver-app/            # Expo mobile app
│   └── laundromat-dashboard/  # Staff portal
├── backend/                   # Express API (port 3001)
├── packages/
│   ├── shared/               # Shared utilities & types
│   ├── ui/                   # Reusable components
│   └── config/               # Configuration
└── supabase/                 # Database schema & migrations
```

---

## Key Features by App

### Admin Dashboard
- **Features:** Driver management, dispatch control, finance tracking, SLA monitoring
- **URL:** http://localhost:3000
- **Tech:** Next.js 14, Tailwind CSS, ShadCN UI
- **Dark Mode:** Automatic based on system preference

### Customer Mobile App
- **Features:** Order creation, real-time tracking, 24hr SLA countdown, wallet management
- **Tech:** React Native, Expo, NativeWind
- **Dark Mode:** Automatic based on device setting

### Driver Mobile App
- **Features:** Order dispatch, delivery workflow, earnings tracking, profile management
- **Tech:** React Native, Expo, NativeWind
- **Dark Mode:** Automatic based on device setting

### Backend API
- **Endpoints:** 30+ RESTful endpoints
- **Auth:** JWT token validation
- **Database:** Supabase PostgreSQL
- **Real-time:** Socket.io ready

---

## Available Scripts

```bash
# All Services
npm run dev              # Start all dev servers
npm run build            # Build all apps
npm run lint             # Lint all code
npm run test             # Run all tests

# Admin Dashboard
npm run dev:admin        # Admin dev server
npm run build:admin      # Build for production

# Backend
npm run dev:backend      # Backend dev server
npm run build:backend    # Build backend

# Mobile Apps
npm run dev:customer     # Customer app
npm run dev:driver       # Driver app
```

---

## Testing the Platform

### 1. Admin Dashboard
```
1. Navigate to http://localhost:3000
2. Login with your credentials
3. View driver heatmap
4. Check dispatch queue
5. Monitor SLA timers
```

### 2. Customer Mobile App
```
1. Install Expo Go app on phone
2. Scan QR code in terminal
3. Create an order
4. Track order with SLA countdown
5. View order history
```

### 3. Driver Mobile App
```
1. Install Expo Go app on phone
2. Scan QR code in terminal
3. Go online to see available orders
4. Accept an order
5. Complete pickup and delivery
6. View earnings
```

---

## API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication
All endpoints (except `/auth/login`) require JWT token:
```bash
Authorization: Bearer <your_jwt_token>
```

### Common Endpoints

```bash
# Orders
GET /api/orders              # List all orders
POST /api/orders             # Create new order
GET /api/orders/:id          # Get order details
PATCH /api/orders/:id        # Update order

# Drivers
GET /api/drivers             # List all drivers
GET /api/drivers/:id         # Get driver profile
PATCH /api/drivers/:id/status # Toggle online/offline

# Customers
GET /api/customers           # List customers
GET /api/customers/:id       # Get customer profile

# Wallets
GET /api/wallets/:id         # Get wallet balance
POST /api/wallets/:id/add-funds # Add credit
```

### Example Request
```bash
curl -X GET http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Database Setup

### Migrations
```bash
# Run migrations
npm run migrate

# Create backup
npm run db:backup
```

### Seeding
```bash
# Seed development data
npm run seed
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev:admin
```

### Dependencies Not Installing
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Mobile App Not Connecting
```bash
# Make sure you're on same network as dev machine
# Check your machine's IP address
ipconfig getifaddr en0  # macOS
hostname -I             # Linux
```

### Database Connection Issues
```bash
# Check Supabase credentials
# Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env.local

# Test connection
npm run db:test
```

---

## Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### 2. Make Changes
```bash
# Edit files in apps/admin-dashboard, apps/driver-app, etc.
# Changes auto-reload due to hot-module replacement
```

### 3. Run Tests
```bash
npm run test
npm run lint
```

### 4. Commit & Push
```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### 5. Create Pull Request
- Follow commit message conventions
- Ensure all tests pass
- Request code review

---

## Performance Tips

### Development
- Close unused browser tabs
- Use `npm run dev:admin` for single app development
- Monitor terminal for build errors

### Mobile Testing
- Test on physical device when possible
- Use Expo Go app for rapid iteration
- Use `npm run build:eas` for production builds

### Database
- Check slow queries in Supabase console
- Use indexes for frequently queried columns
- Monitor connection pooling limits

---

## Security Notes

### Never Commit
```
❌ .env files with sensitive keys
❌ API keys or passwords
❌ Private keys
❌ Database credentials
```

### Always Use
```
✅ Environment variables
✅ HTTPS in production
✅ Rate limiting
✅ Input validation
✅ CORS configuration
```

---

## Deployment

### Admin Dashboard (Vercel)
```bash
cd apps/admin-dashboard
npm run build
vercel deploy --prod
```

### Backend (Railway/Render)
```bash
cd backend
npm run build
# Push to Railway/Render (follow their setup)
```

### Mobile Apps (Expo EAS)
```bash
cd apps/driver-app
eas build --platform all
eas submit --platform all
```

---

## Getting Help

### Documentation
- [JIFFYLAUNDRY_COMPLETE.md](./JIFFYLAUNDRY_COMPLETE.md) - Full feature guide
- [BUILD_VALIDATION_REPORT.md](./BUILD_VALIDATION_REPORT.md) - Build status
- [API_DOCUMENTATION.md](./docs/API.md) - API reference

### Useful Commands
```bash
# View logs
npm run logs

# Database console
supabase studio

# Clear cache
npm cache clean --force

# Check versions
node --version
npm --version
```

---

## Next Steps

1. **Setup Environment:** Follow environment variables section
2. **Install Dependencies:** Run `npm install`
3. **Start Development:** Run `npm run dev`
4. **Explore Apps:** Open http://localhost:3000
5. **Read Docs:** Check JIFFYLAUNDRY_COMPLETE.md for features

---

## Quick Reference

| Component | Port | URL | Tech |
|-----------|------|-----|------|
| Admin | 3000 | http://localhost:3000 | Next.js |
| Backend | 3001 | http://localhost:3001 | Express |
| Customer App | Expo | QR Code | React Native |
| Driver App | Expo | QR Code | React Native |

---

## Support

For issues, questions, or improvements:
1. Check troubleshooting section
2. Review documentation
3. Check existing GitHub issues
4. Create new issue with details

---

**Happy coding! 🚀**

Build completed: May 8, 2026  
Status: Production Ready ✅
