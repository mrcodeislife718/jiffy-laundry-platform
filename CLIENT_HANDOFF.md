<!-- markdownlint-disable MD032 MD026 MD036 -->
# CLIENT_HANDOFF.md — JiffyLaundry Platform

## Welcome to JiffyLaundry

This document is your quickstart guide to using the JiffyLaundry platform. The system has four main applications:

1. **Customer App** — Where customers place orders, track deliveries, and manage accounts
2. **Driver App** — Where drivers pick up orders and track deliveries
3. **Admin Dashboard** — Where administrators manage orders, dispatch, and platform operations
4. **Laundromat Dashboard** — Where laundromat operators process and track cleaning orders

---

## Getting Started

### For Customers

**Login:**
1. Open the JiffyLaundry customer app
2. Click "Sign In"
3. Enter email and password
4. Click "Sign In" button
5. You're now logged in and can place orders

**If you don't have an account:**
1. Click "Sign Up" instead
2. Enter: Full Name, Email, Password
3. Verify your email (if prompted)
4. You're now signed up and logged in

### For Admin Staff

**Login:**
1. Open the Admin Dashboard (web)
2. Enter email and password
3. Click "Sign In"
4. You must have an admin account to access

### For Drivers

**Login:**
1. Open the JiffyLaundry driver app
2. Enter email and password
3. Click "Sign In"
4. Click "Go Online" to start accepting orders
5. You can now see assigned orders

### For Laundromat Staff

**Login:**
1. Open the Laundromat Dashboard (web)
2. Enter email and password
3. Click "Sign In"
4. You'll see orders assigned to your laundromat

---

## How to Place an Order (Customer)

1. **Select Services**
   - Click "Schedule" or "Create Order"
   - Browse available services (Wash & Fold, Dry Clean, etc.)
   - Select a service and quantity (e.g., 5 lbs Wash & Fold)

2. **Confirm Pickup Details**
   - Select pickup date and time window
   - Pickup address defaults to your saved default address
   - Click "Continue"

3. **Review and Checkout**
   - Review order summary:
     - Service items and prices
     - Pickup fee: $2.00
     - Service fee: 8%
     - Tax: 8.875%
     - **Total**
   - Click "Continue to Payment"

4. **Payment**
   - Review order once more
   - Enter card details (test: 4242 4242 4242 4242)
   - Click "Pay"
   - Payment confirms and order is placed

5. **Track Order**
   - You'll be redirected to tracking page
   - See real-time status updates
   - Driver location shows when driver has picked up

---

## How to View Orders (Admin)

1. **Go to Orders**
   - Click "Orders" in the admin menu
   - You'll see all orders in the system

2. **Order List Columns**
   - **Order ID** — Unique order identifier
   - **Customer** — Customer name and phone
   - **Status** — Current order status (pending_payment, accepted, picked_up, etc.)
   - **Total** — Order total amount
   - **Payment** — Payment status (unpaid, paid, refunded)
   - **Created** — When order was placed

3. **View Order Details**
   - Click on an order row
   - See full details:
     - Customer information
     - Order items and quantities
     - Prices and fees
     - Current status
     - Status timeline/history
     - Assigned driver (if any)
     - Assigned laundromat (if any)

---

## How to Assign Driver & Laundromat (Admin)

1. **Go to Dispatch**
   - Click "Dispatch" in the admin menu
   - You'll see orders waiting for dispatch (status: pending_dispatch)

2. **Select Order**
   - Find the order you want to dispatch
   - Orders show: Customer name, phone, items, and total

3. **Assign Driver**
   - Click dropdown under "Select Driver"
   - Choose a driver from the list
   - Drivers show: Name and phone number

4. **Assign Laundromat**
   - Click dropdown under "Select Laundromat"
   - Choose a laundromat
   - Laundromats show: Name and address

5. **Dispatch**
   - Click "Dispatch" button
   - You'll see: "Order XXXXX... dispatched successfully"
   - Order disappears from pending queue
   - Driver and laundromat receive notifications

---

## How to Update Order Status (Admin)

**Option 1: From Order Detail Page**

1. Go to Orders
2. Click on order
3. Scroll down to "Status" section
4. Click dropdown
5. Select new status
6. Click "Update"
7. Confirm

