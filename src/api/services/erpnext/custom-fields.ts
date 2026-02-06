import type { ERPNextClient } from './index';

// Custom Field definition for ERPNext
export interface CustomFieldDef {
  dt: string; // DocType name
  fieldname: string;
  fieldtype: 'Data' | 'Text' | 'Int' | 'Float' | 'Currency' | 'Check' | 'Small Text' | 'Long Text' | 'Link' | 'Select' | 'Table' | 'Table MultiSelect' | 'Section Break' | 'Column Break';
  label: string;
  insert_after?: string;
  options?: string; // For Link fields: doctype name; For Select: options separated by \n; For Table: child doctype name
  default?: string;
  reqd?: 0 | 1;
  hidden?: 0 | 1;
  read_only?: 0 | 1;
  description?: string;
}

// Result of checking custom field existence
export interface CustomFieldCheck {
  fieldname: string;
  exists: boolean;
  current?: {
    name: string;
    fieldtype: string;
    label: string;
  };
}

// Result of creating a custom field
export interface CreateFieldResult {
  fieldname: string;
  success: boolean;
  name?: string;
  error?: string;
}

// Required custom fields for BigCommerce migration
export const REQUIRED_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'bc_product_id',
    fieldtype: 'Int',
    label: 'BigCommerce Product ID',
    insert_after: 'item_name',
    read_only: 1,
    description: 'Original product ID from BigCommerce',
  },
  {
    dt: 'Item',
    fieldname: 'bc_meta_title',
    fieldtype: 'Data',
    label: 'SEO Title',
    insert_after: 'description',
    description: 'SEO page title from BigCommerce',
  },
  {
    dt: 'Item',
    fieldname: 'bc_meta_description',
    fieldtype: 'Text',
    label: 'Meta Description',
    insert_after: 'bc_meta_title',
    description: 'SEO meta description from BigCommerce',
  },
  {
    dt: 'Item',
    fieldname: 'website_keywords',
    fieldtype: 'Small Text',
    label: 'Website Keywords',
    insert_after: 'bc_meta_description',
    description: 'Consolidated keywords (comma-separated) from all sources',
  },
  {
    dt: 'Item',
    fieldname: 'bc_availability_text',
    fieldtype: 'Data',
    label: 'Availability Text',
    insert_after: 'website_keywords',
    description: 'Availability message (e.g., "Usually ships in 2-3 days")',
  },
  {
    dt: 'Item',
    fieldname: 'bc_url_slug',
    fieldtype: 'Data',
    label: 'URL Slug',
    insert_after: 'bc_availability_text',
    description: 'Original URL slug from BigCommerce',
  },
];

// Custom fields for Item Group doctype
// NOTE: We use custom_show_in_website as the single visibility field (consolidating from previous duplicates)
export const ITEM_GROUP_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item Group',
    fieldname: 'custom_show_in_website',
    fieldtype: 'Check',
    label: 'Show on Website',
    insert_after: 'is_group',
    default: '1',
    description: 'When checked, this category appears on the Qwik storefront',
  },
  {
    dt: 'Item Group',
    fieldname: 'custom_cf_image_id',
    fieldtype: 'Data',
    label: 'Cloudflare Image ID',
    insert_after: 'image',
    description: 'Cloudflare Images ID for category image (e.g., cat-batteries). Used on storefront for category cards, headers, and navigation.',
  },
  {
    dt: 'Item Group',
    fieldname: 'custom_slug',
    fieldtype: 'Data',
    label: 'URL Slug',
    insert_after: 'item_group_name',
    description: 'Custom URL slug for this category (auto-generated from name if not set)',
  },
  {
    dt: 'Item Group',
    fieldname: 'custom_sort_order',
    fieldtype: 'Int',
    label: 'Sort Order',
    insert_after: 'custom_slug',
    default: '0',
    description: 'Display order in navigation (lower numbers appear first)',
  },
];

