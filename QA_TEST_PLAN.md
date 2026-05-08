<!-- markdownlint-disable MD032 -->
# JiffyLaundry — Full Manual QA Test Plan

## Overview

This document outlines the complete end-to-end QA test for JiffyLaundry platform. Follow each step in order. The entire flow simulates a real customer journey from signup through delivery.

---

## Test Environment Setup

**Prerequisites:**

- All 4 apps must be running:
  - Customer app (Expo)
  - Driver app (Expo)
  - Admin dashboard (Next.js)
  - Laundromat dashboard (Next.js)
- Supabase database must be live with all tables created
- Test accounts should be ready or created during testing
- Payment processing should be in test mode (Stripe test keys)

---

## Full End-to-End Test Checklist

### STEP 1: Customer Signs Up

**Action:**

1. Open Customer app
2. Click "Sign Up"
3. Enter: Full Name, Email, Password (8+ chars)
4. Click "Sign Up" button
5. Verify email (if required)

**Tables Involved:**
- `auth.users` (Supabase Auth)
- `profiles`

**Expected Result:**
- ✅ Account created successfully
- ✅ Redirected to home screen
- ✅ User can see "Welcome, [Name]" or profile section
- ✅ User ID appears in Supabase `profiles` table with role = 'customer'

**If this step fails:**
- Check Supabase connection (verify env variables loaded)
- Check network connectivity
- Check if auth policies allow signup
- Look for error message in app and note it
- **Stop and report error**

---

### STEP 2: Customer Adds Address

**Action:**
1. Go to Addresses or Profile section
2. Click "Add Address"
3. Enter:
   - Street: "123 Main St"
   - City: "New York"
   - State: "NY"
   - Zip: "10001"
4. Check "Set as default"
5. Click "Save Address"

**Tables Involved:**
- `addresses`

**Expected Result:**
- ✅ Address saved to Supabase
- ✅ Address appears in address list
- ✅ Marked as default address
- ✅ Row inserted into `addresses` table with `is_default = true`

**If this step fails:**
- Check RLS policies on `addresses` table
- Verify `user_id` is being captured correctly
- Check browser console for errors
- Verify location permission wasn't required
- **Stop and report error**

---

### STEP 3: Customer Creates Order

**Action:**
1. Go to "Schedule" or "Create Order" screen
2. Services should load from Supabase (not hardcoded)
3. Select service: "Wash & Fold" or first available service
4. Enter quantity: 5 lbs
5. Select pickup date/time
6. Click "Continue to Checkout"

**Tables Involved:**
- `services`
- `orders` (will insert here)
- `order_items` (will insert here)

**Expected Result:**
- ✅ Services loaded from `services` table
- ✅ Subtotal calculated: service_price × quantity
- ✅ Fees calculated:
  - pickup_fee = 2.00
  - service_fee = subtotal × 0.08
  - tax = subtotal × 0.08875
  - total = subtotal + pickup_fee + service_fee + tax
- ✅ Order status = 'pending_payment'
- ✅ payment_status = 'unpaid'
- ✅ Order ID displayed on checkout screen

**If this step fails:**
- Check `services` table has active services
- Check fee calculation logic
- Verify order creation didn't fail silently
- Check Supabase console for error logs
- **Stop and report error**

---

### STEP 4: Customer Pays

**Action:**
1. On checkout, click "Continue to Payment"
2. Payment screen loads
3. Order summary shows (items, fees, total)
4. Click "Pay Now" or similar
5. (Test mode) Use test card: 4242 4242 4242 4242, exp: 12/25, CVC: 123
6. Complete payment flow

**Tables Involved:**
- `orders` (update payment_status, status)
- Stripe (external)

**Expected Result:**
- ✅ PaymentIntent created in Stripe
- ✅ clientSecret received
- ✅ Payment succeeds (test card accepted)
- ✅ Order `payment_status` → 'paid'
- ✅ Order `status` → 'pending_dispatch'
- ✅ `stripe_payment_intent_id` stored in order
- ✅ Redirect to tracking or success screen

**If this step fails:**
- Check Stripe is configured and keys are correct
- Check Edge Function `create-payment-intent` exists
- Check Stripe test mode is enabled
- Verify network request succeeded
- **Stop and report error**

---

### STEP 5: Order Becomes pending_dispatch

**Action:**
- Automatic (happens after payment)
- No manual action needed
- Verify in Admin Dashboard

**Tables Involved:**
- `orders`

**Expected Result:**
- ✅ Order status changed to 'pending_dispatch' after successful payment
- ✅ Admin can see this order in Dispatch queue
- ✅ Order appears in admin dashboard orders list

**If this step fails:**
- Check order status update logic
- Check if payment success callback fired
- Verify database reflects status change
- **Stop and report error**

---

### STEP 6: Admin Assigns Driver/Laundromat

