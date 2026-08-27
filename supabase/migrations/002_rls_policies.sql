-- =============================================
-- Migration 002: Row Level Security (RLS)
-- Jalankan SETELAH migration 001
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_out_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE closed_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES: users table
-- =============================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Manager can view all users" ON users;
CREATE POLICY "Manager can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

-- =============================================
-- POLICIES: services (public read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Manager can manage services" ON services;
CREATE POLICY "Manager can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

-- =============================================
-- POLICIES: products (public read for active)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = TRUE AND status = 'ACTIVE');

DROP POLICY IF EXISTS "Manager can manage products" ON products;
CREATE POLICY "Manager can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

-- =============================================
-- POLICIES: reservations
-- =============================================
DROP POLICY IF EXISTS "Customer can view own reservations" ON reservations;
CREATE POLICY "Customer can view own reservations" ON reservations
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customer_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customer can create reservation" ON reservations;
CREATE POLICY "Customer can create reservation" ON reservations
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM customer_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employee can view assigned reservations" ON reservations;
CREATE POLICY "Employee can view assigned reservations" ON reservations
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM employee_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Manager can manage all reservations" ON reservations;
CREATE POLICY "Manager can manage all reservations" ON reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

-- =============================================
-- POLICIES: payments
-- =============================================
DROP POLICY IF EXISTS "Customer can view own payment" ON payments;
CREATE POLICY "Customer can view own payment" ON payments
  FOR SELECT USING (
    reservation_id IN (
      SELECT r.id FROM reservations r
      JOIN customer_profiles cp ON r.customer_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Manager can manage payments" ON payments;
CREATE POLICY "Manager can manage payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

-- =============================================
-- POLICIES: business_hours & closed_dates (public read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view business hours" ON business_hours;
CREATE POLICY "Anyone can view business hours" ON business_hours
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Anyone can view closed dates" ON closed_dates;
CREATE POLICY "Anyone can view closed dates" ON closed_dates
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Manager can manage business hours" ON business_hours;
CREATE POLICY "Manager can manage business hours" ON business_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

DROP POLICY IF EXISTS "Manager can manage closed dates" ON closed_dates;
CREATE POLICY "Manager can manage closed dates" ON closed_dates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

-- =============================================
-- POLICIES: service_products (public read)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view service products" ON service_products;
CREATE POLICY "Anyone can view service products" ON service_products
  FOR SELECT USING (TRUE);

-- =============================================
-- POLICIES: attendance
-- =============================================
DROP POLICY IF EXISTS "Employee can manage own attendance" ON attendance;
CREATE POLICY "Employee can manage own attendance" ON attendance
  FOR ALL USING (
    employee_id IN (
      SELECT id FROM employee_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Manager can view all attendance" ON attendance;
CREATE POLICY "Manager can view all attendance" ON attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

-- =============================================
-- POLICIES: suppliers, restock_logs, stock_out_logs (Manager only)
-- =============================================
DROP POLICY IF EXISTS "Manager can manage suppliers" ON suppliers;
CREATE POLICY "Manager can manage suppliers" ON suppliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

DROP POLICY IF EXISTS "Manager can manage restock" ON restock_logs;
CREATE POLICY "Manager can manage restock" ON restock_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );

DROP POLICY IF EXISTS "Manager can manage stock out" ON stock_out_logs;
CREATE POLICY "Manager can manage stock out" ON stock_out_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = auth.uid() AND r.role_name = 'Manager'
    )
  );