// Custom fields for Storefront Featured Products
// These fields control which products appear in featured sections on the Qwik storefront
export const STOREFRONT_FEATURED_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'custom_is_featured',
    fieldtype: 'Check',
    label: 'Featured on Homepage',
    insert_after: 'image',
    default: '0',
    description: 'When checked, this product appears in featured sections on the homepage',
  },
  {
    dt: 'Item',
    fieldname: 'custom_featured_in_category',
    fieldtype: 'Link',
    options: 'Item Group',
    label: 'Featured in Category',
    insert_after: 'custom_is_featured',
    description: 'Select a category to feature this product in that category\'s navigation and header',
  },
];

// Custom fields for Brand doctype (BigCommerce migration)
export const BRAND_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Brand',
    fieldname: 'custom_bc_brand_id',
    fieldtype: 'Int',
    label: 'BigCommerce Brand ID',
    insert_after: 'brand',
    read_only: 1,
    description: 'Original brand ID from BigCommerce',
  },
  {
    dt: 'Brand',
    fieldname: 'custom_bc_custom_url',
    fieldtype: 'Data',
    label: 'Original URL Slug',
    insert_after: 'custom_bc_brand_id',
    description: 'Original BigCommerce URL slug for 301 redirects',
  },
  {
    dt: 'Brand',
    fieldname: 'custom_cf_image_id',
    fieldtype: 'Data',
    label: 'Cloudflare Image ID',
    insert_after: 'image',
    description: 'Cloudflare Images ID for brand logo',
  },
  {
    dt: 'Brand',
    fieldname: 'custom_cf_image_grayscale',
    fieldtype: 'Data',
    label: 'Grayscale Image URL',
    insert_after: 'custom_cf_image_id',
    description: 'Grayscale variant URL for /brands page display',
  },
  {
    dt: 'Brand',
    fieldname: 'custom_meta_keywords',
    fieldtype: 'Small Text',
    label: 'Meta Keywords',
    insert_after: 'description',
    description: 'SEO meta keywords from BigCommerce',
  },
  {
    dt: 'Brand',
    fieldname: 'custom_is_featured',
    fieldtype: 'Check',
    label: 'Featured Brand',
    insert_after: 'brand',
    default: '0',
    description: 'When checked, this brand appears in featured sections on the homepage',
  },
];

// Custom fields for Customer doctype (BigCommerce migration)
export const CUSTOMER_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Customer',
    fieldname: 'custom_bc_customer_id',
    fieldtype: 'Int',
    label: 'BigCommerce Customer ID',
    insert_after: 'customer_name',
    read_only: 1,
    description: 'Original customer ID from BigCommerce',
  },
  {
    dt: 'Customer',
    fieldname: 'custom_bc_company',
    fieldtype: 'Data',
    label: 'BC Company Name',
    insert_after: 'custom_bc_customer_id',
    description: 'Original company name from BigCommerce',
  },
  {
    dt: 'Customer',
    fieldname: 'custom_bc_date_created',
    fieldtype: 'Data',
    label: 'BC Date Created',
    insert_after: 'custom_bc_company',
    read_only: 1,
    description: 'Original creation date from BigCommerce',
  },
  {
    dt: 'Customer',
    fieldname: 'custom_bc_date_modified',
    fieldtype: 'Data',
    label: 'BC Date Modified',
    insert_after: 'custom_bc_date_created',
    read_only: 1,
    description: 'Last modification date from BigCommerce',
  },
  {
    dt: 'Customer',
    fieldname: 'custom_bc_customer_group_id',
    fieldtype: 'Int',
    label: 'BC Customer Group ID',
    insert_after: 'custom_bc_date_modified',
    read_only: 1,
    description: 'Customer group ID from BigCommerce',
  },
  {
    dt: 'Customer',
    fieldname: 'custom_bc_notes',
    fieldtype: 'Small Text',
    label: 'BC Customer Notes',
    insert_after: 'custom_bc_customer_group_id',
    description: 'Customer notes from BigCommerce',
  },
  {
    dt: 'Customer',
    fieldname: 'custom_bc_registration_ip',
    fieldtype: 'Data',
    label: 'BC Registration IP',
    insert_after: 'custom_bc_notes',
    read_only: 1,
    description: 'IP address at registration from BigCommerce',
  },
  {
    dt: 'Customer',
    fieldname: 'custom_bc_tax_exempt_category',
    fieldtype: 'Data',
    label: 'BC Tax Exempt Category',
    insert_after: 'custom_bc_registration_ip',
    description: 'Tax exempt category from BigCommerce',
  },
  {
    dt: 'Customer',
    fieldname: 'custom_bc_accepts_marketing',
    fieldtype: 'Check',
    label: 'BC Accepts Marketing',
    insert_after: 'custom_bc_tax_exempt_category',
    description: 'Whether customer opted in to marketing emails in BigCommerce',
  },
  {
    dt: 'Customer',
    fieldname: 'custom_bc_origin_channel_id',
    fieldtype: 'Int',
    label: 'BC Origin Channel ID',
    insert_after: 'custom_bc_accepts_marketing',
    read_only: 1,
    description: 'Origin channel ID from BigCommerce',
  },
];

