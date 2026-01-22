-- Create FTS5 virtual table for product search
-- FTS5 enables fast full-text search with prefix matching for autocomplete

-- Create the FTS5 virtual table
-- Note: D1 supports FTS5 for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  title,
  description,
  sku,
  item_group,
  content='storefront_products',
  content_rowid='rowid'
);

-- Populate FTS from existing products
INSERT INTO products_fts(rowid, title, description, sku, item_group)
SELECT rowid, title, description, sku, item_group
FROM storefront_products
WHERE is_visible = 1;

-- Triggers to keep FTS index in sync with products table
-- Note: These triggers maintain FTS consistency when products are modified

-- After INSERT: Add new product to FTS
CREATE TRIGGER IF NOT EXISTS products_fts_ai AFTER INSERT ON storefront_products
WHEN NEW.is_visible = 1
BEGIN
  INSERT INTO products_fts(rowid, title, description, sku, item_group)
  VALUES (NEW.rowid, NEW.title, NEW.description, NEW.sku, NEW.item_group);
END;

-- After DELETE: Remove product from FTS
CREATE TRIGGER IF NOT EXISTS products_fts_ad AFTER DELETE ON storefront_products BEGIN
  INSERT INTO products_fts(products_fts, rowid, title, description, sku, item_group)
  VALUES('delete', OLD.rowid, OLD.title, OLD.description, OLD.sku, OLD.item_group);
END;

-- After UPDATE: Update FTS entry (delete + re-insert)
CREATE TRIGGER IF NOT EXISTS products_fts_au AFTER UPDATE ON storefront_products BEGIN
  -- Remove old entry
  INSERT INTO products_fts(products_fts, rowid, title, description, sku, item_group)
  VALUES('delete', OLD.rowid, OLD.title, OLD.description, OLD.sku, OLD.item_group);
  -- Add new entry if visible
  INSERT INTO products_fts(rowid, title, description, sku, item_group)
  SELECT NEW.rowid, NEW.title, NEW.description, NEW.sku, NEW.item_group
  WHERE NEW.is_visible = 1;
END;
