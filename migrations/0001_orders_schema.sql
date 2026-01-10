-- Add Stripe payment columns to existing storefront_orders table
-- The table already exists with ERPNext sync fields

-- Add Stripe payment intent ID for payment tracking
ALTER TABLE storefront_orders ADD COLUMN stripe_payment_intent_id TEXT;

-- Add Stripe customer ID (optional, for returning customers)
ALTER TABLE storefront_orders ADD COLUMN stripe_customer_id TEXT;

-- Add customer contact info for guest checkout (customer_id may be null)
ALTER TABLE storefront_orders ADD COLUMN customer_email TEXT;
ALTER TABLE storefront_orders ADD COLUMN customer_phone TEXT;
ALTER TABLE storefront_orders ADD COLUMN customer_name TEXT;

-- Create indexes for payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON storefront_orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON storefront_orders(customer_email);
