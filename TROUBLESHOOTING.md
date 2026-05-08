<!-- markdownlint-disable MD032 MD034 MD060 -->
# TROUBLESHOOTING.md — JiffyLaundry Platform

## Common Problems and Solutions

This guide helps you solve common issues in JiffyLaundry platform.

---

## Customer App Issues

### Problem: Can't Sign Up

**Symptoms:**
- "Sign Up" button doesn't work
- Error message appears
- Page stays blank

**Solutions:**

1. **Check Email Format**
   - Ensure email is valid (user@example.com)
   - No spaces
   - Real email preferred

2. **Check Password**
   - Must be 8+ characters
   - Try simpler password with numbers and letters

3. **Check Internet Connection**
   - Make sure WiFi/data is working
   - Try switching networks

4. **Check Supabase Status**
   - Verify `.env.local` has correct values:
     - EXPO_PUBLIC_SUPABASE_URL
     - EXPO_PUBLIC_SUPABASE_ANON_KEY
   - Test Supabase connection in browser

5. **Clear App Cache**
   - Close and reopen app
   - Restart phone

**Still broken?**
- Check browser/app console for error message
- Note the exact error
- Contact support with error text

---

### Problem: Can't Add Address

**Symptoms:**
- "Add Address" button doesn't work
- Address submitted but doesn't appear
- Error message

**Solutions:**

1. **Check Location Permission**
   - App may need location permission
   - iOS: Settings → JiffyLaundry → Location → Allow
   - Android: Settings → Apps → JiffyLaundry → Permissions → Location

2. **Check Address Format**
   - All fields required: Street, City, State, Zip
   - No special characters in zip code
   - Valid US state abbreviation (NY, CA, etc.)

3. **Check RLS Policy**
   - In Supabase: Go to Authentication → Row Level Security
   - Verify `addresses` table has policy allowing inserts
   - If missing: Add policy

4. **Check User ID**
   - Verify you're logged in
   - Your user ID should be captured automatically

**Still broken?**
- Try different address
- Try on different device
- Contact support

---

### Problem: Services Not Loading

**Symptoms:**
- "Create Order" screen shows nothing
- Services list empty
- Loading spinner never stops

**Solutions:**

1. **Check Internet**
   - Ensure WiFi/data connected
   - Try switching networks

2. **Check Supabase**
   - Go to Supabase dashboard
   - Check `services` table has rows
   - Verify `active = true` for services

3. **Check Environment Variables**
   - Verify `.env.local` loaded
   - EXPO_PUBLIC_SUPABASE_URL correct
   - EXPO_PUBLIC_SUPABASE_ANON_KEY correct

4. **Restart App**
   - Close completely
   - Reopen
   - Services should load

**Still broken?**
- Check RLS policies on `services` table
- Ensure policy allows SELECT for authenticated users

---

### Problem: Can't Complete Payment

**Symptoms:**
- Payment button doesn't work
- Card declined
- "Payment failed" error
- Page stuck on payment

**Solutions:**

1. **Check Test Mode**
   - Using Stripe test card?
   - Correct test card: 4242 4242 4242 4242
   - Exp: any future date (12/25)
   - CVC: any 3 digits (123)

2. **Check Card Details**
   - No spaces in card number
   - Expiry date correct and in future
   - CVC is 3 digits (back of card)

3. **Check Internet**
   - Payment requires active connection
   - Check WiFi/data

4. **Check Stripe Keys**
   - Verify EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY set
   - Correct key for test/prod
   - App restarted after env change

5. **Check Order Amount**
   - Amount must be > 0
   - Check fees calculated correctly

6. **Check Supabase Edge Function**
   - `create-payment-intent` function working?
   - Check Stripe secret key set in Supabase secrets
   - Verify function invokes successfully

**Still broken?**
- Try different card
- Try on different device
- Check Stripe dashboard for failed payments
- Contact support with error

---

### Problem: Can't See Tracking

**Symptoms:**
- Tracking page blank or doesn't load
- Can't find order
- Order doesn't show status updates

**Solutions:**

1. **Check Order Exists**
   - Go to "Orders" list
   - Find your order
   - Verify it's the right one

