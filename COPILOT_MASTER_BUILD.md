# JiffyLaundry Final Build Pack

## How to use this with Copilot

Create this file:

cd /home/charkes/Documents/jiffylaundry
grep -n "^\markdownlint COPILOT_MASTER_BUILD.md
touch COPILOT_MASTER_BUILD.md

Paste the sections below into it.

Then in Copilot Chat, do not say "build everything." Say:
**Open COPILOT_MASTER_BUILD.md and execute PHASE 0 only.**

Follow the implementation notes exactly.
Do not skip steps.
Do not continue to the next phase until I approve.
If anything fails, stop and show me the exact error.

After each phase:
**Execute PHASE 1 only.**

---

## PHASE 0 — Supabase Setup & Environment Configuration

**Goal**
Initialize Supabase project, create database schema, set environment variables, and configure Stripe secrets.

### Implementation notes

1. Create Supabase project at supabase.com
2. Go to Project Settings > API and copy:
   - Project URL
   - Anon Key
3. Create `.env.local` in each app directory with:

   ```

   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

   ```

4. In Supabase SQL Editor, run all CREATE TABLE statements below
5. Enable RLS on all tables
6. Create RLS policies
7. Create Stripe account at stripe.com and get STRIPE_SECRET_KEY
8. Set Supabase secrets: STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY

### Database Schema SQL

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('customer', 'driver', 'laundromat_operator', 'admin')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  laundromat_id UUID,
  pickup_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending_payment', 'pending_dispatch', 'accepted', 'heading_to_pickup', 'arrived_at_pickup', 'picked_up', 'received', 'sorting', 'washing', 'drying', 'folding', 'quality_check', 'packed', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending_payment',
  payment_status TEXT CHECK (payment_status IN ('unpaid', 'paid', 'refunded')) DEFAULT 'unpaid',
  subtotal DECIMAL(10, 2) DEFAULT 0,
  pickup_fee DECIMAL(10, 2) DEFAULT 2.0,
  service_fee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  tip DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  sla_deadline TIMESTAMP,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(10, 8),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT CHECK (type IN ('credit', 'debit')) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  stripe_refund_id TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE laundromats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### Enable RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

### RLS Policies

```sql
CREATE POLICY "customers_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "customers_read_own_orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "drivers_read_assigned_orders" ON orders
  FOR SELECT USING (auth.uid() = driver_id);
```

### PHASE 0 Copilot Prompt

```
PHASE 0: Initialize Supabase and environment.

Steps:
1. Create Supabase project and copy Project URL and Anon Key
2. Create .env.local files in:
   - apps/customer-app/.env.local
   - apps/driver-app/.env.local
   - apps/admin-dashboard/.env.local
   - apps/laundromat-dashboard/.env.local
   
3. In Supabase SQL Editor, run all CREATE TABLE statements
4. Enable RLS on all tables
5. Create RLS policies
6. Create Stripe account at stripe.com
7. Set Supabase secrets: STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY
8. Do not proceed to PHASE 1 until all tables created

Show me:
- Supabase project URL (confirm exists)
- List of all tables created
- Confirmation RLS is enabled
- Stripe account created

Stop after this phase.
```

---

## PHASE 1 — Verify Project Structure

### Goal

Confirm the repo has all required apps, packages, and Supabase files.

### Expected structure

```
jiffylaundry-platform/
  apps/
    customer-app/
    driver-app/
    admin-dashboard/
    laundromat-dashboard/
  packages/
    shared/
    ui/
    config/
  supabase/
    migrations/
    seed.sql
```

### PHASE 1 Copilot Prompt

```
PHASE 1: Verify my JiffyLaundry repo structure.

Check that these folders exist:
- apps/customer-app
- apps/driver-app
- apps/admin-dashboard
- apps/laundromat-dashboard
- packages/shared
- packages/ui
- packages/config
- supabase/migrations
- supabase/seed.sql

If any are missing, create them.
Do not add app logic yet.
Do not modify existing code unless required to create missing folders.
Show me the final tree.
Stop after this phase.
```

