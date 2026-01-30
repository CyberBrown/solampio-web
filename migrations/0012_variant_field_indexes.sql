-- Add indexes for variant fields to improve query performance
-- The has_variants and variant_of columns already exist in storefront_products
-- This migration adds indexes for efficient querying

-- Index for finding all template products (has_variants = 1)
CREATE INDEX IF NOT EXISTS idx_storefront_products_has_variants ON storefront_products(has_variants);

-- Index for finding variants by parent SKU
CREATE INDEX IF NOT EXISTS idx_storefront_products_variant_of ON storefront_products(variant_of);

-- Composite index for SEO optimization queries that target templates and standalone products
CREATE INDEX IF NOT EXISTS idx_storefront_products_seo_candidates ON storefront_products(is_visible, has_variants, variant_of, seo_last_optimized);
