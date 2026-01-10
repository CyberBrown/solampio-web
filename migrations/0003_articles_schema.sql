-- Articles table for /learn/ content
-- Stores content migrated from Intercom Help Center and synced from ERPNext

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  section TEXT NOT NULL,
  category TEXT,
  tags TEXT,
  related_articles TEXT,
  related_products TEXT,
  source_url TEXT,
  source_id TEXT,
  author TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_articles_section ON articles(section);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_source_url ON articles(source_url);
CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_updated_at ON articles(updated_at);
