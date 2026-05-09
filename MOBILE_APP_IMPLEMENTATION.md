# Customer & Driver Mobile App Implementation Guide

## Architecture Overview

### Tech Stack (Established)
- **Framework**: Expo SDK 50+ with React Native
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand for app state
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: Supabase Auth JWT
- **Theme Support**: Light/Dark mode via useColorScheme hook
- **Icons**: Lucide + Expo icons
- **Payments**: @stripe/stripe-react-native
- **Maps**: react-native-maps
- **Location**: expo-location (background in driver app)

---

## Customer App Screens (apps/customer-app/app/)

### Authentication Screens
**Location**: `(auth)/login.tsx`, `(auth)/signup.tsx`

```typescript
// Key Features:
- Email/password authentication via Supabase
- Form validation with Zod
- Dark/light theme support
- OAuth options (Google, Apple)
- Password reset flow
- Error boundary with user feedback
- Loading states during auth

// Pattern:
1. Get Supabase session
2. Redirect authenticated to (app)
3. Form with TextInput components
4. Show errors inline
5. Handle network/auth errors gracefully
```

### Main App (Auth Guard + Navigation)
**Location**: `(app)/_layout.tsx`

```typescript
// Key Features:
- Tabs navigation: Home, Orders, Wallet, Profile
- Dynamic title based on active route
- Header with notifications icon
- Dark mode toggle in header
- Role-based screen visibility

// Structure:
- (app)/home.tsx - Dashboard with active orders
- (app)/orders.tsx - Order history list
- (app)/wallet.tsx - Balance & transaction history
- (app)/profile.tsx - User profile & settings
```

### Home Screen
**Location**: `(app)/home.tsx`

```typescript
// Key Components:
1. Header (Welcome message, name from profile)
2. Wallet balance card with "Add Funds" link
3. Active order card (if exists)
   - Status badge (color-coded)
   - Quick track button
   - ETA countdown
4. Quick action buttons
   - New Order → create-order
   - My Orders → orders list
   - Support → support
5. Promo banner
6. Features highlight (24HRS, FREE delivery, PREMIUM care)

// Data Fetching:
- useQuery for user profile
- useQuery for active orders (status: pending|processing|on-delivery)
- useQuery for wallet balance
- Cache: 5 min default

// Theme: Full dark mode support via useColorScheme()
```

### Create Order Screen
**Location**: `create-order.jsx`

```typescript
// Workflow:
1. Service selection (radio buttons)
   - Wash & Fold ($25)
   - Dry Cleaning ($35)
   - Iron & Press ($15)
   - Delicate Wash ($45)

2. Item selection (counter inputs)
   - Shirts, Pants, Sweaters, Underwear
   - Each has +/- buttons

3. Pickup date/time
   - Date picker
   - Time slot selector

4. Special instructions (textarea)
   - Character limit: 500

5. Address selection
   - Default address pre-selected
   - Link to manage addresses

6. Summary & checkout
   - Item breakdown
   - Service fee
   - Total price
   - Payment method selector

7. Confirm & create order
   - POST /api/orders
   - Show success + navigate to tracking

// Validation:
- Service: required
- Items: at least 1
- Date/time: must be in future
- Address: must be selected

// Error Handling:
- Network errors → retry toast
- Validation → inline field errors
- Server errors → alert modal
```

### Order Tracking Screen
**Location**: `tracking.jsx`

```typescript
// Features:
1. Order header
   - Order ID
   - Status badge (color-coded)
   - 24hr countdown timer

2. Timeline view
   - Pending → Accepted → Processing → On Delivery → Delivered
   - Completed steps highlighted
   - Current step highlighted
   - Timestamps for completed steps

3. Driver card (if assigned)
   - Driver name & rating
   - Driver avatar
   - Call/message buttons
   - "Report issue" button

4. Live map (if on-delivery)
   - Current driver location
   - Delivery destination
   - Real-time updates via Socket.io

5. Action buttons
   - If processing: "Cancel order" (if within 1hr)
   - If on-delivery: "Contact driver"
   - If delivered: "Rate service"

6. Order details panel
   - Items summary
   - Service type
   - Pickup/delivery times
   - Address

// Real-time Updates:
- Socket.io event: 'order:status:updated'
- Socket.io event: 'driver:location:updated'
- Auto-refresh on focus

// Estimated delivery:
- Created at + 24 hrs = deadline
- Show countdown timer
- Color changes: green → yellow → red (last 2 hours)
```

