// Note: Environment bindings are defined in src/api/index.ts
// This file only contains shared types used across the codebase

// Migration job types
export type MigrationJobType = 'products' | 'customers' | 'orders' | 'images' | 'content' | 'brands';
export type MigrationJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface MigrationJob {
  id: string;
  type: MigrationJobType;
  status: MigrationJobStatus;
  total_items: number;
  processed_items: number;
  failed_items: number;
  started_at: string | null;
  completed_at: string | null;
  error_log: string | null;
  created_at: string;
}

// Field mapping types
export type EntityType = 'product' | 'customer' | 'order' | 'brand';
export type SourceSystem = 'bigcommerce';
export type TargetSystem = 'erpnext';

export interface FieldMapping {
  id: string;
  name: string;
  source_system: SourceSystem;
  target_system: TargetSystem;
  entity_type: EntityType;
  mapping_config: MappingConfig;
  created_at: string;
  updated_at: string;
}

export interface MappingConfig {
  fields: FieldMappingRule[];
  transforms: TransformRule[];
}

export interface FieldMappingRule {
  source_field: string;
  target_field: string;
  transform?: string;
  default_value?: unknown;
}

export interface TransformRule {
  name: string;
  type: 'concat' | 'split' | 'map' | 'custom';
  config: Record<string, unknown>;
}

// Migrated entity types
export type MigrationStatus = 'pending' | 'success' | 'failed' | 'skipped';

export interface MigratedEntity {
  id: string;
  job_id: string | null;
  entity_type: EntityType;
  source_id: string;
  source_system: SourceSystem;
  target_id: string | null;
  target_system: TargetSystem | null;
  status: MigrationStatus;
  error_message: string | null;
  source_data: string | null;
  target_data: string | null;
  created_at: string;
}

// Image migration types
export type ImageMigrationStatus = 'pending' | 'downloaded' | 'uploaded' | 'complete' | 'failed';

export interface ImageMigration {
  id: string;
  source_url: string;
  source_product_id: string | null;
  sku: string | null;
  is_variant_image: number; // 0 = product gallery, 1 = variant-specific
  bc_variant_id: number | null;
  bc_image_id: number | null;
  is_thumbnail: number; // 0 = false, 1 = true
  sort_order: number;
  r2_key: string | null;
  cf_image_id: string | null;
  cf_variants: CFImageVariants | null;
  status: ImageMigrationStatus;
  error_message: string | null;
  created_at: string;
}

export interface CFImageVariants {
  product: string;
  card?: string;
  hero?: string;
  thumbnail?: string;
}

// URL redirect types
export interface UrlRedirect {
  id: string;
  old_url: string;
  new_url: string;
  entity_type: string | null;
  entity_id: string | null;
  status_code: number;
  verified: boolean;
  created_at: string;
}

// SEO metadata types
export interface SeoMetadata {
  id: string;
  entity_type: string;
  source_id: string;
  target_id: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  migrated: boolean;
  created_at: string;
}

// Scraped content types
export type PageType = 'homepage' | 'about' | 'landing' | 'guide' | 'policy' | 'blog';

export interface ScrapedContent {
  id: string;
  url: string;
  page_type: PageType | null;
  title: string | null;
  content: string | null;
  extracted_at: string | null;
  migrated: boolean;
  target_location: string | null;
  created_at: string;
}

// BigCommerce types
export interface BCProduct {
  id: number;
  name: string;
  sku: string;
  price: number;
  cost_price: number;
  sale_price: number;
  retail_price?: number;              // MSRP
  description: string;
  weight: number;
  weight_unit?: string;               // Allow any string (BC can return various formats)
  width?: number;                     // Product width (for shipping)
  height?: number;                    // Product height (for shipping)
  depth?: number;                     // Product depth (for shipping)
  categories: number[];
  brand_id?: number;
  images: BCImage[];
  custom_fields: BCCustomField[];
  inventory_level: number;
  is_visible: boolean;
  condition: string;
  availability: string;
  custom_url: { url: string; is_customized: boolean };
  meta_description: string;
  meta_keywords?: string[];           // Array of keywords from BC
  page_title: string;
  search_keywords?: string;           // Search keywords
  sort_order?: number;                // Product sort order
  is_featured?: boolean;              // Featured product flag
  upc?: string;
  ean?: string;
  gtin?: string;
  mpn?: string;                       // Manufacturer part number
  bin_picking_number?: string;        // Bin picking number
  warranty?: string;
}

// ============================================================================
// BigCommerce Variant Types
// Reference: https://developer.bigcommerce.com/docs/rest-catalog/products/variants
// ============================================================================

/**
 * BigCommerce Product Option - Defines variant dimensions (Color, Size, etc.)
 */
export interface BCProductOption {
  id: number;
  product_id: number;
  display_name: string;
  type: 'dropdown' | 'radio_buttons' | 'rectangles' | 'swatch' | 'product_list' | 'product_list_with_images';
  sort_order: number;
  option_values: BCOptionValue[];
}

/**
 * BigCommerce Option Value - Individual values for an option (Red, Blue, Small, Large)
 */
export interface BCOptionValue {
  id: number;
  label: string;
  sort_order: number;
  value_data?: {
    colors?: string[];
    image_url?: string;
  };
  is_default?: boolean;
}

/**
 * BigCommerce Variant - A specific combination of options for a product
 */
export interface BCVariant {
  id: number;
  product_id: number;
  sku: string;
  sku_id?: number;
  price?: number;
  calculated_price?: number;
  sale_price?: number;
  retail_price?: number;
  cost_price?: number;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  is_free_shipping?: boolean;
  fixed_cost_shipping_price?: number;
  purchasing_disabled?: boolean;
  purchasing_disabled_message?: string;
  image_url?: string;
  upc?: string;
  mpn?: string;
  gtin?: string;
  inventory_level?: number;
  inventory_warning_level?: number;
  bin_picking_number?: string;
  option_values: BCVariantOptionValue[];
}

