<!-- markdownlint-disable MD032 MD024 MD060 -->
# ADMIN_OPERATIONS_GUIDE.md — JiffyLaundry Platform

## Administrator Operations Guide

This guide is for admin staff managing JiffyLaundry platform operations.

---

## Dashboard Overview

The Admin Dashboard has 7 main sections:

1. **Orders** — View and manage all orders
2. **Dispatch** — Assign drivers and laundromats to pending orders
3. **Finance** — View revenue and order analytics
4. **Settings** — Manage services and pricing
5. **SLA** — Monitor order deadlines and breaches
6. **Support** — Manage customer support tickets
7. **[Additional pages as configured]**

---

## Daily Operations Workflow

### Morning: Check SLA and Backlog

1. **Check SLA Monitor**
   - Go to SLA page
   - Look for breached orders (red)
   - Note which orders are at risk (yellow)
   - Document issues

2. **Check Pending Dispatch Queue**
   - Go to Dispatch
   - See how many orders are waiting
   - Identify drivers and laundromats available
   - Plan dispatch

3. **Check Finance**
   - View yesterday's revenue
   - Check today's order count so far
   - Monitor payment status

### Mid-Day: Dispatch and Support

1. **Dispatch Pending Orders**
   - Go to Dispatch
   - For each pending order:
     - Choose available driver
     - Choose appropriate laundromat
     - Click Dispatch
   - Keep queue clear

2. **Monitor Active Orders**
   - Go to Orders
   - Filter by status: accepted, picked_up, etc.
   - Spot issues early:
     - Orders stuck in one status for too long
     - Driver not updating status
     - Laundromat not receiving order

3. **Handle Support Tickets**
   - Go to Support
   - View open tickets
   - Respond to customer issues
   - Mark as resolved when done

### Evening: Reconciliation

1. **Check Delivered Orders**
   - Go to Orders
   - Filter by status: delivered
   - Spot any last-minute issues

2. **Review Finance**
   - Check today's revenue
   - Verify order counts
   - Note patterns

3. **Prepare for Tomorrow**
   - Check pending orders still waiting dispatch
   - Check drivers/laundromats schedule
   - Note any system issues

---

## Order Management

### Finding Orders

**By Customer Name:**
1. Go to Orders
2. Use search/filter (if available) for customer name
3. Or scroll through list

**By Order ID:**
1. Go to Orders
2. Search for order ID
3. Or scan through list

**By Status:**
1. Go to Orders
2. Filter by status
3. Examples: pending_payment, accepted, delivered, etc.

**By Date:**
1. Go to Orders
2. Filter by date range
3. Or look at "created_at" column

### Viewing Order Details

1. Go to Orders
2. Click on order row
3. You'll see:
   - **Customer Info:** Name, phone, email
   - **Order Items:** What they ordered and quantities
   - **Pricing Breakdown:**
     - Subtotal (service × qty)
     - Pickup fee: $2.00
     - Service fee: 8% of subtotal
     - Tax: 8.875%
     - Total
   - **Status Timeline:** All status changes with timestamps
   - **Assigned Resources:**
     - Driver (if assigned)
     - Laundromat (if assigned)
   - **Payment Info:** Payment method, Stripe ID

### Updating Order Status

**When NOT to Update:**
- Drivers and laundromats can update their own stages
- Don't override driver/laundromat updates
- Only update if there's a system error

**When to Update:**
- Order stuck in a status for hours
- System error (status not updating)
- Manual dispatch or cancel

**How to Update:**
1. Open order detail
2. Find Status dropdown
3. Select new status
4. Click "Update"
5. Confirm

**Order Status Flow:**
- pending_payment → pending_dispatch → accepted → heading_to_pickup → arrived_at_pickup → picked_up → received → sorting → washing → drying → folding → quality_check → packed → ready_for_delivery → out_for_delivery → delivered

---

## Dispatch Operations

### Manual Dispatch Process

1. **Go to Dispatch Page**
   - Click "Dispatch" in menu
   - You'll see orders with status: pending_dispatch

2. **Review Order**
   - Customer name and phone
   - Order total
   - Items (count)
   - Pickup address