---

## PHASE 2 — Install Shared Dependencies

**Goal**
Install required packages for Expo apps and dashboards.

**Customer app**

```bash
cd apps/customer-app
npm install @supabase/supabase-js @tanstack/react-query zustand @stripe/stripe-react-native
npx expo install expo-secure-store expo-notifications expo-location react-native-maps
```

**Driver app**

```bash
cd apps/driver-app
npm install @supabase/supabase-js @tanstack/react-query zustand
npx expo install expo-secure-store expo-notifications expo-location react-native-maps
```

**Admin dashboard**

```bash
cd apps/admin-dashboard
npm install @supabase/supabase-js @tanstack/react-query zustand lucide-react @stripe/stripe-react-native
```

**Laundromat dashboard**

```bash
cd apps/laundromat-dashboard
npm install @supabase/supabase-js @tanstack/react-query zustand lucide-react
```

**PHASE 2 Copilot Prompt**

```
PHASE 2: Install all required dependencies.

Run the install commands for:
1. apps/customer-app
2. apps/driver-app
3. apps/admin-dashboard
4. apps/laundromat-dashboard

Use the exact commands from COPILOT_MASTER_BUILD.md.
If a package already exists, do not reinstall unnecessarily.
If a command fails, stop and show the exact terminal error.
Stop after dependencies are installed.
```

---

## PHASE 3 — Create Shared Supabase Client

**Goal**
Create one reusable Supabase client for apps.

**File**
`packages/shared/supabase.js`

**Code**

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**PHASE 3 Copilot Prompt**

```
PHASE 3: Create the shared Supabase client.

Create this file:
packages/shared/supabase.js

Add the exact Supabase client code from COPILOT_MASTER_BUILD.md.
Do not create duplicate Supabase clients inside apps yet.
Stop after creating the file.
```

---

## PHASE 4 — Create Shared Auth API

**Goal**
Centralize auth methods.

**File**
`packages/shared/auth.js`

**Code**

```javascript
import { supabase } from "./supabase";

export async function signUpWithEmail({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return data;
}
```

**PHASE 4 Copilot Prompt**

```
PHASE 4: Create shared auth API.

Create:
packages/shared/auth.js

Add:
- signUpWithEmail
- signInWithEmail
- signOut
- getCurrentUser
- getCurrentProfile

Use the exact code from COPILOT_MASTER_BUILD.md.
Stop after creating this file.
```

---

## PHASE 5 — Create Shared Order API

**Goal**
Make all order logic reusable.

**File**
`packages/shared/orders.js`

**Code**

```javascript
import { supabase } from "./supabase";

export async function getServices() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("active", true)
    .order("price", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getCustomerOrders(customerId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`*,
      order_items(*),
      order_status_events(*),
      laundromats(*)`)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOrderById(orderId) {
  const { data, error } = await supabase
    .from("orders")
    .select(`*,
      order_items(*),
      order_status_events(*),
      driver:driver_id(full_name, phone),
      laundromats(*),
      addresses:pickup_address_id(*)`)
    .eq("id", orderId)
    .single();
  if (error) throw error;
  return data;
}

export async function createOrderWithItems({ orderPayload, items }) {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select()
    .single();
  if (orderError) throw orderError;

  const rows = items.map((item) => ({
    order_id: order.id,
    service_id: item.service_id,
    service_name: item.service_name,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    line_total: item.line_total,
  }));

  const { error: itemError } = await supabase.from("order_items").insert(rows);
  if (itemError) throw itemError;

  return order;
}

export async function updateOrderStatus({ orderId, status }) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToOrder(orderId, callback) {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      },
      callback
    )
    .subscribe();
}
```

**PHASE 5 Copilot Prompt**