/**
 * Option value assignment for a specific variant
 */
export interface BCVariantOptionValue {
  id: number;
  label: string;
  option_id: number;
  option_display_name: string;
}

/**
 * Extended BCProduct with variant data
 */
export interface BCProductWithVariants extends BCProduct {
  /** Product has variants */
  has_options?: boolean;
  /** Product options (variant dimensions like Color, Size) */
  options?: BCProductOption[];
  /** Product variants (specific combinations) */
  variants?: BCVariant[];
}

export interface BCImage {
  id: number;
  product_id: number;
  url_standard: string;
  url_thumbnail: string;
  is_thumbnail: boolean;
  sort_order: number;
}

export interface BCCustomField {
  id: number;
  name: string;
  value: string;
}

export interface BCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company: string;
  phone: string;
  addresses: BCAddress[];
}

export interface BCAddress {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state_or_province: string;
  postal_code: string;
  country: string;
  phone: string;
}

// ============================================================================
// BigCommerce Order Types (V2 API)
// Reference: https://developer.bigcommerce.com/docs/rest-management/orders
// ============================================================================

/**
 * BigCommerce Order - V2 API response
 * Note: V2 API returns amounts as strings
 */
export interface BCOrder {
  id: number;
  customer_id: number;
  date_created: string;          // RFC 2822 format
  date_modified: string;
  date_shipped?: string;
  status_id: number;
  status: string;                // Human-readable status
  subtotal_ex_tax: string;
  subtotal_inc_tax: string;
  subtotal_tax: string;
  base_shipping_cost: string;
  shipping_cost_ex_tax: string;
  shipping_cost_inc_tax: string;
  shipping_cost_tax: string;
  shipping_cost_tax_class_id: number;
  base_handling_cost: string;
  handling_cost_ex_tax: string;
  handling_cost_inc_tax: string;
  handling_cost_tax: string;
  base_wrapping_cost: string;
  wrapping_cost_ex_tax: string;
  wrapping_cost_inc_tax: string;
  wrapping_cost_tax: string;
  total_ex_tax: string;
  total_inc_tax: string;
  total_tax: string;
  items_total: number;           // Number of items
  items_shipped: number;
  payment_method: string;
  payment_provider_id?: string;
  payment_status?: string;
  refunded_amount: string;
  order_is_digital: boolean;
  store_credit_amount: string;
  gift_certificate_amount: string;
  ip_address: string;
  geoip_country?: string;
  geoip_country_iso2?: string;
  currency_id: number;
  currency_code: string;
  currency_exchange_rate: string;
  default_currency_id: number;
  default_currency_code: string;
  staff_notes?: string;
  customer_message?: string;
  discount_amount: string;
  coupon_discount: string;
  shipping_address_count: number;
  is_deleted: boolean;
  ebay_order_id?: string;
  cart_id?: string;
  billing_address: BCOrderAddress;
  is_email_opt_in: boolean;
  credit_card_type?: string;
  order_source?: string;
  channel_id?: number;
  external_source?: string;
  // Resource URLs (V2 pattern)
  products: { url: string; resource: string };
  shipping_addresses: { url: string; resource: string };
  coupons: { url: string; resource: string };
}

/**
 * BigCommerce Order Address (embedded in order)
 */
export interface BCOrderAddress {
  first_name: string;
  last_name: string;
  company: string;
  street_1: string;
  street_2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  country_iso2: string;
  phone: string;
  email: string;
  form_fields?: Array<{ name: string; value: string }>;
}

/**
 * BigCommerce Order Product - Line item in an order
 */
export interface BCOrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  order_address_id: number;
  name: string;
  name_customer?: string;
  name_merchant?: string;
  sku: string;
  upc?: string;
  type: 'physical' | 'digital';
  base_price: string;
  price_ex_tax: string;
  price_inc_tax: string;
  price_tax: string;
  base_total: string;
  total_ex_tax: string;
  total_inc_tax: string;
  total_tax: string;
  weight: string;
  width?: string;
  height?: string;
  depth?: string;
  quantity: number;
  base_cost_price: string;
  cost_price_inc_tax: string;
  cost_price_ex_tax: string;
  cost_price_tax: string;
  is_refunded: boolean;
  quantity_refunded: number;
  refund_amount: string;
  return_id: number;
  wrapping_id?: number;
  wrapping_name?: string;
  wrapping_message?: string;
  wrapping_cost_ex_tax: string;
  wrapping_cost_inc_tax: string;
  wrapping_cost_tax: string;
  option_set_id?: number;
  parent_order_product_id?: number;
  is_bundled_product: boolean;
  bin_picking_number?: string;
  external_id?: string;
  fulfillment_source?: string;
  brand?: string;
  product_options?: BCOrderProductOption[];
  configurable_fields?: Array<{
    name: string;
    value: string;
  }>;
  discounts?: Array<{
    id: number;
    name: string;
    amount: string;
  }>;
  gift_certificate_id?: number;
  event_name?: string;
  event_date?: string;
}

/**
 * Product option in order line item
 */
export interface BCOrderProductOption {
  id: number;
  option_id: number;
  order_product_id: number;
  product_option_id: number;
  display_name: string;
  display_name_customer?: string;
  display_name_merchant?: string;
  display_value: string;
  display_value_customer?: string;
  display_value_merchant?: string;
  value: string;
  type: string;
  name: string;
  display_style: string;
}

/**
 * BigCommerce Shipping Address (for multi-address orders)
 */