3. **Select Driver**
   - Click "Select Driver" dropdown
   - Choose driver:
     - Prefer drivers who are "online" and available
     - Prefer drivers close to pickup address
     - Consider driver's current workload
   - Dropdown shows: Name and phone

4. **Select Laundromat**
   - Click "Select Laundromat" dropdown
   - Choose laundromat:
     - Usually the closest to pickup address
     - Consider laundromat capacity
     - Check if they're open/available
   - Dropdown shows: Name and address

5. **Dispatch**
   - Click "Dispatch" button
   - Success message: "Order XXXXX... dispatched successfully"
   - Order removed from queue
   - Driver and laundromat notified

### Redispatch (If Driver Cancels)

1. **Check Dispatch Queue Again**
   - Order returns to pending_dispatch
   - Appears back in queue

2. **Choose New Driver**
   - Select different driver
   - Try next available

3. **Dispatch Again**
   - Click Dispatch
   - Order assigned to new driver

---

## SLA Management

### What is SLA?

SLA = Service Level Agreement. Each order has a deadline to be delivered by.

### Checking SLA Status

1. **Go to SLA Page**
   - Click "SLA" in menu
   - You'll see all non-delivered orders

2. **Status Indicators**
   - 🟢 **Safe** — On track, plenty of time
   - 🟡 **At Risk** — Getting close to deadline
   - 🔴 **Breached** — Deadline has passed

3. **View Order**
   - Click order
   - See deadline time
   - See current status
   - See reason for delay (if noted)

### Handling Breached Orders

1. **Identify Breach**
   - Go to SLA
   - Look for red orders

2. **Contact Resources**
   - Call/message driver
   - Contact laundromat
   - Find out status

3. **Escalate if Needed**
   - If significantly delayed: escalate to manager
   - Document issue

4. **Consider Refund**
   - Partial refund for inconvenience
   - Full refund if cancelled
   - See Refund section below

---

## Support Ticket Management

### Viewing Tickets

1. **Go to Support**
   - Click "Support" in menu
   - You'll see all tickets

2. **Ticket Info**
   - Ticket ID
   - Customer name
   - Subject
   - Status: open or resolved
   - Created date

3. **View Details**
   - Click ticket
   - See full message
   - See associated order (if any)
   - See ticket status

### Responding to Tickets

1. **Open Ticket**
   - Click on ticket detail

2. **Review Issue**
   - Read customer message
   - Check order details (if linked)
   - Determine solution

3. **Update Status**
   - Click "Update Status" or similar
   - Change to "resolved" if done
   - Add resolution note

4. **Common Issues**
   - Missing pickup: Check driver location
   - Late delivery: Check SLA monitor
   - Payment issue: Check payment status
   - Quality issue: Offer refund or re-wash

---

## Refund Management

### When to Issue Refund

- Customer requests cancellation
- SLA breach (late delivery)
- Quality issue (customer unsatisfied)
- Payment error
- System issue

### How to Issue Refund

1. **Go to Order**
   - Find order in Orders list
   - Click to open detail

2. **Scroll to Refund Section**
   - Look for "Refund" or "Issue Refund" area
   - May be near bottom of page

3. **Click "Create Refund"**
   - Dialog opens

4. **Enter Details**
   - **Amount:** Full or partial
     - Full refund: Enter order total
     - Partial: Enter amount (e.g., 10.00)
   - **Reason:** Why refunding
     - SLA breach
     - Quality issue
     - Customer request
     - Payment error

5. **Submit**
   - Click "Create Refund"
   - Refund record saved
   - Success message shown

6. **Process with Stripe** (Manual Step)
   - Refund record created in database
   - You must also process in Stripe dashboard
   - Find the Stripe PaymentIntent ID in order
   - Issue refund from Stripe

### Refund Status

After refund:
- Order status may be: refunded
- Payment status: refunded
- Customer sees refund in wallet or bank account (3-5 business days)

---

## Pricing Management

### View Current Pricing

1. **Go to Settings**
   - Click "Settings" in menu