```
PHASE 5: Create shared order API.

Create:
packages/shared/orders.js

Add the exact code from COPILOT_MASTER_BUILD.md.
Do not connect screens yet.
Stop after creating this file.
```

---

## PHASE 6 — Create Shared Address API

**File**
`packages/shared/addresses.js`

**Code**

```javascript
import { supabase } from "./supabase";

export async function getUserAddresses(userId) {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAddress(payload) {
  const { data, error } = await supabase
    .from("addresses")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAddress(addressId, payload) {
  const { data, error } = await supabase
    .from("addresses")
    .update(payload)
    .eq("id", addressId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAddress(addressId) {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId);
  if (error) throw error;
}
```

**PHASE 6 Copilot Prompt**

```
PHASE 6: Create shared address API.

Create:
packages/shared/addresses.js

Use the exact implementation from COPILOT_MASTER_BUILD.md.
Stop after this file is created.
```

---

## PHASE 7 — Create Shared Wallet API

**File**
`packages/shared/wallet.js`

**Code**

```javascript
import { supabase } from "./supabase";

export async function getWallet(userId) {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function getWalletTransactions(userId) {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
```

**PHASE 7 Copilot Prompt**

```
PHASE 7: Create shared wallet API.

Create:
packages/shared/wallet.js

Use the exact code from COPILOT_MASTER_BUILD.md.
Stop after creating the file.
```

---

## PHASE 8 — Create Query Client Providers

**Customer app file**
`apps/customer-app/src/providers/AppProviders.jsx`

**Driver app file**
`apps/driver-app/src/providers/AppProviders.jsx`

**Code for both**

```javascript
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**PHASE 8 Copilot Prompt**

```
PHASE 8: Create React Query providers.

Create:
apps/customer-app/src/providers/AppProviders.jsx
apps/driver-app/src/providers/AppProviders.jsx

Use the exact code from COPILOT_MASTER_BUILD.md.
Then wrap each Expo app root layout with AppProviders.
Do not change screen UI yet.
Stop after this phase.
```

---

## PHASE 9 — Customer App Auth Screens

**Required screens**

- `apps/customer-app/app/login.jsx`
- `apps/customer-app/app/signup.jsx`

**Implementation notes**

Login must:

- Accept email
- Accept password
- Call signInWithEmail
- Navigate to /home
- Show loading state
- Show error state

Signup must:

- Accept full name
- Accept email
- Accept password
- Call signUpWithEmail
- Navigate to /home after success

**PHASE 9 Copilot Prompt**

```
PHASE 9: Build customer app login and signup screens.

Create:
apps/customer-app/app/login.jsx
apps/customer-app/app/signup.jsx

Use existing theme/components if available.
Use signInWithEmail and signUpWithEmail from packages/shared/auth.js.

Requirements:
- Email input
- Password input
- Full name input on signup
- Loading state
- Error message
- Navigate to /home after success
- No mock auth
- No hardcoded user

Stop after these screens work.
```

---

## PHASE 10 — Customer App Replace Mock Services

**Goal**
Pricing/schedule must load services from database.

**Implementation notes**

Replace:

```javascript
import { laundryTypes } from "../src/data/mockData";
```

With:

```javascript
import { useQuery } from "@tanstack/react-query";
import { getServices } from "../../../packages/shared/orders";
```

Use:

```javascript
const { data: services = [], isLoading, error } = useQuery({
  queryKey: ["services"],
  queryFn: getServices,
});
```

**PHASE 10 Copilot Prompt**

```
PHASE 10: Replace mock service data in the customer app.

Find screens that use laundryTypes or mock service data.
Replace them with getServices() from packages/shared/orders.js using React Query.

Requirements:
- Show loading state
- Show error state
- Render services from Supabase
- Do not remove existing styling
- Do not hardcode services