export interface BCOrderShippingAddress {
  id: number;
  order_id: number;
  items_total: number;
  items_shipped: number;
  first_name: string;
  last_name: string;
  company: string;
  street_1: string;
  street_2: string;
  city: string;
  zip: string;
  country: string;
  country_iso2: string;
  state: string;
  email: string;
  phone: string;
  shipping_method: string;
  base_cost: string;
  cost_ex_tax: string;
  cost_inc_tax: string;
  cost_tax: string;
  cost_tax_class_id: number;
  base_handling_cost: string;
  handling_cost_ex_tax: string;
  handling_cost_inc_tax: string;
  handling_cost_tax: string;
  handling_cost_tax_class_id: number;
  shipping_zone_id: number;
  shipping_zone_name: string;
  shipping_quotes?: {
    url: string;
    resource: string;
  };
  form_fields?: Array<{ name: string; value: string }>;
}

// ERPNext types

// ============================================================================
// ERPNext Item Child Table Types (Frappe Doctype Pattern)
// Reference: https://docs.erpnext.com/docs/stock/item
// ============================================================================

/**
 * Item UOM - Alternate units of measure with conversion factors
 * Child table: Item.uoms
 */
export interface ItemUOM {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  uom: string;
  conversion_factor: number;
}

/**
 * Item Barcode - Multiple barcodes per item (GTIN, UPC, EAN, etc.)
 * Child table: Item.barcodes
 */
export interface ItemBarcode {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  barcode: string;
  barcode_type?: 'EAN' | 'UPC-A' | 'UPC-E' | 'CODE-39' | 'CODE-128' | 'PZN' | 'GTIN' | 'JAN' | 'ISBN' | 'ISSN' | 'ISBN-10' | 'ISBN-13' | string;
  uom?: string;
}

/**
 * Item Default - Company-specific defaults for warehouses and accounts
 * Child table: Item.item_defaults
 */
export interface ItemDefault {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  company: string;
  default_warehouse?: string;
  default_price_list?: string;
  buying_cost_center?: string;
  selling_cost_center?: string;
  expense_account?: string;
  income_account?: string;
  default_supplier?: string;
  default_discount_account?: string;
  default_provisional_account?: string;
  default_deferred_revenue_account?: string;
  default_deferred_expense_account?: string;
}

/**
 * Item Tax - Tax templates applicable to this item
 * Child table: Item.taxes
 */
export interface ItemTax {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  item_tax_template: string;
  tax_category?: string;
  valid_from?: string;
  minimum_net_rate?: number;
  maximum_net_rate?: number;
}

/**
 * Item Reorder Level - Automatic reorder triggers per warehouse
 * Child table: Item.reorder_levels
 */
export interface ItemReorderLevel {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  warehouse: string;
  warehouse_group?: string;
  warehouse_reorder_level: number;
  warehouse_reorder_qty: number;
  material_request_type?: 'Purchase' | 'Material Transfer' | 'Material Issue' | 'Manufacture';
}

/**
 * Supplier Item - Supplier-specific item details
 * Child table: Item.supplier_items
 */
export interface SupplierItem {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  supplier: string;
  supplier_part_no?: string;
}

/**
 * Item Website Specification - Website display specifications
 * Child table: Item.website_specifications
 */
export interface ItemWebsiteSpecification {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  label: string;
  description: string;
}

/**
 * Item Variant Attribute - Attributes for item variants
 * Child table: Item.attributes
 */
export interface ItemVariantAttribute {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  attribute: string;
  attribute_value?: string;
  from_range?: number;
  to_range?: number;
  increment?: number;
  numeric_values?: number;
}

// ============================================================================
// ERPNext Item Attribute Doctype
// Reference: https://docs.erpnext.com/docs/stock/item-attribute
// ============================================================================

/**
 * Item Attribute Value - Individual values for an attribute
 * Child table: Item Attribute.item_attribute_values
 */
export interface ItemAttributeValue {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  attribute_value: string;
  abbr: string;
}

/**
 * Item Attribute - Defines variant dimensions (Color, Size, etc.)
 * This is a standalone doctype linked to Item templates
 */
export interface ItemAttribute {
  name: string;
  attribute_name: string;
  numeric_values?: number;
  from_range?: number;
  to_range?: number;
  increment?: number;
  item_attribute_values?: ItemAttributeValue[];
  // Frappe standard fields
  creation?: string;
  modified?: string;
  modified_by?: string;
  owner?: string;
  docstatus?: 0 | 1 | 2;
}

/**
 * Payload for creating a new Item Attribute
 */
export interface CreateItemAttributePayload {
  attribute_name: string;
  numeric_values?: number;
  from_range?: number;
  to_range?: number;
  increment?: number;
  item_attribute_values?: Omit<ItemAttributeValue, 'name' | 'parent' | 'parenttype' | 'parentfield'>[];
}

/**
 * Item Variant Settings - Controls which attributes create variants
 * This is a single doctype (settings)
 */
export interface ItemVariantSettings {
  name: string;
  copy_fields_to_variant?: ItemVariantSettingsField[];
  do_not_update_variants?: number;
}

/**
 * Fields to copy from template to variant
 * Child table: Item Variant Settings.copy_fields_to_variant
 */
export interface ItemVariantSettingsField {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  field_name: string;
}

/**
 * Item Quality Inspection Parameter - QC parameters for this item
 * Child table: Item.quality_inspection_template
 */
export interface ItemQualityInspectionParameter {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  specification: string;
  value?: string;
  acceptance_criteria?: string;
}

// ============================================================================
// ERPNext Item - Full Doctype Definition
// Reference: https://docs.erpnext.com/docs/stock/item
// Frappe Item Doctype with all standard fields
// ============================================================================

export interface ERPNextItem {
  // Core identification fields
  name: string;                              // Document name (auto-generated)
  item_code: string;                         // Primary item identifier
  item_name: string;                         // Display name
  item_group: string;                        // Link: Item Group - CRITICAL for categorization

  // Description fields
  description?: string;                      // HTML description
  brand?: string;                            // Link: Brand

