-- Add search_boost column for search ranking control
-- Higher values rank higher in search results
-- Zero or negative values hide the product from search entirely

-- Add column with default value of 1.0 (normal ranking)
ALTER TABLE storefront_products ADD COLUMN search_boost REAL DEFAULT 1.0;

-- Update any NULL values to default
UPDATE storefront_products SET search_boost = 1.0 WHERE search_boost IS NULL;