Stop after pricing and schedule screens use database services.
```

---

## PHASE 11 — Customer Address Manager

**Required screen**
`apps/customer-app/app/addresses.jsx`

**Requirements**

- List saved addresses
- Add address form
- Set default address
- Delete address
- Use Supabase addresses table

**PHASE 11 Copilot Prompt**

```
PHASE 11: Build customer address manager.

Create:
apps/customer-app/app/addresses.jsx

Use:
- getUserAddresses
- createAddress
- updateAddress
- deleteAddress

from packages/shared/addresses.js.

Requirements:
- Load current user
- Show user's addresses
- Add address form
- Set default address
- Delete address
- Refresh after mutation
- No mock addresses

Stop after address CRUD works.
```

---

## PHASE 12 — Customer Create Order Flow

**Goal**
Schedule screen creates a real unpaid order.

**Required behavior**

- Select address
- Select pickup date/window
- Select services
- Calculate subtotal
- Calculate fees
- Save order
- Save order items
- Navigate to checkout

**Fee formula**

```javascript
const pickupFee = 2.0;
const serviceFee = subtotal * 0.08;
const tax = subtotal * 0.08875;
const total = subtotal + pickupFee + serviceFee + tax + tip;
```

**PHASE 12 Copilot Prompt**

```
PHASE 12: Implement real create order flow.

Update customer app schedule/pricing flow so it:
1. Loads current user
2. Loads user's default address
3. Loads services from Supabase
4. Lets user select service and quantity
5. Calculates subtotal, pickup fee, service fee, tax, tip, and total
6. Creates an order with status pending_payment
7. Inserts order_items
8. Navigates to /checkout with orderId

Use createOrderWithItems from packages/shared/orders.js.
No mock order data.
No hardcoded user.
Stop after create order works.
```

---

## PHASE 13 — Customer Checkout Screen

**Required file**
`apps/customer-app/app/checkout.jsx`

**Requirements**

- Read orderId from route params
- Load order by ID
- Show order summary
- Show line items
- Show total
- Button: Continue to Payment

**PHASE 13 Copilot Prompt**

```
PHASE 13: Build customer checkout screen.

Create:
apps/customer-app/app/checkout.jsx

Requirements:
- Read orderId from Expo Router params
- Load order using getOrderById
- Show service items, subtotal, fees, tax, tip, total
- Button navigates to /payment with orderId
- Loading and error states required
- No mock data

Stop after checkout screen works.
```

---

## PHASE 14 — Stripe Payment Function

**Goal**
Create Supabase Edge Function for payment intent.

**File**
`supabase/functions/create-payment-intent/index.ts`

**Implementation notes**

Set STRIPE_SECRET_KEY using:

```bash
supabase secrets set STRIPE_SECRET_KEY your_secret_key
```

**PHASE 14 Copilot Prompt**

```
PHASE 14: Create Supabase Edge Function for Stripe PaymentIntent.

Create:
supabase/functions/create-payment-intent/index.ts

Requirements:
- Read amount and orderId from request body
- Use STRIPE_SECRET_KEY from environment
- Create Stripe PaymentIntent in USD
- Return clientSecret
- Validate amount > 0
- Return proper JSON errors
- Do not expose secret key

Also confirm STRIPE_SECRET_KEY is set in Supabase secrets.
Stop after function is created and tested.
```

---

## PHASE 15 — Customer Payment Screen

**Required file**
`apps/customer-app/app/payment.jsx`

**Requirements**

- Load order
- Call create-payment-intent Edge Function
- Use Stripe PaymentSheet
- On success mark order payment_status = paid
- Set status = pending_dispatch
- Navigate to tracking

**PHASE 15 Copilot Prompt**

```
PHASE 15: Build customer payment screen.

Create:
apps/customer-app/app/payment.jsx

Requirements:
- Read orderId from route params
- Load order from Supabase
- Use @stripe/stripe-react-native PaymentSheet
- Call Supabase Edge Function create-payment-intent
- On successful payment, update orders:
  payment_status = paid
  status = pending_dispatch