// Custom fields for Address doctype (BigCommerce migration)
export const ADDRESS_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Address',
    fieldname: 'custom_bc_address_id',
    fieldtype: 'Int',
    label: 'BigCommerce Address ID',
    insert_after: 'address_line1',
    read_only: 1,
    description: 'Original address ID from BigCommerce',
  },
  {
    dt: 'Address',
    fieldname: 'custom_bc_address_type',
    fieldtype: 'Data',
    label: 'BC Address Type',
    insert_after: 'custom_bc_address_id',
    description: 'Address type from BigCommerce (residential/commercial)',
  },
];

// Custom fields for Sales Order doctype (BigCommerce migration)
export const SALES_ORDER_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Sales Order',
    fieldname: 'custom_bc_order_id',
    fieldtype: 'Int',
    label: 'BigCommerce Order ID',
    insert_after: 'naming_series',
    read_only: 1,
    description: 'Original order ID from BigCommerce',
  },
  {
    dt: 'Sales Order',
    fieldname: 'custom_bc_order_status',
    fieldtype: 'Data',
    label: 'BC Order Status',
    insert_after: 'custom_bc_order_id',
    read_only: 1,
    description: 'Original order status from BigCommerce',
  },
];

// Custom fields for Cloudflare Images on Item doctype
export const IMAGE_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'custom_cf_image_id',
    fieldtype: 'Data',
    label: 'Cloudflare Image ID',
    insert_after: 'image',
    description: 'Primary Cloudflare Images ID for this product',
  },
  {
    dt: 'Item',
    fieldname: 'custom_cf_image_ids',
    fieldtype: 'Small Text',
    label: 'All Cloudflare Image IDs',
    insert_after: 'custom_cf_image_id',
    description: 'JSON array of all CF Image IDs for product gallery',
  },
];

// Multi-category support custom fields (requires Item Category Link DocType)
export const MULTI_CATEGORY_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'item_categories',
    fieldtype: 'Table',
    label: 'Additional Categories',
    options: 'Item Category Link',
    insert_after: 'item_group',
    description: 'Additional categories for this item (supports multi-category from BigCommerce)',
  },
];

// Website categories custom field for web storefront (requires Item Category Link DocType)
// Uses Table MultiSelect for a cleaner UI with tag-style selection
export const WEBSITE_CATEGORY_CUSTOM_FIELD: CustomFieldDef = {
  dt: 'Item',
  fieldname: 'website_categories',
  fieldtype: 'Table MultiSelect',
  options: 'Item Category Link',
  label: 'Website Categories',
  insert_after: 'item_group',
  description: 'Categories where this product appears on the web storefront. Products can belong to multiple categories.',
};

// ============================================================================
// Shipping Information Custom Fields
// ============================================================================
// These fields support shipping rate calculation for USPS, UPS, and LTL carriers.
// Product dimensions are for spec sheets; shipping dimensions are for packaged items.

// Section break for organizing shipping fields in Item form
export const SHIPPING_SECTION_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'shipping_info_section',
    fieldtype: 'Section Break',
    label: 'Shipping Information',
    insert_after: 'weight_uom',
  },
];

