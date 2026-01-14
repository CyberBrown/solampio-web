-- Migration: Populate storefront_products.categories from product_website_categories
-- This links products to their storefront categories via the BC category mapping chain.
--
-- Chain: product_sku -> bc_category_id -> erpnext_item_group -> storefront_categories.id
--
-- To run:
--   npx wrangler d1 execute solampio-migration --remote --file=migrations/0001_populate_product_categories.sql
--   npx wrangler d1 execute solampio-migration --local --file=migrations/0001_populate_product_categories.sql

-- Update products with their category IDs as JSON arrays
UPDATE storefront_products
SET categories = (
  SELECT json_group_array(sc.id)
  FROM product_website_categories pwc
  JOIN bc_category_mapping bcm ON pwc.bc_category_id = bcm.bc_category_id
  JOIN storefront_categories sc ON bcm.erpnext_item_group = sc.erpnext_name
  WHERE pwc.product_sku = storefront_products.sku
)
WHERE sku IN (
  SELECT DISTINCT product_sku FROM product_website_categories
);

-- Update category counts
UPDATE storefront_categories
SET count = (
  SELECT COUNT(DISTINCT sp.id)
  FROM storefront_products sp
  WHERE sp.categories IS NOT NULL
    AND sp.categories LIKE '%' || storefront_categories.id || '%'
    AND sp.is_visible = 1
);
