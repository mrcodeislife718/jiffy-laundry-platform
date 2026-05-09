<div align="center">

# JiffyLaundry

**Production-grade laundry logistics platform**

*24 HRS OR IT'S FREE — enforced by an automated SLA engine.*

[![Node](https://img.shields.io/badge/node-%3E%3D20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-50-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-Proprietary-red)](#license)

</div>

---

## Overview

JiffyLaundry is a four-application logistics platform that powers an end-to-end laundry pickup, processing, and delivery service. The system tracks every order against a 24-hour SLA and automatically issues refunds when the deadline is missed.

| Application | Stack | Audience |
|---|---|---|
| **Customer App** | Expo / React Native (iOS, Android) | End customers placing orders |
| **Driver App** | Expo / React Native + background location | Pickup & delivery drivers |
| **Admin Dashboard** | Next.js 14 (App Router) | Operations & support team |
| **Staff Dashboard** | Next.js 14 (tablet-optimized) | Laundromat facility staff |
| **Backend API** | Node.js / Express / TypeScript | All four clients |

---

## Architecture

```
┌──────────────┐  ┌────────────┐  ┌──────────────┐  ┌──────────────┐
│ Customer App │  │ Driver App │  │ Admin Web    │  │ Staff Web    │
└──────┬───────┘  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘
       │                │                │                 │
       └────────────────┴────────┬───────┴─────────────────┘
                                 │ HTTPS / WSS
                        ┌────────▼────────┐
                        │  Express API    │  ← Zod validation, JWT auth
                        │  Socket.io      │  ← Realtime tracking
                        └────────┬────────┘
              ┌──────────────────┼──────────────────┐
        ┌─────▼─────┐    ┌───────▼──────┐    ┌──────▼──────┐
        │ Supabase  │    │   Redis      │    │   Stripe    │
        │ Postgres  │    │   BullMQ     │    │  Payments   │
        │ + RLS     │    │   queues     │    │  + Webhooks │
        └───────────┘    └──────────────┘    └─────────────┘
```

### Core services

- **SLA Engine** — deadline tracking with automated refunds at T+24h
- **Dispatch Service** — driver assignment via geospatial zone lookup
- **Notification Service** — push (Expo), email (Resend), SMS-ready
- **Refund Service** — Stripe refunds + wallet credit reconciliation
- **Promo Service** — discount codes, first-order incentives, referrals

---

## Quick Start

### Prerequisites

- Node.js **>= 20**
- npm **>= 10** (or pnpm 8+)
- Docker (for local Postgres + Redis)
- Supabase project ([signup](https://supabase.com))
- Stripe account ([signup](https://stripe.com))

### 1. Install

```bash
git clone https://github.com/mrcodeislife718/jiffy-laundry-platform.git
cd jiffy-laundry-platform
npm install --legacy-peer-deps
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in:
#   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
#   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PUBLISHABLE_KEY
#   REDIS_URL, RESEND_API_KEY, EXPO_ACCESS_TOKEN, JWT_SECRET
```

### 3. Initialize database

```bash
npm run db:setup     # apply schema + RLS policies
npm run db:seed      # optional: demo data
```

### 4. Run everything

```bash
npm run dev          # starts all apps via Turbo
```

| App | Local URL |
|---|---|
| Backend API | <http://localhost:3001> |
| Admin Dashboard | <http://localhost:3000> |
| Staff Dashboard | <http://localhost:3002> |
| Customer App | Expo Go QR code |
| Driver App | Expo Go QR code |

---

## Project Structure

```
jiffylaundry/
├── apps/
│   ├── customer-app/         # Expo React Native
│   ├── driver-app/           # Expo React Native + GPS
│   ├── admin-dashboard/      # Next.js 14
│   └── laundromat-dashboard/ # Next.js 14 (tablet)
├── backend/
│   └── src/
│       ├── api/              # REST endpoints by domain
│       ├── services/         # Business logic (SLA, dispatch, refunds)
│       ├── workers/          # BullMQ background jobs
│       ├── webhooks/         # Stripe, Expo, Resend
│       ├── realtime/         # Socket.io
│       └── db/               # Migrations & schema
├── packages/
│   ├── shared/               # Cross-app utilities & types
│   ├── ui/                   # Shared UI primitives
│   └── config/               # Shared config
├── supabase/
│   ├── migrations/           # SQL schema & RLS
│   └── functions/            # Edge functions
└── infrastructure/           # Docker compose, deploy configs
```

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start all apps in parallel (Turbo) |
| `npm run dev:backend` | Backend only |
| `npm run dev:admin` | Admin web only |
| `npm run dev:staff` | Staff web only |
| `npm run dev:customer` | Customer mobile only |
| `npm run dev:driver` | Driver mobile only |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all apps |
| `npm run test` | Run all tests |
| `npm run db:setup` | Provision database |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed demo data |
| `npm run docker:up` | Start local Postgres + Redis |

---

## Tech Stack

**Frontend (Web)** — Next.js 14, Tailwind CSS, ShadCN UI, Recharts, next-themes
**Frontend (Mobile)** — Expo SDK 50, NativeWind, Zustand, TanStack Query, Lucide icons
**Backend** — Express, TypeScript, Zod validation, Socket.io, BullMQ workers
**Data** — Supabase Postgres (UUID PKs, RLS enforced), Redis 7
**Payments** — Stripe (PaymentIntents, refunds, webhooks)
**Auth** — Supabase Auth (JWT) with role-based middleware
**Notifications** — Expo Push, Resend (email)
**Observability** — Health endpoints, audit logs on every admin mutation

---

## Database

PostgreSQL via Supabase with Row-Level Security on every table.

### Core tables

| Table | Purpose |
|---|---|
| `profiles` | Users with roles: `customer`, `driver`, `laundromat_operator`, `admin` |
| `orders` | Full order lifecycle with status enum |
| `order_items` | Line items per order |
| `driver_locations` | Realtime GPS pings |
| `wallets` / `wallet_transactions` | Credit balances + history |
| `subscriptions` | Recurring service plans |
| `support_tickets` | Customer support |
| `notifications` | Push / email queue |
| `promo_codes` | Discounts & incentives |
| `audit_logs` | Every admin mutation, immutable |

---

## Security

- Service-role keys never exposed to clients
- All API mutations validated with Zod
- RLS policies enforce data isolation per role
- Rate limiting on public endpoints (100 req/min)
- HTTPS-only in production; CORS locked to known origins
- All admin actions written to `audit_logs`
- Webhooks verified via signing secrets (Stripe, Resend)

---

## Performance Targets

| Metric | Target |
|---|---|
| API response | < 100 ms |
| Realtime status update | < 500 ms |
| Web page load | < 2 s |
| Mobile app cold start | < 3 s |
| Driver location update | < 2 s |
| Refund processing | < 1 min |

---

## Documentation

- **[CLIENT_HANDOFF.md](CLIENT_HANDOFF.md)** — credentials, infrastructure, ownership transfer
- **[CLIENT_HOW_TO_GUIDE.md](CLIENT_HOW_TO_GUIDE.md)** — operator how-to walkthroughs
- **[ADMIN_OPERATIONS_GUIDE.md](ADMIN_OPERATIONS_GUIDE.md)** — day-to-day admin workflows
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — production deployment runbook
- **[PRODUCTION_OPERATIONS.md](PRODUCTION_OPERATIONS.md)** — on-call / SRE reference
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** — known issues & fixes

---

## License

Proprietary © Jiffy Laundry. All rights reserved.

---

<div align="center">

**Built for speed. Backed by an SLA. Refunds on autopilot.**

</div>
