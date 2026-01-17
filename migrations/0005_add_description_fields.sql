-- Migration: Add cleaned description and summary fields to storefront_products
-- Date: 2026-01-17
-- Description: Adds fields for cleaned descriptions and AI-generated summaries
--              to improve product page display and SEO.

-- Add description_clean column
-- Stores the cleaned/formatted description with HTML artifacts removed
ALTER TABLE storefront_products ADD COLUMN description_clean TEXT DEFAULT NULL;

-- Add description_summary column
-- Stores a short AI-generated summary (~500 chars) for product cards and quick overview
ALTER TABLE storefront_products ADD COLUMN description_summary TEXT DEFAULT NULL;

-- Create index for products that need description processing
-- (those with description but no cleaned version)
CREATE INDEX IF NOT EXISTS idx_products_needs_description_processing
ON storefront_products(description, description_clean)
WHERE description IS NOT NULL AND description_clean IS NULL;