  // Inventory settings
  is_stock_item: number;                     // Check: Maintain stock for this item
  has_batch_no: number;                      // Check: Has batch number for tracking
  has_serial_no: number;                     // Check: Has serial number for tracking
  has_expiry_date?: number;                  // Check: Track expiry dates
  retain_sample?: number;                    // Check: Retain sample for QC
  sample_quantity?: number;                  // Int: Sample quantity to retain

  // Item classification flags
  is_sales_item: number;                     // Check: Can be sold
  is_purchase_item: number;                  // Check: Can be purchased
  is_fixed_asset?: number;                   // Check: Is a fixed asset
  is_customer_provided_item?: number;        // Check: Customer provides this item

  // Unit of measure
  stock_uom: string;                         // Link: UOM - Stock unit of measure
  weight_uom?: string;                       // Link: UOM - Weight unit
  weight_per_unit?: number;                  // Float: Weight per stock UOM

  // Pricing
  standard_rate: number;                     // Currency: Standard selling rate
  valuation_rate?: number;                   // Currency: Valuation rate
  opening_stock?: number;                    // Float: Opening stock quantity

  // Variant handling
  has_variants: number;                      // Check: Is a template with variants
  variant_of?: string;                       // Link: Item - Parent template item
  variant_based_on?: 'Item Attribute' | 'Manufacturer'; // Select: Variant creation method

  // Compliance and customs
  country_of_origin?: string;                // Link: Country
  customs_tariff_number?: string;            // Link: Customs Tariff Number (HS Code)

  // Purchasing
  default_material_request_type?: 'Purchase' | 'Material Transfer' | 'Material Issue' | 'Manufacture' | 'Customer Provided';
  valuation_method?: 'FIFO' | 'Moving Average' | 'LIFO';
  min_order_qty?: number;                    // Float: Minimum order quantity
  safety_stock?: number;                     // Float: Safety stock level
  lead_time_days?: number;                   // Int: Lead time in days
  last_purchase_rate?: number;               // Read Only: Last purchase rate
  is_purchase_item_synced?: number;          // Check: Synced with supplier
  delivered_by_supplier?: number;            // Check: Supplier delivers directly

  // Sales
  max_discount?: number;                     // Float: Maximum discount percentage
  warranty_period?: string;                  // Data: Warranty period (e.g., "1 Year")
  end_of_life?: string;                      // Date: End of life date
  default_bom?: string;                      // Link: BOM - Default bill of materials

  // Quality inspection
  inspection_required_before_purchase?: number;  // Check
  inspection_required_before_delivery?: number;  // Check
  quality_inspection_template?: string;          // Link: Quality Inspection Template

  // Manufacturing
  include_item_in_manufacturing?: number;    // Check
  default_manufacturer?: string;             // Link: Manufacturer
  default_manufacturer_part_no?: string;     // Data: Manufacturer part number

  // Deferred accounting
  enable_deferred_revenue?: number;          // Check
  enable_deferred_expense?: number;          // Check
  deferred_revenue_account?: string;         // Link: Account
  deferred_expense_account?: string;         // Link: Account
  no_of_months?: number;                     // Int: Deferred months
  no_of_months_exp?: number;                 // Int: Expense deferred months

  // Website and eCommerce
  show_in_website?: number;                  // Check: Show on website
  show_variant_in_website?: number;          // Check: Show variants on website
  route?: string;                            // Data: Website route/slug
  slideshow?: string;                        // Link: Website Slideshow
  website_image?: string;                    // Attach Image
  website_image_alt?: string;                // Data: Image alt text
  thumbnail?: string;                        // Data: Thumbnail URL
  website_warehouse?: string;                // Link: Warehouse for website stock
  website_content?: string;                  // Text Editor: Website content
  web_long_description?: string;             // Text Editor: Detailed web description

  // Hub and marketplace
  publish_in_hub?: number;                   // Check: Publish to ERPNext Hub
  hub_category_to_publish?: string;          // Data: Hub category
  synced_with_hub?: number;                  // Check: Currently synced

  // Images
  image?: string;                            // Attach Image: Main image

  // Status and metadata
  disabled?: number;                         // Check: Item is disabled
  allow_alternative_item?: number;           // Check: Allow substitutions
  is_sub_contracted_item?: number;           // Check: Sub-contracted manufacturing
  total_projected_qty?: number;              // Read Only: Total projected quantity

  // Naming
  naming_series?: string;                    // Select: Naming series

  // Custom fields support
  custom_fields?: Record<string, unknown>;

  // Associated data (populated via child tables or separate queries)
  barcodes?: ItemBarcode[];
  prices?: ItemPrice[];
}

// Item Price doctype - stores pricing in ERPNext
export interface ItemPrice {
  name: string;
  item_code: string;
  price_list: string;
  price_list_rate: number;
  currency: string;
  uom: string;
  valid_from?: string;
  valid_upto?: string;
  buying: number;
  selling: number;
  min_qty: number;
  batch_no?: string;
  // Frappe standard fields
  creation?: string;
  modified?: string;
  modified_by?: string;
  owner?: string;
  docstatus?: 0 | 1 | 2;
}

// ============================================================================
// Item Composite Types
// ============================================================================

/**
 * Item with all child tables populated (returned by GET /api/resource/Item/{name})
 */
export interface ItemWithChildren extends ERPNextItem {
  uoms: ItemUOM[];
  barcodes: ItemBarcode[];
  item_defaults: ItemDefault[];
  taxes: ItemTax[];
  reorder_levels: ItemReorderLevel[];
  supplier_items: SupplierItem[];
  website_specifications?: ItemWebsiteSpecification[];
  attributes?: ItemVariantAttribute[];
  // Frappe standard fields
  creation?: string;
  modified?: string;
  modified_by?: string;
  owner?: string;
  docstatus?: 0 | 1 | 2;
}

/**
 * Complete item data including child tables and all associated prices
 */
export interface ItemComplete extends ItemWithChildren {
  prices: ItemPrice[];
}

