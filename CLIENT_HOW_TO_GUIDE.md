# Client How-To Guide — JiffyLaundry

A practical, screen-by-screen guide for operators running the platform day-to-day.

> **Audience:** business owners, operations managers, support staff, laundromat operators.
> **Skill level:** non-technical. No coding required.

---

## Table of Contents

1. [Logging in](#1-logging-in)
2. [Admin Dashboard tour](#2-admin-dashboard-tour)
3. [Managing orders](#3-managing-orders)
4. [Dispatch — assigning drivers](#4-dispatch--assigning-drivers)
5. [The 24-hour SLA](#5-the-24-hour-sla)
6. [Issuing refunds](#6-issuing-refunds)
7. [Customer support tickets](#7-customer-support-tickets)
8. [Pricing & service settings](#8-pricing--service-settings)
9. [Promo codes](#9-promo-codes)
10. [Drivers — onboarding & monitoring](#10-drivers--onboarding--monitoring)
11. [Staff dashboard (laundromat)](#11-staff-dashboard-laundromat)
12. [Finance & reports](#12-finance--reports)
13. [Customer mobile app — what your users see](#13-customer-mobile-app)
14. [Driver mobile app — what your drivers see](#14-driver-mobile-app)
15. [Common scenarios](#15-common-scenarios)
16. [FAQ](#16-faq)

---

## 1. Logging in

### Admin Dashboard
1. Open `https://admin.<your-domain>.com`
2. Enter your admin email + password
3. You'll land on the **Dispatch** screen (today's active orders)

### Staff Dashboard
1. Open `https://staff.<your-domain>.com` on a tablet
2. Enter your facility credentials
3. You'll see the **Orders queue** for your laundromat

> **First-time login:** an admin must create your user in Supabase Auth and set your role in the `profiles` table. Your delivery partner does this during initial setup.

---

## 2. Admin Dashboard Tour

The left sidebar has six sections:

| Section | What it does |
|---|---|
| **Dispatch** | Live map of orders & drivers; assign work |
| **Orders** | Searchable list of every order, ever |
| **SLA** | Orders ranked by deadline urgency |
| **Support** | Customer tickets inbox |
| **Finance** | Revenue, refunds, driver payouts |
| **Settings** | Pricing, zones, promo codes, users, audit log |

The header shows: search bar, notifications bell, your profile menu, and a light/dark theme toggle.

---

## 3. Managing Orders

### Viewing an order
1. Click **Orders** in the sidebar
2. Filter by status: `New`, `Assigned`, `In progress`, `Completed`, `Cancelled`
3. Click any row to open the **Order Detail** page

### Order Detail page shows
- Customer info & address
- Items & weight
- Payment status (Stripe)
- Driver assignment
- Realtime status timeline
- **SLA countdown** (turns red when < 4 hours remain)
- Action buttons: Reassign, Refund, Cancel, Contact customer

### Manually changing order status
Most status changes happen automatically. To override:
1. Open the order
2. Click **Actions → Change status**
3. Pick the new status
4. Add a note (required — this goes to the audit log)
5. Confirm

> Every manual change is recorded. You can view who did what in **Settings → Audit Log**.

---

## 4. Dispatch — Assigning Drivers

The **Dispatch** screen is your command centre.

### Auto-assignment (recommended)
- New orders are automatically assigned to the nearest available driver in the customer's zone.
- The system considers: driver availability, current workload, distance, and vehicle type.

### Manual override
1. On the Dispatch screen, find the order in the left list
2. Click **Assign manually**
3. Pick a driver from the dropdown (drivers in the correct zone are listed first)
4. Click **Confirm**
5. The driver receives an instant push notification

### Reassigning
1. Open the order
2. Click **Actions → Reassign driver**
3. Select a new driver
4. Provide a reason (audit-logged)

---

## 5. The 24-hour SLA

This is the heart of the brand promise.

### How it works
- The SLA timer starts when an order is **picked up** by a driver.
- The deadline is exactly **24 hours later**.
- If the order is delivered before the deadline → no action needed.
- If the deadline passes without delivery → the system **automatically refunds 100% of the order** to the customer's wallet.

### Watching upcoming breaches
1. Click **SLA** in the sidebar
2. Orders are ranked by time-remaining (soonest first)
3. Color codes:
   - 🟢 Green: > 12 hours remain
   - 🟡 Yellow: 4–12 hours
   - 🔴 Red: < 4 hours — **escalate**
   - ⚫ Black: Breached (refund issued)

### What to do when an order goes red
1. Call the assigned driver
2. If the driver is unavailable, **reassign** to another driver
3. If pickup hasn't happened yet, contact the customer to manage expectations
4. Document the issue in the order notes

> **Never disable the SLA engine.** It is the brand promise. Refunds are automatic and final.

---

## 6. Issuing Refunds

There are three refund paths:

### A. Automatic SLA refund
Triggered by the system. No action needed. Refund is credited to the customer's wallet immediately.

### B. Manual refund (full or partial)
1. Open the order
2. Click **Actions → Refund**
3. Choose **Full** or **Partial** (enter amount)
4. Pick a reason from the dropdown
5. Add a note
6. Confirm

The refund is processed via Stripe and credited to the customer's wallet.

### C. Wallet credit (goodwill)
1. Go to **Customers**
2. Search for the customer
3. Click **Wallet → Add credit**
4. Enter amount + reason
5. Confirm

> All refunds and credits are audit-logged with your name attached.

---

## 7. Customer Support Tickets

### Triaging
1. Click **Support** in the sidebar
2. Tickets are sorted: **Open → In progress → Resolved**
3. Filter by priority, customer, or order ID

### Replying
1. Open a ticket
2. Type a response in the message box
3. Click **Send** — the customer gets a push + email notification
4. Update status to **In progress** or **Resolved** as appropriate

### Linking a ticket to an order
1. Open the ticket
2. Click **Link order**
3. Search by order ID or customer name
4. Select — the order page now shows a link to this ticket

---

## 8. Pricing & Service Settings

1. Go to **Settings → Pricing**
2. You see a list of services (Wash & Fold, Dry Cleaning, etc.)
3. Click any service to:
   - Adjust price per unit (lb, item)
   - Toggle availability on/off
   - Edit description
4. Click **Save** — changes go live immediately for new orders

> **Existing orders keep their original pricing.** Only new orders use the updated price.

---

## 9. Promo Codes

### Creating a code
1. Go to **Settings → Promo Codes**
2. Click **+ New code**
3. Fill in:
   - **Code** (e.g. `WELCOME10`)
   - **Discount type**: percent or fixed amount
   - **Value** (e.g. 10% or $5)
   - **Usage limit** (total uses, per-customer uses)
   - **Expiry date**
   - **First-order only** toggle
4. Click **Create**

### Tracking usage
- The promo list shows: redemptions, total discount given, conversion rate.
- Click a code to see who used it and on which orders.

---

## 10. Drivers — Onboarding & Monitoring

### Adding a driver
1. The driver downloads the **JiffyLaundry Driver** app
2. They sign up with email + phone
3. In the admin dashboard, go to **Drivers**
4. Find the new driver and click **Approve**
5. Assign their delivery zone
6. Once approved, they can go online and accept orders

### Monitoring drivers
- **Drivers → Live map** shows all online drivers with realtime location
- Click a driver to see: current order, today's stats, total earnings, rating
- **Drivers → Performance** shows weekly leaderboards and SLA performance per driver

### Suspending a driver
1. Open the driver's profile
2. Click **Actions → Suspend**
3. Provide a reason (audit-logged)
4. They are immediately taken offline and cannot accept new orders

---

## 11. Staff Dashboard (Laundromat)

Designed for tablets at the facility.

### Daily workflow
1. **Inbound queue** shows orders that have been picked up and are en route to your facility
2. When an order arrives, scan/tap it → mark as **Received**
3. Process the laundry
4. Mark as **Ready for delivery** when complete
5. The system automatically dispatches a driver for delivery

### Issues
- Item missing? Damaged? Tap **Report issue** on the order — this creates a support ticket and notifies admin
- Always note the issue **before** marking the order ready

---

## 12. Finance & Reports

### Revenue dashboard
- **Today / Week / Month** toggles
- Charts: gross revenue, refund rate, average order value, top services
- Export to CSV via **Export** button

### Stripe reconciliation
- **Finance → Payouts** shows every Stripe payout
- Cross-reference with internal totals to catch discrepancies

### Driver payouts
- **Finance → Driver Payouts** lists earnings owed per driver
- Click **Process payouts** to mark a batch as paid (then pay them via your preferred method — Stripe Connect integration is roadmap)

---

## 13. Customer Mobile App

What your customers see and do:

1. **Sign up** with email or phone
2. **Add a delivery address**
3. **Pick a service** (Wash & Fold, etc.) and schedule pickup
4. **Pay** with saved card or Apple/Google Pay
5. **Track** the driver in realtime on a map
6. **Receive** push notifications at each milestone:
   - Driver assigned
   - Driver en route to pickup
   - Picked up
   - Arrived at facility
   - Cleaning in progress
   - Out for delivery
   - Delivered
7. **Rate** the order and tip the driver
8. **View wallet** for any credits/refunds
9. **Apply promo codes** at checkout
10. **Open a support ticket** from any past order

---

## 14. Driver Mobile App

What your drivers see and do:

1. **Sign in** with approved credentials
2. **Go online** to start receiving offers
3. **Accept or decline** order offers (15-second window)
4. **Navigate** to pickup with built-in map
5. **Confirm pickup** — photo + signature
6. **Drop off at facility** — confirm with staff scan/tap
7. Later: **Pickup from facility** for delivery
8. **Confirm delivery** — photo + customer signature
9. **View earnings** for today, this week, this month
10. **See ratings & feedback** from customers
11. **Background GPS** keeps location updated even when phone is locked

---

## 15. Common Scenarios

### "A customer says they didn't receive their order"
1. Open the order in Admin
2. Check the delivery confirmation (photo + signature)
3. Check driver's GPS trail on the order detail page
4. If genuinely missing: refund + investigate driver

### "Driver isn't responding"
1. Try calling them via the driver profile (one-tap dial)
2. If unavailable: reassign the order to another driver
3. If repeated: suspend the driver

### "Customer wants to cancel after pickup"
1. Open the order → **Actions → Cancel**
2. Choose refund treatment: full / partial / none
3. Add reason (audit-logged)

### "Stripe payment failed"
1. Open the order — payment status will show "Failed"
2. Contact the customer (system has already notified them)
3. They retry payment in the app
4. Order proceeds once payment succeeds

### "We're swamped — pause new orders"
1. Go to **Settings → Operations**
2. Toggle **Accept new orders** off
3. New orders show "Sorry, we're at capacity" in the customer app
4. Toggle back on when ready

---

## 16. FAQ

**Q: How do I reset a customer's password?**
A: They use the "Forgot password" link in the app. As an admin you can also send a magic-link reset from **Customers → [user] → Send password reset**.

**Q: Can I edit an order after it's been placed?**
A: You can change the status, add notes, reassign drivers, and refund. You cannot change items or price after payment — issue a refund and have the customer reorder if needed.

**Q: How long are audit logs kept?**
A: Indefinitely. They are immutable.

**Q: What happens if our backend goes down?**
A: Mobile apps cache the last-known order state. New orders will fail until the backend recovers. Set up uptime alerts in Railway/Render and your monitoring service.

**Q: Can I export all customer data for GDPR?**
A: Yes. **Settings → Data Export → Customer**. Enter the customer ID; receive a CSV+JSON bundle.

**Q: How do I add a new admin?**
A: **Settings → Users → + New user**. Enter email; they receive an invite. Pick their role.

**Q: Can drivers see customer phone numbers?**
A: Only the masked / proxied number (via the in-app call feature). Their personal numbers are never shown to drivers.

**Q: What if a refund fails on Stripe?**
A: The refund is queued and retried. You'll see a banner on the order. The wallet credit is **not** issued until Stripe confirms. Check **Finance → Failed refunds** for issues.

**Q: How do I update pricing without breaking existing orders?**
A: You can. Existing orders are locked to the price at time of order. Only new orders use updated pricing.

---

## Need help?

- Re-read the relevant section above
- Check `TROUBLESHOOTING.md` for technical issues
- Check `ADMIN_OPERATIONS_GUIDE.md` for deeper workflows
- Contact your delivery partner (see `CLIENT_HANDOFF.md` § 11)

**The platform is built to run itself.** Most days, you'll only need this guide for occasional escalations.