- Navigate to /tracking with orderId
- If payment fails, show error and keep order unpaid
- Do not dispatch unpaid orders

Stop after payment screen compiles.
```

---

## PHASE 16 — Admin Dashboard Orders

**Goal**
Client can see all orders.

**Required route**
`apps/admin-dashboard/app/orders/page.jsx`

**Requirements**

- Show order list
- Customer name
- Phone
- Status
- Total
- Created date
- Payment status
- Link to order detail

**PHASE 16 Copilot Prompt**

```
PHASE 16: Build admin orders page.

Create/update:
apps/admin-dashboard/app/orders/page.jsx

Requirements:
- Load all orders from Supabase
- Include customer profile
- Include laundromat
- Include driver
- Show table with status, total, payment status, created date
- Link each row to /orders/[id]
- Loading and error states
- No mock data

Stop after page works.
```

---

## PHASE 17 — Admin Order Detail

**Required route**
`apps/admin-dashboard/app/orders/[id]/page.jsx`

**Requirements**

- View order
- View customer
- View items
- View status timeline
- Assign driver
- Assign laundromat
- Change status
- Refund button placeholder

**PHASE 17 Copilot Prompt**

```
PHASE 17: Build admin order detail page.

Create/update:
apps/admin-dashboard/app/orders/[id]/page.jsx

Requirements:
- Read order id from route
- Load full order details
- Load available drivers
- Load laundromats
- Allow admin to assign driver
- Allow admin to assign laundromat
- Allow admin to update status
- Show order status timeline
- Show customer info
- Show order items
- Refresh data after updates
- No mock data

Stop after admin can update a real order.
```

---

## PHASE 18 — Manual Dispatch Mode

**Goal**
For client safety, admin manually dispatches first.

**Required behavior**

- Orders with status pending_dispatch appear in Dispatch page
- Admin selects driver and laundromat
- System updates status to accepted
- Driver sees assignment

**Implementation notes**

Update only `order.driver_id` and `order.laundromat_id`. Do not update driver profile status field.

**PHASE 18 Copilot Prompt**

```
PHASE 18: Build manual dispatch page.

Create/update:
apps/admin-dashboard/app/dispatch/page.jsx

Requirements:
- Load orders where status = pending_dispatch
- Load available drivers
- Load open laundromats
- Admin chooses driver and laundromat
- On dispatch:
  update order.driver_id
  update order.laundromat_id
  update order.status = accepted
- Show success/error messages
- Do not auto-dispatch yet

Stop after manual dispatch works.
```

---

## PHASE 19 — Driver App Auth

**Required screens**

- `apps/driver-app/app/login.jsx`
- `apps/driver-app/app/go-online.jsx`

**PHASE 19 Copilot Prompt**

```
PHASE 19: Build driver app auth and go-online flow.

Create:
apps/driver-app/app/login.jsx
apps/driver-app/app/go-online.jsx

Requirements:
- Driver login with email/password
- Load current profile
- Verify role is driver
- If not driver, show access denied
- Go Online button updates driver profile
- Go Offline button updates driver profile
- No mock driver

Stop after driver can login and go online.
```

---

## PHASE 20 — Driver Assigned Order Screen

**Required file**
`apps/driver-app/app/active-order.jsx`

**Requirements**

- Load order where driver_id = current user and status not delivered/cancelled
- Show pickup address
- Show laundromat
- Show customer
- Buttons to advance status

**PHASE 20 Copilot Prompt**

```
PHASE 20: Build driver active order screen.

Create:
apps/driver-app/app/active-order.jsx

Requirements:
- Load current driver user
- Query assigned active order
- Show customer info, pickup address, laundromat info
- Show current status
- Add buttons:
  heading_to_pickup
  arrived_at_pickup
  picked_up
  received
  out_for_delivery
  delivered
- Each button updates order status
- Loading and error states
- No mock orders