// ============================================================================
// API Payload Types
// ============================================================================

/**
 * Payload for creating a new Item in ERPNext
 * Child tables are arrays that will be created alongside the parent
 */
export interface CreateItemPayload {
  // Required fields
  item_code: string;
  item_name: string;
  item_group: string;
  stock_uom: string;

  // Common optional fields
  description?: string;
  brand?: string;
  standard_rate?: number;
  is_stock_item?: number;
  is_sales_item?: number;
  is_purchase_item?: number;
  has_batch_no?: number;
  has_serial_no?: number;
  has_variants?: number;
  variant_of?: string;

  // Weight
  weight_per_unit?: number;
  weight_uom?: string;

  // Website
  show_in_website?: number;
  website_image?: string;
  web_long_description?: string;

  // Other optional fields from ERPNextItem
  [key: string]: unknown;

  // Child tables for creation
  uoms?: Omit<ItemUOM, 'name' | 'parent' | 'parenttype' | 'parentfield'>[];
  barcodes?: Omit<ItemBarcode, 'name' | 'parent' | 'parenttype' | 'parentfield'>[];
  item_defaults?: Omit<ItemDefault, 'name' | 'parent' | 'parenttype' | 'parentfield'>[];
  taxes?: Omit<ItemTax, 'name' | 'parent' | 'parenttype' | 'parentfield'>[];
  reorder_levels?: Omit<ItemReorderLevel, 'name' | 'parent' | 'parenttype' | 'parentfield'>[];
  supplier_items?: Omit<SupplierItem, 'name' | 'parent' | 'parenttype' | 'parentfield'>[];
}

/**
 * Payload for creating a new Item Price
 */