2. **Check Order Status**
   - Must be past `pending_payment` status
   - Admin must have dispatched order
   - Driver must have accepted

3. **Check Real-time Subscription**
   - Internet connected?
   - Supabase real-time enabled?
   - Try refreshing page

4. **Check Driver Assigned**
   - Order must have `driver_id` set
   - Admin must have dispatched
   - Driver must have accepted

**Still broken?**
- Close and reopen app
- Check order detail page
- Contact support

---

## Driver App Issues

### Problem: Can't Log In

**Symptoms:**
- Login button doesn't work
- "Invalid credentials"
- Page stuck on login

**Solutions:**

1. **Check Credentials**
   - Email correct
   - Password correct (case-sensitive)
   - No extra spaces

2. **Check Account Type**
   - Must be driver account
   - Contact admin if unsure
   - Admin can check in profiles table

3. **Check Internet**
   - WiFi or data connected
   - Try switching networks

4. **Check Supabase**
   - Auth service running
   - Database connected

**Still broken?**
- Reset password (if available)
- Contact admin to reset account
- Try different device

---

### Problem: No Active Orders

**Symptoms:**
- "No active orders" message
- Order list empty
- Don't see assigned orders

**Solutions:**

1. **Check You're Online**
   - Click "Go Online" first
   - Must be in online status

2. **Check You're Assigned**
   - Admin must have assigned order to you
   - Check admin dashboard

3. **Check Status**
   - Order must have status = 'accepted'
   - If status is 'pending_dispatch', admin hasn't assigned yet

4. **Refresh**
   - Close and reopen app
   - Pull down to refresh
   - Order may appear

5. **Check Order List**
   - Maybe order isn't active yet
   - Try "View All Orders" if available

**Still broken?**
- Contact admin
- Ask to check dispatch queue
- Ask to assign order manually

---

### Problem: Location Not Updating

**Symptoms:**
- Customer can't see location
- Map shows old location
- "Location unavailable"

**Solutions:**

1. **Check Location Permission**
   - iOS: Settings → JiffyLaundry → Location → Allow While Using
   - Android: Settings → Apps → JiffyLaundry → Permissions → Location
   - Make sure "Always" or "While Using" selected

2. **Check GPS**
   - Enable GPS on phone
   - Make sure satellite signal available
   - Indoors? GPS weaker

3. **Check Internet**
   - WiFi or data needed to upload location
   - Check signal strength

4. **Check Location Updates**
   - App might update every 1-5 minutes
   - Not real-time continuously
   - Give it time to sync

5. **Restart Location**
   - Turn Location permission off
   - Turn back on
   - App should retry

**Still broken?**
- Restart phone
- Check if device has GPS
- Try on different device
- Contact support

---

### Problem: Can't Update Order Status

**Symptoms:**
- Status button doesn't work
- "Update failed"
- Status doesn't change

**Solutions:**

1. **Check Status Sequence**
   - Can't skip statuses
   - Must go: heading_to_pickup → arrived_at_pickup → picked_up → etc.
   - Check you're clicking right button

2. **Check Internet**
   - Connection must be active
   - Check WiFi/data

3. **Check Order**
   - Make sure it's your assigned order
   - Order must have status set to you
   - Not cancelled or delivered

4. **Retry**
   - Try clicking button again
   - Maybe network glitch

5. **Check Supabase**
   - Database must be accessible
   - Check for any Supabase outages

**Still broken?**
- Restart app
- Restart phone
- Contact admin

---

## Admin Dashboard Issues

### Problem: Orders Page Blank

**Symptoms:**
- Orders page shows nothing
- Loading spinner forever
- No error message

**Solutions:**

1. **Check Login**
   - Must be logged in as admin
   - Check you see admin menu

2. **Check Internet**
   - WiFi connected
   - Check speed

3. **Refresh Page**
   - Press F5 or Cmd+R
   - Or go back and click "Orders" again

4. **Check Browser**
   - Try different browser
   - Clear cache: Ctrl+Shift+Delete
   - Try incognito/private mode

