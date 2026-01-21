-- Copy categories from parent templates to variant children that lack categories
-- variant_of references parent's SKU, not ID
UPDATE storefront_products
SET categories = (
    SELECT p.categories
    FROM storefront_products p
    WHERE p.sku = storefront_products.variant_of
    AND p.has_variants = 1
)
WHERE variant_of IS NOT NULL
  AND (categories IS NULL OR categories = 'null' OR categories = '[]');