export interface CreateItemPricePayload {
  item_code: string;
  price_list: string;
  price_list_rate: number;
  currency?: string;
  uom?: string;
  min_qty?: number;
  valid_from?: string;
  valid_upto?: string;
  buying?: number;
  selling?: number;
  batch_no?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard ERPNext API response wrapper for a single document
 */
export interface ERPNextDocResponse<T> {
  data: T;
}

/**
 * Response type for Item operations
 */
export interface ItemResponse {
  data: ItemWithChildren;
}

/**
 * Response type for Item Price operations
 */
export interface ItemPriceResponse {
  data: ItemPrice;
}

/**
 * Result of a bulk operation
 */
export interface BulkResult<T = ItemWithChildren> {
  success: T[];
  failed: Array<{
    item: CreateItemPayload;
    error: ERPNextErrorDetail;
  }>;
  total: number;
  successCount: number;
  failedCount: number;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * ERPNext validation error field detail
 */
export interface ERPNextFieldError {
  fieldname: string;
  message: string;
}

/**
 * Structured ERPNext error detail
 */
export interface ERPNextErrorDetail {
  statusCode: number;
  message: string;
  type: 'not_found' | 'validation' | 'duplicate' | 'permission' | 'server' | 'unknown';
  fieldErrors?: ERPNextFieldError[];
  rawResponse?: string;
}

// Price List doctype
export interface PriceList {
  name: string;
  price_list_name: string;
  currency: string;
  buying: number;
  selling: number;
  enabled: number;
  // Frappe standard fields
  creation?: string;
  modified?: string;
  modified_by?: string;
  owner?: string;
  docstatus?: 0 | 1 | 2;
}

// BigCommerce Brand
// Reference: https://developer.bigcommerce.com/docs/rest-catalog/brands
export interface BCBrand {
  id: number;
  name: string;
  page_title?: string;
  meta_keywords?: string[];
  meta_description?: string;
  search_keywords?: string;
  image_url?: string;
  custom_url?: {
    url: string;
    is_customized: boolean;
  };
}

// ============================================================================
// BigCommerce Category
// Reference: https://developer.bigcommerce.com/docs/rest-catalog/categories
// ============================================================================

export interface BCCategory {
  id: number;
  parent_id: number;
  name: string;
  description?: string;
  views?: number;
  sort_order?: number;
  page_title?: string;
  meta_keywords?: string[];
  meta_description?: string;
  layout_file?: string;
  image_url?: string;                // Category banner/image
  is_visible?: boolean;
  search_keywords?: string;
  default_product_sort?: string;
  custom_url?: {
    url: string;
    is_customized: boolean;
  };
}

// ============================================================================
// Non-Product Image Types (for migration tracking)
// ============================================================================

export type NonProductImageType = 'brand_logo' | 'category_banner' | 'site_asset' | 'content_image';

export interface NonProductImage {
  id: string;
  image_type: NonProductImageType;
  source_entity_type: 'brand' | 'category' | 'page' | 'banner';
  source_entity_id: string;
  source_entity_name: string;
  source_url: string;
  r2_key: string | null;
  cf_image_id: string | null;
  cf_variants: CFImageVariants | null;
  cf_grayscale_id: string | null;       // For logo grayscale variants
  status: ImageMigrationStatus;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ERPNext Brand Doctype
// Reference: https://docs.erpnext.com/docs/stock/brand
// ============================================================================

/**
 * ERPNext Brand - Built-in doctype for brand management
 */
export interface ERPNextBrand {
  name: string;              // Document name (auto-generated, same as brand)
  brand: string;             // Brand name (primary field)
  description?: string;      // Brand description
  image?: string;            // Brand logo (attach field)
  // Frappe standard fields
  creation?: string;
  modified?: string;
  modified_by?: string;
  owner?: string;
  docstatus?: 0 | 1 | 2;
}

/**
 * Extended Brand with custom fields for BC migration
 */
export interface ERPNextBrandExtended extends ERPNextBrand {
  // Custom fields to be added via Custom Field doctype
  custom_bc_brand_id?: number;       // Original BC brand ID
  custom_bc_custom_url?: string;     // Original BC slug for redirects
  custom_cf_image_id?: string;       // Cloudflare Images ID for logo
  custom_cf_image_grayscale?: string; // Grayscale variant for /brands page
  custom_meta_keywords?: string;     // SEO keywords
  custom_show_in_website?: number;   // Controls visibility on storefront (0 or 1)
}

/**
 * Payload for creating a new Brand in ERPNext
 */
export interface CreateBrandPayload {
  brand: string;
  description?: string;
  image?: string;
  // Custom fields
  custom_bc_brand_id?: number;
  custom_bc_custom_url?: string;
  custom_cf_image_id?: string;
  custom_cf_image_grayscale?: string;
  custom_meta_keywords?: string;
}

export interface ERPNextCustomer {
  name: string;
  customer_name: string;
  customer_type: string;
  customer_group: string;
  territory: string;
  email_id: string;
  mobile_no: string;
}

// ============================================================================
// ERPNext Sales Order Types
// Reference: https://docs.erpnext.com/docs/user/manual/en/selling/sales-order
// ============================================================================

/**
 * Sales Order Item - Line item in a Sales Order (child table)
 */
export interface SalesOrderItem {
  name?: string;
  parent?: string;
  parenttype?: string;
  parentfield?: string;
  idx?: number;
  item_code: string;
  item_name?: string;
  description?: string;
  qty: number;
  rate: number;
  amount?: number;
  uom?: string;
  stock_uom?: string;
  conversion_factor?: number;
  warehouse?: string;
  delivery_date?: string;
  discount_percentage?: number;
  discount_amount?: number;
  net_rate?: number;
  net_amount?: number;
  base_rate?: number;
  base_amount?: number;
  base_net_rate?: number;
  base_net_amount?: number;
  brand?: string;
  item_group?: string;
  image?: string;
  actual_qty?: number;
  projected_qty?: number;
}

/**
 * ERPNext Sales Order - Submitted order document
 */
export interface ERPNextSalesOrder {
  name: string;                          // Document name (e.g., SAL-ORD-2024-00001)
  title?: string;
  naming_series?: string;
  customer: string;                       // Link to Customer
  customer_name?: string;
  customer_address?: string;
  contact_person?: string;
  contact_display?: string;
  contact_phone?: string;
  contact_mobile?: string;
  contact_email?: string;
  territory?: string;
  customer_group?: string;
  order_type?: 'Sales' | 'Maintenance' | 'Shopping Cart';
  transaction_date: string;               // Order date (YYYY-MM-DD)
  delivery_date?: string;                 // Expected delivery date
  po_no?: string;                         // Customer's PO number
  po_date?: string;
  company: string;
  currency: string;
  conversion_rate?: number;
  selling_price_list?: string;
  price_list_currency?: string;
  plc_conversion_rate?: number;
  ignore_pricing_rule?: number;
  // Totals
  total_qty?: number;
  total_net_weight?: number;
  base_total?: number;
  base_net_total?: number;
  total?: number;
  net_total?: number;
  taxes_and_charges?: string;
  base_total_taxes_and_charges?: number;
  total_taxes_and_charges?: number;
  base_grand_total?: number;
  base_rounding_adjustment?: number;
  base_rounded_total?: number;
  base_in_words?: string;
  grand_total?: number;
  rounding_adjustment?: number;
  rounded_total?: number;
  in_words?: string;
  advance_paid?: number;
  // Discount
  apply_discount_on?: 'Grand Total' | 'Net Total';
  base_discount_amount?: number;
  additional_discount_percentage?: number;
  discount_amount?: number;
  // Status
  status?: string;
  delivery_status?: string;
  per_delivered?: number;
  per_billed?: number;
  billing_status?: string;
  per_picked?: number;
  // Payment
  payment_terms_template?: string;
  tc_name?: string;
  terms?: string;
  // Additional info
  source?: string;
  campaign?: string;
  // Items child table
  items: SalesOrderItem[];
  // Tax child table
  taxes?: Array<{
    charge_type: string;
    account_head: string;
    tax_amount?: number;
    total?: number;
    description?: string;
  }>;
  // Document status
  docstatus: 0 | 1 | 2;                   // 0=Draft, 1=Submitted, 2=Cancelled
  // Frappe standard fields
  creation?: string;
  modified?: string;
  modified_by?: string;
  owner?: string;
  // Custom fields for BC migration
  custom_bc_order_id?: number;
  custom_bc_order_status?: string;
}

/**
 * Payload for creating a Sales Order
 */
export interface CreateSalesOrderPayload {
  customer: string;
  company: string;
  transaction_date: string;
  delivery_date?: string;
  currency?: string;
  conversion_rate?: number;
  selling_price_list?: string;
  items: Array<{
    item_code: string;
    qty: number;
    rate: number;
    delivery_date?: string;
    warehouse?: string;
    uom?: string;
  }>;
  // Custom fields
  custom_bc_order_id?: number;
  custom_bc_order_status?: string;
  // Other optional fields
  [key: string]: unknown;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// Migration request types
export interface StartMigrationRequest {
  type: MigrationJobType;
  options?: {
    batch_size?: number;
    dry_run?: boolean;
    filter?: Record<string, unknown>;
  };
}

export interface SaveMappingRequest {
  name: string;
  entity_type: EntityType;
  mapping_config: MappingConfig;
}

export interface ProcessImagesRequest {
  product_ids?: string[];
  limit?: number;
  force_reprocess?: boolean;
}

export interface CrawlRequest {
  url: string;
  page_type?: PageType;
  extract_links?: boolean;
}

// ============================================================================
// Product Scraper Types
// Ground truth scraping from solampio.com for API comparison
// ============================================================================

/** Scrape phases */
export type ScrapePhase = 0 | 1 | 2;

/** Scrape status */
export type ScrapeStatus = 'pending' | 'phase1_complete' | 'complete' | 'failed';

/** Stock status from website */
export type ScrapedStockStatus = 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder' | 'unknown';

/** Comparison status */
export type ComparisonStatus = 'pending' | 'matched' | 'mismatched' | 'missing_api' | 'missing_scraped';

/** Scraped image data */
export interface ScrapedImage {
  url: string;
  alt?: string;
  order: number;
  is_thumbnail: boolean;
}

/** Scraped variant option */
export interface ScrapedVariantOption {
  option_name: string;
  option_value: string;
}

/** Scraped variant SKU (Phase 1) */
export interface ScrapedVariantSku {
  sku: string;
  options: ScrapedVariantOption[];
}

/** Scraped dimensions */
export interface ScrapedDimensions {
  length?: number;
  width?: number;
  height?: number;
  unit?: string;
}

/** Scraped variant full data (Phase 2) */
export interface ScrapedVariant {
  id: string;
  scraped_product_id: string;
  bc_variant_id?: number;
  sku: string;
  option_values: ScrapedVariantOption[];
  price?: number;
  sale_price?: number;
  image_url?: string;
  stock_status?: ScrapedStockStatus;
  created_at: string;
}

/** Field diff in comparison */
export interface FieldDiff {
  field: string;
  scraped: unknown;
  api: unknown;
  match: boolean;
}

/** Scraped product from database */
export interface ScrapedProduct {
  id: string;
  url: string;
  bc_product_id?: number;