Stop after driver can update order status.
```

---

## PHASE 21 — Driver Location Tracking

**Goal**
Driver app writes live location to driver_locations table.

**Implementation notes**

Insert into `driver_locations` table only. Do not update profiles table.

**PHASE 21 Copilot Prompt**

```
PHASE 21: Add driver live location tracking.

Update driver app active order flow.

Requirements:
- Request foreground location permission
- When driver has active order, watch position
- Every location update:
  insert into driver_locations with driver_id, order_id, latitude, longitude
- Stop tracking when order is delivered or app unmounts
- Handle permission denied
- Do not crash if location unavailable

Stop after location tracking works.
```

---

## PHASE 22 — Customer Live Tracking

**Required update**
`apps/customer-app/app/tracking.jsx`

**Requirements**

- Read orderId
- Load order
- Subscribe to order status changes
- Show latest driver location
- Render map if driver location exists

**PHASE 22 Copilot Prompt**

```
PHASE 22: Build customer live tracking.

Update:
apps/customer-app/app/tracking.jsx

Requirements:
- Read orderId from route params
- Load order using getOrderById
- Subscribe to order changes
- Subscribe to driver_locations for this order
- Show current status timeline
- Show driver location on map if available
- Fall back to text status if no location yet
- No mock tracking data

Stop after customer tracking updates in realtime.
```

---

## PHASE 23 — Laundromat Dashboard Queue

**Required route**
`apps/laundromat-dashboard/app/orders/page.jsx`

**Requirements**

- Show assigned orders
- Filter statuses:
  - received
  - sorting
  - washing
  - drying
  - folding
  - quality_check
  - packed
  - ready_for_delivery

**PHASE 23 Copilot Prompt**

```
PHASE 23: Build laundromat dashboard queue.

Create/update:
apps/laundromat-dashboard/app/orders/page.jsx

Requirements:
- Load current laundromat operator profile
- Load assigned laundromat orders
- Show queue table/cards
- Show customer name, order items, status
- Link to order detail
- No mock orders

Stop after queue loads real orders.
```

---

## PHASE 24 — Laundromat Status Updates

**Required route**
`apps/laundromat-dashboard/app/orders/[id]/page.jsx`

**PHASE 24 Copilot Prompt**

```
PHASE 24: Build laundromat order detail and status update.

Create/update:
apps/laundromat-dashboard/app/orders/[id]/page.jsx

Requirements:
- Load order by id
- Show order items
- Show customer notes
- Buttons for:
  received
  sorting
  washing
  drying
  folding
  quality_check
  packed
  ready_for_delivery
- Updating status must update orders.status
- Refresh after update
- No mock data

Stop after laundromat can move order through cleaning flow.
```

---

## PHASE 25 — Notifications

**Required shared file**
`packages/shared/notifications.js`

**PHASE 25 Copilot Prompt**

```
PHASE 25: Implement notifications.

Create:
packages/shared/notifications.js

Requirements:
- createNotification(userId, title, body)
- notificationForStatus(status)
- create notification whenever order status changes from app code
- Customer app notifications page:
  apps/customer-app/app/notifications.jsx
- Load current user's notifications
- Show read/unread state

Do not implement push notifications yet unless already configured.
Stop after database notifications work.
```

---

## PHASE 26 — Wallet Screen Real Data

**Required update**
`apps/customer-app/app/wallet.jsx`

**PHASE 26 Copilot Prompt**

```
PHASE 26: Replace wallet mock data.

Update:
apps/customer-app/app/wallet.jsx

Requirements:
- Load current user
- Load wallet using getWallet
- Load wallet transactions using getWalletTransactions
- Show real balance
- Show real transactions
- Loading and error states
- No mock transactions

Stop after wallet uses Supabase.
```

---

## PHASE 27 — Admin Finance Dashboard

**Required route**
`apps/admin-dashboard/app/finance/page.jsx`

**Requirements**

- Today revenue
- Orders today
- Average order value
- Paid orders
- Refunded orders

**PHASE 27 Copilot Prompt**

```
PHASE 27: Build admin finance dashboard.