**Action:**
1. Open Admin Dashboard
2. Go to "Dispatch" page
3. Find the order created in STEP 3 (search by customer name or order ID)
4. Click on order
5. Select a driver from dropdown (or create test driver if needed)
6. Select a laundromat from dropdown (or create test laundromat)
7. Click "Dispatch" button

**Tables Involved:**
- `orders` (update driver_id, laundromat_id, status)
- `profiles` (driver profile)
- `laundromats`

**Expected Result:**
- ✅ Order `driver_id` set to selected driver
- ✅ Order `laundromat_id` set to selected laundromat
- ✅ Order `status` → 'accepted'
- ✅ Success message displayed: "Order XXX... dispatched successfully"
- ✅ Order removed from pending dispatch queue

**If this step fails:**
- Check drivers exist in `profiles` with role='driver'
- Check laundromats exist in `laundromats` table
- Check dispatch query for pending_dispatch orders
- Verify update query executes
- **Stop and report error**

---

### STEP 7: Driver Sees Assignment

**Action:**
1. Open Driver App
2. Login with test driver account (email/password)
3. Click "Go Online" or similar
4. Navigate to active orders or assignment screen

**Tables Involved:**
- `orders` (query where driver_id = current user)
- `profiles` (current user)

**Expected Result:**
- ✅ Driver can login successfully
- ✅ Active order appears showing:
  - Customer name
  - Pickup address
  - Laundromat destination
  - Order ID
  - Items to pickup
- ✅ Status shows current state (not yet started)

**If this step fails:**
- Check driver can login
- Verify driver_id matches current user
- Check order query in driver app
- Verify user profile role = 'driver'
- **Stop and report error**

---

### STEP 8: Driver Updates Pickup Status

**Action:**
1. In Driver App, on active order
2. Click "Heading to Pickup" button
3. App asks for location permission
4. Allow location access
5. Order status should advance
6. Click "Arrived at Pickup"
7. Click "Picked Up" button

**Tables Involved:**
- `orders` (update status)
- `driver_locations` (insert location data)
- `order_status_events` (insert event)

**Expected Result:**
- ✅ Status progresses: heading_to_pickup → arrived_at_pickup → picked_up
- ✅ Location captured in `driver_locations` table
- ✅ Each status change creates entry in `order_status_events`
- ✅ Driver location visible on map (if implemented)
- ✅ Buttons disabled while updating

**If this step fails:**
- Check location permission handling
- Verify status update query
- Check driver_locations insert
- Look for permission errors
- **Stop and report error**

---

### STEP 9: Customer Tracking Updates

**Action:**
1. Go back to Customer App
2. Navigate to "Orders" or "Tracking"
3. Find the order
4. Click on order to view tracking

**Tables Involved:**
- `orders` (real-time subscription)
- `driver_locations` (real-time subscription)
- `profiles` (driver info)

**Expected Result:**
- ✅ Current status displays: "Picked Up" or similar
- ✅ Status timeline shows progression:
  - ✓ Order created
  - ✓ Payment received
  - ✓ Dispatch assigned
  - ✓ Driver heading to pickup
  - ✓ Arrived at pickup
  - ✓ Picked up
- ✅ If driver location available, map shows driver location
- ✅ Page updates in real-time (Supabase subscriptions working)

**If this step fails:**
- Check Supabase real-time subscriptions enabled
- Verify customer_id matches current user
- Check order status timeline query
- Verify driver location query
- **Stop and report error**

---

### STEP 10: Laundromat Updates Cleaning Status

**Action:**
1. Open Laundromat Dashboard
2. Login with laundromat operator account
3. Go to "Orders" or queue
4. Find the order (should show as "received")
5. Click on order
6. Click "Received" (confirm laundromat has order)
7. Click "Sorting" (start process)
8. Click "Washing"
9. Click "Drying"
10. Click "Folding"
11. Click "Quality Check"
12. Click "Packed"
13. Click "Ready for Delivery"

**Tables Involved:**
- `orders` (update status through cleaning flow)
- `order_status_events` (create event for each transition)

**Expected Result:**
- ✅ Status advances through each step: received → sorting → washing → drying → folding → quality_check → packed → ready_for_delivery
- ✅ Buttons disabled while updating
- ✅ Each step creates event in `order_status_events`
- ✅ Order shows as complete in laundromat queue

**If this step fails:**
- Check laundromat operator authentication
- Verify laundromat_id matches current user
- Check order status update query
- Check status values match enum
- **Stop and report error**

---

### STEP 11: Driver Marks Out for Delivery

**Action:**
1. Go back to Driver App
2. On active order, verify status is "Ready for Delivery" or similar
3. Click "Out for Delivery" button
4. Confirm action

**Tables Involved:**
- `orders` (update status)
- `driver_locations` (track final delivery route)

**Expected Result:**
- ✅ Order status → 'out_for_delivery'
- ✅ Status event created
- ✅ Customer sees status update in tracking

**If this step fails:**
- Check driver has active order
- Verify status preconditions (must be ready first)
- Check update query
- **Stop and report error**

---