// Product Dimensions (physical item specs for customer info)
export const PRODUCT_DIMENSION_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'product_dimensions_column',
    fieldtype: 'Column Break',
    label: '',
    insert_after: 'shipping_info_section',
  },
  {
    dt: 'Item',
    fieldname: 'product_length',
    fieldtype: 'Float',
    label: 'Product Length',
    insert_after: 'product_dimensions_column',
    description: 'Physical product length (for spec sheets)',
  },
  {
    dt: 'Item',
    fieldname: 'product_width',
    fieldtype: 'Float',
    label: 'Product Width',
    insert_after: 'product_length',
    description: 'Physical product width (for spec sheets)',
  },
  {
    dt: 'Item',
    fieldname: 'product_height',
    fieldtype: 'Float',
    label: 'Product Height',
    insert_after: 'product_width',
    description: 'Physical product height (for spec sheets)',
  },
  {
    dt: 'Item',
    fieldname: 'product_dimension_uom',
    fieldtype: 'Select',
    label: 'Product Dimension UOM',
    options: 'in\ncm',
    default: 'in',
    insert_after: 'product_height',
    description: 'Unit of measure for product dimensions',
  },
];

// Shipping Dimensions (packaged/boxed dimensions for carrier rates)
export const SHIPPING_DIMENSION_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'shipping_dimensions_column',
    fieldtype: 'Column Break',
    label: '',
    insert_after: 'product_dimension_uom',
  },
  {
    dt: 'Item',
    fieldname: 'shipping_weight',
    fieldtype: 'Float',
    label: 'Shipping Weight',
    insert_after: 'shipping_dimensions_column',
    description: 'Packaged weight for shipping calculation',
  },
  {
    dt: 'Item',
    fieldname: 'shipping_weight_uom',
    fieldtype: 'Select',
    label: 'Shipping Weight UOM',
    options: 'lb\nkg',
    default: 'lb',
    insert_after: 'shipping_weight',
    description: 'Unit of measure for shipping weight',
  },
  {
    dt: 'Item',
    fieldname: 'shipping_length',
    fieldtype: 'Float',
    label: 'Shipping Length',
    insert_after: 'shipping_weight_uom',
    description: 'Packaged length for shipping calculation',
  },
  {
    dt: 'Item',
    fieldname: 'shipping_width',
    fieldtype: 'Float',
    label: 'Shipping Width',
    insert_after: 'shipping_length',
    description: 'Packaged width for shipping calculation',
  },
  {
    dt: 'Item',
    fieldname: 'shipping_height',
    fieldtype: 'Float',
    label: 'Shipping Height',
    insert_after: 'shipping_width',
    description: 'Packaged height for shipping calculation',
  },
  {
    dt: 'Item',
    fieldname: 'shipping_dimension_uom',
    fieldtype: 'Select',
    label: 'Shipping Dimension UOM',
    options: 'in\ncm',
    default: 'in',
    insert_after: 'shipping_height',
    description: 'Unit of measure for shipping dimensions',
  },
];

// Shipping Qualification Flags (determine which carriers can handle item)
export const SHIPPING_QUALIFICATION_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'shipping_qualifications_section',
    fieldtype: 'Section Break',
    label: 'Shipping Qualifications',
    insert_after: 'shipping_dimension_uom',
  },
  {
    dt: 'Item',
    fieldname: 'ships_usps',
    fieldtype: 'Check',
    label: 'Ships USPS',
    insert_after: 'shipping_qualifications_section',
    default: '0',
    description: 'Qualifies for USPS parcel shipping',
  },
  {
    dt: 'Item',
    fieldname: 'ships_ups',
    fieldtype: 'Check',
    label: 'Ships UPS',
    insert_after: 'ships_usps',
    default: '0',
    description: 'Qualifies for UPS parcel shipping',
  },
  {
    dt: 'Item',
    fieldname: 'ships_ltl',
    fieldtype: 'Check',
    label: 'Ships LTL',
    insert_after: 'ships_ups',
    default: '0',
    description: 'Qualifies for LTL freight shipping',
  },
  {
    dt: 'Item',
    fieldname: 'ships_pickup',
    fieldtype: 'Check',
    label: 'Available for Pickup',
    insert_after: 'ships_ltl',
    default: '0',
    description: 'Customer can pick up at warehouse',
  },
  {
    dt: 'Item',
    fieldname: 'hazmat_column',
    fieldtype: 'Column Break',
    label: '',
    insert_after: 'ships_pickup',
  },
  {
    dt: 'Item',
    fieldname: 'hazmat_flag',
    fieldtype: 'Check',
    label: 'Hazmat',
    insert_after: 'hazmat_column',
    default: '0',
    description: 'Hazardous material - routes to UPS, adds buffer to LTL',
  },
  {
    dt: 'Item',
    fieldname: 'hazmat_class',
    fieldtype: 'Data',
    label: 'Hazmat Class',
    insert_after: 'hazmat_flag',
    description: 'UN number and proper shipping name (e.g., "UN3480 - Lithium Ion Batteries")',
  },
  {
    dt: 'Item',
    fieldname: 'oversized_flag',
    fieldtype: 'Check',
    label: 'Oversized',
    insert_after: 'hazmat_class',
    default: '0',
    description: 'Triggers UPS oversized surcharge or LTL routing',
  },
];