2. **Services Section**
   - See all services:
     - Wash & Fold
     - Dry Clean
     - Specialty items
     - Any custom services

3. **Service Details**
   - Name
   - Current price
   - Unit (lbs, garments, etc.)
   - Active status (yes/no)

### Update Service Price

1. **Select Service**
   - Go to Settings
   - Find service

2. **Click Edit**
   - Price field becomes editable
   - Enter new price
   - E.g., 3.50 per lb

3. **Save**
   - Click "Save" button
   - Changes take effect immediately
   - New orders use new price
   - Existing orders keep old price

### Create New Service

1. **Go to Settings**
   - Click "Settings"

2. **Click "Add Service"**
   - Dialog opens

3. **Enter Details**
   - **Name:** Service name (e.g., "Express Wash")
   - **Price:** Price (e.g., 4.99 per lb)
   - **Unit:** Unit type (lbs, garments, etc.)
   - **Active:** Yes/No

4. **Save**
   - Click "Create"
   - Service available to customers immediately

### Deactivate Service

1. **Go to Settings**
   - Click service

2. **Toggle Active**
   - Turn off "Active"

3. **Save**
   - Service no longer offered to customers
   - Existing orders keep service

### Delete Service

⚠️ **Best Practice:** Deactivate instead of deleting. Deleting can break past orders.

---

## Finance & Reporting

### Understanding Metrics

1. **Today Revenue**
   - Sum of all orders with payment_status = paid and created today
   - Excludes unpaid and refunded orders

2. **Orders Today**
   - Count of orders created today
   - Includes all statuses

3. **Average Order Value**
   - Total revenue today ÷ Paid orders today
   - Shows typical order size

4. **Paid Orders**
   - Count of all orders with payment_status = paid
   - All-time, not just today

5. **Refunded Orders**
   - Count of orders refunded
   - All-time

### Viewing Order Details

1. **Go to Finance**
   - Latest Orders table at bottom
   - Shows recent orders

2. **Click Order ID**
   - Opens full order detail
   - See payment info
   - See pricing breakdown

### Exporting Reports

⚠️ **Currently:** Manual export from Supabase dashboard

Future phases may include:
- CSV export
- PDF reports
- Automated email summaries

---

## Troubleshooting Operations Issues

### Order Stuck in Status

**Problem:** Order shows same status for hours

**Solution:**
1. Check driver/laundromat is online
2. Contact driver/laundromat
3. If app crashed: Check device
4. If network issue: Wait and retry
5. If persistent: Manually update status (with caution)

### Driver Not Accepting Orders

**Problem:** Dispatch queue grows, driver doesn't update

**Solution:**
1. Check driver's phone
2. Verify driver is "online"
3. Contact driver directly
4. Check driver app for errors
5. Reassign to different driver

### Laundromat Not Receiving Order

**Problem:** Order assigned to laundromat, but no updates

**Solution:**
1. Contact laundromat staff
2. Check laundromat dashboard online
3. Verify order appears in their queue
4. Check for system notifications
5. Escalate if order sitting too long

### Payment Failed

**Problem:** Order shows unpaid even after customer tried payment

**Solution:**
1. Check Stripe dashboard
2. See if card was declined
3. Contact customer
4. Ask to retry with different card
5. If Stripe issue: Create refund, retry payment

---

## Security Reminders

1. **Never share logins** — Each admin needs own account
2. **Log out when away** — Don't leave dashboard open
3. **Don't modify database directly** — Use UI only
4. **Report suspicious activity** — Fraud or unusual orders
5. **Keep Stripe keys secret** — Never share with unauthorized users

---

## Quick Reference: Key Pages

| Page | What to Do |
|------|-----------|
| **Orders** | Find and view all orders |
| **Dispatch** | Assign drivers and laundromats |
| **Finance** | View revenue and metrics |
| **Settings** | Manage services and pricing |
| **SLA** | Monitor deadlines |
| **Support** | Handle customer tickets |

---

## Getting Help

If you need help:
1. Check this guide
2. Check **TROUBLESHOOTING.md**
3. Check **CLIENT_HANDOFF.md** for general info
4. Contact development team
