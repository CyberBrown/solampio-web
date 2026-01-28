/**
 * SEO Custom Field Definitions for ERPNext Item doctype
 * These fields store AI-optimized SEO data from D1
 */

export interface CustomFieldDef {
  dt: string;
  fieldname: string;
  fieldtype: 'Data' | 'Small Text' | 'Long Text' | 'Datetime' | 'Text';
  label: string;
  insert_after?: string;
  description?: string;
  read_only?: 0 | 1;
}

// SEO Fields to sync from D1 to ERPNext
export const SEO_CUSTOM_FIELDS: CustomFieldDef[] = [
  // Section break for SEO fields
  {
    dt: 'Item',
    fieldname: 'seo_section',
    fieldtype: 'Data', // Will use Section Break in ERPNext
    label: 'SEO Optimization',
    insert_after: 'description',
  },
  // Core SEO fields
  {
    dt: 'Item',
    fieldname: 'seo_title',
    fieldtype: 'Data',
    label: 'SEO Title',
    insert_after: 'seo_section',
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
  // Open Graph fields
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
  // Keywords and robots
  {
    dt: 'Item',
    fieldname: 'seo_keywords',
    fieldtype: 'Small Text',
    label: 'SEO Keywords',
    insert_after: 'seo_og_description',
    description: 'JSON array of keywords',
  },
  {
    dt: 'Item',
    fieldname: 'seo_robots',
    fieldtype: 'Data',
    label: 'Robots Directive',
    insert_after: 'seo_keywords',
    description: 'robots meta tag value (e.g., "index, follow")',
  },
  // GMC fields
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
  // FAQ content
  {
    dt: 'Item',
    fieldname: 'faq_json',
    fieldtype: 'Long Text',
    label: 'FAQ JSON',
    insert_after: 'gmc_margin_tier',
    description: 'JSON array of FAQ objects for structured data',
  },
  // Timestamp
  {
    dt: 'Item',
    fieldname: 'seo_last_optimized',
    fieldtype: 'Datetime',
    label: 'SEO Last Optimized',
    insert_after: 'faq_json',
    description: 'Timestamp of last AI SEO optimization',
    read_only: 1,
  },
];

// Field mapping: D1 column name -> ERPNext fieldname
export const D1_TO_ERPNEXT_FIELD_MAP: Record<string, string> = {
  seo_title: 'seo_title',
  seo_meta_description: 'seo_meta_description',
  seo_description_summary: 'seo_description_summary',
  seo_og_title: 'seo_og_title',
  seo_og_description: 'seo_og_description',
  seo_keywords: 'seo_keywords',
  seo_robots: 'seo_robots',
  seo_last_optimized: 'seo_last_optimized',
  gmc_google_category: 'gmc_google_category',
  gmc_product_type: 'gmc_product_type',
  gmc_shipping_label: 'gmc_shipping_label',
  // Custom labels map to tiers
  gmc_custom_label_2: 'gmc_brand_tier',
  gmc_custom_label_0: 'gmc_margin_tier',
  seo_faqs: 'faq_json',
};

// Get field names for D1 query
export function getD1SEOFields(): string[] {
  return Object.keys(D1_TO_ERPNEXT_FIELD_MAP);
}

// Get ERPNext field names
export function getERPNextSEOFields(): string[] {
  return SEO_CUSTOM_FIELDS.filter(f => f.fieldtype !== 'Data' || f.fieldname !== 'seo_section')
    .map(f => f.fieldname);
}
