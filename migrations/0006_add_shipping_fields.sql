-- Add shipping dimension fields to products table
-- These fields support shipping rate calculation for USPS, UPS, and LTL carriers

-- Shipping dimensions (packaged/boxed dimensions for carrier rates)
ALTER TABLE products ADD COLUMN shipping_weight REAL;
ALTER TABLE products ADD COLUMN shipping_weight_uom TEXT DEFAULT 'lb';
ALTER TABLE products ADD COLUMN shipping_length REAL;
ALTER TABLE products ADD COLUMN shipping_width REAL;
ALTER TABLE products ADD COLUMN shipping_height REAL;
ALTER TABLE products ADD COLUMN shipping_dimension_uom TEXT DEFAULT 'in';

-- Shipping qualification flags (determine which carriers can handle item)
ALTER TABLE products ADD COLUMN ships_usps INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN ships_ups INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN ships_ltl INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN ships_pickup INTEGER DEFAULT 0;

-- Hazmat and oversized flags
ALTER TABLE products ADD COLUMN hazmat_flag INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN hazmat_class TEXT;
ALTER TABLE products ADD COLUMN oversized_flag INTEGER DEFAULT 0;

-- Variant inheritance flag
ALTER TABLE products ADD COLUMN inherit_shipping_from_parent INTEGER DEFAULT 0;
