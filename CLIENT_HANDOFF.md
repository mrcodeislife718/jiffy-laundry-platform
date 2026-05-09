# Client Handoff — JiffyLaundry

> **Status:** Production-ready. All TypeScript errors resolved. Repository pushed to GitHub.
> **Handoff date:** _to be filled by delivery team_
> **Repository:** <https://github.com/mrcodeislife718/jiffy-laundry-platform>

---

## 1. Executive Summary

You are receiving a complete, production-grade laundry logistics platform consisting of:

1. **Customer mobile app** (iOS + Android, via Expo)
2. **Driver mobile app** (iOS + Android, with background GPS)
3. **Admin web dashboard** (Next.js)
4. **Staff/laundromat web dashboard** (Next.js, tablet-optimized)
5. **Backend API** (Node.js + Supabase + Redis + Stripe)

Every order is tracked against a **24-hour SLA**. If the SLA is breached, the system **automatically refunds the customer** and logs the event. No human action required.

---

## 2. What's Included

### Source code
- Full monorepo at the repository URL above
- Branch: `main` (always deployable)
- All four apps + backend + shared packages
- Database migrations + seed data
- Docker compose for local dev
- CI-ready scripts

### Documentation in this repository
| Document | Purpose |
|---|---|
| `README.md` | Project overview & quick-start |
| `CLIENT_HANDOFF.md` | This file |
| `CLIENT_HOW_TO_GUIDE.md` | Step-by-step usage guide for operators |
| `ADMIN_OPERATIONS_GUIDE.md` | Day-to-day admin workflows |
| `DEPLOYMENT.md` | Production deployment runbook |
| `PRODUCTION_OPERATIONS.md` | On-call / SRE reference |
| `TROUBLESHOOTING.md` | Known issues & fixes |
| `QA_TEST_PLAN.md` | QA acceptance test cases |

---

## 3. Accounts You Need to Own

These accounts power the live service. Transfer of ownership must be completed before go-live.

| Service | Purpose | Action required |
|---|---|---|
| **Supabase** | Database, auth, storage | Transfer project to client org |
| **Stripe** | Payments + refunds | Transfer to client business account |
| **Vercel** | Web app hosting (admin + staff) | Add client billing & ownership |
| **Railway** (or Render) | Backend API hosting | Transfer project ownership |
| **Upstash** (or self-hosted) | Redis for queues | Transfer / re-provision |
| **Expo** | Mobile build & push notifications | Add client as admin |
| **Apple Developer** | iOS App Store distribution | Client enrolls ($99/yr) |
| **Google Play Console** | Android distribution | Client enrolls ($25 one-time) |
| **Resend** | Transactional email | Add client as admin |
| **Domain registrar** | DNS for app + API | Transfer domain |
| **GitHub** | Source repository | Transfer repo to client org |

> **Recommendation:** create a `1Password` / `Bitwarden` shared vault and store every credential there before handoff.

---

## 4. Environment Variables (Production)

A complete `.env.example` is in the repository root. Production values must be set in your hosting providers (Vercel, Railway). **Never commit real secrets.**