### STEP 12: Driver Marks Delivered

**Action:**
1. In Driver App on active order
2. Click "Delivered" button
3. App may ask for signature or photo (if implemented)
4. Confirm delivery

**Tables Involved:**
- `orders` (update status to 'delivered')
- `wallets` (credit driver or customer if applicable)
- `wallet_transactions` (record transaction)

**Expected Result:**
- ✅ Order status → 'delivered'
- ✅ Order disappears from driver's active orders
- ✅ Customer credit/refund processed (if applicable)
- ✅ Status event created
- ✅ Customer notified

**If this step fails:**
- Check final delivery logic
- Verify status event creation
- Check wallet update if applicable
- **Stop and report error**

---

### STEP 13: Customer Sees Delivered

**Action:**
1. Go back to Customer App
2. Navigate to Orders
3. Find the order

**Tables Involved:**
- `orders` (query)
- `order_status_events` (timeline)

**Expected Result:**
- ✅ Order shows status: 'Delivered'
- ✅ Order moved to "Completed" or past orders section
- ✅ Full timeline visible showing all steps
- ✅ Delivery marked complete

**If this step fails:**
- Check real-time subscription updated
- Verify order status in database
- Check UI updates on status change
- **Stop and report error**

---

### STEP 14: Admin Sees Revenue

**Action:**
1. In Admin Dashboard
2. Go to "Finance" page
3. View metrics

**Tables Involved:**
- `orders` (where payment_status='paid' and status='delivered')
- `wallet_transactions`

**Expected Result:**
- ✅ Today Revenue shows order total amount
- ✅ Orders Today shows count = 1 (from this test)
- ✅ Average Order Value calculated correctly
- ✅ Paid Orders shows count = 1
- ✅ Order appears in "Latest Orders" table with:
  - Order ID
  - Amount (total)
  - Payment Status: 'paid'
  - Order Status: 'delivered'
  - Created date

**If this step fails:**
- Check finance query joins with payments
- Verify aggregation calculations
- Check date filtering (today only)
- **Stop and report error**

---

### STEP 15: Support Ticket Can Be Created

**Action:**
1. In Customer App, go to Support
2. Click "Create Support Ticket"
3. Enter:
   - Subject: "Test ticket"
   - Message: "Testing support system"
   - Order (optional): Select the completed order
4. Click "Submit"

**Tables Involved:**
- `support_tickets` (insert)

**Expected Result:**
- ✅ Ticket created successfully
- ✅ Ticket appears in customer's ticket list
- ✅ Status: 'open'
- ✅ Ticket ID displayed
- ✅ In Admin Dashboard > Support, ticket appears as 'open'
- ✅ Admin can view ticket details

**If this step fails:**
- Check support create mutation
- Verify RLS policies on support_tickets
- Check customer_id captured correctly
- **Stop and report error**

---

### STEP 16: Refund Record Can Be Created by Admin

**Action:**
1. In Admin Dashboard
2. Go to Orders
3. Find a completed order
4. Click on order detail
5. Scroll to "Refund" section
6. Enter:
   - Amount: 10.00 (partial refund)
   - Reason: "Test refund"
7. Click "Create Refund"

**Tables Involved:**
- `refunds` (insert)
- `orders` (update status, payment_status if full refund)

**Expected Result:**
- ✅ Refund record created
- ✅ Row inserted into `refunds` table with:
  - order_id
  - amount
  - reason
  - approved_by (current admin user ID)
  - refund_status: 'pending' or similar
- ✅ Success message displayed
- ✅ Refund record visible in refunds table (if view exists)
- ✅ If full refund: order status → 'refunded', payment_status → 'refunded'
- ✅ Note: TODO - Stripe refund integration not yet implemented

**If this step fails:**
- Check admin role verification
- Verify refund create mutation
- Check amount validation (> 0)
- Check RLS policies
- **Stop and report error**

---

## Test Results Summary

### Pass/Fail Section

- [ ] **STEP 1:** Customer Signup
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 2:** Add Address
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 3:** Create Order
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 4:** Payment
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 5:** Order Pending Dispatch
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 6:** Admin Dispatch
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 7:** Driver Assignment
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 8:** Driver Pickup
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 9:** Customer Tracking
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 10:** Laundromat Updates
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 11:** Out for Delivery
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 12:** Delivered
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 13:** Customer Sees Delivered
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 14:** Admin Revenue
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 15:** Support Ticket
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

- [ ] **STEP 16:** Refund Record
  - Status: _____ (Pass/Fail)
  - Notes: _________________________________

---

## Final Verdict

**Overall Test Result:** __________ (PASS / FAIL)

**Total Steps Passed:** ____ / 16

**Critical Issues Found:**
- [ ] None
- [ ] Yes - List below:

---

---

**Notes for Next Phase:**

---

---

---

## Sign-Off

**Tested By:** _______________________

**Date:** _______________________

**Time:** _______________________

**Environment:** Production / Staging / Local

**Build Version:** _______________________