### Orders List Screen
**Location**: `orders.tsx`

```typescript
// Features:
1. Filter tabs
   - All | Active | Completed | Cancelled

2. Order cards (each is a link to tracking)
   - Order ID
   - Service type
   - Status badge
   - Total price
   - Created date
   - Right arrow indicator

3. Empty states
   - "No orders yet" with "Create order" button
   - "No completed orders"

4. Pull-to-refresh
   - Refetch from server

5. Infinite scroll
   - Load more as user scrolls

// Data Fetching:
- useInfiniteQuery for pagination
- Filter by status parameter
- Sort by created_at DESC
- Cache: 2 min
```

### Wallet Screen
**Location**: `wallet.jsx`

```typescript
// Features:
1. Balance card (prominent)
   - Current balance
   - "Add Funds" button (→ payment modal)
   - "Withdraw" button (→ withdrawal modal)

2. Transaction history
   - List of wallet_transactions
   - Type badge (payment, refund, topup, payout)
   - Date
   - Amount (green for credit, red for debit)
   - Reference (order ID)
   - Clickable for details

3. Transaction details modal
   - Full transaction info
   - Metadata (order details if applicable)
   - Timestamp
   - Transaction ID

4. Add funds flow
   - Amount input
   - Stripe payment form
   - Success/error handling
   - Auto-add to wallet on success

5. Transaction filtering
   - Filter by type
   - Filter by date range

// Data Fetching:
- useQuery for wallet balance
- useInfiniteQuery for transactions
- Real-time updates via Socket.io

// Payment Integration:
- Use @stripe/stripe-react-native
- Handle in payment.jsx as sub-screen
```

### Support Screen
**Location**: `support.jsx`

```typescript
// Features:
1. Support options
   - Chat with support team
   - View existing tickets
   - FAQ section

2. Create ticket flow
   - Category selector
   - Subject input
   - Description textarea
   - Attachment upload (images)
   - Priority selector

3. Ticket list
   - Status badge
   - Subject
   - Last updated date
   - Click to open conversation

4. Ticket detail & chat
   - Thread view (messages + responses)
   - New message input
   - Image support
   - Real-time updates via Socket.io

5. Ticket resolution
   - Mark resolved button
   - Satisfaction rating
   - Optional feedback text

// Real-time:
- Socket.io event: 'support:message:new'
- Push notification on staff response
```

### Profile Screen
**Location**: `profile.tsx`

```typescript
// Features:
1. Profile header
   - User avatar/initials
   - Full name
   - Email

2. Stats section
   - Total orders
   - Total spent
   - Member since date
   - Average rating (if enabled)

3. Preferences
   - Dark mode toggle
   - Notification settings
   - Push notifications enable/disable
   - Email preferences

4. Addresses
   - List of saved addresses
   - Add new address
   - Edit address
   - Delete address
   - Set default

5. Account section
   - Edit profile button
   - Change password link
   - Data export (GDPR)
   - Delete account (with warning)

6. Settings
   - About app (version)
   - Terms & conditions link
   - Privacy policy link
   - Contact us

7. Logout button
   - Confirm logout
   - Clear local cache

// Data Fetching:
- useQuery for profile
- useQuery for addresses
- useQuery for stats
```

---

## Driver App Screens (apps/driver-app/app/)

### Authentication
**Location**: `login.jsx`

