-- Google Merchant Center fields
ALTER TABLE storefront_products ADD COLUMN gmc_google_category TEXT;
ALTER TABLE storefront_products ADD COLUMN gmc_product_type TEXT;
ALTER TABLE storefront_products ADD COLUMN gmc_condition TEXT DEFAULT 'new';
ALTER TABLE storefront_products ADD COLUMN gmc_availability TEXT DEFAULT 'in_stock';
ALTER TABLE storefront_products ADD COLUMN gmc_shipping_label TEXT;
ALTER TABLE storefront_products ADD COLUMN gmc_custom_label_0 TEXT;
ALTER TABLE storefront_products ADD COLUMN gmc_custom_label_1 TEXT;
ALTER TABLE storefront_products ADD COLUMN gmc_custom_label_2 TEXT;
ALTER TABLE storefront_products ADD COLUMN gmc_custom_label_3 TEXT;
ALTER TABLE storefront_products ADD COLUMN gmc_custom_label_4 TEXT;
ALTER TABLE storefront_products ADD COLUMN gmc_additional_images TEXT;

-- Product identifiers (optional - for manual entry if available)
ALTER TABLE storefront_products ADD COLUMN gtin TEXT;
ALTER TABLE storefront_products ADD COLUMN mpn TEXT;
