-- Add product rating fields for aggregate review data (migrated from Yotpo)
ALTER TABLE storefront_products ADD COLUMN rating_value REAL;
ALTER TABLE storefront_products ADD COLUMN rating_count INTEGER DEFAULT 0;

-- Create index for products with ratings (for filtering/sorting)
CREATE INDEX IF NOT EXISTS idx_products_rating ON storefront_products(rating_value) WHERE rating_value IS NOT NULL;