```typescript
// Features:
- Phone number authentication (Supabase Auth)
- OTP verification flow
- "Remember me" option
- Driver-specific validation (must be registered)

// On success:
- Store auth token locally
- Request location permissions
- Navigate to (app)
```

### Main App Navigation
**Location**: `(app)/_layout.tsx`

```typescript
// Tabs:
- Go Online (main screen)
- Active Order (if exists, else home)
- Earnings
- Profile
```

### Go Online / Idle Screen
**Location**: `go-online.jsx`

```typescript
// Features:
1. Toggle button (big, prominent)
   - Shows current status: Online | Offline
   - Location permission check before enabling
   - Countdown timer if throttled

2. Stats while online
   - Current rating (if enabled)
   - Total earnings today
   - Orders completed today
   - Next tier bonus (if applicable)

3. Location permissions
   - Request on first toggle
   - Show why: "Real-time delivery tracking"
   - Fallback if denied

4. Background location
   - Start background location tracking
   - Check location every 30 seconds
   - Stop when going offline

5. Available orders section
   - List of available orders (if online)
   - Order card: location, items, pay, distance
   - Accept/reject buttons
   - Auto-accept toggle (if enabled)

// Real-time:
- Socket.io: Listen for new order dispatches
- Update available orders list dynamically
- Show notification for new orders

// Background Location:
- Use expo-location with background task
- Update driver location every 30 seconds
- Socket.io emit: 'driver:location:update'
- Only while on active order OR explicitly online
```

### Active Order Screen
**Location**: `active-order.jsx`

```typescript
// Features:
1. Order overview
   - Order ID
   - Customer name
   - Pickup address
   - Delivery address
   - Items summary
   - Estimated pay

2. Navigation map
   - Current driver location
   - Next destination (pickup or delivery)
   - Route visualization
   - Distance to destination
   - ETA countdown

3. Action buttons
   - "Pickup loaded" (at location) → navigate to delivery
   - "Delivered" (at destination) → confirm delivery
   - "Report issue" → contact support
   - "Cancel order" (within certain conditions)

4. Customer info card
   - Customer name
   - Phone number with call button
   - Special instructions

5. Delivery checklist
   - Items to deliver (checkboxes)
   - Photos at delivery (optional/required)
   - Signature (if required)
   - Delivery notes

// Geofencing:
- Detect arrival at pickup/delivery locations
- Auto-prompt for action when at location
- Distance-based notifications

// Real-time:
- Socket.io: Order status updates
- Location broadcast to customer every 30 sec
- Listen for customer messages
```

### Earnings Screen
**Location**: `earnings.jsx`

```typescript
// Features:
1. Earnings summary
   - Total today
   - This week
   - This month
   - Lifetime

2. Per-order breakdown
   - Order ID
   - Date
   - Amount earned
   - Payment status (pending, paid)

3. Filters
   - By date range
   - By status (completed, pending, canceled)

4. Charts
   - Daily earnings trend (bar chart)
   - Payment history timeline

5. Payout info
   - Next payout date
   - Total pending
   - Historical payouts
   - Payout method

// Data Fetching:
- useQuery for earnings summary
- useInfiniteQuery for order breakdown
- Real-time: Socket.io for new completed orders
```

### Profile Screen
**Location**: `profile.tsx`

```typescript
// Features:
1. Driver info
   - Name & phone
   - Vehicle info (if driver owns vehicle)
   - License/insurance (expiration dates)
   - Rating & review count

2. Settings
   - Notification preferences
   - Auto-accept threshold
   - Preferred zones (if applicable)

3. Documents
   - View uploaded documents
   - License expiration warning
   - Insurance expiration warning

4. Account
   - Bank info for payouts
   - Edit profile
   - Change phone number
   - Password/security

5. Help & Support
   - Contact support
   - FAQ
   - Report issue

6. Logout
```

---

## Shared Patterns & Utilities

### useAuthStore (Zustand)
```typescript
// State:
- user: User | null
- isAuthenticated: boolean
- loading: boolean

// Actions:
- login(email, password)
- signup(email, password)
- logout()
- updateProfile(data)
```