**Note:** Some statuses can only be updated by specific roles:
- Driver can update: heading_to_pickup, arrived_at_pickup, picked_up, out_for_delivery, delivered
- Laundromat can update: received, sorting, washing, drying, folding, quality_check, packed, ready_for_delivery
- Admin can update any status (but shouldn't override driver/laundromat)

---

## How to Handle Late Orders (Admin)

1. **Identify Late Orders**
   - Go to "SLA" page
   - You'll see orders with SLA status:
     - **Safe** — On track to deliver on time (green)
     - **At Risk** — May miss deadline (yellow)
     - **Breached** — SLA deadline passed (red)

2. **What to Do**
   - Contact driver or laundromat if breached
   - Consider partial refund or credit
   - Document the issue

3. **Mark for Refund Eligibility** (future feature)
   - Currently, you can note in order details
   - Refund process is manual

---

## How to Issue Refund Record (Admin)

1. **Go to Order Detail**
   - Click Orders
   - Find order
   - Click to open detail

2. **Scroll to Refund Section**
   - Find "Refund" or "Issue Refund" section
   - Click "Create Refund"

3. **Enter Refund Details**
   - **Amount:** Enter amount to refund (e.g., 10.00 for partial, or full order total)
   - **Reason:** Enter reason (e.g., "SLA breach", "Quality issue", "Customer request")

4. **Submit**
   - Click "Create Refund"
   - Refund record saved
   - You'll see success message

5. **Note**
   - Refund record is created but not yet processed with Stripe
   - Stripe refund integration coming in future phase
   - Currently, you must manually process refund in Stripe dashboard

---

## How to Change Pricing (Admin)

1. **Go to Settings**
   - Click "Settings" in admin menu

2. **Services Section**
   - See list of all services (Wash & Fold, Dry Clean, etc.)
   - Each service shows:
     - Name
     - Current price
     - Unit (lbs, garments, etc.)
     - Active status

3. **Edit Service Price**
   - Click on service
   - Enter new price
   - Click "Save"
   - Changes take effect immediately for new orders

4. **Create New Service**
   - Click "Add Service"
   - Enter: Name, Price, Unit, Active (yes/no)
   - Click "Create"
   - New service available for customers

5. **Deactivate Service**
   - Click service
   - Toggle "Active" to off
   - Click "Save"
   - Service no longer available to customers

---

## How to View Revenue (Admin)

1. **Go to Finance**
   - Click "Finance" in admin menu

2. **View Metrics**
   - **Today Revenue** — Total paid amount today
   - **Orders Today** — Number of orders today
   - **Average Order Value** — Average paid order amount
   - **Paid Orders** — Count of paid orders all-time
   - **Refunded Orders** — Count of refunded orders

3. **View Order Details**
   - Scroll down to "Latest Orders" table
   - See recent orders with:
     - Order ID
     - Amount
     - Payment status
     - Order status
     - Created date
   - Click order ID to view full details

---

## What NOT to Touch

⛔ **Do NOT manually modify these in the database:**

- `auth.users` — Authentication managed by Supabase only
- `order_status_events` — Auto-generated, do not edit
- `driver_locations` — Auto-generated from driver app
- `profiles` role field — Set during signup, should not be changed
- `wallets` balance — Calculated automatically

⛔ **Do NOT delete these even if empty:**

- Any system tables (they're needed even with zero data)
- Service records if customers depend on them (deactivate instead)
- Support tickets (mark as resolved instead of deleting)

⛔ **Do NOT change these without testing:**

- Fee percentages in code
- Status enum values
- RLS policies
- Supabase Edge Functions

---

## Common Workflows

### Complete Order (End-to-End)

1. Customer signs up and adds address
2. Customer creates and pays for order → status: pending_dispatch
3. Admin assigns driver and laundromat → status: accepted
4. Driver updates status through pickup flow
5. Laundromat updates status through cleaning flow
6. Driver marks delivered
7. Order complete and customer sees delivered

### Issue a Partial Refund

1. Go to order detail
2. Confirm payment was successful
3. Click "Create Refund"
4. Enter amount and reason
5. Save
6. Manually process in Stripe (if needed)

### Add New Service

1. Go to Settings
2. Click "Add Service"
3. Enter price and unit
4. Save
5. Available to customers immediately

---

## Support & Contact

If you encounter issues:

1. Check **TROUBLESHOOTING.md** for common problems
2. Check app logs and browser console for errors
3. Check Supabase dashboard for database issues
4. Contact development team with:
   - Exact error message
   - Screenshot
   - Steps to reproduce
   - Which app/feature affected

---

## Next Steps

- Review **ADMIN_OPERATIONS_GUIDE.md** for detailed workflows
- Read **TROUBLESHOOTING.md** for common issues and fixes
- See **DEPLOYMENT_NOTES.md** for production environment setup