Create/update:
apps/admin-dashboard/app/finance/page.jsx

Requirements:
- Query paid orders
- Calculate today revenue
- Calculate orders today
- Calculate average order value
- Show refund count
- Show latest transactions/orders
- No mock metrics
- Make calculations from Supabase data

Stop after finance dashboard works.
```

---

## PHASE 28 — Support Tickets

**Required screens**

- `apps/customer-app/app/support.jsx`
- `apps/admin-dashboard/app/support/page.jsx`

**PHASE 28 Copilot Prompt**

```
PHASE 28: Build support system.

Customer app:
- Create apps/customer-app/app/support.jsx
- User can create ticket with subject/message/orderId optional
- Save to support_tickets

Admin dashboard:
- Create apps/admin-dashboard/app/support/page.jsx
- Admin can view tickets
- Admin can update status open/resolved

No mock data.
Stop after support tickets work end-to-end.
```

---

## PHASE 29 — SLA Monitor

**Required route**
`apps/admin-dashboard/app/sla/page.jsx`

**PHASE 29 Copilot Prompt**

```
PHASE 29: Build SLA monitor.

Create:
apps/admin-dashboard/app/sla/page.jsx

Requirements:
- Load non-delivered orders
- Compare current time against sla_deadline
- Show safe, at_risk, breached
- Admin can mark refund eligible
- Do not automatically refund
- No mock data

Stop after SLA monitor works.
```

---

## PHASE 30 — Refund Admin Flow

**Requirements**

- Only admin can refund
- Refund requires: order id, amount, reason, approved_by

**PHASE 30 Copilot Prompt**

```
PHASE 30: Build refund admin flow.

Update admin order detail page.

Requirements:
- Add refund form
- Amount input
- Reason input
- Save refund row to refunds table
- Update order.status = refunded
- Update order.payment_status = refunded
- Do not call Stripe refund yet; add TODO for Stripe refund integration
- Only show refund UI in admin dashboard

Stop after refund records save.
```

---

## PHASE 31 — Client Settings / Pricing Controls

**Required route**
`apps/admin-dashboard/app/settings/page.jsx`

**PHASE 31 Copilot Prompt**

```
PHASE 31: Build admin settings for services/pricing.

Create/update:
apps/admin-dashboard/app/settings/page.jsx

Requirements:
- List services from Supabase
- Admin can create service
- Admin can edit price
- Admin can activate/deactivate service
- No mock pricing
- Refresh after mutation

Stop after pricing can be managed from dashboard.
```

---

## PHASE 32 — Remove All Mock Data

**Goal**
No fake production data inside screens.

**PHASE 32 Copilot Prompt**

```
PHASE 32: Audit and remove mock data.

Search the repo for:
- mockData
- hardcoded orders
- hardcoded wallet transactions
- hardcoded customer names
- hardcoded service lists
- sample driver
- sample laundromat

Replace with Supabase queries where appropriate.
Do not remove placeholder UI text unless it is fake business data.
Show me a list of files changed.
Stop after mock data is removed.
```

---

## PHASE 33 — Error Handling and Loading States

**PHASE 33 Copilot Prompt**

```
PHASE 33: Add production error and loading states.

Audit all customer app, driver app, admin dashboard, and laundromat dashboard screens that fetch data.

Requirements:
- Every query shows loading state
- Every query shows error state
- Every mutation disables button while loading
- Every mutation catches errors
- Show human-readable error messages
- Do not silently fail

Stop after error handling is added.
```

---

## PHASE 34 — Environment Validation

**PHASE 34 Copilot Prompt**

```
PHASE 34: Add environment validation.

Create:
packages/config/env.js

Requirements:
- Validate Supabase URL exists
- Validate Supabase anon key exists
- Export validated values
- Update shared Supabase client to use env config
- Do not expose service role key in frontend

