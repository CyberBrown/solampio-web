-- Add seo_keywords to FTS5 search index
-- Drops and recreates the FTS5 virtual table and triggers to include seo_keywords column
-- FTS5's unicode61 tokenizer naturally strips JSON brackets/quotes from the stored JSON array

-- Drop existing triggers
DROP TRIGGER IF EXISTS products_fts_ai;
DROP TRIGGER IF EXISTS products_fts_au;
DROP TRIGGER IF EXISTS products_fts_ad;

-- Drop existing FTS table
DROP TABLE IF EXISTS products_fts;

-- Recreate with seo_keywords column
CREATE VIRTUAL TABLE products_fts USING fts5(
  title,
  description,
  sku,
  item_group,
  seo_keywords,
  content='storefront_products',
  content_rowid='rowid'
);

-- Repopulate from existing visible products
INSERT INTO products_fts(rowid, title, description, sku, item_group, seo_keywords)
SELECT rowid, title, description, sku, item_group, seo_keywords
FROM storefront_products
WHERE is_visible = 1;

-- After INSERT: Add new visible product to FTS
CREATE TRIGGER products_fts_ai AFTER INSERT ON storefront_products
WHEN NEW.is_visible = 1
BEGIN
  INSERT INTO products_fts(rowid, title, description, sku, item_group, seo_keywords)
  VALUES (NEW.rowid, NEW.title, NEW.description, NEW.sku, NEW.item_group, NEW.seo_keywords);
END;

-- After DELETE: Remove product from FTS
CREATE TRIGGER products_fts_ad AFTER DELETE ON storefront_products BEGIN
  INSERT INTO products_fts(products_fts, rowid, title, description, sku, item_group, seo_keywords)
  VALUES('delete', OLD.rowid, OLD.title, OLD.description, OLD.sku, OLD.item_group, OLD.seo_keywords);
END;

-- After UPDATE: Update FTS entry (delete old + re-insert if visible)
CREATE TRIGGER products_fts_au AFTER UPDATE ON storefront_products BEGIN
  INSERT INTO products_fts(products_fts, rowid, title, description, sku, item_group, seo_keywords)
  VALUES('delete', OLD.rowid, OLD.title, OLD.description, OLD.sku, OLD.item_group, OLD.seo_keywords);
  INSERT INTO products_fts(rowid, title, description, sku, item_group, seo_keywords)
  SELECT NEW.rowid, NEW.title, NEW.description, NEW.sku, NEW.item_group, NEW.seo_keywords
  WHERE NEW.is_visible = 1;
END;
