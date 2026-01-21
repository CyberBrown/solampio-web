-- Add ERPNext sales order reference column for order sync tracking
ALTER TABLE storefront_orders ADD COLUMN erpnext_sales_order TEXT;

-- Create index for ERPNext order lookups
CREATE INDEX IF NOT EXISTS idx_orders_erpnext_sales_order ON storefront_orders(erpnext_sales_order);
