-- Populate storefront_products.categories from product_website_categories
-- This joins on category_name to get the D1 category IDs

-- First, create a temp table with product SKU -> category IDs mapping
CREATE TEMP TABLE IF NOT EXISTS product_category_map AS
SELECT
  pwc.product_sku,
  json_group_array(sc.id) as category_ids
FROM product_website_categories pwc
INNER JOIN storefront_categories sc ON sc.title = pwc.category_name
GROUP BY pwc.product_sku;

-- Update storefront_products with the category IDs
UPDATE storefront_products
SET categories = (
  SELECT category_ids
  FROM product_category_map
  WHERE product_category_map.product_sku = storefront_products.sku
)
WHERE sku IN (SELECT product_sku FROM product_category_map);