5. **Check Supabase**
   - Go to Supabase dashboard
   - Check `orders` table has data
   - Check auth is working

**Still broken?**
- Check browser console for errors
- Note error and contact support

---

### Problem: Can't Dispatch Order

**Symptoms:**
- Dispatch button doesn't work
- Driver/laundromat dropdown empty
- "Dispatch failed"

**Solutions:**

1. **Check Drivers Exist**
   - Must have at least one driver
   - Drivers must have role='driver' in profiles
   - Ask admin to create test driver if needed

2. **Check Laundromats Exist**
   - Must have at least one laundromat
   - Check laundromats table
   - Ask admin to create if needed

3. **Check Order Status**
   - Order must be 'pending_dispatch'
   - If already dispatched, can't dispatch again

4. **Select Both**
   - Must select driver AND laundromat
   - Can't leave either blank
   - Try again with both selected

5. **Refresh**
   - Refresh page
   - Try dispatch again

**Still broken?**
- Check browser console for errors
- Check Supabase query logs
- Contact support

---

### Problem: Finance Numbers Wrong

**Symptoms:**
- Revenue doesn't match
- Order count wrong
- Calculations incorrect

**Solutions:**

1. **Check Date Filter**
   - Is "Today Revenue" filtering for today?
   - Check date in system settings
   - Compare to actual orders created

2. **Check Payment Status**
   - Revenue includes only payment_status='paid'
   - Unpaid orders excluded
   - Check order payment_status

3. **Check Refunds**
   - Refunded orders may be excluded
   - Check if order marked as refunded
   - Check refunds table

4. **Calculate Manually**
   - Go to Orders
   - Find orders created today
   - Sum up totals
   - Compare to dashboard

5. **Refresh**
   - Refresh page
   - Numbers may update

**Still broken?**
- Check database directly in Supabase
- Verify data is correct
- Check finance query

---

## Laundromat Dashboard Issues

### Problem: No Orders in Queue

**Symptoms:**
- Orders page empty
- No orders assigned
- "No orders" message

**Solutions:**

1. **Check You're Logged In**
   - Must be logged in as laundromat operator
   - Check dashboard title

2. **Check Laundromat ID**
   - Your account must have laundromat_id
   - Admin can verify in profiles
   - Contact admin if not set

3. **Check Admin Assigned**
   - Admin must have assigned orders to your laundromat
   - Check dispatch queue

4. **Check Order Status**
   - Order must be 'accepted' or beyond
   - If 'pending_dispatch', not assigned yet
   - Check admin dashboard

5. **Refresh**
   - Refresh page
   - Orders should appear

**Still broken?**
- Contact admin to assign order
- Ask admin to dispatch order
- Verify laundromat ID set

---

### Problem: Can't Update Status

**Symptoms:**
- Status button doesn't work
- "Update failed"
- Status doesn't change

**Solutions:**

1. **Check Status Sequence**
   - Must follow order: received → sorting → washing → drying → folding → quality_check → packed → ready_for_delivery
   - Can't skip steps

2. **Check Order**
   - Order must be assigned to your laundromat
   - Order must exist
   - Not already delivered

3. **Check Internet**
   - Connection required
   - Check WiFi

4. **Check Permission**
   - Must be laundromat operator
   - Admin can verify permissions

5. **Retry**
   - Try clicking again
   - Wait a moment
   - Try different status

**Still broken?**
- Refresh page
- Restart browser
- Contact admin

---

## Database Issues

### Problem: Missing Tables

**Symptoms:**
- App says "table not found"
- Error in app
- "Table X does not exist"

**Solutions:**

1. **Check Migrations Run**
   - Go to Supabase
   - Run SQL migrations
   - All CREATE TABLE statements must run
   - Check Database → Tables

2. **Check Table Names**
   - Table names case-sensitive
   - Must match exactly: lowercase
   - profiles, addresses, orders, etc.

3. **Run SQL**
   - Copy migration SQL from COPILOT_MASTER_BUILD.md
   - Paste in Supabase SQL Editor
   - Run all CREATE TABLE statements

**Still broken?**
- Contact support
- Provide database screenshot

---

### Problem: RLS Policy Blocking Access