// Variant Inheritance Flag (for items with variants)
export const SHIPPING_VARIANT_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'inherit_shipping_from_parent',
    fieldtype: 'Check',
    label: 'Inherit Shipping from Parent',
    insert_after: 'oversized_flag',
    default: '1',
    description: 'When checked, variant uses parent item shipping specs instead of its own',
  },
];

// Combined shipping fields for easy deployment
export const ALL_SHIPPING_CUSTOM_FIELDS: CustomFieldDef[] = [
  ...SHIPPING_SECTION_FIELDS,
  ...PRODUCT_DIMENSION_FIELDS,
  ...SHIPPING_DIMENSION_FIELDS,
  ...SHIPPING_QUALIFICATION_FIELDS,
  ...SHIPPING_VARIANT_FIELDS,
];

// ============================================================================
// SEO Optimization Custom Fields
// ============================================================================
// These fields store AI-optimized SEO data from the D1 storefront database.
// Populated by the Gemini SEO batch job and synced back to ERPNext.

export const SEO_SECTION_FIELD: CustomFieldDef = {
  dt: 'Item',
  fieldname: 'seo_optimization_section',
  fieldtype: 'Section Break',
  label: 'SEO Optimization',
  insert_after: 'description',
};

export const SEO_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'seo_title',
    fieldtype: 'Data',
    label: 'SEO Title',
    insert_after: 'seo_optimization_section',
    description: 'AI-optimized page title (max 70 chars)',
  },
  {
    dt: 'Item',
    fieldname: 'seo_meta_description',
    fieldtype: 'Small Text',
    label: 'SEO Meta Description',
    insert_after: 'seo_title',
    description: 'AI-optimized meta description (max 200 chars)',
  },
  {
    dt: 'Item',
    fieldname: 'seo_description_summary',
    fieldtype: 'Small Text',
    label: 'SEO Description Summary',
    insert_after: 'seo_meta_description',
    description: 'AI-generated product summary (max 500 chars)',
  },
  {
    dt: 'Item',
    fieldname: 'seo_og_title',
    fieldtype: 'Data',
    label: 'OG Title',
    insert_after: 'seo_description_summary',
    description: 'Open Graph title for social sharing',
  },
  {
    dt: 'Item',
    fieldname: 'seo_og_description',
    fieldtype: 'Small Text',
    label: 'OG Description',
    insert_after: 'seo_og_title',
    description: 'Open Graph description for social sharing',
  },
  {
    dt: 'Item',
    fieldname: 'seo_robots',
    fieldtype: 'Data',
    label: 'Robots Directive',
    insert_after: 'seo_og_description',
    description: 'robots meta tag value (e.g., "index, follow")',
  },
  {
    dt: 'Item',
    fieldname: 'gmc_google_category',
    fieldtype: 'Data',
    label: 'Google Product Category',
    insert_after: 'seo_robots',
    description: 'Google Merchant Center product taxonomy',
  },
  {
    dt: 'Item',
    fieldname: 'gmc_product_type',
    fieldtype: 'Data',
    label: 'GMC Product Type',
    insert_after: 'gmc_google_category',
    description: 'Custom product type for GMC',
  },
  {
    dt: 'Item',
    fieldname: 'gmc_shipping_label',
    fieldtype: 'Data',
    label: 'GMC Shipping Label',
    insert_after: 'gmc_product_type',
    description: 'Shipping label for Google Merchant Center',
  },
  {
    dt: 'Item',
    fieldname: 'gmc_brand_tier',
    fieldtype: 'Data',
    label: 'Brand Tier',
    insert_after: 'gmc_shipping_label',
    description: 'Brand tier classification (premium/mid_tier/value)',
  },
  {
    dt: 'Item',
    fieldname: 'gmc_margin_tier',
    fieldtype: 'Data',
    label: 'Margin Tier',
    insert_after: 'gmc_brand_tier',
    description: 'Margin tier classification',
  },
  {
    dt: 'Item',
    fieldname: 'faq_json',
    fieldtype: 'Long Text',
    label: 'FAQ JSON',
    insert_after: 'gmc_margin_tier',
    description: 'JSON array of FAQ objects for structured data',
  },
  {
    dt: 'Item',
    fieldname: 'seo_last_optimized',
    fieldtype: 'Data', // Using Data instead of Datetime for ISO string storage
    label: 'SEO Last Optimized',
    insert_after: 'faq_json',
    read_only: 1,
    description: 'Timestamp of last AI SEO optimization',
  },
];