  // Phase 1
  parent_sku?: string;
  variant_skus?: ScrapedVariantSku[];

  // Phase 2
  name?: string;
  description_html?: string;
  short_description?: string;
  price?: number;
  sale_price?: number;
  cost_price?: number;
  images?: ScrapedImage[];
  specifications?: Record<string, string>;
  category_breadcrumbs?: string[];
  brand?: string;
  weight?: string;
  dimensions?: ScrapedDimensions;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  url_slug?: string;
  stock_status?: ScrapedStockStatus;
  related_products?: string[];

  // Metadata
  scrape_status: ScrapeStatus;
  scrape_phase: ScrapePhase;
  error_message?: string;
  scraped_at?: string;

  // Comparison
  comparison_status?: ComparisonStatus;
  comparison_diff?: FieldDiff[];
  compared_at?: string;

  created_at: string;
  updated_at: string;
}

/** Raw scraped product from DB (JSON fields as strings) */
export interface ScrapedProductRow {
  id: string;
  url: string;
  bc_product_id: number | null;
  parent_sku: string | null;
  variant_skus: string | null;
  name: string | null;
  description_html: string | null;
  short_description: string | null;
  price: number | null;
  sale_price: number | null;
  cost_price: number | null;
  images: string | null;
  specifications: string | null;
  category_breadcrumbs: string | null;
  brand: string | null;
  weight: string | null;
  dimensions: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  url_slug: string | null;
  stock_status: string | null;
  related_products: string | null;
  scrape_status: string;
  scrape_phase: number;
  error_message: string | null;
  scraped_at: string | null;
  comparison_status: string | null;
  comparison_diff: string | null;
  compared_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Scrape run tracking */
export interface ScrapeRun {
  id: string;
  phase: ScrapePhase;
  mode: 'full' | 'incremental' | 'single';
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_products: number;
  scraped_count: number;
  failed_count: number;
  delay_ms: number;
  started_at?: string;
  completed_at?: string;
  errors?: Array<{ url: string; error: string }>;
  created_at: string;
}

/** Product comparison result */
export interface ProductComparison {
  id: string;
  scraped_product_id?: string;
  bc_product_id?: number;
  status: 'match' | 'mismatch' | 'api_only' | 'scraped_only';
  field_diffs: FieldDiff[];
  total_fields: number;
  matching_fields: number;
  mismatched_fields: number;
  missing_in_api: number;
  missing_in_scraped: number;
  critical_mismatches: string[];
  compared_at: string;
}

/** Scraped data extraction result (from Playwright) */
export interface ScrapedProductData {
  url: string;

  // Phase 1
  parentSku?: string;
  variantSkus?: ScrapedVariantSku[];

  // Phase 2
  name?: string;
  descriptionHtml?: string;
  shortDescription?: string;
  price?: number;
  salePrice?: number;
  images?: ScrapedImage[];
  specifications?: Record<string, string>;
  categoryBreadcrumbs?: string[];
  brand?: string;
  weight?: string;
  dimensions?: ScrapedDimensions;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  urlSlug?: string;
  stockStatus?: ScrapedStockStatus;
  relatedProducts?: string[];
}

// ============================================================================
// Product Review Types
// Human review UI for migration decisions
// ============================================================================

/** Flags that can be detected on products */
export type ProductFlag =
  | 'missing_sku'
  | 'duplicate_sku'
  | 'zero_price'
  | 'test_product'
  | 'discontinued'
  | 'inactive'
  | 'long_description'
  | 'long_name'
  | 'missing_category'
  | 'missing_brand'
  | 'no_images'
  | 'no_recent_sales';

/** Review action */
export type ReviewAction = 'include' | 'exclude';

/** Product review session */
export interface ProductReviewSession {
  id: string;
  reviewed_by: string;
  started_at: string;
  completed_at: string | null;
  total_products: number;
  reviewed_count: number;
  include_count: number;
  exclude_count: number;
  notes: string | null;
  created_at: string;
}

/** Individual product review decision */
export interface ProductReviewDecision {
  id: string;
  session_id: string | null;
  bc_product_id: number;
  sku: string | null;
  name: string;

  // Product data snapshot
  categories: string | null;       // JSON array
  brand: string | null;
  price: number | null;
  sale_price: number | null;
  cost_price: number | null;
  retail_price: number | null;     // MSRP
  inventory_level: number | null;
  is_visible: number | null;
  weight: number | null;
  description_length: number | null;
  image_count: number | null;
  variant_count: number | null;
  last_sale_date: string | null;   // ISO date of most recent sale