**Symptoms:**
- "Permission denied"
- Can't read data
- Can't write data

**Solutions:**

1. **Check Policies Exist**
   - Go to Supabase → Authentication → Policies
   - Select table
   - Should see policies

2. **Check Policy Logic**
   - `SELECT` policy for reading
   - `INSERT` policy for creating
   - `UPDATE` policy for updating
   - `DELETE` policy for deleting

3. **Test in SQL Editor**
   - Supabase → SQL Editor
   - Run test query
   - See if returns data

4. **Enable RLS**
   - Some tables need RLS enabled
   - Check guide for which tables

**Still broken?**
- Review RLS policies in COPILOT_MASTER_BUILD.md
- Recreate policies
- Contact support

---

## Stripe Issues

### Problem: Payment Processing Fails

**Symptoms:**
- "Payment failed"
- Card declined
- Stripe error

**Solutions:**

1. **Check Test Mode**
   - Using Stripe test card?
   - 4242 4242 4242 4242 is valid test card

2. **Check Keys**
   - Verify STRIPE_PUBLISHABLE_KEY set
   - Verify STRIPE_SECRET_KEY set in Supabase secrets
   - Correct for test/production mode

3. **Check Edge Function**
   - `create-payment-intent` must exist
   - Function must be deployed
   - Function must call Stripe API

4. **Check Stripe Account**
   - Stripe account active
   - Stripe keys valid
   - No Stripe suspensions

5. **Check Amount**
   - Amount must be > 0
   - Usually in cents (e.g., 1000 = $10.00)

**Still broken?**
- Check Stripe dashboard for failed charges
- Check Edge Function logs
- Contact Stripe support

---

## General Troubleshooting Steps

**For any issue:**

1. **Restart**
   - Close app completely
   - Reopen

2. **Clear Cache**
   - Browser: Ctrl+Shift+Delete or Cmd+Shift+Delete
   - App: Uninstall and reinstall (iOS/Android)

3. **Check Internet**
   - WiFi or data connected
   - Speed adequate

4. **Check Supabase**
   - Dashboard accessible
   - No outages
   - Database responding

5. **Check Environment**
   - All env variables set
   - Correct values
   - App restarted after changes

6. **Check Logs**
   - Browser console (F12)
   - App error messages
   - Supabase logs

7. **Try Different Device**
   - Desktop vs mobile
   - Different browser
   - Different WiFi network

---

## Error Messages & Meanings

| Error | Cause | Fix |
|-------|-------|-----|
| "Permission denied" | RLS policy blocks access | Check RLS policies |
| "Table not found" | Migration didn't run | Run CREATE TABLE SQL |
| "Invalid credentials" | Wrong email/password | Check login details |
| "Network error" | Internet disconnected | Check WiFi/data |
| "Payment failed" | Stripe error or test card issue | Check card and Stripe keys |
| "Order not found" | Order ID wrong or deleted | Verify order exists |
| "User not authenticated" | Not logged in | Log in first |

---

## Contact Support

If none of these solutions work:

1. **Gather Information:**
   - Exact error message
   - Steps to reproduce
   - Which app/page
   - Device and browser
   - Screenshot

2. **Contact:**
   - Email: [support email]
   - Phone: [support phone]
   - Include all information above

3. **Escalate:**
   - If urgent: contact development lead
   - Include environment (prod/staging)
   - Include priority (customer impacted, etc.)

---

## FAQ

**Q: Can I delete an order?**
A: No. Mark as refunded or cancelled instead.

**Q: Can I edit a completed order?**
A: No. Create new order instead.

**Q: How do I refund a customer?**
A: See "Refund Record" in Admin Operations Guide.

**Q: Can I change the pickup fee?**
A: Only in code, not from UI. Contact development.

**Q: How do I add a new driver?**
A: Admin creates account in profiles with role='driver'.

**Q: Can customers see all orders in the system?**
A: No. RLS policy restricts to only their orders.

**Q: Why is the app slow?**
A: Check internet speed, Supabase load, or try different device.

**Q: Can I export data to Excel?**
A: Not yet. Use Supabase dashboard to download CSV.
