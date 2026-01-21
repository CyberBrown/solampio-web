-- Add warehouses table and multi-warehouse stock tracking
-- Enables ship-from-nearest-warehouse functionality

-- Warehouses table - synced from ERPNext Warehouse doctype
CREATE TABLE IF NOT EXISTS warehouses (
  id TEXT PRIMARY KEY,
  erpnext_name TEXT UNIQUE NOT NULL,  -- ERPNext warehouse name (e.g., "Acton - S")
  display_name TEXT NOT NULL,          -- Friendly name (e.g., "Acton, MA Warehouse")

  -- Address fields for shipping origin
  street1 TEXT,
  street2 TEXT,
  city TEXT,
  state TEXT,                          -- 2-letter state code
  zip TEXT,                            -- ZIP code for shipping calculations
  country TEXT DEFAULT 'US',

  -- Geolocation for distance calculations
  latitude REAL,
  longitude REAL,

  -- Warehouse settings
  is_active INTEGER DEFAULT 1,         -- Can ship from this warehouse
  is_pickup_location INTEGER DEFAULT 0, -- Available for customer pickup

  -- Sync metadata
  sync_source TEXT DEFAULT 'erpnext',
  last_synced_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Index for active warehouses
CREATE INDEX IF NOT EXISTS idx_warehouses_active ON warehouses(is_active);
CREATE INDEX IF NOT EXISTS idx_warehouses_zip ON warehouses(zip);

-- Product warehouse stock - tracks inventory per product per warehouse
-- Synced from ERPNext Bin doctype or Stock Ledger
CREATE TABLE IF NOT EXISTS product_warehouse_stock (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  warehouse_id TEXT NOT NULL,

  -- Stock quantities
  qty_available REAL DEFAULT 0,        -- Available to sell
  qty_reserved REAL DEFAULT 0,         -- Reserved for orders
  qty_on_hand REAL DEFAULT 0,          -- Physical stock on hand

  -- Reorder settings (optional, from ERPNext)
  reorder_level REAL,
  reorder_qty REAL,

  -- Sync metadata
  last_synced_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  -- Foreign keys
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE,

  -- Unique constraint: one stock record per product per warehouse
  UNIQUE(product_id, warehouse_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_pws_product ON product_warehouse_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_pws_warehouse ON product_warehouse_stock(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_pws_qty ON product_warehouse_stock(qty_available);

-- Add default_warehouse_id to products table (optional, for quick lookup)
ALTER TABLE products ADD COLUMN default_warehouse_id TEXT REFERENCES warehouses(id);
