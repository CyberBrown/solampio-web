-- Migration: Add stock status fields to storefront_products
-- Date: 2026-01-17
-- Description: Adds low_stock_threshold and show_stock_status columns for
--              controlling stock status display on the storefront.

-- Add low_stock_threshold column
-- This is the quantity at which "Low Stock" status displays
-- NULL means no low stock threshold (only show Out of Stock when qty = 0)
ALTER TABLE storefront_products ADD COLUMN low_stock_threshold INTEGER DEFAULT NULL;

-- Add show_stock_status column
-- 0 = don't show stock status (default)
-- 1 = show stock status (Out of Stock, Low Stock, In Stock)
ALTER TABLE storefront_products ADD COLUMN show_stock_status INTEGER DEFAULT 0 NOT NULL;

-- Create index for efficient filtering by stock status display
CREATE INDEX IF NOT EXISTS idx_products_show_stock_status ON storefront_products(show_stock_status);
