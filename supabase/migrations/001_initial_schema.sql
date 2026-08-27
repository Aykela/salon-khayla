-- =============================================
-- SISTEM INFORMASI BEAUTY SALON KHAYLA MAZAYA
-- Migration 001: Initial Schema
-- Jalankan file ini di Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABEL: roles
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB
);

-- Insert default roles
INSERT INTO roles (role_name, description, permissions) VALUES
  ('Manager', 'Akses penuh ke seluruh sistem', '{"all": true}'),
  ('Employee', 'Kelola kehadiran dan jadwal layanan', '{"attendance": true, "schedule": true, "service_execution": true}'),
  ('Customer', 'Reservasi layanan dan riwayat transaksi', '{"reservation": true, "payment": true, "history": true}')
ON CONFLICT (role_name) DO NOTHING;

-- =============================================
-- TABEL: users
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  role_id UUID REFERENCES roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: employee_profiles
-- =============================================
CREATE TABLE IF NOT EXISTS employee_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialization VARCHAR(100),
  skill_level VARCHAR(50),
  max_hours_per_day INTEGER DEFAULT 8,
  available_days JSONB DEFAULT '["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"]',
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: customer_profiles
-- =============================================
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender VARCHAR(20),
  total_transactions INTEGER DEFAULT 0,
  total_spent DECIMAL(15,2) DEFAULT 0,
  credit_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: services
-- =============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  base_price DECIMAL(15,2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: products
-- =============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name VARCHAR(100) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  is_premium BOOLEAN DEFAULT FALSE,
  price DECIMAL(15,2) NOT NULL,
  stock_volume DECIMAL(10,2) NOT NULL,
  min_stock_volume DECIMAL(10,2) NOT NULL,
  allocated_stock DECIMAL(10,2) DEFAULT 0,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: service_products
-- =============================================
CREATE TABLE IF NOT EXISTS service_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  formula_volume_ml DECIMAL(10,2) NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  can_be_replaced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: suppliers
-- =============================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: reservations
-- =============================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customer_profiles(id),
  employee_id UUID REFERENCES employee_profiles(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_duration INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'BOOKED',
  total_price DECIMAL(15,2) NOT NULL,
  notes TEXT,
  special_requests TEXT,
  booking_code VARCHAR(20) UNIQUE,
  barcode VARCHAR(100),
  confirmed_at TIMESTAMP,
  paid_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  payment_deadline TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: service_selections
-- =============================================
CREATE TABLE IF NOT EXISTS service_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  selected_product_id UUID REFERENCES products(id),
  price_at_booking DECIMAL(15,2) NOT NULL,
  product_price_at_booking DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: payments
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID UNIQUE REFERENCES reservations(id),
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'UNPAID',
  payment_proof VARCHAR(255),
  verification_status VARCHAR(50),
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  payment_date TIMESTAMP,
  refund_amount DECIMAL(15,2),
  refund_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: payment_verification_logs
-- =============================================
CREATE TABLE IF NOT EXISTS payment_verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id),
  status_before VARCHAR(50),
  status_after VARCHAR(50),
  action VARCHAR(50),
  notes TEXT,
  performed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: restock_logs
-- =============================================
CREATE TABLE IF NOT EXISTS restock_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  supplier_id UUID REFERENCES suppliers(id),
  quantity_added DECIMAL(10,2) NOT NULL,
  price_per_unit DECIMAL(15,2),
  total_price DECIMAL(15,2),
  invoice_number VARCHAR(100),
  notes TEXT,
  performed_by UUID REFERENCES users(id),
  restock_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: stock_out_logs
-- =============================================
CREATE TABLE IF NOT EXISTS stock_out_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  quantity_out DECIMAL(10,2) NOT NULL,
  reason VARCHAR(50) NOT NULL,
  notes TEXT,
  performed_by UUID REFERENCES users(id),
  out_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: product_usage
-- =============================================
CREATE TABLE IF NOT EXISTS product_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id),
  product_id UUID REFERENCES products(id),
  service_id UUID REFERENCES services(id),
  volume_used DECIMAL(10,2) NOT NULL,
  price_at_usage DECIMAL(15,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: attendance
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employee_profiles(id),
  date DATE NOT NULL,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: employee_schedules
-- =============================================
CREATE TABLE IF NOT EXISTS employee_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employee_profiles(id),
  day_of_week INTEGER NOT NULL,
  shift_start TIME,
  shift_end TIME,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: audit_logs
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL,
  table_name VARCHAR(50),
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABEL: business_hours
-- =============================================
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default business hours
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed, notes) VALUES
  (0, '10:00', '17:00', FALSE, 'Minggu'),
  (1, '09:00', '21:00', FALSE, 'Senin'),
  (2, '09:00', '21:00', FALSE, 'Selasa'),
  (3, '09:00', '21:00', FALSE, 'Rabu'),
  (4, '09:00', '21:00', FALSE, 'Kamis'),
  (5, '09:00', '21:00', FALSE, 'Jumat'),
  (6, '09:00', '21:00', FALSE, 'Sabtu')
ON CONFLICT DO NOTHING;

-- =============================================
-- TABEL: closed_dates
-- =============================================
CREATE TABLE IF NOT EXISTS closed_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- INDEXES untuk performa
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_reservations_booking_code ON reservations(booking_code);
CREATE INDEX IF NOT EXISTS idx_reservations_booking_date ON reservations(booking_date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_employee ON reservations(employee_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- =============================================
-- FUNCTION: Auto update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE OR REPLACE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION: Generate booking code
-- =============================================
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_code IS NULL THEN
    NEW.booking_code = 'KSK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT, 1, 6));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER set_booking_code BEFORE INSERT ON reservations FOR EACH ROW EXECUTE FUNCTION generate_booking_code();

-- =============================================
-- FUNCTION: Auto expire reservations
-- =============================================
CREATE OR REPLACE FUNCTION check_expired_reservations()
RETURNS void AS $$
BEGIN
  UPDATE reservations
  SET status = 'EXPIRED', updated_at = NOW()
  WHERE status = 'BOOKED'
    AND payment_deadline < NOW();

  UPDATE products p
  SET status = 'EXPIRED', is_active = FALSE, updated_at = NOW()
  WHERE expiry_date < CURRENT_DATE AND status = 'ACTIVE';
END;
$$ language 'plpgsql';
