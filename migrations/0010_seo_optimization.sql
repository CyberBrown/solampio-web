-- SEO optimization fields for storefront_products
ALTER TABLE storefront_products ADD COLUMN seo_title TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_meta_description TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_description_summary TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_og_title TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_og_description TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_keywords TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_robots TEXT DEFAULT 'index, follow';
ALTER TABLE storefront_products ADD COLUMN seo_faqs TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_related_searches TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_use_cases TEXT;
ALTER TABLE storefront_products ADD COLUMN description_original TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_last_optimized TEXT;
ALTER TABLE storefront_products ADD COLUMN seo_competitor_data TEXT;

-- Competitor intelligence tracking table
CREATE TABLE IF NOT EXISTS competitor_intel (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  sku TEXT NOT NULL,
  competitor_name TEXT,
  competitor_url TEXT,
  competitor_price TEXT,
  differentiators TEXT,
  captured_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_competitor_intel_sku ON competitor_intel(sku);
CREATE INDEX IF NOT EXISTS idx_competitor_intel_captured ON competitor_intel(captured_at);