  // Auto-analysis
  proposed_action: ReviewAction;
  proposed_reason: string | null;
  flags: string | null;            // JSON array of ProductFlag

  // Human decision
  action: ReviewAction | null;
  override_reason: string | null;
  notes: string | null;
  reviewed_at: string | null;

  // Mapping issues
  mapping_issues: string | null;   // JSON

  created_at: string;
  updated_at: string;
}

/** Parsed product review for UI display */
export interface ProductReviewItem {
  id: string;
  bc_product_id: number;
  sku: string | null;
  name: string;
  categories: string[];
  brand: string | null;
  price: number | null;
  sale_price: number | null;
  cost_price: number | null;
  retail_price: number | null;
  inventory_level: number | null;
  is_visible: boolean;
  weight: number | null;
  description_length: number | null;
  image_count: number | null;
  variant_count: number | null;
  last_sale_date: string | null;
  proposed_action: ReviewAction;
  proposed_reason: string | null;
  flags: ProductFlag[];
  action: ReviewAction | null;
  override_reason: string | null;
  notes: string | null;
  reviewed_at: string | null;
  mapping_issues: Record<string, string> | null;
}

/** Request to update a product decision */
export interface UpdateProductDecisionRequest {
  action: ReviewAction;
  override_reason?: string;
  notes?: string;
}

/** Bulk update request */
export interface BulkUpdateDecisionsRequest {
  product_ids: number[];
  action: ReviewAction;
  override_reason?: string;
}

/** Export format for review decisions */
export interface ProductReviewExport {
  reviewed_at: string;
  reviewed_by: string;
  session_id: string;
  stats: {
    total: number;
    included: number;
    excluded: number;
    pending: number;
  };
  products: Array<{
    bc_id: number;
    sku: string | null;
    action: ReviewAction | 'pending';
    flags: ProductFlag[];
    notes: string | null;
  }>;
}

/** Product analysis result (before saving to DB) */
export interface ProductAnalysis {
  bc_product_id: number;
  sku: string | null;
  name: string;
  categories: string[];
  brand: string | null;
  price: number;
  sale_price: number;
  cost_price: number;
  inventory_level: number;
  is_visible: boolean;
  weight: number;
  description: string;
  description_length: number;
  image_count: number;
  variant_count: number;
  flags: ProductFlag[];
  proposed_action: ReviewAction;
  proposed_reason: string | null;
  mapping_issues: Record<string, string>;
}

// ============================================================================
// BigCommerce Category Sync Types
// For syncing BC categories to ERPNext Item Groups and website categorization
// ============================================================================

/**
 * BC Category mapping stored in D1
 * Maps BigCommerce category IDs to ERPNext Item Group names
 */
export interface BCCategoryMapping {
  id: number;
  bc_category_id: number;
  bc_category_name: string;
  bc_parent_id: number;
  erpnext_item_group: string;
  slug: string | null;
  sort_order: number;
  is_visible: number;
  image_url: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Product website category relationship stored in D1
 * Products can belong to multiple website categories
 */
export interface ProductWebsiteCategory {
  id: number;
  product_sku: string;
  erpnext_item_name: string | null;
  bc_category_id: number;
  category_name: string;
  created_at: string;
}

/**
 * Category tree node for hierarchical display
 */
export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  parent_id: number;
  children: CategoryTreeNode[];
  product_count?: number;
  is_visible: boolean;
  erpnext_item_group?: string;
}

/**
 * Result of category sync operation
 */
export interface CategorySyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ bc_category_id: number; name: string; error: string }>;
  erpnext_groups_created: number;
  mappings_saved: number;
  duration_ms: number;
}

/**
 * Result of product category mapping operation
 */
export interface ProductCategoryMappingResult {
  products_processed: number;
  categories_mapped: number;
  d1_records_created: number;
  erpnext_items_updated: number;
  errors: Array<{ sku: string; error: string }>;
  duration_ms: number;
}

/**
 * Payload for creating ERPNext Item Group
 */
export interface CreateItemGroupPayload {
  item_group_name: string;
  parent_item_group: string;
  is_group?: number;
  custom_bc_category_id?: number;
  custom_show_in_website?: number; // Controls visibility on storefront (0 or 1)
  custom_slug?: string;
  custom_sort_order?: number;
  custom_cf_image_id?: string;
}

/**
 * ERPNext Item Group with custom fields
 */
export interface ERPNextItemGroup {
  name: string;
  item_group_name: string;
  parent_item_group: string;
  is_group: number;
  custom_bc_category_id?: number;
  custom_show_in_website?: number; // Controls visibility on storefront (0 or 1)
  custom_slug?: string;
  custom_sort_order?: number;
  custom_cf_image_id?: string;
}

// ============================================================================
// Shipping Enrichment Types
// For enriching ERPNext items with shipping dimensions via Distributed Electrons
// ============================================================================

/**
 * Shipping dimensions data returned from DE research
 */
export interface ShippingData {
  /** Weight in pounds */
  shipping_weight: number;
  /** Length in inches */
  shipping_length: number;
  /** Width in inches */
  shipping_width: number;
  /** Height in inches */
  shipping_height: number;
  /** Source URL or "estimated" */
  source: string;
  /** Confidence level */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Options for the enrich-shipping endpoint
 */
export interface EnrichShippingOptions {
  /** Max items to process (default: 10) */
  limit?: number;
  /** If true, don't update ERPNext */
  dry_run?: boolean;
  /** Process single SKU only */
  sku?: string;
}

/**
 * Individual item enrichment result
 */
export interface ShippingEnrichmentResult {
  sku: string;
  item_name: string;
  status: 'success' | 'failed' | 'skipped';
  shipping_data?: ShippingData;
  error?: string;
}

/**
 * Overall enrichment progress/response
 */
export interface EnrichmentProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  current_sku?: string;
  results: ShippingEnrichmentResult[];
  duration_ms: number;
}
