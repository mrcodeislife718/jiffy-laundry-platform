-- Production Database Schema for JiffyLaundry
-- Comprehensive realtime logistics platform

-- Profiles (Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('customer', 'driver', 'laundromat_operator', 'admin')) DEFAULT 'customer',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  label TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Laundromats / Facilities
CREATE TABLE IF NOT EXISTS laundromats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address_id UUID REFERENCES addresses(id),
  phone TEXT,
  manager_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  capacity INT DEFAULT 0,
  current_load INT DEFAULT 0,
  features JSONB DEFAULT '{}',
  operating_hours JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('per_pound', 'per_item', 'per_wash', 'per_dry', 'flat_rate')),
  category TEXT,
  icon_url TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  driver_id UUID REFERENCES profiles(id),
  laundromat_id UUID REFERENCES laundromats(id),
  pickup_address_id UUID REFERENCES addresses(id),
  delivery_address_id UUID REFERENCES addresses(id),
  status TEXT DEFAULT 'pending_payment' CHECK (
    status IN (
      'pending_payment', 'pending_dispatch', 'accepted', 'heading_to_pickup',
      'arrived_at_pickup', 'picked_up', 'received', 'sorting', 'washing',
      'drying', 'folding', 'quality_check', 'packed', 'ready_for_delivery',
      'out_for_delivery', 'delivered', 'cancelled', 'refunded'
    )
  ),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed')),
  
  -- Pricing
  subtotal DECIMAL(10, 2) DEFAULT 0,
  pickup_fee DECIMAL(10, 2) DEFAULT 2.0,
  service_fee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  tip DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  
  -- SLA & Timing
  sla_deadline TIMESTAMP,
  scheduled_pickup_time TIMESTAMP,
  actual_pickup_time TIMESTAMP,
  delivered_at TIMESTAMP,
  
  -- Payment
  stripe_payment_intent_id TEXT,
  payment_method TEXT,
  
  -- Special requests
  special_requests TEXT,
  tags JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Order Items (what's in each order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  quantity DECIMAL(10, 2),
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Driver Locations (realtime tracking)
CREATE TABLE IF NOT EXISTS driver_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  heading DECIMAL(5, 2),
  speed DECIMAL(5, 2),
  accuracy DECIMAL(5, 2),
  timestamp TIMESTAMP DEFAULT now()
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  frozen_balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('topup', 'withdrawal', 'payment', 'refund', 'earning', 'promotion')),
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2),
  balance_after DECIMAL(10, 2),
  reference TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  resolution TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP
);

-- Subscriptions (for recurring services)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  plan_name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  billing_cycle TEXT CHECK (billing_cycle IN ('weekly', 'biweekly', 'monthly')),
  amount DECIMAL(10, 2),
  next_billing_date TIMESTAMP,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  cancelled_at TIMESTAMP
);

-- Audit Logs (for compliance & monitoring)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  user_role TEXT,
  action TEXT,
  method TEXT,
  path TEXT,
  status_code INT,
  body_preview TEXT,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT now()
);

-- Promotions / Coupons
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2),
  max_uses INT,
  uses_count INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  valid_from TIMESTAMP DEFAULT now(),
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Promo Usage Tracking
CREATE TABLE IF NOT EXISTS promotion_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  order_id UUID REFERENCES orders(id),
  discount_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT now()
);

-- Analytics Events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  event_name TEXT NOT NULL,
  event_properties JSONB,
  timestamp TIMESTAMP DEFAULT now()
);

-- Create Indexes for Performance
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX idx_driver_locations_order_id ON driver_locations(order_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, read);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_support_tickets_customer_id ON support_tickets(customer_id);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can view their own profile and admins can view all
CREATE POLICY profiles_select ON profiles
  FOR SELECT USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Addresses: Users can view their own
CREATE POLICY addresses_select ON addresses
  FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Orders: Customers see their own, drivers see assigned, admins see all
CREATE POLICY orders_select ON orders
  FOR SELECT USING (
    customer_id = auth.uid() 
    OR driver_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'laundromat_operator'
  );

-- Wallets: Users see their own
CREATE POLICY wallets_select ON wallets
  FOR SELECT USING (user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Notifications: Users see their own
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Support Tickets: Customers see their own, admins see all
CREATE POLICY support_tickets_select ON support_tickets
  FOR SELECT USING (
    customer_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR assigned_to = auth.uid()
  );