### Backend (Railway / Render)
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<from Supabase dashboard>
SUPABASE_ANON_KEY=<from Supabase dashboard>
REDIS_URL=<Upstash or Redis provider URL>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
RESEND_API_KEY=re_...
EXPO_ACCESS_TOKEN=<from Expo>
JWT_SECRET=<min 32 random chars>
```

### Web apps (Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=https://api.<your-domain>.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Mobile apps (Expo EAS)
Configured in each app's `app.json` under `extra`. Use `eas secret:create` for sensitive values.

---

## 5. Initial Production Setup Checklist

Before going live, complete each step.

### Infrastructure
- [ ] Supabase project created (production tier)
- [ ] All migrations applied (`npm run db:migrate`)
- [ ] RLS policies verified on every table
- [ ] Redis provisioned (Upstash recommended)
- [ ] Stripe live keys configured & webhook endpoint registered
- [ ] Resend domain verified (SPF + DKIM)
- [ ] Custom domain DNS pointed to Vercel + Railway

### Deployment
- [ ] Backend deployed to Railway/Render (health check passing)
- [ ] Admin dashboard deployed to Vercel
- [ ] Staff dashboard deployed to Vercel
- [ ] Customer app submitted to App Store + Play Store
- [ ] Driver app submitted to App Store + Play Store

### First user setup
- [ ] Create initial admin user in Supabase Auth
- [ ] Set role = `admin` in `profiles` table
- [ ] Log in to admin dashboard to verify access
- [ ] Configure pricing in Settings
- [ ] Configure delivery zones
- [ ] Onboard first driver (driver app)
- [ ] Run end-to-end test order

### Verification
- [ ] Stripe test payment processes successfully
- [ ] Push notification reaches customer device
- [ ] Driver location updates appear on admin map
- [ ] SLA timer visible on admin order detail page
- [ ] Refund test order → wallet credit appears

---

## 6. Operational Runbook

### Daily
- Review **Dispatch** dashboard for unassigned orders
- Check **SLA** dashboard for orders nearing breach (< 4h remaining)
- Review **Support** queue for open tickets

### Weekly
- Review **Finance** dashboard: revenue, refund rate, payouts
- Review driver performance metrics
- Reconcile Stripe payouts vs internal ledger

### Monthly
- Rotate sensitive secrets (`JWT_SECRET`, Stripe webhook secret)
- Review audit logs for unusual admin activity
- Apply dependency security updates: `npm audit fix`

---

## 7. Support & Maintenance

### Production incidents
| Severity | Definition | Response |
|---|---|---|
| **P0** | Service down, payments failing | Immediate page on-call |
| **P1** | SLA engine not refunding, push broken | < 1 hour |
| **P2** | Admin UI bug, driver app glitch | Next business day |
| **P3** | Cosmetic, documentation | Backlog |

### Useful logs
- **Backend logs:** Railway dashboard → Deployments → Logs
- **Database logs:** Supabase dashboard → Logs Explorer
- **Stripe events:** Stripe dashboard → Developers → Events
- **Push delivery:** Expo dashboard → Push Notifications → Receipts
- **Audit trail:** Admin dashboard → Settings → Audit Log

### Common issues
See `TROUBLESHOOTING.md` for fixes to recurring problems.

---

## 8. Backup & Disaster Recovery

| Component | Backup mechanism | RPO |
|---|---|---|
| Supabase database | Automated daily backups (7-day retention on free tier; 30-day on Pro) | 24h |
| File storage | Supabase Storage versioning | 24h |
| Source code | GitHub (always) | 0 |
| Stripe data | Stripe retains indefinitely | 0 |

**Recovery procedure:** see `DEPLOYMENT.md` § Disaster Recovery.

---

## 9. Cost Estimate (USD / month)

Rough order-of-magnitude for a small launch (≤ 1,000 orders/month):

| Service | Tier | Cost |
|---|---|---|
| Supabase Pro | required for backups | $25 |
| Railway / Render | backend hosting | $20 |
| Vercel | 2 web apps | $0–$20 |
| Upstash Redis | pay-as-you-go | $5–$15 |
| Resend | up to 3k emails/mo free | $0–$20 |
| Expo EAS | optional, for builds | $0–$29 |
| Apple Developer | annual | $99/yr |
| Google Play | one-time | $25 |
| Domain | annual | $12/yr |
| Stripe | 2.9% + $0.30 per transaction | variable |
| **Estimated total** | **per month** | **~$70–$130 + Stripe fees** |

Costs scale roughly linearly with order volume.

---

## 10. Acceptance Criteria

The platform is considered fully delivered when **all** of the following are true:

- [x] Build is error-free (`npm run build` succeeds in all apps)
- [x] All TypeScript errors resolved (`npx tsc --noEmit` exits 0 in every project)
- [ ] All accounts in §3 transferred to client ownership
- [ ] All checklist items in §5 completed
- [ ] Client team trained on `CLIENT_HOW_TO_GUIDE.md`
- [ ] At least one successful real-money order processed end-to-end
- [ ] At least one successful SLA-triggered refund verified

---

## 11. Contacts

| Role | Name / Email |
|---|---|
| Project owner (delivery team) | _to be filled_ |
| Technical lead | _to be filled_ |
| Support email | _to be filled_ |
| Emergency contact | _to be filled_ |

---

## 12. Final Notes

- The codebase follows TypeScript strict-friendly settings with deliberate relaxations for shared `.js` files in the `packages/shared` package.
- Every admin mutation is logged to `audit_logs`. **Do not bypass this** — it is part of the chain of custody.
- The SLA engine **must never be disabled** without an explicit business sign-off, as it underpins the brand promise.
- Mobile apps are configured to point at production API URLs via Expo `extra` config; rebuild the app if the API URL changes.

**You now own this platform. Treat the credentials in §3 as the keys to your business.**