// Combined SEO fields including section break
export const ALL_SEO_CUSTOM_FIELDS: CustomFieldDef[] = [
  SEO_SECTION_FIELD,
  ...SEO_CUSTOM_FIELDS,
];

// Extended custom fields for full BC product data
export const EXTENDED_CUSTOM_FIELDS: CustomFieldDef[] = [
  {
    dt: 'Item',
    fieldname: 'bc_condition',
    fieldtype: 'Select',
    label: 'Product Condition',
    options: 'New\nUsed\nRefurbished',
    insert_after: 'bc_url_slug',
  },
  {
    dt: 'Item',
    fieldname: 'bc_is_featured',
    fieldtype: 'Check',
    label: 'Featured Product',
    insert_after: 'bc_condition',
  },
  {
    dt: 'Item',
    fieldname: 'bc_sort_order',
    fieldtype: 'Int',
    label: 'Sort Order',
    insert_after: 'bc_is_featured',
  },
];

export class CustomFieldManager {
  private client: ERPNextClient;

  constructor(client: ERPNextClient) {
    this.client = client;
  }

  /**
   * Check which custom fields exist and which are missing
   */
  async checkCustomFieldsExist(
    fields: CustomFieldDef[] = REQUIRED_CUSTOM_FIELDS
  ): Promise<CustomFieldCheck[]> {
    const results: CustomFieldCheck[] = [];

    for (const field of fields) {
      try {
        // Custom Field names in ERPNext follow pattern: {DocType}-{fieldname}
        const customFieldName = `${field.dt}-${field.fieldname}`;

        const existingField = await this.client.getResource<{
          name: string;
          fieldtype: string;
          label: string;
        }>('Custom Field', customFieldName);

        results.push({
          fieldname: field.fieldname,
          exists: true,
          current: {
            name: existingField.name,
            fieldtype: existingField.fieldtype,
            label: existingField.label,
          },
        });
      } catch {
        // Field doesn't exist
        results.push({
          fieldname: field.fieldname,
          exists: false,
        });
      }
    }

    return results;
  }

  /**
   * Get list of missing custom fields
   */
  async getMissingFields(
    fields: CustomFieldDef[] = REQUIRED_CUSTOM_FIELDS
  ): Promise<CustomFieldDef[]> {
    const checks = await this.checkCustomFieldsExist(fields);
    const missingFieldnames = new Set(
      checks.filter((c) => !c.exists).map((c) => c.fieldname)
    );

    return fields.filter((f) => missingFieldnames.has(f.fieldname));
  }

