-- Quote Request table for website quote submissions
-- Syncs to ERPNext as Leads

CREATE TABLE IF NOT EXISTS storefront_quote_requests (
  id TEXT PRIMARY KEY,
  quote_number TEXT NOT NULL UNIQUE,

  -- Contact info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,

  -- Project details
  project_type TEXT,
  system_size TEXT,
  project_location TEXT,
  product_list TEXT,
  timeline TEXT,
  notes TEXT,

  -- Tracking
  status TEXT NOT NULL DEFAULT 'new',
  ip_address TEXT,

  -- ERPNext sync
  erpnext_lead_name TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  sync_error TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON storefront_quote_requests(email);
CREATE INDEX IF NOT EXISTS idx_quote_requests_quote_number ON storefront_quote_requests(quote_number);
CREATE INDEX IF NOT EXISTS idx_quote_requests_sync_status ON storefront_quote_requests(sync_status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON storefront_quote_requests(created_at);