### useLocationStore (Zustand)
```typescript
// State (Driver Only):
- currentLocation: { lat, lng }
- isTracking: boolean

// Actions:
- startTracking()
- stopTracking()
- updateLocation(lat, lng)
```

### API Hooks
```typescript
// useCreateOrder(data)
// useGetOrders(filters)
// useGetOrderDetails(orderId)
// useUpdateOrderStatus(orderId, status)
// useGetTransactions(wallet_id)
// useCreateTransaction(data)
// useCreateSupportTicket(data)
// useGetSupportTickets()
```

### Error Handling Pattern
```typescript
try {
  // API call
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 404) {
    // Show "not found"
  } else if (error.status === 422) {
    // Show validation errors
  } else {
    // Show generic error alert
  }
}
```

### Loading States
```typescript
- isLoading: Show ActivityIndicator overlay
- isPending: Show disabled state on buttons
- error: Show AlertDialog or inline error message
```

### Dark Mode Pattern
```typescript
const { colorScheme } = useColorScheme();
// Use conditional class names:
// className={`${dark ? 'bg-slate-900' : 'bg-white'}`}
```

### Real-time Patterns (Socket.io)
```typescript
// Connection setup in root layout
useEffect(() => {
  const socket = io(API_URL);
  
  socket.on('connect', () => console.log('connected'));
  socket.on('disconnect', () => console.log('disconnected'));
  
  // Store in context or store
  setSocket(socket);
  
  return () => socket.disconnect();
}, []);

// In components:
useEffect(() => {
  socket?.on('order:updated', (data) => {
    queryClient.invalidateQueries(['order', data.id]);
  });
}, []);
```

---

## Testing Checklist

- [ ] Auth flows (login, signup, logout)
- [ ] Order creation (select service → items → date → checkout)
- [ ] Order tracking (real-time updates, map)
- [ ] Wallet operations (view balance, add funds, history)
- [ ] Support tickets (create, message, resolve)
- [ ] Driver go-online flow (permissions, tracking)
- [ ] Active order (pickup → delivery workflow)
- [ ] Dark/light theme switching
- [ ] Offline handling
- [ ] Error states
- [ ] Loading states
- [ ] Rate limiting (429 responses)
- [ ] Push notifications

---

## Environment Variables

```env
# Shared
SUPABASE_URL=
SUPABASE_ANON_KEY=
API_BASE_URL=http://localhost:3001

# Payments
STRIPE_PUBLISHABLE_KEY=

# Expo
EXPO_ACCESS_TOKEN=
```

---

## Key Implementation Notes

1. **Always use NativeWind**: Never use inline styles or StyleSheet
2. **Always include dark mode**: Use `useColorScheme()` or `dark:` classes
3. **Always validate**: Use Zod for all user input
4. **Always handle errors**: Try-catch + user feedback
5. **Always show loading**: Loading indicators during async operations
6. **Always use TypeScript**: Strict mode on
7. **Always test**: Implement unit tests for hooks/utils
8. **Always cache**: Use React Query defaults (5 min)
9. **Always track**: Send analytics events for key flows
10. **Always monitor**: Log errors to error tracking service

---

## Performance Targets

| Metric | Target |
|--------|--------|
| App Startup | <3s |
| Screen Transition | <500ms |
| Order Creation | <2s |
| Tracking Updates | <1s (real-time) |
| API Response | <500ms |
| Image Load | <1s |

---

## Security Checklist

- [ ] Never store tokens in AsyncStorage (use secure storage)
- [ ] Always validate on backend
- [ ] Never expose service role keys
- [ ] Use HTTPS only
- [ ] Implement rate limiting on client
- [ ] Validate location data on backend
- [ ] Sanitize user input
- [ ] Use RLS on all database queries
- [ ] Implement refresh token rotation
- [ ] Add certificate pinning for API calls
