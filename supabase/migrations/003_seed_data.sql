-- =============================================
-- Migration 003: Seed Data
-- Data awal untuk testing
-- =============================================

-- Insert sample services
INSERT INTO services (service_name, description, duration_minutes, base_price, is_active) VALUES
  ('Haircut & Styling', 'Potong rambut dan styling sesuai keinginan', 60, 150000, TRUE),
  ('Hair Coloring', 'Pewarnaan rambut dengan bahan berkualitas', 120, 350000, TRUE),
  ('Hair Treatment', 'Perawatan intensif rambut dengan masker premium', 90, 250000, TRUE),
  ('Hair Rebonding', 'Pelurus rambut permanen dengan teknologi terkini', 180, 500000, TRUE),
  ('Creambath', 'Perawatan rambut creambath dengan pijat kepala', 60, 100000, TRUE),
  ('Keratin Treatment', 'Perawatan keratin untuk rambut halus dan bersinar', 120, 400000, TRUE)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (product_name, brand, category, is_premium, price, stock_volume, min_stock_volume, expiry_date, status) VALUES
  ('Argan Oil Hair Mask', 'Loreal', 'Hair Mask', FALSE, 50, 5000, 500, '2026-12-31', 'ACTIVE'),
  ('Keratin Complex Serum', 'Schwarzkopf', 'Serum', TRUE, 120, 3000, 300, '2026-10-31', 'ACTIVE'),
  ('Color Protect Shampoo', 'Wella', 'Shampoo', FALSE, 40, 8000, 800, '2027-06-30', 'ACTIVE'),
  ('Premium Hair Cream', 'Redken', 'Hair Cream', TRUE, 150, 2000, 200, '2026-08-31', 'ACTIVE'),
  ('Moisture Balance Conditioner', 'Loreal', 'Conditioner', FALSE, 45, 6000, 600, '2027-03-31', 'ACTIVE'),
  ('Bonding Oil Treatment', 'Olaplex', 'Treatment Oil', TRUE, 200, 1500, 150, '2026-11-30', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Insert sample supplier
INSERT INTO suppliers (supplier_name, contact_person, phone_number, email, address) VALUES
  ('PT Kecantikan Sejahtera', 'Budi Santoso', '08123456789', 'budi@kecantikan.co.id', 'Jl. Raya Salon No. 10, Jakarta'),
  ('CV Produk Prima', 'Sari Dewi', '08987654321', 'sari@produkprima.com', 'Jl. Industri No. 25, Bandung')
ON CONFLICT DO NOTHING;