  /**
   * Create a single custom field in ERPNext
   */
  async createCustomField(field: CustomFieldDef): Promise<CreateFieldResult> {
    try {
      const result = await this.client.createResource<{ name: string }>(
        'Custom Field',
        {
          doctype: 'Custom Field',
          ...field,
        }
      );

      return {
        fieldname: field.fieldname,
        success: true,
        name: result.name,
      };
    } catch (error) {
      return {
        fieldname: field.fieldname,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create all missing custom fields
   */
  async createMissingCustomFields(
    fields: CustomFieldDef[] = REQUIRED_CUSTOM_FIELDS
  ): Promise<CreateFieldResult[]> {
    const missing = await this.getMissingFields(fields);
    const results: CreateFieldResult[] = [];

    for (const field of missing) {
      const result = await this.createCustomField(field);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate JSON for manual import via Data Import or fixtures
   * This is useful when API creation fails due to permissions
   */
  static generateCustomFieldDocJson(
    fields: CustomFieldDef[] = REQUIRED_CUSTOM_FIELDS
  ): string {
    const docs = fields.map((field, index) => ({
      doctype: 'Custom Field',
      name: `${field.dt}-${field.fieldname}`,
      creation: new Date().toISOString().replace('T', ' ').slice(0, 19),
      modified: new Date().toISOString().replace('T', ' ').slice(0, 19),
      modified_by: 'Administrator',
      owner: 'Administrator',
      docstatus: 0,
      idx: index + 1,
      ...field,
    }));

    return JSON.stringify(docs, null, 2);
  }

  /**
   * Generate fixtures format for ERPNext app installation
   */
  static generateFixturesJson(
    fields: CustomFieldDef[] = REQUIRED_CUSTOM_FIELDS
  ): string {
    return JSON.stringify(
      {
        'Custom Field': fields.map((field) => ({
          ...field,
          doctype: 'Custom Field',
        })),
      },
      null,
      2
    );
  }

  /**
   * Validate that all required fields exist, throw if any missing
   */
  async validateRequiredFields(): Promise<void> {
    const missing = await this.getMissingFields(REQUIRED_CUSTOM_FIELDS);

    if (missing.length > 0) {
      const fieldList = missing.map((f) => f.fieldname).join(', ');
      throw new Error(
        `Missing required custom fields in ERPNext: ${fieldList}. ` +
          `Run createMissingCustomFields() or import the fixture JSON.`
      );
    }
  }
}

// Mapping of BC product fields to ERPNext custom fields
export const BC_TO_CUSTOM_FIELD_MAP = {
  // SEO/Metadata fields
  id: 'bc_product_id',
  page_title: 'bc_meta_title',
  meta_description: 'bc_meta_description',
  availability: 'bc_availability_text',
  'custom_url.url': 'bc_url_slug',
  condition: 'bc_condition',
  is_featured: 'bc_is_featured',
  sort_order: 'bc_sort_order',
  // Shipping dimension fields
  weight: 'shipping_weight',
  width: 'shipping_width',
  height: 'shipping_height',
  depth: 'shipping_length', // BC depth → ERPNext shipping_length
} as const;

// Helper to build custom_fields object from BC product
export function mapBCProductToCustomFields(
  bcProduct: Record<string, unknown>
): Record<string, unknown> {
  const customFields: Record<string, unknown> = {};

  // Direct mappings
  if (bcProduct.id !== undefined) {
    customFields.bc_product_id = bcProduct.id;
  }

  if (bcProduct.page_title) {
    customFields.bc_meta_title = bcProduct.page_title;
  }

  if (bcProduct.meta_description) {
    customFields.bc_meta_description = bcProduct.meta_description;
  }

  // Combine meta_keywords (array) and search_keywords (string) into website_keywords
  {
    const parts: string[] = [];
    if (bcProduct.meta_keywords && Array.isArray(bcProduct.meta_keywords)) {
      parts.push(...(bcProduct.meta_keywords as string[]).map(k => k.trim().toLowerCase()).filter(Boolean));
    }
    if (bcProduct.search_keywords && typeof bcProduct.search_keywords === 'string') {
      parts.push(...bcProduct.search_keywords.split(/[,;\n]+/).map(k => k.trim().toLowerCase()).filter(Boolean));
    }
    if (parts.length > 0) {
      customFields.website_keywords = [...new Set(parts)].join(', ');
    }
  }

  if (bcProduct.availability) {
    customFields.bc_availability_text = bcProduct.availability;
  }

  // Nested custom_url.url
  if (bcProduct.custom_url && typeof bcProduct.custom_url === 'object') {
    const customUrl = bcProduct.custom_url as { url?: string };
    if (customUrl.url) {
      // Remove leading slash if present
      customFields.bc_url_slug = customUrl.url.replace(/^\//, '');
    }
  }

  if (bcProduct.condition) {
    customFields.bc_condition = bcProduct.condition;
  }

  if (bcProduct.is_featured !== undefined) {
    customFields.bc_is_featured = bcProduct.is_featured ? 1 : 0;
  }

  if (bcProduct.sort_order !== undefined) {
    customFields.bc_sort_order = bcProduct.sort_order;
  }

  // ============================================================================
  // Shipping Dimensions from BigCommerce
  // BC fields: weight, width, height, depth → ERPNext shipping fields
  // ============================================================================

  // Weight → shipping_weight (BC stores weight as number, typically in lbs)
  if (bcProduct.weight !== undefined && bcProduct.weight !== null) {
    const weight = Number(bcProduct.weight);
    if (weight > 0) {
      customFields.shipping_weight = weight;
      // Default to lb for US market - BC typically uses lbs
      customFields.shipping_weight_uom = 'lb';
    }
  }

  // Width → shipping_width (BC stores dimensions in inches typically)
  if (bcProduct.width !== undefined && bcProduct.width !== null) {
    const width = Number(bcProduct.width);
    if (width > 0) {
      customFields.shipping_width = width;
    }
  }

  // Height → shipping_height
  if (bcProduct.height !== undefined && bcProduct.height !== null) {
    const height = Number(bcProduct.height);
    if (height > 0) {
      customFields.shipping_height = height;
    }
  }

  // Depth → shipping_length (depth in BC = length for shipping purposes)
  if (bcProduct.depth !== undefined && bcProduct.depth !== null) {
    const depth = Number(bcProduct.depth);
    if (depth > 0) {
      customFields.shipping_length = depth;
    }
  }

  // Set default dimension UOM if any dimensions were set
  if (customFields.shipping_width || customFields.shipping_height || customFields.shipping_length) {
    customFields.shipping_dimension_uom = 'in'; // Default to inches for US market
  }

  return customFields;
}

// ============================================================================
// Payload Preparation for ERPNext API
// ============================================================================

/**
 * Prepare an item payload for ERPNext API submission.
 * ERPNext expects custom fields as top-level properties on the document,
 * not nested under a 'custom_fields' key.
 *
 * @param item - The mapped item with optional custom_fields property
 * @returns Item payload with custom fields flattened to top level
 */
export function prepareItemPayloadWithCustomFields<
  T extends { custom_fields?: Record<string, unknown> }
>(item: T): Omit<T, 'custom_fields'> & Record<string, unknown> {
  const { custom_fields, ...rest } = item;

  // Spread custom fields as top-level properties
  if (custom_fields && Object.keys(custom_fields).length > 0) {
    return { ...rest, ...custom_fields };
  }

  return rest;
}

/**
 * Extract custom field values from an ERPNext item response.
 * Useful for reading back custom field data from fetched items.
 *
 * @param item - The ERPNext item document
 * @param fields - Which custom field definitions to extract (defaults to REQUIRED_CUSTOM_FIELDS)
 * @returns Object with just the custom field values
 */
export function extractCustomFieldValues(
  item: Record<string, unknown>,
  fields: CustomFieldDef[] = REQUIRED_CUSTOM_FIELDS
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const field of fields) {
    if (item[field.fieldname] !== undefined) {
      result[field.fieldname] = item[field.fieldname];
    }
  }

  return result;
}

/**
 * Check if an item has all required custom field values populated
 *
 * @param item - The ERPNext item document
 * @returns Object with validation status and missing fields
 */
export function validateCustomFieldValues(
  item: Record<string, unknown>
): { valid: boolean; missing: string[]; populated: string[] } {
  const missing: string[] = [];
  const populated: string[] = [];

  for (const field of REQUIRED_CUSTOM_FIELDS) {
    const value = item[field.fieldname];
    if (value === undefined || value === null || value === '') {
      missing.push(field.fieldname);
    } else {
      populated.push(field.fieldname);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    populated,
  };
}

/**
 * Get the list of all custom field names for Item doctype
 */
export function getCustomFieldNames(
  includeExtended = false
): string[] {
  const fields = includeExtended
    ? [...REQUIRED_CUSTOM_FIELDS, ...EXTENDED_CUSTOM_FIELDS]
    : REQUIRED_CUSTOM_FIELDS;

  return fields.map((f) => f.fieldname);
}