Stop after env validation is added.
```

---

## PHASE 35 — Production Build Check

**Commands**

Customer app:

```bash
cd apps/customer-app
npx expo-doctor
npx expo start --clear
```

Driver app:

```bash
cd apps/driver-app
npx expo-doctor
npx expo start --clear
```

Admin dashboard:

```bash
cd apps/admin-dashboard
npm run build
```

Laundromat dashboard:

```bash
cd apps/laundromat-dashboard
npm run build
```

**PHASE 35 Copilot Prompt**

```
PHASE 35: Run production build checks.

Run:
- npx expo-doctor in customer app
- npx expo-doctor in driver app
- npm run build in admin dashboard
- npm run build in laundromat dashboard

If anything fails:
- Stop
- Show exact error
- Fix only that error
- Re-run the failed command

Stop after all builds pass.
```

---

## PHASE 36 — Full Manual QA Test

**Test checklist**

1. Customer signs up
2. Customer adds address
3. Customer creates order
4. Customer pays
5. Order becomes pending_dispatch
6. Admin assigns driver/laundromat
7. Driver sees assignment
8. Driver updates pickup status
9. Customer tracking updates
10. Laundromat updates cleaning status
11. Driver marks out_for_delivery
12. Driver marks delivered
13. Customer sees delivered
14. Admin sees revenue
15. Support ticket can be created
16. Refund record can be created by admin

**PHASE 36 Copilot Prompt**

```
PHASE 36: Create QA test script.

Create:
QA_TEST_PLAN.md

Include:
- Full manual end-to-end test checklist
- Expected result for each step
- What to do if each step fails
- Tables/screens involved
- Final pass/fail section

Do not write code in this phase.
Stop after QA_TEST_PLAN.md is created.
```

---

## PHASE 37 — Client Handoff Docs

**Required docs**

- `CLIENT_HANDOFF.md`
- `ADMIN_OPERATIONS_GUIDE.md`
- `TROUBLESHOOTING.md`
- `DEPLOYMENT_NOTES.md`

**PHASE 37 Copilot Prompt**

```
PHASE 37: Create client handoff documentation.

Create:
- CLIENT_HANDOFF.md
- ADMIN_OPERATIONS_GUIDE.md
- TROUBLESHOOTING.md
- DEPLOYMENT_NOTES.md

Include:
- How to log in
- How to view orders
- How to assign driver
- How to assign laundromat
- How to update order status
- How to handle late orders
- How to issue refund record
- How to change pricing
- How to view revenue
- Common problems and fixes
- What not to touch

Stop after docs are created.
```

---

## PHASE 38 — Production Deployment

**Customer app**

```bash
cd apps/customer-app
npx eas build:configure
npx eas build --platform android
npx eas build --platform ios
```

**Driver app**

```bash
cd apps/driver-app
npx eas build:configure
npx eas build --platform android
npx eas build --platform ios
```

**Admin dashboard**

```bash
cd apps/admin-dashboard
npm run build
vercel deploy --prod
```

**Laundromat dashboard**

```bash
cd apps/laundromat-dashboard
npm run build
vercel deploy --prod
```

**PHASE 38 Copilot Prompt**

```
PHASE 38: Prepare production deployment instructions.

Create:
PRODUCTION_DEPLOYMENT_CHECKLIST.md

Include:
- Supabase db push
- Supabase secrets
- Expo EAS build steps
- Vercel deployment steps
- Required environment variables
- Post-deploy smoke test
- Rollback notes

Do not deploy automatically unless I explicitly ask.
Stop after checklist is created.
```

---

## Final "Done" Definition

Your build is not done until this works:

**Customer signs up → adds address → creates order → pays → admin dispatches → driver updates status → laundromat updates cleaning flow → driver delivers → customer sees delivered → admin sees revenue**

That is the whole machine.

Use Copilot one phase at a time. Don't let it freestyle.
