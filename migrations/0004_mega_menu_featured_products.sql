-- Migration: Mega Menu Featured Products & Category Images
-- Adds fields for featured product display and brand-category relationships

-- ============================================================================
-- 1. Products: Add featured_in_subcategory_id for subcategory-specific featuring
-- ============================================================================
-- Note: is_featured and featured_category_id already exist in storefront_products

ALTER TABLE storefront_products
ADD COLUMN featured_in_subcategory_id TEXT REFERENCES storefront_categories(id);

-- ============================================================================
-- 2. Categories: Add cf_category_image_url for direct Cloudflare URL storage
-- ============================================================================
-- This allows ERPNext staff to edit the URL directly
-- cf_image_id is the Cloudflare Image ID (short form), cf_category_image_url is the full URL

ALTER TABLE storefront_categories
ADD COLUMN cf_category_image_url TEXT;

-- ============================================================================
-- 3. Brands: Create brand_category_associations table for many-to-many relationships
-- ============================================================================

CREATE TABLE IF NOT EXISTS brand_category_associations (
  id TEXT PRIMARY KEY,
  brand_id TEXT NOT NULL REFERENCES storefront_brands(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES storefront_categories(id) ON DELETE CASCADE,
  association_type TEXT NOT NULL CHECK (association_type IN ('category', 'subcategory')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Ensure unique brand-category-type combinations
  UNIQUE(brand_id, category_id, association_type)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_brand_category_brand ON brand_category_associations(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_category_category ON brand_category_associations(category_id);
CREATE INDEX IF NOT EXISTS idx_brand_category_type ON brand_category_associations(association_type);

-- ============================================================================
-- 4. Create index on featured fields for faster mega menu queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_is_featured ON storefront_products(is_featured) WHERE is_featured = 1;
CREATE INDEX IF NOT EXISTS idx_products_featured_category ON storefront_products(featured_category_id) WHERE featured_category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_featured_subcategory ON storefront_products(featured_in_subcategory_id) WHERE featured_in_subcategory_id IS NOT NULL;
